// js/mistakes.js
// Sổ tay lỗi sai: danh sách lỗi đã ghi, lọc theo chủ đề, đánh dấu đã hiểu.
// Không cộng xu (đúng luật: ôn lỗi sai không kiếm xu).

const MistakesModule = {
  filter: "all"
};

function initMistakesModule() {
  const box = document.getElementById("mistakes-container");
  if (!box) return;
  renderMistakesView();
}

function renderMistakesView() {
  const box = document.getElementById("mistakes-container");
  if (!box) return;

  const all = typeof getMistakes === "function" ? getMistakes() : [];
  const openCount = all.filter(item => !item.understood).length;
  const understoodCount = all.length - openCount;

  if (all.length === 0) {
    box.innerHTML = `
      <div class="empty-state-box" style="padding:3rem;text-align:center">
        <div style="font-size:2.5rem;margin-bottom:.5rem">📓</div>
        <p>${t("mistakes.empty")}</p>
      </div>`;
    return;
  }

  const topics = [...new Set(all.map(item => item.topic).filter(Boolean))];
  const filtered = (MistakesModule.filter === "all"
    ? all
    : all.filter(item => item.topic === MistakesModule.filter)
  ).slice().reverse();

  const chips = [
    `<button class="theme-tab ${MistakesModule.filter === "all" ? "active" : ""}" data-mistake-topic="all">${t("mistakes.filterAll", { n: all.length })}</button>`,
    ...topics.map(topic => {
      const count = all.filter(item => item.topic === topic).length;
      return `<button class="theme-tab ${MistakesModule.filter === topic ? "active" : ""}" data-mistake-topic="${topic}">${topic} (${count})</button>`;
    })
  ].join("");

  box.innerHTML = `
    <div class="mistakes-toolbar">
      <div class="vocab-theme-tabs">${chips}</div>
      <div class="mistakes-stats">
        <span>${t("mistakes.total", { n: all.length })}</span>
        <span>${t("mistakes.open", { n: openCount })}</span>
        ${understoodCount > 0
          ? `<button class="plan-link" data-clear-understood type="button">${t("mistakes.clearUnderstood", { n: understoodCount })}</button>`
          : ""}
        <button class="btn-primary" data-start-game type="button">${t("game.start")}</button>
      </div>
    </div>

    <div class="mistakes-list">
      ${filtered.map(renderMistakeCard).join("")}
    </div>
  `;

  bindMistakesEvents(box);
}

function renderMistakeCard(mistake) {
  const understood = Boolean(mistake.understood);
  return `
    <div class="mistake-card ${understood ? "understood" : ""}">
      <div class="mistake-head">
        <span class="badge-level">${mistake.topic || "general"}</span>
        <span class="mistake-date">${mistake.savedAt || ""}</span>
      </div>
      <p class="mistake-question">${mistake.questionText || ""}</p>
      <div class="mistake-answers">
        <span class="mistake-wrong">${t("mistakes.yourAnswer")} <strong>${mistake.userAnswer || "—"}</strong></span>
        <span class="mistake-right">${t("mistakes.correctAnswer")} <strong>${mistake.correctAnswer || "—"}</strong></span>
      </div>
      ${mistake.explanation ? `<p class="mistake-explanation">${mistake.explanation}</p>` : ""}
      <div class="mistake-footer">
        ${understood
          ? `<span class="badge-status done">${t("mistakes.understood")}</span>`
          : `<button class="btn-ghost" data-mark-understood="${mistake.id}" type="button">${t("mistakes.markUnderstood")}</button>`}
      </div>
    </div>`;
}

function bindMistakesEvents(box) {
  box.querySelectorAll("[data-mistake-topic]").forEach(button => {
    button.addEventListener("click", () => {
      MistakesModule.filter = button.dataset.mistakeTopic;
      renderMistakesView();
    });
  });

  box.querySelectorAll("[data-mark-understood]").forEach(button => {
    button.addEventListener("click", () => {
      if (typeof markMistakeUnderstood === "function" &&
          markMistakeUnderstood(button.dataset.markUnderstood)) {
        if (typeof window.showToastMessage === "function") {
          window.showToastMessage(t("mistakes.marked"));
        }
        renderMistakesView();
      }
    });
  });

  box.querySelector("[data-clear-understood]")?.addEventListener("click", () => {
    const removed = typeof clearUnderstoodMistakes === "function" ? clearUnderstoodMistakes() : 0;
    if (typeof window.showToastMessage === "function") {
      window.showToastMessage(t("mistakes.cleared", { n: removed }));
    }
    renderMistakesView();
  });

  box.querySelector("[data-start-game]")?.addEventListener("click", () => {
    if (typeof window.startErrorDetective === "function") window.startErrorDetective();
  });
}

window.initMistakesModule = initMistakesModule;
