import { COOKIE_NAME } from "@shared/const";
import type { Express, Request, Response } from "express";
import { parse as parseCookie } from "cookie";
import * as db from "../db";
import { getCsrfCookieOptions, getSessionCookieOptions } from "./cookies";
import { ENV } from "./env";
import { CSRF_COOKIE_NAME, generateCsrfToken, isDevAuthBypassEnabled } from "./security";
import { sdk } from "./sdk";

const OAUTH_STATE_COOKIE_NAME = "oauth_state_nonce";
const OAUTH_STATE_TTL_MS = 1000 * 60 * 10;

type OAuthStatePayload = {
  redirectUri: string;
  nonce: string;
  appPath: string;
};

function sanitizeAppPath(value: string | undefined, fallback = "/dashboard") {
  if (!value) return fallback;
  if (!value.startsWith("/")) return fallback;
  if (value.startsWith("//")) return fallback;
  if (value.startsWith("/login") || value.startsWith("/redefinir-senha")) {
    return fallback;
  }
  return value;
}

function encodeOAuthState(payload: OAuthStatePayload) {
  return btoa(JSON.stringify(payload));
}

function decodeOAuthState(state: string): OAuthStatePayload | null {
  try {
    const decoded = atob(state);
    const parsed = JSON.parse(decoded) as Partial<OAuthStatePayload>;
    if (
      parsed &&
      typeof parsed.redirectUri === "string" &&
      parsed.redirectUri.length > 0 &&
      typeof parsed.nonce === "string" &&
      parsed.nonce.length > 0
    ) {
      const appPath = sanitizeAppPath(
        typeof parsed.appPath === "string" ? parsed.appPath : undefined
      );
      return { redirectUri: parsed.redirectUri, nonce: parsed.nonce, appPath };
    }
    return null;
  } catch {
    return null;
  }
}

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

export function registerOAuthRoutes(app: Express) {
  app.get("/api/oauth/login", async (req: Request, res: Response) => {
    // Intercept in dev auth bypass mode to handle login simulation
    if (isDevAuthBypassEnabled(req)) {
      const appPath = sanitizeAppPath(getQueryParam(req, "path"));
      res.redirect(302, `/api/oauth/callback?path=${encodeURIComponent(appPath)}`);
      return;
    }

    try {
      const hasReplitAuth = !!ENV.oAuthServerUrl && !!ENV.appId;
      const hasGoogleAuth = !!ENV.appId && !!ENV.googleClientSecret;
      if (!hasReplitAuth && !hasGoogleAuth) {
        throw new Error("OAuth server is not configured.");
      }

      const callbackUrl = `${req.protocol}://${req.get("host")}/api/oauth/callback`;
      const appPath = sanitizeAppPath(getQueryParam(req, "path"));
      const nonce = generateCsrfToken();
      const state = encodeOAuthState({ redirectUri: callbackUrl, nonce, appPath });
      const cookieOptions = getSessionCookieOptions(req);

      res.cookie(OAUTH_STATE_COOKIE_NAME, nonce, {
        ...cookieOptions,
        maxAge: OAUTH_STATE_TTL_MS,
      });

      const redirectUrl = await sdk.getAuthorizeUrl(callbackUrl, state);
      res.redirect(302, redirectUrl);
    } catch (error: any) {
      console.error("[OAuth] Login failed", error);
      const appPath = sanitizeAppPath(getQueryParam(req, "path"));
      const isConfigError = error?.message === "OAuth server is not configured.";
      const message = isConfigError
        ? "O login com Google não está configurado neste servidor. Por favor, use login com e-mail e senha."
        : "Não foi possível iniciar o login com o Google. Por favor, tente novamente mais tarde.";

      const searchParams = new URLSearchParams();
      searchParams.set("error", message);
      if (appPath && appPath !== "/dashboard") {
        searchParams.set("path", appPath);
      }

      res.redirect(302, `/login?${searchParams.toString()}`);
    }
  });

  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    // Intercept in dev auth bypass mode to handle login simulation
    if (isDevAuthBypassEnabled(req)) {
      const appPath = sanitizeAppPath(getQueryParam(req, "path"));
      const cookieOptions = getSessionCookieOptions(req);
      const csrfCookieOptions = getCsrfCookieOptions(req);
      res.clearCookie("dev_logged_out", { ...cookieOptions, maxAge: -1 });
      res.cookie(COOKIE_NAME, "dev-dummy-session-token", { ...cookieOptions, maxAge: ENV.sessionTtlMs });
      res.cookie(CSRF_COOKIE_NAME, generateCsrfToken(), {
        ...csrfCookieOptions,
        maxAge: ENV.sessionTtlMs,
      });
      res.redirect(302, appPath);
      return;
    }

    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");

    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }

    try {
      const decodedState = decodeOAuthState(state);
      const cookies = req.headers.cookie ? parseCookie(req.headers.cookie) : {};
      const expectedNonce = cookies[OAUTH_STATE_COOKIE_NAME];

      const cookieOptions = getSessionCookieOptions(req);
      res.clearCookie(OAUTH_STATE_COOKIE_NAME, { ...cookieOptions, maxAge: -1 });

      if (!decodedState || !expectedNonce || decodedState.nonce !== expectedNonce) {
        res.status(400).json({ error: "invalid oauth state" });
        return;
      }

      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);

      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }

      await db.upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: new Date(),
      });

      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ENV.sessionTtlMs,
      });

      const authCookieOptions = getSessionCookieOptions(req);
      const csrfCookieOptions = getCsrfCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...authCookieOptions, maxAge: ENV.sessionTtlMs });
      res.cookie(CSRF_COOKIE_NAME, generateCsrfToken(), {
        ...csrfCookieOptions,
        maxAge: ENV.sessionTtlMs,
      });

      res.redirect(302, decodedState.appPath);
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}
