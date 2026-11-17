const { GetObjectCommand, PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const crypto = require("crypto");
const fs = require("fs/promises");
const path = require("path");
const { Readable } = require("stream");
const { env } = require("../config/env");
const { getS3Client } = require("../config/s3");
const { AppError } = require("../utils/AppError");

const localUploadRoot = path.resolve(__dirname, "../../uploads");

function isS3Configured() {
  return Boolean(
    env.AWS_REGION &&
      env.AWS_ACCESS_KEY_ID &&
      env.AWS_SECRET_ACCESS_KEY &&
      env.AWS_S3_BUCKET &&
      env.AWS_ACCESS_KEY_ID !== "replace-me" &&
      env.AWS_SECRET_ACCESS_KEY !== "replace-me" &&
      env.AWS_S3_BUCKET !== "replace-me",
  );
}

function extensionFor(file) {
  const originalExtension = path.extname(file.originalname || "");
  return originalExtension || "";
}

function buildObjectKey(folder, file) {
  const id = crypto.randomUUID();
  return `${folder}/${Date.now()}-${id}${extensionFor(file)}`;
}

async function uploadFile(file, folder) {
  const key = buildObjectKey(folder, file);

  if (env.FILE_STORAGE === "local") {
    const localPath = path.resolve(localUploadRoot, key);
    if (!localPath.startsWith(`${localUploadRoot}${path.sep}`)) {
      throw new AppError("Invalid upload path", 400);
    }

    await fs.mkdir(path.dirname(localPath), { recursive: true });
    await fs.writeFile(localPath, file.buffer);
    return `local/${key.replaceAll("\\", "/")}`;
  }

  if (!isS3Configured()) {
    throw new AppError("File uploads are not configured yet. Add AWS S3 settings before uploading files.", 503);
  }

  await getS3Client().send(
    new PutObjectCommand({
      Bucket: env.AWS_S3_BUCKET,
      Key: key,
      Body: Readable.from(file.buffer),
      ContentType: file.mimetype,
    }),
  );

  return key;
}

async function getPresignedUrl(key, responseContentDisposition) {
  if (!key) {
    return "";
  }

  if (key.startsWith("local/")) {
    const relativePath = key
      .slice("local/".length)
      .split("/")
      .map(encodeURIComponent)
      .join("/");
    return `${env.API_BASE_URL.replace(/\/$/, "")}/uploads/${relativePath}`;
  }

  if (!isS3Configured()) {
    throw new AppError("File downloads are unavailable until S3 is configured", 503);
  }

  const command = new GetObjectCommand({
    Bucket: env.AWS_S3_BUCKET,
    Key: key,
    ResponseContentDisposition: responseContentDisposition,
  });

  return getSignedUrl(getS3Client(), command, {
    expiresIn: env.S3_SIGNED_URL_EXPIRES_SECONDS,
  });
}

async function sendPdfDownload(res, key) {
  if (key.startsWith("local/")) {
    return res.download(key.slice("local/".length), "guide.pdf", { root: localUploadRoot });
  }

  const url = await getPresignedUrl(key, 'attachment; filename="guide.pdf"');
  return res.redirect(url);
}

async function signLessonAssets(lesson) {
  const data = typeof lesson.toJSON === "function" ? lesson.toJSON() : { ...lesson };

  data.videoUrl = await getPresignedUrl(data.videoUrl);
  data.pdfUrl = await getPresignedUrl(data.pdfUrl);
  data.images = await Promise.all((data.images || []).map((key) => getPresignedUrl(key)));

  return data;
}

module.exports = { getPresignedUrl, sendPdfDownload, signLessonAssets, uploadFile };
