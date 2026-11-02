// D:\deutsch-lernwelt\js\run-tests.js
// Script kiểm thử tự động — Chạy trong console trình duyệt (F12)
// Dán toàn bộ đoạn này vào Console của DevTools rồi nhấn Enter

(async function runAllTests() {
  const results = [];
  let pass = 0, fail = 0;

  function test(name, fn) {
    try {
      const result = fn();
      if (result === true || result === undefined) {
        console.log(`%c  ✅ PASS: ${name}`, "color: green");
        results.push({ name, status: "PASS" });
        pass++;
      } else {
        console.error(`  ❌ FAIL: ${name} →`, result);
        results.push({ name, status: "FAIL", detail: result });
        fail++;
      }
    } catch (err) {
      console.error(`  💥 ERROR: ${name} →`, err.message);
      results.push({ name, status: "ERROR", detail: err.message });
      fail++;
    }
  }

  async function testAsync(name, fn) {
    try {
      const result = await fn();
      if (result === true || result === undefined) {
        console.log(`%c  ✅ PASS: ${name}`, "color: green");
        results.push({ name, status: "PASS" });
        pass++;
      } else {
        console.error(`  ❌ FAIL: ${name} →`, result);
        results.push({ name, status: "FAIL", detail: result });
        fail++;
      }
    } catch (err) {
      console.error(`  💥 ERROR: ${name} →`, err.message);
      results.push({ name, status: "ERROR", detail: err.message });
      fail++;
    }
  }

  // ============================================================
  // BẢO VỆ DỮ LIỆU THẬT CỦA NGƯỜI DÙNG
  // Bộ test cần localStorage sạch để kiểm tra chính xác, nhưng tuyệt đối
  // không được để lại hậu quả. Chụp lại toàn bộ dữ liệu ngay từ đầu và
  // khôi phục nguyên vẹn sau mỗi test có thao tác xóa.
  // ============================================================
  const storageSnapshot = localStorage.getItem(STORAGE_KEY);

  function withFreshStorage(fn) {
    try {
      resetAllLearningData();
      return fn();
    } finally {
      if (storageSnapshot === null) localStorage.removeItem(STORAGE_KEY);
      else localStorage.setItem(STORAGE_KEY, storageSnapshot);
    }
  }

  console.group("%c🧪 DEUTSCH LERNWELT — Kiểm thử tự động v2.0", "font-size: 1.1rem; font-weight: bold");

  // ============================================================
  // NHÓM 1: KIỂM TRA GRAMMAR_LESSONS (grammar-data.js)
  // ============================================================
  console.group("📘 Nhóm 1: GRAMMAR_LESSONS");

  test("GRAMMAR_LESSONS là mảng", () => {
    if (!Array.isArray(GRAMMAR_LESSONS)) return "Không phải mảng";
    return true;
  });

  test("GRAMMAR_LESSONS có ít nhất 5 bài", () => {
    if (GRAMMAR_LESSONS.length < 5) return `Chỉ có ${GRAMMAR_LESSONS.length} bài`;
    return true;
  });

  test("Mỗi bài học có id, title, level, topic", () => {
    const missing = GRAMMAR_LESSONS.filter(l => !l.id || !l.title || !l.level || !l.topic);
    if (missing.length > 0) return `${missing.length} bài thiếu trường`;
    return true;
  });

  test("Tất cả ID bài học là duy nhất", () => {
    const ids = GRAMMAR_LESSONS.map(l => l.id);
    const unique = new Set(ids);
    if (unique.size !== ids.length) return `Có ${ids.length - unique.size} ID trùng`;
    return true;
  });

  console.groupEnd();

  // ============================================================
  // NHÓM 2: KIỂM TRA STORAGE (storage.js)
  // ============================================================
  console.group("💾 Nhóm 2: localStorage & Storage functions");

  test("getStorageData() trả về object hợp lệ", () => {
    const data = getStorageData();
    if (typeof data !== "object" || data === null) return "Không phải object";
    return true;
  });

  test("Dữ liệu có các trường bắt buộc", () => {
    const data = getStorageData();
    const required = ["streak", "totalPoints", "coins", "lessonProgress", "vocabularyProgress", "mistakes", "dailyGoal", "coinHistory"];
    const missing = required.filter(f => !(f in data));
    if (missing.length > 0) return `Thiếu: ${missing.join(", ")}`;
    return true;
  });

  test("getTodayString() trả về định dạng YYYY-MM-DD", () => {
    const today = getTodayString();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(today)) return `Định dạng sai: ${today}`;
    return true;
  });

  test("recordLessonResult() cập nhật đúng tiến độ", () => {
    return withFreshStorage(() => {
      recordLessonResult("test-lesson-id", 4, 5, []);
      const data = getStorageData();
      const prog = data.lessonProgress["test-lesson-id"];
      if (!prog) return "lessonProgress không được cập nhật";
      if (prog.score !== 4) return `score sai: ${prog.score} (mong đợi 4)`;
      if (prog.total !== 5) return `total sai: ${prog.total} (mong đợi 5)`;
      if (prog.attempts !== 1) return `attempts sai: ${prog.attempts} (mong đợi 1)`;
      if (data.totalPoints !== 40) return `totalPoints sai: ${data.totalPoints} (mong đợi 40)`;
      return true;
    });
  });

  test("Streak tăng đúng khi học ngày mới", () => {
    return withFreshStorage(() => {
      const data = getStorageData();
      data.streak = 0;
      data.lastActiveDate = null;
      updateStreak(data);
      if (data.streak !== 1) return `streak không tăng lên 1: ${data.streak}`;
      return true;
    });
  });

  // ------------------------------------------------------------
  // NHÓM XU: chỉ học mới mới sinh xu, ôn lỗi sai thì không
  // ------------------------------------------------------------
  test("Ngữ pháp 4/5 câu đúng được 4 xu", () => {
    return withFreshStorage(() => {
      recordLessonResult("coin-test", 4, 5, []);
      const data = getStorageData();
      if (data.coins !== 4) return `coins sai: ${data.coins} (mong đợi 4)`;
      const last = data.sessionHistory[data.sessionHistory.length - 1];
      if (last.coinsEarned !== 4) return `sessionHistory.coinsEarned sai: ${last.coinsEarned}`;
      return true;
    });
  });

  test("Bài đúng 100% được thưởng thêm 5 xu + 10 xu mục tiêu", () => {
    return withFreshStorage(() => {
      recordLessonResult("coin-perfect", 5, 5, []);
      const data = getStorageData();
      // 5 câu đúng + 5 thưởng hoàn hảo + 10 thưởng đạt mục tiêu ngày = 20
      if (data.coins !== 20) return `coins sai: ${data.coins} (mong đợi 20)`;
      return true;
    });
  });

  test("Ôn từ sổ tay lỗi sai KHÔNG kiếm xu", () => {
    return withFreshStorage(() => {
      recordLessonResult("coin-mistakes", 5, 5, [], { source: "mistakes" });
      const data = getStorageData();
      // Không có xu nào — kể cả thưởng mục tiêu ngày
      if (data.coins !== 0) return `coins sai: ${data.coins} (mong đợi 0)`;
      return true;
    });
  });

  test("Từ vựng: nhớ đúng +2 xu, chưa nhớ +0 xu", () => {
    return withFreshStorage(() => {
      const gained = recordVocabularyResult("v-test-1", true);
      const afterCorrect = getStorageData().coins;
      recordVocabularyResult("v-test-2", false);
      const afterWrong = getStorageData().coins;
      if (gained !== 2) return `xu nhận sai: ${gained} (mong đợi 2)`;
      if (afterCorrect !== 2) return `tổng xu sau 1 từ đúng sai: ${afterCorrect}`;
      if (afterWrong !== 2) return `từ chưa nhớ vẫn được xu: ${afterWrong}`;
      return true;
    });
  });

  test("Thưởng mục tiêu ngày chỉ nhận một lần", () => {
    return withFreshStorage(() => {
      for (let i = 0; i < 5; i++) recordVocabularyResult(`v-goal-${i}`, true);
      const afterGoal = getStorageData().coins;   // 5*2 + 10 = 20
      recordVocabularyResult("v-extra", true);    // +2, không lặp thưởng ngày
      const afterExtra = getStorageData().coins;
      if (afterGoal !== 20) return `sau mục tiêu: ${afterGoal} (mong đợi 20)`;
      if (afterExtra !== 22) return `sau câu thêm: ${afterExtra} (mong đợi 22)`;
      return true;
    });
  });

  test("getMistakes() trả về mảng", () => {
    const mistakes = getMistakes();
    if (!Array.isArray(mistakes)) return "Không phải mảng";
    return true;
  });

  test("deepMerge() không xóa dữ liệu hiện có", () => {
    const base = { a: 1, b: { c: 2 } };
    const override = { b: { d: 3 } };
    const merged = deepMerge(base, override);
    if (merged.a !== 1) return "Xóa mất trường 'a'";
    if (merged.b.c !== 2) return "Xóa mất 'b.c'";
    if (merged.b.d !== 3) return "'b.d' không được thêm";
    return true;
  });

  console.groupEnd();

  // ============================================================
  // NHÓM 3: KIỂM TRA DỮ LIỆU JSON (nếu đã tải)
  // ============================================================
  console.group("📄 Nhóm 3: Dữ liệu JSON (grammar.json, vocabulary.json)");

  await testAsync("grammar.json có thể tải được", async () => {
    try {
      const data = await loadGrammarData();
      if (!data || !Array.isArray(data.questions)) return "Cấu trúc sai — thiếu 'questions'";
      return true;
    } catch (e) {
      return `Lỗi tải: ${e.message} (Cần chạy qua localhost)`;
    }
  });

  await testAsync("grammar.json: tất cả câu có correctIndex hợp lệ", async () => {
    try {
      const data = await loadGrammarData();
      const invalid = data.questions.filter(q =>
        typeof q.correctIndex !== "number" ||
        q.correctIndex < 0 ||
        q.correctIndex >= (q.options || []).length
      );
      if (invalid.length > 0) return `${invalid.length} câu có correctIndex sai: ${invalid.map(q=>q.id).join(", ")}`;
      return true;
    } catch { return "Bỏ qua — không tải được file"; }
  });

  await testAsync("grammar.json: không có ID trùng lặp", async () => {
    try {
      const data = await loadGrammarData();
      const ids = data.questions.map(q => q.id);
      const unique = new Set(ids);
      if (unique.size !== ids.length) return `Có ${ids.length - unique.size} ID trùng`;
      return true;
    } catch { return "Bỏ qua — không tải được file"; }
  });

  await testAsync("grammar.json: 30 câu hỏi đúng số lượng", async () => {
    try {
      const data = await loadGrammarData();
      if (data.questions.length < 30) return `Chỉ có ${data.questions.length}/30 câu`;
      return true;
    } catch { return "Bỏ qua — không tải được file"; }
  });

  await testAsync("Mọi topic trong grammar.json đều có bài học tương ứng", async () => {
    try {
      const data = await loadGrammarData();
      const lessonTopics = new Set(GRAMMAR_LESSONS.map(l => l.questionTopic).filter(Boolean));
      const orphans = [...new Set(data.questions.map(q => q.topic))].filter(t => !lessonTopics.has(t));
      if (orphans.length > 0) {
        const count = data.questions.filter(q => orphans.includes(q.topic)).length;
        return `${count} câu thuộc topic chưa có bài học: ${orphans.join(", ")}`;
      }
      return true;
    } catch { return "Bỏ qua — không tải được file"; }
  });

  await testAsync("vocabulary.json có thể tải được", async () => {
    try {
      const data = await loadVocabularyData();
      if (!data || !Array.isArray(data.words)) return "Cấu trúc sai — thiếu 'words'";
      return true;
    } catch (e) {
      return `Lỗi tải: ${e.message} (Cần chạy qua localhost)`;
    }
  });

  await testAsync("vocabulary.json: 50 từ đúng số lượng", async () => {
    try {
      const data = await loadVocabularyData();
      if (data.words.length < 50) return `Chỉ có ${data.words.length}/50 từ`;
      return true;
    } catch { return "Bỏ qua — không tải được file"; }
  });

  await testAsync("vocabulary.json: danh từ đều có article", async () => {
    try {
      const data = await loadVocabularyData();
      const nouns = data.words.filter(w => w.wordType === "noun" && !w.article);
      if (nouns.length > 0) return `${nouns.length} danh từ không có article: ${nouns.map(w=>w.word).join(", ")}`;
      return true;
    } catch { return "Bỏ qua — không tải được file"; }
  });

  console.groupEnd();

  // ============================================================
  // NHÓM 4: KIỂM TRA DOM VÀ CÁC HÀM TOÀN CỤC
  // ============================================================
  console.group("🌐 Nhóm 4: DOM và hàm toàn cục");

  test("Phần tử DOM quan trọng tồn tại", () => {
    const required = [
      "view-dashboard", "view-grammar", "view-lesson-detail", "view-vocabulary",
      "grammar-cards-container", "exercises-container", "vocab-container",
      "header-streak-count", "header-points-count", "header-coins-count",
      "dash-coins-count", "page-title",
      "btn-theme-toggle", "theme-toggle-icon",
      "btn-check-answers", "btn-finish-lesson", "tab-btn-theory", "tab-btn-practice"
    ];
    const missing = required.filter(id => !document.getElementById(id));
    if (missing.length > 0) return `Thiếu element: ${missing.join(", ")}`;
    return true;
  });

  test("Các hàm toàn cục được định nghĩa", () => {
    const required = [
      "getStorageData", "saveStorageData", "recordLessonResult", "resetAllLearningData",
      "getCoinBalance", "awardCoins",
      "validateGrammarData", "validateVocabularyData", "loadGrammarData",
      "renderGrammarList", "openGrammarLesson", "handleCheckAnswers",
      "initVocabularyModule", "showToastMessage", "switchToView"
    ];
    const missing = required.filter(fn => typeof window[fn] !== "function");
    if (missing.length > 0) return `Thiếu hàm: ${missing.join(", ")}`;
    return true;
  });

  test("renderGrammarList() tạo đúng số thẻ bài học", () => {
    renderGrammarList("A1");
    const cards = document.querySelectorAll("#grammar-cards-container .grammar-card");
    const expected = GRAMMAR_LESSONS.filter(l => l.level === "A1").length;
    if (cards.length !== expected) {
      return `Tạo ${cards.length} thẻ, mong đợi ${expected}`;
    }
    return true;
  });

  test("Xem trước: mở khóa được các mục đang khóa", () => {
    if (!window.PreviewMode) return "Thiếu PreviewMode";
    if (typeof window.PreviewMode.isEnabled !== "function") return "PreviewMode không có isEnabled";
    if (document.querySelectorAll("[data-preview]").length === 0) return "Không có mục xem trước";
    return true;
  });

  test("Xem trước: có view placeholder", () => {
    if (!document.getElementById("view-placeholder")) return "Thiếu #view-placeholder";
    if (!document.getElementById("btn-preview-toggle")) return "Thiếu nút bật/tắt xem trước";
    return true;
  });

  test("Theme: <html> có data-theme hợp lệ", () => {
    const theme = document.documentElement.getAttribute("data-theme");
    if (theme !== "light" && theme !== "dark") return `data-theme sai: ${theme}`;
    return true;
  });

  test("Theme: nút chuyển đổi có nhãn truy cập", () => {
    const btn = document.getElementById("btn-theme-toggle");
    if (!btn) return "Thiếu nút theme";
    if (!btn.getAttribute("aria-label")) return "Thiếu aria-label";
    return true;
  });

  console.groupEnd();

  // ============================================================
  // KẾT QUẢ TỔNG HỢP
  // ============================================================
  console.groupEnd();

  // Khôi phục lần cuối — phòng trường hợp một test thêm sau này quên withFreshStorage
  if (storageSnapshot === null) localStorage.removeItem(STORAGE_KEY);
  else localStorage.setItem(STORAGE_KEY, storageSnapshot);
  console.log("%c💾 Dữ liệu học tập thật của bạn vẫn nguyên vẹn — bộ test không xóa gì.", "color:#2563eb");

  console.log(`\n%c📊 Kết quả: ${pass} PASS | ${fail} FAIL`, `font-size:1rem;font-weight:bold;color:${fail > 0 ? "orange" : "green"}`);

  if (fail > 0) {
    console.warn("⚠️ Các bài kiểm tra thất bại:", results.filter(r => r.status !== "PASS"));
  } else {
    console.log("%c✅ Tất cả bài kiểm tra đều PASS!", "color: green; font-size: 1rem;");
  }

  return results;
})();
