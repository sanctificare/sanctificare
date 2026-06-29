export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

const DEFAULT_POST_AUTH_PATH = "/dashboard";

export const sanitizeAppPath = (
  value: string | null | undefined,
  fallback = DEFAULT_POST_AUTH_PATH
) => {
  if (!value || typeof value !== "string") return fallback;

  // Allow absolute URLs on mobile redirect schemes for Capacitor (Android/iOS)
  const isAllowedOrigin =
    value.startsWith("http://localhost/") ||
    value.startsWith("capacitor://localhost/");
  if (isAllowedOrigin) {
    if (value.includes("/login") || value.includes("/redefinir-senha")) {
      return fallback;
    }
    return value;
  }

  if (!value.startsWith("/")) return fallback;
  if (value.startsWith("//")) return fallback;
  if (value.startsWith("/login") || value.startsWith("/redefinir-senha")) {
    return fallback;
  }
  return value;
};

function getCurrentPathWithSearch() {
  if (typeof window === "undefined") return null;
  const { pathname, search } = window.location;
  const current = `${pathname}${search || ""}`;
  return sanitizeAppPath(current, "");
}

// Generate login URL at runtime and preserve current path when available.
export const getLoginUrl = (returnPath?: string) => {
  const resolvedPath = sanitizeAppPath(returnPath ?? getCurrentPathWithSearch(), "");
  if (!resolvedPath) return "/login";
  return `/login?path=${encodeURIComponent(resolvedPath)}`;
};

export const isMobileApp = () => {
  if (typeof window === "undefined") return false;
  return (
    !!(window as any).Capacitor ||
    window.location.protocol.includes("capacitor") ||
    window.location.protocol.includes("chrome-extension") ||
    (window.location.hostname === "localhost" && !window.location.port)
  );
};

export const getApiBaseUrl = () => {
  if (isMobileApp()) {
    return "https://sanctificare.app";
  }
  return "";
};

export const resolveMediaUrl = (url: string | undefined): string => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
    return url;
  }
  if (url.startsWith("/")) {
    if (url.startsWith("/assets/") || url.startsWith("/audio/rosary/")) {
      return url;
    }
    return `${getApiBaseUrl()}${url}`;
  }
  return url;
};

export const resolveR2Redirect = async (url: string | undefined): Promise<string> => {
  if (!url) return "";
  const resolved = resolveMediaUrl(url);
  if (!isMobileApp() || !url.includes("/r2-storage/")) {
    return resolved;
  }
  try {
    const resolveApiUrl = resolved.replace("/r2-storage/", "/api/resolve-r2/");
    const res = await fetch(resolveApiUrl);
    if (res.ok) {
      const data = await res.json();
      if (data && data.url) {
        return data.url;
      }
    }
  } catch (err) {
    console.warn("[resolveR2Redirect] Failed to resolve via API:", err);
  }
  return resolved;
};



