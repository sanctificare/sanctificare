import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { useEffect } from "react";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useUserTemplate } from "./hooks/useUserTemplate";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Prayers from "./pages/Prayers";
import RosaryGuided from "./pages/RosaryGuided";
import Liturgy from "./pages/Liturgy";
import LectioDivina from "./pages/LectioDivina";
import ViaSacra from "./pages/ViaSacra";
import VelaVirtual from "./pages/VelaVirtual";
import MusicaSacra from "./pages/MusicaSacra";
import Bible from "./pages/Bible";
import Intentions from "./pages/Intentions";
import Profile from "./pages/Profile";
import Premium from "./pages/Premium";
import TemplateSettings from "./pages/TemplateSettings";
import VideosBiblicos from "./pages/VideosBiblicos";
import PrayerDetail from "./pages/PrayerDetail";
import ResetPassword from "./pages/ResetPassword";


function Router() {
  // Carregar e aplicar tema do usuário
  useUserTemplate();

  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/oracoes" component={Prayers} />
      <Route path="/rosario" component={RosaryGuided} />
      <Route path="/liturgia" component={Liturgy} />
      <Route path="/lectio" component={LectioDivina} />
      <Route path="/via-sacra" component={ViaSacra} />
      <Route path="/vela-virtual" component={VelaVirtual} />
      <Route path="/musica-sacra" component={MusicaSacra} />
      <Route path="/biblia" component={Bible} />
      <Route path="/intencoes" component={Intentions} />
      <Route path="/perfil" component={Profile} />
      <Route path="/premium" component={Premium} />
      <Route path="/temas" component={TemplateSettings} />
      <Route path="/videos" component={VideosBiblicos} />
      <Route path="/oracao/:id" component={PrayerDetail} />
      <Route path="/redefinir-senha" component={ResetPassword} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    document.body.classList.add("theme-contemplative-a");

    return () => {
      document.body.classList.remove("theme-contemplative-a");
    };
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <div className="theme-contemplative-a min-h-screen">
            <Router />
          </div>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
