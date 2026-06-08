const DailyConversationRepository = require('../repositories/DailyConversationRepository');
const UserRepository = require('../repositories/UserRepository');

function mapRow(row) {
  if (!row) return null;
  let goals = [];
  try {
    goals =
      typeof row.conversation_goals === 'string'
        ? JSON.parse(row.conversation_goals)
        : row.conversation_goals;
  } catch (_) {
    goals = [];
  }
  return {
    id: row.id,
    cefrLevel: row.cefr_level,
    sortOrder: row.sort_order,
    title: row.title,
    scenarioEmoji: row.scenario_emoji,
    subtitle: row.subtitle,
    description: row.description,
    learningGoals: goals,
  };
}

class DailyConversationService {
  static async ensureUserProgress(userId, cefrLevel) {
    const level = DailyConversationRepository.normalizeCefr(cefrLevel);
    const items = await DailyConversationRepository.listByLevel(level);
    if (items.length === 0) return;

    const existing = await DailyConversationRepository.getUserProgress(userId);
    const byId = new Map(existing.map((r) => [r.conversation_id, r.status]));

    for (let i = 0; i < items.length; i++) {
      const id = items[i].id;
      if (byId.has(id)) continue;
      const status = i === 0 ? 'in_progress' : 'locked';
      await DailyConversationRepository.upsertProgress(userId, id, status);
    }

    let currentId = await DailyConversationRepository.getCurrentId(userId);
    if (!currentId || !items.some((l) => l.id === currentId)) {
      const inProg = existing.find((r) => r.status === 'in_progress');
      currentId = inProg?.conversation_id || items[0].id;
      await DailyConversationRepository.setCurrentId(userId, currentId);
      await DailyConversationRepository.upsertProgress(
        userId,
        currentId,
        'in_progress'
      );
    }
  }

  static async getUserCurriculum(userId) {
    const userRow = await UserRepository.findById(userId);
    if (!userRow) return null;

    const cefrLevel = DailyConversationRepository.normalizeCefr(
      userRow.proficiency
    );
    await this.ensureUserProgress(userId, cefrLevel);

    const rows = await DailyConversationRepository.listByLevel(cefrLevel);
    const progressRows = await DailyConversationRepository.getUserProgress(userId);
    const progressMap = new Map(
      progressRows.map((r) => [r.conversation_id, r.status])
    );

    const conversations = rows.map((row) => {
      const mapped = mapRow(row);
      return {
        ...mapped,
        status: progressMap.get(row.id) || 'locked',
      };
    });

    let currentId = await DailyConversationRepository.getCurrentId(userId);
    const current =
      conversations.find((c) => c.id === currentId) ||
      conversations.find((c) => c.status === 'in_progress') ||
      conversations[0];

    if (current && current.id !== currentId) {
      currentId = current.id;
      await DailyConversationRepository.setCurrentId(userId, currentId);
    }

    const completed = conversations.filter((c) => c.status === 'completed').length;
    const total = conversations.length;

    return {
      cefrLevel,
      learnLanguageCode: userRow.learn_language_code || 'en',
      currentConversation: current,
      currentConversationId: current?.id ?? null,
      conversations,
      completedCount: completed,
      totalCount: total,
      progressFraction: total > 0 ? completed / total : 0,
    };
  }

  static async setCurrent(userId, conversationId) {
    const row = await DailyConversationRepository.findById(conversationId);
    if (!row) throw new Error('Daily conversation not found');

    const userRow = await UserRepository.findById(userId);
    const userLevel = DailyConversationRepository.normalizeCefr(
      userRow?.proficiency
    );
    if (row.cefr_level !== userLevel) {
      throw new Error('Conversation not in your level');
    }

    await DailyConversationRepository.setCurrentId(userId, conversationId);
    await DailyConversationRepository.upsertProgress(
      userId,
      conversationId,
      'in_progress'
    );
    return this.getUserCurriculum(userId);
  }

  static async complete(userId, conversationId) {
    const row = await DailyConversationRepository.findById(conversationId);
    if (!row) throw new Error('Daily conversation not found');

    await DailyConversationRepository.upsertProgress(
      userId,
      conversationId,
      'completed'
    );

    const level = row.cefr_level;
    const all = await DailyConversationRepository.listByLevel(level);
    const idx = all.findIndex((l) => l.id === conversationId);
    const next = all[idx + 1];
    if (next) {
      await DailyConversationRepository.upsertProgress(
        userId,
        next.id,
        'in_progress'
      );
      await DailyConversationRepository.setCurrentId(userId, next.id);
    }

    return this.getUserCurriculum(userId);
  }

  static async getForCall(conversationId) {
    const row = await DailyConversationRepository.findById(conversationId);
    if (!row) return null;
    const mapped = mapRow(row);
    return {
      ...mapped,
      tutorPrompt: row.tutor_prompt,
      greetingOpener: row.greeting_opener,
    };
  }

  static async resolveForUser(userId, idFromClient) {
    if (idFromClient) {
      const row = await DailyConversationRepository.findById(idFromClient);
      if (row) return this.getForCall(idFromClient);
    }
    const userRow = await UserRepository.findById(userId);
    const cefr = DailyConversationRepository.normalizeCefr(userRow?.proficiency);
    await this.ensureUserProgress(userId, cefr);
    let id = await DailyConversationRepository.getCurrentId(userId);
    if (!id) id = await DailyConversationRepository.firstIdForLevel(cefr);
    if (!id) return null;
    return this.getForCall(id);
  }
}

module.exports = DailyConversationService;
