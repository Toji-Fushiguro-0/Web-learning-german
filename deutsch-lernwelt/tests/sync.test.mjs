// tests/sync.test.mjs — kiểm thử backend thật với SQLite (node:sqlite) + Worker
// Chạy: node tests/sync.test.mjs
//
// Không dùng stub SQL: schema.sql được nạp vào một database SQLite trong bộ nhớ,
// nên test xác nhận được cả câu lệnh SQL, khoá chính và dữ liệu sau khi ghi.

import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import { createContext, runInContext } from "node:vm";
import { fileURLToPath, pathToFileURL } from "node:url";
import assert from "node:assert/strict";
import path from "node:path";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => readFileSync(path.join(ROOT, rel), "utf8");

const worker = await import(pathToFileURL(path.join(ROOT, "worker/src/index.mjs")).href);
const repository = await import(pathToFileURL(path.join(ROOT, "worker/src/repository.mjs")).href);

let failures = 0;
function check(name, condition, detail) {
  if (condition) console.log("PASS  " + name);
  else {
    failures++;
    console.log("FAIL  " + name + (detail ? " → " + detail : ""));
  }
}

/* --------------------------------------------------- SQLite thật + adapter D1 */

function makeDatabase() {
  const db = new DatabaseSync(":memory:");
  db.exec(read("worker/schema.sql"));
  return db;
}

function makeD1(db) {
  return {
    prepare(sql) {
      let params = [];
      const statement = {
        bind(...values) {
          params = values;
          return statement;
        },
        async first() {
          return db.prepare(sql).get(...params) ?? null;
        },
        async all() {
          return { results: db.prepare(sql).all(...params) };
        },
        async run() {
          db.prepare(sql).run(...params);
          return { success: true, meta: {} };
        },
      };
      return statement;
    },
  };
}

const TOKEN = "test-token-123456";

function makeEnv(db, overrides = {}) {
  return { DB: makeD1(db), SYNC_TOKEN: TOKEN, ALLOWED_ORIGIN: "*", ...overrides };
}

async function call(env, method, pathname, options = {}) {
  const { body, token = TOKEN, origin } = options;
  const headers = {};

  if (token) headers.Authorization = "Bearer " + token;
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (origin) headers.Origin = origin;

  const request = new Request("https://sync.example.com" + pathname, {
    method,
    headers,
    body: body === undefined ? undefined : (typeof body === "string" ? body : JSON.stringify(body)),
  });

  return worker.default.fetch(request, env);
}

function countRows(db, table) {
  return db.prepare(`SELECT COUNT(*) AS n FROM ${table}`).get().n;
}

/* ------------------------------------------------------------- dữ liệu mẫu */

const SAVED_AT = "2026-10-22T10:00:00.000Z";

const sampleState = {
  _version: 3,
  _updatedAt: SAVED_AT,
  userName: "Học viên",
  targetLevel: "A1",
  totalPoints: 140,
  coins: 22,
  streak: 4,
  lastActiveDate: "2026-10-22",
  dailyGoal: {
    targetQuestions: 5,
    goalDate: "2026-10-22",
    todayCorrect: 5,
    todayAttempted: 6,
    rewardedDate: "2026-10-22",
  },
  lessonProgress: {
    "a1-sein-haben": {
      score: 4,
      total: 5,
      attempts: 2,
      bestScore: 4,
      lastAttempt: "2026-10-21",
    },
  },
  vocabularyProgress: {
    "v-a1-001": {
      status: "known",
      correctCount: 3,
      wrongCount: 1,
      lastReviewed: "2026-10-22",
    },
  },
  mistakes: [
    {
      id: "mistake-1",
      questionId: "g-a1-001",
      topic: "sein-haben",
      lessonId: "a1-sein-haben",
      questionText: "Ich ______ Student.",
      userAnswer: "bist",
      correctAnswer: "bin",
      explanation: "ich đi với bin",
      savedAt: "2026-10-21",
      understood: false,
    },
  ],
  sessionHistory: [
    {
      date: "2026-10-22",
      skill: "grammar",
      lessonId: "a1-sein-haben",
      source: "grammar",
      correct: 4,
      attempted: 5,
      pointsEarned: 40,
      coinsEarned: 5,
    },
  ],
  coinHistory: [
    { date: "2026-10-22", source: "grammar", amount: 5, note: "4/5 câu đúng" },
  ],
};

/* --------------------------------------------------------------- HTTP: auth */

{
  const env = makeEnv(makeDatabase());

  const health = await call(env, "GET", "/api/health", { token: null });
  check("health không cần token → 200", health.status === 200);

  const noToken = await call(env, "GET", "/api/state", { token: null });
  check("thiếu token → 401", noToken.status === 401);

  const badToken = await call(env, "GET", "/api/state", { token: "sai-token" });
  check("token sai → 401", badToken.status === 401);

  const empty = await call(env, "GET", "/api/state");
  check("chưa có dữ liệu → 404", empty.status === 404);
}

/* ------------------------------------------------------- HTTP: PUT/GET state */

{
  const db = makeDatabase();
  const env = makeEnv(db);

  const put = await call(env, "PUT", "/api/state", {
    body: { state: sampleState, savedAt: SAVED_AT, clientId: "c-test" },
  });
  const putBody = await put.json();
  check("PUT state hợp lệ → 200", put.status === 200, put.status);
  check("PUT trả về số dòng theo bảng",
    putBody.counts && putBody.counts.lessons === 1 && putBody.counts.vocabulary === 1 &&
    putBody.counts.mistakes === 1 && putBody.counts.sessions === 1 &&
    putBody.counts.coinTransactions === 1,
    JSON.stringify(putBody.counts));

  // Dữ liệu đã được tách vào đúng bảng
  check("bảng users có 1 dòng", countRows(db, "users") === 1);
  check("bảng user_stats có 1 dòng", countRows(db, "user_stats") === 1);
  check("bảng daily_goals có 1 dòng", countRows(db, "daily_goals") === 1);
  check("bảng lesson_progress có 1 dòng", countRows(db, "lesson_progress") === 1);
  check("bảng vocabulary_progress có 1 dòng", countRows(db, "vocabulary_progress") === 1);
  check("bảng mistakes có 1 dòng", countRows(db, "mistakes") === 1);
  check("bảng sessions có 1 dòng", countRows(db, "sessions") === 1);
  check("bảng coin_transactions có 1 dòng", countRows(db, "coin_transactions") === 1);

  const stats = db.prepare("SELECT * FROM user_stats WHERE user_id = 'default'").get();
  check("cột total_points đúng", stats.total_points === 140, stats.total_points);
  check("cột coins đúng", stats.coins === 22, stats.coins);

  const mistake = db.prepare("SELECT * FROM mistakes WHERE id = 'mistake-1'").get();
  check("mistakes.understood lưu dạng 0/1", mistake.understood === 0, mistake.understood);

  const get = await call(env, "GET", "/api/state");
  const getBody = await get.json();
  check("GET /api/state → 200", get.status === 200);
  check("GET trả lại savedAt", getBody.savedAt === SAVED_AT, getBody.savedAt);

  try {
    assert.deepStrictEqual(getBody.state, sampleState);
    check("state sau round-trip giống hệt ban đầu", true);
  } catch (err) {
    check("state sau round-trip giống hệt ban đầu", false, err.message.split("\n").slice(0, 6).join(" | "));
  }
}

/* ---------------------------------------------------- ghi lặp lại không nhân bản */

{
  const db = makeDatabase();
  const env = makeEnv(db);

  await call(env, "PUT", "/api/state", { body: { state: sampleState, savedAt: SAVED_AT } });
  await call(env, "PUT", "/api/state", { body: { state: sampleState, savedAt: "2026-10-22T11:00:00.000Z" } });

  check("PUT lần 2 không nhân bản lesson_progress", countRows(db, "lesson_progress") === 1);
  check("PUT lần 2 không nhân bản sessions", countRows(db, "sessions") === 1);
  check("PUT lần 2 cập nhật updated_at",
    db.prepare("SELECT updated_at FROM users WHERE id = 'default'").get().updated_at === "2026-10-22T11:00:00.000Z");
}

/* --------------------------------------------------- phản chiếu đúng state mới */

{
  const db = makeDatabase();
  const env = makeEnv(db);

  await call(env, "PUT", "/api/state", { body: { state: sampleState, savedAt: SAVED_AT } });

  const withoutMistakes = {
    ...sampleState,
    mistakes: [],
    coinHistory: [],
    sessionHistory: [],
    totalPoints: 150,
    dailyGoal: { ...sampleState.dailyGoal, todayCorrect: 0 },
  };

  await call(env, "PUT", "/api/state", { body: { state: withoutMistakes, savedAt: "2026-10-22T12:00:00.000Z" } });

  check("lỗi sai bị xoá khỏi bảng khi client bỏ", countRows(db, "mistakes") === 0);
  check("lịch sử xu bị xoá khỏi bảng khi client bỏ", countRows(db, "coin_transactions") === 0);
  check("sessions bị xoá khỏi bảng khi client bỏ", countRows(db, "sessions") === 0);
  check("user_stats cập nhật điểm mới",
    db.prepare("SELECT total_points FROM user_stats WHERE user_id = 'default'").get().total_points === 150);
}

/* ----------------------------------------------------------------- validation */

{
  const db = makeDatabase();
  const env = makeEnv(db);

  const badType = await call(env, "PUT", "/api/state", {
    body: { state: { ...sampleState, totalPoints: "nhiều" } },
  });
  const badBody = await badType.json();
  check("totalPoints sai kiểu → 400", badType.status === 400, badType.status);
  check("400 có chi tiết lỗi", Array.isArray(badBody.details) && badBody.details.length > 0);

  const badMistake = await call(env, "PUT", "/api/state", {
    body: { state: { ...sampleState, mistakes: [{ questionId: "x" }] } },
  });
  check("mistake thiếu id → 400", badMistake.status === 400, badMistake.status);

  const badJson = await call(env, "PUT", "/api/state", { body: "{ hỏng" });
  check("JSON hỏng → 400", badJson.status === 400);

  const big = { ...sampleState, note: "x".repeat(600 * 1024) };
  const tooLarge = await call(env, "PUT", "/api/state", { body: { state: big } });
  check("payload > 512KB → 413", tooLarge.status === 413, tooLarge.status);
}

/* ---------------------------------------------------------------------- CORS */

{
  const env = makeEnv(makeDatabase());

  const preflight = await call(env, "OPTIONS", "/api/state", {
    token: null,
    origin: "https://deutsch-lernwelt.pages.dev",
  });
  check("OPTIONS → 204", preflight.status === 204);
  check("OPTIONS có CORS", preflight.headers.get("access-control-allow-methods") === "GET, PUT, POST, OPTIONS");

  const restricted = makeEnv(makeDatabase(), { ALLOWED_ORIGIN: "https://a.example,https://b.example" });
  const allowed = await call(restricted, "OPTIONS", "/api/state", { origin: "https://b.example", token: null });
  check("CORS: origin trong danh sách được giữ",
    allowed.headers.get("access-control-allow-origin") === "https://b.example");

  const denied = await call(restricted, "OPTIONS", "/api/state", { origin: "https://evil.example", token: null });
  check("CORS: origin lạ không được phản chiếu",
    denied.headers.get("access-control-allow-origin") === "https://a.example");
}

/* ------------------------------------------------------------- /api/summary */

{
  const db = makeDatabase();
  const env = makeEnv(db);
  await call(env, "PUT", "/api/state", { body: { state: sampleState, savedAt: SAVED_AT } });

  const summary = await call(env, "GET", "/api/summary");
  const body = await summary.json();

  check("summary → 200", summary.status === 200);
  check("summary đọc đúng tổng điểm", body.totals.totalPoints === 140, body.totals.totalPoints);
  check("summary đếm đúng bài đã làm", body.counts.lessonsCompleted === 1);
  check("summary đếm đúng từ đã thuộc", body.counts.wordsKnown === 1);
  check("summary đếm đúng lỗi chưa ôn", body.counts.mistakesOpen === 1);
}

/* ------------------------------------------------------- nhiều người dùng */

{
  const db = makeDatabase();
  const envDefault = makeEnv(db);
  const envSecond = makeEnv(db, { USER_ID: "u2" });

  await call(envDefault, "PUT", "/api/state", { body: { state: sampleState, savedAt: SAVED_AT } });

  const secondState = {
    ...sampleState,
    _updatedAt: "2026-10-22T09:00:00.000Z",
    totalPoints: 10,
    coins: 1,
    lessonProgress: {},
    vocabularyProgress: {},
    mistakes: [],
    sessionHistory: [],
    coinHistory: [],
  };
  await call(envSecond, "PUT", "/api/state", {
    body: { state: secondState, savedAt: "2026-10-22T09:00:00.000Z" },
  });

  const first = await (await call(envDefault, "GET", "/api/state")).json();
  const second = await (await call(envSecond, "GET", "/api/state")).json();

  check("user mặc định giữ nguyên dữ liệu", first.state.totalPoints === 140);
  check("user thứ hai có dữ liệu riêng", second.state.totalPoints === 10, second.state.totalPoints);
  check("bảng có 2 người dùng", countRows(db, "users") === 2);
}

/* ------------------------------------------------- repository: hàm thuần */

{
  const parts = repository.splitState(sampleState);
  const joined = repository.joinState({
    user: { state_version: parts.user.stateVersion, updated_at: SAVED_AT, display_name: parts.user.displayName, target_level: parts.user.targetLevel },
    stats: {
      total_points: parts.stats.totalPoints,
      coins: parts.stats.coins,
      streak: parts.stats.streak,
      last_active_date: parts.stats.lastActiveDate,
    },
    goal: {
      target_questions: parts.goal.targetQuestions,
      goal_date: parts.goal.goalDate,
      today_correct: parts.goal.todayCorrect,
      today_attempted: parts.goal.todayAttempted,
      rewarded_date: parts.goal.rewardedDate,
    },
    lessons: [{ lesson_id: "a1-sein-haben", score: 4, total: 5, attempts: 2, best_score: 4, last_attempt: "2026-10-21" }],
    vocabulary: [{ word_id: "v-a1-001", status: "known", correct_count: 3, wrong_count: 1, last_reviewed: "2026-10-22" }],
    mistakes: [],
    sessions: [],
    coins: [],
  });

  check("splitState tách đúng 1 bài", parts.lessons.length === 1);
  check("splitState tách đúng 1 từ", parts.vocabulary.length === 1);
  check("joinState dựng lại lessonProgress", joined.lessonProgress["a1-sein-haben"].attempts === 2);

  check("validateState chấp nhận state mẫu", repository.validateState(sampleState).length === 0);
  check("validateState bắt state không phải object", repository.validateState("x").length === 1);
  check("validateState bắt mảng sai kiểu",
    repository.validateState({ ...sampleState, mistakes: {} }).some((e) => e.includes("mistakes")));
}

/* ------------------------------------------------------- SyncCore (client) */

{
  const sandbox = { console: { log() {}, warn() {}, error() {} } };
  sandbox.window = sandbox;
  createContext(sandbox);
  runInContext(read("js/sync-core.js") + "\nglobalThis.__S = SyncCore;", sandbox);
  const S = sandbox.__S;

  const empty = { totalPoints: 0, coins: 0, lessonProgress: {}, vocabularyProgress: {}, mistakes: [] };
  const used = {
    totalPoints: 50, coins: 5, _updatedAt: "2026-10-22T10:00:00.000Z",
    lessonProgress: { a: { attempts: 1 } }, vocabularyProgress: {}, mistakes: [],
  };

  check("decide: cloud trống → push", S.decide(empty, null) === "push");
  check("decide: máy mới + có cloud → pull", S.decide(empty, { savedAt: SAVED_AT }) === "pull");
  check("decide: cloud mới hơn + cho hỏi → ask",
    S.decide(used, { savedAt: "2026-10-22T12:00:00.000Z" }, { allowAsk: true }) === "ask");
  check("decide: local mới hơn → push", S.decide(used, { savedAt: "2026-10-22T08:00:00.000Z" }) === "push");
  check("decide: bằng nhau → noop", S.decide(used, { savedAt: "2026-10-22T10:00:01.000Z" }) === "noop");
}

console.log(failures === 0 ? "\nALL PASS" : `\n${failures} FAILED`);
process.exit(failures === 0 ? 0 : 1);
