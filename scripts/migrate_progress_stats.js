#!/usr/bin/env node
require('dotenv').config();
const pool = require('../config/database');

async function columnExists(table, column) {
  const [rows] = await pool.query(
    `SELECT 1 FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ? LIMIT 1`,
    [table, column]
  );
  return rows.length > 0;
}

async function main() {
  if (!(await columnExists('user_practice_days', 'minutes'))) {
    await pool.query(
      `ALTER TABLE user_practice_days
       ADD COLUMN minutes INT NOT NULL DEFAULT 0 AFTER practice_date`
    );
    console.log('[MIGRATE] user_practice_days.minutes added');
  }

  if (!(await columnExists('user_practice_days', 'duration_seconds'))) {
    await pool.query(
      `ALTER TABLE user_practice_days
       ADD COLUMN duration_seconds INT NOT NULL DEFAULT 0 AFTER minutes`
    );
    console.log('[MIGRATE] user_practice_days.duration_seconds added');
  }

  for (const col of [
    ['user_practice_days', 'words_learned', 'INT NOT NULL DEFAULT 0'],
    ['user_practice_days', 'accuracy_percent', 'INT NULL DEFAULT NULL'],
    ['user_practice_days', 'accuracy_samples', 'INT NOT NULL DEFAULT 0'],
    ['user_learning_stats', 'words_learned_count', 'INT NOT NULL DEFAULT 0'],
    ['user_learning_stats', 'accuracy_percent', 'INT NULL DEFAULT NULL'],
    ['user_learning_stats', 'accuracy_samples', 'INT NOT NULL DEFAULT 0'],
  ]) {
    if (!(await columnExists(col[0], col[1]))) {
      await pool.query(`ALTER TABLE ${col[0]} ADD COLUMN ${col[1]} ${col[2]}`);
      console.log(`[MIGRATE] ${col[0]}.${col[1]} added`);
    }
  }

  console.log('[MIGRATE] ✅ progress stats columns OK');
  process.exit(0);
}

main().catch((e) => {
  console.error('[MIGRATE] ❌', e.message);
  process.exit(1);
});
