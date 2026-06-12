const CACHE_MS = 10 * 60 * 1000;
let cache = { at: 0, voices: [] };

function mapVoice(raw) {
  const labels = raw?.labels || {};
  const genderLabel = String(labels.gender || '').toLowerCase();
  let gender = null;
  if (genderLabel.includes('female')) gender = 'female';
  else if (genderLabel.includes('male')) gender = 'male';

  return {
    voiceId: raw.voice_id,
    name: raw.name || raw.voice_id,
    gender,
    previewUrl: raw.preview_url || null,
  };
}

async function fetchElevenLabsVoices() {
  const key = process.env.ELEVENLABS_API_KEY?.trim();
  if (!key) return [];

  const now = Date.now();
  if (cache.voices.length && now - cache.at < CACHE_MS) {
    return cache.voices;
  }

  const response = await fetch('https://api.elevenlabs.io/v1/voices', {
    headers: {
      'xi-api-key': key,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    return cache.voices.length ? cache.voices : [];
  }

  const payload = await response.json();
  const voices = (payload.voices || []).map(mapVoice).filter((v) => v.voiceId);
  cache = { at: now, voices };
  return voices;
}

async function listVoices({ gender } = {}) {
  const voices = await fetchElevenLabsVoices();
  const normalized = String(gender || '').toLowerCase();
  if (!normalized || !['female', 'male'].includes(normalized)) {
    return { data: voices, meta: { total: voices.length, fallbackUsed: false } };
  }

  const filtered = voices.filter((v) => v.gender === normalized);
  if (filtered.length) {
    return { data: filtered, meta: { total: filtered.length, fallbackUsed: false } };
  }

  return {
    data: voices,
    meta: { total: voices.length, fallbackUsed: true },
  };
}

function findVoice(voices, voiceId) {
  if (!voiceId) return null;
  return voices.find((v) => v.voiceId === voiceId) || null;
}

module.exports = {
  listVoices,
  findVoice,
  fetchElevenLabsVoices,
};
