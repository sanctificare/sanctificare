import type { Express } from "express";
import { storageGetSignedUrl, storageExists } from "../storage";
import { ENV } from "./env";
import path from "path";
import fs from "fs";

export function registerStorageProxy(app: Express) {
  // Proxy for R2 storage — serves files via signed URLs
  app.get("/r2-storage/*", async (req, res) => {
    const key = (req.params as Record<string, string>)[0];
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

      let localFile = path.join(publicDir, "assets", key);
      if (!fs.existsSync(localFile)) {
        localFile = path.join(publicDir, key);
      }

      if (fs.existsSync(localFile)) {
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
}

