'use strict';
const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');
const { v4: uuidv4 } = require('uuid');

const UPLOAD_DIR   = path.join(__dirname, '..', 'uploads');
const MAX_SIZE_MB   = parseInt(process.env.MAX_UPLOAD_MB || '20', 10);
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

// Ensure uploads directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// ─── Allowed MIME types ───────────────────────────────────────────────────────
const ALLOWED_MIME = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

const ALLOWED_EXT = new Set(['.pdf', '.docx']);

// ─── Disk storage — UUID-based filename ──────────────────────────────────────
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext  = path.extname(file.originalname).toLowerCase();
    const name = `${uuidv4()}${ext}`;
    cb(null, name);
  },
});

// ─── File filter ──────────────────────────────────────────────────────────────
const fileFilter = (_req, file, cb) => {
  const ext  = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype;

  if (ALLOWED_MIME.has(mime) && ALLOWED_EXT.has(ext)) {
    cb(null, true);
  } else {
    const err = new multer.MulterError('LIMIT_UNEXPECTED_FILE');
    err.message = `Unsupported file type "${ext}". Only PDF and DOCX are accepted.`;
    cb(err, false);
  }
};

// ─── Multer instance ──────────────────────────────────────────────────────────
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_SIZE_BYTES },
});

// ─── Multer error middleware ──────────────────────────────────────────────────
/**
 * Must be used AFTER upload.single() / upload.array() in the route chain.
 * Translates multer errors into structured API error responses.
 */
function multerErrorHandler(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    const messages = {
      LIMIT_FILE_SIZE: `File is too large. Maximum allowed size is ${MAX_SIZE_MB} MB.`,
      LIMIT_UNEXPECTED_FILE: err.message || 'Unexpected file field.',
      LIMIT_FILE_COUNT: 'Too many files. Only one file may be uploaded at a time.',
    };
    return res.status(400).json({
      success: false,
      error: {
        code: 'UPLOAD_ERROR',
        message: messages[err.code] || err.message,
      },
    });
  }

  if (err) return next(err);
  next();
}

module.exports = { upload, multerErrorHandler, UPLOAD_DIR };
