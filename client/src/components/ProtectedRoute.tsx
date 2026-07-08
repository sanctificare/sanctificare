import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import BrandSplash from "@/components/BrandSplash";

interface ProtectedRouteProps {
  component: React.ComponentType<any>;
  [key: string]: any;
}

export default function ProtectedRoute({ component: Component, ...rest }: ProtectedRouteProps) {
  const { isAuthenticated, loading } = useAuth();
  const [minimumTimeElapsed, setMinimumTimeElapsed] = useState(false);
  const [_, setLocation] = useLocation();

  // Guarda se o primeiro render do componente ocorreu em estado de carregamento
  const isInitialLoading = useRef(loading && !isAuthenticated);

  useEffect(() => {
    if (isInitialLoading.current) {
      const timer = setTimeout(() => {
        setMinimumTimeElapsed(true);
      }, 3000); // 3 segundos de exibição mínima do BrandSplash e versículo
      return () => clearTimeout(timer);
    } else {
      setMinimumTimeElapsed(true);
    }
  }, []);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      const currentPath = `${window.location.pathname}${window.location.search || ""}`;
      setLocation(getLoginUrl(currentPath));
    }
  }, [isAuthenticated, loading, setLocation]);

  // Se estiver carregando inicialmente ou se o tempo mínimo ainda não expirou, exibe o splash
  const showSplash = (loading && !isAuthenticated) || !minimumTimeElapsed;

  if (showSplash) {
    return <BrandSplash />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <Component {...rest} />;
}
