#!/usr/bin/env node
require('dotenv').config();
const pool = require('../config/database');

async function exec(sql) {
  await pool.query(sql);
}

async function tableExists(name) {
  const [rows] = await pool.query(
    `SELECT 1 FROM information_schema.TABLES
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? LIMIT 1`,
    [name]
  );
  return rows.length > 0;
}

async function main() {
  console.log('[MIGRATE] streak tables…');

  await exec(`
    CREATE TABLE IF NOT EXISTS user_learning_stats (
      user_id INT PRIMARY KEY,
      streak_days INT NOT NULL DEFAULT 0,
      total_practice_minutes INT NOT NULL DEFAULT 0,
      last_practice_date DATE NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_learning_stats_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await exec(`
    CREATE TABLE IF NOT EXISTS user_practice_days (
      user_id INT NOT NULL,
      practice_date DATE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, practice_date),
      INDEX idx_practice_user_date (user_id, practice_date DESC),
      CONSTRAINT fk_practice_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  console.log('[MIGRATE] ✅ streak OK');
  process.exit(0);
}

main().catch((e) => {
  console.error('[MIGRATE] ❌', e.message);
  process.exit(1);
});
