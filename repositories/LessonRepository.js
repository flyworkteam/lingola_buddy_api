const pool = require('../config/database');
const { executeWithRetry } = require('../utils/dbRetry');

const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

class LessonRepository {
  static async findById(id) {
    return executeWithRetry(async () => {
      const [rows] = await pool.execute(
        'SELECT * FROM lessons WHERE id = ? LIMIT 1',
        [id]
      );
      return rows[0] ?? null;
    });
  }

  static async listByLevel(cefrLevel) {
    return executeWithRetry(async () => {
      const [rows] = await pool.execute(
        `SELECT * FROM lessons
         WHERE cefr_level = ?
         ORDER BY sort_order ASC`,
        [cefrLevel]
      );
      return rows;
    });
  }

  static async listAll() {
    return executeWithRetry(async () => {
      const [rows] = await pool.execute(
        `SELECT * FROM lessons ORDER BY FIELD(cefr_level, 'A1','A2','B1','B2','C1','C2'), sort_order ASC`
      );
      return rows;
    });
  }

  static async firstLessonIdForLevel(cefrLevel) {
    const rows = await this.listByLevel(cefrLevel);
    return rows[0]?.id ?? null;
  }

  static async countCompletedLessons(userId) {
    return executeWithRetry(async () => {
      const [rows] = await pool.execute(
        `SELECT COUNT(*) AS c FROM user_lesson_progress
         WHERE user_id = ? AND status = 'completed'`,
        [userId]
      );
      return rows[0]?.c ?? 0;
    });
  }

  static async getUserProgress(userId) {
    return executeWithRetry(async () => {
      const [rows] = await pool.execute(
        `SELECT lesson_id, status, completed_at, updated_at
         FROM user_lesson_progress WHERE user_id = ?`,
        [userId]
      );
      return rows;
    });
  }

  static async upsertProgress(userId, lessonId, status) {
    return executeWithRetry(async () => {
      const completedAt = status === 'completed' ? new Date() : null;
      await pool.execute(
        `INSERT INTO user_lesson_progress (user_id, lesson_id, status, completed_at)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           status = VALUES(status),
           completed_at = VALUES(completed_at)`,
        [userId, lessonId, status, completedAt]
      );
    });
  }

  static async setCurrentLessonId(userId, lessonId) {
    return executeWithRetry(async () => {
      await pool.execute(
        'UPDATE users SET current_lesson_id = ? WHERE id = ?',
        [lessonId, userId]
      );
    });
  }

  static async getCurrentLessonId(userId) {
    return executeWithRetry(async () => {
      const [rows] = await pool.execute(
        'SELECT current_lesson_id FROM users WHERE id = ? LIMIT 1',
        [userId]
      );
      return rows[0]?.current_lesson_id ?? null;
    });
  }

  static nextCefrLevel(current) {
    const level = LessonRepository.normalizeCefr(current);
    const idx = CEFR_LEVELS.indexOf(level);
    if (idx < 0 || idx >= CEFR_LEVELS.length - 1) return null;
    return CEFR_LEVELS[idx + 1];
  }

  static async allLessonsCompletedForLevel(userId, cefrLevel) {
    const lessons = await LessonRepository.listByLevel(cefrLevel);
    if (lessons.length === 0) return false;
    const progressRows = await LessonRepository.getUserProgress(userId);
    const progressMap = new Map(progressRows.map((r) => [r.lesson_id, r.status]));
    return lessons.every((l) => progressMap.get(l.id) === 'completed');
  }

  static normalizeCefr(raw) {
    const v = (raw || '').toString().trim().toUpperCase();
    if (CEFR_LEVELS.includes(v)) return v;
    const map = {
      NONE: 'A1',
      SIMPLE: 'A2',
      FLUENT: 'B1',
      BEGINNER: 'A1',
      ELEMENTARY: 'A2',
      INTERMEDIATE: 'B1',
      UPPER: 'B2',
      ADVANCED: 'C1',
      MASTERY: 'C2',
    };
    return map[v] || 'A1';
  }
}

module.exports = LessonRepository;
