import type { Express } from "express";
import { storageGetSignedUrl } from "../storage";

export function registerStorageProxy(app: Express) {
  // Proxy for R2 storage — serves files via signed URLs
  app.get("/r2-storage/*", async (req, res) => {
    const key = (req.params as Record<string, string>)[0];
    if (!key) {
      res.status(400).send("Missing storage key");
      return;
    }

    try {
      let bucket = undefined;
      let cleanKey = key;
      if (key.startsWith("vela-virtual/")) {
        bucket = "vela-virtual";
        cleanKey = key.replace(/^vela-virtual\//, "");
      }
      
      const signedUrl = await storageGetSignedUrl(cleanKey, bucket);
      res.set("Cache-Control", "public, max-age=86400"); // cache 24h
      res.redirect(307, signedUrl);
    } catch (err) {
      console.error("[StorageProxy] R2 signed URL failed:", err);
      res.status(502).send("Storage proxy error");
    }
  });
}
