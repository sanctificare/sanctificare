import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { Link } from "wouter";
import { BookOpenText, Check, CircleHelp, Headphones, Quote, Type, RotateCcw, RotateCw, Volume2, VolumeX, Play, Pause, Lock, Crown, Loader2, Share2, Bell, Sparkles, Music, Award } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FILOTEIA_PILULAS } from "@/data/filoteia-pilulas";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { getLoginUrl, isMobileApp, resolveR2Redirect, getPublicUrl } from "@/const";
import { shareText } from "@/lib/share";
import { openRouteInApp } from "@/lib/deepLink";
import ShareModal from "@/components/ShareModal";
import QuoteCardModal from "@/components/QuoteCardModal";
import RetiroCompletionModal from "@/components/RetiroCompletionModal";
import DailyReminderModal from "@/components/DailyReminderModal";

export default function FiloteiaRetiro() {
  const { user, isAuthenticated, refresh } = useAuth();
  const { data: subscription } = trpc.subscriptions.get.useQuery(undefined, { enabled: !!user });
  const isPremium = useMemo(() => {
    return !!subscription &&
      (subscription.status === "active" ||
       subscription.status === "cancelled" ||
       subscription.status === "past_due");
  }, [subscription]);

  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "annual">("annual");
  const [subscribing, setSubscribing] = useState(false);

  const subscribeMutation = trpc.subscriptions.subscribe.useMutation();

  const handleSubscribe = async () => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }
    setSubscribing(true);
    try {
      const result = await subscribeMutation.mutateAsync({ plan: selectedPlan });
      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
      } else {
        toast.success("Assinatura de teste ativada!");
        await refresh();
        window.location.href = "/premium/sucesso";
      }
    } catch (err: any) {
      toast.error(err?.message ?? "Erro ao iniciar pagamento.");
    } finally {
      setSubscribing(false);
    }
  };

  const [selectedId, setSelectedId] = useState(FILOTEIA_PILULAS[0].id);
  const [activeTab, setActiveTab] = useState<"audio" | "text">("audio");
  const blockerRef = useRef<HTMLElement | null>(null);
  const pillNavRef = useRef<HTMLDivElement | null>(null);

  // Modals state
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isQuoteCardOpen, setIsQuoteCardOpen] = useState(false);
  const [isReminderOpen, setIsReminderOpen] = useState(false);
  const [isCompletionOpen, setIsCompletionOpen] = useState(false);

  // Ambient sound state
  const [isAmbientOn, setIsAmbientOn] = useState(false);
  const ambientAudioRef = useRef<HTMLAudioElement | null>(null);

  const handleSelectPill = useCallback((pillId: string, isLocked: boolean) => {
    setSelectedId(pillId);
    if (isLocked && !isPremium) {
      setTimeout(() => {
        if (blockerRef.current) {
          blockerRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 50);
    }
  }, [isPremium]);

  // Auto-scroll mobile pill nav into view
  useEffect(() => {
    if (pillNavRef.current) {
      const activePill = pillNavRef.current.querySelector('[data-active="true"]');
      if (activePill) {
        activePill.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      }
    }
  }, [selectedId]);

  const [fontSize, setFontSize] = useState<"sm" | "md" | "lg" | "xl">(
    () => ((typeof window !== "undefined" ? localStorage.getItem("sanctificare_filoteia_font_size") : null) as any) || "md"
  );

  useEffect(() => {
    localStorage.setItem("sanctificare_filoteia_font_size", fontSize);
  }, [fontSize]);

  // Audio player states
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [resolvedAudioUrl, setResolvedAudioUrl] = useState<string>("");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const selected = useMemo(
    () => FILOTEIA_PILULAS.find((pill) => pill.id === selectedId) ?? FILOTEIA_PILULAS[0],
    [selectedId]
  );

  const fontSizeClasses = {
    sm: "text-xs sm:text-sm leading-6",
    md: "text-sm sm:text-base leading-7",
    lg: "text-base sm:text-lg leading-8",
    xl: "text-lg sm:text-xl leading-9",
  };

  useEffect(() => {
    // Reset player when selection changes
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (ambientAudioRef.current) {
      ambientAudioRef.current.pause();
    }
    if (selected.audioUrl) {
      resolveR2Redirect(selected.audioUrl).then((url) => {
        setResolvedAudioUrl(url);
      });
    } else {
      setResolvedAudioUrl("");
    }
  }, [selectedId, selected.audioUrl]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      if (ambientAudioRef.current) ambientAudioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
        if (isAmbientOn && ambientAudioRef.current) {
          ambientAudioRef.current.volume = 0.15;
          ambientAudioRef.current.play().catch(() => {});
        }
      }).catch(() => setIsPlaying(false));
    }
  };

  const toggleAmbientSound = () => {
    const nextState = !isAmbientOn;
    setIsAmbientOn(nextState);
    if (ambientAudioRef.current) {
      if (nextState && isPlaying) {
        ambientAudioRef.current.volume = 0.15;
        ambientAudioRef.current.play().catch(() => {});
        toast.success("Fundo Sacro ativado");
      } else {
        ambientAudioRef.current.pause();
        toast.info("Fundo Sacro desativado");
      }
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (newTime: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleAudioEnd = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    if (ambientAudioRef.current) ambientAudioRef.current.pause();
    if (selected.id === "pill15") {
      setIsCompletionOpen(true);
    }
  };

  const skipForward = () => {
    if (audioRef.current) {
      const newTime = Math.min(audioRef.current.currentTime + 10, duration);
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const skipBackward = () => {
    if (audioRef.current) {
      const newTime = Math.max(audioRef.current.currentTime - 10, 0);
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleShare = () => {
    setIsShareOpen(true);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const changeSpeed = () => {
    const speeds = [1, 1.25, 1.5, 2];
    const currentIndex = speeds.indexOf(playbackRate);
    const nextIndex = (currentIndex + 1) % speeds.length;
    const nextSpeed = speeds[nextIndex];
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
    setPlaybackRate(nextSpeed);
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs === 0) return "00:00";
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-[oklch(0.97_0.01_85)] pb-24 lg:pb-12 relative overflow-hidden">
      {/* Hidden Ambient Audio Track */}
      <audio
        ref={ambientAudioRef}
        src="https://pub-dc71a0e15f28405db17b1df753564e3c.r2.dev/Miserere%20No.1.mp3"
        loop
        preload="auto"
      />

      {/* Pattern background */}
      <div className="absolute inset-0 bg-pattern-cross opacity-[0.015] pointer-events-none" />

      <main className="container px-4 sm:px-6 py-5 sm:py-7 relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-5 gap-4">
          <div>
            <Link href="/degraus-de-perfeicao">
              <button className="mb-2 text-xs sm:text-sm font-medium hover:underline cursor-pointer text-[oklch(0.65_0.12_70)] flex items-center gap-1">
                ← Voltar aos Degraus de Perfeição
              </button>
            </Link>
            <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-[oklch(0.65_0.12_70)]">
              Virtudes
            </p>
            <h1 className="font-display text-2xl xs:text-3xl sm:text-4xl font-bold text-[oklch(0.22_0.07_260)] leading-tight break-words">
              Filoteia (Alma que Ama a Deus)
            </h1>
            <p className="font-serif text-xs sm:text-sm text-muted-foreground mt-0.5">
              Por São Francisco de Sales • 15 Dias de Itinerário Espiritual
            </p>
          </div>

          <div className="grid grid-cols-2 xs:flex xs:items-center gap-2 w-full sm:w-auto shrink-0">
            <Button
              onClick={() => setIsReminderOpen(true)}
              variant="outline"
              size="sm"
              className="border-[oklch(0.75_0.12_75/0.3)] bg-white text-[oklch(0.22_0.07_260)] hover:bg-[oklch(0.98_0.03_85)] font-bold text-xs gap-1.5 shadow-sm rounded-xl h-9 px-3"
            >
              <Bell size={14} className="text-amber-500 shrink-0" />
              <span className="truncate">Lembrete</span>
            </Button>

            <Button
              onClick={() => setIsQuoteCardOpen(true)}
              variant="outline"
              size="sm"
              className="border-[oklch(0.75_0.12_75/0.3)] bg-white text-[oklch(0.22_0.07_260)] hover:bg-[oklch(0.98_0.03_85)] font-bold text-xs gap-1.5 shadow-sm rounded-xl h-9 px-3"
            >
              <Sparkles size={14} className="text-amber-500 shrink-0" />
              <span className="truncate">Card Citação</span>
            </Button>

            {selected.id === "pill15" && (
              <Button
                onClick={() => setIsCompletionOpen(true)}
                size="sm"
                className="col-span-2 xs:col-span-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs gap-1.5 shadow-md rounded-xl h-9 px-3 animate-pulse"
              >
                <Award size={14} className="shrink-0" />
                <span className="truncate">Concluir Retiro</span>
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Quick Day Selector Bar (< xl screens) */}
        <div className="block xl:hidden mb-4">
          <div className="flex items-center justify-between mb-1.5 px-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[oklch(0.65_0.12_70)]">
              Meditações ({FILOTEIA_PILULAS.length} Dias)
            </span>
            <span className="text-[10px] font-medium text-muted-foreground">
              {selected.id.toUpperCase().replace("PILL", "Dia ")} de {FILOTEIA_PILULAS.length}
            </span>
          </div>
          <div
            ref={pillNavRef}
            className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none snap-x -mx-4 px-4 sm:mx-0 sm:px-0"
          >
            {FILOTEIA_PILULAS.map((pill, idx) => {
              const active = pill.id === selected.id;
              const isPillPremium = pill.id !== "pill1";
              const isLocked = isPillPremium && !isPremium;
              return (
                <button
                  key={pill.id}
                  data-active={active}
                  onClick={() => handleSelectPill(pill.id, isPillPremium)}
                  className={`shrink-0 snap-start rounded-full px-3.5 py-1.5 text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
                    active
                      ? "bg-[oklch(0.22_0.07_260)] text-white border-[oklch(0.22_0.07_260)] shadow-sm"
                      : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <span>Dia {idx + 1}</span>
                  {isLocked && <Lock size={10} className={active ? "text-amber-300" : "text-amber-500"} />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Layout */}
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
          {selectedId !== "pill1" && !isPremium ? (
            <section ref={blockerRef} className="rounded-2xl border border-amber-500/20 bg-[#0b1329] text-slate-100 p-4 xs:p-6 sm:p-10 shadow-[0_12px_40px_rgba(11,19,41,0.35)] flex flex-col items-center justify-center text-center relative overflow-hidden">
              <div className="absolute w-72 h-72 rounded-full bg-amber-500/10 blur-3xl -top-20 -left-10 pointer-events-none" />
              <div className="absolute w-72 h-72 rounded-full bg-amber-500/5 blur-3xl -bottom-20 -right-10 pointer-events-none" />

              <div className="relative z-10 max-w-md w-full space-y-5 sm:space-y-6">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-amber-500/15 border border-amber-500/35 flex items-center justify-center mx-auto mb-2 animate-pulse">
                  <Lock size={26} className="text-amber-500" />
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                    Conteúdo Premium
                  </span>
                  <h2 className="font-display text-xl sm:text-3xl font-black text-white leading-tight">
                    Desbloqueie a Filoteia
                  </h2>
                  <p className="font-serif text-xs sm:text-sm text-slate-300">
                    O Dia 1 é gratuito para todos. Para continuar sua caminhada diária com a Filoteia e acessar as demais meditações, assine o Sanctificare Premium.
                  </p>
                </div>

                <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 my-4 relative z-10 text-left">
                  <button
                    onClick={() => setSelectedPlan("monthly")}
                    className={`relative rounded-xl border p-3.5 sm:p-4 transition-all cursor-pointer ${
                      selectedPlan === "monthly"
                        ? "border-amber-500/60 bg-amber-500/10"
                        : "border-white/10 bg-white/5 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Mensal
                      </span>
                      {selectedPlan === "monthly" && (
                        <div className="w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center">
                          <Check size={10} className="text-slate-950 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg sm:text-xl font-bold text-white">R$ 14,90</span>
                      <span className="text-xs text-slate-400">/mês</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setSelectedPlan("annual")}
                    className={`relative rounded-xl border p-3.5 sm:p-4 transition-all cursor-pointer ${
                      selectedPlan === "annual"
                        ? "border-amber-500/60 bg-amber-500/10"
                        : "border-white/10 bg-white/5 hover:border-white/20"
                    }`}
                  >
                    <span className="absolute -top-2.5 right-3 bg-amber-500 text-slate-950 text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-sm z-10">
                      Economize 28%
                    </span>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                        Anual
                      </span>
                      {selectedPlan === "annual" && (
                        <div className="w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center">
                          <Check size={10} className="text-slate-950 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg sm:text-xl font-bold text-white">R$ 10,75</span>
                      <span className="text-xs text-slate-400">/mês</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">R$ 129,00 cobrados anualmente</p>
                  </button>
                </div>

                <div className="space-y-3 pt-2">
                  <Button
                    onClick={handleSubscribe}
                    disabled={subscribing}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs sm:text-sm uppercase tracking-wider h-11 sm:h-12 transition-all shadow-md rounded-xl cursor-pointer"
                  >
                    {subscribing ? (
                      <Loader2 size={16} className="animate-spin mr-2" />
                    ) : (
                      <Crown size={14} className="mr-2" />
                    )}
                    {isAuthenticated
                      ? "Iniciar Teste Grátis de 14 Dias"
                      : "Entrar e Testar Grátis"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => openRouteInApp("/degraus-de-perfeicao/filoteia")}
                    className="w-full border-amber-500/35 bg-transparent text-amber-300 hover:bg-amber-500/10 hover:text-amber-200 font-bold text-xs sm:text-sm uppercase tracking-wider h-10 sm:h-11 rounded-xl"
                  >
                    Abrir no app
                  </Button>
                  <p className="text-[10px] text-slate-400">
                    14 dias grátis, depois {selectedPlan === "annual" ? "R$ 129,00/ano" : "R$ 14,90/mês"}. Cancele quando quiser.
                  </p>
                </div>
              </div>
            </section>
          ) : (
            <section className={`rounded-2xl border transition-all duration-500 p-4 sm:p-6 ${
              activeTab === "audio"
                ? "bg-[#0b1329] border-amber-500/10 text-slate-100 shadow-[0_12px_40px_rgba(11,19,41,0.2)]"
                : "bg-[#fcfbf7] border-[oklch(0.72_0.10_75/0.25)] text-[#2d251e] shadow-[0_12px_40px_rgba(232,223,199,0.15)]"
            }`}>
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "audio" | "text")}>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between border-b border-border/20 pb-4 mb-4 gap-3">
                  <TabsList className={`p-1 rounded-xl transition-all w-full sm:w-fit grid grid-cols-2 ${
                    activeTab === "audio"
                      ? "bg-white/5 border border-white/10"
                      : "bg-[oklch(0.22_0.07_260/0.06)]"
                  }`}>
                    <TabsTrigger value="audio" className={`gap-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                      activeTab === "audio"
                        ? "data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950 text-slate-400"
                        : "data-[state=active]:bg-[oklch(0.75_0.12_75)] data-[state=active]:text-white text-muted-foreground"
                    }`}>
                      <Headphones size={14} />
                      <span>Áudio</span>
                    </TabsTrigger>
                    <TabsTrigger value="text" className={`gap-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                      activeTab === "text"
                        ? "data-[state=active]:bg-[oklch(0.75_0.12_75)] data-[state=active]:text-white text-muted-foreground"
                        : "data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950 text-slate-400"
                    }`}>
                      <BookOpenText size={14} />
                      <span>Texto</span>
                    </TabsTrigger>
                  </TabsList>

                  {activeTab === "text" && (
                    <div className="flex items-center justify-between sm:justify-start gap-1 bg-[oklch(0.22_0.07_260/0.04)] p-1.5 rounded-xl border border-border/30 w-full sm:w-auto">
                      <span className="text-[11px] font-bold text-[#6e5e52] px-1.5 flex items-center gap-1 shrink-0">
                        <Type size={13} /> Fonte
                      </span>
                      <div className="flex items-center gap-1">
                        {(["sm", "md", "lg", "xl"] as const).map((size) => (
                          <button
                            key={size}
                            onClick={() => setFontSize(size)}
                            className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              fontSize === size
                                ? "bg-[oklch(0.22_0.07_260)] text-white shadow-sm"
                                : "text-[#6e5e52] hover:bg-black/5"
                            }`}
                          >
                            {size.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <TabsContent value="audio" className="space-y-4 sm:space-y-6 animate-fade-in outline-none">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-6 backdrop-blur-md relative overflow-hidden flex flex-col items-center text-center shadow-2xl">
                    <div className="absolute w-48 h-48 rounded-full bg-amber-500/5 blur-3xl -top-10 pointer-events-none" />

                    <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                      {selected.id.toUpperCase().replace("PILL", "MEDITAÇÃO ")}
                    </span>
                    <h2 className="mt-2 sm:mt-3 font-display text-xl xs:text-2xl sm:text-3xl font-bold text-slate-100 leading-tight max-w-md px-2">
                      {selected.title}
                    </h2>

                    <div className="flex flex-col items-center justify-center my-4 sm:my-6">
                      <div className="relative w-32 h-32 xs:w-40 xs:h-40">
                        <div className={`absolute -inset-2 rounded-2xl xs:rounded-3xl bg-gradient-to-tr from-amber-600 to-amber-300 blur-md transition-opacity duration-1000 ${
                          isPlaying ? "opacity-70 animate-pulse" : "opacity-30"
                        }`} />
                        {isPlaying && (
                          <div className="absolute inset-0 rounded-2xl xs:rounded-3xl bg-amber-500/25 blur-lg animate-ping" style={{ animationDuration: '3s' }} />
                        )}
                        <img
                          src="/assets/degraus/filoteia_essence.jpg"
                          alt="Essência da Filoteia"
                          className={`relative w-32 h-32 xs:w-40 xs:h-40 rounded-2xl xs:rounded-3xl object-cover z-10 border border-white/10 shadow-2xl transition-transform duration-[6000ms] ${
                            isPlaying ? "scale-[1.03]" : "scale-100"
                          }`}
                        />
                      </div>
                    </div>

                    {(() => {
                      const audioUrl = resolvedAudioUrl || selected.audioUrl || "";
                      return (
                        <>
                          {audioUrl ? (
                            <audio
                              ref={audioRef}
                              src={audioUrl}
                              onTimeUpdate={handleTimeUpdate}
                              onLoadedMetadata={handleLoadedMetadata}
                              onEnded={handleAudioEnd}
                              preload="metadata"
                            />
                          ) : null}

                          <div className="w-full max-w-sm sm:max-w-md bg-white/5 border border-white/10 rounded-2xl p-3.5 sm:p-5 backdrop-blur-md shadow-lg flex flex-col gap-3 sm:gap-4">
                            {/* Time Slider */}
                            <div className="flex items-center gap-2 sm:gap-3 w-full">
                              <span className="text-[10px] sm:text-[11px] font-mono text-slate-300 w-8 sm:w-9 text-right shrink-0">
                                {formatTime(currentTime)}
                              </span>
                              <input
                                type="range"
                                min={0}
                                max={duration || 100}
                                step={0.1}
                                value={currentTime}
                                onChange={(e) => handleSeek(Number(e.target.value))}
                                disabled={!audioUrl}
                                className="flex-1 h-2 rounded-full accent-amber-500 bg-white/20 cursor-pointer outline-none transition-all duration-300 disabled:opacity-50"
                                style={{
                                  background: `linear-gradient(to right, oklch(0.75 0.12 75) ${
                                    duration > 0 ? (currentTime / duration) * 100 : 0
                                  }%, rgba(255,255,255,0.2) ${
                                    duration > 0 ? (currentTime / duration) * 100 : 0
                                  }%)`,
                                }}
                              />
                              <span className="text-[10px] sm:text-[11px] font-mono text-slate-300 w-8 sm:w-9 text-left shrink-0">
                                {formatTime(duration)}
                              </span>
                            </div>

                            {/* Main Playback Controls Row */}
                            <div className="flex items-center justify-between sm:justify-center sm:gap-6 px-1">
                              <button
                                onClick={changeSpeed}
                                className="text-slate-300 hover:text-white text-xs font-bold font-sans w-9 h-9 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                                title="Velocidade de reprodução"
                              >
                                {playbackRate}x
                              </button>

                              <button
                                onClick={skipBackward}
                                disabled={!audioUrl}
                                className="text-slate-300 hover:text-white w-9 h-9 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer disabled:opacity-40 shrink-0"
                                title="Voltar 10 segundos"
                              >
                                <RotateCcw size={16} />
                              </button>

                              <button
                                onClick={togglePlay}
                                disabled={!audioUrl}
                                className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/25 transition-all hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50 shrink-0"
                                title={isPlaying ? "Pausar" : "Reproduzir"}
                              >
                                {isPlaying ? (
                                  <Pause size={22} className="fill-slate-950" />
                                ) : (
                                  <Play size={22} className="fill-slate-950 ml-0.5" />
                                )}
                              </button>

                              <button
                                onClick={skipForward}
                                disabled={!audioUrl}
                                className="text-slate-300 hover:text-white w-9 h-9 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer disabled:opacity-40 shrink-0"
                                title="Avançar 10 segundos"
                              >
                                <RotateCw size={16} />
                              </button>

                              <button
                                onClick={handleShare}
                                className="text-slate-300 hover:text-white w-9 h-9 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                                title="Compartilhar"
                              >
                                <Share2 size={16} />
                              </button>
                            </div>

                            {/* Secondary Actions Bar (Fundo Sacro & Mute) */}
                            <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2 px-1">
                              <button
                                onClick={toggleAmbientSound}
                                className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                                  isAmbientOn
                                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
                                    : "bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 border border-white/10"
                                }`}
                                title={isAmbientOn ? "Desativar Fundo Sacro" : "Ativar Fundo Sacro (Canto Gregoriano)"}
                              >
                                <Music size={13} className={isAmbientOn ? "text-amber-400 animate-pulse" : ""} />
                                <span>{isAmbientOn ? "Fundo Sacro On" : "Fundo Sacro Off"}</span>
                              </button>

                              <button
                                onClick={toggleMute}
                                disabled={!audioUrl}
                                className="text-slate-300 hover:text-white px-2.5 py-1.5 rounded-full hover:bg-white/10 flex items-center gap-1 text-xs font-medium transition-colors cursor-pointer disabled:opacity-40"
                                title={isMuted ? "Ativar som" : "Mudar para mudo"}
                              >
                                {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
                                <span>{isMuted ? "Muto" : "Som"}</span>
                              </button>
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>

                  <blockquote className="rounded-xl border-l-4 border-amber-500 bg-white/5 px-4 py-3 font-serif italic text-slate-300 text-xs sm:text-sm">
                    <Quote size={14} className="mb-1 text-amber-500/80" />
                    {selected.quote}
                  </blockquote>

                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3.5 sm:p-4">
                    <div className="mb-1 flex items-center gap-2 text-emerald-400">
                      <Check size={15} />
                      <p className="text-xs font-bold uppercase tracking-wide">Resolução prática proposta</p>
                    </div>
                    <p className="text-xs sm:text-sm leading-relaxed text-emerald-100 whitespace-pre-line">{selected.resolution}</p>
                  </div>
                </TabsContent>

                <TabsContent value="text" className="space-y-5 sm:space-y-6 animate-fade-in text-[#2d251e] outline-none">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[oklch(0.65_0.12_70)]">
                      {selected.id.toUpperCase().replace("PILL", "MEDITAÇÃO ")}
                    </span>
                    <h2 className="font-display text-xl sm:text-2xl font-bold text-[oklch(0.22_0.07_260)] leading-tight">
                      {selected.title}
                    </h2>
                    <p className="text-xs text-muted-foreground mt-1">{selected.description}</p>
                  </div>

                  <blockquote className="rounded-xl border-l-4 border-[oklch(0.75_0.12_75)] bg-[oklch(0.97_0.02_85)] px-4 py-3 font-serif italic text-[oklch(0.30_0.06_260)] text-xs sm:text-sm">
                    <Quote size={14} className="mb-1 text-[oklch(0.65_0.12_70)]" />
                    {selected.quote}
                  </blockquote>

                  <div className="rounded-xl border border-[oklch(0.55_0.11_145/0.2)] bg-[oklch(0.96_0.04_145)] p-3 sm:p-4">
                    <div className="mb-1 flex items-center gap-2 text-[oklch(0.35_0.10_145)]">
                      <Check size={14} />
                      <p className="text-xs font-bold uppercase tracking-wide">Resolução prática</p>
                    </div>
                    <p className="text-xs sm:text-sm leading-relaxed text-[oklch(0.28_0.05_145)] whitespace-pre-line">{selected.resolution}</p>
                  </div>

                  <div className="rounded-xl border border-[oklch(0.55_0.11_70/0.2)] bg-[oklch(0.98_0.03_85)] p-3 sm:p-4">
                    <div className="mb-1 flex items-center gap-2 text-[oklch(0.55_0.11_70)]">
                      <CircleHelp size={14} />
                      <p className="text-xs font-bold uppercase tracking-wide">Exame de consciência</p>
                    </div>
                    <p className="text-xs sm:text-sm leading-relaxed text-[oklch(0.36_0.06_70)] whitespace-pre-line">{selected.exam}</p>
                  </div>

                  <div className="rounded-2xl border border-[oklch(0.22_0.07_260/0.12)] bg-[#fdfdfb] p-4 sm:p-6 shadow-sm">
                    <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-[oklch(0.65_0.12_70)] border-b border-[oklch(0.22_0.07_260/0.05)] pb-1.5">Texto Completo</p>
                    <p className={`whitespace-pre-line font-serif text-[#2d251e]/90 break-words first-letter:float-left first-letter:text-4xl sm:first-letter:text-5xl first-letter:font-bold first-letter:font-display first-letter:mr-2.5 first-letter:mt-0.5 first-letter:leading-none first-letter:text-[oklch(0.75_0.12_75)] ${fontSizeClasses[fontSize]}`}>
                      {selected.scriptText}
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </section>
          )}

          {/* Desktop & Mobile List Sidebar */}
          <aside className="rounded-2xl border border-[oklch(0.22_0.07_260/0.08)] bg-white p-3.5 sm:p-4 h-fit text-[#2d251e]">
            <h3 className="mb-3 px-1 text-xs font-bold uppercase tracking-widest text-[oklch(0.65_0.12_70)]">
              Meditações ({FILOTEIA_PILULAS.length} Dias)
            </h3>
            <div className="max-h-[60vh] sm:max-h-[70vh] space-y-2 overflow-y-auto pr-1">
              {FILOTEIA_PILULAS.map((pill) => {
                const active = pill.id === selected.id;
                const isPillPremium = pill.id !== "pill1";
                const isLocked = isPillPremium && !isPremium;
                return (
                  <button
                    key={pill.id}
                    onClick={() => handleSelectPill(pill.id, isPillPremium)}
                    className={`w-full rounded-xl border px-3 py-2.5 text-left transition-all cursor-pointer min-h-[52px] ${
                      active
                        ? "border-[oklch(0.65_0.12_70)] bg-[oklch(0.98_0.03_85)] shadow-sm"
                        : "border-[oklch(0.22_0.07_260/0.08)] bg-white hover:border-[oklch(0.65_0.12_70/0.4)]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className={`text-[9px] font-bold uppercase tracking-wider ${
                        active ? "text-[oklch(0.65_0.12_70)]" : "text-muted-foreground"
                      }`}>{pill.id.toUpperCase().replace("PILL", "MEDITAÇÃO ")}</span>
                      <div className="flex items-center gap-1.5">
                        {isLocked && <Lock size={10} className="text-amber-500 shrink-0" />}
                        <span className="text-[9px] text-muted-foreground">{pill.durationLabel}</span>
                      </div>
                    </div>
                    <p className="line-clamp-2 text-xs font-bold text-[oklch(0.22_0.07_260)]">{pill.title}</p>
                  </button>
                );
              })}
            </div>
          </aside>
        </div>
      </main>

      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        title={selected.title}
        description={selected.description}
        url={getPublicUrl()}
      />

      <QuoteCardModal
        isOpen={isQuoteCardOpen}
        onClose={() => setIsQuoteCardOpen(false)}
        quote={selected.quote}
        bookTitle="Filoteia"
        author="São Francisco de Sales"
        dayTitle={selected.title}
      />

      <DailyReminderModal
        isOpen={isReminderOpen}
        onClose={() => setIsReminderOpen(false)}
        bookTitle="Filoteia"
      />

      <RetiroCompletionModal
        isOpen={isCompletionOpen}
        onClose={() => setIsCompletionOpen(false)}
        bookTitle="Filoteia (Alma que Ama a Deus)"
        author="São Francisco de Sales"
        totalDays={FILOTEIA_PILULAS.length}
      />
    </div>
  );
}

