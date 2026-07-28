import { getLoginUrl, sanitizeAppPath } from "@/const";

const APP_SCHEME_BASE = "sanctificare://callback";

export function buildAppRouteDeepLink(path: string): string {
  const safePath = sanitizeAppPath(path, "/explore");
  return `${APP_SCHEME_BASE}${safePath}`;
}

export function openRouteInApp(path: string, fallbackPath?: string): void {
  if (typeof window === "undefined") return;

  const safePath = sanitizeAppPath(path, "/explore");
  const deepLink = buildAppRouteDeepLink(safePath);
  const fallbackUrl = fallbackPath ? sanitizeAppPath(fallbackPath, safePath) : getLoginUrl(safePath);

  const fallbackTimer = window.setTimeout(() => {
    window.location.href = fallbackUrl;
  }, 1200);

  const cancelFallback = () => {
    clearTimeout(fallbackTimer);
    window.removeEventListener("pagehide", cancelFallback);
    window.removeEventListener("blur", cancelFallback);
    document.removeEventListener("visibilitychange", onVisibilityChange);
  };

  const onVisibilityChange = () => {
    if (document.visibilityState === "hidden") {
      cancelFallback();
    }
  };

  window.addEventListener("pagehide", cancelFallback, { once: true });
  window.addEventListener("blur", cancelFallback, { once: true });
  document.addEventListener("visibilitychange", onVisibilityChange);

  window.location.href = deepLink;
}
