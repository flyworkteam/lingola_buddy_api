#!/usr/bin/env node
/**
 * tutor_translations tablosu — panelden çok dilli tutor metinleri.
 * Kullanım: node scripts/migrate_tutor_translations.js
 */
require('dotenv').config();
const pool = require('../config/database');

const SQL = `
CREATE TABLE IF NOT EXISTS tutor_translations (
  tutor_id VARCHAR(64) NOT NULL,
  locale VARCHAR(8) NOT NULL,
  display_name VARCHAR(128) NOT NULL,
  description TEXT NOT NULL,
  tagline VARCHAR(255) NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (tutor_id, locale),
  CONSTRAINT fk_tutor_translations_tutor
    FOREIGN KEY (tutor_id) REFERENCES tutors(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX idx_tutor_translations_locale (locale)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`;

async function main() {
  await pool.execute(SQL);
  console.log('✅ tutor_translations tablosu hazır');
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ migrate_tutor_translations:', err.message);
  process.exit(1);
});
