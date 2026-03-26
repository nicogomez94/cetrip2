const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { AppError } = require('../middleware/error.middleware');
const { toAbsoluteUploadUrl } = require('../utils/media-url');

const ALLOWED_MIME = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const UPLOADS_DIR = path.join(__dirname, '..', '..', 'uploads');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
      cb(null, UPLOADS_DIR);
    } catch (err) {
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    cb(null, `${unique}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Tipo de archivo no permitido. Solo imágenes JPG, PNG, WEBP, GIF.', 400));
  }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: MAX_SIZE } });

const uploadImage = (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(new AppError('La imagen no puede superar los 5MB.', 400));
      }
      return next(new AppError(err.message, 400));
    }
    if (err) return next(err);

    if (!req.file) {
      return next(new AppError('No se recibió ningún archivo.', 400));
    }

    const url = toAbsoluteUploadUrl(req, req.file.filename);

    res.json({
      success: true,
      url,
      filename: req.file.filename,
      size: req.file.size,
    });
  });
};

module.exports = { uploadImage };
