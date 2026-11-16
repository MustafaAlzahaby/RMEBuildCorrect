const { S3Client } = require("@aws-sdk/client-s3");
const { env } = require("./env");

let s3Client;

function getS3Client() {
  s3Client ??= new S3Client({
    region: env.AWS_REGION,
    credentials: {
      accessKeyId: env.AWS_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    },
  });
  return s3Client;
}

module.exports = { getS3Client };
