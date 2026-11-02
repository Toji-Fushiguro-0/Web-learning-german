// worker/src/repository.mjs
// Chuyển đổi giữa "state" của client và các bảng quan hệ trong D1.
//
// Hợp đồng với client giữ nguyên: client vẫn gửi/nhận nguyên một object state.
// Server chịu trách nhiệm tách state thành các bảng chuẩn hoá và ghép lại khi đọc.

export const DEFAULT_USER_ID = "default";

const MAX_MISTAKES = 5000;
const MAX_HISTORY = 2000;
const BATCH_SIZE = 80;

/* ------------------------------------------------------------------ tiện ích */

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}

function asInt(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
}

function asText(value, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function asNullableText(value) {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function newId() {
  return crypto.randomUUID();
}

export function resolveUserId(env) {
  const id = env && env.USER_ID;
  return typeof id === "string" && id.trim() ? id.trim() : DEFAULT_USER_ID;
}

/* ---------------------------------------------------------------- validation */

/**
 * Kiểm tra cấu trúc state trước khi ghi.
 * @returns {string[]} danh sách lỗi (rỗng = hợp lệ)
 */
export function validateState(state) {
  const errors = [];

  if (!isPlainObject(state)) return ["state phải là object"];

  for (const key of ["totalPoints", "coins", "streak"]) {
    if (state[key] !== undefined && state[key] !== null && !isFiniteNumber(state[key])) {
      errors.push(`${key} phải là số`);
    }
  }

  for (const key of ["lessonProgress", "vocabularyProgress", "dailyGoal"]) {
    if (state[key] !== undefined && state[key] !== null && !isPlainObject(state[key])) {
      errors.push(`${key} phải là object`);
    }
  }

  for (const key of ["mistakes", "sessionHistory", "coinHistory"]) {
    if (state[key] !== undefined && state[key] !== null && !Array.isArray(state[key])) {
      errors.push(`${key} phải là mảng`);
    }
  }

  if (Array.isArray(state.mistakes)) {
    if (state.mistakes.length > MAX_MISTAKES) {
      errors.push(`mistakes vượt quá ${MAX_MISTAKES} phần tử`);
    }
    state.mistakes.forEach((item, index) => {
      if (!isPlainObject(item)) {
        errors.push(`mistakes[${index}] phải là object`);
      } else if (typeof item.id !== "string" || item.id.length === 0) {
        errors.push(`mistakes[${index}].id thiếu`);
      }
    });
  }

  for (const key of ["sessionHistory", "coinHistory"]) {
    if (!Array.isArray(state[key])) continue;
    if (state[key].length > MAX_HISTORY) {
      errors.push(`${key} vượt quá ${MAX_HISTORY} phần tử`);
    }
    state[key].forEach((item, index) => {
      if (!isPlainObject(item)) errors.push(`${key}[${index}] phải là object`);
    });
  }

  return errors;
}

/* ------------------------------------------------------------ state → bảng */

/** Tách state của client thành các nhóm dữ liệu tương ứng bảng */
export function splitState(state) {
  const goal = isPlainObject(state.dailyGoal) ? state.dailyGoal : {};

  const lessons = Object.entries(isPlainObject(state.lessonProgress) ? state.lessonProgress : {})
    .filter(([, value]) => isPlainObject(value))
    .map(([lessonId, value]) => ({
      lessonId,
      score: asInt(value.score),
      total: asInt(value.total),
      attempts: asInt(value.attempts),
      bestScore: asInt(value.bestScore),
      lastAttempt: asNullableText(value.lastAttempt)
    }));

  const vocabulary = Object.entries(isPlainObject(state.vocabularyProgress) ? state.vocabularyProgress : {})
    .filter(([, value]) => isPlainObject(value))
    .map(([wordId, value]) => ({
      wordId,
      status: asText(value.status, "new"),
      correctCount: asInt(value.correctCount),
      wrongCount: asInt(value.wrongCount),
      lastReviewed: asNullableText(value.lastReviewed)
    }));

  const mistakes = (Array.isArray(state.mistakes) ? state.mistakes : [])
    .filter(isPlainObject)
    .map((item) => ({
      id: asText(item.id),
      questionId: asText(item.questionId),
      lessonId: asText(item.lessonId),
      topic: asText(item.topic),
      questionText: asText(item.questionText),
      userAnswer: asText(item.userAnswer),
      correctAnswer: asText(item.correctAnswer),
      explanation: asText(item.explanation),
      savedAt: asNullableText(item.savedAt),
      understood: item.understood ? 1 : 0
    }));

  const sessions = (Array.isArray(state.sessionHistory) ? state.sessionHistory : [])
    .filter(isPlainObject)
    .map((item, index) => ({
      id: newId(),
      position: index,
      date: asText(item.date),
      skill: asText(item.skill),
      lessonId: asText(item.lessonId),
      source: asText(item.source),
      correct: asInt(item.correct),
      attempted: asInt(item.attempted),
      pointsEarned: asInt(item.pointsEarned),
      coinsEarned: asInt(item.coinsEarned)
    }));

  const coins = (Array.isArray(state.coinHistory) ? state.coinHistory : [])
    .filter(isPlainObject)
    .map((item, index) => ({
      id: newId(),
      position: index,
      date: asText(item.date),
      source: asText(item.source),
      amount: asInt(item.amount),
      note: asText(item.note)
    }));

  return {
    user: {
      displayName: asText(state.userName, "Học viên"),
      targetLevel: asText(state.targetLevel, "A1"),
      stateVersion: asInt(state._version, 3)
    },
    stats: {
      totalPoints: asInt(state.totalPoints),
      coins: asInt(state.coins),
      streak: asInt(state.streak),
      lastActiveDate: asNullableText(state.lastActiveDate)
    },
    goal: {
      targetQuestions: asInt(goal.targetQuestions, 5),
      goalDate: asNullableText(goal.goalDate),
      todayCorrect: asInt(goal.todayCorrect),
      todayAttempted: asInt(goal.todayAttempted),
      rewardedDate: asNullableText(goal.rewardedDate)
    },
    lessons,
    vocabulary,
    mistakes,
    sessions,
    coins
  };
}

/* ------------------------------------------------------------ bảng → state */

/** Ghép các nhóm dữ liệu trả về đúng shape state mà client đang dùng */
export function joinState(parts) {
  const user = parts.user || {};
  const stats = parts.stats || {};
  const goal = parts.goal || {};

  const lessonProgress = {};
  for (const row of parts.lessons || []) {
    lessonProgress[row.lesson_id] = {
      score: asInt(row.score),
      total: asInt(row.total),
      attempts: asInt(row.attempts),
      bestScore: asInt(row.best_score),
      lastAttempt: row.last_attempt ?? null
    };
  }

  const vocabularyProgress = {};
  for (const row of parts.vocabulary || []) {
    vocabularyProgress[row.word_id] = {
      status: row.status || "new",
      correctCount: asInt(row.correct_count),
      wrongCount: asInt(row.wrong_count),
      lastReviewed: row.last_reviewed ?? null
    };
  }

  return {
    _version: asInt(user.state_version, 3),
    _updatedAt: user.updated_at ?? null,
    userName: user.display_name || "Học viên",
    targetLevel: user.target_level || "A1",
    totalPoints: asInt(stats.total_points),
    coins: asInt(stats.coins),
    streak: asInt(stats.streak),
    lastActiveDate: stats.last_active_date ?? null,
    dailyGoal: {
      targetQuestions: asInt(goal.target_questions, 5),
      goalDate: goal.goal_date ?? null,
      todayCorrect: asInt(goal.today_correct),
      todayAttempted: asInt(goal.today_attempted),
      rewardedDate: goal.rewarded_date ?? null
    },
    lessonProgress,
    vocabularyProgress,
    mistakes: (parts.mistakes || []).map((row) => ({
      id: row.id,
      questionId: row.question_id,
      topic: row.topic,
      lessonId: row.lesson_id,
      questionText: row.question_text,
      userAnswer: row.user_answer,
      correctAnswer: row.correct_answer,
      explanation: row.explanation,
      savedAt: row.saved_at,
      understood: Boolean(row.understood)
    })),
    sessionHistory: (parts.sessions || []).map((row) => ({
      date: row.date,
      skill: row.skill,
      lessonId: row.lesson_id,
      source: row.source,
      correct: asInt(row.correct),
      attempted: asInt(row.attempted),
      pointsEarned: asInt(row.points_earned),
      coinsEarned: asInt(row.coins_earned)
    })),
    coinHistory: (parts.coins || []).map((row) => ({
      date: row.date,
      source: row.source,
      amount: asInt(row.amount),
      note: row.note
    }))
  };
}

/* ------------------------------------------------------------- ghi vào D1 */

/**
 * Tạo danh sách câu lệnh ghi. Mỗi lần lưu phản chiếu đúng state của client
 * (xoá rồi chèn lại các bảng con) để tránh dữ liệu mồ côi.
 * @returns {{sql: string, params: any[]}[]}
 */
export function buildWriteStatements(userId, parts, savedAt, clientId = null) {
  const now = savedAt;
  const statements = [];

  statements.push({
    sql: `INSERT INTO users (id, display_name, target_level, state_version, last_client_id, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            display_name   = excluded.display_name,
            target_level   = excluded.target_level,
            state_version  = excluded.state_version,
            last_client_id = excluded.last_client_id,
            updated_at     = excluded.updated_at`,
    params: [
      userId,
      parts.user.displayName,
      parts.user.targetLevel,
      parts.user.stateVersion,
      clientId,
      now,
      now
    ]
  });

  statements.push({
    sql: `INSERT INTO user_stats (user_id, total_points, coins, streak, last_active_date)
          VALUES (?, ?, ?, ?, ?)
          ON CONFLICT(user_id) DO UPDATE SET
            total_points     = excluded.total_points,
            coins            = excluded.coins,
            streak           = excluded.streak,
            last_active_date = excluded.last_active_date`,
    params: [
      userId,
      parts.stats.totalPoints,
      parts.stats.coins,
      parts.stats.streak,
      parts.stats.lastActiveDate
    ]
  });

  statements.push({
    sql: `INSERT INTO daily_goals (user_id, target_questions, goal_date, today_correct, today_attempted, rewarded_date)
          VALUES (?, ?, ?, ?, ?, ?)
          ON CONFLICT(user_id) DO UPDATE SET
            target_questions = excluded.target_questions,
            goal_date        = excluded.goal_date,
            today_correct    = excluded.today_correct,
            today_attempted  = excluded.today_attempted,
            rewarded_date    = excluded.rewarded_date`,
    params: [
      userId,
      parts.goal.targetQuestions,
      parts.goal.goalDate,
      parts.goal.todayCorrect,
      parts.goal.todayAttempted,
      parts.goal.rewardedDate
    ]
  });

  statements.push({ sql: "DELETE FROM lesson_progress WHERE user_id = ?", params: [userId] });
  for (const row of parts.lessons) {
    statements.push({
      sql: `INSERT INTO lesson_progress (user_id, lesson_id, score, total, attempts, best_score, last_attempt)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      params: [userId, row.lessonId, row.score, row.total, row.attempts, row.bestScore, row.lastAttempt]
    });
  }

  statements.push({ sql: "DELETE FROM vocabulary_progress WHERE user_id = ?", params: [userId] });
  for (const row of parts.vocabulary) {
    statements.push({
      sql: `INSERT INTO vocabulary_progress (user_id, word_id, status, correct_count, wrong_count, last_reviewed)
            VALUES (?, ?, ?, ?, ?, ?)`,
      params: [userId, row.wordId, row.status, row.correctCount, row.wrongCount, row.lastReviewed]
    });
  }

  statements.push({ sql: "DELETE FROM mistakes WHERE user_id = ?", params: [userId] });
  for (const row of parts.mistakes) {
    statements.push({
      sql: `INSERT INTO mistakes (id, user_id, question_id, lesson_id, topic, question_text,
                                  user_answer, correct_answer, explanation, saved_at, understood)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      params: [
        row.id, userId, row.questionId, row.lessonId, row.topic, row.questionText,
        row.userAnswer, row.correctAnswer, row.explanation, row.savedAt, row.understood
      ]
    });
  }

  statements.push({ sql: "DELETE FROM sessions WHERE user_id = ?", params: [userId] });
  for (const row of parts.sessions) {
    statements.push({
      sql: `INSERT INTO sessions (id, user_id, position, date, skill, lesson_id, source,
                                  correct, attempted, points_earned, coins_earned)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      params: [
        row.id, userId, row.position, row.date, row.skill, row.lessonId, row.source,
        row.correct, row.attempted, row.pointsEarned, row.coinsEarned
      ]
    });
  }

  statements.push({ sql: "DELETE FROM coin_transactions WHERE user_id = ?", params: [userId] });
  for (const row of parts.coins) {
    statements.push({
      sql: `INSERT INTO coin_transactions (id, user_id, position, date, source, amount, note)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      params: [row.id, userId, row.position, row.date, row.source, row.amount, row.note]
    });
  }

  return statements;
}

/**
 * Thực thi danh sách câu lệnh. D1 có batch() → chạy theo lô;
 * môi trường khác (test SQLite) không có batch → chạy tuần tự.
 */
export async function applyWriteStatements(db, statements) {
  const prepared = statements.map(({ sql, params }) => db.prepare(sql).bind(...params));

  if (typeof db.batch === "function") {
    for (let i = 0; i < prepared.length; i += BATCH_SIZE) {
      await db.batch(prepared.slice(i, i + BATCH_SIZE));
    }
    return;
  }

  for (const statement of prepared) {
    await statement.run();
  }
}

/* --------------------------------------------------------------- đọc từ D1 */

async function allRows(db, sql, params) {
  const result = await db.prepare(sql).bind(...params).all();
  return (result && result.results) || [];
}

/**
 * Đọc toàn bộ dữ liệu của một người dùng và ghép lại thành state.
 * @returns {object|null} null nếu chưa có dữ liệu
 */
export async function loadState(db, userId) {
  const user = await db.prepare("SELECT * FROM users WHERE id = ?").bind(userId).first();
  if (!user) return null;

  const stats = await db.prepare("SELECT * FROM user_stats WHERE user_id = ?").bind(userId).first();
  const goal = await db.prepare("SELECT * FROM daily_goals WHERE user_id = ?").bind(userId).first();

  const lessons = await allRows(
    db, "SELECT * FROM lesson_progress WHERE user_id = ? ORDER BY lesson_id", [userId]
  );
  const vocabulary = await allRows(
    db, "SELECT * FROM vocabulary_progress WHERE user_id = ? ORDER BY word_id", [userId]
  );
  const mistakes = await allRows(
    db, "SELECT * FROM mistakes WHERE user_id = ? ORDER BY saved_at, id", [userId]
  );
  const sessions = await allRows(
    db, "SELECT * FROM sessions WHERE user_id = ? ORDER BY position", [userId]
  );
  const coins = await allRows(
    db, "SELECT * FROM coin_transactions WHERE user_id = ? ORDER BY position", [userId]
  );

  return joinState({ user, stats, goal, lessons, vocabulary, mistakes, sessions, coins });
}
