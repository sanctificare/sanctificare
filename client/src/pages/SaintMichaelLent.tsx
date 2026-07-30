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
  CalendarDays,
  ShieldCheck,
  Cross,
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

  // Day data resolver
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
  // Days 1, 2, 3: FREE AUDIO FOR ALL!
  // Days 4 to 40: PREMIUM AUDIO ONLY
  const isAudioLocked = selectedDayNum > 3 && !isPremium;

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
    <div className="min-h-screen bg-[#FAF7EE] dark:bg-[#13110E] text-[#2C251A] dark:text-[#E6DCC5] pb-20 font-serif">
      <main className="container px-4 sm:px-6 py-6 sm:py-8 relative z-10 max-w-6xl">
        {/* Header Estilo Novenas */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-5 gap-4">
          <div>
            <Link href="/explore">
              <button className="mb-2 text-xs sm:text-sm font-serif font-bold text-[#7A0C0C] dark:text-[#E5C158] hover:underline cursor-pointer flex items-center gap-1.5">
                <ArrowLeft size={16} /> Voltar ao catálogo de devocionais
              </button>
            </Link>
            <p className="text-[10px] sm:text-xs font-serif font-bold uppercase tracking-widest text-[#7A0C0C] dark:text-[#E5C158]">
              Devocional • Jornada Espiritual de 40 Dias
            </p>
            <h1 className="font-serif text-2xl xs:text-3xl sm:text-4xl font-bold text-[#2C251A] dark:text-[#FDFBF7] leading-tight break-words">
              {SAINT_MICHAEL_LENT.title}
            </h1>
            <p className="font-serif text-xs sm:text-sm text-[#5C503D] dark:text-[#A0927C] mt-0.5">
              40 Dias de Oração, Penitência e Combate Espiritual • Início Tradicional em 15/08
            </p>
          </div>
        </div>

        {/* Mobile Quick Day Selector Bar (< lg screens) */}
        <div className="block lg:hidden mb-5">
          <div className="flex items-center justify-between mb-2 px-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A0C0C] dark:text-[#E5C158] font-serif">
              Meditações (40 Dias)
            </span>
            <span className="text-[10px] font-serif text-muted-foreground font-semibold">
              Dia {selectedDayNum} de 40
            </span>
          </div>
          <div
            ref={pillNavRef}
            className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none snap-x -mx-4 px-4 sm:mx-0 sm:px-0"
          >
            {Array.from({ length: 40 }, (_, i) => i + 1).map((dayNum) => {
              const active = dayNum === selectedDayNum;
              const isDone = state.completedDays.includes(dayNum);
              const isAudioLockedDay = dayNum > 3 && !isPremium;

              return (
                <button
                  key={dayNum}
                  data-active={active}
                  onClick={() => handleSelectDay(dayNum)}
                  className={`shrink-0 snap-start rounded-full px-3.5 py-1.5 font-serif text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
                    active
                      ? "bg-[#7A0C0C] text-[#FDFBF7] border-[#D4AF37] shadow-sm"
                      : "bg-[#F3EDDC] text-[#5C503D] border-[#D4AF37]/30 dark:bg-[#242019] dark:text-[#A0927C]"
                  }`}
                >
                  <span>Dia {dayNum}</span>
                  {isDone && <CheckCircle2 size={11} className={active ? "text-emerald-300" : "text-emerald-600"} />}
                  {isAudioLockedDay && <Lock size={10} className={active ? "text-amber-300" : "text-amber-500"} />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Layout Principal em 2 Colunas (Option B Layout Fiel ao Anexo) */}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
          
          {/* Coluna Principal: Conteúdo de Áudio / Texto (Option B Parchment & Gold Style) */}
          <div className="rounded-2xl border-2 border-[#D4AF37]/40 bg-[#FAF7EE] dark:bg-[#1A1814] p-4 sm:p-7 shadow-xl text-[#2C251A] dark:text-[#E6DCC5]">
            <div className="space-y-6">
              {/* Seleção de Abas [ ÁUDIO | TEXTO ] */}
              <div className="flex border-b-2 border-[#D4AF37]/30 mb-6">
                <button
                  onClick={() => setActiveTab("audio")}
                  className={`flex-1 py-3 text-center text-xs font-serif font-bold uppercase tracking-widest transition-all border-b-2 flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === "audio"
                      ? "border-[#7A0C0C] text-[#7A0C0C] dark:text-[#E5C158] dark:border-[#E5C158]"
                      : "border-transparent text-[#5C503D] dark:text-[#A0927C] hover:text-[#7A0C0C]"
                  }`}
                >
                  <Headphones size={15} />
                  <span>Áudio</span>
                  {selectedDayNum <= 3 && (
                    <span className="rounded-full bg-[#7A0C0C]/10 text-[#7A0C0C] dark:text-[#E5C158] px-2 py-0.5 text-[9px] font-serif font-bold border border-[#D4AF37]/40">
                      Grátis
                    </span>
                  )}
                  {isPlaying && (
                    <span className="w-2 h-2 rounded-full bg-[#7A0C0C] dark:bg-[#E5C158] animate-pulse" />
                  )}
                </button>

                <button
                  onClick={() => setActiveTab("text")}
                  className={`flex-1 py-3 text-center text-xs font-serif font-bold uppercase tracking-widest transition-all border-b-2 flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === "text"
                      ? "border-[#7A0C0C] text-[#7A0C0C] dark:text-[#E5C158] dark:border-[#E5C158]"
                      : "border-transparent text-[#5C503D] dark:text-[#A0927C] hover:text-[#7A0C0C]"
                  }`}
                >
                  <BookOpen size={15} />
                  <span>Texto (100% Gratuito)</span>
                </button>
              </div>

              {/* ABA ÁUDIO (Option B Styling) */}
              {activeTab === "audio" && (
                <div className="space-y-6 animate-fade-in">
                  {/* Se o áudio estiver bloqueado (Dias 4-40 sem Premium) */}
                  {isAudioLocked ? (
                    <div className="py-12 text-center space-y-4">
                      <div className="w-14 h-14 rounded-full bg-[#7A0C0C]/10 border border-[#D4AF37] flex items-center justify-center mx-auto">
                        <Lock size={24} className="text-[#7A0C0C] dark:text-[#E5C158]" />
                      </div>
                      <span className="text-xs uppercase font-serif tracking-widest font-bold text-[#7A0C0C] dark:text-[#E5C158]">
                        Dia {selectedDayNum} — Áudio Premium
                      </span>
                      <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#2C251A] dark:text-[#FDFBF7] max-w-md mx-auto">
                        O áudio dos Dias 4 a 40 é exclusivo para assinantes Sanctificare Premium
                      </h3>
                      <p className="text-xs sm:text-sm font-serif text-[#5C503D] dark:text-[#A0927C] max-w-md mx-auto leading-relaxed">
                        Os 3 primeiros dias de áudio são gratuitos. O texto das orações tradicionais e a meditação do Dia {selectedDayNum} continuam <strong>100% gratuitos</strong> na aba <strong>TEXTO</strong>.
                      </p>

                      <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3 font-serif">
                        <Button
                          onClick={() => setActiveTab("text")}
                          className="bg-[#7A0C0C] hover:bg-[#600909] text-[#FDFBF7] font-bold text-xs shadow-sm border border-[#D4AF37]/40"
                        >
                          <BookOpen size={14} className="mr-1.5" /> Ler Texto Gratuito do Dia {selectedDayNum}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setShowUpgradeModal(true)}
                          className="border-[#D4AF37] text-[#7A0C0C] dark:text-[#E5C158] bg-[#F3EDDC] hover:bg-[#EAE0C8] font-bold text-xs"
                        >
                          <Crown size={14} className="mr-1.5 text-[#D4AF37]" /> Desbloquear Áudios Premium
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Cabeçalho do Dia (Option B Style) */}
                      <div className="text-center">
                        <span className="text-[10px] uppercase font-serif font-bold tracking-widest text-[#7A0C0C] dark:text-[#E5C158]">
                          Dia {selectedDayNum}
                        </span>
                        <h2 className="font-serif text-xl md:text-2xl font-bold text-[#2C251A] dark:text-[#FDFBF7] mt-1 leading-tight">
                          {currentDayData.theme}
                        </h2>
                      </div>

                      {/* Intenção / Penitência – Box em tom pergaminho com borda dourada */}
                      <div className="rounded-xl border border-[#D4AF37]/50 bg-[#F3EDDC] dark:bg-[#221E18] p-4 flex gap-3 items-start shadow-2xs">
                        <Heart size={16} className="text-[#7A0C0C] dark:text-[#E5C158] fill-[#7A0C0C]/20 mt-0.5 shrink-0" />
                        <div className="w-full">
                          <span className="text-[10px] uppercase font-serif tracking-widest font-bold text-[#7A0C0C] dark:text-[#E5C158]">
                            Rezando Por / Penitência Escolhida:
                          </span>
                          <p className="text-xs sm:text-sm font-serif italic text-[#2C251A] dark:text-[#E6DCC5] leading-normal mt-0.5">
                            "{state.penance || "Registre sua penitência para acompanhar sua jornada."}"
                          </p>
                        </div>
                      </div>

                      {/* Visual de Capa com moldura dourada e iluminação da Option B */}
                      <div className="flex flex-col items-center justify-center my-6">
                        <div className="relative w-44 h-44">
                          <div
                            className={`absolute -inset-2 rounded-3xl bg-gradient-to-tr from-[#7A0C0C] via-[#D4AF37] to-[#E5C158] blur-md transition-opacity duration-1000 ${
                              isPlaying ? "opacity-90 animate-pulse" : "opacity-40"
                            }`}
                          />
                          <img
                            src={SAINT_MICHAEL_LENT.image}
                            alt="São Miguel Arcanjo"
                            className={`relative w-44 h-44 rounded-3xl object-cover z-10 border-2 border-[#D4AF37] shadow-2xl transition-transform duration-500 ${
                              isPlaying ? "scale-105" : "scale-100"
                            }`}
                          />
                        </div>
                      </div>

                      {/* Controles do Player de Áudio — Option B Cathedral Pergaminho & Ouro Widget */}
                      <div className="w-full max-w-md mx-auto bg-[#F3EDDC] dark:bg-[#1E1B15] border-2 border-[#D4AF37]/50 rounded-2xl p-5 shadow-lg flex flex-col gap-3.5">
                        {/* Progress Bar & Seeker */}
                        <div className="flex items-center gap-2.5">
                          <span className="text-[11px] text-[#5C503D] dark:text-[#A0927C] w-10 text-right font-mono font-bold">
                            {formatAudioTime(currentTime)}
                          </span>
                          <input
                            type="range"
                            min={0}
                            max={duration}
                            step={1}
                            value={currentTime}
                            onChange={(e) => setCurrentTime(Number(e.target.value))}
                            className="flex-1 h-2 rounded-full accent-[#7A0C0C] dark:accent-[#E5C158] bg-[#E8DFC8] dark:bg-[#28241D] cursor-pointer outline-none"
                          />
                          <span className="text-[11px] text-[#5C503D] dark:text-[#A0927C] w-10 font-mono font-bold">
                            -{formatAudioTime(duration - currentTime)}
                          </span>
                        </div>

                        {/* Botões do Player Option B */}
                        <div className="flex items-center justify-center gap-6 pt-1">
                          <button
                            onClick={() => setCurrentTime(0)}
                            className="text-[#5C503D] dark:text-[#A0927C] hover:text-[#7A0C0C] transition-colors"
                            aria-label="Reiniciar"
                          >
                            <RotateCcw size={18} />
                          </button>

                          <button
                            onClick={() => {
                              if (navigator.share) {
                                void navigator.share({
                                  title: `Quaresma de São Miguel Arcanjo - Dia ${selectedDayNum}`,
                                  text: `Estou rezando o Dia ${selectedDayNum} da Quaresma de São Miguel no Sanctificare!`,
                                  url: window.location.href,
                                });
                              } else {
                                toast.success("Link da oração copiado para a área de transferência!");
                              }
                            }}
                            className="text-[#5C503D] dark:text-[#A0927C] hover:text-[#7A0C0C] transition-colors"
                            aria-label="Compartilhar"
                          >
                            <Share2 size={18} />
                          </button>

                          {/* Large Center Cathedral Burgundy Play/Pause Button */}
                          <button
                            onClick={() => setIsPlaying(!isPlaying)}
                            className="w-14 h-14 rounded-full bg-[#7A0C0C] hover:bg-[#600909] text-[#FDFBF7] border-2 border-[#D4AF37] flex items-center justify-center shadow-lg transition-transform active:scale-95 cursor-pointer"
                            aria-label={isPlaying ? "Pausar" : "Reproduzir"}
                          >
                            {isPlaying ? (
                              <Pause size={24} className="fill-[#FDFBF7]" />
                            ) : (
                              <Play size={24} className="fill-[#FDFBF7] ml-1" />
                            )}
                          </button>

                          <button
                            onClick={() => setIsMuted(!isMuted)}
                            className="text-[#5C503D] dark:text-[#A0927C] hover:text-[#7A0C0C] transition-colors"
                            aria-label="Mudo"
                          >
                            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
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
                  <div className="flex items-center justify-between border-b border-[#D4AF37]/30 pb-3">
                    <div>
                      <span className="text-[10px] font-serif font-bold uppercase tracking-widest text-[#7A0C0C] dark:text-[#E5C158]">
                        Devoção Tradicional Gratuitamente
                      </span>
                      <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#2C251A] dark:text-[#FDFBF7]">
                        Dia {selectedDayNum}: {currentDayData.theme}
                      </h2>
                    </div>

                    <div className="flex items-center gap-1 border border-[#D4AF37]/40 bg-[#F3EDDC] dark:bg-[#28241D] p-1 rounded-lg text-xs font-serif">
                      <span className="px-2 text-muted-foreground font-bold">Fonte:</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          setFontSize((s) => (s === "text-sm" ? "text-lg" : s === "text-base" ? "text-sm" : "text-base"))
                        }
                        className="h-7 w-7 text-[#7A0C0C] dark:text-[#E5C158]"
                      >
                        {fontSize === "text-lg" ? <Minus size={14} /> : <Plus size={14} />}
                      </Button>
                    </div>
                  </div>

                  {/* Leitura Bíblica */}
                  <div className="rounded-xl border-l-4 border-[#7A0C0C] border-y border-r border-[#D4AF37]/30 bg-[#F5EFE0]/80 dark:bg-[#221E18] p-5 space-y-2">
                    <p className="font-serif font-bold text-[#7A0C0C] dark:text-[#E5C158] text-sm flex items-center gap-1.5">
                      <BookOpen size={16} className="text-[#D4AF37]" /> Sagrada Escritura — {currentDayData.scripture.reference}
                    </p>
                    <p className={`font-serif italic leading-relaxed text-[#2C251A] dark:text-[#E6DCC5] ${fontSize}`}>
                      "{currentDayData.scripture.text}"
                    </p>
                    {currentDayData.scripture.explanation && (
                      <p className="text-xs font-serif text-[#5C503D] dark:text-[#A0927C] pt-2 border-t border-[#D4AF37]/20">
                        <strong className="text-[#7A0C0C] dark:text-[#E5C158]">Explicação Bíblica: </strong>
                        {currentDayData.scripture.explanation}
                      </p>
                    )}
                  </div>

                  {/* Meditação Teológica */}
                  <div className="space-y-2">
                    <h3 className="font-serif text-lg font-bold text-[#7A0C0C] dark:text-[#E5C158]">Meditação do Dia</h3>
                    <p className={`font-serif leading-relaxed text-[#2C251A] dark:text-[#E6DCC5] ${fontSize} whitespace-pre-line`}>
                      {currentDayData.meditation}
                    </p>
                  </div>

                  {/* Virtude e Propósito */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl border border-[#D4AF37]/40 p-4 bg-[#F3EDDC]/60 dark:bg-[#221E18]">
                      <span className="text-[10px] font-serif font-bold uppercase tracking-widest text-[#7A0C0C] dark:text-[#E5C158]">
                        Virtude a Cultivar
                      </span>
                      <p className="font-serif text-lg font-bold text-[#8B0000] dark:text-[#D4AF37] mt-0.5">
                        {currentDayData.virtue}
                      </p>
                    </div>
                    <div className="rounded-xl border border-[#D4AF37]/40 p-4 bg-[#F3EDDC]/60 dark:bg-[#221E18]">
                      <span className="text-[10px] font-serif font-bold uppercase tracking-widest text-[#7A0C0C] dark:text-[#E5C158]">
                        Propósito Concreto
                      </span>
                      <p className="font-serif text-sm font-semibold text-[#2C251A] dark:text-[#E6DCC5] mt-0.5">
                        {currentDayData.purpose}
                      </p>
                    </div>
                  </div>

                  {/* Orações Tradicionais Completas */}
                  <div className="space-y-4 pt-2">
                    <h3 className="font-serif text-lg font-bold text-[#7A0C0C] dark:text-[#E5C158] flex items-center gap-1.5">
                      <ShieldCheck size={18} className="text-[#D4AF37]" /> Orações Tradicionais Preservadas
                    </h3>
                    <div className="space-y-3">
                      {SAINT_MICHAEL_TRADITIONAL_PRAYERS.map((prayer, idx) => (
                        <div key={prayer.title} className="rounded-xl border border-[#D4AF37]/30 bg-[#F5EFE0]/60 dark:bg-[#221E18] p-5 space-y-2">
                          <h4 className="font-serif font-bold text-sm text-[#7A0C0C] dark:text-[#E5C158]">
                            {idx + 1}. {prayer.title}
                          </h4>
                          <p className={`font-serif whitespace-pre-line leading-relaxed text-[#2C251A] dark:text-[#E6DCC5] ${fontSize}`}>
                            {prayer.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Exame de Consciência */}
                  <div className="space-y-2 pt-2 border-t border-[#D4AF37]/20">
                    <h3 className="font-serif text-lg font-bold text-[#7A0C0C] dark:text-[#E5C158]">Exame de Consciência</h3>
                    <ul className="space-y-1.5 font-serif text-sm text-[#2C251A] dark:text-[#E6DCC5]">
                      {currentDayData.examination.map((q) => (
                        <li key={q} className="flex items-start gap-2">
                          <span className="text-[#D4AF37] font-bold">✦</span>
                          <span>{q}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Diário Espiritual Privado */}
                  <div className="rounded-xl border-2 border-[#D4AF37]/40 bg-[#F3EDDC] dark:bg-[#1E1A14] p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-serif text-lg font-bold text-[#7A0C0C] dark:text-[#E5C158]">Diário Espiritual</h3>
                      <span className="text-[10px] font-serif font-bold text-[#5C503D] bg-[#E8DFC8] dark:bg-[#28241D] px-2.5 py-0.5 rounded border border-[#D4AF37]/30">
                        Privado
                      </span>
                    </div>
                    <Textarea
                      value={currentJournalText}
                      onChange={(e) => handleJournalSave(e.target.value)}
                      placeholder="Guarde aqui o que o Senhor falou ao seu coração..."
                      className="min-h-28 font-serif text-sm border-[#D4AF37]/30 bg-[#FAF7EE] dark:bg-[#14120F] text-[#2C251A] dark:text-[#E6DCC5]"
                    />
                    {currentJournalText && (
                      <Button variant="ghost" size="sm" onClick={handleJournalDelete} className="text-xs text-red-700 font-serif">
                        Excluir Anotação
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* Botão de Ação: Marcar Dia como Rezado — Option B Cathedral Burgundy Button */}
              <div className="pt-4 border-t border-[#D4AF37]/30">
                <Button
                  onClick={toggleDayComplete}
                  className={`w-full py-6 font-serif font-bold text-sm sm:text-base rounded-xl cursor-pointer transition-all shadow-md border ${
                    isCurrentDayCompleted
                      ? "bg-[#1B5E20] hover:bg-[#144718] text-[#FDFBF7] border-[#A5D6A7]/40"
                      : "bg-[#7A0C0C] hover:bg-[#600909] text-[#FDFBF7] border-[#D4AF37]/50"
                  }`}
                >
                  <CheckCircle2 className="mr-2 h-5 w-5" />
                  {isCurrentDayCompleted ? `Dia ${selectedDayNum} Rezado` : `Marcar Dia ${selectedDayNum} como Rezado`}
                </Button>
              </div>
            </div>
          </div>

          {/* Coluna Lateral: Lista de Meditações (40 Dias) - Option B Styling */}
          <div className="hidden lg:block space-y-4 font-serif">
            <div className="rounded-2xl border-2 border-[#D4AF37]/40 bg-[#FAF7EE] dark:bg-[#1A1814] p-5 shadow-md space-y-3">
              <div className="flex items-center justify-between border-b border-[#D4AF37]/30 pb-3">
                <span className="text-xs font-serif font-bold uppercase tracking-widest text-[#7A0C0C] dark:text-[#E5C158]">
                  Meditações (40 Dias)
                </span>
                <span className="text-xs font-serif text-[#5C503D] dark:text-[#A0927C] font-bold">
                  {state.completedDays.length}/40 Concluídos
                </span>
              </div>

              {/* Scrollable List of 40 Days */}
              <div className="space-y-2 max-h-[720px] overflow-y-auto pr-1">
                {Array.from({ length: 40 }, (_, i) => i + 1).map((dayNum) => {
                  const active = dayNum === selectedDayNum;
                  const isDone = state.completedDays.includes(dayNum);
                  const isAudioLockedDay = dayNum > 3 && !isPremium;

                  const dayItem = SAINT_MICHAEL_LENT.days.find((d) => d.number === dayNum);
                  const themeTitle = dayItem ? dayItem.theme : `Dia ${dayNum}: Combate Espiritual e Oração`;

                  return (
                    <button
                      key={dayNum}
                      onClick={() => handleSelectDay(dayNum)}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 cursor-pointer ${
                        active
                          ? "bg-[#F3EDDC] dark:bg-[#221E18] border-[#D4AF37] ring-2 ring-[#D4AF37]/40 shadow-sm"
                          : "bg-[#F5EFE0]/50 hover:bg-[#F3EDDC] dark:bg-[#181612] border-[#D4AF37]/20"
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-serif font-bold uppercase tracking-wider text-[#7A0C0C] dark:text-[#E5C158]">
                            Meditação {dayNum}
                          </span>
                          {isDone && <CheckCircle2 size={12} className="text-[#1B5E20]" />}
                          {isAudioLockedDay && <Lock size={11} className="text-[#D4AF37]" />}
                        </div>
                        <p className={`text-xs font-serif font-bold leading-snug line-clamp-2 ${
                          active ? "text-[#7A0C0C] dark:text-[#E5C158]" : "text-[#2C251A] dark:text-[#E6DCC5]"
                        }`}>
                          Dia {dayNum}: {themeTitle}
                        </p>
                      </div>

                      <span className="text-[10px] font-mono text-[#5C503D] dark:text-[#A0927C] shrink-0 flex items-center gap-1 mt-0.5">
                        <Headphones size={10} />
                        05:15
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Caixa de Ajuste da Penitência */}
            <div className="rounded-2xl border border-[#D4AF37]/40 bg-[#FAF7EE] dark:bg-[#1A1814] p-5 space-y-2 shadow-sm">
              <span className="text-xs font-serif font-bold uppercase tracking-widest text-[#7A0C0C] dark:text-[#E5C158]">
                Minha Penitência da Quaresma
              </span>
              <Input
                value={state.penance}
                onChange={(e) => updateState({ penance: e.target.value })}
                placeholder="Ex.: mortificação das reclamações..."
                className="text-xs font-serif border-[#D4AF37]/40 bg-[#F3EDDC] dark:bg-[#242019]"
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