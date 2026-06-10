const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const ConversationService = require('../services/conversationService');
const ChatTutorVoiceService = require('../services/chatTutorVoiceService');

router.get('/me', authenticate, async (req, res, next) => {
  try {
    const conversations = await ConversationService.listSummaries(req.userId);
    res.json({ success: true, data: { conversations } });
  } catch (e) {
    next(e);
  }
});

router.get('/tutor/:tutorId/messages', authenticate, async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 200;
    const data = await ConversationService.getMessages(
      req.userId,
      req.params.tutorId,
      { limit }
    );
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
});

router.get('/tutor/:tutorId/has-messages', authenticate, async (req, res, next) => {
  try {
    const hasMessages = await ConversationService.hasMessages(
      req.userId,
      req.params.tutorId
    );
    res.json({ success: true, data: { hasMessages } });
  } catch (e) {
    next(e);
  }
});

router.delete('/tutor/:tutorId', authenticate, async (req, res, next) => {
  try {
    const deleted = await ConversationService.deleteConversation(
      req.userId,
      req.params.tutorId
    );
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Conversation not found' });
    }
    res.json({ success: true, data: { deleted: true } });
  } catch (e) {
    next(e);
  }
});

router.post('/tutor/:tutorId/synthesize-voice', authenticate, async (req, res, next) => {
  try {
    const text = (req.body?.text || '').toString();
    const data = await ChatTutorVoiceService.synthesize(req.params.tutorId, text);
    res.json({ success: true, data });
  } catch (e) {
    if (e.statusCode) {
      return res.status(e.statusCode).json({ success: false, error: e.message });
    }
    next(e);
  }
});

router.post('/tutor/:tutorId/messages', authenticate, async (req, res, next) => {
  try {
    const { role, text, clientId, attachment } = req.body || {};
    if (!role || !['user', 'assistant', 'system'].includes(role)) {
      return res.status(400).json({ success: false, error: 'Invalid role' });
    }
    const result = await ConversationService.addMessage(
      req.userId,
      req.params.tutorId,
      { role, text: text || '', clientId, attachment }
    );
    res.status(201).json({
      success: true,
      data: {
        message: ConversationService.toFlutterMessage(result.message),
        conversationId: result.conversation.id,
      },
    });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
