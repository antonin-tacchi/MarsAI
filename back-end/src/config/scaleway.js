import { S3Client } from "@aws-sdk/client-s3";

const required = [
  "SCALEWAY_ACCESS_KEY",
  "SCALEWAY_SECRET_KEY",
  "SCALEWAY_ENDPOINT",
  "SCALEWAY_BUCKET_NAME",
  "SCALEWAY_REGION",
];

for (const k of required) {
  if (!process.env[k]) {
    console.warn(`⚠️ Missing env: ${k}`);
  }
}

const s3 = new S3Client({
  region: process.env.SCALEWAY_REGION,
  endpoint: process.env.SCALEWAY_ENDPOINT,
  credentials: {
    accessKeyId: process.env.SCALEWAY_ACCESS_KEY,
    secretAccessKey: process.env.SCALEWAY_SECRET_KEY,
  },
  forcePathStyle: true,
});

export default s3;