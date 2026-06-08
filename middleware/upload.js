const multer = require('multer');
const path = require('path');

const storage = multer.memoryStorage();

const fileFilter = (_req, file, cb) => {
  const allowedMimes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/octet-stream',
  ];

  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExtensions = {
    '.jpg': true,
    '.jpeg': true,
    '.png': true,
    '.gif': true,
    '.webp': true,
  };

  if (allowedMimes.includes(file.mimetype)) {
    if (file.mimetype === 'application/octet-stream' && !allowedExtensions[ext]) {
      cb(new Error('Invalid image file'), false);
      return;
    }
    cb(null, true);
    return;
  }

  if (allowedExtensions[ext]) {
    cb(null, true);
    return;
  }

  cb(new Error('Only image files are allowed'), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

module.exports = upload;
