const LessonRepository = require('../repositories/LessonRepository');
const DailyConversationRepository = require('../repositories/DailyConversationRepository');
const DailyConversationService = require('./dailyConversationService');
const UserRepository = require('../repositories/UserRepository');

function mapLessonRow(row) {
  if (!row) return null;
  let goals = [];
  try {
    goals = typeof row.learning_goals === 'string'
      ? JSON.parse(row.learning_goals)
      : row.learning_goals;
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
    greetingOpener: row.greeting_opener,
  };
}

class LessonService {
  static async getCatalog(cefrLevel = null) {
    const rows = cefrLevel
      ? await LessonRepository.listByLevel(cefrLevel)
      : await LessonRepository.listAll();
    return rows.map(mapLessonRow);
  }

  static async getLesson(lessonId) {
    const row = await LessonRepository.findById(lessonId);
    return mapLessonRow(row);
  }

  static async getLessonForCall(lessonId) {
    const row = await LessonRepository.findById(lessonId);
    if (!row) return null;
    return {
      ...mapLessonRow(row),
      tutorPrompt: row.tutor_prompt,
      greetingOpener: row.greeting_opener,
    };
  }

  /** Initialize or refresh progress for user's CEFR band. */
  static async ensureUserProgress(userId, cefrLevel) {
    const level = LessonRepository.normalizeCefr(cefrLevel);
    const lessons = await LessonRepository.listByLevel(level);
    if (lessons.length === 0) return;

    const existing = await LessonRepository.getUserProgress(userId);
    const byLesson = new Map(existing.map((r) => [r.lesson_id, r.status]));

    for (let i = 0; i < lessons.length; i++) {
      const id = lessons[i].id;
      if (byLesson.has(id)) continue;
      const status = i === 0 ? 'in_progress' : 'locked';
      await LessonRepository.upsertProgress(userId, id, status);
    }

    let currentId = await LessonRepository.getCurrentLessonId(userId);
    if (!currentId || !lessons.some((l) => l.id === currentId)) {
      const inProg = existing.find((r) => r.status === 'in_progress');
      currentId = inProg?.lesson_id || lessons[0].id;
      await LessonRepository.setCurrentLessonId(userId, currentId);
      await LessonRepository.upsertProgress(userId, currentId, 'in_progress');
    }
  }

  static async getUserCurriculum(userId) {
    const userRow = await UserRepository.findById(userId);
    if (!userRow) return null;

    const cefrLevel = LessonRepository.normalizeCefr(userRow.proficiency);
    await this.ensureUserProgress(userId, cefrLevel);

    const lessons = await LessonRepository.listByLevel(cefrLevel);
    const progressRows = await LessonRepository.getUserProgress(userId);
    const progressMap = new Map(progressRows.map((r) => [r.lesson_id, r.status]));

    const items = lessons.map((row) => {
      const mapped = mapLessonRow(row);
      return {
        ...mapped,
        status: progressMap.get(row.id) || 'locked',
      };
    });

    let currentLessonId = await LessonRepository.getCurrentLessonId(userId);
    const currentLesson = items.find((l) => l.id === currentLessonId) || items.find((l) => l.status === 'in_progress') || items[0];

    if (currentLesson && currentLesson.id !== currentLessonId) {
      currentLessonId = currentLesson.id;
      await LessonRepository.setCurrentLessonId(userId, currentLessonId);
    }

    const completed = items.filter((l) => l.status === 'completed').length;
    const total = items.length;

    return {
      cefrLevel,
      learnLanguageCode: userRow.learn_language_code || 'en',
      currentLesson,
      currentLessonId: currentLesson?.id ?? null,
      lessons: items,
      completedCount: completed,
      totalCount: total,
      progressFraction: total > 0 ? completed / total : 0,
    };
  }

  static async setCurrentLesson(userId, lessonId) {
    const lesson = await LessonRepository.findById(lessonId);
    if (!lesson) throw new Error('Lesson not found');

    const userRow = await UserRepository.findById(userId);
    const userLevel = LessonRepository.normalizeCefr(userRow?.proficiency);
    if (lesson.cefr_level !== userLevel) {
      throw new Error('Lesson not in your level');
    }

    await LessonRepository.setCurrentLessonId(userId, lessonId);
    await LessonRepository.upsertProgress(userId, lessonId, 'in_progress');
    return this.getUserCurriculum(userId);
  }

  static async completeLesson(userId, lessonId) {
    const lesson = await LessonRepository.findById(lessonId);
    if (!lesson) throw new Error('Lesson not found');

    await LessonRepository.upsertProgress(userId, lessonId, 'completed');

    let levelAdvanced = false;
    let previousLevel = null;
    let newLevel = null;

    const level = lesson.cefr_level;
    const allDone = await LessonRepository.allLessonsCompletedForLevel(
      userId,
      level
    );

    if (allDone) {
      const nextCefr = LessonRepository.nextCefrLevel(level);
      if (nextCefr) {
        levelAdvanced = true;
        previousLevel = level;
        newLevel = nextCefr;
        await UserRepository.update(userId, { proficiency: nextCefr });
        await this.ensureUserProgress(userId, nextCefr);
        const firstId = await LessonRepository.firstLessonIdForLevel(nextCefr);
        if (firstId) {
          await LessonRepository.setCurrentLessonId(userId, firstId);
          await LessonRepository.upsertProgress(userId, firstId, 'in_progress');
        }
      }
    } else {
      const lessons = await LessonRepository.listByLevel(level);
      const idx = lessons.findIndex((l) => l.id === lessonId);
      const next = lessons[idx + 1];
      if (next) {
        await LessonRepository.upsertProgress(userId, next.id, 'in_progress');
        await LessonRepository.setCurrentLessonId(userId, next.id);
      }
    }

    const curriculum = await this.getUserCurriculum(userId);
    return {
      ...curriculum,
      levelAdvanced,
      previousLevel,
      newLevel,
    };
  }

  static async resolveLessonForUser(userId, lessonIdFromClient, options = {}) {
    const { skipFallback = false } = options;
    if (lessonIdFromClient) {
      const dcRow = await DailyConversationRepository.findById(lessonIdFromClient);
      if (dcRow) {
        return DailyConversationService.getForCall(lessonIdFromClient);
      }
      const row = await LessonRepository.findById(lessonIdFromClient);
      if (row) return this.getLessonForCall(lessonIdFromClient);
      if (skipFallback) return null;
    }
    if (skipFallback) return null;
    const userRow = await UserRepository.findById(userId);
    const cefr = LessonRepository.normalizeCefr(userRow?.proficiency);
    await this.ensureUserProgress(userId, cefr);
    let id = await LessonRepository.getCurrentLessonId(userId);
    if (!id) id = await LessonRepository.firstLessonIdForLevel(cefr);
    if (!id) return null;
    return this.getLessonForCall(id);
  }
}

module.exports = LessonService;
