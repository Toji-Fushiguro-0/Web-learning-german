// js/placement.js
// Bài kiểm tra xếp trình độ A1: 12 câu, chấm điểm, gợi ý lộ trình.
// Không cộng điểm/xu — đây là bài đánh giá.

const PlacementModule = {
  data: null,       // { questions: [...] }
  submitted: false
};

/** Vào trang kiểm tra: tải dữ liệu (một lần) rồi render */
async function initPlacementModule() {
  const box = document.getElementById("placement-container");
  if (!box) return;

  if (!PlacementModule.data) {
    box.innerHTML = `<div style="text-align:center;padding:3rem;color:var(--color-text-muted)">
      <p>⏳ ${t("placement.loading")}</p></div>`;

    try {
      PlacementModule.data = await loadPlacementData();
    } catch (err) {
      box.innerHTML = `<div class="empty-state-box" style="padding:2rem;text-align:center">
        <p>❌ ${t("placement.error")}</p></div>`;
      return;
    }
  }

  renderPlacementTest();
}

function renderPlacementTest() {
  const box = document.getElementById("placement-container");
  if (!box || !PlacementModule.data) return;

  PlacementModule.submitted = false;
  const questions = PlacementModule.data.questions || [];
  const last = typeof getPlacementResult === "function" ? getPlacementResult() : null;

  const lastHtml = last
    ? `<p class="progress-status-text">${t("placement.lastResult", {
        correct: last.score, total: last.total, date: last.date
      })}</p>`
    : "";

  box.innerHTML = `
    <div class="lesson-box">
      <div class="lesson-box-header">
        <h2>${t("placement.title")}</h2>
        <p>${t("placement.intro", { n: questions.length })}</p>
        ${lastHtml}
      </div>
      <div class="tab-pane active">
        <div id="placement-questions">
          ${questions.map((q, index) => `
            <div class="exercise-card" data-question-id="${q.id}">
              <div class="exercise-question">
                <span class="q-num">${t("grammar.qnum", { n: index + 1 })}</span> ${q.question}
              </div>
              <div class="options-list">
                ${(q.options || []).map((opt, i) => `
                  <label class="option-item" for="pl-${q.id}-${i}" id="pl-label-${q.id}-${i}">
                    <input type="radio" name="pl-${q.id}" id="pl-${q.id}-${i}" value="${i}">
                    <span><strong>${String.fromCharCode(65 + i)}.</strong> ${opt}</span>
                  </label>`).join("")}
              </div>
            </div>`).join("")}
        </div>

        <div class="score-summary-banner" id="placement-result"></div>

        <div class="practice-footer-actions">
          <button class="btn-primary" id="btn-placement-submit">${t("placement.submit")}</button>
        </div>
      </div>
    </div>
  `;

  document.getElementById("btn-placement-submit")?.addEventListener("click", submitPlacement);
}

function submitPlacement() {
  if (PlacementModule.submitted) return;

  const questions = (PlacementModule.data && PlacementModule.data.questions) || [];
  let correct = 0;
  let unanswered = 0;

  questions.forEach(q => {
    const selected = document.querySelector(`input[name="pl-${q.id}"]:checked`);
    const resultBox = document.getElementById("placement-result");

    (q.options || []).forEach((_, i) => {
      const label = document.getElementById(`pl-label-${q.id}-${i}`);
      if (!label) return;
      label.classList.remove("correct-answer", "wrong-answer");
      if (i === q.correctIndex) label.classList.add("correct-answer");
      const input = document.getElementById(`pl-${q.id}-${i}`);
      if (input) input.disabled = true;
    });

    if (!selected) {
      unanswered++;
    } else if (parseInt(selected.value, 10) === q.correctIndex) {
      correct++;
    } else {
      const chosen = document.getElementById(`pl-label-${q.id}-${parseInt(selected.value, 10)}`);
      if (chosen) chosen.classList.add("wrong-answer");
    }
  });

  PlacementModule.submitted = true;

  const total = questions.length;
  const band = getPlacementBand(correct, total);
  const saved = savePlacementResult({ score: correct, total: total, band: band, level: "A1" });

  const banner = document.getElementById("placement-result");
  if (banner) {
    banner.classList.add("show");
    banner.innerHTML = `
      <h3>${t("placement.result", { correct: correct, total: total })}</h3>
      <p>${t(`placement.band.${saved.band}`)}</p>
      ${unanswered > 0 ? `<p style="font-size:0.85rem">${t("placement.unanswered", { n: unanswered })}</p>` : ""}
    `;
    banner.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  const actions = document.querySelector("#view-placement .practice-footer-actions");
  if (actions) {
    actions.innerHTML = `
      <button class="btn-secondary" id="btn-placement-retake">${t("placement.retake")}</button>
      <button class="btn-primary" id="btn-placement-go">${t("placement.goGrammar")}</button>
    `;
    document.getElementById("btn-placement-retake")?.addEventListener("click", () => {
      PlacementModule.submitted = false;
      renderPlacementTest();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    document.getElementById("btn-placement-go")?.addEventListener("click", () => {
      if (typeof window.switchToView === "function") {
        window.switchToView("grammar", t("title.grammar"));
      }
    });
  }

  if (typeof window.updateHeaderStats === "function") window.updateHeaderStats();
  if (typeof window.updateDashboardStats === "function") window.updateDashboardStats();
}
