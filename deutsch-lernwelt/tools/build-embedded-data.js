#!/usr/bin/env node
// tools/build-embedded-data.js
// Nhúng data/*.json vào data/embedded-data.js để ứng dụng chạy được cả khi
// mở trực tiếp index.html bằng file:// (trình duyệt chặn fetch trên file://).
//
// Chạy lại mỗi khi sửa data/grammar.json hoặc data/vocabulary.json:
//   node tools/build-embedded-data.js    (hoặc: npm run build:data)

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");

function readJson(rel) {
  const full = path.join(ROOT, rel);
  return JSON.parse(fs.readFileSync(full, "utf8"));
}

const grammar = readJson("data/grammar.json");
const vocabulary = readJson("data/vocabulary.json");
const placement = readJson("data/placement.json");

const payload = {
  generatedAt: new Date().toISOString(),
  grammar: grammar,
  vocabulary: vocabulary,
  placement: placement
};

const header = [
  "// data/embedded-data.js — TỰ SINH, ĐỪNG SỬA TAY.",
  "// Nguồn: data/grammar.json + data/vocabulary.json + data/placement.json.",
  "// Sinh lại bằng: npm run build:data",
  "// Dùng làm phương án dự phòng khi fetch() bị chặn (mở file:// trực tiếp).",
  ""
].join("\n");

const body = "window.EMBEDDED_DATA = " + JSON.stringify(payload, null, 2) + ";\n";

const target = path.join(ROOT, "data/embedded-data.js");
fs.writeFileSync(target, header + body, "utf8");

const kb = (Buffer.byteLength(header + body) / 1024).toFixed(1);
console.log(`Đã ghi ${path.relative(ROOT, target)} (${kb} KB)`);
console.log(`  grammar:    ${grammar.questions.length} câu hỏi`);
console.log(`  vocabulary: ${vocabulary.words.length} từ`);
console.log(`  placement:  ${placement.questions.length} câu hỏi`);
