import type { Request } from "express";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);
export const CSRF_COOKIE_NAME = "csrf_token";
export const CSRF_HEADER_NAME = "x-csrf-token";

function normalizeHostname(value: string | undefined): string {
  return (value ?? "").trim().toLowerCase();
}

export function isLocalRequest(req: Request): boolean {
  const hostHeader = req.headers.host?.split(":")[0];
  const hostname = normalizeHostname(req.hostname || hostHeader);
  return LOCAL_HOSTS.has(hostname);
}

export function isDevAuthBypassEnabled(req: Request): boolean {
  return (
    process.env.NODE_ENV === "development" &&
    process.env.DEV_AUTH_BYPASS === "1" &&
    isLocalRequest(req)
  );
}

export function getAllowedOrigins(): Set<string> {
  const configured = (process.env.ALLOWED_ORIGINS ?? "")
    .split(",")
    .map(origin => origin.trim())
    .filter(Boolean);

  if (configured.length > 0) {
    return new Set(configured);
  }

  const appUrl = process.env.APP_URL?.trim();

  if (process.env.NODE_ENV === "development") {
    const defaults = [
      "http://localhost",
      "http://localhost:3000",
      "http://localhost:5173",
      "capacitor://localhost",
    ];
    if (appUrl) defaults.push(appUrl);
    return new Set(defaults);
  }

  return new Set(appUrl ? [appUrl] : []);
}

export function isTrustedUnsafeRequestSource(
  req: Request,
  allowedOrigins: Set<string>,
  requestOrigin: string | null
): boolean {
  const origin = req.header("origin")?.trim();
  if (origin) {
    return (
      allowedOrigins.has(origin) ||
      (!!requestOrigin && origin === requestOrigin)
    );
  }

  const referer = req.header("referer")?.trim();
  if (referer) {
    try {
      const refererOrigin = new URL(referer).origin;
      return (
        allowedOrigins.has(refererOrigin) ||
        (!!requestOrigin && refererOrigin === requestOrigin)
      );
    } catch {
      return false;
    }
  }

  // Browser hint header for cross-site requests.
  const fetchSite = req.header("sec-fetch-site")?.trim().toLowerCase();
  if (fetchSite && !["same-origin", "same-site", "none"].includes(fetchSite)) {
    return false;
  }

  // Allow non-browser clients that don't send Origin/Referer.
  return true;
}

export function generateCsrfToken(): string {
  return crypto.randomUUID().replace(/-/g, "");
}