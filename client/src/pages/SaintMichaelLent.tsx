import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Lock,
  Crown,
  Headphones,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Share2,
  Heart,
  Calendar,
  Sparkles,
  Minus,
  Plus,
  BookOpen,
  Check,
  CalendarDays,
  Flame,
  ShieldCheck,
  Type,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { scheduleSaintMichaelLentReminder } from "@/lib/notifications";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UpgradeDialog } from "@/components/UpgradeDialog";
import {
  SAINT_MICHAEL_CONSECRATION,
  SAINT_MICHAEL_LENT,
  SAINT_MICHAEL_TRADITIONAL_PRAYERS,
  type JourneyDay,
} from "@/data/saint-michael-lent";

type JourneyState = {
  startDate: string;
  completedDays: number[];
  selectedDay: number;
  penance: string;
  reminderTime: string;
  journals: Record<number, string>;
};

const STORAGE_KEY = "sanctificare.journey.saint-michael.v3";
const JOURNEY_ID = "quaresma-sao-miguel-arcanjo";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatDateBr(isoDateStr: string): string {
  if (!isoDateStr) return "";
  try {
    const parts = isoDateStr.split("-").map(Number);
    const date = new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0);
    return new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" }).format(date);
  } catch {
    return isoDateStr;
  }
}

function calculateEndDateIso(startDateIso: string, durationDays: number = 40): string {
  if (!startDateIso) return "";
  try {
    const parts = startDateIso.split("-").map(Number);
    const date = new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0);
    date.setDate(date.getDate() + (durationDays - 1));
    return date.toISOString().slice(0, 10);
  } catch {
    return "";
  }
}

function getTraditionalStartDateIso(): string {
  const currentYear = new Date().getFullYear();
  return `${currentYear}-08-15`;
}

function defaultState(): JourneyState {
  return {
    startDate: getTraditionalStartDateIso(),
    completedDays: [],
    selectedDay: 1,
    penance: "Oferecer minhas orações e mortificações pela conversão dos pecadores.",
    reminderTime: "20:00",
    journals: {},
  };
}

function loadLocalState(): JourneyState {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value ? { ...defaultState(), ...JSON.parse(value) } : defaultState();
  } catch {
    return defaultState();
  }
}

function formatAudioTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function SaintMichaelLent() {
  const { isAuthenticated } = useAuth();

  // Subscription Status Query
  const { data: subscription } = trpc.subscriptions.get.useQuery(undefined, { enabled: isAuthenticated });
  const isPremium = !!subscription && ["active", "cancelled", "past_due"].includes(subscription.status);

  // Backend Sync
  const { data: serverProgress } = trpc.journeys.getProgress.useQuery(
    { journeyId: JOURNEY_ID },
    { enabled: isAuthenticated }
  );

  const saveProgressMutation = trpc.journeys.saveProgress.useMutation();
  const saveJournalMutation = trpc.journeys.saveJournal.useMutation();
  const deleteJournalMutation = trpc.journeys.deleteJournal.useMutation();

  const [state, setState] = useState<JourneyState>(loadLocalState);
  const [activeTab, setActiveTab] = useState<"audio" | "text">("audio");
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [fontSize, setFontSize] = useState<"text-sm" | "text-base" | "text-lg">("text-base");
  const [expandedTraditions, setExpandedTraditions] = useState<Record<string, boolean>>({ cic: true, fathers: true, doctors: true, magisterium: true });
  const toggleTradition = (key: string) => setExpandedTraditions((prev) => ({ ...prev, [key]: !prev[key] }));
  const pillNavRef = useRef<HTMLDivElement | null>(null);

  // Audio Player State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const duration = 315; // 5:15 simulated audio length
  const [isMuted, setIsMuted] = useState(false);

  // Audio simulation timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, duration]);

  // Deep link: open a shared "?dia=N" link directly on that day
  useEffect(() => {
    const dayParam = Number(new URLSearchParams(window.location.search).get("dia"));
    if (dayParam >= 1 && dayParam <= 40) {
      setState((prev) => ({ ...prev, selectedDay: dayParam }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync server progress into local state when available
  useEffect(() => {
    if (serverProgress) {
      setState((prev) => ({
        ...prev,
        startDate: serverProgress.startedAt || prev.startDate || getTraditionalStartDateIso(),
        completedDays: (serverProgress.completedDays as number[]) || prev.completedDays,
        selectedDay: serverProgress.lastAccessedDay || prev.selectedDay,
        penance: serverProgress.chosenPenance || prev.penance,
        reminderTime: serverProgress.reminderTime || prev.reminderTime,
      }));
    }
  }, [serverProgress]);

  // Persist local state
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const updateState = (patch: Partial<JourneyState>) => {
    setState((current) => {
      const next = { ...current, ...patch };
      if (isAuthenticated && patch.startDate) {
        const expectedEnd = calculateEndDateIso(next.startDate, 40);
        saveProgressMutation.mutate({
          journeyId: JOURNEY_ID,
          startedAt: next.startDate,
          expectedEndAt: expectedEnd,
          lastAccessedDay: next.selectedDay,
          completedDays: next.completedDays,
          currentStreak: next.completedDays.length,
          chosenPenance: next.penance,
          reminderTime: next.reminderTime,
        });
      }
      return next;
    });
  };

  const selectedDayNum = state.selectedDay;

  // Day data resolver (Dia 1 e Dia 2 completos, dias 3-40 estruturados)
  const currentDayData: JourneyDay = useMemo(() => {
    const found = SAINT_MICHAEL_LENT.days.find((d) => d.number === selectedDayNum);
    if (found) return found;
    return {
      number: selectedDayNum,
      title: `Dia ${selectedDayNum}`,
      theme: `Combate Espiritual e Fidelidade — Dia ${selectedDayNum}`,
      scripture: {
        reference: "Efésios 6,12",
        text: "Pois não é contra homens de carne e sangue que temos de lutar, mas contra os principados e potestades, contra os dominadores deste mundo tenebroso.",
        explanation: "O combate do cristão se trava na interioridade da alma através da vigilância, oração e mortificação diária.",
      },
      meditation: `Neste ${selectedDayNum}º dia da Quaresma de São Miguel Arcanjo, invoque a luz dos Santos Anjos para vencer os maus pensamentos e renovar a caridade.`,
      virtue: "Perseverança",
      purpose: "Rezar o Terço de São Miguel ou um Pai-Nosso oferecendo pela santificação das famílias.",
      suggestedPenance: "Renunciar a uma distração desnecessária no celular durante o dia.",
      spiritualExercise: "Fazer uma pausa de recolhimento ao meio-dia e rezar a oração a São Miguel.",
      examination: [
        "Fui fiel aos meus deveres de oração hoje?",
        "Conservei a paz de espírito diante das provações?",
      ],
      saintQuote: "São Miguel é o fiel defensor de todos aqueles que o invocam nas tentações. - São Padre Pio",
      complementaryPrayer:
        "São Miguel Arcanjo, defendei-nos no combate para que não pereçamos no dia do julgamento. Amém.",
    };
  }, [selectedDayNum]);

  // Audio accessibility rule:
  // Days 1-7 are FREE for everyone (text + audio). Days 8-40 require Premium for Audio.
  const isAudioLocked = !isPremium && selectedDayNum > 7;

  const isCurrentDayCompleted = state.completedDays.includes(selectedDayNum);

  const toggleDayComplete = () => {
    const isDone = state.completedDays.includes(selectedDayNum);
    let nextCompleted: number[];
    if (isDone) {
      nextCompleted = state.completedDays.filter((d) => d !== selectedDayNum);
      toast.info(`Dia ${selectedDayNum} desmarcado.`);
    } else {
      nextCompleted = [...state.completedDays, selectedDayNum].sort((a, b) => a - b);
      toast.success(`Dia ${selectedDayNum} concluído com sucesso. Que São Miguel Arcanjo o guarde!`);
    }
    updateState({ completedDays: nextCompleted });

    if (isAuthenticated) {
      saveProgressMutation.mutate({
        journeyId: JOURNEY_ID,
        startedAt: state.startDate || getTraditionalStartDateIso(),
        expectedEndAt: calculateEndDateIso(state.startDate || getTraditionalStartDateIso(), 40),
        lastAccessedDay: selectedDayNum,
        completedDays: nextCompleted,
        currentStreak: nextCompleted.length,
        chosenPenance: state.penance,
        reminderTime: state.reminderTime,
      });
    }
  };

  const handleSelectDay = (dayNum: number) => {
    setIsPlaying(false);
    setCurrentTime(0);
    updateState({ selectedDay: dayNum });

    // Scroll active pill into view on mobile
    if (pillNavRef.current) {
      const activePill = pillNavRef.current.querySelector('[data-active="true"]');
      if (activePill) {
        activePill.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      }
    }
  };

  const handleJournalSave = (text: string) => {
    updateState({ journals: { ...state.journals, [selectedDayNum]: text } });
    if (isAuthenticated) {
      saveJournalMutation.mutate({
        journeyId: JOURNEY_ID,
        dayNumber: selectedDayNum,
        content: text,
      });
    }
    toast.success("Sua anotação privada do diário foi salva.");
  };

  const handleJournalDelete = () => {
    const nextJournals = { ...state.journals };
    delete nextJournals[selectedDayNum];
    updateState({ journals: nextJournals });
    if (isAuthenticated) {
      deleteJournalMutation.mutate({
        journeyId: JOURNEY_ID,
        dayNumber: selectedDayNum,
      });
    }
    toast.success("Anotação excluída.");
  };

  const currentJournalText = state.journals[selectedDayNum] ?? "";

  return (
    <div className="min-h-screen bg-[oklch(0.965_0.012_82)] dark:bg-[#12100E] relative overflow-hidden text-foreground">
      {/* Background Sacred Gradients */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_oklch(0.90_0.04_85/0.40),_transparent_55%),linear-gradient(180deg,_oklch(1_0_0/0.30),_transparent)] dark:opacity-20" />
      
      <main className="container px-4 sm:px-6 py-6 sm:py-8 relative z-10 max-w-6xl">
        {/* Header Estilo Novenas */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-5 gap-4">
          <div>
            <Link href="/explore">
              <button className="mb-2 -ml-2 px-2 min-h-11 text-xs sm:text-sm font-medium hover:underline cursor-pointer text-[oklch(0.65_0.12_70)] flex items-center gap-1">
                <ArrowLeft size={16} /> Voltar ao catálogo de devocionais
              </button>
            </Link>
            <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-[oklch(0.65_0.12_70)] font-serif">
              Devocional • Jornada Espiritual de 40 Dias
            </p>
            <h1 className="font-display text-2xl xs:text-3xl sm:text-4xl font-bold text-[oklch(0.22_0.07_260)] dark:text-amber-100 leading-tight break-words">
              {SAINT_MICHAEL_LENT.title}
            </h1>
            <p className="font-serif text-xs sm:text-sm text-muted-foreground mt-0.5">
              40 Dias de Oração, Penitência e Combate Espiritual • Início Tradicional em 15/08 (Assunção)
            </p>
          </div>
        </div>

        {/* Mobile Quick Day Selector Bar (< lg screens) */}
        <div className="block lg:hidden mb-5">
          <div className="flex items-center justify-between mb-2 px-0.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[oklch(0.65_0.12_70)] font-serif">
              Meditações (40 Dias)
            </span>
            <span className="text-[11px] font-medium text-muted-foreground">
              Dia {selectedDayNum} de 40
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              aria-label="Dia anterior"
              disabled={selectedDayNum <= 1}
              onClick={() => handleSelectDay(selectedDayNum - 1)}
              className="shrink-0 w-11 h-11 rounded-full border border-border bg-card flex items-center justify-center cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={18} />
            </button>
            <div
              ref={pillNavRef}
              className="flex items-center gap-2 overflow-x-auto py-2 scrollbar-none snap-x px-1"
            >
              {Array.from({ length: 40 }, (_, i) => i + 1).map((dayNum) => {
                const active = dayNum === selectedDayNum;
                const isDone = state.completedDays.includes(dayNum);
                const isAudioLockedDay = !isPremium && dayNum > 7;

                return (
                  <button
                    key={dayNum}
                    data-active={active}
                    onClick={() => handleSelectDay(dayNum)}
                    className={`shrink-0 snap-start min-h-11 rounded-full px-3.5 py-2 text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
                      active
                        ? "bg-[oklch(0.22_0.07_260)] text-white border-[oklch(0.22_0.07_260)] shadow-sm"
                        : "bg-card text-foreground border-border hover:border-slate-300"
                    }`}
                  >
                    <span>Dia {dayNum}</span>
                    {isDone && <CheckCircle2 size={11} className={active ? "text-emerald-300" : "text-emerald-600"} />}
                    {isAudioLockedDay && <Lock size={10} className={active ? "text-amber-300" : "text-amber-500"} />}
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              aria-label="Próximo dia"
              disabled={selectedDayNum >= 40}
              onClick={() => handleSelectDay(selectedDayNum + 1)}
              className="shrink-0 w-11 h-11 rounded-full border border-border bg-card flex items-center justify-center cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Layout Principal em 2 Colunas (Exatamente como NovenaDetails) */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
          
          {/* Coluna Principal: Conteúdo de Áudio / Texto */}
          <div
            className={`rounded-2xl border transition-all duration-500 p-4 sm:p-6 shadow-xl ${
              activeTab === "audio"
                ? "bg-[#0b1329] border-amber-500/20 text-slate-100 shadow-[0_12px_40px_rgba(11,19,41,0.2)]"
                : "bg-card border-border text-foreground shadow-md"
            }`}
          >
            <div className="space-y-6">
              {/* Seleção de Abas [ ÁUDIO | TEXTO ] */}
              <div className="flex border-b border-white/10 dark:border-border/40 mb-6">
                <button
                  onClick={() => setActiveTab("audio")}
                  className={`flex-1 py-3 text-center text-xs font-bold uppercase tracking-wider transition-all border-b-2 flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === "audio"
                      ? "border-amber-500 text-amber-400 font-extrabold"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Headphones size={15} />
                  <span>Áudio</span>
                  {isPlaying && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  )}
                </button>

                <button
                  onClick={() => setActiveTab("text")}
                  className={`flex-1 py-3 text-center text-xs font-bold uppercase tracking-wider transition-all border-b-2 flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === "text"
                      ? "border-amber-500 text-amber-600 dark:text-amber-400 font-extrabold"
                      : activeTab === "audio"
                      ? "border-transparent text-slate-100 hover:text-white font-bold text-sm"
                      : "border-transparent text-foreground hover:text-amber-600 font-bold"
                  }`}
                >
                  <BookOpen size={16} />
                  <span>Texto</span>
                </button>
              </div>

              {/* ABA ÁUDIO */}
              {activeTab === "audio" && (
                <div className="space-y-6 animate-fade-in">
                  {/* Se o áudio estiver bloqueado (Dias 8-40 sem Premium) */}
                  {isAudioLocked ? (
                    <div className="py-12 text-center space-y-4">
                      <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto">
                        <Lock size={24} className="text-amber-400" />
                      </div>
                      <span className="text-xs uppercase tracking-widest font-bold text-amber-400">
                        Dia {selectedDayNum} — Áudio Premium
                      </span>
                      <h3 className="font-serif text-xl sm:text-2xl font-bold text-white max-w-md mx-auto">
                        Acompanhe as meditações em áudio no Sanctificare Premium
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                        O texto completo do Dia {selectedDayNum} está disponível gratuitamente na aba <strong>TEXTO</strong>. Se preferir ouvir a oração guiada em áudio, conheça nosso plano Premium.
                      </p>

                      <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
                        <Button
                          onClick={() => setActiveTab("text")}
                          className="bg-amber-600 hover:bg-amber-700 text-white font-serif font-bold text-xs"
                        >
                          <BookOpen size={14} className="mr-1.5" /> Ler Texto do Dia {selectedDayNum}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setShowUpgradeModal(true)}
                          className="border-amber-500/40 text-amber-300 hover:bg-amber-500/10 font-serif font-bold text-xs"
                        >
                          <Crown size={14} className="mr-1.5 text-amber-400" /> Conhecer Plano Premium
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Cabeçalho do Dia */}
                      <div className="text-center">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-amber-500/80 font-serif">
                          Dia {selectedDayNum}
                        </span>
                        <h2 className="font-serif text-xl md:text-2xl font-bold text-white mt-1 leading-tight">
                          {currentDayData.theme}
                        </h2>
                      </div>

                      {/* Intenção / Penitência – Box igual ao anexo */}
                      <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3.5 flex gap-2.5 items-start">
                        <Heart size={14} className="text-amber-400 fill-amber-400/20 mt-0.5 shrink-0" />
                        <div className="w-full">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase tracking-wider font-bold text-amber-300">
                              Rezando Por / Penitência Escolhida:
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm font-serif italic text-amber-100/90 leading-normal mt-0.5">
                            "{state.penance || "Registre sua penitência para acompanhar sua jornada."}"
                          </p>
                        </div>
                      </div>

                      {/* Visual de Capa com aura luminosa */}
                      <div className="flex flex-col items-center justify-center my-6">
                        <div className="relative w-40 h-40">
                          <div
                            className={`absolute -inset-2 rounded-3xl bg-gradient-to-tr from-amber-600 via-amber-400 to-amber-200 blur-md transition-opacity duration-1000 ${
                              isPlaying ? "opacity-90 animate-pulse" : "opacity-40"
                            }`}
                          />
                          <img
                            src={SAINT_MICHAEL_LENT.image}
                            alt="São Miguel Arcanjo"
                            className={`relative w-40 h-40 rounded-3xl object-cover z-10 border border-white/20 shadow-2xl transition-transform duration-500 ${
                              isPlaying ? "scale-105" : "scale-100"
                            }`}
                          />
                        </div>
                      </div>

                      {/* Controles de Áudio (Player estilo anexo) */}
                      <div className="w-full max-w-sm mx-auto bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md shadow-lg flex flex-col gap-3">
                        {/* Progress Bar & Seeker */}
                        <div className="flex items-center gap-2.5">
                          <span className="text-[10px] text-slate-300 w-9 text-right font-mono">
                            {formatAudioTime(currentTime)}
                          </span>
                          <input
                            type="range"
                            min={0}
                            max={duration}
                            step={1}
                            value={currentTime}
                            onChange={(e) => setCurrentTime(Number(e.target.value))}
                            className="flex-1 h-1.5 rounded-full accent-amber-500 bg-white/20 cursor-pointer outline-none"
                          />
                          <span className="text-[10px] text-slate-300 w-9 font-mono">
                            -{formatAudioTime(duration - currentTime)}
                          </span>
                        </div>

                        {/* Botões do Player */}
                        <div className="flex items-center justify-center gap-5 pt-1">
                          <button
                            onClick={() => setCurrentTime(0)}
                            className="text-slate-400 hover:text-white transition-colors p-3.5 -m-1 rounded-full"
                            aria-label="Reiniciar"
                          >
                            <RotateCcw size={16} />
                          </button>

                          <button
                            onClick={() => {
                              const shareUrl = new URL(window.location.href);
                              shareUrl.searchParams.set("dia", String(selectedDayNum));
                              if (navigator.share) {
                                void navigator.share({
                                  title: `Quaresma de São Miguel Arcanjo - Dia ${selectedDayNum}`,
                                  text: `Estou rezando o Dia ${selectedDayNum} da Quaresma de São Miguel no Sanctificare!`,
                                  url: shareUrl.toString(),
                                });
                              } else {
                                void navigator.clipboard?.writeText(shareUrl.toString());
                                toast.success("Link da oração copiado para a área de transferência!");
                              }
                            }}
                            className="text-slate-400 hover:text-white transition-colors p-3.5 -m-1 rounded-full"
                            aria-label="Compartilhar"
                          >
                            <Share2 size={16} />
                          </button>

                          {/* Play/Pause Gold Button */}
                          <button
                            onClick={() => setIsPlaying(!isPlaying)}
                            className="w-12 h-12 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center shadow-lg transition-transform active:scale-95"
                            aria-label={isPlaying ? "Pausar" : "Reproduzir"}
                          >
                            {isPlaying ? (
                              <Pause size={22} className="fill-slate-950" />
                            ) : (
                              <Play size={22} className="fill-slate-950 ml-0.5" />
                            )}
                          </button>

                          <button
                            onClick={() => setIsMuted(!isMuted)}
                            className="text-slate-400 hover:text-white transition-colors p-3.5 -m-1 rounded-full"
                            aria-label="Mudo"
                          >
                            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* ABA TEXTO (100% Gratuita para todos os 40 dias) */}
              {activeTab === "text" && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400 font-serif">
                        Devoção Tradicional Gratuitamente
                      </span>
                      <h2 className="font-serif text-xl sm:text-2xl font-bold text-foreground">
                        Dia {selectedDayNum}: {currentDayData.theme}
                      </h2>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* Controle de Tamanho de Fonte */}
                      <div className="flex items-center gap-1.5 bg-muted/60 dark:bg-muted/40 p-1.5 rounded-xl border border-border/50 text-xs">
                        <span className="text-[11px] font-bold text-muted-foreground px-1 flex items-center gap-1 shrink-0">
                          <Type size={14} />
                        </span>
                        <div className="flex items-center gap-1">
                          {[
                            { id: "text-sm", label: "P" },
                            { id: "text-base", label: "M" },
                            { id: "text-lg", label: "G" },
                          ].map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => setFontSize(item.id as "text-sm" | "text-base" | "text-lg")}
                              className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                fontSize === item.id
                                  ? "bg-amber-600 text-white shadow-xs"
                                  : "text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5"
                              }`}
                            >
                              {item.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">

                  {/* Passos 1 a 7: Orações Tradicionais & Consagração Solene */}
                  <div id="sec-prayers" className="scroll-mt-16 space-y-4">
                    <h3 className="font-serif text-lg font-bold text-foreground flex items-center gap-1.5 border-b border-border pb-2">
                      <ShieldCheck size={18} className="text-amber-600" /> Passos 1 a 7 • Orações Tradicionais e Consagração Solene
                    </h3>
                    <div className="space-y-3">
                      {SAINT_MICHAEL_TRADITIONAL_PRAYERS.map((prayer) => (
                        <div key={prayer.title} className="rounded-xl border border-border bg-card p-4 space-y-2">
                          <h4 className="font-serif font-bold text-sm text-amber-700 dark:text-amber-400">
                            {prayer.title}
                          </h4>
                          <p className={`font-serif whitespace-pre-line leading-relaxed text-muted-foreground ${fontSize}`}>
                            {prayer.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 8. Reflexão Bíblica */}
                  <div id="sec-biblia" className="scroll-mt-16 rounded-xl border-l-4 border-amber-600 bg-amber-500/10 p-5 space-y-3">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400 font-serif">
                      8. Reflexão Bíblica
                    </span>
                    <p className="font-serif font-bold text-amber-800 dark:text-amber-300 text-sm flex items-center gap-1.5">
                      <BookOpen size={16} /> Referência: {currentDayData.scripture.reference}
                    </p>
                    <p className={`font-serif italic leading-relaxed text-foreground ${fontSize}`}>
                      "{currentDayData.scripture.text}"
                    </p>
                    {currentDayData.scripture.explanation && (
                      <p className="text-xs font-serif text-muted-foreground pt-2 border-t border-amber-600/20 leading-relaxed">
                        {currentDayData.scripture.explanation}
                      </p>
                    )}
                  </div>

                  {/* 9. Reflexão do Dia */}
                  <div id="sec-reflexao" className="scroll-mt-16 space-y-2 pt-2 border-t border-border">
                    <h3 className="font-serif text-lg font-bold text-foreground">9. Reflexão do Dia</h3>
                    <p className={`font-serif leading-relaxed text-muted-foreground ${fontSize} whitespace-pre-line`}>
                      {currentDayData.meditation}
                    </p>
                  </div>

                  {/* 10. Fundamentação na Tradição da Igreja (Com Acordeões Espansíveis) */}
                  {currentDayData.churchTradition && (
                    <div id="sec-tradicao" className="scroll-mt-16 space-y-3 pt-2 border-t border-border">
                      <h3 className="font-serif text-lg font-bold text-foreground">10. Fundamentação na Tradição da Igreja</h3>
                      
                      {currentDayData.churchTradition.cic && (
                        <div className="rounded-xl border border-border bg-muted/20 overflow-hidden">
                          <button
                            onClick={() => toggleTradition("cic")}
                            className="w-full p-4 flex items-center justify-between font-serif font-bold text-xs uppercase tracking-wider text-amber-700 dark:text-amber-400 cursor-pointer hover:bg-muted/40 transition-colors"
                          >
                            <span>• Catecismo da Igreja Católica ({currentDayData.churchTradition.cic.length})</span>
                            {expandedTraditions.cic ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                          {expandedTraditions.cic && (
                            <div className="p-4 pt-0 space-y-2 border-t border-border/40">
                              {currentDayData.churchTradition.cic.map((item) => (
                                <p key={item.code} className={`font-serif text-muted-foreground ${fontSize}`}>
                                  <strong>{item.code}: </strong>"{item.text}"
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {currentDayData.churchTradition.fathers && (
                        <div className="rounded-xl border border-border bg-muted/20 overflow-hidden">
                          <button
                            onClick={() => toggleTradition("fathers")}
                            className="w-full p-4 flex items-center justify-between font-serif font-bold text-xs uppercase tracking-wider text-amber-700 dark:text-amber-400 cursor-pointer hover:bg-muted/40 transition-colors"
                          >
                            <span>• Padres da Igreja ({currentDayData.churchTradition.fathers.length})</span>
                            {expandedTraditions.fathers ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                          {expandedTraditions.fathers && (
                            <div className="p-4 pt-0 space-y-2 border-t border-border/40">
                              {currentDayData.churchTradition.fathers.map((item, idx) => (
                                <p key={idx} className={`font-serif text-muted-foreground ${fontSize}`}>
                                  <strong>{item.author}: </strong>"{item.text}"{item.source ? ` (${item.source})` : ""}
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {currentDayData.churchTradition.doctors && (
                        <div className="rounded-xl border border-border bg-muted/20 overflow-hidden">
                          <button
                            onClick={() => toggleTradition("doctors")}
                            className="w-full p-4 flex items-center justify-between font-serif font-bold text-xs uppercase tracking-wider text-amber-700 dark:text-amber-400 cursor-pointer hover:bg-muted/40 transition-colors"
                          >
                            <span>• Doutores da Igreja ({currentDayData.churchTradition.doctors.length})</span>
                            {expandedTraditions.doctors ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                          {expandedTraditions.doctors && (
                            <div className="p-4 pt-0 space-y-2 border-t border-border/40">
                              {currentDayData.churchTradition.doctors.map((item, idx) => (
                                <p key={idx} className={`font-serif text-muted-foreground ${fontSize}`}>
                                  <strong>{item.author}: </strong>"{item.text}"
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {currentDayData.churchTradition.magisterium && (
                        <div className="rounded-xl border border-border bg-muted/20 overflow-hidden">
                          <button
                            onClick={() => toggleTradition("magisterium")}
                            className="w-full p-4 flex items-center justify-between font-serif font-bold text-xs uppercase tracking-wider text-amber-700 dark:text-amber-400 cursor-pointer hover:bg-muted/40 transition-colors"
                          >
                            <span>• Magistério ({currentDayData.churchTradition.magisterium.length})</span>
                            {expandedTraditions.magisterium ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                          {expandedTraditions.magisterium && (
                            <div className="p-4 pt-0 space-y-2 border-t border-border/40">
                              {currentDayData.churchTradition.magisterium.map((item, idx) => (
                                <p key={idx} className={`font-serif text-muted-foreground ${fontSize}`}>
                                  <strong>{item.author}: </strong>"{item.text}"
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* 11. Oração: Entrega a São Miguel */}
                  {currentDayData.deliveryPrayer && (
                    <div id="sec-entrega" className="scroll-mt-16 rounded-xl border border-amber-500/30 bg-amber-500/5 p-5 space-y-3 border-t border-border">
                      <h3 className="font-serif text-lg font-bold text-amber-800 dark:text-amber-300">
                        11. Oração: Entrega a São Miguel
                      </h3>
                      <p className={`font-serif whitespace-pre-line leading-relaxed text-foreground ${fontSize}`}>
                        {currentDayData.deliveryPrayer}
                      </p>
                    </div>
                  )}

                  {/* 12. Exercício Espiritual */}
                  <div id="sec-exercicio" className="scroll-mt-16 rounded-xl border border-border bg-muted/30 p-4 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 font-serif">
                      12. Exercício Espiritual
                    </span>
                    <p className={`font-serif leading-relaxed text-foreground ${fontSize}`}>
                      "{currentDayData.spiritualExercise}"
                    </p>
                  </div>

                  {/* 13. Citações dos Santos */}
                  <div id="sec-santos" className="scroll-mt-16 space-y-3 pt-2 border-t border-border">
                    <h3 className="font-serif text-lg font-bold text-foreground">13. Citações dos Santos</h3>
                    {currentDayData.saintQuotesList ? (
                      <div className="grid gap-3 sm:grid-cols-2">
                        {currentDayData.saintQuotesList.map((sq, idx) => (
                          <div key={idx} className="rounded-xl border border-border bg-card p-4 space-y-1.5">
                            <span className="text-xs font-serif font-bold text-amber-700 dark:text-amber-400">
                              {idx + 1}. {sq.author}
                            </span>
                            <p className="font-serif text-xs italic text-muted-foreground leading-relaxed">
                              "{sq.quote}"
                            </p>
                            {sq.source && (
                              <p className="text-[10px] font-serif text-muted-foreground/80">
                                ({sq.source})
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-xl border border-border bg-card p-4">
                        <p className={`font-serif italic text-muted-foreground ${fontSize}`}>
                          "{currentDayData.saintQuote}"
                        </p>
                      </div>
                    )}
                  </div>

                  {/* 14. Exame de Consciência (3 Perguntas Diárias) */}
                  <div id="sec-exame" className="scroll-mt-16 space-y-2 pt-2 border-t border-border">
                    <h3 className="font-serif text-lg font-bold text-foreground">14. Exame de Consciência (3 Perguntas Diárias)</h3>
                    <ul className="space-y-2 font-serif text-sm text-muted-foreground">
                      {currentDayData.examination.map((q, idx) => (
                        <li key={idx} className="flex items-start gap-2 bg-muted/20 p-2.5 rounded-lg border border-border">
                          <span className="text-amber-600 font-bold font-mono">{idx + 1}.</span>
                          <span className={fontSize}>{q}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* 15. Penitência para hoje */}
                  <div id="sec-penitencia" className="scroll-mt-16 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 font-serif">
                      15. Penitência para hoje
                    </span>
                    <p className={`font-serif font-semibold italic text-foreground ${fontSize}`}>
                      "{currentDayData.suggestedPenance}"
                    </p>
                  </div>

                  {/* 16-17. Consagrações & Oração Final */}
                  <div id="sec-consagracao" className="scroll-mt-16 space-y-4">
                    {/* 16. Consagração da Família a São Miguel Arcanjo */}
                    {currentDayData.familyConsecration && (
                      <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-5 space-y-2 border-t border-border">
                        <h3 className="font-serif text-lg font-bold text-amber-800 dark:text-amber-300">
                          16. Consagração da Família a São Miguel Arcanjo
                        </h3>
                        <p className={`font-serif whitespace-pre-line leading-relaxed text-foreground ${fontSize}`}>
                          {currentDayData.familyConsecration}
                        </p>
                      </div>
                    )}

                    {/* 17. Oração */}
                    <div className="rounded-xl border-2 border-amber-600/40 bg-amber-500/10 p-5 space-y-2">
                      <h3 className="font-serif text-lg font-bold text-amber-800 dark:text-amber-300">
                        17. Oração
                      </h3>
                      <p className={`font-serif whitespace-pre-line leading-relaxed text-foreground ${fontSize}`}>
                        {currentDayData.complementaryPrayer}
                      </p>
                    </div>
                  </div>

                  {/* Diário Espiritual Privado */}
                  <div className="rounded-xl border border-border bg-muted/30 p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-serif text-lg font-bold text-foreground">Diário Espiritual</h3>
                      <span className="text-[10px] font-bold text-muted-foreground bg-background px-2 py-0.5 rounded border border-border">
                        Privado
                      </span>
                    </div>
                    <Textarea
                      value={currentJournalText}
                      onChange={(e) => handleJournalSave(e.target.value)}
                      placeholder="Guarde aqui o que o Senhor falou ao seu coração..."
                      className="min-h-28 font-serif text-sm"
                    />
                    {currentJournalText && (
                      <Button variant="ghost" size="sm" onClick={handleJournalDelete} className="text-xs text-red-600">
                        Excluir Anotação
                      </Button>
                    )}
                  </div>

                  {/* Botão de Ação: Marcar Dia como Rezado (Igual ao anexo) */}
                  <div className="pt-4 border-t border-white/10 dark:border-border/40">
                    <Button
                      onClick={toggleDayComplete}
                      className={`w-full py-6 font-serif font-bold text-sm sm:text-base rounded-xl cursor-pointer transition-all shadow-md ${
                        isCurrentDayCompleted
                          ? "bg-emerald-700 hover:bg-emerald-800 text-white"
                          : "bg-amber-500 hover:bg-amber-400 text-slate-950"
                      }`}
                    >
                      <CheckCircle2 className="mr-2 h-5 w-5" />
                      {isCurrentDayCompleted ? `Dia ${selectedDayNum} Rezado` : `Marcar Dia ${selectedDayNum} como Rezado`}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

          {/* Coluna Lateral: Lista de Meditações (40 Dias) - Opção 2: Clean & Cremoso */}
          <div className="hidden lg:block space-y-4">
            <div className="rounded-2xl border border-amber-900/15 dark:border-amber-500/20 bg-[#FAF7EE] dark:bg-[#181410] p-4 shadow-sm space-y-3.5">
              {/* Cabeçalho com Barra de Progresso em Ouro */}
              <div className="border-b border-amber-900/10 dark:border-amber-500/15 pb-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-serif font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300 flex items-center gap-2">
                    <BookOpen size={14} className="text-amber-600 dark:text-amber-400" />
                    Meditações (40 Dias)
                  </span>
                  <span className="text-[11px] font-serif font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-900 dark:text-amber-300 border border-amber-500/20">
                    {state.completedDays.length}/40 Concluídos
                  </span>
                </div>
                <div className="w-full bg-amber-900/10 dark:bg-amber-950/80 h-2 rounded-full p-0.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-amber-500 to-amber-600 h-full rounded-full transition-all duration-500 shadow-sm"
                    style={{ width: `${(state.completedDays.length / 40) * 100}%` }}
                  />
                </div>
              </div>

              {/* Scrollable List of 40 Days */}
              <div className="space-y-2.5 max-h-[720px] overflow-y-auto pr-1.5 custom-scrollbar">
                {Array.from({ length: 40 }, (_, i) => i + 1).map((dayNum) => {
                  const active = dayNum === selectedDayNum;
                  const isDone = state.completedDays.includes(dayNum);
                  const isAudioLockedDay = !isPremium && dayNum > 7;

                  const dayItem = SAINT_MICHAEL_LENT.days.find((d) => d.number === dayNum);
                  const themeTitle = dayItem ? dayItem.theme : `Dia ${dayNum}: Combate Espiritual e Oração`;

                  return (
                    <button
                      key={dayNum}
                      onClick={() => handleSelectDay(dayNum)}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 cursor-pointer group ${
                        active
                          ? "bg-amber-100/80 dark:bg-amber-950/60 border-amber-500 dark:border-amber-400 ring-2 ring-amber-500/20 shadow-sm"
                          : isDone
                          ? "bg-emerald-50/90 dark:bg-emerald-950/30 border-emerald-500/30 hover:border-emerald-500/50 shadow-[0_2px_6px_rgba(0,0,0,0.02)]"
                          : "bg-white dark:bg-[#221D17] border-amber-900/10 dark:border-amber-500/15 hover:border-amber-500/40 hover:bg-amber-50/50 dark:hover:bg-[#2A231C] shadow-[0_2px_6px_rgba(0,0,0,0.03)]"
                      }`}
                    >
                      <div className="space-y-1.5 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold uppercase tracking-wider font-serif ${
                            active ? "text-amber-800 dark:text-amber-300" : "text-amber-900/70 dark:text-amber-400/80"
                          }`}>
                            Meditação {dayNum}
                          </span>
                          {isDone && (
                            <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300/40 dark:border-emerald-800/40">
                              <CheckCircle2 size={10} /> Concluído
                            </span>
                          )}
                          {!isDone && active && (
                            <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-900 dark:text-amber-300 border border-amber-500/30">
                              Em andamento
                            </span>
                          )}
                        </div>
                        <p className={`text-xs font-serif font-bold leading-snug line-clamp-2 transition-colors ${
                          active
                            ? "text-amber-950 dark:text-amber-100"
                            : "text-slate-900 dark:text-amber-50 group-hover:text-amber-900 dark:group-hover:text-amber-200"
                        }`}>
                          Dia {dayNum}: {themeTitle}
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-1.5 shrink-0 pt-0.5">
                        <span className="text-[10px] font-mono font-medium text-amber-900/70 dark:text-amber-300/80 bg-amber-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Headphones size={10} className={active ? "text-amber-600 dark:text-amber-400" : "text-amber-700/60"} />
                          05:15
                        </span>
                        {isAudioLockedDay && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-amber-900 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/50 px-2 py-0.5 rounded-full border border-amber-300/60 dark:border-amber-700/50">
                            <Lock size={9} /> Premium
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Caixa de Ajuste da Penitência */}
            <div className="rounded-2xl border border-border bg-card p-4 space-y-2 shadow-sm">
              <span className="text-xs font-serif font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                Minha Penitência da Quaresma
              </span>
              <Input
                value={state.penance}
                onChange={(e) => updateState({ penance: e.target.value })}
                placeholder="Ex.: mortificação das reclamações..."
                className="text-xs font-serif"
              />
            </div>
          </div>
        </div>
      </main>

      <UpgradeDialog
        open={showUpgradeModal}
        onOpenChange={setShowUpgradeModal}
        description="Assine o Sanctificare Premium para desbloquear os áudios completos dos 40 dias da Quaresma de São Miguel Arcanjo."
      />
    </div>
  );
}