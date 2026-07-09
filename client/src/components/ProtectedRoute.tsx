import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

interface ProtectedRouteProps {
  component: React.ComponentType<any>;
  [key: string]: any;
}

export default function ProtectedRoute({ component: Component, ...rest }: ProtectedRouteProps) {
  const { isAuthenticated, loading } = useAuth();
  const [_, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      const currentPath = `${window.location.pathname}${window.location.search || ""}`;
      setLocation(getLoginUrl(currentPath));
    }
  }, [isAuthenticated, loading, setLocation]);

  if (loading && !isAuthenticated) {
    return null;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <Component {...rest} />;
}
