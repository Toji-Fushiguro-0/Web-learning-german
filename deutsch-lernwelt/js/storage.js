// js/storage.js — PHIÊN BẢN 2.0
// Module quản lý lưu trữ dữ liệu học tập bằng localStorage
// Tách biệt rõ: dữ liệu BÀI HỌC MẶC ĐỊNH (trong JSON files) vs dữ liệu CÁ NHÂN (localStorage)

const STORAGE_KEY = "deutsch_lernwelt_user_data_v2";

// Cấu trúc mặc định cho người dùng hoàn toàn mới
// Chỉ chứa dữ liệu CÁ NHÂN — không trộn lẫn với nội dung bài học
const DEFAULT_USER_DATA = {
  _version: 3,                 // Dùng để phát hiện nâng cấp schema
  _updatedAt: null,            // ISO 8601 — mốc so sánh bản local với bản cloud
  userName: "Học viên",
  targetLevel: "A1",
  totalPoints: 0,
  coins: 0,                    // Xu tích lũy — phần thưởng kiểu game
  streak: 0,
  lastActiveDate: null,        // "YYYY-MM-DD"
  dailyGoal: {
    targetQuestions: 5,        // Mục tiêu số câu hỏi mỗi ngày
    goalDate: null,            // Ngày đang tính
    todayCorrect: 0,           // Số câu trả lời ĐÚNG hôm nay (thay vì tổng câu)
    todayAttempted: 0,         // Số câu đã thử hôm nay
    rewardedDate: null         // Ngày đã nhận thưởng xu mục tiêu (tránh nhận 2 lần)
  },
  // Kết quả kiểm tra xếp trình độ gần nhất
  // { score, total, band: "starting"|"learning"|"strong", level: "A1", date: "YYYY-MM-DD" }
  placement: null,
  // Tiến độ theo từng bài học ngữ pháp
  // { "a1-sein-haben": { score: 5, total: 5, attempts: 2, lastAttempt: "2026-10-21", bestScore: 5 } }
  lessonProgress: {},
  // Tiến độ từ vựng
  // { "v-a1-001": { status: "known"|"learning"|"new", lastReviewed: "YYYY-MM-DD", correctCount: 3, wrongCount: 1 } }
  vocabularyProgress: {},
  // Sổ tay lỗi sai — mảng các object lỗi
  // { id, questionId, topic, questionText, userAnswer, correctAnswer, explanation, savedAt, understood: false }
  mistakes: [],
  // Lịch sử phiên làm bài (dùng cho dashboard)
  // [{ date: "YYYY-MM-DD", skill: "grammar"|"vocabulary", correct: 3, attempted: 5, pointsEarned: 30, coinsEarned: 3 }]
  sessionHistory: [],
  // Lịch sử cộng xu gần nhất (giới hạn 100 mục)
  // [{ date: "YYYY-MM-DD", source: "grammar"|"vocabulary"|"daily-goal", amount: 4, note: "" }]
  coinHistory: []
};

// ==========================================================================
// HÀM CƠ BẢN: ĐỌC VÀ GHI LOCALSTORAGE
// ==========================================================================

/**
 * Lấy chuỗi ngày hôm nay theo định dạng YYYY-MM-DD
 * Ví dụ: "2026-10-21"
 */
function getTodayString() {
  const now = new Date();
  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0")
  ].join("-");
}

/**
 * Đọc dữ liệu từ localStorage
 * Có xử lý: dữ liệu hỏng, thiếu trường, phiên bản cũ
 */
function getStorageData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      // Người dùng hoàn toàn mới → khởi tạo dữ liệu mặc định
      const fresh = deepCopy(DEFAULT_USER_DATA);
      saveStorageData(fresh);
      return fresh;
    }

    const parsed = JSON.parse(raw);

    // Merge với DEFAULT để đảm bảo không thiếu trường mới khi nâng cấp
    // deepMerge ưu tiên giá trị đã lưu, chỉ bổ sung trường còn thiếu
    const merged = deepMerge(DEFAULT_USER_DATA, parsed);
    return merged;

  } catch (err) {
    console.error("[Storage] Lỗi đọc localStorage:", err);
    // Dữ liệu hỏng → trả về mặc định (KHÔNG xóa dữ liệu cũ ngay)
    console.warn("[Storage] Trả về dữ liệu mặc định tạm thời.");
    return deepCopy(DEFAULT_USER_DATA);
  }
}

/**
 * Lưu dữ liệu vào localStorage
 */
function saveStorageData(data) {
  try {
    // Mốc thời gian để so sánh bản local với bản cloud (bản nào mới hơn thì thắng)
    if (data && typeof data === "object") {
      data._updatedAt = new Date().toISOString();
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    if (err.name === "QuotaExceededError") {
      console.error("[Storage] localStorage đầy! Hãy xóa bớt lịch sử phiên.");
    } else {
      console.error("[Storage] Lỗi ghi localStorage:", err);
    }
    return false;
  }

  notifyCloudDirty();
  return true;
}

/**
 * Báo cho module đồng bộ biết vừa có thay đổi.
 * Luôn bọc try/catch: lỗi mạng không được làm hỏng việc lưu dữ liệu local.
 */
function notifyCloudDirty() {
  if (typeof window === "undefined") return;
  const sync = window.CloudSync;
  if (!sync || typeof sync.onLocalChange !== "function") return;

  try {
    sync.onLocalChange();
  } catch (err) {
    console.warn("[Storage] Lỗi hook đồng bộ:", err.message);
  }
}

// ==========================================================================
// CẬP NHẬT STREAK VÀ DAILY GOAL
// ==========================================================================

/**
 * Cập nhật chuỗi ngày học liên tiếp (Streak)
 * Gọi hàm này MỘT LẦN mỗi khi người dùng làm bài
 */
function updateStreak(data) {
  const today = getTodayString();
  const last = data.lastActiveDate;

  if (!last) {
    // Lần đầu học
    data.streak = 1;
    data.lastActiveDate = today;
  } else if (last === today) {
    // Đã học hôm nay rồi → không đổi streak
  } else {
    // Tính ngày hôm qua để so sánh
    const yest = new Date();
    yest.setDate(yest.getDate() - 1);
    const yesterdayStr = [
      yest.getFullYear(),
      String(yest.getMonth() + 1).padStart(2, "0"),
      String(yest.getDate()).padStart(2, "0")
    ].join("-");

    if (last === yesterdayStr) {
      data.streak += 1;   // Học liên tục ngày hôm qua
    } else {
      data.streak = 1;    // Bị đứt streak
    }
    data.lastActiveDate = today;
  }

  // Reset chỉ số ngày mới nếu qua ngày
  if (data.dailyGoal.goalDate !== today) {
    data.dailyGoal.goalDate = today;
    data.dailyGoal.todayCorrect = 0;
    data.dailyGoal.todayAttempted = 0;
    data.dailyGoal.rewardedDate = null;   // Ngày mới → được nhận thưởng mục tiêu lại
  }
}

// ==========================================================================
// MODULE XU (COINS) — cơ chế thưởng kiểu game
// ==========================================================================

/**
 * Bảng thưởng xu. Muốn cân bằng lại "game" thì chỉ cần sửa các số ở đây.
 */
const COIN_RULES = {
  grammarPerCorrect: 1,     // mỗi câu ngữ pháp đúng
  grammarPerfectBonus: 5,   // thưởng thêm khi đúng 100% bài
  vocabularyCorrect: 2,     // mỗi lần nhớ đúng một từ
  dailyGoalBonus: 10,       // đạt mục tiêu ngày (1 lần/ngày)
  mistakesReview: 0         // ôn từ sổ tay lỗi sai: KHÔNG thưởng xu
};

/**
 * Tính số xu cho một lượt học.
 * @param {string} source  - "grammar" | "vocabulary" | "mistakes"
 * @param {number} correct - số câu/từ làm đúng
 * @param {number} total   - tổng số câu của lượt
 * @returns {number} số xu
 */
function calculateCoins(source, correct, total) {
  // Ôn lại lỗi sai chỉ để nhớ, không phải học mới → không kiếm xu
  if (source === "mistakes") return COIN_RULES.mistakesReview;

  if (source === "vocabulary") {
    return correct > 0 ? COIN_RULES.vocabularyCorrect : 0;
  }

  // Mặc định là ngữ pháp
  if (!correct || correct <= 0) return 0;
  let coins = correct * COIN_RULES.grammarPerCorrect;
  if (total > 0 && correct >= total) coins += COIN_RULES.grammarPerfectBonus;
  return coins;
}

/**
 * Cộng xu vào một object dữ liệu đã đọc (chưa lưu).
 * @returns {number} số xu thực sự được cộng
 */
function addCoinsToData(data, amount, source, note = "") {
  const value = Math.max(0, Math.floor(Number(amount) || 0));
  if (value === 0) return 0;

  data.coins = (data.coins || 0) + value;
  data.coinHistory = data.coinHistory || [];
  data.coinHistory.push({
    date: getTodayString(),
    source: source || "unknown",
    amount: value,
    note: note
  });
  if (data.coinHistory.length > 100) {
    data.coinHistory = data.coinHistory.slice(-100);
  }
  return value;
}

/**
 * Thưởng xu khi đạt mục tiêu ngày — mỗi ngày đúng MỘT lần.
 * @returns {number} số xu thưởng (0 nếu chưa đạt hoặc đã nhận hôm nay)
 */
function claimDailyGoalBonus(data) {
  const goal = data.dailyGoal;
  const today = getTodayString();
  if (!goal || goal.goalDate !== today) return 0;
  if ((goal.todayCorrect || 0) < (goal.targetQuestions || 5)) return 0;
  if (goal.rewardedDate === today) return 0;

  goal.rewardedDate = today;
  return COIN_RULES.dailyGoalBonus;
}

/** Số xu hiện có */
function getCoinBalance() {
  return getStorageData().coins || 0;
}

/**
 * Cộng xu từ bên ngoài (phần thưởng tương lai, sự kiện...) rồi lưu ngay.
 * @returns {number} số xu đã cộng
 */
function awardCoins(amount, source, note = "") {
  const data = getStorageData();
  const gained = addCoinsToData(data, amount, source, note);
  if (gained > 0) saveStorageData(data);
  return gained;
}

// ==========================================================================
// MODULE NGỮ PHÁP
// ==========================================================================

/**
 * Lưu kết quả một lượt làm bài ngữ pháp
 * 
 * @param {string} lessonId   - ID bài học (vd: "a1-sein-haben")
 * @param {number} correct    - Số câu trả lời đúng
 * @param {number} total      - Tổng số câu
 * @param {Array}  wrongItems - Mảng các câu sai { questionId, questionText, userAnswer, correctAnswer, explanation, topic }
 * @param {object} options    - { source: "grammar" | "mistakes" } — "mistakes" = ôn lại từ sổ tay lỗi sai, không kiếm xu
 * @returns {object} Dữ liệu đã cập nhật (phiên cuối trong sessionHistory có coinsEarned)
 */
function recordLessonResult(lessonId, correct, total, wrongItems = [], options = {}) {
  const data = getStorageData();

  // Nguồn làm bài: học bài mới ("grammar") hay ôn lại lỗi sai ("mistakes")
  const source = options.source || "grammar";

  updateStreak(data);

  // Cộng điểm: mỗi câu đúng = 10 điểm
  const earned = correct * 10;
  data.totalPoints = (data.totalPoints || 0) + earned;

  // Cập nhật daily goal theo câu ĐÚNG (không phải tổng câu)
  data.dailyGoal.todayCorrect = (data.dailyGoal.todayCorrect || 0) + correct;
  data.dailyGoal.todayAttempted = (data.dailyGoal.todayAttempted || 0) + total;

  // Thưởng xu: theo nguồn học + thưởng đạt mục tiêu ngày (mỗi ngày một lần)
  let coinsEarned = calculateCoins(source, correct, total);
  // Ôn từ sổ tay lỗi sai thì không kiếm xu — kể cả thưởng mục tiêu ngày
  if (source !== "mistakes") coinsEarned += claimDailyGoalBonus(data);
  if (coinsEarned > 0) {
    addCoinsToData(data, coinsEarned, source, source === "mistakes" ? "" : `${correct}/${total} câu đúng`);
  }

  // Cập nhật tiến độ bài học
  const existing = data.lessonProgress[lessonId] || { attempts: 0, bestScore: 0 };
  data.lessonProgress[lessonId] = {
    score: correct,
    total: total,
    attempts: existing.attempts + 1,
    bestScore: Math.max(existing.bestScore, correct),  // Giữ điểm cao nhất
    lastAttempt: getTodayString()
  };

  // Lưu lỗi sai vào sổ tay (tránh trùng trong cùng lượt làm)
  const today = getTodayString();
  const newMistakes = wrongItems.map(item => ({
    id: `mistake-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    questionId: item.questionId,
    topic: item.topic || "general",
    lessonId: lessonId,
    questionText: item.questionText,
    userAnswer: item.userAnswer,
    correctAnswer: item.correctAnswer,
    explanation: item.explanation,
    savedAt: today,
    understood: false
  }));

  data.mistakes = [...(data.mistakes || []), ...newMistakes];

  // Lưu vào session history (giới hạn 100 phiên gần nhất)
  data.sessionHistory = data.sessionHistory || [];
  data.sessionHistory.push({
    date: today,
    skill: "grammar",
    lessonId,
    source,
    correct,
    attempted: total,
    pointsEarned: earned,
    coinsEarned
  });
  if (data.sessionHistory.length > 100) {
    data.sessionHistory = data.sessionHistory.slice(-100);
  }

  saveStorageData(data);
  return data;
}

/**
 * Kiểm tra một bài học đã từng hoàn thành chưa
 */
function isLessonCompleted(lessonId) {
  const data = getStorageData();
  const prog = data.lessonProgress && data.lessonProgress[lessonId];
  return Boolean(prog && prog.attempts > 0);
}

/**
 * Lấy tiến độ của một bài học (hoặc null nếu chưa học)
 */
function getLessonProgress(lessonId) {
  const data = getStorageData();
  return (data.lessonProgress && data.lessonProgress[lessonId]) || null;
}

// ==========================================================================
// MODULE XẾP TRÌNH ĐỘ
// ==========================================================================

/**
 * Lưu kết quả kiểm tra xếp trình độ gần nhất.
 * Không cộng điểm/xu — đây là bài đánh giá, không phải bài học.
 * @param {{score: number, total: number, band: string, level?: string}} result
 * @returns {object} bản ghi đã lưu
 */
function savePlacementResult(result) {
  const data = getStorageData();
  const score = Number(result && result.score) || 0;
  const total = Number(result && result.total) || 0;

  data.placement = {
    score: score,
    total: total,
    band: result && result.band ? result.band : "starting",
    level: (result && result.level) || "A1",
    date: getTodayString()
  };

  saveStorageData(data);
  return data.placement;
}

/** Lấy kết quả xếp trình độ gần nhất (hoặc null) */
function getPlacementResult() {
  return getStorageData().placement || null;
}

/** Chia 3 mức dựa trên tỉ lệ đúng */
function getPlacementBand(score, total) {
  if (!total) return "starting";
  const pct = (score / total) * 100;
  if (pct >= 80) return "strong";
  if (pct >= 50) return "learning";
  return "starting";
}

// ==========================================================================
// MODULE TỪ VỰNG
// ==========================================================================

/**
 * Cập nhật tiến độ ôn tập một từ
 * @param {string} wordId   - ID từ vựng
 * @param {boolean} correct - Đúng hay sai
 * @returns {number} số xu nhận được trong lượt này (0 nếu chưa nhớ đúng)
 */
// ==========================================================================
// SM-2 (SPACED REPETITION)
// ==========================================================================

const SRS_DEFAULT_EASE = 2.5;
const SRS_MIN_EASE = 1.3;
const SRS_MAX_EASE = 2.9;

/** Cộng số ngày vào chuỗi YYYY-MM-DD */
function addDaysToDate(dateStr, days) {
  const d = new Date(`${dateStr}T00:00:00`);
  d.setDate(d.getDate() + days);
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0")
  ].join("-");
}

/**
 * Cập nhật lịch ôn theo SM-2 rút gọn.
 * Đúng: lần 1 → 1 ngày, lần 2 → 3 ngày, sau đó interval × ease.
 * Sai: quay về 1 ngày và giảm ease.
 */
function updateSrsSchedule(entry, correct) {
  const ease = Number(entry.ease) || SRS_DEFAULT_EASE;
  const repetitions = Number(entry.repetitions) || 0;
  const interval = Number(entry.interval) || 0;

  if (correct) {
    const reps = repetitions + 1;
    const nextInterval = reps === 1 ? 1 : reps === 2 ? 3 : Math.max(1, Math.round(interval * ease));
    entry.repetitions = reps;
    entry.interval = nextInterval;
    entry.ease = Math.min(SRS_MAX_EASE, Number((ease + 0.1).toFixed(2)));
  } else {
    entry.repetitions = 0;
    entry.interval = 1;
    entry.ease = Math.max(SRS_MIN_EASE, Number((ease - 0.2).toFixed(2)));
  }

  entry.dueDate = addDaysToDate(getTodayString(), entry.interval);
  return entry;
}

function recordVocabularyResult(wordId, correct) {
  const data = getStorageData();
  updateStreak(data);

  const existing = data.vocabularyProgress[wordId] || {
    status: "new",
    correctCount: 0,
    wrongCount: 0,
    lastReviewed: null
  };

  if (correct) {
    existing.correctCount = (existing.correctCount || 0) + 1;
    // Nếu đúng ≥ 3 lần thì coi là "known"
    existing.status = existing.correctCount >= 3 ? "known" : "learning";
    data.dailyGoal.todayCorrect = (data.dailyGoal.todayCorrect || 0) + 1;
  } else {
    existing.wrongCount = (existing.wrongCount || 0) + 1;
    existing.status = "learning";
  }

  existing.lastReviewed = getTodayString();
  updateSrsSchedule(existing, correct);
  data.dailyGoal.todayAttempted = (data.dailyGoal.todayAttempted || 0) + 1;
  data.vocabularyProgress[wordId] = existing;

  // Thưởng xu cho mỗi từ nhớ đúng + thưởng mục tiêu ngày (nếu vừa đạt)
  let coinsEarned = calculateCoins("vocabulary", correct ? 1 : 0, 1);
  coinsEarned += claimDailyGoalBonus(data);
  if (coinsEarned > 0) {
    addCoinsToData(data, coinsEarned, "vocabulary", correct ? "Nhớ đúng một từ" : "");
  }

  saveStorageData(data);
  return coinsEarned;
}

/**
 * Danh sách từ đến hạn ôn hôm nay.
 * Ưu tiên dueDate (SM-2); dữ liệu cũ chưa có lịch thì dùng quy tắc 3 ngày.
 */
function getWordsToReview(allWords) {
  const data = getStorageData();
  const prog = data.vocabularyProgress || {};
  const today = getTodayString();

  return allWords.filter(word => {
    const wp = prog[word.id];
    if (!wp) return true;
    if (wp.dueDate) return wp.dueDate <= today;
    if (!wp.lastReviewed) return true;
    const daysSince = Math.floor((new Date(today) - new Date(wp.lastReviewed)) / 86400000);
    return wp.status !== "known" || daysSince >= 3;
  });
}

// ==========================================================================
// MODULE SỔ TAY LỖI SAI
// ==========================================================================

/**
 * Lấy danh sách lỗi sai (có thể lọc theo topic)
 */
function getMistakes(topic = null) {
  const data = getStorageData();
  const mistakes = data.mistakes || [];
  if (topic) {
    return mistakes.filter(m => m.topic === topic);
  }
  return mistakes;
}

/**
 * Đánh dấu một lỗi đã hiểu
 */
function markMistakeUnderstood(mistakeId) {
  const data = getStorageData();
  const mistake = (data.mistakes || []).find(m => m.id === mistakeId);
  if (mistake) {
    mistake.understood = true;
    saveStorageData(data);
    return true;
  }
  return false;
}

/**
 * Xóa tất cả lỗi đã đánh dấu "hiểu rồi"
 */
function clearUnderstoodMistakes() {
  const data = getStorageData();
  const before = (data.mistakes || []).length;
  data.mistakes = (data.mistakes || []).filter(m => !m.understood);
  saveStorageData(data);
  return before - data.mistakes.length; // Số lỗi đã xóa
}

// ==========================================================================
// TIỆN ÍCH
// ==========================================================================

/**
 * Xóa toàn bộ dữ liệu cá nhân — chỉ dùng để kiểm thử
 * Dữ liệu bài học (JSON files) KHÔNG bị ảnh hưởng
 */
function resetAllLearningData() {
  localStorage.removeItem(STORAGE_KEY);
  console.log("[Storage] Đã xóa toàn bộ dữ liệu cá nhân. Tải lại trang để áp dụng.");
  return deepCopy(DEFAULT_USER_DATA);
}

/**
 * Xuất toàn bộ dữ liệu cá nhân dạng JSON string (để backup)
 */
function exportUserData() {
  const data = getStorageData();
  return JSON.stringify(data, null, 2);
}

/**
 * Tính tổng số từ đã học (status = "known")
 */
function countKnownWords() {
  const data = getStorageData();
  const prog = data.vocabularyProgress || {};
  return Object.values(prog).filter(w => w.status === "known").length;
}

/**
 * Tính tổng số từ đang ôn (status = "learning")
 */
function countLearningWords() {
  const data = getStorageData();
  const prog = data.vocabularyProgress || {};
  return Object.values(prog).filter(w => w.status === "learning").length;
}

// ==========================================================================
// HELPER FUNCTIONS NỘI BỘ
// ==========================================================================

/** Sao chép sâu một object (tránh tham chiếu chung) */
function deepCopy(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Merge sâu: ưu tiên giá trị trong `override`, bổ sung trường từ `base` nếu thiếu
 * Không xóa dữ liệu đã có trong override
 */
function deepMerge(base, override) {
  const result = deepCopy(base);
  for (const key of Object.keys(override)) {
    const current = result[key];
    if (
      override[key] !== null &&
      typeof override[key] === "object" &&
      !Array.isArray(override[key]) &&
      current !== null &&
      typeof current === "object" &&
      !Array.isArray(current)
    ) {
      result[key] = deepMerge(current, override[key]);
    } else {
      result[key] = override[key];
    }
  }
  return result;
}
