import { useMemo, useState, useEffect, useRef } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { applyImageFallback, getLoginUrl, resolveR2Redirect } from "@/const";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { getNovenaBySlug } from "@/data/novenas";
import { Crown, Lock, CheckCircle2, ArrowLeft, Info, Headphones, Play, Pause, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { Link, useRoute } from "wouter";
import { Heart } from "@/components/HeartIcon";
import { toast } from "sonner";
import { getNovenaArt } from "@/lib/cardArt";

const LOGO_IMG = "/assets/logo-sanctificare.webp";
const PROGRESS_KEY = "sanctificare.novenas.progress.v1";
const INITIAL_PRAYER_MARKER = "ORAÇÃO INICIAL PARA TODOS OS DIAS";
const FINAL_PRAYER_MARKER = "ORAÇÃO FINAL PARA TODOS OS DIAS";

type ProgressMap = Record<string, number[]>;

function readProgress(): ProgressMap {
  if (typeof window === "undefined") return {};

  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as ProgressMap;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeProgress(progress: ProgressMap) {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch {
    // Ignore storage failures; state in memory remains consistent for the session.
  }
}

function splitCommonPrayers(prayerText: string) {
  const initialIndex = prayerText.indexOf(INITIAL_PRAYER_MARKER);
  const finalIndex = prayerText.indexOf(FINAL_PRAYER_MARKER);

  if (initialIndex === -1 || finalIndex === -1 || finalIndex <= initialIndex) {
    return null;
  }

  const initialBody = prayerText
    .slice(initialIndex + INITIAL_PRAYER_MARKER.length, finalIndex)
    .trim();
  const finalBody = prayerText
    .slice(finalIndex + FINAL_PRAYER_MARKER.length)
    .trim();

  return { initialBody, finalBody };
}

export default function NovenaDetails() {
  const [matched, params] = useRoute<{ slug: string }>("/novenas/:slug");
  const { isAuthenticated, loading } = useAuth();
  
  // Lê o dia do parâmetro de busca (query param) ou inicia no dia 1
  const [selectedDay, setSelectedDay] = useState(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const dayParam = searchParams.get("day");
      if (dayParam) {
        const parsed = parseInt(dayParam, 10);
        if (parsed >= 1 && parsed <= 9) return parsed;
      }
    }
    return 1;
  });

  const [progress, setProgress] = useState<ProgressMap>(() => readProgress());
  const { data: subscription } = trpc.subscriptions.getActive.useQuery(undefined, { enabled: isAuthenticated });
  
  const utils = trpc.useUtils();
  const logPrayer = trpc.prayers.logPrayer.useMutation();

  const isPremium = Boolean(subscription);
  
  const selectedNovena = useMemo(() => {
    if (!matched || !params?.slug) return undefined;
    return getNovenaBySlug(params.slug);
  }, [matched, params?.slug]);

  const safeDay = Math.min(Math.max(selectedDay, 1), selectedNovena?.days.length ?? 1);
  const currentDayContent = selectedNovena?.days.find((d) => d.day === safeDay);

  const isLocked = selectedNovena?.category === "premium" && !isPremium;
  const currentCompleted = selectedNovena ? progress[selectedNovena.id] ?? [] : [];
  const [activeTab, setActiveTab] = useState<"audio" | "text">("audio");

  // Audio states
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playingUrl, setPlayingUrl] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);

  // Resolve audio URL
  useEffect(() => {
    let active = true;
    if (currentDayContent?.audioUrl && !isLocked) {
      resolveR2Redirect(currentDayContent.audioUrl).then((url) => {
        if (active) setPlayingUrl(url);
      });
    } else {
      setPlayingUrl("");
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
    }
    return () => {
      active = false;
    };
  }, [currentDayContent?.audioUrl, isLocked]);

  // Audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => {
      if (Number.isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [playingUrl]);

  // Sync Volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Handle active tab fallback based on audio availability
  useEffect(() => {
    if (currentDayContent && !currentDayContent.audioUrl) {
      setActiveTab("text");
    } else if (isLocked) {
      setActiveTab("text");
    } else {
      setActiveTab("audio");
    }
  }, [currentDayContent, isLocked]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  };

  const handleSeek = (value: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = value;
    setCurrentTime(value);
  };

  const handleRestart = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    setCurrentTime(0);
    audio.play().then(() => setIsPlaying(true));
  };

  // Helper to format track timings
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Intenção Particular da Novena
  const [intention, setIntention] = useState("");
  const [isEditingIntention, setIsEditingIntention] = useState(false);
  const [tempIntention, setTempIntention] = useState("");

  useEffect(() => {
    if (selectedNovena && typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(`sanctificare.novenas.intention.${selectedNovena.id}`) || "";
        setIntention(saved);
        setTempIntention(saved);
      } catch {
        setIntention("");
        setTempIntention("");
      }
    }
  }, [selectedNovena]);

  const saveIntention = () => {
    if (!selectedNovena) return;
    try {
      localStorage.setItem(`sanctificare.novenas.intention.${selectedNovena.id}`, tempIntention);
    } catch {
      toast.error("Não foi possível salvar a intenção neste dispositivo.");
      return;
    }
    setIntention(tempIntention);
    setIsEditingIntention(false);
    toast.success("Intenção salva com sucesso!");
  };

  const toggleDayAsComplete = async () => {
    if (!selectedNovena) return;
    if (isLocked) return;

    const done = progress[selectedNovena.id] ?? [];
    const alreadyDone = done.includes(safeDay);
    const nextDays = alreadyDone ? done.filter((day) => day !== safeDay) : [...done, safeDay].sort((a, b) => a - b);

    const nextProgress = {
      ...progress,
      [selectedNovena.id]: nextDays,
    };

    setProgress(nextProgress);
    writeProgress(nextProgress);

    if (alreadyDone) {
      toast.info(`Dia ${safeDay} desmarcado.`);
      return;
    }

    try {
      await logPrayer.mutateAsync({
        prayerType: "novena",
        prayerName: `${selectedNovena.name} - Dia ${safeDay}`
      });
      toast.success(`Dia ${safeDay} concluído. Persevere com fé na sua novena.`);
      await utils.prayers.getRecentLogs.invalidate();
      await utils.prayers.getAllLogs.invalidate();
    } catch (err) {
      console.error("[Novena log error]", err);
      toast.success(`Dia ${safeDay} marcado localmente.`);
    }
  };

  const sagradoCoracaoPrayerSections = useMemo(() => {
    if (!currentDayContent) return null;
    if (selectedNovena?.id !== "novena-sagrado-coracao-jesus") return null;
    return splitCommonPrayers(currentDayContent.prayer);
  }, [currentDayContent, selectedNovena?.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <img src={LOGO_IMG} alt="Sanctificare" className="w-16 h-16 object-contain animate-pulse" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <img src={LOGO_IMG} alt="Sanctificare" className="w-16 h-16 object-contain mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold mb-2">Acesso Restrito</h2>
          <p className="text-muted-foreground mb-6">Entre para acompanhar esta novena e seus dias de oração.</p>
          <a href={getLoginUrl()}><Button>Entrar</Button></a>
        </div>
      </div>
    );
  }

  if (!selectedNovena) {
    return (
      <div className="min-h-screen bg-[oklch(0.965_0.012_82)]">
        <main className="container py-10">
          <div className="rounded-2xl border border-[oklch(0.72_0.10_75/0.3)] bg-white p-8 text-center">
            <h1 className="font-display text-2xl font-bold text-[oklch(0.22_0.07_260)] mb-2">Novena não encontrada</h1>
            <p className="text-muted-foreground mb-5">Esta rota de novena não existe ou foi removida.</p>
            <Link href="/novenas">
              <Button>Voltar ao catálogo</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[oklch(0.965_0.012_82)] relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_oklch(0.90_0.04_85/0.40),_transparent_55%),linear-gradient(180deg,_oklch(1_0_0/0.30),_transparent)]" />
      <div className="pointer-events-none absolute inset-0 bg-pattern-cross opacity-25" />

      <main className="container py-10 relative z-10">
        <div className="mb-5">
          <Link href="/novenas">
            <button className="inline-flex items-center gap-2 text-sm font-medium text-[oklch(0.30_0.07_260)] hover:text-[oklch(0.24_0.07_260)] transition-colors">
              <ArrowLeft size={16} />
              Voltar ao catálogo de novenas
            </button>
          </Link>
        </div>

        {/* Layout Principal em 2 Colunas */}
        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 items-start">
          
          {/* Coluna Esquerda: Informações, Progresso e Intenção */}
          <div className="space-y-4 order-2 lg:order-1">
            
            {/* Cartão de Informações da Novena */}
            <div className="rounded-2xl border border-[oklch(0.72_0.10_75/0.32)] bg-white p-5 shadow-[0_12px_40px_oklch(0.22_0.07_260/0.08)]">
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={getNovenaArt(selectedNovena.id).image}
                  alt={selectedNovena.name}
                  className="w-12 h-12 rounded-xl object-cover border border-[oklch(0.72_0.10_75/0.35)]"
                  loading="lazy"
                  onError={(event) => applyImageFallback(event.currentTarget)}
                />
                <div>
                  <h1 className="font-serif text-lg font-semibold text-[oklch(0.22_0.07_260)] leading-tight">{selectedNovena.name}</h1>
                  <p className="text-xs text-muted-foreground mt-0.5">{selectedNovena.subtitle}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed font-sans mb-3">
                {selectedNovena.description}
              </p>
              <div className="flex items-center justify-between border-t border-border pt-3">
                <span className="text-xs font-semibold text-muted-foreground">Progresso</span>
                <span className="text-xs font-bold text-[oklch(0.22_0.07_260)]">{currentCompleted.length}/9 dias concluídos</span>
              </div>
            </div>

            {/* Barra de Progresso de 9 Dias (Estilo Hallow) */}
            <div className="rounded-2xl border border-[oklch(0.72_0.10_75/0.32)] bg-white p-5 shadow-[0_12px_40px_oklch(0.22_0.07_260/0.08)]">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold mb-3">Progresso da Jornada</p>
              <div className="grid grid-cols-5 gap-2 justify-items-center">
                {Array.from({ length: 9 }, (_, idx) => {
                  const dayNum = idx + 1;
                  const isDone = currentCompleted.includes(dayNum);
                  const isActive = dayNum === safeDay;

                  return (
                    <button
                      key={dayNum}
                      onClick={() => setSelectedDay(dayNum)}
                      disabled={isLocked}
                      className={`relative w-10 h-10 rounded-full flex items-center justify-center font-sans text-xs font-bold transition-all ${
                        isActive
                          ? "bg-[oklch(0.22_0.07_260)] text-white ring-2 ring-[oklch(0.75_0.12_75)] scale-110 shadow-sm"
                          : isDone
                          ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20"
                          : "bg-muted/40 hover:bg-muted text-muted-foreground border border-transparent"
                      }`}
                      title={`Ir para o Dia ${dayNum}`}
                    >
                      {isDone ? (
                        <CheckCircle2 size={15} className="text-emerald-600 fill-emerald-600/10" />
                      ) : (
                        dayNum
                      )}
                      
                      {isActive && (
                        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[oklch(0.75_0.12_75)]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Caixa de Intenção Particular (Estilo Hallow) */}
            <div className="rounded-2xl border border-[oklch(0.72_0.10_75/0.32)] bg-white p-5 shadow-[0_12px_40px_oklch(0.22_0.07_260/0.08)]">
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-1.5">
                  <Heart size={14} className="text-rose-500 fill-rose-500/10" />
                  <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold">Minha Intenção</span>
                </div>
                {!isEditingIntention && (
                  <button
                    onClick={() => setIsEditingIntention(true)}
                    className="text-xs text-[oklch(0.65_0.12_70)] hover:underline font-semibold"
                  >
                    {intention ? "Editar" : "Escrever"}
                  </button>
                )}
              </div>

              {isEditingIntention ? (
                <div className="space-y-2">
                  <textarea
                    value={tempIntention}
                    onChange={(e) => setTempIntention(e.target.value)}
                    placeholder="Escreva aqui sua intenção particular para esta novena (ex: pela cura de um familiar, por paz espiritual, etc.)..."
                    className="w-full text-xs rounded-lg border border-border p-2.5 bg-background text-foreground focus:ring-1 focus:ring-[oklch(0.75_0.12_75)] outline-none min-h-[80px] resize-none font-sans"
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-xs h-7 px-2"
                      onClick={() => {
                        setTempIntention(intention);
                        setIsEditingIntention(false);
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button
                      size="sm"
                      className="bg-[oklch(0.22_0.07_260)] hover:bg-[oklch(0.28_0.08_260)] text-white text-[11px] font-semibold h-7 px-3"
                      onClick={saveIntention}
                    >
                      Salvar
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-xs font-serif italic text-[oklch(0.38_0.03_260)] leading-relaxed pl-2.5 border-l-2 border-[oklch(0.75_0.12_75)]">
                  {intention ? (
                    `"${intention}"`
                  ) : (
                    <span className="text-muted-foreground/60 not-italic font-sans text-[11px]">
                      Você ainda não definiu sua intenção para esta novena. Toque em "Escrever" para colocar sua súplica diante do Senhor.
                    </span>
                  )}
                </p>
              )}
            </div>

          </div>

          {/* Coluna Direita: Conteúdo de Leitura do Dia */}
          <div className={`rounded-2xl border transition-all duration-500 p-6 order-1 lg:order-2 ${
            activeTab === "audio"
              ? "bg-[#0b1329] border-amber-500/20 text-slate-100 shadow-[0_12px_40px_rgba(11,19,41,0.2)]"
              : "bg-[#fcfbf7] border-[oklch(0.72_0.10_75/0.25)] text-[#2d251e] shadow-[0_12px_40px_rgba(232,223,199,0.15)]"
          }`}>
            {currentDayContent ? (
              <>
                {isLocked ? (
                  <div className="py-12 text-center">
                    <div className="w-14 h-14 rounded-full bg-[oklch(0.75_0.12_75/0.14)] border border-[oklch(0.75_0.12_75/0.35)] flex items-center justify-center mx-auto mb-4">
                      <Lock size={22} className="text-[oklch(0.65_0.12_70)]" />
                    </div>
                    <h3 className="font-display text-xl font-bold text-[oklch(0.22_0.07_260)] mb-2">Esta é uma Novena Premium</h3>
                    <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-6">Assine o Sanctificare Premium para ter acesso irrestrito a todas as novenas, meditações e reflexões diárias.</p>
                    <Link href="/premium">
                      <Button className="bg-[oklch(0.22_0.07_260)] hover:bg-[oklch(0.28_0.08_260)] text-white font-semibold">
                        <Crown size={15} className="mr-2" />
                        Desbloquear com Premium
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-6">
                    
                    {/* Seleção de Abas do Conceito B */}
                    {currentDayContent.audioUrl && (
                      <div className="flex border-b border-white/10 dark:border-white/10 mb-6">
                        <button
                          onClick={() => setActiveTab("audio")}
                          className={`flex-1 py-3 text-center text-xs font-bold uppercase tracking-wider transition-all border-b-2 flex items-center justify-center gap-1.5 ${
                            activeTab === "audio"
                              ? "border-amber-500 text-amber-500"
                              : "border-transparent text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <span>Áudio</span>
                          {isPlaying && (
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                          )}
                        </button>
                        <button
                          onClick={() => setActiveTab("text")}
                          className={`flex-1 py-3 text-center text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
                            activeTab === "text"
                              ? "border-amber-500 text-amber-600 dark:text-amber-400"
                              : "border-transparent text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          Texto
                        </button>
                      </div>
                    )}

                    {activeTab === "audio" && currentDayContent.audioUrl ? (
                      /* ==========================================
                         ABA ÁUDIO: Visual Navy + Gold + Glassmorphism
                         ========================================== */
                      <div className="space-y-6 animate-fade-in">
                        {/* Cabeçalho do Dia */}
                        <div className="text-center">
                          <span className="text-[10px] uppercase font-bold tracking-widest text-amber-500/80">Dia {safeDay}</span>
                          <h2 className="font-serif text-xl md:text-2xl font-bold text-white mt-1 leading-tight">
                            {currentDayContent.title}
                          </h2>
                        </div>

                        {/* Visual de Capa e Frase Devocional */}
                        <div className="flex flex-col items-center justify-center my-6">
                          <div className="relative w-36 h-36 mb-6">
                            <div
                              className={`absolute -inset-1.5 rounded-3xl bg-gradient-to-tr from-amber-600 to-amber-300 blur-sm transition-opacity duration-1000 ${
                                isPlaying ? "opacity-90 animate-pulse" : "opacity-40"
                              }`}
                            />
                            {isPlaying && (
                              <div className="absolute inset-0 rounded-3xl bg-amber-500/25 blur-md animate-ping" style={{ animationDuration: '3s' }} />
                            )}
                            <img
                              src={getNovenaArt(selectedNovena.id).image}
                              alt={selectedNovena.name}
                              className={`relative w-36 h-36 rounded-3xl object-cover z-10 border border-white/10 shadow-2xl transition-transform duration-[6000ms] ${
                                isPlaying ? "scale-[1.03]" : "scale-100"
                              }`}
                            />
                          </div>
                          
                          {/* Frase Devocional de Destaque */}
                          <p className="text-center text-amber-500/90 text-sm font-serif italic max-w-xs px-4 mt-2">
                            "{currentDayContent.reflection.split('.')[0]}."
                          </p>
                        </div>

                        {/* Controles de Áudio (Navy + Gold + Glassmorphism) */}
                        <div className="w-full max-w-sm mx-auto bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md shadow-lg flex flex-col gap-3">
                          {/* Progress bar */}
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-300 w-8 text-right font-sans">
                              {formatTime(currentTime)}
                            </span>
                            <input
                              type="range"
                              min={0}
                              max={duration || 100}
                              step={0.1}
                              value={currentTime}
                              onChange={(e) => handleSeek(Number(e.target.value))}
                              className="flex-1 h-1 rounded-full accent-amber-500 bg-white/20 cursor-pointer outline-none"
                              style={{
                                background: `linear-gradient(to right, oklch(0.75 0.12 75) ${
                                  duration > 0 ? (currentTime / duration) * 100 : 0
                                }%, rgba(255,255,255,0.2) ${
                                  duration > 0 ? (currentTime / duration) * 100 : 0
                                }%)`,
                              }}
                            />
                            <span className="text-[10px] text-slate-300 w-8 font-sans">
                              -{formatTime(Math.max(duration - currentTime, 0))}
                            </span>
                          </div>

                          {/* Controls Buttons */}
                          <div className="flex items-center justify-between px-2">
                            <button
                              onClick={handleRestart}
                              className="text-slate-300 hover:text-white p-1.5 rounded-full hover:bg-white/5 transition-colors"
                              title="Reiniciar áudio"
                            >
                              <RotateCcw size={15} />
                            </button>

                            <button
                              onClick={togglePlay}
                              className="w-11 h-11 rounded-full bg-[#bf9926] hover:bg-[#a37e1a] text-slate-950 flex items-center justify-center shadow-md transition-transform hover:scale-105"
                              title={isPlaying ? "Pausar" : "Reproduzir"}
                            >
                              {isPlaying ? (
                                <Pause size={16} fill="currentColor" />
                              ) : (
                                <Play size={16} fill="currentColor" className="ml-0.5" />
                              )}
                            </button>

                            <div className="flex items-center gap-1 group">
                              <button
                                onClick={() => setIsMuted(!isMuted)}
                                className="text-slate-300 hover:text-white p-1.5 rounded-full hover:bg-white/5 transition-colors"
                              >
                                {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* ==========================================
                         ABA TEXTO: Visual Book / Cream Paper
                         ========================================== */
                      <div className="space-y-6 animate-fade-in">
                        {/* Cabeçalho do Dia */}
                        <div className="border-b border-border/40 pb-4">
                          <span className="text-[10px] uppercase font-bold tracking-widest text-[#bf9926]">Dia {safeDay}</span>
                          <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#2d251e] mt-1 leading-tight">
                            {currentDayContent.title}
                          </h2>
                        </div>

                        {/* Exibição permanentemente destacada da Intenção do usuário durante a leitura */}
                        {intention && (
                          <div className="rounded-xl border border-rose-100 bg-rose-50/20 p-3.5 flex gap-2.5 items-start">
                            <Heart size={14} className="text-rose-500 fill-rose-500/20 mt-0.5 flex-shrink-0" />
                            <div>
                              <span className="text-[10px] uppercase tracking-wider font-bold text-rose-700/80">Rezando por esta Intenção:</span>
                              <p className="text-xs font-serif italic text-rose-900/90 leading-normal mt-0.5">"{intention}"</p>
                            </div>
                          </div>
                        )}

                        {/* Meditação do Dia */}
                        <div className="space-y-2">
                          <span className="text-[10px] uppercase tracking-widest font-bold text-[#8a7a6e]">Meditação</span>
                          <p className="text-sm font-serif leading-relaxed text-[#4a3b32] text-justify bg-[#f5f1e6]/40 p-4 rounded-xl border border-[#e8dfc7]/20">
                            <span className="float-left text-4xl font-serif font-bold text-[#bf9926] mr-2 mt-1 leading-none select-none">
                              {currentDayContent.reflection.charAt(0)}
                            </span>
                            {currentDayContent.reflection.slice(1)}
                          </p>
                        </div>

                        {/* Oração do Dia */}
                        <div className="space-y-2">
                          <span className="text-[10px] uppercase tracking-widest font-bold text-[#8a7a6e]">Oração</span>
                          
                          {sagradoCoracaoPrayerSections ? (
                            <div className="space-y-4 font-serif text-sm leading-relaxed text-[#4a3b32] text-justify">
                              <div className="p-4 rounded-xl border border-[#e8dfc7]/30 bg-[#f5f1e6]/20">
                                <h4 className="font-display text-xs font-bold uppercase tracking-wider text-[#7a6a5e] mb-2">
                                  1. Oração Inicial para Todos os Dias
                                </h4>
                                <p className="whitespace-pre-line text-xs font-serif leading-relaxed text-[#7a6a5e]">
                                  {sagradoCoracaoPrayerSections.initialBody}
                                </p>
                              </div>

                              <div className="p-4 rounded-xl border border-[#bf9926]/30 bg-[#bf9926]/5">
                                <h4 className="font-display text-xs font-bold uppercase tracking-wider text-[#bf9926] mb-2">
                                  2. Súplica Diária (Dia {safeDay})
                                </h4>
                                <p className="whitespace-pre-line font-serif">
                                  {currentDayContent.reflection}
                                </p>
                              </div>

                              <div className="p-4 rounded-xl border border-[#e8dfc7]/30 bg-[#f5f1e6]/20">
                                <h4 className="font-display text-xs font-bold uppercase tracking-wider text-[#7a6a5e] mb-2">
                                  3. Oração Final para Todos os Dias
                                </h4>
                                <p className="whitespace-pre-line text-xs font-serif leading-relaxed text-[#7a6a5e]">
                                  {sagradoCoracaoPrayerSections.finalBody}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="prose-prayer whitespace-pre-line rounded-xl border border-[#e8dfc7]/30 bg-[#f5f1e6]/20 p-5 font-serif text-sm leading-relaxed text-[#4a3b32] text-justify">
                              {currentDayContent.prayer}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Botões de Ação */}
                    <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-border/50">
                      <Button
                        onClick={toggleDayAsComplete}
                        className="w-full sm:w-auto bg-[oklch(0.22_0.07_260)] hover:bg-[oklch(0.28_0.08_260)] text-white font-bold text-xs"
                      >
                        <CheckCircle2 size={15} className="mr-2" />
                        {currentCompleted.includes(safeDay) ? "Desmarcar Dia" : `Marcar Dia ${safeDay} como Rezado`}
                      </Button>
                    </div>

                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-10">
                <p className="text-muted-foreground">Conteúdo da novena não encontrado.</p>
              </div>
            )}
          </div>

        </div>
      </main>

      {playingUrl && <audio ref={audioRef} src={playingUrl} />}
    </div>
  );
}
