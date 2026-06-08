const pool = require('../config/database');

class ConversationRepository {
  static mapRow(row) {
    return {
      id: row.id,
      userId: row.user_id,
      tutorId: row.tutor_id,
      lastMessagePreview: row.last_message_preview,
      lastMessageAt: row.last_message_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  static async findByUserAndTutor(userId, tutorId) {
    const [rows] = await pool.execute(
      `SELECT * FROM conversations WHERE user_id = ? AND tutor_id = ? LIMIT 1`,
      [userId, tutorId]
    );
    return rows.length ? this.mapRow(rows[0]) : null;
  }

  static async create(userId, tutorId) {
    const [result] = await pool.execute(
      `INSERT INTO conversations (user_id, tutor_id) VALUES (?, ?)`,
      [userId, tutorId]
    );
    return this.findById(result.insertId);
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT * FROM conversations WHERE id = ? LIMIT 1`,
      [id]
    );
    return rows.length ? this.mapRow(rows[0]) : null;
  }

  static async listByUserId(userId, { limit = 100, offset = 0 } = {}) {
    const [rows] = await pool.execute(
      `SELECT * FROM conversations
       WHERE user_id = ?
       ORDER BY COALESCE(last_message_at, updated_at) DESC
       LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    );
    return rows.map((r) => this.mapRow(r));
  }

  static async deleteByUserAndTutor(userId, tutorId) {
    const [result] = await pool.execute(
      `DELETE FROM conversations WHERE user_id = ? AND tutor_id = ?`,
      [userId, tutorId]
    );
    return result.affectedRows > 0;
  }

  static async updateLastMessage(conversationId, preview, at = new Date()) {
    await pool.execute(
      `UPDATE conversations
       SET last_message_preview = ?, last_message_at = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [preview, at, conversationId]
    );
  }
}

module.exports = ConversationRepository;
