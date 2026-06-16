const multer = require("multer");
const { AppError } = require("../utils/AppError");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 1024 * 1024 * 500,
    files: 25,
  },
});

function handleUploadError(error, _req, _res, next) {
  if (error instanceof multer.MulterError) {
    return next(new AppError(error.message, 400));
  }

  return next(error);
}

module.exports = { handleUploadError, upload };
