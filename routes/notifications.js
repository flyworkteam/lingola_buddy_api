const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const NotificationService = require('../services/notificationService');

router.get('/me', authenticate, async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);
    const offset = parseInt(req.query.offset, 10) || 0;
    const notifications = await NotificationService.listForUser(req.userId, {
      limit,
      offset,
    });
    res.json({ success: true, data: { notifications } });
  } catch (e) {
    next(e);
  }
});

router.post('/me', authenticate, async (req, res, next) => {
  try {
    const notification = await NotificationService.record(req.userId, req.body || {});
    res.status(201).json({ success: true, data: { notification } });
  } catch (e) {
    next(e);
  }
});

router.post('/me/sync', authenticate, async (req, res, next) => {
  try {
    const items = req.body?.notifications;
    const result = await NotificationService.syncBatch(req.userId, items);
    res.json({ success: true, data: result });
  } catch (e) {
    next(e);
  }
});

router.delete('/me', authenticate, async (req, res, next) => {
  try {
    const result = await NotificationService.clearAll(req.userId);
    res.json({ success: true, data: result });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
