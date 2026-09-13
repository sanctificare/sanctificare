import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useAuth } from "../client/src/_core/hooks/useAuth";
import ErrorBoundary from "../client/src/components/ErrorBoundary";

vi.mock("wouter", () => ({ useLocation: () => ["/perfil", vi.fn()] }));
vi.mock("@/const", () => ({
  getLoginUrl: () => "/login",
  getStoredSessionToken: () => "session",
  getStoredCsrfToken: () => null,
  getApiBaseUrl: () => "",
  clearStoredAuthTokens: vi.fn(),
  isMobileApp: () => true,
}));

afterEach(() => vi.unstubAllGlobals());

describe("authenticated screen stability", () => {
  function readAuth(client: QueryClient) {
    let auth: ReturnType<typeof useAuth>;
    function Probe() {
      auth = useAuth();
      return null;
    }
    renderToString(createElement(QueryClientProvider, { client }, createElement(Probe)));
    return auth!;
  }

  it("preserves the authenticated screen after a background network failure and recovery", async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const user = { id: 7, name: "Maria" };
    const queryKey = ["auth", "me"];
    client.setQueryData(queryKey, user);
    try {
      await expect(client.fetchQuery({ queryKey, queryFn: () => Promise.reject(new Error("Failed to fetch")) }))
        .rejects.toThrow("Failed to fetch");
      expect(client.getQueryState(queryKey)?.status).toBe("error");
      expect(readAuth(client)).toMatchObject({ user, isAuthenticated: true, loading: false });
      await client.fetchQuery({ queryKey, queryFn: async () => user });
      expect(readAuth(client)).toMatchObject({ user, isAuthenticated: true, loading: false });
    } finally {
      client.clear();
    }
  });

  it("still removes authentication when the server explicitly returns no session", () => {
    const client = new QueryClient();
    client.setQueryData(["auth", "me"], null);
    expect(readAuth(client)).toMatchObject({ user: null, isAuthenticated: false });
    client.clear();
  });

  it("does not authenticate a failed request without a previously loaded user", async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    await client.fetchQuery({ queryKey: ["auth", "me"], queryFn: async () => { throw new Error("offline"); } }).catch(() => {});
    expect(readAuth(client)).toMatchObject({ user: null, isAuthenticated: false });
    client.clear();
  });

  it.each(["Failed to fetch", "Failed to fetch dynamically imported module", "ChunkLoadError"])(
    "never automatically reloads the native screen for %s", (message) => {
      const reload = vi.fn();
      vi.stubGlobal("window", { location: { reload } });
      vi.stubGlobal("sessionStorage", { getItem: vi.fn(), setItem: vi.fn() });
      const boundary = new ErrorBoundary({ children: null });
      boundary.componentDidCatch(new Error(message));
      expect(reload).not.toHaveBeenCalled();
    },
  );
});
