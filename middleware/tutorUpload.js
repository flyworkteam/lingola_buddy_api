const multer = require('multer');
const path = require('path');

const storage = multer.memoryStorage();

function tutorFileFilter(type) {
  return (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (type === 'photo') {
      const ok = ['.png', '.jpg', '.jpeg', '.webp'].includes(ext);
      return ok ? cb(null, true) : cb(new Error('Photo must be png/jpg/webp'), false);
    }
    if (type === 'riv') {
      return ext === '.riv'
        ? cb(null, true)
        : cb(new Error('Rive file must be .riv'), false);
    }
    cb(new Error('Unknown upload type'), false);
  };
}

const uploadTutorPhoto = multer({
  storage,
  fileFilter: tutorFileFilter('photo'),
  limits: { fileSize: 15 * 1024 * 1024 },
}).single('photo');

const uploadTutorRiv = multer({
  storage,
  fileFilter: tutorFileFilter('riv'),
  limits: { fileSize: 30 * 1024 * 1024 },
}).single('riv');

module.exports = { uploadTutorPhoto, uploadTutorRiv };
