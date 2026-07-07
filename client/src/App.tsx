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
const DangerZone = lazy(() => import("./pages/DangerZone"));
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
        <Route path="/profile" component={Profile} />
        <Route path="/perfil/zona-de-perigo" component={DangerZone} />
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

function GlobalLoader() {
  return (
    <div className="fixed inset-0 bg-[#050B1E] flex flex-col items-center justify-between py-12 px-6 text-white z-[9999] overflow-hidden">
      {/* Background elegant pattern */}
      <div className="absolute inset-0 bg-pattern-cross opacity-[0.03] pointer-events-none" />
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[oklch(0.75_0.12_75/0.03)] rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-[oklch(0.28_0.08_260/0.08)] rounded-full blur-[140px] pointer-events-none" />

      {/* Top Spacer / Decorative cross element */}
      <div className="w-12 h-12 flex items-center justify-center opacity-30 mt-4">
        <div className="w-[2px] h-8 bg-amber-400 absolute" />
        <div className="w-8 h-[2px] bg-amber-400 absolute" />
      </div>

      {/* Center Logo & Name */}
      <div className="flex flex-col items-center gap-6 z-10 my-auto">
        <div className="relative w-28 h-28 flex items-center justify-center">
          {/* Animated pulsing golden ring */}
          <div className="absolute inset-0 rounded-full border border-amber-500/20 animate-ping [animation-duration:3s]" />
          <div className="absolute -inset-2 rounded-full border border-amber-500/10 animate-pulse [animation-duration:2s]" />
          <img 
            src="/assets/logo-sanctificare.webp" 
            alt="Sanctificare Logo" 
            className="w-24 h-24 object-contain filter drop-shadow-[0_0_15px_rgba(245,158,11,0.2)] animate-pulse" 
          />
        </div>
        
        <h1 className="font-serif text-3xl tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-amber-300 to-amber-500 font-bold uppercase select-none mt-2 drop-shadow-md" style={{ fontFamily: "'Cinzel', serif" }}>
          Sanctificare
        </h1>
        
        <div className="flex items-center gap-2 text-amber-200/60 font-serif text-sm tracking-[0.15em] select-none mt-1 animate-pulse">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400/60" />
          <span>Carregando</span>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400/60 animate-ping" />
        </div>
      </div>

      {/* Bottom Verse */}
      <div className="w-full max-w-sm flex flex-col items-center gap-3 z-10 mb-6 bg-gradient-to-b from-[#0d162d]/80 to-[#080f21]/80 border border-amber-500/15 rounded-xl p-5 text-center shadow-lg backdrop-blur-sm">
        <p className="font-serif italic text-amber-100/80 text-base leading-relaxed tracking-wide" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
          "Santificai-vos, porque amanhã o Senhor fará maravilhas no meio de vós."
        </p>
        <span className="font-serif text-xs uppercase tracking-[0.2em] text-amber-400/70 font-semibold" style={{ fontFamily: "'Cinzel', serif" }}>
          Josué 3:5
        </span>
      </div>
    </div>
  );
}

function AppShell() {
  const { loading } = useAuth();
  const [location] = useLocation();
  // Rotas sem AppNav (têm navbar própria ou não precisam do nav de app)
  const isLandingPage = location === "/" || location === "/login" || location === "/redefinir-senha" || location === "/privacidade";

  if (loading) {
    return <GlobalLoader />;
  }

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
