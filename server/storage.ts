// Cloudflare R2 storage helpers for Sanctificare
// Uses the S3-compatible API provided by Cloudflare R2.
// Uploads files directly to the R2 bucket and returns public URLs.

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { ENV } from "./_core/env";


let _s3Client: S3Client | null = null;

function getR2Client(): S3Client {
  if (_s3Client) return _s3Client;

  if (!ENV.r2AccountId || !ENV.r2AccessKeyId || !ENV.r2SecretAccessKey) {
    throw new Error(
      "R2 config missing: set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, and R2_SECRET_ACCESS_KEY in .env"
    );
  }

  _s3Client = new S3Client({
    region: "auto",
    endpoint: `https://${ENV.r2AccountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: ENV.r2AccessKeyId,
      secretAccessKey: ENV.r2SecretAccessKey,
    },
  });

  return _s3Client;
}

function normalizeKey(relKey: string): string {
  return relKey.replace(/^\/+/, "");
}

function appendHashSuffix(relKey: string): string {
  const hash = crypto.randomUUID().replace(/-/g, "").slice(0, 8);
  const lastDot = relKey.lastIndexOf(".");
  if (lastDot === -1) return `${relKey}_${hash}`;
  return `${relKey.slice(0, lastDot)}_${hash}${relKey.slice(lastDot)}`;
}

/**
 * Upload a file to Cloudflare R2.
 * Returns the storage key and a public URL to access the file.
 */
export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  const client = getR2Client();
  const key = appendHashSuffix(normalizeKey(relKey));

  const body =
    typeof data === "string" ? Buffer.from(data, "utf-8") : data;

  await client.send(
    new PutObjectCommand({
      Bucket: ENV.r2BucketName,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );

  const url = ENV.r2PublicUrl
    ? `${ENV.r2PublicUrl.replace(/\/+$/, "")}/${key}`
    : `/r2-storage/${key}`;

  return { key, url };
}

/**
 * Get a public or proxied URL for a stored file.
 */
export async function storageGet(
  relKey: string
): Promise<{ key: string; url: string }> {
  const key = normalizeKey(relKey);
  const url = ENV.r2PublicUrl
    ? `${ENV.r2PublicUrl.replace(/\/+$/, "")}/${key}`
    : `/r2-storage/${key}`;
  return { key, url };
}

/**
 * Get a temporary signed URL for private file access (expires in 1 hour).
 */
export async function storageGetSignedUrl(relKey: string, bucket = ENV.r2BucketName): Promise<string> {
  const client = getR2Client();
  const key = normalizeKey(relKey);

  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  return getSignedUrl(client, command, { expiresIn: 3600 });
}

/**
 * Check if a file exists in the R2 bucket.
 */
export async function storageExists(relKey: string, bucket = ENV.r2BucketName): Promise<boolean> {
  try {
    const client = getR2Client();
    const key = normalizeKey(relKey);
    await client.send(
      new HeadObjectCommand({
        Bucket: bucket,
        Key: key,
      })
    );
    return true;
  } catch (err) {
    return false;
  }
}


/**
 * Delete a file from R2 storage.
 */
export async function storageDelete(relKey: string): Promise<void> {
  const client = getR2Client();
  const key = normalizeKey(relKey);

  await client.send(
    new DeleteObjectCommand({
      Bucket: ENV.r2BucketName,
      Key: key,
    })
  );
}
