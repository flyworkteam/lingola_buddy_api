-- Lingola Buddy — English curriculum (CEFR) + user progress
-- Run after init_auth_schema.sql

CREATE TABLE IF NOT EXISTS lessons (
  id VARCHAR(32) NOT NULL PRIMARY KEY,
  cefr_level ENUM('A1','A2','B1','B2','C1','C2') NOT NULL,
  sort_order INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  scenario_emoji VARCHAR(16) NOT NULL DEFAULT '📘',
  subtitle VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  learning_goals JSON NOT NULL,
  greeting_opener VARCHAR(512) NOT NULL,
  tutor_prompt TEXT NOT NULL,
  learn_language_code VARCHAR(16) NOT NULL DEFAULT 'en',
  UNIQUE KEY uq_lessons_level_order (cefr_level, sort_order),
  INDEX idx_lessons_level (cefr_level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_lesson_progress (
  user_id INT NOT NULL,
  lesson_id VARCHAR(32) NOT NULL,
  status ENUM('locked','available','in_progress','completed') NOT NULL DEFAULT 'locked',
  completed_at DATETIME NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, lesson_id),
  CONSTRAINT fk_ulp_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_ulp_lesson FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- proficiency stores CEFR (A1–C2); current_lesson_id = active lesson for calls & home
-- (Tek sefer çalıştırın; sütun zaten varsa hata yok sayılabilir.)
ALTER TABLE users ADD COLUMN current_lesson_id VARCHAR(32) NULL;
ALTER TABLE users ADD INDEX idx_users_current_lesson (current_lesson_id);
