// js/sync-core.js
// Logic thuần cho đồng bộ đám mây — KHÔNG phụ thuộc DOM, test được bằng Node.
// Được js/cloud-sync.js dùng để quyết định: đẩy lên, tải về, hỏi, hay không làm gì.

const SyncCore = (function () {
  "use strict";

  const CONFIG_KEY = "deutsch_lernwelt_cloud_v1";
  const TOLERANCE_MS = 2000;      // lệch đồng hồ cho phép giữa 2 máy
  const MIN_TOKEN_LENGTH = 8;
  const MAX_PAYLOAD_BYTES = 512 * 1024;

  /**
   * Kiểm tra và chuẩn hoá cấu hình người dùng nhập.
   * @returns {{apiUrl: string, token: string} | null}
   */
  function normalizeConfig(raw) {
    if (!raw || typeof raw !== "object") return null;

    const apiUrl = String(raw.apiUrl || "").trim().replace(/\/+$/, "");
    const token = String(raw.token || "").trim();

    const isHttps = /^https:\/\/[^\s/]+/i.test(apiUrl);
    const isLocal = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/i.test(apiUrl);

    if (!isHttps && !isLocal) return null;
    if (token.length < MIN_TOKEN_LENGTH) return null;

    return { apiUrl, token };
  }

  /** Có dữ liệu học tập thật hay chưa (dùng để tránh ghi đè máy mới bằng bản rỗng) */
  function hasMeaningfulData(state) {
    if (!state) return false;

    const attempts = Object.values(state.lessonProgress || {})
      .reduce((sum, p) => sum + (Number(p && p.attempts) || 0), 0);
    const vocab = Object.keys(state.vocabularyProgress || {}).length;
    const mistakes = (state.mistakes || []).length;

    return (
      (Number(state.totalPoints) || 0) > 0 ||
      (Number(state.coins) || 0) > 0 ||
      attempts > 0 ||
      vocab > 0 ||
      mistakes > 0
    );
  }

  /** Đổi chuỗi thời gian sang mili-giây; sai định dạng → 0 */
  function toMs(value) {
    const t = Date.parse(value || 0);
    return Number.isNaN(t) ? 0 : t;
  }

  /**
   * Quyết định hành động đồng bộ.
   * @param {object} localState - dữ liệu hiện tại trên máy
   * @param {{savedAt: string, state: object}|null} remote - bản trên cloud (null nếu trống)
   * @param {{allowAsk?: boolean}} [options]
   * @returns {"push"|"pull"|"ask"|"noop"}
   */
  function decide(localState, remote, options) {
    const opts = options || {};

    if (!remote) return "push";                          // cloud trống → đẩy bản local lên
    if (!hasMeaningfulData(localState)) return "pull";   // máy mới → lấy bản cloud

    const localMs = toMs(localState && localState._updatedAt);
    const remoteMs = toMs(remote.savedAt);

    if (remoteMs > localMs + TOLERANCE_MS) return opts.allowAsk ? "ask" : "pull";
    if (localMs > remoteMs + TOLERANCE_MS) return "push";
    return "noop";
  }

  /** Tạo body gửi lên Worker */
  function buildPayload(state, clientId) {
    return {
      version: 1,
      savedAt: new Date().toISOString(),
      clientId: String(clientId || ""),
      state: state
    };
  }

  /** Nhãn hiển thị cho từng trạng thái đồng bộ */
  function statusLabel(status, detail) {
    switch (status) {
      case "idle":    return { icon: "☁️", text: "Sẵn sàng đồng bộ", title: "Đồng bộ đám mây: sẵn sàng" };
      case "syncing": return { icon: "🔄", text: "Đang đồng bộ…", title: "Đang đồng bộ lên cloud" };
      case "synced":  return { icon: "✅", text: "Đã đồng bộ", title: "Dữ liệu đã được sao lưu lên cloud" };
      case "pending": return { icon: "⏳", text: "Chờ đẩy lên…", title: "Có thay đổi chưa đẩy lên cloud" };
      case "offline": return { icon: "📴", text: "Không có mạng", title: "Mất mạng — sẽ thử lại khi có kết nối" };
      case "error":   return { icon: "⚠️", text: detail || "Lỗi đồng bộ", title: "Lỗi đồng bộ: " + (detail || "không rõ") };
      default:        return { icon: "☁️", text: "Chưa kết nối", title: "Bật đồng bộ đám mây" };
    }
  }

  return {
    CONFIG_KEY,
    TOLERANCE_MS,
    MIN_TOKEN_LENGTH,
    MAX_PAYLOAD_BYTES,
    normalizeConfig,
    hasMeaningfulData,
    decide,
    buildPayload,
    statusLabel,
    toMs
  };
})();

// `const` ở cấp cao nhất KHÔNG tự gắn vào window — phải gán tường minh
// để cloud-sync.js và bộ test truy cập được qua window.
if (typeof window !== "undefined") {
  window.SyncCore = SyncCore;
}
