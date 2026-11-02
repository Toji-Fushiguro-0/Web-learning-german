// js/data-validator.js
// Module kiểm tra tính hợp lệ của dữ liệu JSON trước khi đưa vào giao diện
// Giúp phát hiện sớm dữ liệu sai, thiếu field, ID trùng lặp

/**
 * Kiểm tra dữ liệu ngữ pháp (grammar.json)
 * Trả về { valid: bool, errors: string[], warnings: string[] }
 */
function validateGrammarData(data) {
  const errors = [];
  const warnings = [];

  // Kiểm tra cấu trúc cơ bản
  if (!data || typeof data !== "object") {
    return { valid: false, errors: ["Dữ liệu không phải object hợp lệ"], warnings: [] };
  }

  if (!Array.isArray(data.questions)) {
    errors.push("Thiếu trường 'questions' hoặc không phải mảng");
    return { valid: false, errors, warnings };
  }

  // Tập hợp để kiểm tra ID trùng lặp
  const seenIds = new Set();

  data.questions.forEach((q, index) => {
    const prefix = `[Câu ${index + 1}]`;

    // Kiểm tra các trường bắt buộc
    if (!q.id) {
      errors.push(`${prefix} Thiếu trường 'id'`);
    } else if (seenIds.has(q.id)) {
      errors.push(`${prefix} ID '${q.id}' bị trùng lặp`);
    } else {
      seenIds.add(q.id);
    }

    if (!q.question || q.question.trim() === "") {
      errors.push(`${prefix} id=${q.id || "?"} — Thiếu nội dung câu hỏi`);
    }

    if (!Array.isArray(q.options) || q.options.length < 2) {
      errors.push(`${prefix} id=${q.id || "?"} — 'options' phải có ít nhất 2 phần tử`);
    } else {
      // Kiểm tra correctIndex hợp lệ
      if (typeof q.correctIndex !== "number") {
        errors.push(`${prefix} id=${q.id || "?"} — 'correctIndex' phải là số`);
      } else if (q.correctIndex < 0 || q.correctIndex >= q.options.length) {
        errors.push(`${prefix} id=${q.id || "?"} — 'correctIndex' = ${q.correctIndex} nằm ngoài phạm vi options (0-${q.options.length - 1})`);
      }

      // Kiểm tra options không rỗng
      q.options.forEach((opt, i) => {
        if (!opt || String(opt).trim() === "") {
          errors.push(`${prefix} id=${q.id || "?"} — options[${i}] rỗng`);
        }
      });
    }

    if (!q.explanation || q.explanation.trim() === "") {
      warnings.push(`${prefix} id=${q.id || "?"} — Thiếu 'explanation' (giải thích)`);
    }

    if (!q.topic) {
      warnings.push(`${prefix} id=${q.id || "?"} — Thiếu 'topic'`);
    }

    if (!q.level) {
      warnings.push(`${prefix} id=${q.id || "?"} — Thiếu 'level'`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    stats: {
      total: data.questions.length,
      byTopic: groupBy(data.questions, "topic"),
      byLevel: groupBy(data.questions, "level")
    }
  };
}

/**
 * Kiểm tra dữ liệu từ vựng (vocabulary.json)
 */
function validateVocabularyData(data) {
  const errors = [];
  const warnings = [];

  if (!data || !Array.isArray(data.words)) {
    return { valid: false, errors: ["Thiếu trường 'words' hoặc không phải mảng"], warnings: [] };
  }

  const seenIds = new Set();

  data.words.forEach((w, index) => {
    const prefix = `[Từ ${index + 1}]`;

    if (!w.id) {
      errors.push(`${prefix} Thiếu 'id'`);
    } else if (seenIds.has(w.id)) {
      errors.push(`${prefix} ID '${w.id}' trùng lặp`);
    } else {
      seenIds.add(w.id);
    }

    if (!w.word || w.word.trim() === "") {
      errors.push(`${prefix} id=${w.id || "?"} — Thiếu 'word'`);
    }

    if (!w.meaning || w.meaning.trim() === "") {
      errors.push(`${prefix} id=${w.id || "?"} — Thiếu 'meaning' (nghĩa tiếng Việt)`);
    }

    // Kiểm tra logic: danh từ phải có article
    if (w.wordType === "noun" && !w.article) {
      warnings.push(`${prefix} id=${w.id || "?"} — Danh từ '${w.word}' không có 'article'`);
    }

    // Kiểm tra article không áp dụng cho động từ/tính từ
    if ((w.wordType === "verb" || w.wordType === "adjective") && w.article) {
      warnings.push(`${prefix} id=${w.id || "?"} — ${w.wordType} '${w.word}' không cần 'article'`);
    }

    if (!w.exampleDE) {
      warnings.push(`${prefix} id=${w.id || "?"} — Thiếu câu ví dụ tiếng Đức`);
    }

    if (!w.theme) {
      warnings.push(`${prefix} id=${w.id || "?"} — Thiếu 'theme'`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    stats: {
      total: data.words.length,
      byTheme: groupBy(data.words, "theme"),
      byType: groupBy(data.words, "wordType")
    }
  };
}

/**
 * Helper: nhóm mảng theo field
 * Ví dụ groupBy([{topic:"sein"}, {topic:"sein"}, {topic:"articles"}], "topic")
 *   → { "sein": 2, "articles": 1 }
 */
function groupBy(arr, field) {
  return arr.reduce((acc, item) => {
    const key = item[field] || "unknown";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

/**
 * In báo cáo validation ra console trình duyệt
 * Mở F12 → Console để xem
 */
function printValidationReport(name, result) {
  if (result.valid) {
    console.log(`%c✅ [Validator] ${name}: HỢP LỆ (${result.stats?.total || 0} items)`, "color: green; font-weight: bold");
  } else {
    console.error(`❌ [Validator] ${name}: CÓ LỖI`);
  }

  if (result.errors && result.errors.length > 0) {
    console.group("  Lỗi nghiêm trọng:");
    result.errors.forEach(e => console.error("  ✗", e));
    console.groupEnd();
  }

  if (result.warnings && result.warnings.length > 0) {
    console.group("  Cảnh báo:");
    result.warnings.forEach(w => console.warn("  ⚠️", w));
    console.groupEnd();
  }

  if (result.stats) {
    console.log("  Thống kê:", result.stats);
  }
}
