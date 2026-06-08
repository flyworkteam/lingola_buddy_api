#!/usr/bin/env node
/**
 * Mevcut tutors satırlarını tr locale çevirisi olarak tutor_translations'a kopyalar.
 * Kullanım: node scripts/backfill_tutor_translations_tr.js
 */
require('dotenv').config();
const pool = require('../config/database');

async function main() {
  const [rows] = await pool.execute('SELECT id, name, description, tagline FROM tutors');
  let count = 0;
  for (const row of rows) {
    await pool.execute(
      `INSERT INTO tutor_translations
        (tutor_id, locale, display_name, description, tagline)
       VALUES (?, 'tr', ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         display_name = VALUES(display_name),
         description = VALUES(description),
         tagline = VALUES(tagline)`,
      [row.id, row.name, row.description, row.tagline]
    );
    count++;
  }
  console.log(`✅ ${count} tutor → tr çevirisi yazıldı`);
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ backfill failed:', err.message);
  process.exit(1);
});
