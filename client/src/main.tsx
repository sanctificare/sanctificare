import { trpc } from "@/lib/trpc";
import { UNAUTHED_ERR_MSG } from '@shared/const';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import App from "./App";
import { getLoginUrl, getApiBaseUrl } from "./const";
import "./index.css";

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
            const csrfToken = readCookie("csrf_token");
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
