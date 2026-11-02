// js/study-plan.js
// Lộ trình gợi ý trên dashboard: bài tiếp theo, từ cần ôn, 5 bài kế tiếp.
// Dữ liệu lấy từ tiến độ thật + kết quả xếp trình độ; không lưu thêm state.

function isStudyLessonDone(userData, lessonId) {
  const prog = userData.lessonProgress && userData.lessonProgress[lessonId];
  return Boolean(prog && prog.attempts > 0);
}

/** Tính dữ liệu lộ trình từ tiến độ hiện tại */
function getStudyPlanData(userData) {
  const data = userData || getStorageData();
  const lessons = (typeof GRAMMAR_LESSONS !== "undefined" ? GRAMMAR_LESSONS : [])
    .filter(lesson => lesson.level === "A1");

  const done = lessons.filter(lesson => isStudyLessonDone(data, lesson.id)).length;
  const remaining = lessons.filter(lesson => !isStudyLessonDone(data, lesson.id));
  const next = remaining.find(lesson =>
    (lesson.prerequisites || []).every(id => isStudyLessonDone(data, id))
  ) || null;

  // Từ đã có lịch học mà đến hạn hôm nay
  const today = getTodayString();
  let dueCount = 0;
  Object.values(data.vocabularyProgress || {}).forEach(entry => {
    if (!entry) return;
    if (!entry.dueDate || entry.dueDate <= today) dueCount++;
  });

  return {
    lessons,
    done,
    total: lessons.length,
    remaining,
    upcoming: remaining.slice(0, 5),
    next,
    dueCount,
    placement: data.placement || null
  };
}

function renderStudyPlan() {
  const box = document.getElementById("study-plan-container");
  if (!box) return;

  const plan = getStudyPlanData();

  const placementHtml = plan.placement
    ? `<p class="plan-sub">${t("plan.placement", { score: plan.placement.score, total: plan.placement.total })}</p>`
    : `<p class="plan-sub">${t("plan.noPlacement")}
         <button class="plan-link" data-plan-placement type="button">${t("plan.checkPlacement")}</button></p>`;

  const nextHtml = plan.next
    ? `<div class="plan-row">
         <div class="plan-row-text">
           <span class="plan-label">${t("plan.next")}</span>
           <strong>${plan.next.title}</strong>
         </div>
         <button class="btn-primary" data-plan-start="${plan.next.id}" type="button">${t("plan.start")}</button>
       </div>`
    : `<p class="plan-sub">${t("plan.allDone")}</p>`;

  const reviewHtml = plan.dueCount > 0
    ? `<div class="plan-row">
         <div class="plan-row-text">
           <span class="plan-label">${t("plan.reviewLabel")}</span>
           <strong>${t("plan.dueWords", { n: plan.dueCount })}</strong>
         </div>
         <button class="btn-secondary" data-plan-review type="button">${t("plan.review")}</button>
       </div>`
    : "";

  const listHtml = plan.upcoming.length
    ? `<ol class="plan-list">
         ${plan.upcoming.map((lesson, index) => {
           const ready = (lesson.prerequisites || []).every(id => isStudyLessonDone(getStorageData(), id));
           const isNext = plan.next && lesson.id === plan.next.id;
           const state = isNext ? "available" : (ready ? "open" : "locked");
           return `<li class="plan-item ${state}">
             <span>${index + 1}. ${lesson.title}</span>
             <em>${t("plan.state." + state)}</em>
           </li>`;
         }).join("")}
       </ol>`
    : "";

  box.innerHTML = `
    <div class="study-plan-card">
      <div class="plan-head">
        <h4>${t("plan.title")}</h4>
        <span class="plan-progress">${t("plan.progress", { done: plan.done, total: plan.total })}</span>
      </div>
      ${placementHtml}
      ${nextHtml}
      ${reviewHtml}
      ${listHtml}
    </div>`;

  bindStudyPlanEvents();
}

function bindStudyPlanEvents() {
  const box = document.getElementById("study-plan-container");
  if (!box) return;

  box.querySelectorAll("[data-plan-start]").forEach(button => {
    button.addEventListener("click", () => {
      if (typeof openGrammarLesson === "function") openGrammarLesson(button.dataset.planStart);
    });
  });

  box.querySelector("[data-plan-review]")?.addEventListener("click", () => {
    if (typeof VocabModule !== "undefined") {
      VocabModule.mode = "review";
      VocabModule.currentCardIndex = 0;
    }
    if (typeof window.switchToView === "function") {
      window.switchToView("vocabulary", t("title.vocabulary"));
    }
  });

  box.querySelector("[data-plan-placement]")?.addEventListener("click", () => {
    if (typeof window.switchToView === "function") {
      window.switchToView("placement", t("title.placement"));
    }
  });
}

window.renderStudyPlan = renderStudyPlan;
window.getStudyPlanData = getStudyPlanData;
