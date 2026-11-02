// js/vocabulary.js
// Module quản lý tính năng Từ vựng & Flashcard

/**
 * Trạng thái module từ vựng
 * Dùng object để nhóm các biến liên quan, tránh biến toàn cục rải rác
 */
const VocabModule = {
  allWords: [],           // Toàn bộ từ vựng tải từ JSON
  filteredWords: [],      // Danh sách đang hiển thị sau khi lọc
  currentCardIndex: 0,    // Vị trí thẻ đang xem trong Flashcard mode
  isFlipped: false,       // Thẻ đang ở mặt nào (Đức hay Việt)
  activeTheme: "all",     // Chủ đề đang lọc
  searchQuery: "",        // Từ khoá tìm kiếm
  mode: "flashcard",      // "flashcard" | "list" | "review"
  isLoaded: false         // Đã tải dữ liệu chưa
};

// ==========================================================================
// KHỞI TẠO MODULE
// ==========================================================================

/**
 * Khởi tạo module từ vựng — gọi khi người dùng vào trang Từ vựng
 */
async function initVocabularyModule() {
  const container = document.getElementById("vocab-container");
  if (!container) return;

  // Chỉ tải dữ liệu một lần
  if (!VocabModule.isLoaded) {
    container.innerHTML = vocabLoadingState(t("vocab.loadingData"));

    try {
      const data = await loadVocabularyData();
      const validation = validateVocabularyData(data);
      printValidationReport("Từ vựng A1", validation);

      if (!validation.valid) {
        container.innerHTML = vocabErrorState(
          t("vocab.error.data"),
          validation.errors.join("<br>")
        );
        return;
      }

      VocabModule.allWords = data.words;
      VocabModule.isLoaded = true;

    } catch (err) {
      container.innerHTML = vocabErrorState(
        t("vocab.error.title"),
        `${err.message}<br><br>${t("vocab.error.hint")}`
      );
      return;
    }
  }

  // Lọc và render lần đầu
  applyVocabFilter();
  renderVocabView();
}

// ==========================================================================
// LỌC VÀ TÌM KIẾM
// ==========================================================================

function applyVocabFilter() {
  // Chế độ "Ôn hôm nay" chỉ lấy các từ đến hạn theo SM-2
  let words = VocabModule.mode === "review"
    ? getWordsToReview(VocabModule.allWords)
    : VocabModule.allWords;

  // Lọc theo chủ đề
  if (VocabModule.activeTheme && VocabModule.activeTheme !== "all") {
    words = words.filter(w => w.theme === VocabModule.activeTheme);
  }

  // Lọc theo từ khoá tìm kiếm (không phân biệt hoa thường)
  if (VocabModule.searchQuery) {
    const q = VocabModule.searchQuery.toLowerCase();
    words = words.filter(w =>
      w.word.toLowerCase().includes(q) ||
      w.meaning.toLowerCase().includes(q)
    );
  }

  VocabModule.filteredWords = words;
  VocabModule.currentCardIndex = 0;
}

// ==========================================================================
// RENDER GIAO DIỆN CHÍnh
// ==========================================================================

function renderVocabView() {
  const container = document.getElementById("vocab-container");
  if (!container) return;

  const themes = getUniqueThemes();
  const userData = getStorageData();
  const knownCount = countKnownWords();
  const learningCount = countLearningWords();
  const totalWords = VocabModule.allWords.length;
  const dueCount = getWordsToReview(VocabModule.allWords).length;

  container.innerHTML = `
    <!-- Thống kê nhanh -->
    <div class="vocab-stats-bar">
      <span class="vocab-stat-item">
        <span class="stat-icon green">✓</span>
        <strong>${knownCount}</strong> ${t("vocab.stat.known")}
      </span>
      <span class="vocab-stat-item">
        <span class="stat-icon gold">↻</span>
        <strong>${learningCount}</strong> ${t("vocab.stat.learning")}
      </span>
      <span class="vocab-stat-item">
        <span class="stat-icon blue">📚</span>
        <strong>${totalWords}</strong> ${t("vocab.stat.total")}
      </span>
      <span class="vocab-stat-item">
        <span class="stat-icon gold">🪙</span>
        <strong>${userData.coins || 0}</strong> ${t("vocab.stat.coins")}
      </span>
    </div>

    <!-- Bộ lọc chủ đề -->
    <div class="vocab-filter-bar">
      <div class="vocab-theme-tabs">
        <button class="theme-tab ${VocabModule.activeTheme === "all" ? "active" : ""}" data-theme="all">
          ${t("vocab.all", { n: VocabModule.allWords.length })}
        </button>
        ${themes.map(item => `
          <button class="theme-tab ${VocabModule.activeTheme === item.theme ? "active" : ""}" data-theme="${item.theme}">
            ${item.label} (${item.count})
          </button>
        `).join("")}
      </div>
      <div class="vocab-search-box">
        <input
          type="text"
          class="vocab-search-input"
          id="vocab-search-input"
          placeholder="${t("vocab.searchPlaceholder")}"
          value="${VocabModule.searchQuery}"
        >
      </div>
    </div>

    <!-- Nút chuyển chế độ: Flashcard / Danh sách / Ôn hôm nay -->
    <div class="vocab-mode-switch">
      <button class="mode-btn ${VocabModule.mode === "flashcard" ? "active" : ""}" id="btn-mode-flashcard">${t("vocab.mode.flashcard")}</button>
      <button class="mode-btn ${VocabModule.mode === "list" ? "active" : ""}" id="btn-mode-list">${t("vocab.mode.list")}</button>
      <button class="mode-btn ${VocabModule.mode === "review" ? "active" : ""}" id="btn-mode-review">${t("vocab.mode.review", { n: dueCount })}</button>
    </div>

    <!-- Khu vực nội dung -->
    <div id="vocab-content-area">
      ${VocabModule.mode === "list" ? renderWordList() : renderFlashcardArea()}
    </div>
  `;

  // Gán sự kiện sau khi render xong
  bindVocabEvents();
}

/**
 * Render khu vực Flashcard
 */
function renderFlashcardArea() {
  const words = VocabModule.filteredWords;

  if (words.length === 0) {
    if (VocabModule.mode === "review" && !VocabModule.searchQuery) {
      return renderEmptyState(t("vocab.empty.noDue"));
    }
    return renderEmptyState(
      VocabModule.searchQuery
        ? t("vocab.empty.noMatch", { query: VocabModule.searchQuery })
        : t("vocab.empty.noTheme")
    );
  }

  const idx = VocabModule.currentCardIndex;
  const word = words[idx];
  const userData = getStorageData();
  const wordProg = userData.vocabularyProgress && userData.vocabularyProgress[word.id];
  const status = wordProg ? wordProg.status : "new";

  const statusLabels = {
    known: t("vocab.status.known"),
    learning: t("vocab.status.learning"),
    new: t("vocab.status.new")
  };
  const statusColors = { known: "green", learning: "gold", new: "blue" };

  const frontContent = `
    <div class="fc-article">${word.article ? word.article : "&nbsp;"}</div>
    <div class="fc-word">${word.word}</div>
    ${word.plural ? `<div class="fc-plural">${t("vocab.plural", { value: word.plural })}</div>` : ""}
    <div class="fc-type">${translateWordType(word.wordType)}</div>
    <div class="fc-hint">${t("vocab.front.hint")}</div>
  `;

  const backContent = `
    <div class="fc-meaning">${word.meaning}</div>
    <div class="fc-example-de">"${word.exampleDE}"</div>
    <div class="fc-example-vi">${word.exampleVI}</div>
    ${word.pronunciation ? `<div class="fc-pronunciation">${t("vocab.pronunciation")} <em>${word.pronunciation}</em></div>` : ""}
    ${word.notes ? `<div class="fc-notes">💡 ${word.notes}</div>` : ""}
  `;

  return `
    <div class="flashcard-wrapper">
      <div class="fc-progress-indicator">
        ${t("vocab.card.progress", { index: idx + 1, total: words.length })}
        &nbsp;|&nbsp;
        ${t("vocab.card.theme", { theme: word.themeLabel || word.theme })}
        &nbsp;|&nbsp;
        <span class="fc-status-badge ${statusColors[status]}">${statusLabels[status]}</span>
      </div>

      <!-- Thẻ lật -->
      <div class="flashcard ${VocabModule.isFlipped ? "flipped" : ""}" id="flashcard-main" role="button" aria-label="Lật thẻ để xem nghĩa">
        <div class="fc-face fc-front">
          ${frontContent}
        </div>
        <div class="fc-face fc-back">
          ${backContent}
        </div>
      </div>

      <!-- Nút điều hướng thẻ -->
      <div class="fc-nav-buttons">
        <button class="btn-fc-nav" id="btn-fc-prev" ${idx === 0 ? "disabled" : ""}>
          ${t("vocab.prev")}
        </button>
        <div class="fc-action-btns ${VocabModule.isFlipped ? "visible" : ""}">
          <button class="btn-fc-result wrong" id="btn-fc-wrong">
            ${t("vocab.wrong")}
          </button>
          <button class="btn-fc-result correct" id="btn-fc-correct">
            ${t("vocab.correct")}
          </button>
        </div>
        <button class="btn-fc-nav" id="btn-fc-next" ${idx >= words.length - 1 ? "disabled" : ""}>
          ${t("vocab.next")}
        </button>
      </div>
    </div>
  `;
}

/**
 * Render chế độ danh sách từ vựng
 */
function renderWordList() {
  const words = VocabModule.filteredWords;

  if (words.length === 0) {
    return renderEmptyState(t("vocab.empty.generic"));
  }

  const userData = getStorageData();

  return `
    <div class="word-list-table">
      <table class="grammar-table">
        <thead>
          <tr>
            <th>${t("vocab.table.word")}</th>
            <th>${t("vocab.table.type")}</th>
            <th>${t("vocab.table.article")}</th>
            <th>${t("vocab.table.plural")}</th>
            <th>${t("vocab.table.meaning")}</th>
            <th>${t("vocab.table.example")}</th>
            <th>${t("vocab.table.status")}</th>
          </tr>
        </thead>
        <tbody>
          ${words.map(word => {
            const prog = userData.vocabularyProgress && userData.vocabularyProgress[word.id];
            const status = prog ? prog.status : "new";
            const statusMap = {
              known: t("vocab.status.known"),
              learning: t("vocab.status.learning"),
              new: t("vocab.status.new")
            };
            const colorMap = { known: "color: var(--color-success)", learning: "color: var(--brand-gold)", new: "color: var(--color-text-muted)" };
            return `
              <tr>
                <td><strong>${word.word}</strong></td>
                <td>${translateWordType(word.wordType)}</td>
                <td>${word.article || "—"}</td>
                <td>${word.plural || "—"}</td>
                <td>${word.meaning}</td>
                <td style="font-style: italic; font-size: 0.85rem;">${word.exampleDE}</td>
                <td style="${colorMap[status]}; font-size: 0.8rem;">${statusMap[status]}</td>
              </tr>
            `;
          }).join("")}
        </tbody>
      </table>
    </div>
  `;
}

// ==========================================================================
// SỰ KIỆN
// ==========================================================================

function bindVocabEvents() {
  const contentArea = document.getElementById("vocab-content-area");

  // Chuyển chế độ Flashcard / Danh sách / Ôn hôm nay
  const setMode = (mode) => {
    VocabModule.mode = mode;
    VocabModule.currentCardIndex = 0;
    applyVocabFilter();
    renderVocabView();
  };

  document.getElementById("btn-mode-flashcard")?.addEventListener("click", () => setMode("flashcard"));
  document.getElementById("btn-mode-list")?.addEventListener("click", () => setMode("list"));
  document.getElementById("btn-mode-review")?.addEventListener("click", () => setMode("review"));

  // Lọc theo chủ đề
  document.querySelectorAll(".theme-tab").forEach(btn => {
    btn.addEventListener("click", () => {
      VocabModule.activeTheme = btn.dataset.theme;
      VocabModule.searchQuery = "";
      applyVocabFilter();
      renderVocabView();
    });
  });

  // Tìm kiếm
  const searchInput = document.getElementById("vocab-search-input");
  if (searchInput) {
    let searchTimer;
    searchInput.addEventListener("input", () => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => {
        VocabModule.searchQuery = searchInput.value.trim();
        applyVocabFilter();
        const contentArea = document.getElementById("vocab-content-area");
        if (contentArea) {
          // Xác định chế độ hiện tại để render đúng
          const isListMode = VocabModule.mode === "list";
          contentArea.innerHTML = isListMode ? renderWordList() : renderFlashcardArea();
          if (!isListMode) bindFlashcardEvents();
        }
      }, 300); // Debounce 300ms tránh tìm kiếm mỗi lần gõ
    });
  }

  // Gán sự kiện flashcard ngay sau khi render
  bindFlashcardEvents();
}

function bindFlashcardEvents() {
  // Lật thẻ khi bấm vào
  const card = document.getElementById("flashcard-main");
  if (card) {
    card.addEventListener("click", () => {
      VocabModule.isFlipped = !VocabModule.isFlipped;
      card.classList.toggle("flipped");

      // Hiện nút "Đã nhớ" / "Chưa nhớ" khi đã lật
      const actionBtns = document.querySelector(".fc-action-btns");
      if (actionBtns) actionBtns.classList.toggle("visible", VocabModule.isFlipped);
    });
  }

  // Nút "Đã nhớ"
  document.getElementById("btn-fc-correct")?.addEventListener("click", (e) => {
    e.stopPropagation(); // Không trigger sự kiện lật thẻ
    const words = VocabModule.filteredWords;
    const word = words[VocabModule.currentCardIndex];
    if (word) {
      const coinsEarned = recordVocabularyResult(word.id, true);
      showToastMessage(
        coinsEarned > 0
          ? t("toast.memorizedCoins", { coins: coinsEarned })
          : t("toast.memorized")
      );
      goToNextCard();
    }
  });

  // Nút "Chưa nhớ"
  document.getElementById("btn-fc-wrong")?.addEventListener("click", (e) => {
    e.stopPropagation();
    const words = VocabModule.filteredWords;
    const word = words[VocabModule.currentCardIndex];
    if (word) {
      recordVocabularyResult(word.id, false);
      showToastMessage(t("toast.notRemembered"));
      goToNextCard();
    }
  });

  // Điều hướng thẻ
  document.getElementById("btn-fc-prev")?.addEventListener("click", () => {
    if (VocabModule.currentCardIndex > 0) {
      VocabModule.currentCardIndex--;
      VocabModule.isFlipped = false;
      const contentArea = document.getElementById("vocab-content-area");
      if (contentArea) {
        contentArea.innerHTML = renderFlashcardArea();
        bindFlashcardEvents();
      }
    }
  });

  document.getElementById("btn-fc-next")?.addEventListener("click", () => {
    goToNextCard();
  });
}

function goToNextCard() {
  const words = VocabModule.filteredWords;
  if (VocabModule.currentCardIndex < words.length - 1) {
    VocabModule.currentCardIndex++;
    VocabModule.isFlipped = false;
    const contentArea = document.getElementById("vocab-content-area");
    if (contentArea) {
      contentArea.innerHTML = renderFlashcardArea();
      bindFlashcardEvents();
    }
  } else {
    // Hết bộ thẻ
    const contentArea = document.getElementById("vocab-content-area");
    if (contentArea) {
      contentArea.innerHTML = `
        <div class="empty-state-box" style="text-align: center; padding: 3rem;">
          <div style="font-size: 3rem; margin-bottom: 1rem;">🎉</div>
          <h3>${t("vocab.done.title", { n: words.length })}</h3>
          <p style="color: var(--color-text-muted); margin: 1rem 0;">
            ${t("vocab.done.text")}
          </p>
          <button class="btn-primary" id="btn-restart-flashcard">${t("vocab.restart")}</button>
        </div>
      `;
      document.getElementById("btn-restart-flashcard")?.addEventListener("click", () => {
        VocabModule.currentCardIndex = 0;
        VocabModule.isFlipped = false;
        contentArea.innerHTML = renderFlashcardArea();
        bindFlashcardEvents();
      });
    }
  }
}

// ==========================================================================
// HELPER
// ==========================================================================

function getUniqueThemes() {
  const themeMap = {};
  VocabModule.allWords.forEach(w => {
    if (!themeMap[w.theme]) {
      themeMap[w.theme] = { theme: w.theme, label: w.themeLabel || w.theme, count: 0 };
    }
    themeMap[w.theme].count++;
  });
  return Object.values(themeMap);
}

function translateWordType(type) {
  const map = {
    noun: t("vocab.type.noun"),
    verb: t("vocab.type.verb"),
    adjective: t("vocab.type.adjective"),
    adverb: t("vocab.type.adverb"),
    exclamation: t("vocab.type.exclamation"),
    conjunction: t("vocab.type.conjunction"),
    preposition: t("vocab.type.preposition")
  };
  return map[type] || type;
}

// Helper render trạng thái loading
function vocabLoadingState(msg) {
  return `<div class="loading-state" style="text-align:center;padding:3rem;color:var(--color-text-muted);">
    <div style="font-size:2rem;margin-bottom:0.75rem">⏳</div>
    <p>${msg}</p>
  </div>`;
}

// Helper render trạng thái lỗi
function vocabErrorState(title, detail) {
  return `<div class="error-state" style="padding:2rem;background:var(--color-error-bg);border:1px solid var(--color-error-border);border-radius:var(--radius-md);">
    <h4 style="color:var(--color-error);margin-bottom:0.5rem">❌ ${title}</h4>
    <p style="font-size:0.9rem;color:var(--color-error-text);">${detail}</p>
  </div>`;
}

// Helper render trạng thái trống
function renderEmptyState(msg) {
  return `<div class="empty-state-box" style="text-align:center;padding:3rem;color:var(--color-text-muted);">
    <div style="font-size:2.5rem;margin-bottom:0.75rem">🗂️</div>
    <p>${msg}</p>
  </div>`;
}
