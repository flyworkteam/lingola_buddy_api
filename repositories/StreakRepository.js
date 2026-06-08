const pool = require('../config/database');
const LessonRepository = require('./LessonRepository');
const UserRepository = require('./UserRepository');
const {
  localTodayString,
  startOfWeekMondayFromLocalDate,
  addLocalDays,
  todayDayKey,
} = require('../utils/clientTimezone');

const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

class StreakRepository {
  static async ensureStatsRow(userId) {
    await pool.execute(
      `INSERT IGNORE INTO user_learning_stats (user_id, streak_days) VALUES (?, 0)`,
      [userId]
    );
  }

  static async getStats(userId) {
    const [rows] = await pool.execute(
      `SELECT streak_days, last_practice_date, total_practice_minutes,
              words_learned_count, accuracy_percent, accuracy_samples
       FROM user_learning_stats WHERE user_id = ?`,
      [userId]
    );
    return rows[0] || null;
  }

  static async sumWeekMinutes(userId, fromStr, toStr) {
    const [rows] = await pool.execute(
      `SELECT COALESCE(SUM(minutes), 0) AS total
       FROM user_practice_days
       WHERE user_id = ? AND practice_date >= ? AND practice_date <= ?`,
      [userId, fromStr, toStr]
    );
    return rows[0]?.total ?? 0;
  }

  /** MySQL DATE — takvim günü; UTC bileşenleri TR gibi TZ'lerde 1 gün kaydırır. */
  static parseDateField(d) {
    if (d == null || d === '') return null;
    if (typeof d === 'string') {
      const m = String(d).match(/^(\d{4}-\d{2}-\d{2})/);
      return m ? m[1] : null;
    }
    if (d instanceof Date && !Number.isNaN(d.getTime())) {
      const y = d.getFullYear();
      const mo = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${mo}-${day}`;
    }
    const m = String(d).match(/^(\d{4}-\d{2}-\d{2})/);
    return m ? m[1] : null;
  }

  static async getPracticeMapInRange(userId, fromStr, toStr) {
    const [rows] = await pool.execute(
      `SELECT practice_date, minutes, words_learned, accuracy_percent
       FROM user_practice_days
       WHERE user_id = ? AND practice_date >= ? AND practice_date <= ?`,
      [userId, fromStr, toStr]
    );
    const map = new Map();
    for (const r of rows) {
      const dateStr = StreakRepository.parseDateField(r.practice_date);
      map.set(dateStr, {
        minutes: Number(r.minutes) || 0,
        wordsLearned: Number(r.words_learned) || 0,
        accuracyPercent: r.accuracy_percent != null ? Number(r.accuracy_percent) : 0,
      });
    }
    return map;
  }

  static async recordPracticeDay(userId, dateStr, { minutes = 0, wordsLearned = 0, accuracyPercent = null } = {}) {
    await this.ensureStatsRow(userId);

    const mins = Math.max(0, minutes);
    const words = Math.max(0, wordsLearned);

    const [dayRows] = await pool.execute(
      `SELECT minutes, words_learned, accuracy_percent, accuracy_samples
       FROM user_practice_days WHERE user_id = ? AND practice_date = ? LIMIT 1`,
      [userId, dateStr]
    );
    const dayRow = dayRows[0];
    let dayAccuracy = dayRow?.accuracy_percent ?? null;
    let daySamples = dayRow?.accuracy_samples ?? 0;
    if (accuracyPercent != null && !Number.isNaN(accuracyPercent)) {
      const score = Math.max(0, Math.min(100, Math.round(accuracyPercent)));
      if (daySamples === 0 || dayAccuracy == null) {
        dayAccuracy = score;
        daySamples = 1;
      } else {
        dayAccuracy = Math.round((dayAccuracy * daySamples + score) / (daySamples + 1));
        daySamples += 1;
      }
    }

    const wordsDelta = words > 0 ? words : Math.max(1, Math.floor(mins * 2));
    const dayWordsTotal = (dayRow?.words_learned ?? 0) + wordsDelta;

    if (dayRow) {
      await pool.execute(
        `UPDATE user_practice_days
         SET minutes = minutes + ?, words_learned = ?,
             accuracy_percent = ?, accuracy_samples = ?
         WHERE user_id = ? AND practice_date = ?`,
        [mins, dayWordsTotal, dayAccuracy, daySamples, userId, dateStr]
      );
    } else {
      await pool.execute(
        `INSERT INTO user_practice_days
         (user_id, practice_date, minutes, words_learned, accuracy_percent, accuracy_samples)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [userId, dateStr, mins, wordsDelta, dayAccuracy, daySamples]
      );
    }

    const stats = await this.getStats(userId);
    const last = stats?.last_practice_date
      ? this.parseDateField(stats.last_practice_date)
      : null;

    let streak = stats?.streak_days ?? 0;
    if (last !== dateStr) {
      if (last) {
        const yesterdayStr = addLocalDays(dateStr, -1);
        streak = last === yesterdayStr ? streak + 1 : 1;
      } else {
        streak = 1;
      }
    }

    let accuracyPercentStored = stats?.accuracy_percent ?? null;
    let accuracySamples = stats?.accuracy_samples ?? 0;
    if (accuracyPercent != null && !Number.isNaN(accuracyPercent)) {
      const score = Math.max(0, Math.min(100, Math.round(accuracyPercent)));
      if (accuracySamples === 0 || accuracyPercentStored == null) {
        accuracyPercentStored = score;
        accuracySamples = 1;
      } else {
        accuracyPercentStored = Math.round(
          (accuracyPercentStored * accuracySamples + score) / (accuracySamples + 1)
        );
        accuracySamples += 1;
      }
    }

    await pool.execute(
      `UPDATE user_learning_stats
       SET streak_days = ?, last_practice_date = ?,
           total_practice_minutes = total_practice_minutes + ?,
           words_learned_count = words_learned_count + ?,
           accuracy_percent = ?, accuracy_samples = ?
       WHERE user_id = ?`,
      [
        streak,
        dateStr,
        mins,
        wordsDelta,
        accuracyPercentStored,
        accuracySamples,
        userId,
      ]
    );

    return { streakDays: streak, practiceDate: dateStr };
  }

  static buildWeekPayload(practiceMap, todayStr) {
    const mondayStr = startOfWeekMondayFromLocalDate(todayStr);
    const week = [];

    for (let i = 0; i < 7; i++) {
      const dateStr = addLocalDays(mondayStr, i);
      const dayData = practiceMap.get(dateStr) || {
        minutes: 0,
        wordsLearned: 0,
        accuracyPercent: 0,
      };
      week.push({
        dayKey: DAY_KEYS[i],
        date: dateStr,
        practiced: (dayData.minutes ?? 0) > 0,
        isToday: dateStr === todayStr,
        minutes: dayData.minutes,
        wordsLearned: dayData.wordsLearned,
        accuracyPercent: dayData.accuracyPercent,
      });
    }

    return week;
  }

  static async getStreakDashboard(userId, timezoneOffsetMinutes = 0) {
    const todayStr = localTodayString(timezoneOffsetMinutes);
    const fromStr = startOfWeekMondayFromLocalDate(todayStr);
    const toStr = addLocalDays(fromStr, 6);

    await this.ensureStatsRow(userId);
    const practiceMap = await this.getPracticeMapInRange(userId, fromStr, toStr);
    const stats = await this.getStats(userId);
    const week = this.buildWeekPayload(practiceMap, todayStr);
    const weekMinutes = await this.sumWeekMinutes(userId, fromStr, toStr);

    const userRow = await UserRepository.findById(userId);
    const cefrLevel = LessonRepository.normalizeCefr(userRow?.proficiency);
    const lessonsCompleted = await LessonRepository.countCompletedLessons(userId);

    const wordsLearned = stats?.words_learned_count ?? 0;
    const accuracyPercent = stats?.accuracy_percent ?? 0;

    return {
      streakDays: stats?.streak_days ?? 0,
      totalPracticeMinutes: stats?.total_practice_minutes ?? 0,
      lastPracticeDate: stats?.last_practice_date
        ? this.parseDateField(stats.last_practice_date)
        : null,
      week,
      progress: {
        wordsLearned,
        accuracyPercent,
        weekMinutes: Number(weekMinutes) || 0,
        cefrLevel,
        todayDayKey: todayDayKey(todayStr, fromStr),
        lessonsCompleted,
      },
    };
  }
}

module.exports = StreakRepository;
