#!/usr/bin/env node
/**
 * Seed English curriculum into `lessons` table.
 * Usage: node scripts/seed_lessons.js
 */
require('dotenv').config();
const pool = require('../config/database');
const { ENGLISH_LESSONS } = require('../data/english_curriculum');

async function main() {
  console.log(`[SEED] ${ENGLISH_LESSONS.length} lessons…`);
  for (const L of ENGLISH_LESSONS) {
    await pool.execute(
      `INSERT INTO lessons (
        id, cefr_level, sort_order, title, scenario_emoji, subtitle,
        description, learning_goals, greeting_opener, tutor_prompt, learn_language_code
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'en')
      ON DUPLICATE KEY UPDATE
        cefr_level = VALUES(cefr_level),
        sort_order = VALUES(sort_order),
        title = VALUES(title),
        scenario_emoji = VALUES(scenario_emoji),
        subtitle = VALUES(subtitle),
        description = VALUES(description),
        learning_goals = VALUES(learning_goals),
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
        L.learning_goals,
        L.greeting_opener,
        L.tutor_prompt,
      ]
    );
  }
  console.log('[SEED] ✅ lessons OK');
  process.exit(0);
}

main().catch((e) => {
  console.error('[SEED] ❌', e);
  process.exit(1);
});
