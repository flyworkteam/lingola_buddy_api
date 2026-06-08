const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const LessonService = require('../services/lessonService');
const LessonRepository = require('../repositories/LessonRepository');
const UserRepository = require('../repositories/UserRepository');

/**
 * GET /lessons — full catalog (optional ?level=A1)
 */
router.get('/', async (req, res, next) => {
  try {
    const level = req.query.level
      ? LessonRepository.normalizeCefr(req.query.level)
      : null;
    const lessons = await LessonService.getCatalog(level);
    res.json({ success: true, data: { lessons } });
  } catch (e) {
    next(e);
  }
});

/**
 * GET /lessons/me — current user curriculum + progress
 */
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const data = await LessonService.getUserCurriculum(req.user.id);
    if (!data) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
});

/**
 * PUT /lessons/me/current — start / switch active lesson
 * Body: { lessonId: "a1_03" }
 */
router.put('/me/current', authenticate, async (req, res, next) => {
  try {
    const lessonId = req.body?.lessonId;
    if (!lessonId || typeof lessonId !== 'string') {
      return res.status(400).json({ success: false, error: 'lessonId required' });
    }
    const data = await LessonService.setCurrentLesson(req.user.id, lessonId.trim());
    res.json({ success: true, data });
  } catch (e) {
    if (e.message === 'Lesson not found' || e.message === 'Lesson not in your level') {
      return res.status(400).json({ success: false, error: e.message });
    }
    next(e);
  }
});

/**
 * POST /lessons/me/:lessonId/complete
 */
router.post('/me/:lessonId/complete', authenticate, async (req, res, next) => {
  try {
    const data = await LessonService.completeLesson(
      req.user.id,
      req.params.lessonId
    );
    res.json({ success: true, data });
  } catch (e) {
    if (e.message === 'Lesson not found') {
      return res.status(404).json({ success: false, error: e.message });
    }
    next(e);
  }
});

/**
 * PUT /lessons/me/level — set CEFR and re-init progress
 * Body: { cefrLevel: "B1" }
 */
router.put('/me/level', authenticate, async (req, res, next) => {
  try {
    const cefrLevel = LessonRepository.normalizeCefr(req.body?.cefrLevel);
    await UserRepository.update(req.user.id, {
      proficiency: cefrLevel,
      learnLanguageCode: 'en',
    });
    await LessonService.ensureUserProgress(req.user.id, cefrLevel);
    const firstId = await LessonRepository.firstLessonIdForLevel(cefrLevel);
    if (firstId) {
      await LessonRepository.setCurrentLessonId(req.user.id, firstId);
      await LessonRepository.upsertProgress(req.user.id, firstId, 'in_progress');
    }
    const data = await LessonService.getUserCurriculum(req.user.id);
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
});

router.get('/:lessonId', async (req, res, next) => {
  try {
    const lesson = await LessonService.getLesson(req.params.lessonId);
    if (!lesson) {
      return res.status(404).json({ success: false, error: 'Lesson not found' });
    }
    res.json({ success: true, data: { lesson } });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
