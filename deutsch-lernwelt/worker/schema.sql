-- worker/schema.sql — CẤU TRÚC DỮ LIỆU CHUẨN HOÁ (D1 / SQLite)
--
-- Thay cho bản cũ (một cột `state` chứa toàn bộ JSON), dữ liệu được tách
-- thành các bảng quan hệ, có khoá chính, khoá ngoại và chỉ mục.
--
-- Chạy: npx wrangler d1 execute deutsch-lernwelt-db --remote --file=worker/schema.sql

-- ------------------------------------------------------------------ người dùng

CREATE TABLE IF NOT EXISTS users (
  id             TEXT PRIMARY KEY,          -- hiện dùng 'default' (một người dùng)
  display_name   TEXT NOT NULL DEFAULT 'Học viên',
  target_level   TEXT NOT NULL DEFAULT 'A1',
  state_version  INTEGER NOT NULL DEFAULT 3,
  last_client_id TEXT,
  created_at     TEXT NOT NULL,
  updated_at     TEXT NOT NULL
);

-- --------------------------------------------------------------- số liệu tổng

CREATE TABLE IF NOT EXISTS user_stats (
  user_id          TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  total_points     INTEGER NOT NULL DEFAULT 0,
  coins            INTEGER NOT NULL DEFAULT 0,
  streak           INTEGER NOT NULL DEFAULT 0,
  last_active_date TEXT
);

CREATE TABLE IF NOT EXISTS daily_goals (
  user_id          TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  target_questions INTEGER NOT NULL DEFAULT 5,
  goal_date        TEXT,
  today_correct    INTEGER NOT NULL DEFAULT 0,
  today_attempted  INTEGER NOT NULL DEFAULT 0,
  rewarded_date    TEXT
);

-- ------------------------------------------------------------- tiến độ học tập

CREATE TABLE IF NOT EXISTS lesson_progress (
  user_id      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id    TEXT NOT NULL,
  score        INTEGER NOT NULL DEFAULT 0,
  total        INTEGER NOT NULL DEFAULT 0,
  attempts     INTEGER NOT NULL DEFAULT 0,
  best_score   INTEGER NOT NULL DEFAULT 0,
  last_attempt TEXT,
  PRIMARY KEY (user_id, lesson_id)
);

CREATE TABLE IF NOT EXISTS vocabulary_progress (
  user_id        TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  word_id        TEXT NOT NULL,
  status         TEXT NOT NULL DEFAULT 'new',
  correct_count  INTEGER NOT NULL DEFAULT 0,
  wrong_count    INTEGER NOT NULL DEFAULT 0,
  last_reviewed  TEXT,
  PRIMARY KEY (user_id, word_id)
);

CREATE TABLE IF NOT EXISTS mistakes (
  id             TEXT PRIMARY KEY,
  user_id        TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  question_id    TEXT,
  lesson_id      TEXT,
  topic          TEXT,
  question_text  TEXT,
  user_answer    TEXT,
  correct_answer TEXT,
  explanation    TEXT,
  saved_at       TEXT,
  understood     INTEGER NOT NULL DEFAULT 0
);

-- ----------------------------------------------------------------- lịch sử

CREATE TABLE IF NOT EXISTS sessions (
  id            TEXT PRIMARY KEY,
  user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  position      INTEGER NOT NULL DEFAULT 0,   -- giữ đúng thứ tự mảng của client
  date          TEXT NOT NULL,
  skill         TEXT,
  lesson_id     TEXT,
  source        TEXT,
  correct       INTEGER NOT NULL DEFAULT 0,
  attempted     INTEGER NOT NULL DEFAULT 0,
  points_earned INTEGER NOT NULL DEFAULT 0,
  coins_earned  INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS coin_transactions (
  id       TEXT PRIMARY KEY,
  user_id  TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0,
  date     TEXT NOT NULL,
  source   TEXT,
  amount   INTEGER NOT NULL DEFAULT 0,
  note     TEXT
);

-- ----------------------------------------------------------------- chỉ mục

CREATE INDEX IF NOT EXISTS idx_lessons_user  ON lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_vocab_user    ON vocabulary_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_mistakes_user ON mistakes(user_id, saved_at);
CREATE INDEX IF NOT EXISTS idx_mistakes_open ON mistakes(user_id, understood);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id, position);
CREATE INDEX IF NOT EXISTS idx_sessions_date ON sessions(user_id, date);
CREATE INDEX IF NOT EXISTS idx_coins_user    ON coin_transactions(user_id, position);

-- ----------------------------------------------------------- phiên bản schema

CREATE TABLE IF NOT EXISTS schema_migrations (
  id         TEXT PRIMARY KEY,
  applied_at TEXT NOT NULL
);

INSERT OR IGNORE INTO schema_migrations (id, applied_at)
VALUES ('0001_normalized', datetime('now'));
