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

