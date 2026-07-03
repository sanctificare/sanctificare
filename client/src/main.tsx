import { trpc } from "@/lib/trpc";
import { UNAUTHED_ERR_MSG } from '@shared/const';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import App from "./App";
import { getLoginUrl, getApiBaseUrl, isMobileApp, getStoredCsrfToken, setStoredCsrfToken } from "./const";
import "./index.css";
import { CapacitorUpdater } from '@capgo/capacitor-updater';

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
    }

    return originalFetch.call(this, targetInput, updatedInit);
  };
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

  if (!isUnauthorized) return;
  if (authRedirectInFlight) return;

  const pathname = window.location.pathname;
  if (pathname === "/login" || pathname === "/redefinir-senha") {
    return;
  }

  authRedirectInFlight = true;

  const currentPath = `${window.location.pathname}${window.location.search || ""}`;
  window.location.replace(getLoginUrl(currentPath));
};

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
        return globalThis.fetch(targetInput, {
          ...(init ?? {}),
          headers: (() => {
            const headers = new Headers(init?.headers ?? {});
            const csrfToken = readCookie("csrf_token") ?? getStoredCsrfToken();
            if (csrfToken) {
              headers.set("x-csrf-token", csrfToken);
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
// We only notify app readiness after React has rendered and a short delay
// to ensure the bundle is healthy before marking it as active.
if (typeof window !== "undefined" && isMobileApp()) {
  void (async () => {
    try {
      // Wait for multiple paint frames to confirm the UI actually rendered.
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(resolve, 200)));
      });
      await CapacitorUpdater.notifyAppReady();

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
      const currentVersion = current?.bundle?.id;
      console.log(`[OTA] Local web bundle version: ${currentVersion} | Server version: ${updateData.version}`);

      if (updateData.version !== currentVersion) {
        console.log(`[OTA] Downloading new update version ${updateData.version}...`);
        const bundle = await CapacitorUpdater.download({
          url: updateData.url,
          version: updateData.version,
        });

        await CapacitorUpdater.set({ id: bundle.id });
        console.log(`[OTA] Update version ${bundle.id} staged successfully. Will load on next restart.`);
      }
    } catch (err) {
      console.error("[OTA] Live update error:", err);
      // Reset to built-in bundle if something went wrong to avoid persistent white screen.
      try {
        await CapacitorUpdater.reset();
      } catch {
        // Ignore reset errors
      }
    }
  })();
}

