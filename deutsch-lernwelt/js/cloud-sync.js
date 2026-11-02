// js/cloud-sync.js
// Đồng bộ dữ liệu học tập với Cloudflare Worker + D1 (xem thư mục worker/).
//
// Nguyên tắc: LOCAL-FIRST.
//   - Mọi thao tác ghi localStorage xong mới đẩy lên cloud (debounce 2,5 giây).
//   - Khi mở app: so sánh bản local và bản cloud, bản nào mới hơn thì thắng.
//   - Mất mạng: giữ trạng thái "offline", tự đẩy lại khi có mạng.
//
// Cấu hình lưu ở localStorage["deutsch_lernwelt_cloud_v1"] = { apiUrl, token }.

(function () {
  "use strict";

  const CORE = window.SyncCore;
  if (!CORE) {
    console.error("[CloudSync] Thiếu js/sync-core.js — không bật được đồng bộ.");
    return;
  }

  const STATUS_EVENT = "cloud-sync-status";
  const FETCH_TIMEOUT_MS = 12000;
  const DEBOUNCE_MS = 2500;

  let config = CORE.normalizeConfig(readConfig());
  let status = config ? "idle" : "off";
  let detail = "";
  let applyingRemote = false;
  let pendingPush = false;
  let inFlight = false;
  let debounceTimer = null;
  let lastSyncAt = null;
  const clientId = ensureClientId();

  const byId = (id) => document.getElementById(id);

  // ---------------------------------------------------------------- cấu hình

  function readConfig() {
    try { return JSON.parse(localStorage.getItem(CORE.CONFIG_KEY) || "null"); }
    catch (err) { return null; }
  }

  function writeConfig(cfg) {
    try {
      if (cfg) localStorage.setItem(CORE.CONFIG_KEY, JSON.stringify(cfg));
      else localStorage.removeItem(CORE.CONFIG_KEY);
    } catch (err) {
      console.warn("[CloudSync] Không lưu được cấu hình:", err.message);
    }
  }

  function ensureClientId() {
    const KEY = "deutsch_lernwelt_client_id";
    let id = null;
    try { id = localStorage.getItem(KEY); } catch (err) { /* chế độ riêng tư */ }
    if (!id) {
      id = "c-" + Math.random().toString(36).slice(2, 10);
      try { localStorage.setItem(KEY, id); } catch (err) { /* bỏ qua */ }
    }
    return id;
  }

  // ---------------------------------------------------------------- trạng thái

  function setStatus(next, message) {
    status = next;
    detail = message || "";
    renderStatus();
    window.dispatchEvent(new CustomEvent(STATUS_EVENT, {
      detail: { status: status, detail: detail, lastSyncAt: lastSyncAt }
    }));
  }

  function formatTime(iso) {
    if (!iso) return "";
    try {
      return new Date(iso).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    } catch (err) {
      return "";
    }
  }

  function renderStatus() {
    const meta = CORE.statusLabel(status, detail);
    const icon = byId("cloud-icon");
    const btn = byId("btn-cloud");
    const text = byId("cloud-status-text");

    if (icon) icon.textContent = meta.icon;
    if (btn) {
      btn.dataset.status = status;
      btn.title = meta.title;
      btn.setAttribute("aria-label", meta.title);
    }
    if (text) {
      const time = status === "synced" && lastSyncAt ? ` · ${formatTime(lastSyncAt)}` : "";
      const statusText = t(`cloud.status.${status}`);
      text.textContent = (config ? (detail || statusText) : t("cloud.status.off")) + time;
      text.dataset.tone = status === "error" ? "error" : (status === "synced" ? "ok" : "");
    }
  }

  // ------------------------------------------------------------------ gọi API

  async function request(method, payload) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    try {
      const res = await fetch(config.apiUrl + "/api/state", {
        method: method,
        headers: Object.assign(
          { Authorization: "Bearer " + config.token },
          payload ? { "Content-Type": "application/json" } : {}
        ),
        body: payload ? JSON.stringify(payload) : undefined,
        signal: controller.signal,
        cache: "no-store"
      });

      let data = null;
      try { data = await res.json(); } catch (err) { data = null; }
      return { res: res, data: data };
    } finally {
      clearTimeout(timer);
    }
  }

  // ---------------------------------------------------------------- push / pull

  async function push() {
    if (!config) return false;
    if (inFlight) { pendingPush = true; return false; }

    inFlight = true;
    setStatus("syncing");

    try {
      const payload = CORE.buildPayload(getStorageData(), clientId);
      const { res, data } = await request("PUT", payload);

      if (res.status === 401) { setStatus("error", t("cloud.err.token")); return false; }
      if (!res.ok) { setStatus("error", t("cloud.err.status", { status: res.status })); return false; }

      lastSyncAt = (data && data.savedAt) || payload.savedAt;
      setStatus("synced");
      return true;
    } catch (err) {
      if (err.name === "AbortError") setStatus("error", t("cloud.err.timeout"));
      else if (!navigator.onLine) setStatus("offline");
      else setStatus("error", t("cloud.err.network"));
      return false;
    } finally {
      inFlight = false;
      if (pendingPush && config) { pendingPush = false; schedulePush(); }
    }
  }

  async function pull(options) {
    if (!config) return false;
    const opts = options || {};
    setStatus("syncing");

    try {
      const { res, data } = await request("GET");

      if (res.status === 404) {
        // Cloud chưa có gì → đẩy bản local lên
        setStatus("idle");
        return opts.noPush ? true : push();
      }
      if (res.status === 401) { setStatus("error", t("cloud.err.token")); return false; }
      if (!res.ok || !data || !data.state) {
        setStatus("error", t("cloud.err.status", { status: res.status }));
        return false;
      }

      const action = CORE.decide(getStorageData(), data, { allowAsk: Boolean(opts.allowAsk) });

      if (action === "pull" ||
          (action === "ask" && window.confirm(t("cloud.confirmPull")))) {
        applyingRemote = true;
        try {
          saveStorageData(data.state);
        } finally {
          applyingRemote = false;
        }
        if (typeof window.refreshAllViews === "function") window.refreshAllViews();
        lastSyncAt = data.savedAt || new Date().toISOString();
        setStatus("synced", t("cloud.pulled"));
        return true;
      }

      if (action === "push") return push();

      lastSyncAt = data.savedAt || null;
      setStatus("synced");
      return true;
    } catch (err) {
      if (err.name === "AbortError") setStatus("error", t("cloud.err.timeout"));
      else if (!navigator.onLine) setStatus("offline");
      else setStatus("error", t("cloud.err.network"));
      return false;
    }
  }

  // ------------------------------------------------------------- kích hoạt đẩy

  function schedulePush() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(push, DEBOUNCE_MS);
  }

  /** storage.js gọi sau mỗi lần ghi localStorage */
  function onLocalChange() {
    if (!config || applyingRemote) return;
    schedulePush();
  }

  // ------------------------------------------------------------------ kết nối

  function connect(raw) {
    const cfg = CORE.normalizeConfig(raw);
    if (!cfg) {
      return { ok: false, error: t("cloud.invalid") };
    }

    config = cfg;
    writeConfig(cfg);
    setStatus("idle");
    pull({ allowAsk: true });
    return { ok: true };
  }

  function disconnect() {
    config = null;
    writeConfig(null);
    lastSyncAt = null;
    setStatus("off");
  }

  // ----------------------------------------------------------------------- UI

  function openModal() {
    const modal = byId("cloud-modal");
    if (!modal) return;

    const urlInput = byId("cloud-api-url");
    const tokenInput = byId("cloud-token");
    if (urlInput) urlInput.value = config ? config.apiUrl : "";
    if (tokenInput) tokenInput.value = config ? config.token : "";

    modal.hidden = false;
    renderStatus();
    if (urlInput) urlInput.focus();
  }

  function closeModal() {
    const modal = byId("cloud-modal");
    if (modal) modal.hidden = true;
  }

  function wireUI() {
    const modal = byId("cloud-modal");

    byId("btn-cloud")?.addEventListener("click", openModal);
    byId("cloud-modal-close")?.addEventListener("click", closeModal);
    modal?.addEventListener("click", (event) => { if (event.target === modal) closeModal(); });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && modal && !modal.hidden) closeModal();
    });

    byId("cloud-save")?.addEventListener("click", () => {
      const result = connect({
        apiUrl: byId("cloud-api-url")?.value || "",
        token: byId("cloud-token")?.value || ""
      });

      if (!result.ok) {
        const text = byId("cloud-status-text");
        if (text) { text.textContent = "⚠️ " + result.error; text.dataset.tone = "error"; }
        return;
      }
      if (window.showToastMessage) window.showToastMessage(t("toast.cloudSaved"));
    });

    byId("cloud-push")?.addEventListener("click", () => push());
    byId("cloud-pull")?.addEventListener("click", () => pull({ allowAsk: true }));
    byId("cloud-disconnect")?.addEventListener("click", () => {
      disconnect();
      if (window.showToastMessage) window.showToastMessage(t("toast.cloudDisconnected"));
    });
  }

  // ---------------------------------------------------------------- khởi động

  function init() {
    wireUI();
    if (!config) { setStatus("off"); return; }

    setStatus("idle");
    pull({ allowAsk: true });

    window.addEventListener("online", () => {
      if (!config) return;
      setStatus("idle");
      schedulePush();
    });
    window.addEventListener("offline", () => { if (config) setStatus("offline"); });
  }

  window.CloudSync = {
    init: init,
    connect: connect,
    disconnect: disconnect,
    push: push,
    pull: pull,
    onLocalChange: onLocalChange,
    refreshStatus: renderStatus,
    getStatus: () => status,
    isConfigured: () => Boolean(config)
  };
})();
