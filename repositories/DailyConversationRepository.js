const pool = require('../config/database');
const { executeWithRetry } = require('../utils/dbRetry');
const LessonRepository = require('./LessonRepository');

class DailyConversationRepository {
  static normalizeCefr(raw) {
    return LessonRepository.normalizeCefr(raw);
  }

  static async findById(id) {
    return executeWithRetry(async () => {
      const [rows] = await pool.execute(
        'SELECT * FROM daily_conversations WHERE id = ? LIMIT 1',
        [id]
      );
      return rows[0] ?? null;
    });
  }

  static async listByLevel(cefrLevel) {
    return executeWithRetry(async () => {
      const [rows] = await pool.execute(
        `SELECT * FROM daily_conversations
         WHERE cefr_level = ?
         ORDER BY sort_order ASC`,
        [cefrLevel]
      );
      return rows;
    });
  }

  static async firstIdForLevel(cefrLevel) {
    const rows = await this.listByLevel(cefrLevel);
    return rows[0]?.id ?? null;
  }

  static async getUserProgress(userId) {
    return executeWithRetry(async () => {
      const [rows] = await pool.execute(
        `SELECT conversation_id, status, completed_at, updated_at
         FROM user_daily_conversation_progress WHERE user_id = ?`,
        [userId]
      );
      return rows;
    });
  }

  static async upsertProgress(userId, conversationId, status) {
    return executeWithRetry(async () => {
      const completedAt = status === 'completed' ? new Date() : null;
      await pool.execute(
        `INSERT INTO user_daily_conversation_progress (user_id, conversation_id, status, completed_at)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           status = VALUES(status),
           completed_at = VALUES(completed_at)`,
        [userId, conversationId, status, completedAt]
      );
    });
  }

  static async setCurrentId(userId, conversationId) {
    return executeWithRetry(async () => {
      await pool.execute(
        'UPDATE users SET current_daily_conversation_id = ? WHERE id = ?',
        [conversationId, userId]
      );
    });
  }

  static async getCurrentId(userId) {
    return executeWithRetry(async () => {
      const [rows] = await pool.execute(
        'SELECT current_daily_conversation_id FROM users WHERE id = ? LIMIT 1',
        [userId]
      );
      return rows[0]?.current_daily_conversation_id ?? null;
    });
  }
}

module.exports = DailyConversationRepository;
