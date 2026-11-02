// js/app.js — PHIÊN BẢN 2.0
// Bộ điều phối chính: kết nối sidebar, điều hướng view, header stats
// Các module grammar.js và vocabulary.js đảm nhiệm logic riêng của từng kỹ năng

document.addEventListener("DOMContentLoaded", async () => {

  // ==========================================================================
  // 1. THAM CHIẾU CÁC PHẦN TỬ DOM DÙNG CHUNG
  // ==========================================================================
  const DOM = {
    // Navigation
    navItems:       document.querySelectorAll(".nav-item[data-view]"),
    views:          document.querySelectorAll(".view-section"),
    pageTitle:      document.getElementById("page-title"),

    // Header stats
    headerStreak:   document.getElementById("header-streak-count"),
    headerPoints:   document.getElementById("header-points-count"),
    headerCoins:    document.getElementById("header-coins-count"),

    // Dashboard
    dashStreak:          document.getElementById("dash-streak-count"),
    dashCompletedCount:  document.getElementById("dash-completed-count"),
    dashTotalCount:      document.getElementById("dash-total-count"),
    dashPoints:          document.getElementById("dash-points-count"),
    dashCoins:           document.getElementById("dash-coins-count"),
    dashKnownWords:      document.getElementById("dash-known-words"),
    dashLearningWords:   document.getElementById("dash-learning-words"),
    dashMistakesCount:   document.getElementById("dash-mistakes-count"),
    dashGoalBar:         document.getElementById("dash-goal-bar"),
    dashGoalText:        document.getElementById("dash-goal-text"),
    btnStartA1:          document.getElementById("btn-start-a1"),
    btnStartVocab:       document.getElementById("btn-start-vocab"),

    // Grammar lesson detail
    btnBackToGrammar: document.getElementById("btn-back-to-grammar"),
    lessonTabTheory:  document.getElementById("tab-btn-theory"),
    lessonTabPractice:document.getElementById("tab-btn-practice"),
    theoryPane:       document.getElementById("theory-pane"),
    practicePane:     document.getElementById("practice-pane"),
    btnCheckAnswers:  document.getElementById("btn-check-answers"),

    // Mobile sidebar
    btnMobileToggle: document.getElementById("btn-mobile-toggle"),
    sidebar:         document.getElementById("sidebar"),
    sidebarOverlay:  document.getElementById("sidebar-overlay"),

    // Reset data
    btnResetData:    document.getElementById("btn-reset-data"),

    // Toast
    toast:           document.getElementById("toast-notification"),

    // Theme sáng/tối
    btnThemeToggle:  document.getElementById("btn-theme-toggle"),
    themeToggleIcon: document.getElementById("theme-toggle-icon")
  };

  // Khởi tạo i18n trước khi render bất cứ thứ gì
  if (window.I18N) {
    window.I18N.init();
  } else {
    console.warn("[App] Không tìm thấy I18N — giao diện chỉ dùng tiếng Việt.");
  }

  // ==========================================================================
  // 2. HỆ THỐNG ĐIỀU HƯỚNG VIEW
  // ==========================================================================

  /**
   * Chuyển sang một view cụ thể và cập nhật sidebar active
   * Hàm này được export ra window để grammar.js và vocabulary.js có thể gọi
   */
  function switchToView(viewName, titleText) {
    // Ẩn tất cả các view
    DOM.views.forEach(v => v.classList.remove("active"));

    // Hiện view được chọn
    const target = document.getElementById(`view-${viewName}`);
    if (target) target.classList.add("active");

    // Cập nhật tiêu đề trang
    if (titleText && DOM.pageTitle) DOM.pageTitle.textContent = titleText;

    // Xóa highlight của mọi mục nav (kể cả mục "Xem trước" không có data-view)
    document.querySelectorAll(".nav-item").forEach(item => item.classList.remove("active"));

    // Cập nhật sidebar active — không highlight khi đang ở lesson-detail
    DOM.navItems.forEach(item => {
      const isActive = item.dataset.view === viewName;
      item.classList.toggle("active", isActive);
    });

    // Đặc biệt: khi ở lesson-detail, highlight nav Grammar
    if (viewName === "lesson-detail") {
      DOM.navItems.forEach(item => {
        if (item.dataset.view === "grammar") item.classList.add("active");
      });
    }

    // Đóng sidebar mobile
    closeSidebar();

    // Làm mới nội dung tùy view
    if (viewName === "dashboard") updateDashboardData();
    if (viewName === "placement") initPlacementModule();
    if (viewName === "grammar")   renderGrammarList();
    if (viewName === "vocabulary") initVocabularyModule();
    if (viewName === "mistakes")  initMistakesModule();

    // Scroll về đầu trang
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Xuất ra window để grammar.js và vocabulary.js gọi được
  window.switchToView = switchToView;

  // Gán sự kiện cho các nav item
  DOM.navItems.forEach(item => {
    item.addEventListener("click", () => {
      const view = item.dataset.view;
      const title = item.dataset.titleKey
        ? t(item.dataset.titleKey)
        : (item.dataset.title || "Deutsch Lernwelt");
      if (view) switchToView(view, title);
    });
  });

  // Nút bắt đầu từ Dashboard
  DOM.btnStartA1?.addEventListener("click", () => switchToView("grammar", `${t("title.grammar")} A1`));
  DOM.btnStartVocab?.addEventListener("click", () => switchToView("vocabulary", `${t("title.vocabulary")} A1`));

  // Nút Quay lại (từ lesson-detail → grammar)
  DOM.btnBackToGrammar?.addEventListener("click", () => switchToView("grammar", `${t("title.grammar")} A1`));

  // ==========================================================================
  // 3. TABS BÀI HỌC (LÝ THUYẾT / BÀI TẬP)
  // ==========================================================================

  function switchLessonTab(tabName) {
    const isTheory = tabName === "theory";
    DOM.lessonTabTheory?.classList.toggle("active", isTheory);
    DOM.lessonTabPractice?.classList.toggle("active", !isTheory);
    DOM.theoryPane?.classList.toggle("active", isTheory);
    DOM.practicePane?.classList.toggle("active", !isTheory);
  }

  // Xuất ra window để grammar.js gọi được
  window.switchLessonTab = switchLessonTab;

  DOM.lessonTabTheory?.addEventListener("click", () => switchLessonTab("theory"));
  DOM.lessonTabPractice?.addEventListener("click", () => switchLessonTab("practice"));

  // Nút kiểm tra đáp án → gọi sang grammar.js
  DOM.btnCheckAnswers?.addEventListener("click", () => {
    handleCheckAnswers(); // Định nghĩa trong grammar.js
  });

  // ==========================================================================
  // 4. HEADER STATS VÀ DASHBOARD
  // ==========================================================================

  /**
   * Streak chỉ còn hiệu lực nếu lần học cuối là hôm nay hoặc hôm qua.
   * Bug cũ: nghỉ 3 ngày vẫn hiển thị streak cũ cho tới lần học tiếp theo.
   */
  function getDisplayStreak(data) {
    const today = getTodayString();
    const yesterday = (() => {
      const d = new Date();
      d.setDate(d.getDate() - 1);
      return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, "0"), String(d.getDate()).padStart(2, "0")].join("-");
    })();
    if (data.lastActiveDate === today || data.lastActiveDate === yesterday) {
      return data.streak || 0;
    }
    return 0;
  }

  function updateHeaderStats() {
    const data = getStorageData();
    if (DOM.headerStreak) DOM.headerStreak.textContent = getDisplayStreak(data);
    if (DOM.headerPoints) DOM.headerPoints.textContent = data.totalPoints || 0;
    if (DOM.headerCoins) DOM.headerCoins.textContent = data.coins || 0;
  }

  // Xuất ra window để grammar.js và vocabulary.js gọi được
  window.updateHeaderStats = updateHeaderStats;

  function updateDashboardData() {
    const data = getStorageData();
    updateHeaderStats();

    // Tính số bài ngữ pháp đã hoàn thành
    const completedLessons = Object.keys(data.lessonProgress || {}).filter(
      id => data.lessonProgress[id] && data.lessonProgress[id].attempts > 0
    ).length;

    if (DOM.dashStreak) DOM.dashStreak.textContent = t("dash.streakValue", { n: getDisplayStreak(data) });
    if (DOM.dashCompletedCount) DOM.dashCompletedCount.textContent = completedLessons;
    if (DOM.dashTotalCount) DOM.dashTotalCount.textContent = t("dash.totalLessons", { n: GRAMMAR_LESSONS.filter(l => l.level === "A1").length });
    if (DOM.dashPoints) DOM.dashPoints.textContent = t("dash.pointsValue", { n: data.totalPoints || 0 });
    if (DOM.dashCoins) DOM.dashCoins.textContent = t("dash.coinsValue", { n: data.coins || 0 });
    if (DOM.dashKnownWords) DOM.dashKnownWords.textContent = countKnownWords();
    if (DOM.dashLearningWords) DOM.dashLearningWords.textContent = countLearningWords();
    if (DOM.dashMistakesCount) DOM.dashMistakesCount.textContent = (data.mistakes || []).filter(m => !m.understood).length;

    // Thanh tiến độ mục tiêu hàng ngày — chỉ tính số của HÔM NAY
    const goal = data.dailyGoal?.targetQuestions || 5;
    const todayCorrect = data.dailyGoal?.goalDate === getTodayString()
      ? (data.dailyGoal?.todayCorrect || 0)
      : 0;
    const pct = Math.min(100, Math.round((todayCorrect / goal) * 100));

    if (DOM.dashGoalBar) DOM.dashGoalBar.style.width = `${pct}%`;
    if (DOM.dashGoalText) {
      if (pct >= 100) {
        DOM.dashGoalText.innerHTML = t("dash.goal.done", { correct: todayCorrect, goal: goal });
      } else if (todayCorrect === 0) {
        DOM.dashGoalText.textContent = t("dash.goal.empty");
      } else {
        DOM.dashGoalText.textContent = t("dash.goal.progress", { correct: todayCorrect, goal: goal, pct: pct });
      }
    }

    // Lộ trình gợi ý (bài tiếp theo, từ cần ôn)
    if (typeof renderStudyPlan === "function") renderStudyPlan();
  }

  // Xuất ra window
  window.updateDashboardStats = updateDashboardData;

  // ==========================================================================
  // 5. SIDEBAR MOBILE
  // ==========================================================================

  function toggleSidebar() {
    DOM.sidebar?.classList.toggle("open");
    DOM.sidebarOverlay?.classList.toggle("active");
  }

  function closeSidebar() {
    DOM.sidebar?.classList.remove("open");
    DOM.sidebarOverlay?.classList.remove("active");
  }

  DOM.btnMobileToggle?.addEventListener("click", toggleSidebar);
  DOM.sidebarOverlay?.addEventListener("click", closeSidebar);

  // ==========================================================================
  // 5b. CHẾ ĐỘ TỐI / SÁNG (DARK / LIGHT THEME)
  // ==========================================================================

  const THEME_KEY = "deutsch_lernwelt_theme";

  /** Theme đang dùng: "light" hoặc "dark" */
  function getCurrentTheme() {
    return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
  }

  /** Đồng bộ icon + tooltip của nút chuyển theme */
  function updateThemeToggleUI() {
    const isDark = getCurrentTheme() === "dark";
    if (DOM.themeToggleIcon) DOM.themeToggleIcon.textContent = isDark ? "☀️" : "🌙";
    if (DOM.btnThemeToggle) {
      const label = isDark ? t("theme.toLight") : t("theme.toDark");
      DOM.btnThemeToggle.setAttribute("aria-label", label);
      DOM.btnThemeToggle.setAttribute("title", label);
      DOM.btnThemeToggle.setAttribute("aria-pressed", String(isDark));
    }
  }

  /** Áp dụng + lưu lựa chọn theme */
  function setTheme(theme) {
    const next = theme === "dark" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch (err) {
      console.warn("[Theme] Không lưu được lựa chọn theme:", err.message);
    }
    updateThemeToggleUI();
  }

  DOM.btnThemeToggle?.addEventListener("click", () => {
    const next = getCurrentTheme() === "dark" ? "light" : "dark";

    // Bật transition tạm thời để đổi màu mượt (tắt sau 320ms)
    document.documentElement.classList.add("theme-switching");
    setTheme(next);
    window.setTimeout(() => {
      document.documentElement.classList.remove("theme-switching");
    }, 320);
  });

  updateThemeToggleUI();

  // Giao diện chỉ dùng tiếng Việt, nội dung học bằng tiếng Đức.
  // Không có nút đổi ngôn ngữ — hai ngôn ngữ gốc được giữ cố định.

  // ==========================================================================
  // 6. TOAST NOTIFICATION
  // ==========================================================================

  function showToast(message, duration = 3500) {
    if (!DOM.toast) return;
    DOM.toast.textContent = message;
    DOM.toast.style.display = "block";
    clearTimeout(DOM.toast._timer);
    DOM.toast._timer = setTimeout(() => {
      DOM.toast.style.display = "none";
    }, duration);
  }

  // Xuất ra window để các module khác dùng
  window.showToastMessage = showToast;

  // ==========================================================================
  // 7. RESET DỮ LIỆU KIỂM THỬ
  // ==========================================================================

  DOM.btnResetData?.addEventListener("click", () => {
    const confirmed = confirm(t("confirm.reset"));
    if (!confirmed) return;

    resetAllLearningData();
    updateDashboardData();
    renderGrammarList();
    showToast(t("toast.reset"));
  });

  // ==========================================================================
  // 8. ĐỒNG BỘ ĐÁM MÂY (Cloudflare Worker + D1 — tuỳ chọn)
  // ==========================================================================

  // cloud-sync.js gọi hàm này sau khi tải dữ liệu từ cloud về
  window.refreshAllViews = function refreshAllViews() {
    updateDashboardData();
    renderGrammarList();
    if (document.getElementById("view-vocabulary")?.classList.contains("active")) {
      initVocabularyModule();
    }
  };

  if (window.CloudSync) {
    window.CloudSync.init();
  } else {
    console.warn("[App] Không tìm thấy CloudSync — bỏ qua đồng bộ đám mây.");
  }

  // Mở khóa các mục "Sắp ra" để xem trước (mặc định BẬT, tắt được ở chân sidebar)
  if (window.PreviewMode) {
    window.PreviewMode.init();
  }

  // ==========================================================================
  // 9. KHỞI ĐỘNG: TẢI DỮ LIỆU VÀ RENDER LẦN ĐẦU
  // ==========================================================================

  // Tải câu hỏi ngữ pháp trong nền (không block UI)
  loadGrammarQuestions().catch(err => {
    console.warn("[App] Không tải được grammar.json — cần server cục bộ:", err.message);
  });

  // Render dashboard và danh sách bài ngay khi tải trang
  updateDashboardData();
  renderGrammarList();

});
