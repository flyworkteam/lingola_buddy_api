#!/usr/bin/env node
/**
 * daily_conversations + user_daily_conversation_progress; users.current_daily_conversation_id
 * Usage: node scripts/migrate_daily_conversations.js
 */
require('dotenv').config();
const pool = require('../config/database');

async function exec(sql) {
  await pool.query(sql);
}

async function columnExists(table, column) {
  const [rows] = await pool.query(
    `SELECT 1 FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ? LIMIT 1`,
    [table, column]
  );
  return rows.length > 0;
}

async function main() {
  console.log('[MIGRATE] daily_conversations schema…');

  await exec(`
    CREATE TABLE IF NOT EXISTS daily_conversations (
      id VARCHAR(32) NOT NULL PRIMARY KEY,
      cefr_level ENUM('A1','A2','B1','B2','C1','C2') NOT NULL,
      sort_order INT NOT NULL,
      title VARCHAR(255) NOT NULL,
      scenario_emoji VARCHAR(16) NOT NULL DEFAULT '💬',
      subtitle VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      conversation_goals JSON NOT NULL,
      greeting_opener VARCHAR(512) NOT NULL,
      tutor_prompt TEXT NOT NULL,
      learn_language_code VARCHAR(16) NOT NULL DEFAULT 'en',
      UNIQUE KEY uq_dc_level_order (cefr_level, sort_order),
      INDEX idx_dc_level (cefr_level)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await exec(`
    CREATE TABLE IF NOT EXISTS user_daily_conversation_progress (
      user_id INT NOT NULL,
      conversation_id VARCHAR(32) NOT NULL,
      status ENUM('locked','available','in_progress','completed') NOT NULL DEFAULT 'locked',
      completed_at DATETIME NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, conversation_id),
      CONSTRAINT fk_udcp_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      CONSTRAINT fk_udcp_dc FOREIGN KEY (conversation_id) REFERENCES daily_conversations(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  if (!(await columnExists('users', 'current_daily_conversation_id'))) {
    await exec(
      `ALTER TABLE users ADD COLUMN current_daily_conversation_id VARCHAR(32) NULL`
    );
    console.log('[MIGRATE] users.current_daily_conversation_id added');
  }

  try {
    await exec(
      `ALTER TABLE users ADD INDEX idx_users_current_dc (current_daily_conversation_id)`
    );
  } catch (e) {
    if (e.code !== 'ER_DUP_KEYNAME') throw e;
  }

  console.log('[MIGRATE] ✅ daily_conversations OK');
  process.exit(0);
}

main().catch((e) => {
  console.error('[MIGRATE] ❌', e.message);
  process.exit(1);
});
