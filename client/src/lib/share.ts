import { isMobileApp } from "@/const";

export type ShareTextParams = {
  title?: string;
  text: string;
};

export type ShareResult =
  | { status: "shared" }
  | { status: "copied" }
  | { status: "downloaded" }
  | { status: "cancelled" }
  | { status: "failed" };

function isAbortError(err: unknown): boolean {
  return (
    err instanceof DOMException &&
    (err.name === "AbortError" || err.name === "NotAllowedError")
  ) || (err as any)?.name === "AbortError";
}

export async function copyImageToClipboard(blob: Blob): Promise<boolean> {
  try {
    if (typeof navigator !== "undefined" && navigator.clipboard && typeof ClipboardItem !== "undefined") {
      const item = new ClipboardItem({ [blob.type || "image/png"]: blob });
      await navigator.clipboard.write([item]);
      return true;
    }
    return false;
  } catch (err) {
    console.warn("Não foi possível copiar a imagem para a área de transferência:", err);
    return false;
  }
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/**
 * Shares plain text. On native (Capacitor) uses the Share plugin; on the web
 * uses the Web Share API. Falls back to copying to the clipboard on any
 * failure that is not a user cancellation.
 */
export async function shareText(params: ShareTextParams): Promise<ShareResult> {
  const { title, text } = params;

  // Native app: use the Capacitor Share plugin (reliable inside WebView).
  if (isMobileApp()) {
    try {
      const { Share } = await import("@capacitor/share");
      await Share.share({ title, text, dialogTitle: title });
      return { status: "shared" };
    } catch (err) {
      if (isAbortError(err)) return { status: "cancelled" };
      return (await copyText(text)) ? { status: "copied" } : { status: "failed" };
    }
  }

  // Web: use the Web Share API when available.
  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share({ title, text });
      return { status: "shared" };
    } catch (err) {
      if (isAbortError(err)) return { status: "cancelled" };
      return (await copyText(text)) ? { status: "copied" } : { status: "failed" };
    }
  }

  // No share support: copy to clipboard.
  return (await copyText(text)) ? { status: "copied" } : { status: "failed" };
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Strip the "data:*/*;base64," prefix.
      const base64 = result.includes(",") ? result.split(",")[1] : result;
      resolve(base64);
    };
    reader.onerror = () => reject(reader.readAsDataURL);
    reader.readAsDataURL(blob);
  });
}

function downloadBlob(blob: Blob, fileName: string): boolean {
  try {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = fileName;
    link.href = url;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return true;
  } catch {
    return false;
  }
}

/**
 * Shares an image (PNG blob). On native (Capacitor) writes the file to the
 * cache directory and shares it via the Share plugin; on the web uses the Web
 * Share API with files. Falls back to downloading the image when sharing is
 * not supported.
 */
export async function shareImage(
  blob: Blob,
  options: { fileName: string; title?: string; text?: string },
): Promise<ShareResult> {
  const { fileName, title, text } = options;

  // Native app: write to filesystem then share the file URI.
  if (isMobileApp()) {
    try {
      const [{ Filesystem, Directory }, { Share }] = await Promise.all([
        import("@capacitor/filesystem"),
        import("@capacitor/share"),
      ]);

      const base64 = await blobToBase64(blob);
      const written = await Filesystem.writeFile({
        path: fileName,
        data: base64,
        directory: Directory.Cache,
      });

      await Share.share({ title, text, files: [written.uri], dialogTitle: title });
      return { status: "shared" };
    } catch (err) {
      if (isAbortError(err)) return { status: "cancelled" };
      return downloadBlob(blob, fileName) ? { status: "downloaded" } : { status: "failed" };
    }
  }

  // Web: use the Web Share API with files when supported.
  if (typeof navigator !== "undefined" && navigator.canShare) {
    const file = new File([blob], fileName, { type: blob.type || "image/png" });
    if (navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title, text });
        return { status: "shared" };
      } catch (err) {
        if (isAbortError(err)) return { status: "cancelled" };
        return downloadBlob(blob, fileName) ? { status: "downloaded" } : { status: "failed" };
      }
    }
  }

  // No file-share support: download the image.
  return downloadBlob(blob, fileName) ? { status: "downloaded" } : { status: "failed" };
}
