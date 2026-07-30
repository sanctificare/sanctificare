import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  Flame,
  Minus,
  Plus,
  ShieldCheck,
  Calendar,
  Sparkles,
  ArrowRight,
  Cross,
} from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { scheduleSaintMichaelLentReminder } from "@/lib/notifications";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  SAINT_MICHAEL_CONSECRATION,
  SAINT_MICHAEL_LENT,
  SAINT_MICHAEL_TRADITIONAL_PRAYERS,
} from "@/data/saint-michael-lent";
import {
  CompletionScreen,
  DailyThemeCard,
  DistractionFreeModal,
  JourneyCalendar,
  JourneyHeader,
  JourneyProgress,
  PenanceCard,
  PremiumDepthSection,
  PrayerAudioPlayer,
  PrayerReader,
  ReminderSettings,
  ScriptureCard,
  SubscriptionOffer,
  TraditionalPrayerSection,
} from "@/components/saint-michael/JourneyComponents";

type JourneyState = {
  startDate: string;
  completedDays: number[];
  selectedDay: number;
  penance: string;
  reminderTime: string;
  journals: Record<number, string>;
};

const STORAGE_KEY = "sanctificare.journey.saint-michael.v2";
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
    startDate: "",
    completedDays: [],
    selectedDay: 1,
    penance: "",
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

export default function SaintMichaelLent() {
  const { isAuthenticated } = useAuth();

  // Subscription status query
  const { data: subscription } = trpc.subscriptions.get.useQuery(undefined, { enabled: isAuthenticated });
  const isPremium = !!subscription && ["active", "cancelled", "past_due"].includes(subscription.status);

  // Backend sync queries/mutations
  const { data: serverProgress } = trpc.journeys.getProgress.useQuery(
    { journeyId: JOURNEY_ID },
    { enabled: isAuthenticated }
  );

  const saveProgressMutation = trpc.journeys.saveProgress.useMutation();
  const saveJournalMutation = trpc.journeys.saveJournal.useMutation();
  const deleteJournalMutation = trpc.journeys.deleteJournal.useMutation();

  const [state, setState] = useState<JourneyState>(loadLocalState);
  const [showDepth, setShowDepth] = useState(false);
  const [fontSize, setFontSize] = useState<"text-sm" | "text-base" | "text-lg">("text-base");
  const [distractionFreeOpen, setDistractionFreeOpen] = useState(false);

  // Sync server progress into local state when available
  useEffect(() => {
    if (serverProgress) {
      setState((prev) => ({
        ...prev,
        startDate: serverProgress.startedAt || prev.startDate,
        completedDays: (serverProgress.completedDays as number[]) || prev.completedDays,
        selectedDay: serverProgress.lastAccessedDay || prev.selectedDay,
        penance: serverProgress.chosenPenance || prev.penance,
        reminderTime: serverProgress.reminderTime || prev.reminderTime,
      }));
    }
  }, [serverProgress]);

  // Persist local state whenever it changes
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

  const day = useMemo(() => {
    return (
      SAINT_MICHAEL_LENT.days.find((item) => item.number === state.selectedDay) || {
        number: state.selectedDay,
        title: `Dia ${state.selectedDay}`,
        theme: `Combate Espiritual e Oração — Dia ${state.selectedDay}`,
        scripture: {
          reference: "Efésios 6,12",
          text: "Pois não é contra homens de carne e sangue que temos de lutar, mas contra os principados e potestades.",
          explanation: "O combate do cristão se trava no terreno do espírito, exigindo vigilância e oração constante.",
        },
        meditation: `Neste ${state.selectedDay}º dia da Quaresma de São Miguel Arcanjo, renove a sua fé e confie na proteção dos santos anjos.`,
        virtue: "Fidelidade",
        purpose: "Rezar um Pai-Nosso e uma Ave-Maria pedindo a proteção de São Miguel para sua família.",
        suggestedPenance: "Abstecer-se de comentários negativos e reclamações.",
        spiritualExercise: "Fazer 3 minutos de silêncio ao meio-dia para colocar Deus no centro do seu trabalho.",
        examination: [
          "Tenho confiado na proteção de Deus nas minhas batalhas?",
          "Fui fiel às minhas orações de hoje?",
        ],
        saintQuote: "Os anjos nos acompanham em cada passo do nosso caminho. - São João Crisóstomo",
        complementaryPrayer:
          "São Miguel Arcanjo, defendei-nos no combate para que não pereçamos no dia do supremo juízo. Amém.",
      }
    );
  }, [state.selectedDay]);

  const completionDateIso = useMemo(() => {
    return state.startDate ? calculateEndDateIso(state.startDate, 40) : "";
  }, [state.startDate]);

  const isCurrentDayCompleted = state.completedDays.includes(state.selectedDay);

  const nextAvailableDay = useMemo(() => {
    for (let d = 1; d <= 40; d++) {
      if (!state.completedDays.includes(d)) return d;
    }
    return 40;
  }, [state.completedDays]);

  const streak = useMemo(() => {
    let count = 0;
    const sorted = [...state.completedDays].sort((a, b) => b - a);
    for (const number of sorted) {
      if (number === sorted[0] - count) count++;
      else break;
    }
    return count;
  }, [state.completedDays]);

  const chooseStart = (date: string) => {
    updateState({ startDate: date, selectedDay: 1 });
    setShowDepth(false);
    toast.success(`Jornada iniciada! Previsão de término: ${formatDateBr(calculateEndDateIso(date, 40))}`);
  };

  const markComplete = () => {
    if (isCurrentDayCompleted) {
      setShowDepth(true);
      return;
    }
    const newCompleted = [...state.completedDays, state.selectedDay].sort((a, b) => a - b);
    updateState({ completedDays: newCompleted });

    if (isAuthenticated) {
      saveProgressMutation.mutate({
        journeyId: JOURNEY_ID,
        startedAt: state.startDate,
        expectedEndAt: completionDateIso,
        lastAccessedDay: state.selectedDay,
        completedDays: newCompleted,
        currentStreak: newCompleted.length,
        chosenPenance: state.penance,
        reminderTime: state.reminderTime,
      });
    }

    toast.success(`Dia ${state.selectedDay} concluído com sucesso. Que São Miguel Arcanjo o proteja!`);
  };

  const selectDay = (number: number) => {
    updateState({ selectedDay: number });
    setShowDepth(false);
    if (isAuthenticated && state.startDate) {
      saveProgressMutation.mutate({
        journeyId: JOURNEY_ID,
        startedAt: state.startDate,
        expectedEndAt: completionDateIso,
        lastAccessedDay: number,
        completedDays: state.completedDays,
        chosenPenance: state.penance,
        reminderTime: state.reminderTime,
      });
    }
  };

  const handleJournalSave = (text: string) => {
    updateState({ journals: { ...state.journals, [state.selectedDay]: text } });
    if (isAuthenticated) {
      saveJournalMutation.mutate({
        journeyId: JOURNEY_ID,
        dayNumber: state.selectedDay,
        content: text,
      });
    }
    toast.success("Sua anotação privada foi salva com segurança.");
  };

  const handleJournalDelete = () => {
    const nextJournals = { ...state.journals };
    delete nextJournals[state.selectedDay];
    updateState({ journals: nextJournals });
    if (isAuthenticated) {
      deleteJournalMutation.mutate({
        journeyId: JOURNEY_ID,
        dayNumber: state.selectedDay,
      });
    }
    toast.success("Anotação excluída.");
  };

  const currentJournalText = state.journals[state.selectedDay] ?? "";

  return (
    <div className="min-h-screen bg-[#FAF7EE] dark:bg-[#13110E] text-[#2C251A] dark:text-[#E6DCC5] pb-20 font-serif">
      <main className="container max-w-4xl space-y-7 px-4 py-7 sm:py-9">
        <Link
          href="/explore"
          className="inline-flex items-center gap-1.5 text-sm font-serif font-bold text-[#7A0C0C] dark:text-[#E5C158] hover:underline"
        >
          <ChevronLeft size={18} /> Voltar para explorar
        </Link>

        {/* Option B Editorial Header */}
        <JourneyHeader
          title={SAINT_MICHAEL_LENT.title}
          subtitle="Quarenta dias de oração, penitência e combate espiritual sob a intercessão de São Miguel Arcanjo."
          image={SAINT_MICHAEL_LENT.image}
        />

        {/* Seleção do Período Inicial (Option B Styling) */}
        {!state.startDate ? (
          <section className="rounded-2xl border-2 border-[#D4AF37]/50 bg-[#F3EDDC] dark:bg-[#1C1813] p-6 sm:p-9 space-y-6 shadow-md">
            <div className="space-y-2 border-b border-[#D4AF37]/30 pb-4">
              <span className="text-xs font-serif font-bold uppercase tracking-widest text-[#7A0C0C] dark:text-[#E5C158] flex items-center gap-1.5">
                <Cross className="h-4 w-4 text-[#D4AF37]" /> Apresentação da Devoção Católica
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2C251A] dark:text-[#FDFBF7]">
                Inicie sua Jornada Espiritual de 40 Dias
              </h2>
              <p className="text-sm sm:text-base text-[#5C503D] dark:text-[#A0927C] leading-relaxed">
                A Quaresma de São Miguel Arcanjo é uma venerável tradição secular de preparação e combate espiritual. O período tradicional inicia-se na Festa da Assunção de Nossa Senhora (<strong>15 de agosto</strong>) e culmina na Festa dos Santos Arcanjos (<strong>29 de setembro</strong>). Você também pode iniciar em qualquer outra época do ano.
              </p>
            </div>

            <div className="space-y-4">
              <p className="text-sm font-bold text-[#7A0C0C] dark:text-[#E5C158]">Selecione a data de início da sua Quaresma:</p>
              <div className="grid gap-3 sm:grid-cols-3">
                <Button
                  variant="outline"
                  onClick={() => chooseStart(getTraditionalStartDateIso())}
                  className="h-auto flex-col items-start p-4 text-left border-[#D4AF37]/50 bg-[#FAF7EE] hover:bg-[#EAE0C8] font-serif"
                >
                  <span className="font-bold text-[#7A0C0C] dark:text-[#E5C158] text-xs uppercase tracking-wider">
                    Período Tradicional
                  </span>
                  <span className="text-base font-bold mt-1 text-[#2C251A] dark:text-[#FDFBF7]">15/08 a 29/09</span>
                  <span className="text-xs text-muted-foreground mt-1">Data histórica da Igreja</span>
                </Button>

                <Button
                  onClick={() => chooseStart(todayIso())}
                  className="h-auto flex-col items-start p-4 text-left bg-[#7A0C0C] hover:bg-[#600909] text-[#FDFBF7] font-serif shadow-md border border-[#D4AF37]/40"
                >
                  <span className="font-bold text-[#E5C158] text-xs uppercase tracking-wider">Início Imediato</span>
                  <span className="text-base font-bold mt-1">Começar Hoje</span>
                  <span className="text-xs text-[#E6DCC5] mt-1">Calcular 40 dias a partir de hoje</span>
                </Button>

                <label className="flex flex-col justify-between rounded-lg border border-[#D4AF37]/50 bg-[#FAF7EE] dark:bg-[#161411] p-4 cursor-pointer hover:bg-[#EAE0C8] transition-all font-serif">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#7A0C0C] dark:text-[#E5C158] flex items-center gap-1">
                      <CalendarDays className="h-3.5 w-3.5 text-[#D4AF37]" /> Selecionar outra data
                    </span>
                    <span className="text-xs text-muted-foreground mt-1 block">Escolha no calendário</span>
                  </div>
                  <Input
                    type="date"
                    min="2020-01-01"
                    max="2100-12-31"
                    onChange={(event) => event.target.value && chooseStart(event.target.value)}
                    className="mt-2 text-xs border-[#D4AF37]/30 bg-[#F3EDDC] dark:bg-[#28241D] shadow-none"
                  />
                </label>
              </div>
            </div>
          </section>
        ) : (
          <>
            {/* Informações da Jornada Ativa (Option B) */}
            <section className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-[#D4AF37]/40 bg-[#FAF7EE] dark:bg-[#1A1814] p-5 shadow-sm space-y-1">
                <span className="text-xs font-bold uppercase tracking-widest text-[#7A0C0C] dark:text-[#E5C158] flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-[#D4AF37]" /> Período Sagrado da Quaresma
                </span>
                <p className="text-base font-bold text-[#2C251A] dark:text-[#FDFBF7]">
                  {formatDateBr(state.startDate)} a {formatDateBr(completionDateIso)}
                </p>
                <p className="text-xs text-muted-foreground">40 dias de oração calculados automaticamente.</p>
              </div>

              <PenanceCard
                text={
                  state.penance ||
                  "Nenhuma penitência registrada. Defina sua oferta de mortificação para estes 40 dias."
                }
              />
            </section>

            {/* Built-In Cathedral Audio Player (Option B Feature) */}
            <PrayerAudioPlayer title={`Áudio da Oração — Dia ${state.selectedDay}: ${day.theme}`} />

            {/* Progresso & Calendário dos 40 Dias */}
            <JourneyProgress
              completed={state.completedDays.length}
              total={SAINT_MICHAEL_LENT.totalDays}
              streak={streak}
            />

            <JourneyCalendar
              completed={state.completedDays}
              selectedDay={state.selectedDay}
              onSelect={selectDay}
            />

            {/* Botão de Retomada / Próximo Dia Disponível */}
            {nextAvailableDay !== state.selectedDay && (
              <div className="flex items-center justify-between rounded-xl border-2 border-[#D4AF37]/40 bg-[#F3EDDC] dark:bg-[#1E1A14] p-5 shadow-sm">
                <div className="flex items-center gap-2 text-sm text-[#7A0C0C] dark:text-[#E5C158] font-bold">
                  <Sparkles className="h-4 w-4 text-[#D4AF37]" />
                  <span>
                    Próximo dia pendente na jornada: <strong>Dia {nextAvailableDay}</strong>
                  </span>
                </div>
                <Button
                  size="sm"
                  onClick={() => selectDay(nextAvailableDay)}
                  className="font-serif bg-[#7A0C0C] hover:bg-[#600909] text-[#FDFBF7] font-bold gap-1.5 text-xs shadow-sm"
                >
                  <span>Continuar Jornada</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}

            {/* ETAPA 1 — PREPARAÇÃO (Option B Style) */}
            <section className="rounded-xl border border-[#D4AF37]/40 bg-[#FAF7EE] dark:bg-[#1A1814] p-6 sm:p-7 space-y-5 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D4AF37]/20 pb-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-[#7A0C0C] dark:text-[#E5C158]">
                    Etapa 1 — Preparação para a Oração
                  </span>
                  <h2 className="font-serif mt-1 text-2xl sm:text-3xl font-bold text-[#2C251A] dark:text-[#FDFBF7]">
                    Dia {state.selectedDay}: {day.theme}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5 font-serif">
                    {formatDateBr(calculateEndDateIso(state.startDate, state.selectedDay))}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center rounded-lg border border-[#D4AF37]/40 bg-[#F3EDDC] dark:bg-[#28241D] p-1 text-xs">
                    <span className="px-2 text-muted-foreground font-bold">Fonte:</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setFontSize((size) =>
                          size === "text-sm" ? "text-lg" : size === "text-base" ? "text-sm" : "text-base"
                        )
                      }
                      aria-label="Ajustar tamanho da fonte"
                      className="h-7 w-7 text-[#7A0C0C] dark:text-[#E5C158]"
                    >
                      {fontSize === "text-lg" ? <Minus size={14} /> : <Plus size={14} />}
                    </Button>
                  </div>
                  <Button
                    onClick={() =>
                      document.getElementById("traditional-prayers-section")?.scrollIntoView({ behavior: "smooth" })
                    }
                    className="font-serif bg-[#7A0C0C] hover:bg-[#600909] text-[#FDFBF7] font-bold shadow-sm"
                  >
                    Iniciar a Oração
                  </Button>
                </div>
              </div>

              <div className="rounded-lg bg-[#F5EFE0] dark:bg-[#221E18] p-5 border border-[#D4AF37]/30 text-xs sm:text-sm leading-relaxed text-[#2C251A] dark:text-[#E6DCC5]">
                <p className="font-bold text-[#7A0C0C] dark:text-[#E5C158] flex items-center gap-1.5">
                  <span>✦</span> Orientação para o Ambiente Sagrado:
                </p>
                <p className="mt-1 text-[#5C503D] dark:text-[#A0927C]">
                  Recolha seu coração na presença de Deus. Se possível, acenda uma vela benta como sinal de fé e mantenha uma atitude de profunda entrega e combate espiritual.
                </p>
              </div>

              <div className="pt-2">
                <label className="block text-xs font-bold uppercase tracking-widest text-[#7A0C0C] dark:text-[#E5C158]">
                  Minha Penitência Escolhida para a Jornada:
                </label>
                <Input
                  value={state.penance}
                  onChange={(event) => updateState({ penance: event.target.value })}
                  placeholder="Ex.: renunciar a satisfações, evitar reclamações, jejum nas quartas e sextas..."
                  className="mt-1.5 text-sm border-[#D4AF37]/40 bg-[#F3EDDC] dark:bg-[#28241D] text-[#2C251A] dark:text-[#E6DCC5]"
                />
              </div>
            </section>

            {/* Tema & Leitura Bíblica */}
            <DailyThemeCard day={day} />
            <ScriptureCard day={day} />

            {/* ETAPA 2 — ORAÇÕES TRADICIONAL GRATUITAS */}
            <div id="traditional-prayers-section" className="scroll-mt-6">
              <TraditionalPrayerSection>
                <PrayerReader
                  prayers={SAINT_MICHAEL_TRADITIONAL_PRAYERS}
                  fontSize={fontSize}
                  onNext={markComplete}
                  onOpenDistractionFree={() => setDistractionFreeOpen(true)}
                />
              </TraditionalPrayerSection>
            </div>

            {/* Oração de Consagração a São Miguel (Exibida no Dia 40) */}
            {state.selectedDay === 40 && (
              <section className="rounded-2xl border-2 border-[#D4AF37] bg-[#F5EFE0] dark:bg-[#1F1B15] p-7 space-y-4 shadow-md">
                <span className="text-xs font-bold uppercase tracking-widest text-[#7A0C0C] dark:text-[#E5C158] flex items-center gap-1.5">
                  <ShieldCheck className="h-5 w-5 text-[#D4AF37]" /> Oração de Consagração a São Miguel Arcanjo (Dia 40)
                </span>
                <p className="whitespace-pre-line font-serif text-base sm:text-xl leading-relaxed text-[#2C251A] dark:text-[#E6DCC5] italic">
                  {SAINT_MICHAEL_CONSECRATION}
                </p>
              </section>
            )}

            {/* ETAPA 3 — CONCLUSÃO DA DEVOÇÃO TRADICIONAL */}
            {isCurrentDayCompleted && (
              <CompletionScreen
                completed={state.completedDays.length}
                total={SAINT_MICHAEL_LENT.totalDays}
                onFinish={() => toast.success("Seu progresso diário foi salvo com sucesso.")}
                onDepth={() => setShowDepth(true)}
              />
            )}

            {/* ETAPA 4 — CONTEÚDO PREMIUM / APROFUNDAMENTO ESPIRITUAL */}
            {showDepth && (
              isPremium ? (
                <PremiumDepthSection
                  day={day}
                  journal={currentJournalText}
                  onJournalSave={handleJournalSave}
                  onJournalDelete={handleJournalDelete}
                />
              ) : (
                <div className="space-y-5">
                  <section className="rounded-2xl border-2 border-[#D4AF37]/50 bg-[#FAF7EE] dark:bg-[#1A1814] p-7 sm:p-9 text-center space-y-3 shadow-md">
                    <Flame className="mx-auto h-9 w-9 text-[#7A0C0C] dark:text-[#E5C158]" />
                    <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#7A0C0C] dark:text-[#E5C158]">
                      Você concluiu a oração tradicional de hoje.
                    </h2>
                    <p className="font-serif text-[#5C503D] dark:text-[#A0927C] text-base sm:text-lg max-w-xl mx-auto italic">
                      Permaneça mais alguns minutos com Deus e aprofunde esta jornada espiritual.
                    </p>
                  </section>
                  <SubscriptionOffer />
                </div>
              )
            )}

            {/* Configurações de Lembrete Diário */}
            <ReminderSettings
              value={state.reminderTime}
              onChange={(reminderTime) => {
                updateState({ reminderTime });
                void scheduleSaintMichaelLentReminder(reminderTime);
                toast.success("Horário do lembrete diário salvo.");
              }}
            />
          </>
        )}

        {/* Modal de Leitura Sem Distrações (Option B Manuscript) */}
        <DistractionFreeModal
          open={distractionFreeOpen}
          onOpenChange={setDistractionFreeOpen}
          prayers={SAINT_MICHAEL_TRADITIONAL_PRAYERS}
          fontSize={fontSize}
        />
      </main>
    </div>
  );
}