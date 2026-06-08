const ConversationRepository = require('../repositories/ConversationRepository');
const ConversationMessageRepository = require('../repositories/ConversationMessageRepository');

function previewText(text, max = 160) {
  const t = (text || '').trim();
  if (!t) return '';
  return t.length > max ? `${t.substring(0, max - 3)}...` : t;
}

class ConversationService {
  static async getOrCreate(userId, tutorId) {
    let row = await ConversationRepository.findByUserAndTutor(userId, tutorId);
    if (!row) {
      row = await ConversationRepository.create(userId, tutorId);
    }
    return row;
  }

  static toFlutterMessage(row) {
    return {
      id: row.clientId || `db-${row.id}`,
      role: row.role,
      text: row.text,
      attachment: row.attachment,
      createdAt: row.createdAt,
    };
  }

  static toFlutterSummary(row) {
    return {
      tutorId: row.tutorId,
      conversationId: row.id,
      lastMessagePreview: row.lastMessagePreview || '',
      updatedAtIso: row.lastMessageAt
        ? new Date(row.lastMessageAt).toISOString()
        : new Date(row.updatedAt).toISOString(),
    };
  }

  static async listSummaries(userId) {
    const rows = await ConversationRepository.listByUserId(userId);
    return rows
      .filter((r) => (r.lastMessagePreview || '').trim().length > 0)
      .map((r) => this.toFlutterSummary(r));
  }

  static async getMessages(userId, tutorId, { limit = 200 } = {}) {
    const conv = await ConversationRepository.findByUserAndTutor(userId, tutorId);
    if (!conv) {
      return { conversationId: null, messages: [], messageCount: 0 };
    }
    const rows = await ConversationMessageRepository.findByConversationId(
      conv.id,
      { limit }
    );
    return {
      conversationId: conv.id,
      messageCount: rows.length,
      messages: rows.map((r) => this.toFlutterMessage(r)),
    };
  }

  static async hasMessages(userId, tutorId) {
    const conv = await ConversationRepository.findByUserAndTutor(userId, tutorId);
    if (!conv) return false;
    const count = await ConversationMessageRepository.countByConversationId(conv.id);
    return count > 0;
  }

  static async addMessage(userId, tutorId, { role, text, clientId, attachment }) {
    const conv = await this.getOrCreate(userId, tutorId);
    const row = await ConversationMessageRepository.create({
      conversationId: conv.id,
      role,
      text: text || '',
      clientId: clientId || null,
      attachment: attachment || null,
    });
    const preview =
      (text || '').trim() ||
      (attachment?.displayName || '').trim() ||
      '';
    if (preview) {
      await ConversationRepository.updateLastMessage(
        conv.id,
        previewText(preview),
        new Date()
      );
    }
    return { conversation: conv, message: row };
  }

  /** Realtime: tutorId string slug */
  static async deleteConversation(userId, tutorId) {
    return ConversationRepository.deleteByUserAndTutor(userId, tutorId);
  }

  static async getOrCreateChat(userId, tutorId) {
    const conv = await this.getOrCreate(userId, tutorId);
    return { chatId: conv.id, conversationId: conv.id };
  }
}

module.exports = ConversationService;
