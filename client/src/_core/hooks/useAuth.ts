import { clearStoredAuthTokens, getLoginUrl, getApiBaseUrl, getStoredSessionToken } from "@/const";
import { useCallback, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";


type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

function readCachedRuntimeUser() {
  if (typeof window === "undefined") return undefined;
  try {
    if (!getStoredSessionToken()) {
      return undefined;
    }
    const raw = localStorage.getItem("app-runtime-user-info");
    if (!raw) return undefined;
    const parsed = JSON.parse(raw);
    return parsed || undefined;
  } catch {
    return undefined;
  }
}

async function fetchMe() {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/api/auth/me`, { credentials: "include" });
  if (!res.ok) {
    throw new Error("Failed to fetch user");
  }
  return res.json();
}

async function performLogout() {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/api/auth/logout`, { method: "POST", credentials: "include" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to logout");
  }
  return res.json();
}

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath = getLoginUrl() } =
    options ?? {};

  const queryClient = useQueryClient();
  const [_, setLocation] = useLocation();

  const hasToken = typeof window !== "undefined" && !!getStoredSessionToken();

  const meQuery = useQuery({
    queryKey: ["auth", "me"],
    queryFn: fetchMe,
    initialData: readCachedRuntimeUser,
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 0,
    enabled: hasToken,
  });

  const logoutMutation = useMutation({
    mutationFn: performLogout,
    onSuccess: () => {
      queryClient.setQueryData(["auth", "me"], null);
    },
  });

  const logout = useCallback(async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch (error: unknown) {
      // Ignore unauthorized on logout
    } finally {
      clearStoredAuthTokens();
      queryClient.setQueryData(["auth", "me"], null);
      await queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      if (typeof window !== "undefined") {
        setLocation("/");
      }
    }
  }, [logoutMutation, queryClient, setLocation]);

  const state = useMemo(() => {
    return {
      user: meQuery.data ?? null,
      loading: meQuery.isLoading || logoutMutation.isPending,
      error: meQuery.error ?? logoutMutation.error ?? null,
      isAuthenticated: Boolean(meQuery.data),
    };
  }, [
    meQuery.data,
    meQuery.error,
    meQuery.isLoading,
    logoutMutation.error,
    logoutMutation.isPending,
  ]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      localStorage.setItem("app-runtime-user-info", JSON.stringify(meQuery.data));
    } catch {
      // Ignore storage failures (private mode/quota) to avoid auth UI crashes.
    }
  }, [meQuery.data]);

  useEffect(() => {
    if (!redirectOnUnauthenticated) return;
    if (meQuery.isLoading || logoutMutation.isPending) return;
    if (state.user) return;
    if (typeof window === "undefined") return;
    if (window.location.pathname === redirectPath) return;

    setLocation(redirectPath);
  }, [
    redirectOnUnauthenticated,
    redirectPath,
    logoutMutation.isPending,
    meQuery.isLoading,
    state.user,
    setLocation,
  ]);

  return {
    ...state,
    refresh: () => meQuery.refetch(),
    logout,
  };
}
