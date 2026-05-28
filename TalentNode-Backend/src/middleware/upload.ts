import multer from 'multer';

const storage = multer.memoryStorage();

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB limit
  },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      return cb(new Error("UPLOAD_INVALID_FILE_TYPE"));
    }
    return cb(null, true);
  },
});
