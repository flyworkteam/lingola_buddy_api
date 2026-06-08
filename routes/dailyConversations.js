const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const DailyConversationService = require('../services/dailyConversationService');

router.get('/me', authenticate, async (req, res, next) => {
  try {
    const data = await DailyConversationService.getUserCurriculum(req.user.id);
    if (!data) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
});

router.put('/me/current', authenticate, async (req, res, next) => {
  try {
    const conversationId = req.body?.conversationId;
    if (!conversationId) {
      return res
        .status(400)
        .json({ success: false, error: 'conversationId is required' });
    }
    const data = await DailyConversationService.setCurrent(
      req.user.id,
      conversationId
    );
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
});

router.post('/me/:conversationId/complete', authenticate, async (req, res, next) => {
  try {
    const data = await DailyConversationService.complete(
      req.user.id,
      req.params.conversationId
    );
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
