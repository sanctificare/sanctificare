import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Suspense, lazy, useEffect } from "react";
import MobileBottomNav from "@/components/MobileBottomNav";
import MobileTopMenu from "@/components/MobileTopMenu";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useUserTemplate } from "./hooks/useUserTemplate";
import { isMobileApp } from "./const";
import { useAuth } from "./_core/hooks/useAuth";
import { trpc } from "./lib/trpc";
import { initNativePushNotifications } from "./lib/push";
import Login from "./pages/Login";
import PrayerDetail from "./pages/PrayerDetail";
import ResetPassword from "./pages/ResetPassword";
import Privacy from "./pages/Privacy";


import AppNav from "@/components/AppNav";

const GlobalSearch = lazy(() => import("@/components/GlobalSearch"));
const Home = lazy(() => import("./pages/Home"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Explore = lazy(() => import("./pages/Explore"));
const Prayers = lazy(() => import("./pages/Prayers"));
const RosaryGuided = lazy(() => import("./pages/RosaryGuided"));
const Liturgy = lazy(() => import("./pages/Liturgy"));
const LectioDivina = lazy(() => import("./pages/LectioDivina"));
const ViaSacra = lazy(() => import("./pages/ViaSacra"));
const VelaVirtual = lazy(() => import("./pages/VelaVirtual"));
const MusicaSacra = lazy(() => import("./pages/MusicaSacra"));
const Bible = lazy(() => import("./pages/Bible"));
const Novenas = lazy(() => import("./pages/Novenas"));
const NovenaDetails = lazy(() => import("./pages/NovenaDetails"));
const Intentions = lazy(() => import("./pages/Intentions"));
const Profile = lazy(() => import("./pages/Profile"));
const DailyPlan = lazy(() => import("./pages/DailyPlan"));
const Premium = lazy(() => import("./pages/Premium"));
const VideosBiblicos = lazy(() => import("./pages/VideosBiblicos"));


function Router() {
  // Carregar e aplicar tema do usuário
  useUserTemplate();

  return (
    <Suspense fallback={<div className="min-h-[40vh]" />}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/login" component={Login} />
        <Route path="/dashboard" component={Dashboard} />
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
        <Route path="/intencoes" component={Intentions} />
        <Route path="/perfil" component={Profile} />
        <Route path="/plano-diario" component={DailyPlan} />
        <Route path="/premium" component={Premium} />
        <Route path="/videos" component={VideosBiblicos} />
        <Route path="/oracao/:id" component={PrayerDetail} />
        <Route path="/redefinir-senha" component={ResetPassword} />
        <Route path="/privacidade" component={Privacy} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function AppShell() {
  const [location] = useLocation();
  // Rotas sem AppNav (têm navbar própria ou não precisam do nav de app)
  const isLandingPage = location === "/" || location === "/login" || location === "/redefinir-senha" || location === "/privacidade";

  return (
    <>
      <Toaster />
      {!isLandingPage && (
        <div className="hidden lg:block">
          <AppNav />
        </div>
      )}
      {!isLandingPage && <MobileTopMenu />}
      <div className="theme-contemplative-a min-h-screen">
        <Router />
        {!isLandingPage && <MobileBottomNav />}
        <Suspense fallback={null}>
          <GlobalSearch />
        </Suspense>
      </div>
    </>
  );
}

function App() {
  const { isAuthenticated } = useAuth();
  const registerDeviceMutation = trpc.push.registerDevice.useMutation();

  useEffect(() => {
    document.body.classList.add("theme-contemplative-a");

    return () => {
      document.body.classList.remove("theme-contemplative-a");
    };
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
              icon: "/assets/logo-sanctificare.webp"
            });
          }
        }
      } catch (err) {
        console.error("Erro no checador de lembretes:", err);
      }
    };

    // Executa uma vez imediatamente, depois a cada 30 segundos
    checkReminders();
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
