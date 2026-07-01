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


// Intercept all fetch requests on mobile to use absolute API URL and include credentials
if (typeof window !== "undefined" && isMobileApp()) {
  const originalFetch = window.fetch;
  window.fetch = function (input, init) {
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
    const updatedInit = { ...init };
    if (
      typeof targetInput === "string" &&
      targetInput.startsWith(getApiBaseUrl())
    ) {
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

// Live Updates (OTA) Configuration for Capacitor native environment
if (typeof window !== "undefined" && isMobileApp()) {
  void (async () => {
    try {
      // 1. Notify that the web app loaded successfully. This prevents the OS from
      // performing an automatic rollback thinking the new web bundle crashed.
      await CapacitorUpdater.notifyAppReady();

      // 2. Fetch the latest metadata from the Cloudflare R2 bucket
      const res = await fetch("https://pub-dc71a0e15f28405db17b1df753564e3c.r2.dev/live-update.json", {
        headers: { "Cache-Control": "no-cache" },
      });
      if (!res.ok) {
        console.warn("[OTA] Failed to fetch update metadata from server.");
        return;
      }
      const updateData = await res.json();
      if (!updateData || !updateData.version || !updateData.url) {
        console.warn("[OTA] Invalid live-update.json format on server.");
        return;
      }

      // 3. Get currently active bundle info
      const current = await CapacitorUpdater.current();
      const currentVersion = current?.bundle?.id;

      console.log(`[OTA] Local web bundle version: ${currentVersion} | Server version: ${updateData.version}`);

      // 4. Download and apply the new bundle if server version differs from local
      if (updateData.version !== currentVersion) {
        console.log(`[OTA] Downloading new update version ${updateData.version}...`);
        const bundle = await CapacitorUpdater.download({
          url: updateData.url,
          version: updateData.version,
        });

        // 5. Set the new bundle as active (will load on next application restart)
        await CapacitorUpdater.set({ id: bundle.id });
        console.log(`[OTA] Update version ${bundle.id} staged successfully. Will load on next restart.`);
      }
    } catch (err) {
      console.error("[OTA] Live update error:", err);
    }
  })();
}
const queryClient = new QueryClient();
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
