import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TRPCClientError } from "@trpc/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { UNAUTHED_ERR_MSG } from "../shared/const";
import { useAuth } from "../client/src/_core/hooks/useAuth";
import {
  AUTH_ME_QUERY_KEY,
  resetSessionGuardForTests,
  revalidateSessionAfterUnauthorized,
} from "../client/src/lib/sessionGuard";

vi.mock("wouter", () => ({ useLocation: () => ["/dashboard", vi.fn()] }));
vi.mock("@/const", () => ({
  getLoginUrl: () => "/login",
  getStoredSessionToken: () => "expired-session",
  getStoredCsrfToken: () => null,
  getApiBaseUrl: () => "",
  clearStoredAuthTokens: vi.fn(),
  isMobileApp: () => true,
}));

// Reproduces the flicker: the JWT expires (SESSION_TTL_MS, 7 days by default)
// while the app still holds the cached user. Every protected API call returned
// 401 and main.tsx pushed /login, while Login saw the cached user and pushed
// /dashboard back, over and over.
describe("expired session does not bounce between /login and /dashboard", () => {
  const cachedUser = { id: 7, name: "Maria" };

  beforeEach(() => {
    resetSessionGuardForTests();
    vi.stubGlobal("window", {
      location: { search: "", pathname: "/dashboard" },
      history: { replaceState: vi.fn() },
    });
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => (key === "app-runtime-user-info" ? JSON.stringify(cachedUser) : null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    });
  });

  afterEach(() => vi.unstubAllGlobals());

  it("shows the cached user but revalidates it with the server on startup", () => {
    const client = new QueryClient();
    let auth: ReturnType<typeof useAuth>;
    function Probe() {
      auth = useAuth();
      return null;
    }
    renderToString(createElement(QueryClientProvider, { client }, createElement(Probe)));

    expect(auth!).toMatchObject({ user: cachedUser, isAuthenticated: true, loading: false });
    const query = client.getQueryCache().find({ queryKey: AUTH_ME_QUERY_KEY })!;
    expect(query.state.dataUpdatedAt).toBe(0);
    expect(query.isStaleByTime(1000 * 60 * 5)).toBe(true);
    client.clear();
  });

  it("revalidates /me once on a burst of 401s instead of navigating", () => {
    const client = new QueryClient();
    const invalidate = vi.spyOn(client, "invalidateQueries").mockResolvedValue();
    const pushState = vi.fn();
    vi.stubGlobal("window", { location: { pathname: "/dashboard" }, history: { pushState } });

    const unauthorized = new TRPCClientError(UNAUTHED_ERR_MSG);
    expect(revalidateSessionAfterUnauthorized(client, unauthorized, 1_000_000)).toBe(true);
    expect(revalidateSessionAfterUnauthorized(client, unauthorized, 1_000_500)).toBe(false);
    expect(revalidateSessionAfterUnauthorized(client, unauthorized, 1_002_000)).toBe(false);

    expect(invalidate).toHaveBeenCalledTimes(1);
    expect(invalidate).toHaveBeenCalledWith({ queryKey: AUTH_ME_QUERY_KEY, refetchType: "all" });
    expect(pushState).not.toHaveBeenCalled();
  });

  it("ignores errors that are not authentication failures", () => {
    const client = new QueryClient();
    const invalidate = vi.spyOn(client, "invalidateQueries").mockResolvedValue();
    expect(revalidateSessionAfterUnauthorized(client, new Error("Failed to fetch"))).toBe(false);
    expect(revalidateSessionAfterUnauthorized(client, new TRPCClientError("Internal error"))).toBe(false);
    expect(invalidate).not.toHaveBeenCalled();
  });

  it("logs the user out once /me confirms there is no session", () => {
    const client = new QueryClient();
    client.setQueryData(AUTH_ME_QUERY_KEY, null);
    let auth: ReturnType<typeof useAuth>;
    function Probe() {
      auth = useAuth();
      return null;
    }
    renderToString(createElement(QueryClientProvider, { client }, createElement(Probe)));
    expect(auth!).toMatchObject({ user: null, isAuthenticated: false });
    client.clear();
  });
});
