#!/usr/bin/env node
require('dotenv').config();
const pool = require('../config/database');

async function exec(sql) {
  await pool.query(sql);
}

async function main() {
  console.log('[MIGRATE] conversations tables…');

  await exec(`
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
      CONSTRAINT fk_conversations_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await exec(`
    CREATE TABLE IF NOT EXISTS conversation_messages (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      conversation_id BIGINT NOT NULL,
      client_id VARCHAR(64) NULL,
      role ENUM('user', 'assistant', 'system') NOT NULL,
      text TEXT NOT NULL,
      attachment_json JSON NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uq_conv_client (conversation_id, client_id),
      INDEX idx_messages_conversation_created (conversation_id, created_at),
      CONSTRAINT fk_messages_conversation FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  console.log('[MIGRATE] ✅ conversations OK');
  process.exit(0);
}

main().catch((e) => {
  console.error('[MIGRATE] ❌', e.message);
  process.exit(1);
});
