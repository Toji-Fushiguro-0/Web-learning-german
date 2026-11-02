// tests/i18n.test.mjs — kiểm tra bộ chuỗi dịch giao diện (vi/en)
// Chạy: node tests/i18n.test.mjs

import fs from "node:fs";
import path from "node:path";
import { createContext, runInContext } from "node:vm";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");

let failures = 0;
function check(name, condition, detail) {
  if (condition) console.log("PASS  " + name);
  else {
    failures++;
    console.log("FAIL  " + name + (detail ? " → " + detail : ""));
  }
}

const sandbox = {
  console: { log() {}, warn() {}, error() {} },
  localStorage: { getItem: () => null, setItem() {}, removeItem() {} },
  CustomEvent: class { constructor(type, init) { this.type = type; this.detail = init && init.detail; } },
  dispatchEvent() { return true; },
  document: { querySelectorAll: () => [], documentElement: { lang: "" } },
  window: null,
};
sandbox.window = sandbox;
createContext(sandbox);
runInContext(read("js/i18n.js") + "\nglobalThis.__DICT_PROBE = (k) => t(k);", sandbox);

check("i18n.js gắn I18N vào window", typeof sandbox.I18N === "object");
check("i18n.js gắn t() vào window", typeof sandbox.t === "function");
check("Ngôn ngữ mặc định là vi", sandbox.I18N.getLang() === "vi");

check("t() trả tiếng Việt mặc định", sandbox.I18N.t("nav.dashboard") === "Tổng quan");
check("Tham số {n} được thay", sandbox.I18N.t("dash.streakValue", { n: 3 }) === "3 ngày");

check("Chỉ hỗ trợ tiếng Việt (giữ Đức cho nội dung)",
  sandbox.I18N.SUPPORTED.length === 1 && sandbox.I18N.SUPPORTED[0] === "vi",
  sandbox.I18N.SUPPORTED.join(","));

sandbox.I18N.setLang("en");
check("setLang('en') bị từ chối, vẫn là vi", sandbox.I18N.getLang() === "vi");

check("Trang xem trước tiếng Việt đúng",
  sandbox.I18N.t("preview.hoeren.title") === "Luyện nghe (Hören)");
check("setLang bỏ qua ngôn ngữ không hỗ trợ", (sandbox.I18N.setLang("fr"), sandbox.I18N.getLang() === "vi"));

/* -------------------------------------- mọi khoá dùng trong code đều tồn tại */

const dictSource = read("js/i18n.js");
const definedKeys = new Set(
  [...dictSource.matchAll(/^\s{4}"([A-Za-z0-9.]+)":\s*\{\s*vi:/gm)].map((m) => m[1])
);
check("Từ điển có ít nhất 100 khoá", definedKeys.size >= 100, String(definedKeys.size));

const usedKeys = new Set();
const files = ["index.html", ...fs.readdirSync(path.join(ROOT, "js")).map((f) => "js/" + f)];

for (const file of files) {
  const content = read(file);
  for (const m of content.matchAll(/data-i18n(?:-title|-aria-label|-placeholder|-html)?="([^"]+)"/g)) {
    usedKeys.add(m[1]);
  }
  for (const m of content.matchAll(/\bt\("([A-Za-z0-9.]+)"/g)) {
    // Bỏ qua khoá dựng động dạng "plan.state." + biến
    if (!m[1].endsWith(".")) usedKeys.add(m[1]);
  }
  // Khoá dạng chuỗi trong dữ liệu (vd: preview.hoeren.title) hoặc dựng động
  for (const m of content.matchAll(/"((?:preview|cloud|nav|dash|header|sidebar|badge|unit|title|lesson|theme|toast|confirm|grammar|vocab)\.[A-Za-z0-9.]+)"/g)) {
    usedKeys.add(m[1]);
  }
  // Khoá dựng động: t(`cloud.status.${status}`)
  if (content.includes("t(`cloud.status.")) {
    for (const s of ["off", "idle", "syncing", "synced", "offline", "error"]) {
      usedKeys.add("cloud.status." + s);
    }
  }
  if (content.includes('t("plan.state."')) {
    for (const s of ["available", "open", "locked"]) {
      usedKeys.add("plan.state." + s);
    }
  }
}

const missing = [...usedKeys].filter((key) => !definedKeys.has(key));
check("Mọi khoá được dùng trong HTML/JS đều có trong từ điển", missing.length === 0, missing.join(", "));

/* ------------------------------------ mỗi khoá phải có đủ vi và en, không rỗng */

const entries = [...dictSource.matchAll(/^\s{4}"([A-Za-z0-9.]+)":\s*\{\s*vi:\s*"((?:[^"\\]|\\.)*)",\s*en:\s*"((?:[^"\\]|\\.)*)"\s*\}/gm)];
check("Đọc được toàn bộ entry của từ điển", entries.length === definedKeys.size,
  `${entries.length}/${definedKeys.size}`);

const missingEnglish = entries.filter(([, , en]) => en.trim().length === 0).map(([key]) => key);
check("Không có bản dịch tiếng Anh rỗng", missingEnglish.length === 0, missingEnglish.join(", "));

const missingVi = entries.filter(([, vi]) => vi.trim().length === 0).map(([key]) => key);
check("Không có chuỗi tiếng Việt rỗng", missingVi.length === 0, missingVi.join(", "));

/* ------------------------------------ HTML phải nạp i18n.js trước các module */

const html = read("index.html");
check("index.html nạp js/i18n.js", html.includes('src="js/i18n.js"'));
check("i18n.js nạp trước app.js",
  html.indexOf('src="js/i18n.js"') < html.indexOf('src="js/app.js"'));
check("Không còn nút đổi ngôn ngữ (giữ cố định Việt + Đức)", !html.includes('id="btn-lang"'));

console.log(failures === 0 ? "\nALL PASS" : `\n${failures} FAILED`);
process.exit(failures === 0 ? 0 : 1);
