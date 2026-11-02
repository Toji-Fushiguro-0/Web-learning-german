// worker/src/index.mjs
// API đồng bộ trạng thái học tập — Cloudflare Worker + D1 (schema chuẩn hoá).
//
// Endpoint:
//   GET /api/health   → kiểm tra sống (không cần token)
//   GET /api/state    → ghép dữ liệu từ các bảng thành state cho client
//   PUT /api/state    → tách state và ghi vào các bảng
//   GET /api/summary  → số liệu tổng hợp (đọc trực tiếp từ bảng)
//
// Bảo vệ: header `Authorization: Bearer <SYNC_TOKEN>`.
// Hợp đồng với client KHÔNG đổi: vẫn gửi/nhận nguyên object state.

import {
  validateState,
  splitState,
  buildWriteStatements,
  applyWriteStatements,
  loadState,
  resolveUserId
} from "./repository.mjs";

const MAX_BODY_BYTES = 512 * 1024;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const headers = corsHeaders(request, env);

    // Trình duyệt hỏi trước khi gửi PUT cross-origin
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers });
    }

    // Sức khoẻ dịch vụ — không lộ dữ liệu, cho phép kiểm tra trước khi cấu hình
    if (url.pathname === "/api/health" || url.pathname === "/api/health/") {
      return json({ ok: true, service: "deutsch-lernwelt-sync", time: new Date().toISOString() }, 200, headers);
    }

    if (!isAuthorized(request, env)) {
      return json({ error: "unauthorized" }, 401, headers);
    }

    try {
      if (url.pathname === "/api/state" || url.pathname === "/api/state/") {
        if (request.method === "GET") return await handleGet(env, headers);
        if (request.method === "PUT" || request.method === "POST") return await handlePut(request, env, headers);
        return json({ error: "method_not_allowed" }, 405, headers);
      }

      if (url.pathname === "/api/summary" || url.pathname === "/api/summary/") {
        if (request.method === "GET") return await handleSummary(env, headers);
        return json({ error: "method_not_allowed" }, 405, headers);
      }

      return json({ error: "not_found" }, 404, headers);
    } catch (err) {
      console.error("[sync] unhandled", err);
      return json({ error: "internal_error", message: String((err && err.message) || err) }, 500, headers);
    }
  },
};

/** Header CORS — ALLOWED_ORIGIN có thể là "*" hoặc danh sách phân tách bằng dấu phẩy */
export function corsHeaders(request, env) {
  const allowed = (env && env.ALLOWED_ORIGIN) || "*";
  const origin = request.headers.get("Origin") || "";

  let allowOrigin = "*";
  if (allowed !== "*") {
    const list = allowed.split(",").map(s => s.trim()).filter(Boolean);
    allowOrigin = list.includes(origin) ? origin : (list[0] || "*");
  }

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET, PUT, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

/** So khớp token — từ chối nếu server chưa cấu hình SYNC_TOKEN */
export function isAuthorized(request, env) {
  const expected = (env && env.SYNC_TOKEN) || "";
  const header = request.headers.get("Authorization") || "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  const token = match ? match[1].trim() : "";

  if (!expected || !token) return false;
  return token === expected;
}

/** GET /api/state — đọc các bảng và ghép lại state */
export async function handleGet(env, headers) {
  const userId = resolveUserId(env);
  const state = await loadState(env.DB, userId);

  if (!state) return json({ error: "empty" }, 404, headers);

  return json({ savedAt: state._updatedAt, state }, 200, headers);
}

/** PUT /api/state — kiểm tra, tách và ghi vào các bảng */
export async function handlePut(request, env, headers) {
  const declaredLength = Number(request.headers.get("content-length") || 0);
  if (declaredLength > MAX_BODY_BYTES) {
    return json({ error: "payload_too_large", limit: MAX_BODY_BYTES }, 413, headers);
  }

  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) {
    return json({ error: "payload_too_large", limit: MAX_BODY_BYTES }, 413, headers);
  }

  let body;
  try {
    body = JSON.parse(raw);
  } catch {
    return json({ error: "invalid_json" }, 400, headers);
  }

  if (!body || typeof body !== "object" || !body.state || typeof body.state !== "object") {
    return json({ error: "invalid_state" }, 400, headers);
  }

  const errors = validateState(body.state);
  if (errors.length > 0) {
    return json({ error: "invalid_state", details: errors.slice(0, 20) }, 400, headers);
  }

  const savedAt = typeof body.savedAt === "string" && body.savedAt
    ? body.savedAt
    : new Date().toISOString();
  const clientId = typeof body.clientId === "string" ? body.clientId.slice(0, 64) : null;
  const userId = resolveUserId(env);

  const parts = splitState(body.state);
  const statements = buildWriteStatements(userId, parts, savedAt, clientId);
  await applyWriteStatements(env.DB, statements);

  return json({
    ok: true,
    savedAt,
    counts: {
      lessons: parts.lessons.length,
      vocabulary: parts.vocabulary.length,
      mistakes: parts.mistakes.length,
      sessions: parts.sessions.length,
      coinTransactions: parts.coins.length
    }
  }, 200, headers);
}

/** GET /api/summary — truy vấn tổng hợp trực tiếp trên bảng đã chuẩn hoá */
export async function handleSummary(env, headers) {
  const userId = resolveUserId(env);

  const user = await env.DB.prepare("SELECT id FROM users WHERE id = ?").bind(userId).first();
  if (!user) return json({ error: "empty" }, 404, headers);

  const stats = await env.DB.prepare(
    "SELECT total_points, coins, streak FROM user_stats WHERE user_id = ?"
  ).bind(userId).first();

  const counts = await env.DB.prepare(
    `SELECT
       (SELECT COUNT(*) FROM lesson_progress WHERE user_id = ? AND attempts > 0) AS lessons_completed,
       (SELECT COUNT(*) FROM vocabulary_progress WHERE user_id = ? AND status = 'known') AS words_known,
       (SELECT COUNT(*) FROM vocabulary_progress WHERE user_id = ?) AS words_tracked,
       (SELECT COUNT(*) FROM mistakes WHERE user_id = ? AND understood = 0) AS mistakes_open,
       (SELECT COUNT(*) FROM sessions WHERE user_id = ?) AS sessions
    `
  ).bind(userId, userId, userId, userId, userId).first();

  return json({
    user: { id: userId },
    totals: {
      totalPoints: Number(stats?.total_points) || 0,
      coins: Number(stats?.coins) || 0,
      streak: Number(stats?.streak) || 0
    },
    counts: {
      lessonsCompleted: Number(counts?.lessons_completed) || 0,
      wordsKnown: Number(counts?.words_known) || 0,
      wordsTracked: Number(counts?.words_tracked) || 0,
      mistakesOpen: Number(counts?.mistakes_open) || 0,
      sessions: Number(counts?.sessions) || 0
    }
  }, 200, headers);
}

function json(obj, status, headers) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      ...headers,
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
