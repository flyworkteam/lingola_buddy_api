const pool = require('../config/database');

class NotificationRepository {
  static mapRow(row) {
    return {
      id: row.id,
      userId: row.user_id,
      clientKey: row.client_key,
      notificationType: row.notification_type,
      emoji: row.emoji,
      title: row.title,
      body: row.body,
      deliveredAt: row.delivered_at,
      createdAt: row.created_at,
    };
  }

  static async listByUserId(userId, { limit = 50, offset = 0 } = {}) {
    const [rows] = await pool.execute(
      `SELECT * FROM notifications
       WHERE user_id = ?
       ORDER BY delivered_at DESC
       LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    );
    return rows.map((r) => this.mapRow(r));
  }

  static async findByClientKey(userId, clientKey) {
    const [rows] = await pool.execute(
      `SELECT * FROM notifications
       WHERE user_id = ? AND client_key = ?
       LIMIT 1`,
      [userId, clientKey]
    );
    return rows.length ? this.mapRow(rows[0]) : null;
  }

  static async upsert(userId, payload) {
    const {
      clientKey,
      notificationType = 'reminder',
      emoji = '🔔',
      title,
      body = null,
      deliveredAt,
    } = payload;

    await pool.execute(
      `INSERT INTO notifications
        (user_id, client_key, notification_type, emoji, title, body, delivered_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
        notification_type = VALUES(notification_type),
        emoji = VALUES(emoji),
        title = VALUES(title),
        body = VALUES(body),
        delivered_at = VALUES(delivered_at)`,
      [userId, clientKey, notificationType, emoji, title, body, deliveredAt]
    );

    return this.findByClientKey(userId, clientKey);
  }

  static async deleteAllByUserId(userId) {
    const [result] = await pool.execute(
      `DELETE FROM notifications WHERE user_id = ?`,
      [userId]
    );
    return result.affectedRows;
  }
}

module.exports = NotificationRepository;
