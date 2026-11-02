// js/preview.js
// Chế độ "xem trước": mở khóa toàn bộ mục đang khóa để xem giao diện và nội dung dự kiến.
// - Mặc định BẬT (đúng yêu cầu "mở khóa full để xem trước").
// - Tắt bằng nút ở chân sidebar; lựa chọn được ghi nhớ.
// - Không thay đổi dữ liệu học tập, chỉ đổi trạng thái hiển thị.

const PreviewMode = (function () {
  "use strict";

  const KEY = "deutsch_lernwelt_preview";

  const FEATURES = {
    hoeren: {
      icon: "🎧",
      titleKey: "preview.hoeren.title",
      taglineKey: "preview.hoeren.tagline",
      pointKeys: ["preview.hoeren.p1", "preview.hoeren.p2", "preview.hoeren.p3", "preview.hoeren.p4"],
      noteKey: "preview.hoeren.note"
    },
    lesen: {
      icon: "📖",
      titleKey: "preview.lesen.title",
      taglineKey: "preview.lesen.tagline",
      pointKeys: ["preview.lesen.p1", "preview.lesen.p2", "preview.lesen.p3", "preview.lesen.p4"],
      noteKey: "preview.lesen.note"
    },
    schreiben: {
      icon: "✍️",
      titleKey: "preview.schreiben.title",
      taglineKey: "preview.schreiben.tagline",
      pointKeys: ["preview.schreiben.p1", "preview.schreiben.p2", "preview.schreiben.p3", "preview.schreiben.p4"],
      noteKey: "preview.schreiben.note"
    },
    ai: {
      icon: "🤖",
      titleKey: "preview.ai.title",
      taglineKey: "preview.ai.tagline",
      pointKeys: ["preview.ai.p1", "preview.ai.p2", "preview.ai.p3", "preview.ai.p4"],
      noteKey: "preview.ai.note"
    }
  };

  let enabled = readEnabled();
  let lockedLevels = [];

  function readEnabled() {
    try {
      const value = localStorage.getItem(KEY);
      return value === null ? true : value === "1";
    } catch (err) {
      return true;
    }
  }

  function persist() {
    try { localStorage.setItem(KEY, enabled ? "1" : "0"); } catch (err) { /* bỏ qua */ }
  }

  function updateToggleButton() {
    const btn = document.getElementById("btn-preview-toggle");
    if (!btn) return;

    btn.textContent = enabled ? t("sidebar.preview.on") : t("sidebar.preview.off");
    btn.setAttribute("aria-pressed", String(enabled));
    btn.title = enabled ? t("sidebar.preview.onTitle") : t("sidebar.preview.offTitle");
  }

  /** Đồng bộ class/nhãn theo trạng thái hiện tại */
  function apply() {
    document.documentElement.setAttribute("data-preview", enabled ? "on" : "off");

    document.querySelectorAll("[data-preview]").forEach((btn) => {
      btn.classList.toggle("disabled", !enabled);
      btn.classList.toggle("preview-unlocked", enabled);
      btn.title = enabled ? t("preview.nav.title") : (btn.dataset.originalTitle || "");

      const badge = btn.querySelector(".nav-badge-soon");
      if (badge) {
        const key = badge.dataset.i18n || "badge.soon";
        badge.textContent = enabled ? t("badge.preview") : t(key);
      }
    });

    lockedLevels.forEach((btn) => btn.classList.toggle("disabled-level", !enabled));

    updateToggleButton();
  }

  /** Hiển thị trang xem trước cho một tính năng */
  function openFeature(key) {
    const feature = FEATURES[key];
    const box = document.getElementById("placeholder-box");
    if (!feature || !box) return;

    let statsHtml = "";
    if (key === "mistakes") {
      const mistakes = typeof getMistakes === "function" ? getMistakes() : [];
      const pending = mistakes.filter((item) => !item.understood).length;
      statsHtml = `
        <div class="preview-stats">
          <div><strong>${mistakes.length}</strong><span>${t("preview.stats.mistakes")}</span></div>
          <div><strong>${pending}</strong><span>${t("preview.stats.pending")}</span></div>
        </div>`;
    }

    box.innerHTML = `
      <div class="preview-card">
        <div class="preview-icon">${feature.icon}</div>
        <span class="preview-badge">${t("preview.badge")}</span>
        <h3>${t(feature.titleKey)}</h3>
        <p class="preview-tagline">${t(feature.taglineKey)}</p>
        ${statsHtml}
        <ul class="preview-list">
          ${feature.pointKeys.map((key) => `<li>${t(key)}</li>`).join("")}
        </ul>
        <p class="preview-note">${t(feature.noteKey)}</p>
        <button class="btn-primary" data-goto-dashboard>${t("preview.back")}</button>
      </div>
    `;

    if (typeof window.switchToView === "function") {
      window.switchToView("placeholder", t(feature.titleKey));
    }

    document.querySelectorAll(".nav-item").forEach((item) => item.classList.remove("active"));
    const current = document.querySelector(`[data-preview="${key}"]`);
    if (current) current.classList.add("active");
  }

  function toggle() {
    enabled = !enabled;
    persist();
    apply();

    // Tắt xem trước khi đang đứng ở trang placeholder → quay về tổng quan
    if (!enabled) {
      const activeView = document.querySelector(".view-section.active");
      if (activeView && activeView.id === "view-placeholder" &&
          typeof window.switchToView === "function") {
        window.switchToView("dashboard", t("title.dashboard"));
      }
      if (typeof window.setGrammarLevel === "function") window.setGrammarLevel("A1");
    }

    if (typeof window.showToastMessage === "function") {
      window.showToastMessage(enabled ? t("toast.previewOn") : t("toast.previewOff"));
    }
  }

  function onClick(event) {
    const navBtn = event.target.closest("[data-preview]");
    if (navBtn) {
      event.preventDefault();
      if (!enabled) {
        if (typeof window.showToastMessage === "function") {
          window.showToastMessage(t("toast.previewLocked"));
        }
        return;
      }
      openFeature(navBtn.dataset.preview);
      return;
    }

    if (event.target.closest("[data-goto-dashboard]") && typeof window.switchToView === "function") {
      window.switchToView("dashboard", t("title.dashboard"));
      document.querySelectorAll(".nav-item").forEach((item) => item.classList.remove("active"));
      document.querySelector('.nav-item[data-view="dashboard"]')?.classList.add("active");
    }
  }

  /** Vẽ lại nhãn sau khi đổi ngôn ngữ */
  function refreshLabels() {
    apply();
    if (!enabled) return;

    const activeView = document.querySelector(".view-section.active");
    if (activeView && activeView.id === "view-placeholder") {
      const current = document.querySelector(".nav-item.active[data-preview]");
      if (current) openFeature(current.dataset.preview);
    }
  }

  function init() {
    lockedLevels = Array.prototype.slice.call(
      document.querySelectorAll(".level-btn.disabled-level")
    );

    document.getElementById("btn-preview-toggle")?.addEventListener("click", toggle);
    document.addEventListener("click", onClick);

    apply();
  }

  return {
    init: init,
    isEnabled: () => enabled,
    setEnabled: (value) => { enabled = Boolean(value); persist(); apply(); },
    openFeature: openFeature,
    refreshLabels: refreshLabels
  };
})();

// `const` cấp cao nhất không tự gắn vào window — app.js và test cần truy cập qua window
if (typeof window !== "undefined") {
  window.PreviewMode = PreviewMode;
}
