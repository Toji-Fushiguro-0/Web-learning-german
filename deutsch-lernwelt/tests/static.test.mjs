// tests/static.test.mjs — kiểm tra tính nhất quán giữa HTML / JS / CSS (không cần trình duyệt)
// Chạy: node tests/static.test.mjs

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

const html = read("index.html");
const jsFiles = fs.readdirSync(path.join(ROOT, "js")).filter((f) => f.endsWith(".js")).sort();
const allJs = jsFiles.map((f) => read(path.join("js", f))).join("\n");

/* --------------------------------------------------- script được nạp đầy đủ */

const scriptSrcs = [...html.matchAll(/<script src="js\/([\w.-]+)"/g)].map((m) => m[1]);
// run-tests.js là file dán tay vào Console, không nạp cùng trang
const manualScripts = new Set(["run-tests.js"]);
const missingScripts = jsFiles.filter((f) => !manualScripts.has(f) && !scriptSrcs.includes(f));
check("Mọi file trong js/ đều được nạp trong index.html", missingScripts.length === 0, missingScripts.join(", "));

const order = ["storage.js", "grammar-data.js", "grammar.js", "sync-core.js", "cloud-sync.js", "preview.js", "app.js"];
const positions = order.map((f) => scriptSrcs.indexOf(f));
check("Thứ tự nạp script quan trọng vẫn đúng",
  positions.every((p) => p >= 0) && positions.every((p, i) => i === 0 || p > positions[i - 1]),
  positions.join(","));

/* --------------------------------------------------- id được tham chiếu tồn tại */

const htmlIds = new Set([...html.matchAll(/id="([^"]+)"/g)].map((m) => m[1]));
const dynamicIds = new Set([
  // Tạo bằng innerHTML trong lúc chạy
  "btn-jump-to-practice",
  "btn-restart-flashcard",
  "vocab-content-area",
  "vocab-search-input",
  "btn-mode-flashcard",
  "btn-mode-list",
  "btn-mode-review",
  "flashcard-main",
  "btn-fc-correct",
  "btn-fc-wrong",
  "btn-fc-prev",
  "btn-fc-next",
  "placement-result",
  "btn-placement-submit",
  "btn-placement-retake",
  "btn-placement-go",
  "detective-feedback"
]);
const missingIds = [];

for (const file of jsFiles) {
  const code = read(path.join("js", file));
  for (const match of code.matchAll(/getElementById\("([^"]+)"\)/g)) {
    const id = match[1];
    if (!htmlIds.has(id) && !dynamicIds.has(id)) missingIds.push(`${file}: #${id}`);
  }
}

check("Mọi getElementById() trỏ tới id có thật", missingIds.length === 0, missingIds.join(", "));

/* --------------------------------------------------------- mục xem trước */

const previewKeys = [...html.matchAll(/data-preview="([^"]+)"/g)].map((m) => m[1]);
const previewSrc = read("js/preview.js");
const featureKeys = [...previewSrc.matchAll(/^ {4}(\w+): \{/gm)].map((m) => m[1]);

check("Có đủ 4 mục xem trước trong menu", previewKeys.length === 4, previewKeys.join(", "));
check("Mỗi mục xem trước có nội dung tương ứng",
  previewKeys.every((k) => featureKeys.includes(k)),
  `thiếu: ${previewKeys.filter((k) => !featureKeys.includes(k)).join(", ")}`);

/* ------------------------------------------------------------- cấu trúc HTML */

const viewIds = [...html.matchAll(/<section class="view-section[^"]*" id="view-([\w-]+)"/g)].map((m) => m[1]);
check("Có 7 view (dashboard, placement, grammar, lesson-detail, vocabulary, mistakes, placeholder)",
  viewIds.length === 7 && viewIds.includes("mistakes") && viewIds.includes("placeholder"),
  viewIds.join(", "));

check("Có nút bật/tắt xem trước", html.includes('id="btn-preview-toggle"'));
check("Có nút đồng bộ cloud", html.includes('id="btn-cloud"'));
check("Có modal đồng bộ cloud", html.includes('id="cloud-modal"'));

/* ------------------------------------------------------------------- CSS */

const css = read("css/style.css");
const noComments = css.replace(/\/\*[\s\S]*?\*\//g, "");
const open = (noComments.match(/\{/g) || []).length;
const close = (noComments.match(/\}/g) || []).length;
check("CSS cân bằng ngoặc", open === close, `${open} mở / ${close} đóng`);

const definedVars = new Set([...css.matchAll(/(--[a-z0-9-]+)\s*:/gi)].map((m) => m[1]));
const usedVars = new Set([...css.matchAll(/var\((--[a-z0-9-]+)/gi)].map((m) => m[1]));
const undefinedVars = [...usedVars].filter((v) => !definedVars.has(v));
check("Mọi biến CSS var(--x) đều được định nghĩa", undefinedVars.length === 0, undefinedVars.join(", "));

check("Có khối dark mode", (css.match(/\[data-theme="dark"\]/g) || []).length > 25);
check("Có style cho chế độ xem trước", css.includes(".preview-card") && css.includes(".btn-preview-toggle"));

/* --------------------------------------------------- hàm trùng tên toàn cục */

const functionOwners = {};
for (const file of jsFiles) {
  const code = read(path.join("js", file));
  for (const match of code.matchAll(/^function (\w+)\(/gm)) {
    const name = match[1];
    (functionOwners[name] = functionOwners[name] || []).push(file);
  }
}
const duplicates = Object.entries(functionOwners).filter(([, owners]) => owners.length > 1);
check("Không còn hàm toàn cục trùng tên", duplicates.length === 0,
  duplicates.map(([n, o]) => `${n}: ${o.join("/")}`).join(", "));

/* -------------------------------------------- biến toàn cục được gán window */

const windowAssigned = new Set([...allJs.matchAll(/window\.(\w+)\s*=/g)].map((m) => m[1]));
check("SyncCore được gắn vào window", windowAssigned.has("SyncCore"));
check("PreviewMode được gắn vào window", windowAssigned.has("PreviewMode"));
check("CloudSync được gắn vào window", windowAssigned.has("CloudSync"));

/* ------------------------------------------------ dữ liệu nhúng cho file:// */

const embeddedPos = html.indexOf('src="data/embedded-data.js"');
const loaderPos = html.indexOf('src="js/data-loader.js"');
check("Nạp dữ liệu nhúng trước data-loader", embeddedPos >= 0 && embeddedPos < loaderPos,
  `${embeddedPos} / ${loaderPos}`);

const dataSandbox = { console: { log() {}, warn() {}, error() {} } };
dataSandbox.window = dataSandbox;
createContext(dataSandbox);
runInContext(read("data/embedded-data.js"), dataSandbox);

const grammarJson = JSON.parse(read("data/grammar.json"));
const vocabJson = JSON.parse(read("data/vocabulary.json"));

check("Dữ liệu nhúng khớp grammar.json",
  JSON.stringify(dataSandbox.EMBEDDED_DATA.grammar) === JSON.stringify(grammarJson),
  "chạy lại: npm run build:data");
check("Dữ liệu nhúng khớp vocabulary.json",
  JSON.stringify(dataSandbox.EMBEDDED_DATA.vocabulary) === JSON.stringify(vocabJson),
  "chạy lại: npm run build:data");

const placementJson = JSON.parse(read("data/placement.json"));
check("Dữ liệu nhúng khớp placement.json",
  JSON.stringify(dataSandbox.EMBEDDED_DATA.placement) === JSON.stringify(placementJson),
  "chạy lại: npm run build:data");

// Máy có `fetch` lỗi (file://) phải tự rơi về dữ liệu nhúng
const loaderSandbox = {
  console: { log() {}, warn() {}, error() {} },
  fetch: () => Promise.reject(new TypeError("Failed to fetch")),
};
loaderSandbox.window = loaderSandbox;
loaderSandbox.EMBEDDED_DATA = dataSandbox.EMBEDDED_DATA;
createContext(loaderSandbox);
runInContext(read("js/data-loader.js"), loaderSandbox);

const fallbackData = await runInContext("loadVocabularyData()", loaderSandbox);
check("fetch lỗi → tự dùng dữ liệu nhúng",
  Boolean(fallbackData) && fallbackData.words.length === 50,
  fallbackData ? fallbackData.words.length : "null");
check("Có ghi nhận nguồn dữ liệu là embedded", loaderSandbox.DATA_SOURCE === "embedded");

check("Có start.bat để chạy server", fs.existsSync(path.join(ROOT, "start.bat")));

/* ----------------------------------------------------------------- PWA */

const manifestPath = path.join(ROOT, "manifest.webmanifest");
check("Có manifest.webmanifest", fs.existsSync(manifestPath));

if (fs.existsSync(manifestPath)) {
  const manifest = JSON.parse(read("manifest.webmanifest"));
  check("Manifest có tên và start_url", Boolean(manifest.name) && Boolean(manifest.start_url));
  check("Manifest chạy standalone", manifest.display === "standalone");
  check("Manifest có icon 192 và 512",
    manifest.icons.some(i => i.sizes === "192x192") && manifest.icons.some(i => i.sizes === "512x512"));

  const iconsExist = manifest.icons.every(icon => fs.existsSync(path.join(ROOT, icon.src)));
  check("Các file icon tồn tại", iconsExist);
}

check("index.html liên kết manifest", html.includes('rel="manifest"'));
check("index.html đăng ký service worker", html.includes('navigator.serviceWorker.register("sw.js")'));
check("Đăng ký SW bỏ qua file://", html.includes('location.protocol !== "file:"'));

check("Có sw.js", fs.existsSync(path.join(ROOT, "sw.js")));

if (fs.existsSync(path.join(ROOT, "sw.js"))) {
  const sw = read("sw.js");
  check("SW có CACHE_NAME", /const CACHE_NAME = "/.test(sw));

  const jsOffline = fs.readdirSync(path.join(ROOT, "js"))
    .filter(f => f.endsWith(".js") && f !== "run-tests.js");
  const missingInShell = jsOffline.filter(f => !sw.includes(`./js/${f}`));
  check("SW cache đủ file JS", missingInShell.length === 0, missingInShell.join(", "));

  const dataOffline = ["grammar.json", "vocabulary.json", "placement.json"]
    .filter(f => !sw.includes(`./data/${f}`));
  check("SW cache đủ file dữ liệu", dataOffline.length === 0, dataOffline.join(", "));
}

console.log(failures === 0 ? "\nALL PASS" : `\n${failures} FAILED`);
process.exit(failures === 0 ? 0 : 1);
