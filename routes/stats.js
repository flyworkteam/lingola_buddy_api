const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const StreakService = require('../services/streakService');
const { parseTimezoneOffsetMinutes } = require('../utils/clientTimezone');

router.get('/streak/me', authenticate, async (req, res, next) => {
  try {
    const tz = parseTimezoneOffsetMinutes(req);
    const data = await StreakService.getMyStreak(req.user.id, tz);
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
});

router.post('/practice/me', authenticate, async (req, res, next) => {
  try {
    const tz = parseTimezoneOffsetMinutes(req);
    const minutes = parseInt(req.body?.minutes, 10) || 0;
    const durationSeconds = parseInt(req.body?.durationSeconds, 10) || 0;
    const wordsLearned = parseInt(req.body?.wordsLearned, 10) || 0;
    const accuracyPercent =
      req.body?.accuracyPercent != null
        ? parseInt(req.body.accuracyPercent, 10)
        : null;
    const data = await StreakService.recordPractice(req.user.id, {
      minutes,
      durationSeconds,
      wordsLearned,
      accuracyPercent,
      timezoneOffsetMinutes: tz,
    });
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
