// js/error-detective.js
// Mini-game "Tìm lỗi sai": 5 lượt dựng từ sổ tay lỗi.
// Mỗi lượt hiện một câu với đáp án đã điền (đúng hoặc sai) — người chơi chọn Đúng/Sai.
// Không cộng điểm/xu.

const ErrorDetective = {
  rounds: [],
  index: 0,
  correct: 0
};

/**
 * Dựng các lượt chơi từ danh sách lỗi.
 * Xen kẽ câu đúng / câu sai để không đoán được theo thứ tự.
 */
function buildDetectiveRounds(mistakes, count) {
  return mistakes.slice(0, count || 5).map((mistake, index) => {
    const isTrue = index % 2 === 0;
    const answer = isTrue ? mistake.correctAnswer : mistake.userAnswer;
    const question = mistake.questionText || "";
    const hasBlank = /_{3,}/.test(question);

    return {
      id: mistake.id,
      sentence: hasBlank
        ? question.replace(/_{3,}/, `<strong>${answer}</strong>`)
        : `${question} → <strong>${answer}</strong>`,
      isTrue: isTrue,
      correctAnswer: mistake.correctAnswer,
      explanation: mistake.explanation || ""
    };
  });
}

function startErrorDetective() {
  const box = document.getElementById("mistakes-container");
  if (!box) return;

  const mistakes = (typeof getMistakes === "function" ? getMistakes() : [])
    .filter(item => item.correctAnswer && item.questionText);

  if (mistakes.length === 0) {
    box.innerHTML = `<div class="empty-state-box" style="padding:2rem;text-align:center">
      <p>${t("game.needData")}</p></div>`;
    return;
  }

  ErrorDetective.rounds = buildDetectiveRounds(mistakes, 5);
  ErrorDetective.index = 0;
  ErrorDetective.correct = 0;
  renderDetectiveRound();
}

function renderDetectiveRound() {
  const box = document.getElementById("mistakes-container");
  if (!box) return;

  const round = ErrorDetective.rounds[ErrorDetective.index];
  if (!round) return finishDetective();

  box.innerHTML = `
    <div class="lesson-box">
      <div class="lesson-box-header">
        <h2>${t("game.title")}</h2>
        <p>${t("game.intro")}</p>
        <p class="plan-progress">${ErrorDetective.index + 1} / ${ErrorDetective.rounds.length}</p>
      </div>
      <div class="tab-pane active">
        <div class="detective-sentence">${round.sentence}</div>
        <div class="detective-actions">
          <button class="btn-primary" data-detective="true" type="button">${t("game.true")}</button>
          <button class="btn-secondary" data-detective="false" type="button">${t("game.false")}</button>
        </div>
        <div id="detective-feedback"></div>
      </div>
    </div>`;

  box.querySelectorAll("[data-detective]").forEach(button => {
    button.addEventListener("click", () => {
      answerDetective(button.dataset.detective === "true");
    });
  });
}

function answerDetective(choice) {
  const round = ErrorDetective.rounds[ErrorDetective.index];
  if (!round) return;

  const isRight = choice === round.isTrue;
  if (isRight) ErrorDetective.correct += 1;

  document.querySelectorAll("[data-detective]").forEach(button => {
    button.disabled = true;
  });

  const feedback = document.getElementById("detective-feedback");
  if (feedback) {
    feedback.className = `detective-feedback ${isRight ? "ok" : "bad"}`;
    feedback.innerHTML = `
      <p class="detective-verdict">${isRight ? t("game.correct") : t("game.wrong", { answer: round.correctAnswer })}</p>
      ${round.explanation ? `<p class="mistake-explanation">${round.explanation}</p>` : ""}
      <button class="btn-primary" data-detective-next type="button">${t("game.next")}</button>
    `;
    feedback.querySelector("[data-detective-next]")?.addEventListener("click", () => {
      ErrorDetective.index += 1;
      if (ErrorDetective.index >= ErrorDetective.rounds.length) finishDetective();
      else renderDetectiveRound();
    });
  }
}

function finishDetective() {
  const box = document.getElementById("mistakes-container");
  if (!box) return;

  const total = ErrorDetective.rounds.length;
  box.innerHTML = `
    <div class="lesson-box">
      <div class="tab-pane active" style="text-align:center">
        <div style="font-size:2.4rem;margin-bottom:.5rem">🕵️</div>
        <h2>${t("game.result", { correct: ErrorDetective.correct, total: total })}</h2>
        <div class="practice-footer-actions" style="justify-content:center;gap:.6rem">
          <button class="btn-primary" data-game-retry type="button">${t("game.retry")}</button>
          <button class="btn-secondary" data-game-back type="button">${t("game.back")}</button>
        </div>
      </div>
    </div>`;

  box.querySelector("[data-game-retry]")?.addEventListener("click", startErrorDetective);
  box.querySelector("[data-game-back]")?.addEventListener("click", () => {
    if (typeof initMistakesModule === "function") initMistakesModule();
  });
}

window.startErrorDetective = startErrorDetective;
window.buildDetectiveRounds = buildDetectiveRounds;
