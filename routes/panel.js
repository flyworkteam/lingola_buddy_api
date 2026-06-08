const router = require('express').Router();
const TutorService = require('../services/tutorService');
const { panelAuth } = require('../middleware/panelAuth');
const { uploadTutorPhoto, uploadTutorRiv } = require('../middleware/tutorUpload');
const { createLogger } = require('../utils/logger');

const log = createLogger('PANEL');

router.use(panelAuth);

function wrapUpload(middleware) {
  return (req, res, next) => {
    middleware(req, res, (err) => {
      if (err) {
        return res.status(400).json({ success: false, error: err.message });
      }
      next();
    });
  };
}

/** GET /panel/tutors — pasif dahil tüm eğitmenler + çeviriler */
router.get('/tutors', async (_req, res, next) => {
  try {
    const items = await TutorService.listAllForPanel();
    res.status(200).json({
      success: true,
      data: {
        tutors: items.map(({ tutor, translations }) => ({
          ...tutor.toJSON({ includeInactive: true }),
          translations: translations.map((t) => ({
            locale: t.locale,
            displayName: t.display_name,
            description: t.description,
            tagline: t.tagline,
          })),
        })),
        supportedLocales: TutorService.supportedLocales(),
      },
    });
  } catch (error) {
    log.error('Panel list tutors failed', error);
    next(error);
  }
});

/** GET /panel/tutors/:id */
router.get('/tutors/:id', async (req, res, next) => {
  try {
    const item = await TutorService.getForPanel(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, error: 'Tutor not found' });
    }
    res.status(200).json({
      success: true,
      data: {
        tutor: {
          ...item.tutor.toJSON({ includeInactive: true }),
          translations: item.translations.map((t) => ({
            locale: t.locale,
            displayName: t.display_name,
            description: t.description,
            tagline: t.tagline,
          })),
        },
        supportedLocales: TutorService.supportedLocales(),
      },
    });
  } catch (error) {
    log.error('Panel get tutor failed', error);
    next(error);
  }
});

/** POST /panel/tutors — yeni eğitmen */
router.post('/tutors', async (req, res, next) => {
  try {
    const item = await TutorService.createFromPanel(req.body || {});
    res.status(201).json({
      success: true,
      data: {
        tutor: {
          ...item.tutor.toJSON({ includeInactive: true }),
          translations: item.translations.map((t) => ({
            locale: t.locale,
            displayName: t.display_name,
            description: t.description,
            tagline: t.tagline,
          })),
        },
      },
      message: 'Tutor created',
    });
  } catch (error) {
    const msg = error.message || 'Create failed';
    const status = msg.includes('already exists') ? 409 : 400;
    res.status(status).json({ success: false, error: msg });
  }
});

/** PUT /panel/tutors/:id — güncelle */
router.put('/tutors/:id', async (req, res, next) => {
  try {
    const item = await TutorService.updateFromPanel(req.params.id, req.body || {});
    res.status(200).json({
      success: true,
      data: {
        tutor: {
          ...item.tutor.toJSON({ includeInactive: true }),
          translations: item.translations.map((t) => ({
            locale: t.locale,
            displayName: t.display_name,
            description: t.description,
            tagline: t.tagline,
          })),
        },
      },
      message: 'Tutor updated',
    });
  } catch (error) {
    const msg = error.message || 'Update failed';
    const status = msg.includes('not found') ? 404 : 400;
    res.status(status).json({ success: false, error: msg });
  }
});

/** DELETE /panel/tutors/:id — soft delete (is_active=0) */
router.delete('/tutors/:id', async (req, res, next) => {
  try {
    const item = await TutorService.deactivate(req.params.id);
    res.status(200).json({
      success: true,
      data: { tutor: item.tutor.toJSON({ includeInactive: true }) },
      message: 'Tutor deactivated',
    });
  } catch (error) {
    const msg = error.message || 'Delete failed';
    res.status(msg.includes('not found') ? 404 : 400).json({ success: false, error: msg });
  }
});

/** POST /panel/tutors/:id/photo — multipart field: photo */
router.post(
  '/tutors/:id/photo',
  wrapUpload(uploadTutorPhoto),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: 'photo file is required' });
      }
      const item = await TutorService.uploadAsset(
        req.params.id,
        req.file.buffer,
        req.file.originalname,
        'photo'
      );
      res.status(200).json({
        success: true,
        data: { tutor: item.tutor.toJSON({ includeInactive: true }) },
        message: 'Photo uploaded',
      });
    } catch (error) {
      const msg = error.message || 'Upload failed';
      res.status(msg.includes('not found') ? 404 : 400).json({ success: false, error: msg });
    }
  }
);

/** POST /panel/tutors/:id/riv — multipart field: riv */
router.post(
  '/tutors/:id/riv',
  wrapUpload(uploadTutorRiv),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: 'riv file is required' });
      }
      const item = await TutorService.uploadAsset(
        req.params.id,
        req.file.buffer,
        req.file.originalname,
        'riv'
      );
      res.status(200).json({
        success: true,
        data: { tutor: item.tutor.toJSON({ includeInactive: true }) },
        message: 'Rive file uploaded',
      });
    } catch (error) {
      const msg = error.message || 'Upload failed';
      res.status(msg.includes('not found') ? 404 : 400).json({ success: false, error: msg });
    }
  }
);

module.exports = router;
