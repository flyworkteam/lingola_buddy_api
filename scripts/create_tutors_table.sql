-- Eğitmenler (Bunny CDN Buddies klasörleri ile eşleşir)
-- Çalıştır: mysql -u ... -p flywork1_lingolabuddy < scripts/create_tutors_table.sql
-- Ardından: mysql ... < scripts/seed_tutors.sql

DROP TABLE IF EXISTS tutors;

CREATE TABLE tutors (
  id VARCHAR(64) PRIMARY KEY COMMENT 'slug: annie, sophie, ...',
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
