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
import { initAnalytics } from "./lib/analytics";
import { applyCachedUserTemplate } from "./hooks/useUserTemplate";

// Cache buster for deployment: 2026-07-15 17:45
// Executable updates are intentionally locked to the Play Store bundle.
const isOtaEnabled = false;

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

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/intencoes",
  "/perfil",
  "/profile",
  "/perfil/zona-de-perigo",
  "/plano-diario",
  "/admin",
];

const isProtectedRoutePath = (pathname: string) => {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
};

const redirectToLoginIfUnauthorized = (error: unknown) => {
  if (!(error instanceof TRPCClientError)) return;
  if (typeof window === "undefined") return;

  const isUnauthorized =
    error.message === UNAUTHED_ERR_MSG ||
    error.data?.code === "UNAUTHORIZED" ||
    error.data?.httpStatus === 401;

  if (!isUnauthorized) return;

  const pathname = window.location.pathname;
  if (pathname === "/login" || pathname === "/redefinir-senha") {
    authRedirectInFlight = false;
    return;
  }

  // Rotas públicas (como santoral, biblia, oracoes, liturgia) não devem ser redirecionadas em caso de 401 em queries opcionais
  if (!isProtectedRoutePath(pathname)) {
    return;
  }

  if (authRedirectInFlight) return;

  authRedirectInFlight = true;

  const currentPath = `${window.location.pathname}${window.location.search || ""}`;
  window.history.pushState({}, "", getLoginUrl(currentPath));
  window.dispatchEvent(new PopStateEvent("popstate"));
};

if (typeof window !== "undefined") {
  // Reseta a flag em qualquer navegação: indica que o redirect anterior já pousou
  // e novos erros 401 devem poder disparar novos redirects.
  window.addEventListener("popstate", () => {
    authRedirectInFlight = false;
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
        let targetInput: RequestInfo | URL = input;
        let urlString =
          typeof targetInput === "string"
            ? targetInput
            : targetInput instanceof URL
            ? targetInput.toString()
            : targetInput instanceof Request
            ? targetInput.url
            : String(targetInput);

        if (urlString.startsWith("/")) {
          urlString = `${getApiBaseUrl()}${urlString}`;
        } else if (
          urlString.startsWith("http://localhost/") ||
          urlString.startsWith("capacitor://localhost/")
        ) {
          urlString = urlString.replace(
            /^(http|capacitor):\/\/localhost/,
            getApiBaseUrl()
          );
        }

        if (targetInput instanceof Request) {
          targetInput = new Request(urlString, targetInput);
        } else {
          targetInput = urlString;
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
            if (isMobileApp()) {
              headers.set("X-Sanctificare-Client", "native");
            }
            return headers;
          })(),
          credentials: "include",
        });
      },
    }),
  ],
});

if (typeof window !== "undefined") {
  void initAnalytics();
}

// Activate a previously downloaded update before React replaces the static
// splash. Capgo's next() also activates on background, which flashes on resume.
async function activatePendingOtaBeforeRender(): Promise<boolean> {
  if (typeof window === "undefined" || !isMobileApp()) return false;

  if (!isOtaEnabled) {
    localStorage.removeItem("sanctificare_ota_pending_version");
    localStorage.removeItem("sanctificare_ota_installed_version");
    return false;
  }

  // 1. Immediately notify native layer that the app is ready so it commits the active bundle
  try {
    await CapacitorUpdater.notifyAppReady();
  } catch (e) {
    console.warn("[OTA] notifyAppReady warning:", e);
  }

  const pendingVersion = localStorage.getItem("sanctificare_ota_pending_version");
  if (!pendingVersion) return false;

  // Session guard: prevent infinite reload loops on devices where set() was already attempted
  const SESSION_RELOAD_KEY = `sanctificare_ota_activating_${pendingVersion}`;
  if (sessionStorage.getItem(SESSION_RELOAD_KEY)) {
    console.warn(`[OTA] Activation for version ${pendingVersion} already attempted in this session. Clearing pending to prevent loop.`);
    localStorage.removeItem("sanctificare_ota_pending_version");
    return false;
  }

  try {
    const current = await CapacitorUpdater.current().catch(() => null);
    const installedOtaVersion = localStorage.getItem("sanctificare_ota_installed_version");
    const isPendingAlreadyActive =
      current?.bundle?.version === pendingVersion ||
      current?.bundle?.id === pendingVersion ||
      installedOtaVersion === pendingVersion;

    if (isPendingAlreadyActive) {
      localStorage.setItem("sanctificare_ota_installed_version", pendingVersion);
      localStorage.removeItem("sanctificare_ota_pending_version");
      return false;
    }

    const list = await CapacitorUpdater.list().catch(() => null);
    const pendingBundle = list?.bundles?.find(
      (bundle) => bundle.version === pendingVersion || bundle.id === pendingVersion
    );

    if (pendingBundle?.id) {
      // Mark session and clear pending before invoking set() to guarantee no infinite reload loop
      sessionStorage.setItem(SESSION_RELOAD_KEY, "1");
      localStorage.removeItem("sanctificare_ota_pending_version");
      localStorage.setItem("sanctificare_ota_installed_version", pendingVersion);
      console.log(`[OTA] Activating pending update version ${pendingVersion}...`);
      await CapacitorUpdater.set({ id: pendingBundle.id });
      return true;
    } else {
      localStorage.removeItem("sanctificare_ota_pending_version");
    }
  } catch (error) {
    console.warn("[OTA] Could not activate pending bundle during cold start:", error);
    localStorage.removeItem("sanctificare_ota_pending_version");
  }

  return false;
}

// Live Updates (OTA) configuration for Capacitor native environment.
async function checkForOtaUpdate() {
  if (typeof window === "undefined" || !isMobileApp()) return;

  try {
    await CapacitorUpdater.notifyAppReady();
  } catch (e) {
    console.warn("[OTA] notifyAppReady warning:", e);
  }

  if (!isOtaEnabled) {
    console.log("[OTA] Disabled by build flag. Using the synced Android bundle.");
    return;
  }

  try {
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

    const current = await CapacitorUpdater.current().catch(() => null);
    const currentBundleVersion = current?.bundle?.version || "";
    const currentBundleId = current?.bundle?.id || "";
    const nativeVersion = current?.native || "0.0.0";

    const OTA_INSTALLED_KEY = "sanctificare_ota_installed_version";
    const OTA_PENDING_KEY = "sanctificare_ota_pending_version";
    const installedOtaVersion = localStorage.getItem(OTA_INSTALLED_KEY);
    const pendingOtaVersion = localStorage.getItem(OTA_PENDING_KEY);

    console.log(`[OTA] Bundle version: '${currentBundleVersion}' (id: '${currentBundleId}') | Local record: '${installedOtaVersion}' | Server: '${updateData.version}' | Native: '${nativeVersion}'`);

    // Don't downgrade below native APK/AAB baseline
    if (compareVersionCore(updateData.version, nativeVersion) < 0) {
      console.warn(
        `[OTA] Skipping downgrade. Server bundle ${updateData.version} is older than native ${nativeVersion}.`
      );
      return;
    }

    // Only the native updater is authoritative about the bundle currently in use.
    const isAlreadyOnVersion =
      currentBundleVersion === updateData.version ||
      currentBundleId === updateData.version ||
      installedOtaVersion === updateData.version;

    if (isAlreadyOnVersion) {
      localStorage.setItem(OTA_INSTALLED_KEY, updateData.version);
      localStorage.removeItem(OTA_PENDING_KEY);
      console.log(`[OTA] Already running target version ${updateData.version}. No update needed.`);
      return;
    }

    // Reuse an already-downloaded bundle for this version, if any.
    const list = await CapacitorUpdater.list().catch(() => null);
    let bundle = list?.bundles?.find((b) => b.version === updateData.version || b.id === updateData.version);

    if (!bundle) {
      console.log(`[OTA] Downloading new update version ${updateData.version}...`);
      bundle = await CapacitorUpdater.download({
        url: updateData.url,
        version: updateData.version,
      });
    }

    if (!bundle?.id) {
      console.warn("[OTA] Download completed but bundle ID is missing.");
      return;
    }

    // Keep it dormant for next cold start
    localStorage.setItem(OTA_PENDING_KEY, updateData.version);
    console.log(
      pendingOtaVersion === updateData.version
        ? `[OTA] Update ${updateData.version} remains ready for the next cold start.`
        : `[OTA] Update ${updateData.version} downloaded and ready for the next cold start.`
    );
  } catch (err) {
    console.error("[OTA] Live update error:", err);
  }
}

applyCachedUserTemplate();

createRoot(document.getElementById("root")!).render(
  <trpc.Provider client={trpcClient} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </trpc.Provider>
);

if (isMobileApp()) {
  localStorage.removeItem("sanctificare_ota_pending_version");
  localStorage.removeItem("sanctificare_ota_installed_version");
  void CapacitorUpdater.notifyAppReady().catch((error) => {
    console.warn("[Updater] notifyAppReady warning:", error);
  });
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
        const destination = `${url.pathname || "/dashboard"}${url.search || ""}${url.hash || ""}`;
        
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
          queryClient.clear();
          window.history.replaceState({}, "", destination);
          window.dispatchEvent(new PopStateEvent("popstate"));
          return;
        }

        // Support route-only deep links (without OAuth token), e.g.
        // sanctificare://callback/degraus-de-perfeicao.
        window.history.replaceState({}, "", destination);
        window.dispatchEvent(new PopStateEvent("popstate"));
      }
    } catch (e) {
      console.error("[DeepLink] Error handling URL:", e);
    }
  });
}

