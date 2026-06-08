#!/usr/bin/env node
/**
 * assets/translations/daily_conversations/{locale}.json üretir.
 * Usage: node scripts/build_daily_conversation_locale_assets.js
 */
const fs = require('fs');
const path = require('path');
const { ENGLISH_DAILY_CONVERSATIONS } = require('../data/english_daily_conversations');
const TR = require('../data/daily_conversations_tr');
const PACKS = require('../data/dc_locales/dc_locale_packs.json');

const LOCALES = {
  tr: TR,
  en: Object.fromEntries(
    ENGLISH_DAILY_CONVERSATIONS.map((L) => [L.id, [L.title, L.subtitle]])
  ),
  ...PACKS,
};

function toEntries(rows) {
  const out = {};
  for (const L of ENGLISH_DAILY_CONVERSATIONS) {
    const pair = rows[L.id] || [L.title, L.subtitle];
    out[L.id] = { title: pair[0], subtitle: pair[1] };
  }
  return out;
}

const outDir = path.join(__dirname, '../../assets/translations/daily_conversations');
fs.mkdirSync(outDir, { recursive: true });

for (const [locale, rows] of Object.entries(LOCALES)) {
  const file = path.join(outDir, `${locale}.json`);
  fs.writeFileSync(file, JSON.stringify(toEntries(rows), null, 2) + '\n');
  console.log(`[DC] ${locale}.json (${Object.keys(rows).length} keys)`);
}

const callPatches = {
  tr: { desc_with_daily: '{name} — «{topic}» konusunda seninle sohbet etmek istiyor' },
  en: { desc_with_daily: '{name} wants to chat about «{topic}» with you' },
  de: { desc_with_daily: '{name} möchte mit dir über «{topic}» sprechen' },
  fr: { desc_with_daily: '{name} veut discuter de «{topic}» avec toi' },
  it: { desc_with_daily: '{name} vuole parlare di «{topic}» con te' },
  es: { desc_with_daily: '{name} quiere charlar sobre «{topic}» contigo' },
  pt: { desc_with_daily: '{name} quer conversar sobre «{topic}» contigo' },
  ja: { desc_with_daily: '{name}が「{topic}」についてあなたと話したいです' },
  ko: { desc_with_daily: '{name}님이 «{topic}»에 대해 이야기하고 싶어해요' },
  zh: { desc_with_daily: '{name}想和你聊聊「{topic}」' },
  hi: { desc_with_daily: '{name} «{topic}» पर आपसे बात करना चाहता/चाहती है' },
  ru: { desc_with_daily: '{name} хочет поговорить с вами о «{topic}»' },
};

for (const [locale, patch] of Object.entries(callPatches)) {
  const mainPath = path.join(__dirname, `../../assets/translations/${locale}.json`);
  if (!fs.existsSync(mainPath)) continue;
  const root = JSON.parse(fs.readFileSync(mainPath, 'utf8'));
  root.call = { ...root.call, ...patch };
  fs.writeFileSync(mainPath, JSON.stringify(root, null, 4) + '\n');
}

console.log('[DC] ✅ done');
