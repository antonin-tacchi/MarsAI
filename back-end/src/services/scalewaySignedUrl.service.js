import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import s3 from "../config/scaleway.js";

export async function signGetUrl(key, expiresInSec) {
  if (!key) return null;

  const Bucket = process.env.SCALEWAY_BUCKET_NAME;
  const expiresIn = Number(expiresInSec ?? process.env.S3_SIGNED_URL_EXPIRES ?? 7200);

  const cmd = new GetObjectCommand({
    Bucket,
    Key: key,
  });

  return await getSignedUrl(s3, cmd, { expiresIn });
}