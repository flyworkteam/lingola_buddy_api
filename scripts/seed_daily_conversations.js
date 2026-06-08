#!/usr/bin/env node
/**
 * Seed daily_conversations table.
 * Usage: node scripts/seed_daily_conversations.js
 */
require('dotenv').config();
const pool = require('../config/database');
const { ENGLISH_DAILY_CONVERSATIONS } = require('../data/english_daily_conversations');

async function main() {
  console.log(`[SEED] ${ENGLISH_DAILY_CONVERSATIONS.length} daily conversations…`);
  for (const L of ENGLISH_DAILY_CONVERSATIONS) {
    await pool.execute(
      `INSERT INTO daily_conversations (
        id, cefr_level, sort_order, title, scenario_emoji, subtitle,
        description, conversation_goals, greeting_opener, tutor_prompt, learn_language_code
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'en')
      ON DUPLICATE KEY UPDATE
        cefr_level = VALUES(cefr_level),
        sort_order = VALUES(sort_order),
        title = VALUES(title),
        scenario_emoji = VALUES(scenario_emoji),
        subtitle = VALUES(subtitle),
        description = VALUES(description),
        conversation_goals = VALUES(conversation_goals),
        greeting_opener = VALUES(greeting_opener),
        tutor_prompt = VALUES(tutor_prompt)`,
      [
        L.id,
        L.cefr_level,
        L.sort_order,
        L.title,
        L.scenario_emoji,
        L.subtitle,
        L.description,
        L.conversation_goals,
        L.greeting_opener,
        L.tutor_prompt,
      ]
    );
  }
  console.log('[SEED] ✅ daily_conversations OK');
  process.exit(0);
}

main().catch((e) => {
  console.error('[SEED] ❌', e);
  process.exit(1);
});
