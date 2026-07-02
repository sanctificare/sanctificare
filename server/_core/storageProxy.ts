import type { Express } from "express";
import { storageGetSignedUrl, storageExists } from "../storage";
import { ENV } from "./env";
import path from "path";
import fs from "fs";

function sanitizeStorageKey(key: string): string | null {
  const normalized = key.replace(/\\/g, "/").trim();
  if (!normalized || normalized.includes("\0")) return null;

  const segments = normalized.split("/");
  if (segments.some(segment => segment === "." || segment === "..")) {
    return null;
  }

  return normalized;
}

function safeResolveWithin(baseDir: string, relativePath: string): string | null {
  const base = path.resolve(baseDir);
  const resolved = path.resolve(baseDir, relativePath);
  const prefix = `${base}${path.sep}`;
  if (resolved !== base && !resolved.startsWith(prefix)) {
    return null;
  }
  return resolved;
}

export function registerStorageProxy(app: Express) {
  // Proxy for R2 storage — serves files via signed URLs
  app.get("/r2-storage/*", async (req, res) => {
    const rawKey = (req.params as Record<string, string>)[0];
    const key = rawKey ? sanitizeStorageKey(rawKey) : null;
    if (!key) {
      res.status(400).send("Missing storage key");
      return;
    }

    try {
      let bucket = ENV.r2BucketName;
      let cleanKey = key;
      let foundInR2 = false;

      if (key.startsWith("vela-virtual/")) {
        // 1. Try the dedicated "vela-virtual" bucket first
        const vKey = key.replace(/^vela-virtual\//, "");
        if (await storageExists(vKey, "vela-virtual")) {
          bucket = "vela-virtual";
          cleanKey = vKey;
          foundInR2 = true;
        } else if (await storageExists(key, ENV.r2BucketName)) {
          // 2. Try the default bucket with full key (vela-virtual/...)
          bucket = ENV.r2BucketName;
          cleanKey = key;
          foundInR2 = true;
        }
      } else {
        // Standard keys: check default bucket
        if (await storageExists(key, ENV.r2BucketName)) {
          bucket = ENV.r2BucketName;
          cleanKey = key;
          foundInR2 = true;
        }
      }

      if (foundInR2) {
        const signedUrl = await storageGetSignedUrl(cleanKey, bucket);
        res.set("Cache-Control", "public, max-age=86400"); // cache 24h
        res.redirect(307, signedUrl);
        return;
      }

      console.warn(`[StorageProxy] Key "${key}" not found in R2. Trying local fallback.`);
    } catch (err) {
      console.warn("[StorageProxy] R2 check failed, falling back to local file:", err);
    }

    // Local file fallback
    try {
      const publicDir = process.env.NODE_ENV === "development"
        ? path.resolve(import.meta.dirname, "../..", "client", "public")
        : path.resolve(import.meta.dirname, "public");

      let localFile = safeResolveWithin(publicDir, path.join("assets", key));
      if (!localFile || !fs.existsSync(localFile)) {
        localFile = safeResolveWithin(publicDir, key);
      }

      if (localFile && fs.existsSync(localFile)) {
        res.set("Cache-Control", "public, max-age=86400");
        res.sendFile(localFile);
        return;
      }
      console.error(`[StorageProxy] Local fallback file not found: ${localFile}`);
    } catch (localErr) {
      console.error("[StorageProxy] Local fallback error:", localErr);
    }

    res.status(404).send("File not found");
  });

  // Client resolution endpoint: returns JSON { url: signedUrl } instead of redirecting
  app.get("/api/resolve-r2/*", async (req, res) => {
    const rawKey = (req.params as Record<string, string>)[0];
    const key = rawKey ? sanitizeStorageKey(rawKey) : null;
    if (!key) {
      res.status(400).json({ error: "Missing storage key" });
      return;
    }

    try {
      let bucket = ENV.r2BucketName;
      let cleanKey = key;
      let foundInR2 = false;

      if (key.startsWith("vela-virtual/")) {
        const vKey = key.replace(/^vela-virtual\//, "");
        if (await storageExists(vKey, "vela-virtual")) {
          bucket = "vela-virtual";
          cleanKey = vKey;
          foundInR2 = true;
        } else if (await storageExists(key, ENV.r2BucketName)) {
          bucket = ENV.r2BucketName;
          cleanKey = key;
          foundInR2 = true;
        }
      } else {
        if (await storageExists(key, ENV.r2BucketName)) {
          bucket = ENV.r2BucketName;
          cleanKey = key;
          foundInR2 = true;
        }
      }

      if (foundInR2) {
        const signedUrl = await storageGetSignedUrl(cleanKey, bucket);
        res.json({ url: signedUrl });
        return;
      }
    } catch (err) {
      console.warn("[ResolveR2Proxy] R2 signed URL resolution failed:", err);
    }

    // Fallback to absolute local asset URL
    const scheme = req.headers["x-forwarded-proto"] || req.protocol;
    const publicUrl = `${scheme}://${req.get("host")}/assets/${key}`;
    res.json({ url: publicUrl });
  });
}

