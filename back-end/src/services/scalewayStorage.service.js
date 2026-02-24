import crypto from "crypto";
import path from "path";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import s3 from "../config/scaleway.js";

function safeName(originalName = "file") {
  const base = path.basename(originalName).replace(/[^\w.\-]+/g, "_");
  return base.length > 120 ? base.slice(-120) : base;
}

export function buildKey(kind, originalName) {
  const folder = String(process.env.SCALEWAY_FOLDER || "uploads").replace(/^\/+|\/+$/g, "");
  const stamp = Date.now();
  const rand = crypto.randomBytes(6).toString("hex");
  const name = safeName(originalName);
  return `${folder}/${kind}/${stamp}_${rand}_${name}`;
}

export function publicUrlForKey(key) {
  const base = (process.env.SCALEWAY_PUBLIC_BASE_URL || "").replace(/\/+$/g, "");
  if (base) return `${base}/${key}`;
  const endpoint = (process.env.SCALEWAY_ENDPOINT || "").replace(/\/+$/g, "");
  const bucket = process.env.SCALEWAY_BUCKET_NAME;
  return `${endpoint}/${bucket}/${key}`;
}

export async function uploadBuffer({ buffer, key, contentType }) {
  const Bucket = process.env.SCALEWAY_BUCKET_NAME;

  const cmd = new PutObjectCommand({
    Bucket,
    Key: key,
    Body: buffer,
    ContentType: contentType || "application/octet-stream",
  });

  await s3.send(cmd);
  return { key, url: publicUrlForKey(key) };
}

export async function deleteObject(key) {
  if (!key) return;
  const Bucket = process.env.SCALEWAY_BUCKET_NAME;

  const cmd = new DeleteObjectCommand({
    Bucket,
    Key: key,
  });

  await s3.send(cmd);
}