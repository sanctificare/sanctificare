import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Suspense, lazy, useEffect, useRef } from "react";
import MobileBottomNav from "@/components/MobileBottomNav";
import MobileTopMenu from "@/components/MobileTopMenu";
import { Redirect, Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useUserTemplate } from "./hooks/useUserTemplate";
import { isMobileApp } from "./const";
import { useAuth } from "./_core/hooks/useAuth";
import { isSaintMichaelLentActive } from "./lib/saintMichaelConfig";
import { trpc } from "./lib/trpc";
import { initNativePushNotifications } from "./lib/push";
import { setAnalyticsUserId, trackPageView } from "./lib/analytics";
import {
  applyRemoteState,
  collectSyncableLocalSnapshot,
  diffSnapshots,
  splitIntoChunks,
} from "./lib/userStateSync";
import Login from "./pages/Login";
import PrayerDetail from "./pages/PrayerDetail";
import ResetPassword from "./pages/ResetPassword";
import AdminDashboard from "./pages/AdminDashboard";
import Privacy from "./pages/Privacy";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Explore from "./pages/Explore";
import Prayers from "./pages/Prayers";
import RosaryGuided from "./pages/RosaryGuided";
import Liturgy from "./pages/Liturgy";
import Bible from "./pages/Bible";
import DailyPlan from "./pages/DailyPlan";




import AppNav from "@/components/AppNav";
import { useOfflineSync } from "./hooks/useOfflineSync";

type PreloadableComponent<T extends React.ComponentType<any>> =
  React.LazyExoticComponent<T> & { preload: () => Promise<unknown> };

// lazy() com capacidade de pré-carregar o chunk sob demanda. Assim conseguimos
// buscar e avaliar todos os módulos de rota enquanto o app está ocioso, evitando
// a tela "Carregando..." (fallback do Suspense) a cada navegação.
function lazyWithPreload<T extends React.ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
): PreloadableComponent<T> {
  const Component = lazy(factory) as PreloadableComponent<T>;
  Component.preload = factory;
  return Component;
}

const GlobalSearch = lazyWithPreload(() => import("@/components/GlobalSearch"));
const LectioDivina = lazyWithPreload(() => import("./pages/LectioDivina"));
const ViaSacra = lazyWithPreload(() => import("./pages/ViaSacra"));
const VelaVirtual = lazyWithPreload(() => import("./pages/VelaVirtual"));
const MusicaSacra = lazyWithPreload(() => import("./pages/MusicaSacra"));
const Novenas = lazyWithPreload(() => import("./pages/Novenas"));
const NovenaDetails = lazyWithPreload(() => import("./pages/NovenaDetails"));
const Intentions = lazyWithPreload(() => import("./pages/Intentions"));
const Profile = lazyWithPreload(() => import("./pages/Profile"));
const DangerZone = lazyWithPreload(() => import("./pages/DangerZone"));
const VideosBiblicos = lazyWithPreload(() => import("./pages/VideosBiblicos"));
const DegrausPerfeicao = lazyWithPreload(() => import("./pages/DegrausPerfeicao"));
const ImitacaoCristoRetiro = lazyWithPreload(() => import("./pages/ImitacaoCristoRetiro"));
const FiloteiaRetiro = lazyWithPreload(() => import("./pages/FiloteiaRetiro"));
const Premium = lazyWithPreload(() => import("./pages/Premium"));
const PremiumSucesso = lazyWithPreload(() => import("./pages/PremiumSucesso"));
const ApoieMissao = lazyWithPreload(() => import("./pages/ApoieMissao"));
const SaintMichaelLent = lazyWithPreload(() => import("./pages/SaintMichaelLent"));
const SaintMichaelLentLanding = lazyWithPreload(() => import("./pages/SaintMichaelLentLanding"));


// Todas as rotas lazy são pré-carregadas em background para evitar o SuspenseLoader
// ("Carregando...") na primeira navegação a cada página.
const CRITICAL_PRELOAD_ROUTES: PreloadableComponent<React.ComponentType<any>>[] = [
  GlobalSearch,
  LectioDivina,
  ViaSacra,
  VelaVirtual,
  MusicaSacra,
  Novenas,
  NovenaDetails,
  Intentions,
  Profile,
  DangerZone,
  VideosBiblicos,
  DegrausPerfeicao,
  ImitacaoCristoRetiro,
  FiloteiaRetiro,
  Premium,
  PremiumSucesso,
  SaintMichaelLent,
  SaintMichaelLentLanding,
];

function preloadRoutes(routes: PreloadableComponent<React.ComponentType<any>>[]) {
  for (const route of routes) {
    void route.preload();
  }
}


function SuspenseLoader() {
  return (
    <div className="w-full min-h-[60vh] flex flex-col items-center justify-center gap-3">
      <div className="w-8 h-8 rounded-full border-2 border-amber-500/20 border-t-amber-500 animate-spin" />
      <span className="text-xs text-muted-foreground font-sans animate-pulse">Carregando...</span>
    </div>
  );
}

function ProtectedDashboardRoute(props: any) {
  return <ProtectedRoute component={Dashboard} {...props} />;
}

function ProtectedIntentionsRoute(props: any) {
  return <ProtectedRoute component={Intentions} {...props} />;
}

function ProtectedProfileRoute(props: any) {
  return <ProtectedRoute component={Profile} {...props} />;
}

function ProtectedDangerZoneRoute(props: any) {
  return <ProtectedRoute component={DangerZone} {...props} />;
}

function ProtectedDailyPlanRoute(props: any) {
  return <ProtectedRoute component={DailyPlan} {...props} />;
}



function PremiumRoute(props: any) {
  return <Premium {...props} />;
}

function PremiumSucessoRoute(props: any) {
  return <PremiumSucesso {...props} />;
}

function ApoieMissaoRoute(props: any) {
  return <ApoieMissao {...props} />;
}

function ProtectedSaintMichaelLentLandingRoute(props: any) {
  const { user, loading } = useAuth();

  if (loading) {
    return <SuspenseLoader />;
  }

  if (!isSaintMichaelLentActive(user)) {
    return <Redirect to="/explore" replace />;
  }

  return <SaintMichaelLentLanding {...props} />;
}

function ProtectedSaintMichaelLentRoute(props: any) {
  const { user, loading } = useAuth();

  if (loading) {
    return <SuspenseLoader />;
  }

  if (!isSaintMichaelLentActive(user)) {
    return <Redirect to="/explore" replace />;
  }

  return <SaintMichaelLent {...props} />;
}

function ProtectedAdminRoute(props: any) {
  const { user } = useAuth();
  
  if (user && user.role !== "admin") {
    return <NotFound />;
  }
  
  return <ProtectedRoute component={AdminDashboard} {...props} />;
}


function Router() {
  // Carregar e aplicar tema do usuário
  useUserTemplate();
  const { isAuthenticated, loading } = useAuth();

  return (
    <Suspense fallback={<SuspenseLoader />}>
      <Switch>
        <Route path="/" component={isMobileApp() && !loading && !isAuthenticated ? Login : Home} />
        <Route path="/login" component={Login} />
        <Route path="/dashboard" component={ProtectedDashboardRoute} />
        <Route path="/explore" component={Explore} />
        <Route path="/oracoes" component={Prayers} />
        <Route path="/rosario" component={RosaryGuided} />
        <Route path="/liturgia" component={Liturgy} />
        <Route path="/lectio" component={LectioDivina} />
        <Route path="/via-sacra" component={ViaSacra} />
        <Route path="/vela-virtual" component={VelaVirtual} />
        <Route path="/musica-sacra" component={MusicaSacra} />
        <Route path="/biblia" component={Bible} />
        <Route path="/novenas" component={Novenas} />
        <Route path="/novenas/:slug" component={NovenaDetails} />
        <Route path="/quaresma-de-sao-miguel" component={SaintMichaelLentLanding} />
        <Route path="/quaresma-sao-miguel" component={SaintMichaelLent} />
        <Route path="/intencoes" component={ProtectedIntentionsRoute} />
        <Route path="/perfil" component={ProtectedProfileRoute} />
        <Route path="/profile" component={ProtectedProfileRoute} />
        <Route path="/perfil/zona-de-perigo" component={ProtectedDangerZoneRoute} />
        <Route path="/plano-diario" component={ProtectedDailyPlanRoute} />

        <Route path="/videos" component={VideosBiblicos} />
        <Route path="/degraus-de-perfeicao" component={DegrausPerfeicao} />
        <Route path="/degraus-de-perfeicao/imitacao-de-cristo" component={ImitacaoCristoRetiro} />
        <Route path="/degraus-de-perfeicao/filoteia" component={FiloteiaRetiro} />
        <Route path="/oracao/:id" component={PrayerDetail} />
        <Route path="/premium" component={PremiumRoute} />
        <Route path="/premium/sucesso" component={PremiumSucessoRoute} />
        <Route path="/apoie-a-missao" component={ApoieMissaoRoute} />
        <Route path="/redefinir-senha" component={ResetPassword} />
        <Route path="/admin" component={ProtectedAdminRoute} />
        <Route path="/privacidade" component={Privacy} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function AppShell() {
  const [location] = useLocation();

  useEffect(() => {
    void trackPageView(location);
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [location]);

  const isLandingPage =
    location === "/" ||
    location === "/quaresma-de-sao-miguel" ||
    location === "/login" ||
    location === "/redefinir-senha" ||
    location === "/privacidade" ||
    location === "/premium" ||
    location === "/premium/sucesso" ||
    location === "/admin";

  return (
    <>
      <Toaster />
      {!isLandingPage && (
        <div className="hidden lg:block">
          <AppNav />
        </div>
      )}
      {!isLandingPage && <MobileTopMenu />}
      <div className="theme-contemplative-a mobile-app-viewport min-h-[100dvh]">
        <div className="animate-fade-in">
          <Router />
        </div>
        {!isLandingPage && <MobileBottomNav />}
        <Suspense fallback={null}>
          <GlobalSearch />
        </Suspense>
      </div>
    </>
  );
}

function App() {
  useOfflineSync();
  const { isAuthenticated, user } = useAuth();
  const registerDeviceMutation = trpc.push.registerDevice.useMutation();
  const stateSyncQuery = trpc.stateSync.getAll.useQuery(undefined, {
    enabled: isAuthenticated,
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
  });
  const upsertStateMutation = trpc.stateSync.upsertMany.useMutation();
  const deleteStateMutation = trpc.stateSync.deleteMany.useMutation();
  const lastLocalSnapshotRef = useRef<Record<string, string>>({});
  const localVersionByKeyRef = useRef<Map<string, number>>(new Map());
  const syncInFlightRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated) {
      lastLocalSnapshotRef.current = {};
      localVersionByKeyRef.current = new Map();
      return;
    }

    // Snapshot inicial para diffs periódicos sem custo alto de escrita.
    lastLocalSnapshotRef.current = collectSyncableLocalSnapshot();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (!stateSyncQuery.data) return;

    applyRemoteState({
      entries: stateSyncQuery.data,
      localVersionByKey: localVersionByKeyRef.current,
    });
    lastLocalSnapshotRef.current = collectSyncableLocalSnapshot();
  }, [isAuthenticated, stateSyncQuery.data]);

  useEffect(() => {
    if (!isAuthenticated) return;

    let cancelled = false;

    const syncOnce = async () => {
      if (cancelled || syncInFlightRef.current) return;
      syncInFlightRef.current = true;

      try {
        const nextSnapshot = collectSyncableLocalSnapshot();
        const { upserts, deletions } = diffSnapshots(lastLocalSnapshotRef.current, nextSnapshot);

        for (const chunk of splitIntoChunks(upserts, 200)) {
          if (chunk.length === 0) continue;
          const result = await upsertStateMutation.mutateAsync({ entries: chunk });
          for (const row of result.saved) {
            localVersionByKeyRef.current.set(
              row.key,
              row.updatedAt instanceof Date ? row.updatedAt.getTime() : Date.parse(row.updatedAt)
            );
          }
        }

        for (const chunk of splitIntoChunks(deletions, 200)) {
          if (chunk.length === 0) continue;
          const result = await deleteStateMutation.mutateAsync({ keys: chunk });
          for (const row of result.deleted) {
            localVersionByKeyRef.current.set(
              row.key,
              row.updatedAt instanceof Date ? row.updatedAt.getTime() : Date.parse(row.updatedAt)
            );
          }
        }

        lastLocalSnapshotRef.current = nextSnapshot;
      } catch (err) {
        console.warn("[StateSync] sync tick failed:", err);
      } finally {
        syncInFlightRef.current = false;
      }
    };

    // Executa logo após login e depois em intervalos curtos para propagar entre devices.
    void syncOnce();
    const interval = window.setInterval(() => {
      void syncOnce();
    }, 8000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [isAuthenticated, upsertStateMutation, deleteStateMutation]);

  useEffect(() => {
    document.body.classList.add("theme-contemplative-a");

    return () => {
      document.body.classList.remove("theme-contemplative-a");
    };
  }, []);

  // Pré-carrega os chunks de navegação mais prováveis quando o app fica ocioso.
  // Isso melhora fluidez sem baixar todos os módulos logo no boot.
  useEffect(() => {
    const ric = (window as typeof window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    }).requestIdleCallback;

    if (typeof ric === "function") {
      const id = ric(() => preloadRoutes(CRITICAL_PRELOAD_ROUTES), { timeout: 2000 });
      return () => {
        (window as typeof window & { cancelIdleCallback?: (id: number) => void }).cancelIdleCallback?.(id);
      };
    }

    const timer = window.setTimeout(() => preloadRoutes(CRITICAL_PRELOAD_ROUTES), 1000);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isMobileApp()) return;
    if (!isAuthenticated) return;

    void initNativePushNotifications({
      onRegistered: async (token, meta) => {
        await registerDeviceMutation.mutateAsync({
          token,
          platform: meta.platform,
          deviceId: meta.deviceId ?? null,
        });
      },
    });
  }, [isAuthenticated, registerDeviceMutation]);

  useEffect(() => {
    const userId = user?.id ? String(user.id) : null;
    void setAnalyticsUserId(userId);
  }, [user?.id]);

  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      if (event.defaultPrevented) return;
      if (event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;

      const rawHref = anchor.getAttribute("href");
      if (!rawHref || rawHref.startsWith("#")) return;

      const destination = new URL(anchor.href, window.location.href);
      if (destination.origin !== window.location.origin) return;

      const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
      const next = `${destination.pathname}${destination.search}${destination.hash}`;
      if (current === next) return;

      event.preventDefault();
      window.history.pushState({}, "", next);
      window.dispatchEvent(new PopStateEvent("popstate"));
    };

    document.addEventListener("click", handleDocumentClick);
    return () => document.removeEventListener("click", handleDocumentClick);
  }, []);

  // Checador de Lembretes Diários
  useEffect(() => {
    const checkReminders = () => {
      try {
        // No app nativo os lembretes são agendados de forma nativa
        // (LocalNotifications); o intervalo abaixo é apenas fallback web.
        if (isMobileApp()) return;

        const enabled = localStorage.getItem("sanctificare.reminders.enabled") === "true";
        if (!enabled) return;

        if (!("Notification" in window) || Notification.permission !== "granted") {
          return;
        }

        const reminderTime = localStorage.getItem("sanctificare.reminders.time") || "18:00";
        const now = new Date();
        const currentHours = String(now.getHours()).padStart(2, "0");
        const currentMinutes = String(now.getMinutes()).padStart(2, "0");
        const currentTimeStr = `${currentHours}:${currentMinutes}`;

        if (currentTimeStr === reminderTime) {
          const todayStr = now.toDateString();
          const lastSent = localStorage.getItem("sanctificare.reminders.last_sent");
          if (lastSent !== todayStr) {
            localStorage.setItem("sanctificare.reminders.last_sent", todayStr);
            new Notification("Sanctificare", {
              body: "Está na hora de fazer sua oração diária e manter sua constância espiritual viva!",
              icon: "/assets/sanctificare-logo-v2.webp"
            });
          }
        }
      } catch (err) {
        console.error("Erro no checador de lembretes:", err);
      }
    };

    // Executa uma vez imediatamente e só agenda o intervalo se estiver habilitado.
    checkReminders();

    const remindersEnabled =
      localStorage.getItem("sanctificare.reminders.enabled") === "true";
    if (!remindersEnabled) {
      return;
    }

    const interval = setInterval(checkReminders, 30000);
    return () => clearInterval(interval);
  }, []);

  // Botão físico "voltar" no Android: navega no histórico ou fecha o app.
  useEffect(() => {
    if (!isMobileApp()) return;

    let removeListener: (() => void) | undefined;

    void (async () => {
      try {
        const { App: CapApp } = await import("@capacitor/app");
        const handle = await CapApp.addListener("backButton", ({ canGoBack }) => {
          if (canGoBack || window.history.length > 1) {
            window.history.back();
          } else {
            void CapApp.exitApp();
          }
        });
        removeListener = () => {
          void handle.remove();
        };
      } catch (err) {
        console.warn("[App] back button listener error:", err);
      }
    })();

    return () => {
      removeListener?.();
    };
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <AppShell />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
