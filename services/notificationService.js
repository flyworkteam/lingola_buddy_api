const NotificationRepository = require('../repositories/NotificationRepository');

function parseDeliveredAt(value) {
  if (!value) return new Date();
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? new Date() : d;
}

function toMysqlDatetime(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} `
    + `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

class NotificationService {
  static toFlutterItem(row) {
    const deliveredAt = row.deliveredAt instanceof Date
      ? row.deliveredAt
      : new Date(row.deliveredAt);
    return {
      id: row.clientKey,
      emoji: row.emoji || '🔔',
      title: row.title,
      description: row.body || '',
      deliveredAtIso: deliveredAt.toISOString(),
    };
  }

  static async listForUser(userId, { limit = 50, offset = 0 } = {}) {
    const rows = await NotificationRepository.listByUserId(userId, { limit, offset });
    return rows.map((r) => this.toFlutterItem(r));
  }

  static async record(userId, input) {
    const clientKey = (input.clientKey || '').trim();
    const title = (input.title || '').trim();
    if (!clientKey || !title) {
      const err = new Error('clientKey and title are required');
      err.statusCode = 400;
      throw err;
    }

    const row = await NotificationRepository.upsert(userId, {
      clientKey,
      notificationType: (input.notificationType || 'reminder').trim(),
      emoji: (input.emoji || '🔔').trim(),
      title,
      body: input.body || input.description || null,
      deliveredAt: toMysqlDatetime(parseDeliveredAt(input.deliveredAtIso)),
    });

    return this.toFlutterItem(row);
  }

  static async syncBatch(userId, items) {
    if (!Array.isArray(items) || items.length === 0) {
      return { synced: 0 };
    }

    let synced = 0;
    for (const item of items.slice(0, 100)) {
      try {
        await this.record(userId, item);
        synced += 1;
      } catch (_) {}
    }
    return { synced };
  }

  static async clearAll(userId) {
    const deleted = await NotificationRepository.deleteAllByUserId(userId);
    return { deleted };
  }
}

module.exports = NotificationService;
