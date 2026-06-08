/**
 * İstemci saat dilimi — JS `Date.getTimezoneOffset()` ile aynı işaret:
 * UTC+3 için -180. Header: X-Timezone-Offset (dakika).
 */
function parseTimezoneOffsetMinutes(req) {
  const raw =
    req.headers['x-timezone-offset'] ??
    req.headers['X-Timezone-Offset'];
  if (raw == null || raw === '') return 0;
  const n = parseInt(String(raw), 10);
  return Number.isFinite(n) ? n : 0;
}

function localDatePartsFromUtcMs(utcMs, offsetMinutes) {
  const localMs = utcMs - offsetMinutes * 60 * 1000;
  const d = new Date(localMs);
  return {
    year: d.getUTCFullYear(),
    month: d.getUTCMonth() + 1,
    day: d.getUTCDate(),
  };
}

function pad2(n) {
  return String(n).padStart(2, '0');
}

function toYmd({ year, month, day }) {
  return `${year}-${pad2(month)}-${pad2(day)}`;
}

function localTodayString(offsetMinutes = 0, nowMs = Date.now()) {
  return toYmd(localDatePartsFromUtcMs(nowMs, offsetMinutes));
}

function parseLocalDateAtNoon(dateStr) {
  return new Date(`${dateStr}T12:00:00.000Z`);
}

function startOfWeekMondayFromLocalDate(todayStr) {
  const anchor = parseLocalDateAtNoon(todayStr);
  const dow = anchor.getUTCDay();
  const diff = dow === 0 ? -6 : 1 - dow;
  anchor.setUTCDate(anchor.getUTCDate() + diff);
  return toYmd({
    year: anchor.getUTCFullYear(),
    month: anchor.getUTCMonth() + 1,
    day: anchor.getUTCDate(),
  });
}

function addLocalDays(dateStr, delta) {
  const d = parseLocalDateAtNoon(dateStr);
  d.setUTCDate(d.getUTCDate() + delta);
  return toYmd({
    year: d.getUTCFullYear(),
    month: d.getUTCMonth() + 1,
    day: d.getUTCDate(),
  });
}

function todayDayKey(todayStr, mondayStr) {
  const t = parseLocalDateAtNoon(todayStr).getTime();
  const m = parseLocalDateAtNoon(mondayStr).getTime();
  const idx = Math.round((t - m) / 86400000);
  const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
  return DAY_KEYS[Math.max(0, Math.min(6, idx))] ?? 'mon';
}

module.exports = {
  parseTimezoneOffsetMinutes,
  localTodayString,
  startOfWeekMondayFromLocalDate,
  addLocalDays,
  todayDayKey,
  parseLocalDateAtNoon,
};
