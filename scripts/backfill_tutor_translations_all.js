#!/usr/bin/env node
/**
 * tutor_locale_packs.json → tutor_translations (12 dil) + tutors tablosu EN fallback.
 * Kullanım: node scripts/backfill_tutor_translations_all.js
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pool = require('../config/database');
const { SUPPORTED_LOCALES } = require('../utils/tutorAssets');

const packsPath = path.join(__dirname, '../data/tutor_locale_packs.json');

async function main() {
  const started = Date.now();
  console.log('⏳ Backfill başlıyor…');

  if (!fs.existsSync(packsPath)) {
    console.error('❌ tutor_locale_packs.json bulunamadı. Önce çalıştır:');
    console.error('   node scripts/gen_tutor_locale_packs.js');
    process.exit(1);
  }

  const packs = JSON.parse(fs.readFileSync(packsPath, 'utf8'));
  const [tutorRows] = await pool.execute('SELECT id FROM tutors');
  const existingIds = new Set(tutorRows.map((r) => r.id));
  console.log(`📦 ${Object.keys(packs).length} tutor paketi, DB'de ${existingIds.size} tutor`);

  const rows = [];
  let skippedTutors = 0;

  for (const [tutorId, locales] of Object.entries(packs)) {
    if (!existingIds.has(tutorId)) {
      skippedTutors++;
      continue;
    }
    for (const locale of SUPPORTED_LOCALES) {
      const entry = locales[locale];
      if (!entry?.displayName || !entry?.description) continue;
      rows.push([
        tutorId,
        locale,
        entry.displayName,
        entry.description,
        entry.tagline ?? null,
      ]);
    }
  }

  if (rows.length === 0) {
    console.log('⚠️  Yazılacak çeviri yok (DB tutor eşleşmesi yok).');
    process.exit(0);
  }

  console.log(`📝 ${rows.length} çeviri satırı toplu yazılıyor…`);

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const chunkSize = 50;
    for (let i = 0; i < rows.length; i += chunkSize) {
      const chunk = rows.slice(i, i + chunkSize);
      const placeholders = chunk.map(() => '(?, ?, ?, ?, ?)').join(', ');
      const flat = chunk.flat();
      await conn.execute(
        `INSERT INTO tutor_translations
          (tutor_id, locale, display_name, description, tagline)
         VALUES ${placeholders}
         ON DUPLICATE KEY UPDATE
           display_name = VALUES(display_name),
           description = VALUES(description),
           tagline = VALUES(tagline)`,
        flat
      );
      const done = Math.min(i + chunkSize, rows.length);
      console.log(`   → ${done}/${rows.length}`);
    }

    let tutorUpdates = 0;
    for (const [tutorId, locales] of Object.entries(packs)) {
      if (!existingIds.has(tutorId)) continue;
      const en = locales.en;
      if (!en) continue;
      await conn.execute(
        `UPDATE tutors SET name = ?, description = ?, tagline = ? WHERE id = ?`,
        [en.displayName, en.description, en.tagline ?? null, tutorId]
      );
      tutorUpdates++;
    }

    await conn.commit();
    const sec = ((Date.now() - started) / 1000).toFixed(1);
    console.log(`✅ ${rows.length} çeviri + ${tutorUpdates} tutor güncellendi (${sec}s)`);
    if (skippedTutors > 0) {
      console.log(`ℹ️  ${skippedTutors} tutor DB'de yok — panelden ekledikten sonra tekrar çalıştır`);
    }
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }

  process.exit(0);
}

main().catch((err) => {
  console.error('❌ backfill failed:', err.message);
  process.exit(1);
});
