import { useState, useEffect } from "react";
import {
  Check,
  Crown,
  Headphones,
  Heart,
  Lock,
  Pause,
  Play,
  Timer,
  BookOpen,
  Sparkles,
  ShieldCheck,
  Maximize2,
  Minimize2,
  RotateCcw,
  Volume2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { UpgradeDialog } from "@/components/UpgradeDialog";
import type { JourneyDay } from "@/data/saint-michael-lent";

export function JourneyHeader({ title, subtitle, image }: { title: string; subtitle: string; image: string }) {
  return (
    <header className="relative overflow-hidden rounded-xl border border-[oklch(0.7_0.1_75/0.28)] bg-[oklch(0.22_0.07_260)] text-white shadow-lg">
      <img src={image} alt="São Miguel Arcanjo" className="absolute inset-0 h-full w-full object-cover opacity-25" />
      <div className="relative p-6 sm:p-8">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-300 backdrop-blur-sm">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Jornada Espiritual • 40 Dias</span>
        </div>
        <h1 className="font-display mt-3 text-3xl font-bold sm:text-4xl tracking-tight">{title}</h1>
        <p className="mt-2 max-w-2xl font-serif text-sm sm:text-base text-slate-200 leading-relaxed">{subtitle}</p>
      </div>
    </header>
  );
}

export function JourneyProgress({ completed, total, streak }: { completed: number; total: number; streak: number }) {
  const percent = Math.round((completed / total) * 100);
  return (
    <section className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <span className="font-semibold text-foreground">
          {completed} de {total} dias concluídos ({percent}%)
        </span>
        <span className="inline-flex items-center gap-1 font-medium text-amber-600 dark:text-amber-400">
          <Sparkles className="h-4 w-4" />
          Sequência atual: {streak} {streak === 1 ? "dia" : "dias"}
        </span>
      </div>
      <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-gradient-to-r from-amber-600 to-amber-500 transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </section>
  );
}

export function JourneyCalendar({
  completed,
  selectedDay,
  onSelect,
}: {
  completed: number[];
  selectedDay: number;
  onSelect: (day: number) => void;
}) {
  return (
    <section aria-label="Calendário da jornada" className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Calendário da Jornada (40 Dias)</p>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Concluído</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[oklch(0.22_0.07_260)]" /> Selecionado</span>
        </div>
      </div>
      <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-1.5 sm:gap-2">
        {Array.from({ length: 40 }, (_, index) => index + 1).map((day) => {
          const isDone = completed.includes(day);
          const isSelected = day === selectedDay;
          return (
            <button
              key={day}
              onClick={() => onSelect(day)}
              className={`aspect-square rounded-lg text-xs font-semibold transition-all flex flex-col items-center justify-center ${
                isSelected
                  ? "bg-[oklch(0.22_0.07_260)] text-white shadow-md ring-2 ring-amber-400"
                  : isDone
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-200 hover:bg-emerald-200 dark:hover:bg-emerald-900"
                  : "bg-muted/70 text-muted-foreground hover:bg-muted"
              }`}
            >
              {isDone ? <Check className="h-4 w-4 stroke-[2.5]" /> : <span>{day}</span>}
            </button>
          );
        })}
      </div>
    </section>
  );
}

export function TraditionalPrayerSection({ children }: { children: React.ReactNode }) {
  return (
    <section className="rounded-xl overflow-hidden border border-amber-500/30 bg-card shadow-sm">
      <div className="border-b border-amber-500/20 bg-amber-50/70 dark:bg-amber-950/30 px-5 py-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
            <ShieldCheck className="h-4 w-4" /> Devoção Tradicional — acesso gratuito
          </span>
          <p className="mt-0.5 text-xs text-muted-foreground">Orações seculares preservadas integralmente para todos os fiéis.</p>
        </div>
      </div>
      {children}
    </section>
  );
}

export function PrayerReader({
  prayers,
  fontSize,
  onNext,
  onOpenDistractionFree,
}: {
  prayers: readonly { title: string; content: string }[];
  fontSize: string;
  onNext: () => void;
  onOpenDistractionFree: () => void;
}) {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex items-center justify-between gap-2 pb-2 border-b border-border text-xs text-muted-foreground">
        <span>Passo {activeStep + 1} de {prayers.length}: {prayers[activeStep].title}</span>
        <Button variant="outline" size="sm" onClick={onOpenDistractionFree} className="h-8 gap-1 text-xs">
          <Maximize2 className="h-3.5 w-3.5" /> Modo Sem Distrações
        </Button>
      </div>

      <Accordion
        type="single"
        collapsible
        value={`prayer-${activeStep}`}
        onValueChange={(val) => {
          if (val) {
            const idx = parseInt(val.replace("prayer-", ""), 10);
            if (!isNaN(idx)) setActiveStep(idx);
          }
        }}
        className="w-full"
      >
        {prayers.map((prayer, index) => (
          <AccordionItem key={prayer.title} value={`prayer-${index}`} className="border-border">
            <AccordionTrigger className="text-left font-display font-medium text-sm sm:text-base hover:no-underline py-3">
              <span className="flex items-center gap-2">
                <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                  index === activeStep ? "bg-amber-600 text-white" : "bg-muted text-muted-foreground"
                }`}>
                  {index + 1}
                </span>
                {prayer.title}
              </span>
            </AccordionTrigger>
            <AccordionContent className={`${fontSize} whitespace-pre-line font-serif leading-relaxed text-foreground bg-muted/20 p-4 rounded-lg border border-border/50`}>
              {prayer.content}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-border">
        <Button
          variant="outline"
          disabled={activeStep === 0}
          onClick={() => setActiveStep((prev) => Math.max(0, prev - 1))}
          className="w-full sm:w-auto text-xs"
        >
          Oração Anterior
        </Button>

        {activeStep < prayers.length - 1 ? (
          <Button
            onClick={() => setActiveStep((prev) => Math.min(prayers.length - 1, prev + 1))}
            className="w-full sm:w-auto bg-amber-700 hover:bg-amber-800 text-white font-medium"
          >
            Próxima Oração
          </Button>
        ) : (
          <Button onClick={onNext} className="w-full sm:w-auto bg-emerald-700 hover:bg-emerald-800 text-white font-semibold">
            Concluir Devoção Tradicional
          </Button>
        )}
      </div>
    </div>
  );
}

export function PrayerAudioPlayer() {
  const [playing, setPlaying] = useState(false);
  return (
    <div className="mx-4 sm:mx-6 mb-6 flex items-center justify-between rounded-lg border border-border bg-muted/40 p-3 text-xs sm:text-sm text-muted-foreground">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setPlaying(!playing)}
          aria-label="Reproduzir áudio da oração"
          className="h-8 w-8 rounded-full border-amber-600/40 text-amber-700 dark:text-amber-300"
        >
          {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        <div className="flex items-center gap-1.5 font-medium text-foreground">
          <Volume2 className="h-4 w-4 text-amber-600" />
          <span>Áudio da oração tradicional (Acompanhamento em áudio)</span>
        </div>
      </div>
      <span className="text-xs text-muted-foreground">Disponibilizado gratuitamente</span>
    </div>
  );
}

export function DailyThemeCard({ day }: { day: JourneyDay }) {
  return (
    <section className="rounded-xl border border-border bg-card p-5 sm:p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">Tema Espiritual do Dia {day.number}</p>
      <h2 className="font-display mt-1 text-2xl font-bold text-foreground sm:text-3xl">{day.theme}</h2>
    </section>
  );
}

export function ScriptureCard({ day }: { day: JourneyDay }) {
  return (
    <section className="rounded-xl border-l-4 border-amber-600 bg-amber-500/5 p-5 sm:p-6 space-y-3">
      <div className="flex items-center justify-between">
        <p className="font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-2">
          <BookOpen className="h-4 w-4" /> Palavra de Deus — {day.scripture.reference}
        </p>
      </div>
      <p className="font-serif text-base sm:text-lg italic leading-relaxed text-foreground">
        "{day.scripture.text}"
      </p>
      {day.scripture.explanation && (
        <div className="pt-2 border-t border-amber-600/20 text-xs sm:text-sm text-muted-foreground leading-relaxed">
          <strong className="text-foreground">Explicação Bíblica: </strong>
          {day.scripture.explanation}
        </div>
      )}
    </section>
  );
}

export function MeditationCard({ day }: { day: JourneyDay }) {
  const [playing, setPlaying] = useState(false);
  return (
    <section className="rounded-xl border border-border bg-card p-5 sm:p-6 space-y-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-display text-xl font-bold text-foreground">Meditação Escrita</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPlaying(!playing)}
          className="gap-2 text-xs border-amber-600/30 text-amber-700 dark:text-amber-300"
        >
          {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          <Headphones className="h-3.5 w-3.5" />
          <span>{playing ? "Pausar Narração" : "Ouvir Meditação Narrada"}</span>
        </Button>
      </div>
      <p className="font-serif leading-relaxed text-muted-foreground text-sm sm:text-base whitespace-pre-line">
        {day.meditation}
      </p>
    </section>
  );
}

export function VirtueCard({ day }: { day: JourneyDay }) {
  return (
    <section className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Virtude do Dia</p>
      <p className="mt-1 font-display text-xl font-bold text-amber-700 dark:text-amber-400">{day.virtue}</p>
    </section>
  );
}

export function DailyPurposeCard({ day }: { day: JourneyDay }) {
  return (
    <section className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Propósito Concreto</p>
      <p className="mt-1 text-sm leading-relaxed font-medium text-foreground">{day.purpose}</p>
    </section>
  );
}

export function PenanceCard({ text }: { text: string }) {
  return (
    <section className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Sugestão de Penitência</p>
      <p className="mt-1 text-sm leading-relaxed text-foreground">{text}</p>
    </section>
  );
}

export function SpiritualExerciseCard({ text }: { text: string }) {
  return (
    <section className="rounded-xl border border-amber-600/20 bg-amber-50/50 dark:bg-amber-950/20 p-4 sm:p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
        <Sparkles className="h-3.5 w-3.5" /> Exercício Espiritual
      </p>
      <p className="mt-1 text-sm leading-relaxed text-foreground font-serif">{text}</p>
    </section>
  );
}

export function ExaminationOfConscience({ questions }: { questions: string[] }) {
  return (
    <section className="rounded-xl border border-border bg-card p-5 sm:p-6 shadow-sm">
      <h3 className="font-display text-xl font-bold text-foreground">Exame de Consciência</h3>
      <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
        {questions.map((question) => (
          <li key={question} className="flex items-start gap-2">
            <span className="text-amber-600 font-bold">•</span>
            <span>{question}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function SpiritualJournal({
  value,
  onSave,
  onDelete,
}: {
  value: string;
  onSave: (value: string) => void;
  onDelete: () => void;
}) {
  const [text, setText] = useState(value);
  useEffect(() => setText(value), [value]);

  return (
    <section className="rounded-xl border border-border bg-card p-5 sm:p-6 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-xl font-bold text-foreground">Diário Espiritual</h3>
        <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground font-medium">
          Privado
        </span>
      </div>
      <p className="text-xs text-muted-foreground">
        Guarde aqui o que o Senhor suscitou em seu coração nesta oração. Suas anotações são inteiramente privadas.
      </p>
      <Textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Escreva suas reflexões, inspirações e propósitos de hoje..."
        className="min-h-32 font-serif text-sm"
      />
      <div className="flex items-center gap-2 pt-1">
        <Button onClick={() => onSave(text)} size="sm" className="bg-amber-700 hover:bg-amber-800 text-white">
          Salvar Anotação
        </Button>
        {value && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setText("");
              onDelete();
            }}
            className="text-xs text-red-600 hover:text-red-700 dark:text-red-400"
          >
            Excluir
          </Button>
        )}
      </div>
    </section>
  );
}

export function SilenceTimer() {
  const [seconds, setSeconds] = useState<number | null>(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && seconds !== null && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((sec) => (sec !== null && sec > 0 ? sec - 1 : 0));
      }, 1000);
    } else if (seconds === 0) {
      setIsActive(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, seconds]);

  const startTimer = (mins: number) => {
    setSeconds(mins * 60);
    setIsActive(true);
  };

  const resetTimer = () => {
    setSeconds(null);
    setIsActive(false);
  };

  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="rounded-xl border border-amber-600/30 bg-amber-500/10 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="rounded-full bg-amber-600/20 p-2.5 text-amber-700 dark:text-amber-300">
          <Timer className="h-5 w-5" />
        </div>
        <div>
          <p className="font-semibold text-sm text-foreground">Cronômetro de Silêncio Contemplativo</p>
          <p className="text-xs text-muted-foreground">Permaneça em recolhimento e oração silenciosa com Deus.</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {seconds !== null ? (
          <div className="flex items-center gap-3">
            <span className="font-mono text-xl font-bold text-amber-700 dark:text-amber-300">{formatTime(seconds)}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsActive(!isActive)}
              className="text-xs"
            >
              {isActive ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            </Button>
            <Button variant="ghost" size="sm" onClick={resetTimer} className="text-xs">
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <Button variant="outline" size="sm" onClick={() => startTimer(1)} className="text-xs h-8">
              1 min
            </Button>
            <Button variant="outline" size="sm" onClick={() => startTimer(3)} className="text-xs h-8">
              3 min
            </Button>
            <Button variant="outline" size="sm" onClick={() => startTimer(5)} className="text-xs h-8">
              5 min
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export function PremiumDepthSection({
  day,
  journal,
  onJournalSave,
  onJournalDelete,
}: {
  day: JourneyDay;
  journal: string;
  onJournalSave: (value: string) => void;
  onJournalDelete: () => void;
}) {
  const [favorite, setFavorite] = useState(false);

  return (
    <section className="space-y-6 rounded-xl border border-amber-500/40 bg-card p-5 sm:p-7 shadow-md">
      <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
        <div>
          <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            <Crown className="h-4 w-4" /> Aprofundamento Espiritual — Sanctificare Premium
          </span>
          <h2 className="font-display mt-1 text-2xl font-bold text-foreground">
            Dia {day.number}: {day.theme}
          </h2>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setFavorite(!favorite)}
          aria-label="Favoritar conteúdo"
          className="text-muted-foreground hover:text-red-500"
        >
          <Heart className={favorite ? "fill-red-500 text-red-500" : ""} size={20} />
        </Button>
      </div>

      <ScriptureCard day={day} />

      <MeditationCard day={day} />

      <div className="grid gap-4 sm:grid-cols-2">
        <VirtueCard day={day} />
        <DailyPurposeCard day={day} />
      </div>

      <PenanceCard text={day.suggestedPenance} />

      {day.spiritualExercise && <SpiritualExerciseCard text={day.spiritualExercise} />}

      <ExaminationOfConscience questions={day.examination} />

      <SpiritualJournal value={journal} onSave={onJournalSave} onDelete={onJournalDelete} />

      <section className="rounded-xl border border-border bg-muted/30 p-5 space-y-3">
        <h3 className="font-display text-xl font-bold text-foreground">Oração Final Complementar</h3>
        <p className="whitespace-pre-line font-serif leading-relaxed text-muted-foreground text-sm sm:text-base">
          {day.complementaryPrayer}
        </p>
        <p className="mt-3 text-xs sm:text-sm italic text-amber-700 dark:text-amber-300 font-serif border-t border-border/50 pt-2">
          {day.saintQuote}
        </p>
      </section>

      <SilenceTimer />
    </section>
  );
}

export function CompletionScreen({
  completed,
  total,
  onFinish,
  onDepth,
}: {
  completed: number;
  total: number;
  onFinish: () => void;
  onDepth: () => void;
}) {
  return (
    <section className="rounded-xl border border-emerald-400 bg-emerald-50/80 dark:border-emerald-800 dark:bg-emerald-950/40 p-6 sm:p-8 text-center shadow-sm">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300">
        <Check className="h-6 w-6 stroke-[3]" />
      </div>
      <h2 className="font-display mt-3 text-2xl font-bold text-emerald-900 dark:text-emerald-100">
        Dia Concluído
      </h2>
      <p className="mt-1 text-sm font-medium text-emerald-800 dark:text-emerald-300">
        A devoção tradicional foi realizada integralmente.
      </p>
      <p className="mt-2 text-xs text-muted-foreground">
        Progresso total na jornada: <strong className="text-foreground">{completed} de {total} dias</strong>
      </p>

      <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
        <Button onClick={onFinish} className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold">
          Finalizar por Hoje
        </Button>
        <Button
          variant="outline"
          onClick={onDepth}
          className="border-amber-600/40 text-amber-800 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/50 font-medium"
        >
          <Crown className="mr-2 h-4 w-4 text-amber-600" />
          Aprofundar a Oração de Hoje
        </Button>
      </div>
    </section>
  );
}

export function ReminderSettings({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <label className="flex items-center justify-between rounded-xl border border-border bg-card p-4 text-sm shadow-sm">
      <div>
        <span className="block font-semibold text-foreground">Lembrete Diário de Oração</span>
        <span className="text-xs text-muted-foreground">Receba uma notificação no horário de sua preferência.</span>
      </div>
      <input
        type="time"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-md border border-border bg-background px-3 py-1 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
      />
    </label>
  );
}

export function SubscriptionOffer() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <section className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-6 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-semibold text-sm">
          <Crown className="h-5 w-5" />
          <span>Sanctificare Premium</span>
        </div>
        <h3 className="font-display text-xl font-bold text-foreground">
          Aprofunde esta experiência com o Sanctificare Premium
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          A devoção tradicional permanece gratuita para todos os fiéis. O Premium oferece meditações diárias, áudios contemplativos, exercícios de virtude e exames de consciência para quem deseja trilhar uma caminhada de aprofundamento.
        </p>
        <Button
          variant="outline"
          onClick={() => setOpen(true)}
          className="mt-2 border-amber-600/40 text-amber-800 dark:text-amber-300 hover:bg-amber-500/10 font-medium"
        >
          <Lock className="mr-2 h-4 w-4 text-amber-600" />
          Conhecer o Aprofundamento Espiritual
        </Button>
      </section>

      <UpgradeDialog
        open={open}
        onOpenChange={setOpen}
        description="Continue com meditações, áudios e exercícios espirituais da Quaresma de São Miguel Arcanjo."
      />
    </>
  );
}

export function DistractionFreeModal({
  open,
  onOpenChange,
  prayers,
  fontSize,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prayers: readonly { title: string; content: string }[];
  fontSize: string;
}) {
  const [index, setIndex] = useState(0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-6 overflow-hidden bg-background text-foreground border-amber-500/30">
        <DialogHeader className="flex flex-row items-center justify-between border-b border-border pb-3">
          <div>
            <span className="text-xs uppercase font-semibold text-amber-600 tracking-wider">Modo de Leitura Sem Distrações</span>
            <DialogTitle className="font-display text-lg font-bold">
              {index + 1}. {prayers[index]?.title}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-6 px-2 sm:px-4">
          <p className={`${fontSize} whitespace-pre-line font-serif leading-relaxed text-foreground max-w-2xl mx-auto`}>
            {prayers[index]?.content}
          </p>
        </div>

        <div className="flex items-center justify-between border-t border-border pt-4 text-xs">
          <Button
            variant="outline"
            disabled={index === 0}
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
          >
            Anterior
          </Button>
          <span className="text-muted-foreground font-medium">
            {index + 1} de {prayers.length}
          </span>
          <Button
            disabled={index === prayers.length - 1}
            onClick={() => setIndex((i) => Math.min(prayers.length - 1, i + 1))}
            className="bg-amber-700 hover:bg-amber-800 text-white"
          >
            Próxima Oração
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}