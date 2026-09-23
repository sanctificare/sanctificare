import type { QueryClient } from "@tanstack/react-query";
import { TRPCClientError } from "@trpc/client";
import { UNAUTHED_ERR_MSG } from "@shared/const";

export const AUTH_ME_QUERY_KEY = ["auth", "me"] as const;

// Many queries fail together when the session dies; one /me check is enough.
const MIN_REVALIDATE_INTERVAL_MS = 10_000;
let lastRevalidateAt = 0;

export function isUnauthorizedError(error: unknown): boolean {
  if (!(error instanceof TRPCClientError)) return false;
  return (
    error.message === UNAUTHED_ERR_MSG ||
    error.data?.code === "UNAUTHORIZED" ||
    error.data?.httpStatus === 401
  );
}

/**
 * A 401 from any API call means the stored session may have expired (JWTs last
 * SESSION_TTL_MS, 7 days by default). Instead of navigating to /login here —
 * which fought with Login's "already authenticated" redirect while the cached
 * user was still considered valid, making the screen flash between /login and
 * /dashboard — ask /api/auth/me. useAuth is the single source of truth: once it
 * reports no user, ProtectedRoute performs one redirect.
 */
export function revalidateSessionAfterUnauthorized(
  queryClient: QueryClient,
  error: unknown,
  now = Date.now()
): boolean {
  if (!isUnauthorizedError(error)) return false;
  if (queryClient.getQueryState(AUTH_ME_QUERY_KEY)?.fetchStatus === "fetching") return false;
  if (now - lastRevalidateAt < MIN_REVALIDATE_INTERVAL_MS) return false;

  lastRevalidateAt = now;
  void queryClient.invalidateQueries({ queryKey: AUTH_ME_QUERY_KEY, refetchType: "all" });
  return true;
}

export function resetSessionGuardForTests() {
  lastRevalidateAt = 0;
}
