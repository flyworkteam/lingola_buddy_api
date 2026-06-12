const router = require('express').Router();
const panelController = require('../controllers/panelController');
const { panelAuth } = require('../middleware/panelAuth');
const { uploadTutorPhoto, uploadTutorRiv } = require('../middleware/tutorUpload');

router.use(panelAuth);

function wrapUpload(middleware) {
  return (req, res, next) => {
    middleware(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          contractVersion: '2',
          error: 'UPLOAD_ERROR',
          message: err.message,
        });
      }
      next();
    });
  };
}

router.get('/health', panelController.health);
router.get('/analyse', panelController.analyse);
router.get('/voices', panelController.listVoices);

router.get('/users/premium-ids', panelController.listPremiumUserIds);
router.get('/users', panelController.listUsers);
router.get('/users/:id', panelController.getUser);
router.patch('/users/:id', panelController.patchUser);

router.get('/tutors', panelController.listTutors);
router.post('/tutors', panelController.createTutor);
router.get('/tutors/:id', panelController.getTutor);
router.put('/tutors/:id', panelController.updateTutor);
router.patch('/tutors/:id', panelController.updateTutor);
router.delete('/tutors/:id', panelController.deleteTutor);
router.post('/tutors/:id/photo', wrapUpload(uploadTutorPhoto), panelController.uploadTutorPhoto);
router.post('/tutors/:id/riv', wrapUpload(uploadTutorRiv), panelController.uploadTutorRiv);

router.use((err, req, res, next) => {
  const status = err.statusCode || 500;
  res.status(status).json({
    contractVersion: '2',
    error: err.code || 'INTERNAL_ERROR',
    message: err.message || 'Internal server error',
  });
});

module.exports = router;
