import { useEffect, useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, Flame, Minus, Plus } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { scheduleSaintMichaelLentReminder } from "@/lib/notifications";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SAINT_MICHAEL_CONSECRATION, SAINT_MICHAEL_LENT, SAINT_MICHAEL_TRADITIONAL_PRAYERS } from "@/data/saint-michael-lent";
import { CompletionScreen, DailyThemeCard, JourneyCalendar, JourneyHeader, JourneyProgress, PenanceCard, PremiumDepthSection, PrayerAudioPlayer, PrayerReader, ReminderSettings, ScriptureCard, SubscriptionOffer, TraditionalPrayerSection } from "@/components/saint-michael/JourneyComponents";

type JourneyState = { startDate: string; completedDays: number[]; selectedDay: number; penance: string; reminderTime: string; journals: Record<number, string> };
const STORAGE_KEY = "sanctificare.journey.saint-michael.v1";

function today() { return new Date().toISOString().slice(0, 10); }
function formatDate(value: string) { return new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" }).format(new Date(`${value}T12:00:00`)); }
function addDays(value: string, days: number) { const date = new Date(`${value}T12:00:00`); date.setDate(date.getDate() + days); return date.toISOString().slice(0, 10); }
function defaultState(): JourneyState { return { startDate: "", completedDays: [], selectedDay: 1, penance: "", reminderTime: "20:00", journals: {} }; }
function loadState(): JourneyState { try { const value = localStorage.getItem(STORAGE_KEY); return value ? { ...defaultState(), ...JSON.parse(value) } : defaultState(); } catch { return defaultState(); } }

export default function SaintMichaelLent() {
  const { isAuthenticated } = useAuth();
  const { data: subscription } = trpc.subscriptions.get.useQuery(undefined, { enabled: isAuthenticated });
  const isPremium = !!subscription && ["active", "cancelled", "past_due"].includes(subscription.status);
  const [state, setState] = useState<JourneyState>(loadState);
  const [showDepth, setShowDepth] = useState(false);
  const [fontSize, setFontSize] = useState<"text-sm" | "text-base" | "text-lg">("text-base");
  const day = SAINT_MICHAEL_LENT.days.find(item => item.number === state.selectedDay);
  const completionDate = state.startDate ? addDays(state.startDate, 39) : "";
  const completed = state.completedDays.includes(state.selectedDay);
  const streak = useMemo(() => { let count = 0; const sorted = [...state.completedDays].sort((a, b) => b - a); for (const number of sorted) { if (number === sorted[0] - count) count++; else break; } return count; }, [state.completedDays]);

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }, [state]);
  const update = (patch: Partial<JourneyState>) => setState(current => ({ ...current, ...patch }));
  const chooseStart = (date: string) => { update({ startDate: date, selectedDay: 1 }); setShowDepth(false); };
  const markComplete = () => {
    if (!day) return;
    if (completed) return setShowDepth(true);
    update({ completedDays: [...state.completedDays, day.number].sort((a, b) => a - b) });
    toast.success(`Dia ${day.number} concluído. Que São Miguel o guarde.`);
  };
  const selectDay = (number: number) => { update({ selectedDay: number }); setShowDepth(false); };

  return <div className="min-h-screen bg-[oklch(0.97_0.012_85)] pb-14 dark:bg-background"><main className="container max-w-5xl space-y-5 px-4 py-6 sm:py-8">
    <Link href="/explore" className="inline-flex items-center gap-1 text-sm font-medium text-[oklch(0.55_0.12_65)] hover:underline"><ChevronLeft size={16} />Voltar para explorar</Link>
    <JourneyHeader title={SAINT_MICHAEL_LENT.title} subtitle="40 dias de oração, penitência e combate espiritual" image={SAINT_MICHAEL_LENT.image} />
    {!state.startDate ? <section className="border border-border bg-background p-5 sm:p-6"><p className="text-xs font-bold uppercase tracking-wider text-[oklch(0.55_0.12_65)]">Início da jornada</p><h2 className="font-display mt-1 text-2xl font-bold">Comece quando puder recolher o coração</h2><p className="mt-2 text-sm text-muted-foreground">A tradição é vivida de 15 de agosto a 29 de setembro. Também é possível iniciar em qualquer data; a jornada terá 40 dias.</p><div className="mt-5 grid gap-3 sm:grid-cols-3"><Button variant="outline" onClick={() => chooseStart(`${new Date().getFullYear()}-08-15`)}>Iniciar na data tradicional</Button><Button onClick={() => chooseStart(today())}>Começar hoje</Button><label className="flex items-center gap-2 border border-border px-3 text-sm"><CalendarDays size={16} /><span className="sr-only">Selecionar outra data</span><Input type="date" min="2020-01-01" max="2100-12-31" onChange={event => event.target.value && chooseStart(event.target.value)} className="border-0 px-0 shadow-none" /></label></div></section> : <>
      <section className="grid gap-3 sm:grid-cols-2"><div className="border border-border bg-background p-4"><p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Período escolhido</p><p className="mt-1 text-sm">{formatDate(state.startDate)} a {formatDate(completionDate)}</p></div><PenanceCard text={state.penance || "Ainda não foi escolhida. Registre uma penitência para acompanhar sua jornada."} /></section>
      <JourneyProgress completed={state.completedDays.length} total={SAINT_MICHAEL_LENT.totalDays} streak={streak} />
      <JourneyCalendar completed={state.completedDays} selectedDay={state.selectedDay} onSelect={selectDay} />
      <section className="border border-border bg-background p-5"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Etapa 1 - Preparação</p><h2 className="font-display mt-1 text-2xl font-bold">Dia {state.selectedDay}{day ? `: ${day.theme}` : ""}</h2><p className="mt-1 text-sm text-muted-foreground">{formatDate(addDays(state.startDate, state.selectedDay - 1))}</p></div><div className="flex items-center gap-2"><Button variant="outline" size="icon" onClick={() => setFontSize(size => size === "text-sm" ? "text-lg" : size === "text-base" ? "text-sm" : "text-base")} aria-label="Ajustar tamanho da fonte">{fontSize === "text-lg" ? <Minus size={16} /> : <Plus size={16} />}</Button><Button onClick={() => document.getElementById("traditional-prayers")?.scrollIntoView({ behavior: "smooth" })}>Iniciar a oração</Button></div></div><p className="mt-4 text-sm text-muted-foreground">Prepare o ambiente, silencie as distrações e, quando possível, acenda uma vela benta.</p><label className="mt-4 block text-sm font-medium">Minha penitência<Input value={state.penance} onChange={event => update({ penance: event.target.value })} placeholder="Ex.: renunciar a uma satisfação e oferecer pela conversão dos pecadores" className="mt-2" /></label></section>
      {day ? <><DailyThemeCard day={day} /><ScriptureCard day={day} /></> : <section className="border border-border bg-background p-6 text-center"><h2 className="font-display text-2xl font-bold">Conteúdo em preparação</h2><p className="mt-2 text-sm text-muted-foreground">Os dias 3 a 40 serão publicados progressivamente. Os dois primeiros dias já estão completos.</p></section>}
      <div id="traditional-prayers"><TraditionalPrayerSection><PrayerReader prayers={SAINT_MICHAEL_TRADITIONAL_PRAYERS} fontSize={fontSize} onNext={markComplete} /><PrayerAudioPlayer /></TraditionalPrayerSection></div>
      {state.selectedDay === 40 && <section className="border border-[oklch(0.7_0.1_75/0.32)] bg-background p-5"><p className="text-xs font-bold uppercase tracking-wider text-[oklch(0.55_0.12_65)]">Consagração a São Miguel Arcanjo</p><p className="mt-3 whitespace-pre-line font-serif leading-relaxed">{SAINT_MICHAEL_CONSECRATION}</p></section>}
      {completed && <CompletionScreen completed={state.completedDays.length} total={SAINT_MICHAEL_LENT.totalDays} onFinish={() => toast.success("Seu progresso foi salvo automaticamente.")} onDepth={() => setShowDepth(true)} />}
      {showDepth && day && (isPremium ? <PremiumDepthSection day={day} journal={state.journals[day.number] ?? ""} onJournalSave={text => { update({ journals: { ...state.journals, [day.number]: text } }); toast.success("Anotação privada salva."); }} onJournalDelete={() => { const journals = { ...state.journals }; delete journals[day.number]; update({ journals }); toast.success("Anotação excluída."); }} /> : <><section className="border border-border bg-background p-6 text-center"><Flame className="mx-auto h-6 w-6 text-[oklch(0.65_0.12_70)]" /><h2 className="font-display mt-3 text-2xl font-bold">Você concluiu a oração tradicional de hoje.</h2><p className="mt-2 font-serif text-muted-foreground">Permaneça mais alguns minutos com Deus e aprofunde esta jornada espiritual.</p></section><SubscriptionOffer /></>)}
      <ReminderSettings value={state.reminderTime} onChange={reminderTime => { update({ reminderTime }); void scheduleSaintMichaelLentReminder(reminderTime); toast.success("Horário do lembrete salvo."); }} />
    </>}
  </main></div>;
}