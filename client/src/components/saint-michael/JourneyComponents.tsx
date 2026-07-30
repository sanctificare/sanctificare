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
  RotateCcw,
  Volume2,
  Cross,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { UpgradeDialog } from "@/components/UpgradeDialog";
import type { JourneyDay } from "@/data/saint-michael-lent";

/* Helper to convert numbers to Roman numerals for Option B classical manuscript feel */
function toRoman(num: number): string {
  const lookup: Record<string, number> = {
    M: 1000,
    CM: 900,
    D: 500,
    CD: 400,
    C: 100,
    XC: 90,
    L: 50,
    XL: 40,
    X: 10,
    IX: 9,
    V: 5,
    IV: 4,
    I: 1,
  };
  let roman = "";
  for (const i in lookup) {
    while (num >= lookup[i]) {
      roman += i;
      num -= lookup[i];
    }
  }
  return roman;
}

export function JourneyHeader({ title, subtitle, image }: { title: string; subtitle: string; image: string }) {
  return (
    <header className="relative overflow-hidden rounded-2xl border-2 border-[#D4AF37]/50 bg-[#2A0808] text-[#FDFBF7] shadow-xl">
      {/* Background Sacred Art with subtle gold gradient overlay */}
      <img src={image} alt="São Miguel Arcanjo" className="absolute inset-0 h-full w-full object-cover opacity-30 mix-blend-luminosity" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#1C0505] via-[#2A0808]/70 to-transparent" />
      
      <div className="relative p-6 sm:p-9 space-y-3 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/40 bg-[#1C0505]/80 px-3.5 py-1 text-xs font-serif font-semibold tracking-wider text-[#E5C158] backdrop-blur-md shadow-sm">
          <Cross className="h-3.5 w-3.5 text-[#D4AF37]" />
          <span>Devocional Católico • Jornada de 40 Dias</span>
          <span className="text-[#D4AF37]">✦</span>
        </div>
        <h1 className="font-serif mt-2 text-3xl sm:text-5xl font-bold tracking-tight text-[#FDFBF7] drop-shadow-md">
          {title}
        </h1>
        <p className="max-w-2xl font-serif text-sm sm:text-base text-[#E6DCC5] leading-relaxed italic">
          "{subtitle}"
        </p>
      </div>
      
      {/* Decorative Gold Leaf Bottom Border */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#D4AF37]/20 via-[#D4AF37] to-[#D4AF37]/20" />
    </header>
  );
}

export function JourneyProgress({ completed, total, streak }: { completed: number; total: number; streak: number }) {
  const percent = Math.round((completed / total) * 100);
  return (
    <section className="rounded-xl border border-[#D4AF37]/40 bg-[#FAF7EE] dark:bg-[#1A1814] p-5 shadow-sm space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm font-serif">
        <span className="font-bold text-[#7A0C0C] dark:text-[#E5C158] text-base">
          {completed} de {total} dias concluídos ({percent}%)
        </span>
        <span className="inline-flex items-center gap-1.5 font-semibold text-[#8B0000] dark:text-[#D4AF37]">
          <Sparkles className="h-4 w-4 text-[#D4AF37]" />
          Sequência ininterrupta: {streak} {streak === 1 ? "dia" : "dias"}
        </span>
      </div>
      <div className="mt-2 h-3 w-full overflow-hidden rounded-full border border-[#D4AF37]/30 bg-[#EFE8D6] dark:bg-[#28241D] p-0.5">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#8B0000] via-[#A81818] to-[#D4AF37] transition-all duration-500 shadow-inner"
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
    <section aria-label="Calendário da jornada" className="rounded-xl border border-[#D4AF37]/40 bg-[#FAF7EE] dark:bg-[#1A1814] p-5 shadow-sm space-y-3">
      <div className="flex items-center justify-between border-b border-[#D4AF37]/20 pb-2">
        <p className="text-xs font-serif font-bold uppercase tracking-widest text-[#7A0C0C] dark:text-[#E5C158] flex items-center gap-1.5">
          <span>✦</span> Calendário da Quaresma (40 Dias)
        </p>
        <div className="flex items-center gap-4 text-xs font-serif text-muted-foreground">
          <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-[#1B5E20]" /> Concluído</span>
          <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-[#7A0C0C]" /> Selecionado</span>
        </div>
      </div>

      <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2 pt-1">
        {Array.from({ length: 40 }, (_, index) => index + 1).map((day) => {
          const isDone = completed.includes(day);
          const isSelected = day === selectedDay;
          return (
            <button
              key={day}
              onClick={() => onSelect(day)}
              className={`aspect-square rounded-lg font-serif text-xs font-bold transition-all flex flex-col items-center justify-center border ${
                isSelected
                  ? "bg-[#7A0C0C] text-[#FDFBF7] border-[#D4AF37] shadow-md ring-2 ring-[#D4AF37]/50 scale-105"
                  : isDone
                  ? "bg-[#E8F5E9] text-[#1B5E20] border-[#A5D6A7] dark:bg-[#1B5E20]/30 dark:text-[#81C784] dark:border-[#2E7D32]"
                  : "bg-[#F3EDDC] text-[#5C503D] border-[#E2D8C3] dark:bg-[#242019] dark:text-[#A0927C] dark:border-[#383126] hover:bg-[#EAE0C8]"
              }`}
            >
              {isDone ? <Check className="h-4 w-4 stroke-[3]" /> : <span>{day}</span>}
            </button>
          );
        })}
      </div>
    </section>
  );
}

export function TraditionalPrayerSection({ children }: { children: React.ReactNode }) {
  return (
    <section className="rounded-xl overflow-hidden border-2 border-[#D4AF37]/50 bg-[#FAF7EE] dark:bg-[#1A1814] shadow-md">
      {/* Option B Gold & Burgundy Header Banner */}
      <div className="border-b border-[#D4AF37]/30 bg-gradient-to-r from-[#7A0C0C] via-[#8B0000] to-[#7A0C0C] px-5 py-4 text-[#FDFBF7] flex flex-wrap items-center justify-between gap-2 shadow-sm">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-serif font-bold uppercase tracking-widest text-[#E5C158]">
            <ShieldCheck className="h-4 w-4 text-[#D4AF37]" /> Devoção Tradicional — Acesso Gratuito
          </span>
          <p className="mt-0.5 text-xs font-serif text-[#E6DCC5]">Orações históricas mantidas integralmente sem alterações.</p>
        </div>
        <span className="text-[#D4AF37] font-serif text-lg">✦</span>
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
    <div className="p-5 sm:p-7 space-y-5">
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#D4AF37]/20 text-xs font-serif text-[#7A0C0C] dark:text-[#E5C158]">
        <span className="font-bold">Passo {activeStep + 1} de {prayers.length}: {prayers[activeStep].title}</span>
        <Button
          variant="outline"
          size="sm"
          onClick={onOpenDistractionFree}
          className="h-8 gap-1.5 font-serif text-xs border-[#D4AF37]/40 text-[#7A0C0C] dark:text-[#E5C158] bg-[#F3EDDC]/60 hover:bg-[#EAE0C8]"
        >
          <Maximize2 className="h-3.5 w-3.5" /> Leitura Sem Distrações
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
        className="w-full space-y-3"
      >
        {prayers.map((prayer, index) => (
          <AccordionItem
            key={prayer.title}
            value={`prayer-${index}`}
            className="rounded-lg border border-[#D4AF37]/30 bg-[#F5EFE0]/60 dark:bg-[#221E18] px-4 shadow-2xs overflow-hidden"
          >
            <AccordionTrigger className="text-left font-serif font-bold text-sm sm:text-base hover:no-underline py-3.5 text-[#7A0C0C] dark:text-[#E5C158]">
              <span className="flex items-center gap-3">
                <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-serif font-bold border ${
                  index === activeStep
                    ? "bg-[#7A0C0C] text-[#FDFBF7] border-[#D4AF37]"
                    : "bg-[#E8DFC8] text-[#5C503D] border-[#D4AF37]/30 dark:bg-[#2D271F] dark:text-[#A0927C]"
                }`}>
                  {toRoman(index + 1)}
                </span>
                {prayer.title}
              </span>
            </AccordionTrigger>
            <AccordionContent className={`${fontSize} whitespace-pre-line font-serif leading-relaxed text-[#2C251A] dark:text-[#E6DCC5] bg-[#FAF7EE] dark:bg-[#1A1814] p-5 rounded-md border border-[#D4AF37]/20 my-2 shadow-inner`}>
              {prayer.content}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[#D4AF37]/20">
        <Button
          variant="outline"
          disabled={activeStep === 0}
          onClick={() => setActiveStep((prev) => Math.max(0, prev - 1))}
          className="w-full sm:w-auto font-serif text-xs border-[#D4AF37]/40 text-[#5C503D] dark:text-[#A0927C]"
        >
          Oração Anterior
        </Button>

        {activeStep < prayers.length - 1 ? (
          <Button
            onClick={() => setActiveStep((prev) => Math.min(prayers.length - 1, prev + 1))}
            className="w-full sm:w-auto font-serif bg-[#7A0C0C] hover:bg-[#600909] text-[#FDFBF7] font-bold shadow-md border border-[#D4AF37]/40"
          >
            Próxima Oração
          </Button>
        ) : (
          <Button
            onClick={onNext}
            className="w-full sm:w-auto font-serif bg-[#1B5E20] hover:bg-[#144718] text-[#FDFBF7] font-bold shadow-md border border-[#81C784]/40"
          >
            Concluir Devoção Tradicional
          </Button>
        )}
      </div>
    </div>
  );
}

/* Option B Cathedral Style Built-In Audio Player */
export function PrayerAudioPlayer({ title = "Áudio da Oração Tradicional de São Miguel Arcanjo" }: { title?: string }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState<"1x" | "1.25x" | "1.5x">("1x");
  const [mode, setMode] = useState<"narrada" | "silencio">("narrada");

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (playing) {
      timer = setInterval(() => {
        setProgress((prev) => (prev >= 100 ? 0 : prev + 1));
      }, 300);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [playing]);

  const toggleSpeed = () => {
    setSpeed((s) => (s === "1x" ? "1.25x" : s === "1.25x" ? "1.5x" : "1x"));
  };

  const formatTime = (percentage: number) => {
    const totalSecs = 225; // 3:45 total
    const currentSecs = Math.floor((percentage / 100) * totalSecs);
    const mins = Math.floor(currentSecs / 60);
    const secs = currentSecs % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="mx-4 sm:mx-6 mb-6 rounded-xl border-2 border-[#D4AF37]/40 bg-[#F3EDDC] dark:bg-[#1E1B15] p-5 shadow-md space-y-3">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#D4AF37]/20 pb-3">
        <div className="flex items-center gap-3">
          <Button
            size="icon"
            onClick={() => setPlaying(!playing)}
            aria-label="Reproduzir áudio da oração"
            className="h-11 w-11 rounded-full bg-[#7A0C0C] hover:bg-[#600909] text-[#FDFBF7] border-2 border-[#D4AF37] shadow-md transition-transform active:scale-95 shrink-0"
          >
            {playing ? <Pause className="h-5 w-5 fill-[#FDFBF7]" /> : <Play className="h-5 w-5 fill-[#FDFBF7] ml-0.5" />}
          </Button>

          <div>
            <div className="flex items-center gap-1.5 text-xs font-serif font-bold uppercase tracking-widest text-[#7A0C0C] dark:text-[#E5C158]">
              <Volume2 className="h-4 w-4 text-[#D4AF37]" />
              <span>Player Católico — Acompanhamento em Áudio</span>
            </div>
            <p className="text-xs sm:text-sm font-serif font-bold text-[#2C251A] dark:text-[#E6DCC5] line-clamp-1 mt-0.5">
              {title}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          {/* Mode Selector Toggle: Voz Narrada vs Silêncio Contemplativo */}
          <div className="flex items-center rounded-lg border border-[#D4AF37]/30 bg-[#E8DFC8] dark:bg-[#28241D] p-0.5 text-xs font-serif">
            <button
              onClick={() => setMode("narrada")}
              className={`px-2.5 py-1 rounded-md transition-all ${
                mode === "narrada"
                  ? "bg-[#7A0C0C] text-[#FDFBF7] font-bold shadow-2xs"
                  : "text-[#5C503D] dark:text-[#A0927C]"
              }`}
            >
              Voz Narrada
            </button>
            <button
              onClick={() => setMode("silencio")}
              className={`px-2.5 py-1 rounded-md transition-all ${
                mode === "silencio"
                  ? "bg-[#7A0C0C] text-[#FDFBF7] font-bold shadow-2xs"
                  : "text-[#5C503D] dark:text-[#A0927C]"
              }`}
            >
              Silêncio
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={toggleSpeed}
            className="h-8 px-2.5 font-mono text-xs border-[#D4AF37]/40 text-[#7A0C0C] dark:text-[#E5C158] bg-[#E8DFC8]/50"
          >
            {speed}
          </Button>
        </div>
      </div>

      <div className="space-y-1">
        <div className="relative h-2.5 w-full overflow-hidden rounded-full border border-[#D4AF37]/30 bg-[#E8DFC8] dark:bg-[#2A251D] cursor-pointer">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#7A0C0C] to-[#D4AF37] transition-all duration-150"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-[11px] font-mono text-[#5C503D] dark:text-[#A0927C]">
          <span>{formatTime(progress)}</span>
          <span>3:45</span>
        </div>
      </div>
    </div>
  );
}

export function DailyThemeCard({ day }: { day: JourneyDay }) {
  return (
    <section className="rounded-xl border border-[#D4AF37]/40 bg-[#FAF7EE] dark:bg-[#1A1814] p-5 sm:p-7 shadow-sm text-center sm:text-left space-y-1">
      <p className="text-xs font-serif font-bold uppercase tracking-widest text-[#7A0C0C] dark:text-[#E5C158] flex items-center justify-center sm:justify-start gap-1">
        <span>✦</span> Tema Espiritual do Dia {day.number}
      </p>
      <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2C251A] dark:text-[#FDFBF7]">
        {day.theme}
      </h2>
    </section>
  );
}

export function ScriptureCard({ day }: { day: JourneyDay }) {
  return (
    <section className="rounded-xl border-l-4 border-[#7A0C0C] border-y border-r border-[#D4AF37]/30 bg-[#F5EFE0]/80 dark:bg-[#221E18] p-5 sm:p-7 space-y-3 shadow-2xs">
      <div className="flex items-center justify-between border-b border-[#D4AF37]/20 pb-2">
        <p className="font-serif font-bold text-[#7A0C0C] dark:text-[#E5C158] flex items-center gap-2 text-sm sm:text-base">
          <BookOpen className="h-4 w-4 text-[#D4AF37]" /> Sagrada Escritura — {day.scripture.reference}
        </p>
      </div>
      <p className="font-serif text-base sm:text-xl italic leading-relaxed text-[#2C251A] dark:text-[#E6DCC5]">
        "{day.scripture.text}"
      </p>
      {day.scripture.explanation && (
        <div className="pt-2 border-t border-[#D4AF37]/20 text-xs sm:text-sm font-serif text-[#5C503D] dark:text-[#A0927C] leading-relaxed">
          <strong className="text-[#7A0C0C] dark:text-[#E5C158]">Exegese & Meditação Bíblica: </strong>
          {day.scripture.explanation}
        </div>
      )}
    </section>
  );
}

export function MeditationCard({ day }: { day: JourneyDay }) {
  const [playing, setPlaying] = useState(false);
  return (
    <section className="rounded-xl border border-[#D4AF37]/40 bg-[#FAF7EE] dark:bg-[#1A1814] p-5 sm:p-7 space-y-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#D4AF37]/20 pb-3">
        <h3 className="font-serif text-xl font-bold text-[#7A0C0C] dark:text-[#E5C158]">Meditação Teológica</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPlaying(!playing)}
          className="gap-2 font-serif text-xs border-[#D4AF37]/40 text-[#7A0C0C] dark:text-[#E5C158] bg-[#F3EDDC]"
        >
          {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          <Headphones className="h-3.5 w-3.5" />
          <span>{playing ? "Pausar Meditação Narrada" : "Ouvir Meditação Narrada"}</span>
        </Button>
      </div>
      <p className="font-serif leading-relaxed text-[#2C251A] dark:text-[#E6DCC5] text-base sm:text-lg whitespace-pre-line">
        {day.meditation}
      </p>
    </section>
  );
}

export function VirtueCard({ day }: { day: JourneyDay }) {
  return (
    <section className="rounded-xl border border-[#D4AF37]/40 bg-[#FAF7EE] dark:bg-[#1A1814] p-5 shadow-sm space-y-1">
      <p className="text-xs font-serif font-bold uppercase tracking-widest text-[#7A0C0C] dark:text-[#E5C158]">Virtude a Cultivar</p>
      <p className="font-serif text-2xl font-bold text-[#8B0000] dark:text-[#D4AF37]">{day.virtue}</p>
    </section>
  );
}

export function DailyPurposeCard({ day }: { day: JourneyDay }) {
  return (
    <section className="rounded-xl border border-[#D4AF37]/40 bg-[#FAF7EE] dark:bg-[#1A1814] p-5 shadow-sm space-y-1">
      <p className="text-xs font-serif font-bold uppercase tracking-widest text-[#7A0C0C] dark:text-[#E5C158]">Propósito Prático Concreto</p>
      <p className="font-serif text-base font-semibold leading-relaxed text-[#2C251A] dark:text-[#E6DCC5]">{day.purpose}</p>
    </section>
  );
}

export function PenanceCard({ text }: { text: string }) {
  return (
    <section className="rounded-xl border border-[#D4AF37]/40 bg-[#FAF7EE] dark:bg-[#1A1814] p-5 shadow-sm space-y-1">
      <p className="text-xs font-serif font-bold uppercase tracking-widest text-[#7A0C0C] dark:text-[#E5C158]">Sugestão de Mortificação & Penitência</p>
      <p className="font-serif text-sm sm:text-base leading-relaxed text-[#2C251A] dark:text-[#E6DCC5]">{text}</p>
    </section>
  );
}

export function SpiritualExerciseCard({ text }: { text: string }) {
  return (
    <section className="rounded-xl border border-[#D4AF37]/40 bg-[#F5EFE0]/80 dark:bg-[#221E18] p-5 shadow-sm space-y-1">
      <p className="text-xs font-serif font-bold uppercase tracking-widest text-[#7A0C0C] dark:text-[#E5C158] flex items-center gap-1.5">
        <Sparkles className="h-3.5 w-3.5 text-[#D4AF37]" /> Exercício de Recolhimento Espiritual
      </p>
      <p className="font-serif text-sm sm:text-base leading-relaxed text-[#2C251A] dark:text-[#E6DCC5] italic">{text}</p>
    </section>
  );
}

export function ExaminationOfConscience({ questions }: { questions: string[] }) {
  return (
    <section className="rounded-xl border border-[#D4AF37]/40 bg-[#FAF7EE] dark:bg-[#1A1814] p-5 sm:p-7 shadow-sm space-y-3">
      <h3 className="font-serif text-xl font-bold text-[#7A0C0C] dark:text-[#E5C158] border-b border-[#D4AF37]/20 pb-2">
        Exame de Consciência Diário
      </h3>
      <ul className="space-y-2.5 font-serif text-sm sm:text-base text-[#2C251A] dark:text-[#E6DCC5]">
        {questions.map((question) => (
          <li key={question} className="flex items-start gap-2.5">
            <span className="text-[#D4AF37] font-bold">✦</span>
            <span>{question}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* Option B Leather Notebook Styled Spiritual Journal */
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
    <section className="rounded-xl border-2 border-[#D4AF37]/40 bg-[#F3EDDC] dark:bg-[#1C1813] p-5 sm:p-7 shadow-md space-y-3">
      <div className="flex items-center justify-between border-b border-[#D4AF37]/30 pb-3">
        <h3 className="font-serif text-xl font-bold text-[#7A0C0C] dark:text-[#E5C158] flex items-center gap-2">
          <span>⚜</span> Diário Espiritual Pessoal
        </h3>
        <span className="rounded-full border border-[#D4AF37]/40 bg-[#E8DFC8] dark:bg-[#28241D] px-3 py-0.5 font-serif text-xs text-[#5C503D] dark:text-[#A0927C] font-bold">
          Estritamente Privado
        </span>
      </div>
      <p className="text-xs font-serif text-[#5C503D] dark:text-[#A0927C]">
        Anote as graças, moções e desígnios que o Espírito Santo soprou em sua alma durante a oração.
      </p>
      <Textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Escreva aqui suas reflexões mais íntimas..."
        className="min-h-36 font-serif text-base border-[#D4AF37]/30 bg-[#FAF7EE] dark:bg-[#14120F] text-[#2C251A] dark:text-[#E6DCC5] shadow-inner focus:ring-2 focus:ring-[#D4AF37]"
      />
      <div className="flex items-center gap-3 pt-1">
        <Button onClick={() => onSave(text)} size="sm" className="font-serif bg-[#7A0C0C] hover:bg-[#600909] text-[#FDFBF7] font-bold shadow-sm">
          Salvar Anotação no Diário
        </Button>
        {value && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setText("");
              onDelete();
            }}
            className="font-serif text-xs border-[#D4AF37]/40 text-red-700 dark:text-red-400"
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
    <div className="rounded-xl border border-[#D4AF37]/40 bg-[#F5EFE0] dark:bg-[#1E1B15] p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="rounded-full border border-[#D4AF37] bg-[#7A0C0C] p-2.5 text-[#FDFBF7]">
          <Timer className="h-5 w-5" />
        </div>
        <div>
          <p className="font-serif font-bold text-sm text-[#7A0C0C] dark:text-[#E5C158]">Cronômetro de Silêncio Contemplativo</p>
          <p className="text-xs font-serif text-[#5C503D] dark:text-[#A0927C]">Permaneça em recolhimento silencioso na presença do Senhor.</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {seconds !== null ? (
          <div className="flex items-center gap-3">
            <span className="font-mono text-xl font-bold text-[#7A0C0C] dark:text-[#E5C158]">{formatTime(seconds)}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsActive(!isActive)}
              className="text-xs border-[#D4AF37]/40"
            >
              {isActive ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            </Button>
            <Button variant="ghost" size="sm" onClick={resetTimer} className="text-xs">
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2 font-serif">
            <Button variant="outline" size="sm" onClick={() => startTimer(1)} className="text-xs border-[#D4AF37]/40 bg-[#FAF7EE]">
              1 min
            </Button>
            <Button variant="outline" size="sm" onClick={() => startTimer(3)} className="text-xs border-[#D4AF37]/40 bg-[#FAF7EE]">
              3 min
            </Button>
            <Button variant="outline" size="sm" onClick={() => startTimer(5)} className="text-xs border-[#D4AF37]/40 bg-[#FAF7EE]">
              5 min
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

/* Option B High-End Gold Parchment Premium Section */
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
    <section className="space-y-6 rounded-2xl border-2 border-[#D4AF37] bg-[#FAF7EE] dark:bg-[#161411] p-6 sm:p-8 shadow-xl">
      <div className="flex items-start justify-between gap-4 border-b border-[#D4AF37]/30 pb-4">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-serif font-bold uppercase tracking-widest text-[#7A0C0C] dark:text-[#E5C158]">
            <Crown className="h-4 w-4 text-[#D4AF37]" /> Aprofundamento Espiritual — Sanctificare Premium
          </span>
          <h2 className="font-serif mt-1.5 text-2xl sm:text-3xl font-bold text-[#2C251A] dark:text-[#FDFBF7]">
            Dia {day.number}: {day.theme}
          </h2>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setFavorite(!favorite)}
          aria-label="Favoritar conteúdo"
          className="text-[#5C503D] hover:text-red-600"
        >
          <Heart className={favorite ? "fill-red-600 text-red-600" : ""} size={22} />
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

      {/* Illuminated Saint Quote & Complementary Prayer Card */}
      <section className="rounded-xl border border-[#D4AF37]/50 bg-[#F3EDDC] dark:bg-[#1E1A14] p-6 space-y-4 shadow-sm">
        <h3 className="font-serif text-xl font-bold text-[#7A0C0C] dark:text-[#E5C158] border-b border-[#D4AF37]/20 pb-2">
          Oração Final Complementar
        </h3>
        <p className="whitespace-pre-line font-serif leading-relaxed text-[#2C251A] dark:text-[#E6DCC5] text-base sm:text-lg">
          {day.complementaryPrayer}
        </p>
        <div className="mt-4 pt-3 border-t border-[#D4AF37]/30 text-sm font-serif italic text-[#7A0C0C] dark:text-[#E5C158]">
          ✦ {day.saintQuote}
        </div>
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
    <section className="rounded-2xl border-2 border-[#A5D6A7] bg-[#E8F5E9] dark:border-[#2E7D32] dark:bg-[#142916] p-7 text-center shadow-md space-y-3">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#1B5E20] text-[#FDFBF7] border-2 border-[#A5D6A7] shadow-sm">
        <Check className="h-7 w-7 stroke-[3]" />
      </div>
      <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1B5E20] dark:text-[#A5D6A7]">
        Dia Concluído
      </h2>
      <p className="font-serif text-base font-semibold text-[#2E7D32] dark:text-[#C8E6C9]">
        A devoção tradicional foi realizada integralmente.
      </p>
      <p className="font-serif text-xs text-muted-foreground">
        Progresso total na jornada: <strong className="text-foreground">{completed} de {total} dias</strong>
      </p>

      <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
        <Button onClick={onFinish} className="font-serif bg-[#1B5E20] hover:bg-[#144718] text-[#FDFBF7] font-bold px-6 shadow-sm">
          Finalizar por Hoje
        </Button>
        <Button
          variant="outline"
          onClick={onDepth}
          className="font-serif border-[#D4AF37] text-[#7A0C0C] dark:text-[#E5C158] bg-[#FAF7EE] hover:bg-[#F3EDDC] font-bold px-6"
        >
          <Crown className="mr-2 h-4 w-4 text-[#D4AF37]" />
          Aprofundar a Oração de Hoje
        </Button>
      </div>
    </section>
  );
}

export function ReminderSettings({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <label className="flex items-center justify-between rounded-xl border border-[#D4AF37]/40 bg-[#FAF7EE] dark:bg-[#1A1814] p-4 text-sm font-serif shadow-sm">
      <div>
        <span className="block font-bold text-[#7A0C0C] dark:text-[#E5C158]">Lembrete Diário de Oração</span>
        <span className="text-xs text-muted-foreground">Receba um sinal no horário de sua escolha.</span>
      </div>
      <input
        type="time"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-md border border-[#D4AF37]/40 bg-[#F3EDDC] dark:bg-[#28241D] px-3 py-1 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
      />
    </label>
  );
}

export function SubscriptionOffer() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <section className="rounded-xl border-2 border-[#D4AF37]/50 bg-[#F5EFE0] dark:bg-[#1E1A14] p-6 shadow-md space-y-3 font-serif">
        <div className="flex items-center gap-2 text-[#7A0C0C] dark:text-[#E5C158] font-bold text-sm">
          <Crown className="h-5 w-5 text-[#D4AF37]" />
          <span>Sanctificare Premium</span>
        </div>
        <h3 className="text-xl font-bold text-[#2C251A] dark:text-[#FDFBF7]">
          Aprofunde esta experiência com o Sanctificare Premium
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          A devoção tradicional permanece totalmente gratuita para todos os fiéis. O Premium oferece meditações diárias, áudios contemplativos, exercícios de virtude e exames de consciência para quem deseja trilhar uma caminhada de aprofundamento espiritual.
        </p>
        <Button
          variant="outline"
          onClick={() => setOpen(true)}
          className="mt-2 font-serif border-[#D4AF37] text-[#7A0C0C] dark:text-[#E5C158] bg-[#FAF7EE] hover:bg-[#F3EDDC] font-bold"
        >
          <Lock className="mr-2 h-4 w-4 text-[#D4AF37]" />
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
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-7 overflow-hidden bg-[#FAF7EE] dark:bg-[#161411] text-[#2C251A] dark:text-[#E6DCC5] border-2 border-[#D4AF37]">
        <DialogHeader className="flex flex-row items-center justify-between border-b border-[#D4AF37]/30 pb-4">
          <div>
            <span className="text-xs uppercase font-serif font-bold text-[#7A0C0C] dark:text-[#E5C158] tracking-widest">
              ✦ Leitura Sacra Sem Distrações
            </span>
            <DialogTitle className="font-serif text-xl font-bold mt-0.5">
              {toRoman(index + 1)}. {prayers[index]?.title}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-6 px-4">
          <p className={`${fontSize} whitespace-pre-line font-serif leading-relaxed text-[#2C251A] dark:text-[#E6DCC5] max-w-2xl mx-auto`}>
            {prayers[index]?.content}
          </p>
        </div>

        <div className="flex items-center justify-between border-t border-[#D4AF37]/30 pt-4 text-xs font-serif">
          <Button
            variant="outline"
            disabled={index === 0}
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            className="border-[#D4AF37]/40"
          >
            Anterior
          </Button>
          <span className="text-[#5C503D] dark:text-[#A0927C] font-bold">
            {index + 1} de {prayers.length}
          </span>
          <Button
            disabled={index === prayers.length - 1}
            onClick={() => setIndex((i) => Math.min(prayers.length - 1, i + 1))}
            className="bg-[#7A0C0C] hover:bg-[#600909] text-[#FDFBF7] font-bold"
          >
            Próxima Oração
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}