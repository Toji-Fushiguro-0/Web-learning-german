// tests/ui.test.mjs — kiểm thử logic UI bằng DOM giả lập (không cần trình duyệt)
// Chạy: node tests/ui.test.mjs

import { readFileSync } from "node:fs";
import { createContext, runInContext } from "node:vm";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => readFileSync(path.join(ROOT, rel), "utf8");

let failures = 0;
function check(name, condition, detail) {
  if (condition) console.log("PASS  " + name);
  else {
    failures++;
    console.log("FAIL  " + name + (detail ? " → " + detail : ""));
  }
}

/* ------------------------------------------------------------ DOM tối giản */

function makeElement(tagName, initialClasses = []) {
  const classes = new Set(initialClasses);
  const element = {
    tagName,
    dataset: {},
    children: [],
    textContent: "",
    innerHTML: "",
    title: "",
    style: {},
    attributes: {},
    listeners: {},
    classList: {
      add: (...names) => names.forEach((n) => classes.add(n)),
      remove: (...names) => names.forEach((n) => classes.delete(n)),
      contains: (name) => classes.has(name),
      toggle: (name, force) => {
        const on = force === undefined ? !classes.has(name) : Boolean(force);
        if (on) classes.add(name); else classes.delete(name);
        return on;
      },
    },
    setAttribute(name, value) { this.attributes[name] = String(value); },
    getAttribute(name) { return this.attributes[name] ?? null; },
    addEventListener(type, fn) { this.listeners[type] = fn; },
    appendChild(child) { this.children.push(child); return child; },
    querySelector() { return null; },
    querySelectorAll() { return []; },
    click() { if (this.listeners.click) this.listeners.click({ target: this, preventDefault() {} }); },
  };
  return element;
}

function buildDocument({ navKeys = [], levels = [] } = {}) {
  const byId = new Map();
  const navButtons = navKeys.map((key) => {
    const btn = makeElement("button", ["nav-item", "disabled"]);
    btn.dataset.preview = key;
    btn.dataset.originalTitle = "Đang phát triển";
    return btn;
  });
  const levelButtons = levels.map((level) => {
    const btn = makeElement("button", ["level-btn", level === "A1" ? "active" : "disabled-level"]);
    btn.dataset.level = level;
    return btn;
  });
  const viewSections = [];

  const doc = {
    documentElement: makeElement("html"),
    getElementById(id) {
      if (!byId.has(id)) byId.set(id, makeElement("div"));
      return byId.get(id);
    },
    createElement: (tag) => makeElement(tag),
    querySelectorAll(selector) {
      if (selector === "[data-preview]") return navButtons;
      if (selector === ".level-btn.disabled-level") {
        return levelButtons.filter((b) => b.classList.contains("disabled-level"));
      }
      if (selector === ".level-btn[data-level]") return levelButtons;
      if (selector === ".nav-item") return navButtons;
      if (selector === ".view-section.active") return viewSections.filter((v) => v.classList.contains("active"));
      const match = selector.match(/^\[data-preview="(.+)"\]$/);
      if (match) return navButtons.filter((b) => b.dataset.preview === match[1]);
      return [];
    },
    querySelector(selector) {
      return this.querySelectorAll(selector)[0] || null;
    },
    addEventListener(type, fn) { doc.listeners[type] = fn; },
    listeners: {},
  };

  return { doc, byId, navButtons, levelButtons, viewSections };
}

function makeSandbox(doc, seed = {}) {
  const storage = new Map(Object.entries(seed));
  const sandbox = {
    console,
    document: doc,
    localStorage: {
      getItem: (k) => (storage.has(k) ? storage.get(k) : null),
      setItem: (k, v) => storage.set(k, String(v)),
      removeItem: (k) => storage.delete(k),
    },
    setTimeout,
    clearTimeout,
    CustomEvent: class { constructor(type, init) { this.type = type; this.detail = init && init.detail; } },
    dispatchEvent() { return true; },
  };
  sandbox.window = sandbox;
  createContext(sandbox);
  return { sandbox, storage };
}

/* -------------------------------------------------------------- grammar.js */

{
  const { doc, byId, levelButtons } = buildDocument({ levels: ["A1", "A2", "B1", "B2"] });
  const { sandbox } = makeSandbox(doc);

  sandbox.getStorageData = () => ({
    lessonProgress: {
      // Dữ liệu cũ thiếu total/bestScore → trước đây ra NaN%
      "a1-sein-haben": { attempts: 2, total: 0, bestScore: 0 },
    },
  });
  sandbox.showToastMessage = () => {};

  runInContext(read("js/i18n.js"), sandbox);
  runInContext(read("js/grammar-data.js"), sandbox);
  runInContext(read("js/grammar.js"), sandbox);

  const container = doc.getElementById("grammar-cards-container");
  container.children.length = 0;

  // `const GRAMMAR_LESSONS` không phải thuộc tính của sandbox → đọc bằng runInContext
  const expectedA1 = runInContext(
    "GRAMMAR_LESSONS.filter(l => l.level === 'A1').length",
    sandbox
  );

  sandbox.renderGrammarList("A1");
  check("renderGrammarList('A1') tạo đủ thẻ", container.children.length === expectedA1,
    `${container.children.length} / ${expectedA1}`);

  const firstCard = container.children[0];
  check("không còn NaN% khi dữ liệu cũ thiếu total",
    !String(firstCard.innerHTML).includes("NaN"), firstCard.innerHTML.slice(0, 120));
  check("hiển thị 0% cho dữ liệu thiếu", String(firstCard.innerHTML).includes("0%"));

  container.children.length = 0;
  sandbox.renderGrammarList("A2");
  check("trình độ A2 chưa có bài → trạng thái trống",
    container.children.length === 0 && container.innerHTML.includes("chưa có bài học"));

  sandbox.renderGrammarList("B1");
  check("trạng thái trống ghi đúng trình độ", container.innerHTML.includes("B1"));

  sandbox.setGrammarLevel("A1");
  check("setGrammarLevel('A1') render lại 7 thẻ", container.children.length === expectedA1);
  check("nút A1 được đánh dấu active", levelButtons[0].classList.contains("active"));

  // Điều kiện tiên quyết: chỉ sein-haben đã hoàn thành
  const lockedCard = String(container.children[2] && container.children[2].innerHTML);
  check("bài chưa đủ điều kiện bị khoá",
    lockedCard.includes("Cần học trước") && lockedCard.includes("Chưa mở"));
  check("thẻ khoá ghi rõ bài cần học trước", lockedCard.includes("Chia động từ thường"));
  check("bài đủ điều kiện không bị khoá",
    !String(container.children[1].innerHTML).includes("Cần học trước"));

  // Ngôn ngữ cố định: không thể đổi sang tiếng Anh
  sandbox.I18N.setLang("en");
  check("setLang('en') bị từ chối", sandbox.I18N.getLang() === "vi");

  container.children.length = 0;
  sandbox.renderGrammarList("A1");
  const viCard = String(container.children[0] && container.children[0].innerHTML);
  check("thẻ bài học vẫn tiếng Việt", viCard.includes("Ôn tập lại") || viCard.includes("Học ngay"),
    viCard.slice(0, 90));
}

/* -------------------------------------------------------------- preview.js */

{
  const { doc, navButtons, levelButtons, viewSections } = buildDocument({
    navKeys: ["hoeren", "lesen", "schreiben", "ai"],
    levels: ["A1", "A2", "B1", "B2"],
  });
  const { sandbox, storage } = makeSandbox(doc);

  const calls = { view: [], toast: [], level: [] };
  sandbox.switchToView = (name, title) => calls.view.push([name, title]);
  sandbox.showToastMessage = (msg) => calls.toast.push(msg);
  sandbox.setGrammarLevel = (level) => calls.level.push(level);

  runInContext(read("js/i18n.js"), sandbox);
  runInContext(read("js/preview.js"), sandbox);

  check("preview.js gắn PreviewMode vào window", typeof sandbox.PreviewMode === "object");

  sandbox.PreviewMode.init();

  check("mặc định BẬT (mở khóa toàn bộ)",
    sandbox.PreviewMode.isEnabled() === true &&
    navButtons.every((b) => !b.classList.contains("disabled") && b.classList.contains("preview-unlocked")));

  check("mở khóa cả 3 tab trình độ đang khóa",
    levelButtons.filter((b) => b.classList.contains("disabled-level")).length === 0);

  sandbox.PreviewMode.openFeature("hoeren");
  const box = doc.getElementById("placeholder-box");
  check("trang xem trước hiển thị đúng tính năng",
    box.innerHTML.includes("Luyện nghe") && box.innerHTML.includes("Xem trước"));
  check("chuyển sang view placeholder", calls.view.some(([name]) => name === "placeholder"));

  // Tắt bằng nút
  doc.getElementById("btn-preview-toggle").listeners.click();
  check("tắt xem trước → khóa lại nav",
    sandbox.PreviewMode.isEnabled() === false &&
    navButtons.every((b) => b.classList.contains("disabled")));
  check("tắt xem trước → ghi nhớ lựa chọn", storage.get("deutsch_lernwelt_preview") === "0");
  check("tắt xem trước → khóa lại tab trình độ",
    levelButtons.filter((b) => b.classList.contains("disabled-level")).length === 3);
  check("tắt xem trước → quay về A1", calls.level.includes("A1"));

  // Bật lại
  doc.getElementById("btn-preview-toggle").listeners.click();
  check("bật lại → mở khóa", sandbox.PreviewMode.isEnabled() === true &&
    navButtons.every((b) => b.classList.contains("preview-unlocked")));
}

/* ------------------------------- grammar.js: đổi ngôn ngữ sau khi chấm bài */

{
  const verdict = makeElement("div");
  const banner = makeElement("div");
  const finishBtn = makeElement("button");
  const checkedInput = { value: "0" }; // chọn đáp án 0, đáp án đúng là 1 → sai

  const doc = {
    documentElement: makeElement("html"),
    getElementById(id) {
      if (id === "exp-verdict-q1") return verdict;
      if (id === "score-summary-banner") return banner;
      if (id === "btn-finish-lesson") return finishBtn;
      return makeElement("div");
    },
    querySelector(selector) {
      return selector === 'input[name="q-q1"]:checked' ? checkedInput : null;
    },
    querySelectorAll() { return []; },
    addEventListener() {},
  };

  const { sandbox } = makeSandbox(doc);
  runInContext(read("js/i18n.js"), sandbox);
  runInContext(read("js/grammar-data.js"), sandbox);
  runInContext(read("js/grammar.js"), sandbox);

  runInContext(`
    GrammarModule.lessonQuestions = [{ id: "q1", correctIndex: 1 }];
    GrammarModule.hasSubmitted = true;
    GrammarModule.hasSaved = false;
    GrammarModule.lastScore = 0;
    GrammarModule.lastTotal = 1;
    GrammarModule.lastUnanswered = 0;
  `, sandbox);

  sandbox.refreshLessonLanguage();
  check("sau khi chấm: nhãn sai đúng tiếng Việt", verdict.textContent.includes("Chưa đúng"));
  check("sau khi chấm: banner có kết quả", banner.innerHTML.includes("0 / 1"));
  check("sau khi chấm: nút lưu đúng nhãn", finishBtn.textContent === "Lưu kết quả & Hoàn thành ✓");

  sandbox.I18N.setLang("en");
  check("setLang('en') không đổi ngôn ngữ bài học", sandbox.I18N.getLang() === "vi");
  sandbox.refreshLessonLanguage();
  check("nhãn vẫn tiếng Việt sau khi thử đổi", verdict.textContent.includes("Chưa đúng"));
  sandbox.I18N.setLang("vi");
}

/* ------------------------------------------- storage: xếp trình độ */

{
  const doc = { querySelectorAll: () => [], documentElement: makeElement("html"), addEventListener() {} };
  const { sandbox } = makeSandbox(doc);
  runInContext(read("js/storage.js"), sandbox);

  check("xếp loại 4/12 → starting", sandbox.getPlacementBand(4, 12) === "starting");
  check("xếp loại 6/12 → learning", sandbox.getPlacementBand(6, 12) === "learning");
  check("xếp loại 10/12 → strong", sandbox.getPlacementBand(10, 12) === "strong");

  const saved = sandbox.savePlacementResult({ score: 10, total: 12, band: "strong" });
  check("lưu kết quả xếp trình độ",
    saved.score === 10 && saved.total === 12 && saved.band === "strong" && Boolean(saved.date));
  check("đọc lại kết quả xếp trình độ", sandbox.getPlacementResult().score === 10);

  // SM-2: lịch ôn tăng dần khi đúng, reset khi sai
  sandbox.recordVocabularyResult("w1", true);
  let srs = sandbox.getStorageData().vocabularyProgress.w1;
  check("SM-2 lần đúng 1 → 1 ngày", srs.interval === 1 && srs.repetitions === 1);
  check("SM-2 có ngày đến hạn", Boolean(srs.dueDate));

  sandbox.recordVocabularyResult("w1", true);
  srs = sandbox.getStorageData().vocabularyProgress.w1;
  check("SM-2 lần đúng 2 → 3 ngày", srs.interval === 3);

  sandbox.recordVocabularyResult("w1", true);
  srs = sandbox.getStorageData().vocabularyProgress.w1;
  check("SM-2 lần đúng 3 → 8 ngày", srs.interval === 8, String(srs.interval));

  sandbox.recordVocabularyResult("w1", false);
  srs = sandbox.getStorageData().vocabularyProgress.w1;
  check("SM-2 sai → quay về 1 ngày", srs.interval === 1 && srs.repetitions === 0);
  check("SM-2 sai → giảm ease", srs.ease < 2.8, String(srs.ease));

  check("từ vừa ôn hôm nay không còn đến hạn",
    sandbox.getWordsToReview([{ id: "w1" }]).length === 0);
  check("từ mới vẫn nằm trong danh sách ôn",
    sandbox.getWordsToReview([{ id: "w-new" }]).length === 1);

  // Sổ tay lỗi sai: ghi → đánh dấu → xoá
  sandbox.recordLessonResult("a1-sein-haben", 1, 2, [{
    questionId: "q1", topic: "sein-haben", questionText: "Ich ___ Student.",
    userAnswer: "bist", correctAnswer: "bin", explanation: "ich đi với bin"
  }]);
  check("ghi lỗi sai khi làm bài", sandbox.getMistakes().length === 1);

  const mistakeId = sandbox.getMistakes()[0].id;
  check("đánh dấu đã hiểu", sandbox.markMistakeUnderstood(mistakeId) &&
    sandbox.getMistakes()[0].understood === true);
  check("xoá lỗi đã hiểu", sandbox.clearUnderstoodMistakes() === 1 &&
    sandbox.getMistakes().length === 0);
}

/* ------------------------------------------------ study-plan: lộ trình */

{
  const doc = { querySelectorAll: () => [], documentElement: makeElement("html"), addEventListener() {} };
  const { sandbox } = makeSandbox(doc);
  runInContext(read("js/i18n.js"), sandbox);
  runInContext(read("js/grammar-data.js"), sandbox);
  runInContext(read("js/storage.js"), sandbox);
  runInContext(read("js/study-plan.js"), sandbox);

  let plan = sandbox.getStudyPlanData();
  check("lộ trình: bài đầu là sein-haben", plan.next && plan.next.id === "a1-sein-haben");
  check("lộ trình: hiện 5 bài kế tiếp", plan.upcoming.length === 5);
  check("lộ trình: chưa hoàn thành bài nào", plan.done === 0 && plan.total === 7);

  const data = sandbox.getStorageData();
  data.lessonProgress["a1-sein-haben"] = { attempts: 1, total: 5, bestScore: 4, score: 4 };
  data.lessonProgress["a1-regular-verbs"] = { attempts: 1, total: 5, bestScore: 3, score: 3 };
  data.vocabularyProgress["v-a1-001"] = { status: "learning", dueDate: "2020-01-01" };
  sandbox.saveStorageData(data);

  plan = sandbox.getStudyPlanData();
  check("lộ trình: bài tiếp theo là articles",
    plan.next && plan.next.id === "a1-articles-gender", plan.next && plan.next.id);
  check("lộ trình: đếm đúng từ đến hạn", plan.dueCount === 1, String(plan.dueCount));
  check("lộ trình: đếm đúng bài đã xong", plan.done === 2, String(plan.done));
}

/* ------------------------------------------- game: dựng lượt chơi */

{
  const doc = { querySelectorAll: () => [], documentElement: makeElement("html"), addEventListener() {} };
  const { sandbox } = makeSandbox(doc);
  runInContext(read("js/i18n.js"), sandbox);
  runInContext(read("js/error-detective.js"), sandbox);

  const mistakes = [1, 2, 3, 4, 5, 6].map((i) => ({
    id: "m" + i,
    questionText: `Ich ___ ${i}.`,
    userAnswer: "falsch",
    correctAnswer: "richtig",
    explanation: "giải thích"
  }));

  const rounds = sandbox.buildDetectiveRounds(mistakes, 5);
  check("game: tối đa 5 lượt", rounds.length === 5, String(rounds.length));
  check("game: xen kẽ đúng/sai", rounds.every((r, i) => r.isTrue === (i % 2 === 0)));
  check("game: lượt đúng dùng đáp án đúng", rounds[0].sentence.includes("richtig"));
  check("game: lượt sai dùng đáp án của người học", rounds[1].sentence.includes("falsch"));
  check("game: giữ giải thích", rounds[0].explanation === "giải thích");
}

console.log(failures === 0 ? "\nALL PASS" : `\n${failures} FAILED`);
process.exit(failures === 0 ? 0 : 1);
