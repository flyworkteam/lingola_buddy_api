'use strict';

const CDN_HOST = (process.env.BUNNY_CDN_HOSTNAME || 'lingolabuddy.b-cdn.net').replace(
  /^https?:\/\//,
  ''
);

const SUPPORTED_LOCALES = new Set([
  'en', 'de', 'it', 'fr', 'tr', 'ja', 'es', 'ru', 'ko', 'hi', 'pt', 'zh',
]);

function capitalizeFolder(name) {
  const s = String(name || '').trim();
  if (!s) return s;
  return s[0].toUpperCase() + s.slice(1);
}

function normalizeTutorId(raw) {
  const id = String(raw || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_');
  if (!/^[a-z][a-z0-9_]{1,62}$/.test(id)) {
    throw new Error('id must be lowercase slug (a-z, 0-9, _)');
  }
  return id;
}

function buildDefaultAssetUrls(id, displayName) {
  const folder = capitalizeFolder(displayName || id);
  const base = `https://${CDN_HOST}/Buddies/${folder}`;
  return {
    photoUrl: `${base}/c_${id}.png`,
    rivUrl: `${base}/c_${id}.riv`,
    cdnFolder: folder,
  };
}

function resolveLocale(raw) {
  const locale = String(raw || 'en').trim().toLowerCase().split('-')[0];
  return SUPPORTED_LOCALES.has(locale) ? locale : 'en';
}

module.exports = {
  SUPPORTED_LOCALES,
  capitalizeFolder,
  normalizeTutorId,
  buildDefaultAssetUrls,
  resolveLocale,
};
