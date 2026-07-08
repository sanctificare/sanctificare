import { trpc } from "@/lib/trpc";
import { UNAUTHED_ERR_MSG } from '@shared/const';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import App from "./App";
import { getLoginUrl, getApiBaseUrl, isMobileApp, getStoredCsrfToken, getStoredSessionToken, setStoredCsrfToken, setStoredSessionToken } from "./const";
import "./index.css";
import { CapacitorUpdater } from '@capgo/capacitor-updater';
import { App as CapApp } from '@capacitor/app';

const isOtaEnabled = import.meta.env.VITE_ENABLE_OTA === "true";

const parseVersionCore = (version: string | null | undefined) => {
  if (!version) return [0, 0, 0];
  const core = version.split("-")[0] ?? version;
  const [major = "0", minor = "0", patch = "0"] = core.split(".");
  return [major, minor, patch].map((part) => Number.parseInt(part, 10) || 0);
};

const compareVersionCore = (left: string | null | undefined, right: string | null | undefined) => {
  const leftParts = parseVersionCore(left);
  const rightParts = parseVersionCore(right);

  for (let index = 0; index < 3; index += 1) {
    if (leftParts[index] > rightParts[index]) return 1;
    if (leftParts[index] < rightParts[index]) return -1;
  }

  return 0;
};


// Global error overlay para Capacitor — mostra erros JS na tela em vez de tela branca.
if (typeof window !== 'undefined' && isMobileApp()) {
  const showFatalError = (msg: string) => {
    const existing = document.getElementById('__cap_err_overlay');
    if (existing) return;
    const el = document.createElement('div');
    el.id = '__cap_err_overlay';
    el.style.cssText = [
      'position:fixed', 'inset:0', 'z-index:99999',
      'background:#1a0010', 'color:#fff',
      'font-family:monospace', 'font-size:13px',
      'padding:24px', 'overflow:auto',
      'white-space:pre-wrap', 'word-break:break-all',
    ].join(';');
    el.textContent = '⚠️ Erro crítico:\n\n' + msg;
    document.body?.appendChild(el);
  };

  window.onerror = (_msg, src, line, col, err) => {
    showFatalError(`${err?.message ?? _msg}\n\n${src}:${line}:${col}\n\n${err?.stack ?? ''}`);
    return false;
  };

  window.addEventListener('unhandledrejection', (e) => {
    const reason = e.reason instanceof Error
      ? `${e.reason.message}\n${e.reason.stack ?? ''}`
      : String(e.reason);
    showFatalError('UnhandledRejection:\n' + reason);
  });
}

const rewriteMobileApiUrl = (rawUrl: string) => {
  if (rawUrl.startsWith("/")) {
    return `${getApiBaseUrl()}${rawUrl}`;
  }
  if (
    rawUrl.startsWith("http://localhost/") ||
    rawUrl.startsWith("capacitor://localhost/")
  ) {
    return rawUrl.replace(/^(http|capacitor):\/\/localhost/, getApiBaseUrl());
  }
  return rawUrl;
};


// Intercept all fetch requests on mobile to use absolute API URL and include credentials
if (typeof window !== "undefined" && isMobileApp()) {
  const originalFetch = window.fetch;
  window.fetch = function (input, init) {
    let targetInput: RequestInfo | URL = input;
    let targetUrl: string | null = null;

    if (typeof targetInput === "string") {
      targetUrl = rewriteMobileApiUrl(targetInput);
      targetInput = targetUrl;
    } else if (targetInput instanceof URL) {
      targetUrl = rewriteMobileApiUrl(targetInput.toString());
      targetInput = targetUrl;
    } else if (targetInput instanceof Request) {
      targetUrl = rewriteMobileApiUrl(targetInput.url);
      if (targetUrl !== targetInput.url) {
        targetInput = new Request(targetUrl, targetInput);
      }
    }

    const updatedInit = { ...init };

    const resolvedTargetUrl =
      targetUrl ?? (typeof targetInput === "string" ? targetInput : null);

    if (resolvedTargetUrl && resolvedTargetUrl.startsWith(getApiBaseUrl())) {
      updatedInit.credentials = "include";
      const sessionToken = getStoredSessionToken();
      if (sessionToken) {
        const headers = new Headers(
          updatedInit.headers ?? (targetInput instanceof Request ? targetInput.headers : undefined)
        );
        headers.set("Authorization", `Bearer ${sessionToken}`);
        updatedInit.headers = headers;
      }
    }

    return originalFetch.call(window, targetInput, updatedInit);
  };
  globalThis.fetch = window.fetch;
}

// On native (Capacitor) the CSRF cookie set by the remote API is stored in the
// native cookie jar and is NOT visible to document.cookie. Fetch the token from
// the API and persist it so mutations can send the x-csrf-token header.
if (typeof window !== "undefined" && isMobileApp()) {
  void (async () => {
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/auth/csrf`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json().catch(() => null);
        setStoredCsrfToken(data?.csrfToken);
      }
    } catch {
      /* offline or unreachable — mutations will retry after login */
    }
  })();
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      gcTime: 30 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: 1,
    },
    mutations: {
      retry: 1,
    },
  },
});
let authRedirectInFlight = false;

const readCookie = (name: string) => {
  if (typeof document === "undefined") return null;
  const encoded = encodeURIComponent(name);
  const chunks = document.cookie.split("; ");
  for (const chunk of chunks) {
    if (chunk.startsWith(`${encoded}=`)) {
      return decodeURIComponent(chunk.slice(encoded.length + 1));
    }
  }
  return null;
};

const redirectToLoginIfUnauthorized = (error: unknown) => {
  if (!(error instanceof TRPCClientError)) return;
  if (typeof window === "undefined") return;

  const isUnauthorized =
    error.message === UNAUTHED_ERR_MSG ||
    error.data?.code === "UNAUTHORIZED" ||
    error.data?.httpStatus === 401;

  const pathname = window.location.pathname;
  if (pathname === "/login" || pathname === "/redefinir-senha") {
    authRedirectInFlight = false;
    return;
  }

  if (!isUnauthorized) return;
  if (authRedirectInFlight) return;

  authRedirectInFlight = true;

  const currentPath = `${window.location.pathname}${window.location.search || ""}`;
  window.history.pushState({}, "", getLoginUrl(currentPath));
  window.dispatchEvent(new PopStateEvent("popstate"));
};

if (typeof window !== "undefined") {
  window.addEventListener("popstate", () => {
    const path = window.location.pathname;
    if (path === "/login" || path === "/" || path === "/dashboard") {
      authRedirectInFlight = false;
    }
  });
}

queryClient.getQueryCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.query.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Query Error]", error);
  }
});

queryClient.getMutationCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.mutation.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Mutation Error]", error);
  }
});

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson,
      fetch(input, init) {
        let targetInput = input;
        if (typeof targetInput === "string") {
          if (targetInput.startsWith("/")) {
            targetInput = `${getApiBaseUrl()}${targetInput}`;
          } else if (
            targetInput.startsWith("http://localhost/") ||
            targetInput.startsWith("capacitor://localhost/")
          ) {
            targetInput = targetInput.replace(
              /^(http|capacitor):\/\/localhost/,
              getApiBaseUrl()
            );
          }
        }
        return window.fetch(targetInput, {
          ...(init ?? {}),
          headers: (() => {
            const headers = new Headers(init?.headers ?? {});
            const csrfToken = readCookie("csrf_token") ?? getStoredCsrfToken();
            if (csrfToken) {
              headers.set("x-csrf-token", csrfToken);
            }
            const sessionToken = getStoredSessionToken();
            if (sessionToken) {
              headers.set("Authorization", `Bearer ${sessionToken}`);
            }
            return headers;
          })(),
          credentials: "include",
        });
      },
    }),
  ],
});

createRoot(document.getElementById("root")!).render(
  <trpc.Provider client={trpcClient} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </trpc.Provider>
);

// Live Updates (OTA) configuration for Capacitor native environment.
// The OTA download is disabled by default so the Android build always uses the
// synchronized bundle unless explicitly enabled at build time.
if (typeof window !== "undefined" && isMobileApp()) {
  void (async () => {
    try {
      // Wait for multiple paint frames to confirm the UI actually rendered.
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(resolve, 200)));
      });
      await CapacitorUpdater.notifyAppReady();

      if (!isOtaEnabled) {
        console.log("[OTA] Disabled by build flag. Using the synced Android bundle.");
        return;
      }

      const res = await fetch("https://pub-dc71a0e15f28405db17b1df753564e3c.r2.dev/live-update.json", {
        headers: { "Cache-Control": "no-cache" },
      });
      if (!res.ok) {
        console.warn("[OTA] Failed to fetch update metadata from server.");
        return;
      }

      const updateData = await res.json();
      if (!updateData || !updateData.version || !updateData.url || typeof updateData.url !== "string") {
        console.warn("[OTA] Invalid live-update.json format on server.");
        return;
      }

      const current = await CapacitorUpdater.current();
      // IMPORTANT: compare against bundle.version (the version string passed to
      // download()), NOT bundle.id — the id is an internal UUID (or "builtin")
      // and never matches the server version, which previously caused an
      // infinite download → set() → reload loop (app "piscando").
      const currentVersion = current?.bundle?.version || current?.bundle?.id;
      const nativeVersion = current?.native ?? currentVersion;
      console.log(`[OTA] Local web bundle version: ${currentVersion} | Native version: ${nativeVersion} | Server version: ${updateData.version}`);

      if (compareVersionCore(updateData.version, nativeVersion) < 0) {
        console.warn(
          `[OTA] Skipping downgrade. Server bundle ${updateData.version} is older than native ${nativeVersion}.`
        );
        return;
      }

      if (updateData.version !== currentVersion) {
        // Reuse an already-downloaded bundle for this version, if any.
        const list = await CapacitorUpdater.list().catch(() => null);
        let bundle = list?.bundles?.find((b) => b.version === updateData.version);

        if (!bundle) {
          console.log(`[OTA] Downloading new update version ${updateData.version}...`);
          bundle = await CapacitorUpdater.download({
            url: updateData.url,
            version: updateData.version,
          });
        }

        // Use next() instead of set(): set() reloads the WebView immediately,
        // interrupting whatever the user is doing (e.g. login). next() stages
        // the bundle to be applied on the next app restart.
        await CapacitorUpdater.next({ id: bundle.id });
        console.log(`[OTA] Update version ${updateData.version} staged. Will load on next restart.`);
      }
    } catch (err) {
      // Do NOT call CapacitorUpdater.reset() here: reset() reloads the WebView
      // immediately and a transient error (e.g. offline) would cause a reload loop.
      console.error("[OTA] Live update error:", err);
    }
  })();
}

// Deep linking handler for Google OAuth in Capacitor mobile app
if (typeof window !== "undefined" && isMobileApp()) {
  CapApp.addListener('appUrlOpen', (event: { url: string }) => {
    try {
      console.log("[DeepLink] Received URL:", event.url);
      if (event.url.startsWith("sanctificare://callback")) {
        const url = new URL(event.url.replace("sanctificare://callback", "http://localhost"));
        const token = url.searchParams.get("token");
        const csrf = url.searchParams.get("csrf");
        const uInfo = url.searchParams.get("u_info");
        
        if (token) {
          setStoredSessionToken(token);
          document.cookie = `app_session_id=${token}; path=/; max-age=2592000; SameSite=Lax`;
          console.log("[DeepLink] Stored session cookie");
          if (csrf) {
            document.cookie = `csrf_token=${csrf}; path=/; max-age=2592000; SameSite=Lax`;
            setStoredCsrfToken(csrf);
            console.log("[DeepLink] Stored CSRF cookie and token");
          }
          if (uInfo) {
            localStorage.setItem("app-runtime-user-info", uInfo);
            console.log("[DeepLink] Pre-seeded app-runtime-user-info from OAuth parameters");
          }
          if (isMobileApp()) {
            sessionStorage.setItem('__cap_app_started', '1');
          }
          const destination = `${url.pathname || "/dashboard"}${url.search || ""}${url.hash || ""}`;
          window.location.replace(destination);
        }
      }
    } catch (e) {
      console.error("[DeepLink] Error handling URL:", e);
    }
  });
}

