-- Lingola Buddy — AUTH tabloları (şimdi çalıştır)
-- Veritabanı: flywork1_lingolabuddy

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  credential VARCHAR(32) NOT NULL COMMENT 'google | apple | guest',
  credential_data JSON NOT NULL COMMENT '{"providerId","email","id"}',
  username VARCHAR(255) NULL,
  native_lang VARCHAR(16) NULL,
  profile_photo_url VARCHAR(512) NULL,
  learn_language_code VARCHAR(16) NULL,
  proficiency VARCHAR(32) NULL,
  daily_goal VARCHAR(32) NULL,
  account_created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_users_credential (credential)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token TEXT NOT NULL,
  token_hash VARCHAR(64) NOT NULL,
  expires_at DATETIME NOT NULL,
  is_revoked TINYINT(1) NOT NULL DEFAULT 0,
  device_info VARCHAR(512) NULL,
  ip_address VARCHAR(45) NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_token_hash (token_hash),
  INDEX idx_user_tokens_user (user_id),
  CONSTRAINT fk_user_tokens_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
