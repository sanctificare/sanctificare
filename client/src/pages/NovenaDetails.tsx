import { useMemo, useState, useEffect, useRef } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { applyImageFallback, getLoginUrl, resolveR2Redirect } from "@/const";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { getNovenaBySlug } from "@/data/novenas";
import { Crown, Lock, CheckCircle2, ArrowLeft, Info, Headphones, Play, Pause, RotateCcw, Volume2, VolumeX, X, PartyPopper, Minus, Plus } from "lucide-react";
import { NOVENAS, getNovenaPath } from "@/data/novenas";
import { Link, useRoute } from "wouter";
import { Heart } from "@/components/HeartIcon";
import { toast } from "sonner";
import { getNovenaArt } from "@/lib/cardArt";
import { useOfflineSync } from "@/hooks/useOfflineSync";

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

const START_DATE_KEY = "sanctificare.novenas.startDate.v1";
type StartDateMap = Record<string, string>; // novenaId -> "YYYY-MM-DD"

function readStartDates(): StartDateMap {
  try {
    const raw = localStorage.getItem(START_DATE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeStartDates(map: StartDateMap) {
  try {
    localStorage.setItem(START_DATE_KEY, JSON.stringify(map));
  } catch {}
}

function todayIso(): string {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = formatter.formatToParts(new Date());
  const year = parts.find((p) => p.type === "year")?.value;
  const month = parts.find((p) => p.type === "month")?.value;
  const day = parts.find((p) => p.type === "day")?.value;
  return `${year}-${month}-${day}`;
}

function calendarDaysBetween(from: string, to: string): number {
  return Math.floor((Date.parse(to) - Date.parse(from)) / 86400000);
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
  const [startDates, setStartDates] = useState<StartDateMap>(() => readStartDates());

  
  const { queueOfflinePrayerLog } = useOfflineSync();
  const utils = trpc.useUtils();
  const logPrayer = trpc.prayers.logPrayer.useMutation();

  const { data: subscription } = trpc.subscriptions.get.useQuery(undefined, { enabled: isAuthenticated });
  const isPremium = !!subscription &&
    (subscription.status === "active" ||
     subscription.status === "cancelled" ||
     subscription.status === "past_due");
  
  const selectedNovena = useMemo(() => {
    if (!matched || !params?.slug) return undefined;
    return getNovenaBySlug(params.slug);
  }, [matched, params?.slug]);

  const safeDay = Math.min(Math.max(selectedDay, 1), selectedNovena?.days.length ?? 1);
  const currentDayContent = selectedNovena?.days.find((d) => d.day === safeDay);

  const isLocked = selectedNovena?.category === "premium" && !isPremium;
  const currentCompleted = selectedNovena ? progress[selectedNovena.id] ?? [] : [];

  // Quantos dias já foram desbloqueados pelo calendário
  const maxUnlockedDay = useMemo(() => {
    if (!selectedNovena) return 1;
    const totalDays = selectedNovena.days.length;
    const startDate = startDates[selectedNovena.id];
    if (!startDate) return 1; // só o dia 1 disponível até completar o primeiro
    const elapsed = calendarDaysBetween(startDate, todayIso());
    return Math.min(Math.max(elapsed + 1, 1), totalDays);
  }, [selectedNovena, startDates]);

  const isDayUnlocked = (dayNum: number) => dayNum <= maxUnlockedDay;

  const daysUntilUnlock = (dayNum: number): number => {
    if (!selectedNovena) return 0;
    const startDate = startDates[selectedNovena.id];
    if (!startDate) return dayNum - 1; // sem início, calcula a partir de hoje
    const elapsed = calendarDaysBetween(startDate, todayIso());
    return Math.max((dayNum - 1) - elapsed, 0);
  };
  const [activeTab, setActiveTab] = useState<"audio" | "text">("audio");
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [fontSize, setFontSize] = useState<"sm" | "md" | "lg" | "xl">(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("sanctificare_novenas_font_size") as any) || "md";
    }
    return "md";
  });

  const fontSizeClasses = {
    sm: "text-xs md:text-sm leading-relaxed",
    md: "text-sm md:text-base leading-relaxed",
    lg: "text-base md:text-lg leading-loose",
    xl: "text-lg md:text-xl leading-loose",
  };

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
      autoMarkRef.current();
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

  // Migração: usuários com progresso sem data de início recebem data retroativa
  useEffect(() => {
    if (!selectedNovena) return;
    if (startDates[selectedNovena.id]) return;
    const completed = progress[selectedNovena.id] ?? [];
    if (completed.length === 0) return;
    const maxDone = Math.max(...completed);
    const start = new Date();
    start.setDate(start.getDate() - (maxDone - 1));
    const startDateStr = start.toISOString().slice(0, 10);
    const updated = { ...startDates, [selectedNovena.id]: startDateStr };
    setStartDates(updated);
    writeStartDates(updated);
  }, [selectedNovena?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Corrige selectedDay se estiver acima do máximo desbloqueado
  useEffect(() => {
    if (selectedDay > maxUnlockedDay) {
      setSelectedDay(maxUnlockedDay);
    }
  }, [maxUnlockedDay]); // eslint-disable-line react-hooks/exhaustive-deps

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
    if (!isDayUnlocked(safeDay)) return;

    const done = progress[selectedNovena.id] ?? [];
    const alreadyDone = done.includes(safeDay);
    const nextDays = alreadyDone ? done.filter((day) => day !== safeDay) : [...done, safeDay].sort((a, b) => a - b);
    const totalDays = selectedNovena.days.length;
    const justCompleted = !alreadyDone && nextDays.length >= totalDays;

    // Grava a data de início quando o dia 1 é completado pela primeira vez
    if (!alreadyDone && safeDay === 1 && !startDates[selectedNovena.id]) {
      const updated = { ...startDates, [selectedNovena.id]: todayIso() };
      setStartDates(updated);
      writeStartDates(updated);
    }

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

    const prayerName = `${selectedNovena.name} - Dia ${safeDay}`;
    try {
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        queueOfflinePrayerLog("novena", prayerName);
        if (justCompleted) {
          setShowCompletionModal(true);
        } else {
          toast.success(`Dia ${safeDay} marcado localmente.`);
        }
        return;
      }
      await logPrayer.mutateAsync({
        prayerType: "novena",
        prayerName: prayerName
      });
      if (justCompleted) {
        setShowCompletionModal(true);
      } else {
        toast.success(`Dia ${safeDay} concluído. Persevere com fé na sua novena.`);
      }
      await utils.prayers.getRecentLogs.invalidate();
      await utils.prayers.getAllLogs.invalidate();
    } catch (err) {
      console.error("[Novena log error]", err);
      queueOfflinePrayerLog("novena", prayerName);
      if (justCompleted) {
        setShowCompletionModal(true);
      } else {
        toast.success(`Dia ${safeDay} marcado localmente.`);
      }
    }
  };

  // Ref que sempre aponta para a função de marcar o dia com estado atual
  const autoMarkRef = useRef<() => void>(() => {});
  useEffect(() => {
    autoMarkRef.current = () => {
      if (!isLocked && isDayUnlocked(safeDay) && !currentCompleted.includes(safeDay)) {
        toggleDayAsComplete();
      }
    };
  });

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
                <span className="text-xs font-bold text-[oklch(0.22_0.07_260)]">{currentCompleted.length}/{selectedNovena.days.length} dias concluídos</span>
              </div>
            </div>

            {/* Barra de Progresso de 9 Dias – visível apenas em desktop (lg+) */}
            <div className="hidden lg:block rounded-2xl border border-[oklch(0.72_0.10_75/0.32)] bg-white p-5 shadow-[0_12px_40px_oklch(0.22_0.07_260/0.08)]">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold mb-3">Progresso da Jornada</p>
              <div className="grid grid-cols-9 gap-1.5 justify-items-center">
                {Array.from({ length: 9 }, (_, idx) => {
                  const dayNum = idx + 1;
                  const isDone = currentCompleted.includes(dayNum);
                  const isActive = dayNum === safeDay;
                  const unlocked = isDayUnlocked(dayNum);
                  const waitDays = daysUntilUnlock(dayNum);

                  return (
                    <button
                      key={dayNum}
                      onClick={() => unlocked && setSelectedDay(dayNum)}
                      disabled={isLocked || !unlocked}
                      className={`relative w-8 h-8 rounded-full flex items-center justify-center font-sans text-[11px] font-bold transition-all ${
                        isActive
                          ? "bg-[oklch(0.22_0.07_260)] text-white ring-2 ring-[oklch(0.75_0.12_75)] scale-110 shadow-sm"
                          : isDone
                          ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20"
                          : !unlocked
                          ? "bg-muted/20 text-muted-foreground/40 border border-transparent cursor-not-allowed"
                          : "bg-muted/40 hover:bg-muted text-muted-foreground border border-transparent"
                      }`}
                      title={!unlocked ? (waitDays === 1 ? `Disponível amanhã` : `Disponível em ${waitDays} dias`) : `Ir para o Dia ${dayNum}`}
                    >
                      {!unlocked ? (
                        <Lock size={10} className="text-muted-foreground/40" />
                      ) : isDone ? (
                        <CheckCircle2 size={13} className="text-emerald-600 fill-emerald-600/10" />
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

                    {/* Seletor de Dias – mobile (visível apenas abaixo de lg) */}
                    <div className="lg:hidden">
                      <p className={`text-[11px] uppercase tracking-wider font-bold mb-2 ${
                        activeTab === "audio" ? "text-slate-300" : "text-muted-foreground"
                      }`}>Progresso da Jornada</p>
                      <div className="grid grid-cols-9 gap-1 justify-items-center">
                        {Array.from({ length: 9 }, (_, idx) => {
                          const dayNum = idx + 1;
                          const isDone = currentCompleted.includes(dayNum);
                          const isActive = dayNum === safeDay;
                          const unlocked = isDayUnlocked(dayNum);
                          const waitDays = daysUntilUnlock(dayNum);
                          const isDark = activeTab === "audio";

                          let buttonStyles = "relative w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold transition-all ";
                          let iconClass = "";

                          if (isActive) {
                            buttonStyles += isDark
                              ? "bg-amber-500 text-slate-950 ring-2 ring-amber-400 scale-110 shadow-sm"
                              : "bg-[oklch(0.22_0.07_260)] text-white ring-2 ring-[oklch(0.75_0.12_75)] scale-110 shadow-sm";
                          } else if (isDone) {
                            buttonStyles += isDark
                              ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/30"
                              : "bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/20";
                            iconClass = isDark ? "text-emerald-400" : "text-emerald-600";
                          } else if (!unlocked) {
                            buttonStyles += isDark
                              ? "bg-white/5 text-white/20 border border-white/10 cursor-not-allowed"
                              : "bg-black/5 text-black/20 border border-black/10 cursor-not-allowed";
                            iconClass = isDark ? "text-white/20" : "text-black/20";
                          } else {
                            buttonStyles += isDark
                              ? "bg-white/10 text-white/80 border border-white/20 hover:bg-white/20"
                              : "bg-black/5 text-[#2d251e] border border-black/10 hover:bg-black/10";
                          }

                          return (
                            <button
                              key={dayNum}
                              onClick={() => unlocked && setSelectedDay(dayNum)}
                              disabled={isLocked || !unlocked}
                              className={buttonStyles}
                              title={!unlocked ? (waitDays === 1 ? `Disponível amanhã` : `Disponível em ${waitDays} dias`) : `Ir para o Dia ${dayNum}`}
                            >
                              {!unlocked ? (
                                <Lock size={10} className={iconClass} />
                              ) : isDone ? (
                                <CheckCircle2 size={13} className={iconClass} />
                              ) : (
                                dayNum
                              )}
                              {isActive && (
                                <span className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${
                                  isDark ? "bg-amber-400" : "bg-[oklch(0.75_0.12_75)]"
                                }`} />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Seleção de Abas Áudio / Texto */}
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

                        {/* Intenção particular – visível também no áudio */}
                        {intention && (
                          <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 flex gap-2.5 items-start">
                            <Heart size={13} className="text-rose-400 fill-rose-400/20 mt-0.5 flex-shrink-0" />
                            <div>
                              <span className="text-[10px] uppercase tracking-wider font-bold text-rose-300/80">Rezando por:</span>
                              <p className="text-xs font-serif italic text-rose-200/90 leading-normal mt-0.5">"{intention}"</p>
                            </div>
                          </div>
                        )}

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
                            {`"${currentDayContent.reflection.split('.')[0]}."`}
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
                      <div className="space-y-8 animate-fade-in">
                        {/* Cabeçalho do Dia */}
                        <div className="border-b border-[#e8dfc7]/40 pb-4">
                          <span className="text-[10px] uppercase font-bold tracking-widest text-[#bf9926]">Dia {safeDay}</span>
                          <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#2d251e] mt-1 leading-tight">
                            {currentDayContent.title}
                          </h2>
                        </div>

                        {/* Exibição permanentemente destacada da Intenção do usuário durante a leitura */}
                        {intention && (
                          <div className="rounded-2xl border border-rose-200 bg-rose-50/30 p-4 flex gap-3 items-start shadow-sm">
                            <Heart size={16} className="text-rose-500 fill-rose-500/20 mt-0.5 flex-shrink-0 animate-pulse" />
                            <div>
                              <span className="text-[10px] uppercase tracking-wider font-bold text-rose-700/80">Rezando por esta Intenção:</span>
                              <p className="text-xs font-serif italic text-rose-900/90 leading-normal mt-0.5">"{intention}"</p>
                            </div>
                          </div>
                        )}

                        {/* Divisor Decorativo Litúrgico */}
                        <div className="flex items-center justify-center gap-4 py-2 opacity-50 select-none">
                          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-[#e8dfc7]" />
                          <svg className="w-4 h-4 text-[#bf9926]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 2v20M2 12h20" strokeLinecap="round" />
                          </svg>
                          <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[#e8dfc7]" />
                        </div>

                        {/* Oração do Dia */}
                        <div className="space-y-3">
                          <span className="text-[10px] uppercase tracking-widest font-bold text-[#8a7a6e]/85">Oração</span>
                          
                          {sagradoCoracaoPrayerSections ? (
                            <div className="space-y-6">
                              <div className="p-5 sm:p-6 rounded-2xl border border-[#e8dfc7]/40 bg-[#fdfbf7]/60 dark:bg-stone-900 shadow-sm">
                                <h4 className="font-display text-xs font-bold uppercase tracking-wider text-[#7a6a5e] mb-3">
                                  1. Oração Inicial para Todos os Dias
                                </h4>
                                <p className={`whitespace-pre-line font-serif text-[#5a4d43] dark:text-stone-400 text-justify ${fontSizeClasses[fontSize]}`}>
                                  {sagradoCoracaoPrayerSections.initialBody}
                                </p>
                              </div>

                              <div className="p-5 sm:p-6 rounded-2xl border border-[#bf9926]/40 bg-[#bf9926]/5 shadow-sm">
                                <h4 className="font-display text-xs font-bold uppercase tracking-wider text-[#bf9926] mb-3">
                                  2. Súplica Diária (Dia {safeDay})
                                </h4>
                                <p className={`whitespace-pre-line font-serif text-[#3e342f] dark:text-stone-300 text-justify ${fontSizeClasses[fontSize]}`}>
                                  {currentDayContent.reflection}
                                </p>
                              </div>

                              <div className="p-5 sm:p-6 rounded-2xl border border-[#e8dfc7]/40 bg-[#fdfbf7]/60 dark:bg-stone-900 shadow-sm">
                                <h4 className="font-display text-xs font-bold uppercase tracking-wider text-[#7a6a5e] mb-3">
                                  3. Oração Final para Todos os Dias
                                </h4>
                                <p className={`whitespace-pre-line font-serif text-[#5a4d43] dark:text-stone-400 text-justify ${fontSizeClasses[fontSize]}`}>
                                  {sagradoCoracaoPrayerSections.finalBody}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="bg-[#fdfbf7] dark:bg-stone-900 border border-[#e8dfc7]/50 dark:border-stone-800 p-5 sm:p-6 rounded-2xl shadow-sm">
                              <p className={`whitespace-pre-line font-serif text-[#3e342f] dark:text-stone-300 text-justify ${fontSizeClasses[fontSize]}`}>
                                {currentDayContent.prayer}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Botões de Ação */}
                    <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-border/50">
                      {!isDayUnlocked(safeDay) ? (
                        <div className="w-full flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3">
                          <Lock size={14} className="text-amber-600 flex-shrink-0" />
                          <p className="text-xs text-amber-700 dark:text-amber-400 font-semibold">
                            {daysUntilUnlock(safeDay) === 1
                              ? "Este dia estará disponível amanhã."
                              : `Este dia estará disponível em ${daysUntilUnlock(safeDay)} dias.`}
                          </p>
                        </div>
                      ) : (
                        <Button
                          onClick={toggleDayAsComplete}
                          className={`w-full sm:w-auto font-bold text-xs transition-colors ${
                            currentCompleted.includes(safeDay)
                              ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                              : "bg-[oklch(0.22_0.07_260)] hover:bg-[oklch(0.28_0.08_260)] text-white"
                          }`}
                        >
                          <CheckCircle2 size={15} className={`mr-2 ${ currentCompleted.includes(safeDay) ? "fill-white/20" : "" }`} />
                          {currentCompleted.includes(safeDay) ? `✓ Dia ${safeDay} Rezado — Desmarcar` : `Marcar Dia ${safeDay} como Rezado`}
                        </Button>
                      )}
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

      {/* Modal de Celebração – Novena Concluída */}
      {showCompletionModal && selectedNovena && (() => {
        const otherNovenas = NOVENAS.filter((n) => n.id !== selectedNovena.id);
        const suggestion = otherNovenas[0];
        const art = suggestion ? getNovenaArt(suggestion.id) : null;
        return (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.55)" }}>
            <div className="w-full max-w-sm bg-white dark:bg-stone-900 rounded-3xl shadow-2xl overflow-hidden animate-slide-up">
              {/* Header */}
              <div className="relative bg-gradient-to-br from-[oklch(0.88_0.12_75)] to-[oklch(0.78_0.14_70)] px-6 pt-8 pb-6 text-center">
                <button
                  onClick={() => setShowCompletionModal(false)}
                  className="absolute right-4 top-4 w-8 h-8 rounded-full bg-black/10 flex items-center justify-center"
                >
                  <X size={14} className="text-[oklch(0.22_0.07_260)]" />
                </button>
                <div className="w-16 h-16 rounded-full bg-white/60 flex items-center justify-center mx-auto mb-3 shadow-inner">
                  <PartyPopper size={28} className="text-[oklch(0.55_0.14_70)]" />
                </div>
                <h2 className="font-display text-2xl font-black text-[oklch(0.18_0.07_260)] mb-1">Novena Concluída!</h2>
                <p className="text-sm text-[oklch(0.30_0.05_260)] font-serif">
                  Parabéns! Você completou 9 dias de oração com a <span className="font-bold">{selectedNovena.name}</span>.
                </p>
              </div>

              {/* Body */}
              <div className="px-6 py-5">
                <p className="text-xs text-muted-foreground text-center mb-4 font-serif italic">
                  "Perseverai na oração, vigilantes e agradecidos." — Cl 4,2
                </p>

                {suggestion && art && (
                  <>
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Continue sua jornada</p>
                    <Link href={getNovenaPath(suggestion)} onClick={() => setShowCompletionModal(false)}>
                      <div className="flex items-center gap-3 rounded-2xl border border-border p-3 hover:bg-muted/40 transition-colors cursor-pointer">
                        <img
                          src={art.image}
                          alt={suggestion.name}
                          className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                          onError={(event) => applyImageFallback(event.currentTarget)}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-foreground truncate">{suggestion.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{suggestion.subtitle}</p>
                        </div>
                        <ArrowLeft size={14} className="text-muted-foreground rotate-180 flex-shrink-0" />
                      </div>
                    </Link>
                  </>
                )}

                <Button
                  className="w-full mt-4 bg-[oklch(0.22_0.07_260)] hover:bg-[oklch(0.28_0.08_260)] text-white font-semibold"
                  onClick={() => setShowCompletionModal(false)}
                >
                  Fechar
                </Button>
              </div>
            </div>
          </div>
        );
      })()}
      {/* Barra flutuante de tamanho de fonte */}
      {selectedNovena && activeTab === "text" && !isLocked && (
        <div className="fixed bottom-[calc(var(--mobile-bottom-nav-height)+var(--safe-area-bottom)+0.5rem)] right-6 lg:bottom-6 lg:right-6 z-50 flex items-center gap-2 bg-background/90 dark:bg-stone-900/90 backdrop-blur-md border border-border shadow-lg rounded-full px-3 py-1.5 transition-all">
          <span className="text-xs text-muted-foreground font-semibold px-2 border-r border-border">Leitura</span>
          <button
            onClick={() => {
              let nextSize: "sm" | "md" | "lg" | "xl" = fontSize;
              if (fontSize === "xl") nextSize = "lg";
              else if (fontSize === "lg") nextSize = "md";
              else if (fontSize === "md") nextSize = "sm";
              setFontSize(nextSize);
              localStorage.setItem("sanctificare_novenas_font_size", nextSize);
            }}
            disabled={fontSize === "sm"}
            className="p-1.5 hover:bg-accent rounded-full text-muted-foreground disabled:opacity-30 transition-colors"
            title="Diminuir fonte"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold uppercase w-6 text-center select-none text-foreground">{fontSize}</span>
          <button
            onClick={() => {
              let nextSize: "sm" | "md" | "lg" | "xl" = fontSize;
              if (fontSize === "sm") nextSize = "md";
              else if (fontSize === "md") nextSize = "lg";
              else if (fontSize === "lg") nextSize = "xl";
              setFontSize(nextSize);
              localStorage.setItem("sanctificare_novenas_font_size", nextSize);
            }}
            disabled={fontSize === "xl"}
            className="p-1.5 hover:bg-accent rounded-full text-muted-foreground disabled:opacity-30 transition-colors"
            title="Aumentar fonte"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
