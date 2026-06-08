const pool = require('../config/database');

class ConversationMessageRepository {
  static mapRow(row) {
    let attachment = null;
    if (row.attachment_json) {
      try {
        attachment =
          typeof row.attachment_json === 'string'
            ? JSON.parse(row.attachment_json)
            : row.attachment_json;
      } catch (_) {
        attachment = null;
      }
    }
    return {
      id: row.id,
      conversationId: row.conversation_id,
      clientId: row.client_id,
      role: row.role,
      text: row.text,
      attachment,
      createdAt: row.created_at,
    };
  }

  static async findByConversationId(conversationId, { limit = 200, offset = 0 } = {}) {
    const [rows] = await pool.execute(
      `SELECT * FROM conversation_messages
       WHERE conversation_id = ?
       ORDER BY created_at ASC, id ASC
       LIMIT ? OFFSET ?`,
      [conversationId, limit, offset]
    );
    return rows.map((r) => this.mapRow(r));
  }

  static async create({
    conversationId,
    role,
    text,
    clientId = null,
    attachment = null,
  }) {
    const attachmentJson = attachment ? JSON.stringify(attachment) : null;
    const [result] = await pool.execute(
      `INSERT INTO conversation_messages
       (conversation_id, client_id, role, text, attachment_json)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         text = VALUES(text),
         attachment_json = VALUES(attachment_json)`,
      [conversationId, clientId, role, text, attachmentJson]
    );
    const id = result.insertId;
    if (id) {
      const [rows] = await pool.execute(
        `SELECT * FROM conversation_messages WHERE id = ? LIMIT 1`,
        [id]
      );
      if (rows.length) return this.mapRow(rows[0]);
    }
    if (clientId) {
      const [rows] = await pool.execute(
        `SELECT * FROM conversation_messages
         WHERE conversation_id = ? AND client_id = ? LIMIT 1`,
        [conversationId, clientId]
      );
      if (rows.length) return this.mapRow(rows[0]);
    }
    return null;
  }

  static async countByConversationId(conversationId) {
    const [rows] = await pool.execute(
      `SELECT COUNT(*) AS c FROM conversation_messages WHERE conversation_id = ?`,
      [conversationId]
    );
    return Number(rows[0]?.c) || 0;
  }

  /** Realtime WS geçmişi (OpenAI formatına yakın). */
  static async getChatHistory(conversationId, limit = 50) {
    const [rows] = await pool.execute(
      `SELECT role, text, attachment_json, created_at
       FROM conversation_messages
       WHERE conversation_id = ? AND role IN ('user', 'assistant')
       ORDER BY created_at ASC, id ASC
       LIMIT ?`,
      [conversationId, limit]
    );
    return rows.map((row) => {
      let messageType = 'text';
      let attachment = null;
      if (row.attachment_json) {
        try {
          attachment =
            typeof row.attachment_json === 'string'
              ? JSON.parse(row.attachment_json)
              : row.attachment_json;
        } catch (_) {}
      }
      if (attachment?.kind === 'voice') messageType = 'voice';
      if (attachment?.kind === 'image') messageType = 'image';

      return {
        sender: row.role === 'user' ? 'user' : 'assistant',
        message: row.text,
        sentTime: row.created_at,
        messageType,
        imageContent: attachment?.imageContent || null,
        voiceContent: attachment?.voiceContent || null,
      };
    });
  }
}

module.exports = ConversationMessageRepository;
