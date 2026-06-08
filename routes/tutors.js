const router = require('express').Router();
const TutorService = require('../services/tutorService');
const { resolveLocale } = require('../utils/tutorAssets');
const { createLogger } = require('../utils/logger');

const log = createLogger('TUTORS');

function readLocale(req) {
  const header = req.headers['x-ui-language'];
  const query = req.query?.locale;
  return resolveLocale(query || header || 'en');
}

router.get('/', async (req, res, next) => {
  try {
    const tutors = await TutorService.listActiveTutors(readLocale(req));
    res.status(200).json({
      success: true,
      data: { tutors: tutors.map((t) => t.toJSON()) },
    });
  } catch (error) {
    log.error('List tutors failed', error);
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const tutor = await TutorService.getTutorById(req.params.id, readLocale(req));
    if (!tutor) {
      return res.status(404).json({ success: false, error: 'Tutor not found' });
    }
    res.status(200).json({
      success: true,
      data: { tutor: tutor.toJSON() },
    });
  } catch (error) {
    log.error('Get tutor failed', error);
    next(error);
  }
});

module.exports = router;
