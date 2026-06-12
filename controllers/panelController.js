const panelService = require('../services/panelService');
const panelVoiceService = require('../services/panelVoiceService');
const { CONTRACT_VERSION } = require('../utils/panelMappers');

function parsePagination(query) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
  return { page, limit };
}

const health = (req, res) => {
  res.json({
    ok: true,
    service: 'lingola-buddy-api',
    contractVersion: CONTRACT_VERSION,
  });
};

const analyse = async (req, res, next) => {
  try {
    const payload = await panelService.getAnalyse();
    res.json({
      contractVersion: CONTRACT_VERSION,
      generatedAt: new Date().toISOString(),
      timezone: panelService.getTimezone(),
      summary: payload.summary,
      daily: payload.daily,
      ...(payload.audienceInsights ? { audienceInsights: payload.audienceInsights } : {}),
      ...(payload.tutorsSummary ? { tutorsSummary: payload.tutorsSummary } : {}),
    });
  } catch (error) {
    next(error);
  }
};

const listUsers = async (req, res, next) => {
  try {
    const { page, limit } = parsePagination(req.query);
    const result = await panelService.listUsers({
      page,
      limit,
      search: req.query.search?.trim() || '',
      premium: req.query.premium === '1' || req.query.premium === 'true',
    });
    res.json({
      contractVersion: CONTRACT_VERSION,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

const getUser = async (req, res, next) => {
  try {
    const user = await panelService.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'User not found' });
    }
    res.json({ contractVersion: CONTRACT_VERSION, data: user });
  } catch (error) {
    next(error);
  }
};

const patchUser = async (req, res, next) => {
  try {
    const user = await panelService.patchUser(req.params.id, req.body);
    if (!user) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'User not found' });
    }
    res.json({ contractVersion: CONTRACT_VERSION, data: user });
  } catch (error) {
    next(error);
  }
};

const listPremiumUserIds = async (req, res, next) => {
  try {
    const ids = await panelService.listPremiumUserIds();
    res.json({ contractVersion: CONTRACT_VERSION, data: ids, total: ids.length });
  } catch (error) {
    next(error);
  }
};

const listTutors = async (req, res, next) => {
  try {
    const { page, limit } = parsePagination(req.query);
    const result = await panelService.listTutors({
      page,
      limit,
      search: req.query.search?.trim() || '',
      status: req.query.status,
    });
    res.json({
      contractVersion: CONTRACT_VERSION,
      data: result.data,
      pagination: result.pagination,
      supportedLocales: result.supportedLocales,
    });
  } catch (error) {
    next(error);
  }
};

const getTutor = async (req, res, next) => {
  try {
    const tutor = await panelService.getTutorById(req.params.id);
    if (!tutor) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Tutor not found' });
    }
    res.json({ contractVersion: CONTRACT_VERSION, data: tutor });
  } catch (error) {
    next(error);
  }
};

const createTutor = async (req, res, next) => {
  try {
    const tutor = await panelService.createTutor(req.body);
    res.status(201).json({ contractVersion: CONTRACT_VERSION, data: tutor });
  } catch (error) {
    const msg = error.message || 'Create failed';
    const status = msg.includes('already exists') ? 409 : 400;
    res.status(status).json({ error: 'VALIDATION_ERROR', message: msg });
  }
};

const updateTutor = async (req, res, next) => {
  try {
    const tutor = await panelService.updateTutor(req.params.id, req.body);
    if (!tutor) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Tutor not found' });
    }
    res.json({ contractVersion: CONTRACT_VERSION, data: tutor });
  } catch (error) {
    const msg = error.message || 'Update failed';
    res.status(msg.includes('not found') ? 404 : 400).json({
      error: 'VALIDATION_ERROR',
      message: msg,
    });
  }
};

const deleteTutor = async (req, res, next) => {
  try {
    const tutor = await panelService.deleteTutor(req.params.id);
    if (!tutor) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Tutor not found' });
    }
    res.json({
      contractVersion: CONTRACT_VERSION,
      ok: true,
      data: tutor,
      message: 'Tutor archived',
    });
  } catch (error) {
    const msg = error.message || 'Delete failed';
    res.status(msg.includes('not found') ? 404 : 400).json({
      error: 'VALIDATION_ERROR',
      message: msg,
    });
  }
};

const uploadTutorPhoto = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'photo file is required' });
    }
    const tutor = await panelService.uploadTutorAsset(
      req.params.id,
      req.file.buffer,
      req.file.originalname,
      'photo'
    );
    res.json({ contractVersion: CONTRACT_VERSION, data: tutor });
  } catch (error) {
    const msg = error.message || 'Upload failed';
    res.status(msg.includes('not found') ? 404 : 400).json({
      error: 'UPLOAD_ERROR',
      message: msg,
    });
  }
};

const uploadTutorRiv = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'riv file is required' });
    }
    const tutor = await panelService.uploadTutorAsset(
      req.params.id,
      req.file.buffer,
      req.file.originalname,
      'riv'
    );
    res.json({ contractVersion: CONTRACT_VERSION, data: tutor });
  } catch (error) {
    const msg = error.message || 'Upload failed';
    res.status(msg.includes('not found') ? 404 : 400).json({
      error: 'UPLOAD_ERROR',
      message: msg,
    });
  }
};

const listVoices = async (req, res, next) => {
  try {
    const result = await panelVoiceService.listVoices({
      gender: req.query.gender?.trim() || '',
    });
    res.json({
      contractVersion: CONTRACT_VERSION,
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  health,
  analyse,
  listVoices,
  listUsers,
  getUser,
  patchUser,
  listPremiumUserIds,
  listTutors,
  getTutor,
  createTutor,
  updateTutor,
  deleteTutor,
  uploadTutorPhoto,
  uploadTutorRiv,
};
