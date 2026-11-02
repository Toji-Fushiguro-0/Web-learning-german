// js/grammar.js — PHIÊN BẢN 2.0
// Module ngữ pháp: tải từ JSON, render theo cấu trúc mới, sửa bug điểm

/**
 * Trạng thái nội bộ module ngữ pháp
 */
const GrammarModule = {
  allQuestions: [],        // Toàn bộ câu hỏi từ grammar.json
  currentLesson: null,     // Bài học đang mở (object từ GRAMMAR_LESSONS)
  lessonQuestions: [],     // Câu hỏi của bài học hiện tại
  hasSubmitted: false,     // Đã bấm "Kiểm tra đáp án" chưa → tránh tính điểm 2 lần
  lastScore: null,         // Điểm của lần kiểm tra vừa rồi
  isDataLoaded: false,     // Đã tải grammar.json chưa
  activeLevel: "A1",       // Trình độ đang xem (A1, A2, B1, B2)
  lastTotal: 0,            // Tổng số câu của lượt vừa chấm
  lastUnanswered: 0,       // Số câu bỏ trống của lượt vừa chấm
  hasSaved: false          // Đã bấm "Lưu & Hoàn thành" chưa
};

// ==========================================================================
// KHỞI TẠO: TẢI DỮ LIỆU
// ==========================================================================

/**
 * Tải câu hỏi từ grammar.json và validate
 * Gọi khi khởi động app, không cần gọi lại nếu isDataLoaded = true
 */
async function loadGrammarQuestions() {
  if (GrammarModule.isDataLoaded) return true;

  try {
    const data = await loadGrammarData();
    const result = validateGrammarData(data);
    printValidationReport("Ngữ pháp A1", result);

    if (!result.valid) {
      console.error("[Grammar] Dữ liệu không hợp lệ:", result.errors);
      return false;
    }

    GrammarModule.allQuestions = data.questions;
    GrammarModule.isDataLoaded = true;
    console.log(`[Grammar] Đã tải ${data.questions.length} câu hỏi A1`);
    return true;

  } catch (err) {
    console.error("[Grammar] Không thể tải grammar.json:", err.message);
    return false;
  }
}

// ==========================================================================
// RENDER DANH SÁCH BÀI HỌC NGỮ PHÁP (dùng lại GRAMMAR_LESSONS từ grammar-data.js)
// ==========================================================================

/** Bài đã hoàn thành khi có ít nhất một lượt làm */
function isLessonCompletedById(lessonId, userData) {
  const prog = userData.lessonProgress && userData.lessonProgress[lessonId];
  return Boolean(prog && prog.attempts > 0);
}

/** Tiêu đề các bài cần hoàn thành trước mà người dùng chưa làm */
function getMissingPrerequisites(lesson, userData) {
  return (lesson.prerequisites || [])
    .filter(id => !isLessonCompletedById(id, userData))
    .map(id => {
      const found = GRAMMAR_LESSONS.find(l => l.id === id);
      return found ? found.title : id;
    });
}

/** Bài bị khoá nếu còn điều kiện tiên quyết chưa xong. Chế độ xem trước bỏ qua khoá. */
function isLessonLocked(lesson, userData) {
  if (window.PreviewMode && typeof window.PreviewMode.isEnabled === "function" &&
      window.PreviewMode.isEnabled()) {
    return false;
  }
  return getMissingPrerequisites(lesson, userData).length > 0;
}

/**
 * Render danh sách bài học theo trình độ đang chọn
 * @param {string} [level] - "A1" (mặc định) hoặc trình độ đang xem trước
 */
function renderGrammarList(level) {
  const container = document.getElementById("grammar-cards-container");
  if (!container) return;

  const activeLevel = level || GrammarModule.activeLevel || "A1";
  GrammarModule.activeLevel = activeLevel;

  const lessons = GRAMMAR_LESSONS.filter(lesson => lesson.level === activeLevel);
  const userData = getStorageData();
  container.innerHTML = "";

  syncLevelButtons(activeLevel);

  if (lessons.length === 0) {
    const a1Count = GRAMMAR_LESSONS.filter(l => l.level === "A1").length;
    container.innerHTML = `
      <div class="empty-state-box grammar-empty">
        <div style="font-size:2.2rem;margin-bottom:.35rem">🚧</div>
        <h3>${t("grammar.empty.title", { level: activeLevel })}</h3>
        <p>${t("grammar.empty.text", { level: activeLevel, n: a1Count })}</p>
        <button class="btn-primary" data-jump-level="A1" style="margin-top:1rem">${t("grammar.empty.back")}</button>
      </div>`;
    return;
  }

  lessons.forEach((lesson, index) => {
    const prog = userData.lessonProgress && userData.lessonProgress[lesson.id];
    const isCompleted = prog && prog.attempts > 0;
    const locked = isLessonLocked(lesson, userData);
    const card = document.createElement("div");
    card.className = `grammar-card ${isCompleted ? "completed" : ""} ${locked ? "locked-card" : ""}`;

    let statusBadgeHtml, actionBtnHtml, lockNoteHtml = "";

    if (lesson.isComingSoon) {
      statusBadgeHtml = `<span class="badge-status locked">${t("grammar.badge.coming")}</span>`;
      actionBtnHtml = `<button class="btn-card-action disabled-btn" disabled>${t("grammar.badge.notOpen")}</button>`;
    } else if (locked) {
      const missing = getMissingPrerequisites(lesson, userData);
      statusBadgeHtml = `<span class="badge-status locked">${t("grammar.badge.locked")}</span>`;
      actionBtnHtml = `<button class="btn-card-action disabled-btn" disabled>${t("grammar.action.locked")}</button>`;
      lockNoteHtml = `<p class="card-lock-note">${t("grammar.lockNote", { lessons: missing.join(", ") })}</p>`;
    } else if (isCompleted) {
      // Bug cũ: chia cho 0 khi dữ liệu cũ thiếu total → ra NaN%
      const total = Number(prog.total) || 0;
      const bestScore = Number(prog.bestScore) || 0;
      const pct = total > 0 ? Math.round((bestScore / total) * 100) : 0;
      statusBadgeHtml = `<span class="badge-status done">${t("grammar.badge.best", { pct: pct })}</span>`;
      actionBtnHtml = `<button class="btn-card-action" data-lesson-id="${lesson.id}">${t("grammar.action.review")}</button>`;
    } else {
      statusBadgeHtml = `<span class="badge-status ready">${t("grammar.badge.ready")}</span>`;
      actionBtnHtml = `<button class="btn-card-action" data-lesson-id="${lesson.id}">${t("grammar.action.study")}</button>`;
    }

    // Hiện số câu hỏi nếu đã tải
    const qCount = GrammarModule.isDataLoaded
      ? GrammarModule.allQuestions.filter(q => q.topic === lesson.questionTopic).length
      : "?";
    const qInfo = lesson.questionTopic ? t("grammar.questions", { n: qCount }) : "";
    const unitNumber = lesson.unitId ? String(lesson.unitId).replace(/\D/g, "") : "";
    const unitInfo = unitNumber ? ` · ${t("grammar.unit", { n: unitNumber })}` : "";

    card.innerHTML = `
      <div class="grammar-card-header">
        <span class="badge-level">${lesson.level}</span>
        ${statusBadgeHtml}
      </div>
      <div class="card-topic">${t("grammar.topic", { topic: lesson.topic })}${unitInfo}</div>
      <h4>${t("grammar.lessonNo", { n: index + 1, title: lesson.title })}</h4>
      <p>${lesson.summary}</p>
      ${lockNoteHtml}
      <div class="grammar-card-footer">
        <span class="card-time">⏱ ${lesson.estimatedTime || "20 phút"}${qInfo}</span>
        ${actionBtnHtml}
      </div>
    `;

    const actionBtn = card.querySelector(`[data-lesson-id]`);
    if (actionBtn) {
      actionBtn.addEventListener("click", () => openGrammarLesson(lesson.id));
    }

    container.appendChild(card);
  });
}

/** Cập nhật trạng thái active cho các nút trình độ */
function syncLevelButtons(level) {
  document.querySelectorAll(".level-btn[data-level]").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.level === level);
  });
}

/** Đổi trình độ đang xem (preview.js cũng gọi hàm này) */
function setGrammarLevel(level) {
  if (!level) return;
  renderGrammarList(level);
}

window.setGrammarLevel = setGrammarLevel;

/** Gắn sự kiện cho tab trình độ và nút "về A1" trong trạng thái trống */
function initGrammarLevels() {
  document.querySelectorAll(".level-btn[data-level]").forEach(btn => {
    btn.addEventListener("click", () => {
      if (btn.classList.contains("disabled-level")) {
        if (typeof window.showToastMessage === "function") {
          window.showToastMessage(t("toast.levelLocked"));
        }
        return;
      }
      setGrammarLevel(btn.dataset.level);
    });
  });

  document.getElementById("grammar-cards-container")?.addEventListener("click", (event) => {
    const jump = event.target.closest("[data-jump-level]");
    if (jump) setGrammarLevel(jump.dataset.jumpLevel);
  });
}

document.addEventListener("DOMContentLoaded", initGrammarLevels);

// ==========================================================================
// MỞ BÀI HỌC
// ==========================================================================

async function openGrammarLesson(lessonId) {
  const lesson = GRAMMAR_LESSONS.find(l => l.id === lessonId);
  if (!lesson) return;

  // Chặn mở bài khi chưa hoàn thành điều kiện tiên quyết
  const userData = getStorageData();
  if (isLessonLocked(lesson, userData)) {
    const missing = getMissingPrerequisites(lesson, userData);
    if (typeof window.showToastMessage === "function") {
      window.showToastMessage(t("grammar.lockedToast", { lessons: missing.join(", ") }));
    }
    return;
  }

  GrammarModule.currentLesson = lesson;
  GrammarModule.hasSubmitted = false;
  GrammarModule.hasSaved = false;
  GrammarModule.lastScore = null;

  // Reset giao diện bài học
  resetLessonUI();

  // Tải câu hỏi JSON nếu chưa có
  if (!GrammarModule.isDataLoaded) {
    const lessonDetailEl = document.getElementById("view-lesson-detail");
    if (lessonDetailEl) {
      document.getElementById("exercises-container").innerHTML =
        renderLoadingState(t("grammar.loading"));
    }
    const ok = await loadGrammarQuestions();
    if (!ok) {
      document.getElementById("exercises-container").innerHTML =
        renderErrorState(t("grammar.loadError.title"), t("grammar.loadError.text"));
    }
  }

  // Lọc câu hỏi theo topic của bài học
  if (lesson.questionTopic && GrammarModule.allQuestions.length > 0) {
    GrammarModule.lessonQuestions = GrammarModule.allQuestions.filter(
      q => q.topic === lesson.questionTopic
    );
  } else {
    // Nếu bài học chưa có questionTopic, dùng exercises trong grammar-data.js
    GrammarModule.lessonQuestions = lesson.exercises ? lesson.exercises.map(ex => ({
      id: `legacy-${ex.id}`,
      question: ex.question,
      options: ex.options.map(o => o.text),
      correctIndex: ex.options.findIndex(o => o.isCorrect),
      explanation: ex.explanation,
      topic: lesson.id,
      level: lesson.level
    })) : [];
  }

  // Cập nhật tiêu đề bài học
  updateLessonHeader(lesson);

  // Render lý thuyết và bài tập
  renderTheoryContent(lesson.theory);
  renderExerciseCards(GrammarModule.lessonQuestions);

  // Chuyển sang view chi tiết bài học
  switchToView("lesson-detail", lesson.title);
  switchLessonTab("theory");
}

// ==========================================================================
// RENDER LÝ THUYẾT (Tái sử dụng logic từ app.js cũ)
// ==========================================================================

function renderTheoryContent(theory) {
  const pane = document.getElementById("theory-pane");
  if (!pane) return;

  if (!theory) {
    pane.innerHTML = `<div class="empty-state-box" style="padding:2rem;text-align:center;">
      <p style="color:var(--color-text-muted)">${t("grammar.noTheory")}</p>
      <button class="btn-primary" id="btn-jump-to-practice" style="margin-top:1rem">${t("grammar.jumpPractice")}</button>
    </div>`;
    document.getElementById("btn-jump-to-practice")?.addEventListener("click", () => switchLessonTab("practice"));
    return;
  }

  let html = `<div class="theory-intro">${theory.intro}</div>`;

  (theory.sections || []).forEach(sec => {
    html += `<div class="theory-section"><h3>${sec.title}</h3>`;
    if (sec.description) html += `<p>${sec.description}</p>`;

    if (sec.table) {
      html += `<div class="table-responsive"><table class="grammar-table"><thead><tr>`;
      sec.table.headers.forEach(h => { html += `<th>${h}</th>`; });
      html += `</tr></thead><tbody>`;
      sec.table.rows.forEach(r => {
        html += `<tr>`;
        r.forEach(cell => { html += `<td>${cell}</td>`; });
        html += `</tr>`;
      });
      html += `</tbody></table></div>`;
    }

    if (sec.notes && sec.notes.length > 0) {
      html += `<div class="notes-box"><strong>${t("grammar.notesTitle")}</strong><ul>`;
      sec.notes.forEach(n => { html += `<li>${n}</li>`; });
      html += `</ul></div>`;
    }

    if (sec.rules && sec.rules.length > 0) {
      html += `<ul class="rules-list">`;
      sec.rules.forEach(r => { html += `<li>${r}</li>`; });
      html += `</ul>`;
    }

    html += `</div>`;
  });

  html += `<div style="margin-top:2rem;text-align:center;">
    <button class="btn-primary" id="btn-jump-to-practice">${t("grammar.practiceNow")}</button>
  </div>`;

  pane.innerHTML = html;
  document.getElementById("btn-jump-to-practice")?.addEventListener("click", () => {
    switchLessonTab("practice");
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

// ==========================================================================
// RENDER CÂU HỎI LUYỆN TẬP (ĐỊNH DẠNG MỚI: correctIndex thay vì isCorrect)
// ==========================================================================

function renderExerciseCards(questions) {
  const container = document.getElementById("exercises-container");
  if (!container) return;

  if (!questions || questions.length === 0) {
    container.innerHTML = `<div class="empty-state-box" style="padding:2rem;text-align:center;">
      <p style="color:var(--color-text-muted)">${t("grammar.noQuestions")}</p>
    </div>`;
    return;
  }

  container.innerHTML = "";

  questions.forEach((q, qIndex) => {
    const card = document.createElement("div");
    card.className = "exercise-card";
    card.dataset.questionId = q.id;

    let optionsHtml = `<div class="options-list">`;
    (q.options || []).forEach((opt, i) => {
      const inputId = `opt-${q.id}-${i}`;
      optionsHtml += `
        <label class="option-item" for="${inputId}" id="label-${q.id}-${i}">
          <input type="radio" name="q-${q.id}" id="${inputId}" value="${i}" data-question-id="${q.id}">
          <span><strong>${String.fromCharCode(65 + i)}.</strong> ${opt}</span>
        </label>
      `;
    });
    optionsHtml += `</div>`;

    card.innerHTML = `
      <div class="exercise-question">
        <span class="q-num">${t("grammar.qnum", { n: qIndex + 1 })}</span> ${q.question}
      </div>
      ${optionsHtml}
      <div class="explanation-box" id="exp-box-${q.id}">
        <div class="exp-verdict" id="exp-verdict-${q.id}"></div>
        <div class="exp-text">${q.explanation || ""}</div>
        ${q.exampleExtra ? `<div class="exp-extra">${t("grammar.extraExample")} <em>${q.exampleExtra}</em></div>` : ""}
      </div>
    `;

    container.appendChild(card);
  });

  // Reset banner và nút
  const banner = document.getElementById("score-summary-banner");
  if (banner) { banner.classList.remove("show"); banner.innerHTML = ""; }
  const finishBtn = document.getElementById("btn-finish-lesson");
  if (finishBtn) finishBtn.style.display = "none";
}

// ==========================================================================
// CHẤM ĐIỂM — SỬA LỖI: Chỉ cho chấm 1 lần, tránh cộng điểm nhiều lần
// ==========================================================================

function handleCheckAnswers() {
  if (GrammarModule.hasSubmitted) {
    showToastMessage(t("grammar.alreadyChecked"));
    return;
  }

  const questions = GrammarModule.lessonQuestions;
  if (!questions || questions.length === 0) return;

  let correct = 0;
  const wrongItems = [];
  let unanswered = 0;

  questions.forEach(q => {
    const selectedInput = document.querySelector(`input[name="q-${q.id}"]:checked`);
    const expBox = document.getElementById(`exp-box-${q.id}`);
    const expVerdict = document.getElementById(`exp-verdict-${q.id}`);

    // Disable tất cả radio của câu này
    document.querySelectorAll(`input[name="q-${q.id}"]`).forEach(radio => {
      radio.disabled = true;
    });

    // Tô màu đáp án đúng
    (q.options || []).forEach((_, i) => {
      const label = document.getElementById(`label-${q.id}-${i}`);
      if (!label) return;
      label.classList.remove("correct-answer", "wrong-answer");
      if (i === q.correctIndex) label.classList.add("correct-answer");
    });

    // Xử lý theo câu trả lời người dùng
    expBox?.classList.add("show");

    if (!selectedInput) {
      unanswered++;
      if (expBox) expBox.classList.add("is-wrong");
      if (expVerdict) expVerdict.textContent = t("grammar.exercise.unanswered");
    } else {
      const chosenIndex = parseInt(selectedInput.value, 10);
      const isCorrect = chosenIndex === q.correctIndex;

      if (isCorrect) {
        correct++;
        expBox?.classList.add("is-correct");
        expBox?.classList.remove("is-wrong");
        if (expVerdict) expVerdict.textContent = t("grammar.exercise.correct");
      } else {
        // Đánh dấu đáp án người dùng chọn (sai)
        const chosenLabel = document.getElementById(`label-${q.id}-${chosenIndex}`);
        chosenLabel?.classList.add("wrong-answer");
        expBox?.classList.add("is-wrong");
        expBox?.classList.remove("is-correct");
        if (expVerdict) expVerdict.textContent = t("grammar.exercise.wrong");

        // Thu thập thông tin lỗi sai
        wrongItems.push({
          questionId: q.id,
          topic: q.topic,
          questionText: q.question,
          userAnswer: q.options[chosenIndex],
          correctAnswer: q.options[q.correctIndex],
          explanation: q.explanation
        });
      }
    }
  });

  GrammarModule.hasSubmitted = true;
  GrammarModule.lastScore = correct;
  GrammarModule.lastTotal = questions.length;
  GrammarModule.lastUnanswered = unanswered;
  GrammarModule.hasSaved = false;

  // Hiện banner kết quả
  const total = questions.length;
  renderResultBanner(correct, total, unanswered, true);

  // Kích hoạt nút Lưu (chỉ gán onclick một lần, tránh chồng event)
  const finishBtn = document.getElementById("btn-finish-lesson");
  if (finishBtn) {
    finishBtn.style.display = "inline-flex";
    // Dùng replaceWith để xóa event cũ nếu có (tránh addEventListener chồng)
    const newBtn = finishBtn.cloneNode(true);
    // Bỏ data-i18n để lần đổi ngôn ngữ sau không ghi đè nhãn "Làm lại"
    newBtn.removeAttribute("data-i18n");
    finishBtn.parentNode.replaceChild(newBtn, finishBtn);

    newBtn.addEventListener("click", () => {
      const lessonId = GrammarModule.currentLesson?.id;
      if (!lessonId) return;

      const updated = recordLessonResult(lessonId, correct, total, wrongItems);
      const lastSession = updated.sessionHistory[updated.sessionHistory.length - 1];
      const coinsEarned = (lastSession && lastSession.coinsEarned) || 0;
      const coinText = coinsEarned > 0 ? t("grammar.coinsSuffix", { coins: coinsEarned }) : "";
      showToastMessage(t("grammar.saved", { points: correct * 10, coins: coinText }));

      // Cập nhật header và danh sách bài
      updateHeaderStats();
      updateDashboardStats();
      renderGrammarList();

      // Nút "Làm lại"
      GrammarModule.hasSaved = true;
      newBtn.textContent = t("grammar.retry");
      newBtn.style.backgroundColor = "var(--brand-gold)";
      newBtn.onclick = () => {
        // Mở lại bài học → reset hoàn toàn
        openGrammarLesson(lessonId);
      };
    });
  }
}

// ==========================================================================
// BANNER KẾT QUẢ & CẬP NHẬT THEO NGÔN NGỮ
// ==========================================================================

/** Vẽ banner kết quả từ số liệu đã lưu (dùng lại khi đổi ngôn ngữ) */
function renderResultBanner(correct, total, unanswered, shouldScroll) {
  const banner = document.getElementById("score-summary-banner");
  if (!banner || !total) return;

  const pct = Math.round((correct / total) * 100);
  let praise = t("grammar.praise.low");
  if (pct === 100) praise = t("grammar.praise.perfect");
  else if (pct >= 80) praise = t("grammar.praise.great");
  else if (pct >= 60) praise = t("grammar.praise.ok");

  banner.classList.add("show");
  banner.innerHTML = `
    <h3>${t("grammar.result", { correct: correct, total: total, pct: pct })}</h3>
    <p>${praise}</p>
    ${unanswered > 0 ? `<p style="color: var(--color-gold-fg); font-size:0.85rem">${t("grammar.unansweredNote", { n: unanswered })}</p>` : ""}
  `;

  if (shouldScroll) banner.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

/**
 * Cập nhật nhãn đúng/sai + banner khi đổi ngôn ngữ giữa chừng.
 * Trạng thái đúng/sai đọc lại từ radio đã chọn nên không cần lưu riêng.
 */
function refreshLessonLanguage() {
  if (!GrammarModule.hasSubmitted) return;

  (GrammarModule.lessonQuestions || []).forEach(q => {
    const verdict = document.getElementById(`exp-verdict-${q.id}`);
    if (!verdict) return;

    const selected = document.querySelector(`input[name="q-${q.id}"]:checked`);
    if (!selected) {
      verdict.textContent = t("grammar.exercise.unanswered");
    } else if (parseInt(selected.value, 10) === q.correctIndex) {
      verdict.textContent = t("grammar.exercise.correct");
    } else {
      verdict.textContent = t("grammar.exercise.wrong");
    }
  });

  renderResultBanner(
    GrammarModule.lastScore || 0,
    GrammarModule.lastTotal || 0,
    GrammarModule.lastUnanswered || 0,
    false
  );

  const finishBtn = document.getElementById("btn-finish-lesson");
  if (finishBtn) {
    finishBtn.textContent = GrammarModule.hasSaved ? t("grammar.retry") : t("lesson.save");
  }
}

window.refreshLessonLanguage = refreshLessonLanguage;

// ==========================================================================
// HELPER NỘI BỘ
// ==========================================================================

function updateLessonHeader(lesson) {
  const el = (id) => document.getElementById(id);
  if (el("lesson-title")) el("lesson-title").textContent = lesson.title;
  if (el("lesson-topic")) el("lesson-topic").textContent = `${lesson.level} · ${lesson.topic}`;
  if (el("lesson-time")) el("lesson-time").textContent = `⏱ ${lesson.estimatedTime || "—"}`;
}

function resetLessonUI() {
  const banner = document.getElementById("score-summary-banner");
  if (banner) { banner.classList.remove("show"); banner.innerHTML = ""; }
  const finishBtn = document.getElementById("btn-finish-lesson");
  if (finishBtn) finishBtn.style.display = "none";
}

function renderLoadingState(msg) {
  return `<div style="text-align:center;padding:3rem;color:var(--color-text-muted)"><p>⏳ ${msg}</p></div>`;
}

function renderErrorState(title, detail) {
  return `<div style="padding:2rem;background:var(--color-error-bg);border:1px solid var(--color-error-border);border-radius:var(--radius-md)">
    <h4 style="color:var(--color-error)">❌ ${title}</h4>
    <p style="font-size:0.9rem">${detail}</p>
  </div>`;
}
