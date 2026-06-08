-- Lingola Buddy — İLERİDE eklenecek tablolar (auth hazır olduktan sonra)
-- Sıra: önce init_auth_schema.sql, sonra ihtiyaç oldukça bu dosyadan parça parça.

-- ---------------------------------------------------------------------------
-- Eğitmenler (şu an uygulamada statik; sonra panel/API ile yönetilebilir)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tutors (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  description TEXT NOT NULL,
  gender ENUM('female', 'male') NOT NULL,
  photo_url VARCHAR(512) NOT NULL,
  riv_url VARCHAR(512) NOT NULL,
  voice_id VARCHAR(128) NOT NULL,
  native_lang VARCHAR(16) NOT NULL DEFAULT 'en',
  tagline VARCHAR(255) NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_tutors_active_sort (is_active, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- Sohbet oturumları (kullanıcı ↔ eğitmen)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS conversations (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  tutor_id VARCHAR(64) NOT NULL,
  title VARCHAR(255) NULL,
  last_message_preview VARCHAR(500) NULL,
  last_message_at DATETIME NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_user_tutor (user_id, tutor_id),
  INDEX idx_conversations_user_updated (user_id, updated_at DESC),
  CONSTRAINT fk_conversations_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_conversations_tutor FOREIGN KEY (tutor_id) REFERENCES tutors(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS conversation_messages (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  conversation_id BIGINT NOT NULL,
  role ENUM('user', 'assistant', 'system') NOT NULL,
  text TEXT NOT NULL,
  attachment_json JSON NULL COMMENT 'ses/fotoğraf meta',
  token_count INT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_messages_conversation_created (conversation_id, created_at),
  CONSTRAINT fk_messages_conversation FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- Öğrenme ilerlemesi / streak
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_learning_stats (
  user_id INT PRIMARY KEY,
  streak_days INT NOT NULL DEFAULT 0,
  total_practice_minutes INT NOT NULL DEFAULT 0,
  last_practice_date DATE NULL,
  words_learned_count INT NOT NULL DEFAULT 0,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_learning_stats_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- Kaydedilen kelimeler (sohbetten)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS saved_words (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  word VARCHAR(128) NOT NULL,
  translation VARCHAR(512) NULL,
  source_message_id BIGINT NULL,
  learn_language_code VARCHAR(16) NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_user_word (user_id, word, learn_language_code),
  INDEX idx_saved_words_user (user_id, created_at DESC),
  CONSTRAINT fk_saved_words_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_saved_words_message FOREIGN KEY (source_message_id) REFERENCES conversation_messages(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- Sesli arama / görüşme kayıtları
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS call_sessions (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  tutor_id VARCHAR(64) NOT NULL,
  status ENUM('active', 'completed', 'failed', 'cancelled') NOT NULL DEFAULT 'active',
  started_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ended_at DATETIME NULL,
  duration_seconds INT NULL,
  recording_url VARCHAR(512) NULL,
  metadata_json JSON NULL,
  INDEX idx_calls_user_started (user_id, started_at DESC),
  CONSTRAINT fk_calls_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_calls_tutor FOREIGN KEY (tutor_id) REFERENCES tutors(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- Premium / abonelik
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS subscriptions (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  plan_code VARCHAR(64) NOT NULL COMMENT 'free | monthly | yearly',
  status ENUM('active', 'expired', 'cancelled', 'trial') NOT NULL DEFAULT 'active',
  provider VARCHAR(32) NULL COMMENT 'apple | google | stripe',
  provider_subscription_id VARCHAR(255) NULL,
  started_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME NULL,
  cancelled_at DATETIME NULL,
  INDEX idx_subscriptions_user_status (user_id, status),
  CONSTRAINT fk_subscriptions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- Push bildirimleri
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  type VARCHAR(64) NOT NULL DEFAULT 'system',
  title VARCHAR(255) NOT NULL,
  body TEXT NULL,
  metadata_json JSON NULL,
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_notifications_user_read (user_id, is_read, created_at DESC),
  CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- Hesap silme geri bildirimi (opsiyonel)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS account_deletion_feedback (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  reason VARCHAR(255) NULL,
  message TEXT NULL,
  source VARCHAR(32) DEFAULT 'mobile_app',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_deletion_feedback_created (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- Örnek eğitmen seed (isteğe bağlı)
-- ---------------------------------------------------------------------------
-- INSERT INTO tutors (id, name, bio, sort_order) VALUES
-- ('lee', 'Lee', 'Friendly conversation partner', 1),
-- ('sophie', 'Sophie', 'Patient English tutor', 2);
