import { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  BookOpen,
  CheckCircle2,
  Heart,
  ListFilter,
  Sparkles,
  Quote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  SAINT_MICHAEL_TRADITIONAL_PRAYERS,
  type JourneyDay,
} from "@/data/saint-michael-lent";

interface SaintMichaelGuidedReaderProps {
  dayData: JourneyDay;
  dayNumber: number;
  fontSize: "text-sm" | "text-base" | "text-lg";
  setFontSize: (size: "text-sm" | "text-base" | "text-lg") => void;
  isCompleted: boolean;
  onToggleComplete: () => void;
  penanceText?: string;
}

export function SaintMichaelGuidedReader({
  dayData,
  dayNumber,
  fontSize,
  setFontSize,
  isCompleted,
  onToggleComplete,
  penanceText,
}: SaintMichaelGuidedReaderProps) {
  const [currentStep, setCurrentStep] = useState(0);

  // Reset step to 0 when day changes
  useEffect(() => {
    setCurrentStep(0);
  }, [dayNumber]);

  const steps = [
    { id: "prayers", title: "1. Orações Iniciais", badge: "Passos 1-7" },
    { id: "biblia", title: "2. Palavra de Deus", badge: "Passo 8" },
    { id: "meditation", title: "3. Meditação & Doutrina", badge: "Passos 9-10" },
    { id: "pratica", title: "4. Prática Espiritual", badge: "Passos 11-13" },
    { id: "exame", title: "5. Exame & Penitência", badge: "Passos 14-15" },
    { id: "consagracao", title: "6. Oração Final", badge: "Passos 16-17" },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="space-y-5 animate-fade-in pb-36 lg:pb-20">
      {/* Barra de Progresso das Etapas (título e fonte já ficam no cabeçalho da aba Texto, acima) */}
      <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between text-[11px] font-serif font-bold">
          <span className="text-amber-700 dark:text-amber-400">
            Etapa {currentStep + 1} de {steps.length}: {steps[currentStep].title}
          </span>
          <span className="text-muted-foreground font-mono text-[10px]">
            {Math.round(((currentStep + 1) / steps.length) * 100)}%
          </span>
        </div>
        <div className="w-full bg-muted/70 h-2 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-amber-500 to-amber-600 h-full rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Horizontal Step Pills Navigator */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 pr-4 scrollbar-none snap-x">
          {steps.map((step, idx) => (
            <button
              key={step.id}
              onClick={() => setCurrentStep(idx)}
              className={`shrink-0 snap-start min-h-10 px-3 py-2 rounded-full text-[11px] font-serif font-semibold transition-all cursor-pointer border ${
                currentStep === idx
                  ? "bg-amber-600 text-white border-amber-600 shadow-sm"
                  : idx < currentStep
                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                  : "bg-muted/50 text-muted-foreground border-border hover:border-amber-500/30"
              }`}
            >
              {idx + 1}. {step.title.split(". ")[1]}
            </button>
          ))}
        </div>
      </div>

      {/* Step Content Render Area */}
      <div className="min-h-[350px]">
        {/* STEP 1: ORAÇÕES INICIAIS */}
        {currentStep === 0 && (
          <div className="space-y-4 animate-fade-in">
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 flex items-center justify-between">
              <span className="text-xs font-serif font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                <ShieldCheck size={16} /> Passos 1 a 7 • Orações Tradicionais Diárias
              </span>
              <span className="text-[10px] font-mono bg-amber-500/20 text-amber-900 dark:text-amber-200 px-2 py-0.5 rounded-full">
                7 Oração(ões)
              </span>
            </div>

            <div className="space-y-3">
              {SAINT_MICHAEL_TRADITIONAL_PRAYERS.map((prayer) => (
                <div key={prayer.title} className="rounded-2xl border border-border bg-card p-4 space-y-2 shadow-xs">
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
        )}

        {/* STEP 2: PALAVRA DE DEUS */}
        {currentStep === 1 && (
          <div className="space-y-4 animate-fade-in">
            <div className="rounded-2xl border-l-4 border-amber-600 bg-amber-500/10 p-5 space-y-3 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400 font-serif">
                Passo 8 • Reflexão Bíblica
              </span>
              <p className="font-serif font-bold text-amber-800 dark:text-amber-300 text-sm sm:text-base flex items-center gap-2">
                <BookOpen size={18} /> Referência: {dayData.scripture.reference}
              </p>
              <blockquote className={`font-serif italic leading-relaxed text-foreground ${fontSize} border-l-2 border-amber-500/40 pl-3 py-1`}>
                "{dayData.scripture.text}"
              </blockquote>
              {dayData.scripture.explanation && (
                <div className="text-xs font-serif text-muted-foreground pt-3 border-t border-amber-600/20 leading-relaxed space-y-1">
                  <span className="font-bold text-amber-700 dark:text-amber-400 uppercase text-[10px] tracking-wider block">
                    Explicação Exegética:
                  </span>
                  <p>{dayData.scripture.explanation}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 3: MEDITAÇÃO & DOUTRINA */}
        {currentStep === 2 && (
          <div className="space-y-5 animate-fade-in">
            <div className="rounded-2xl border border-border bg-card p-5 space-y-3 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 font-serif">
                Passo 9 • Reflexão do Dia
              </span>
              <h3 className="font-serif text-lg font-bold text-foreground">
                Dia {dayNumber}: {dayData.theme}
              </h3>
              <p className={`font-serif leading-relaxed text-muted-foreground ${fontSize} whitespace-pre-line`}>
                {dayData.meditation}
              </p>
            </div>

            {/* Tradição da Igreja */}
            {dayData.churchTradition && (
              <div className="rounded-2xl border border-amber-500/20 bg-muted/30 p-5 space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 font-serif">
                  Passo 10 • Fundamentação na Tradição da Igreja
                </span>

                {dayData.churchTradition.cic && (
                  <div className="space-y-1.5 pt-1">
                    <h4 className="font-serif font-bold text-xs uppercase text-amber-800 dark:text-amber-300">
                      • Catecismo da Igreja Católica:
                    </h4>
                    {dayData.churchTradition.cic.map((item) => (
                      <p key={item.code} className={`font-serif text-muted-foreground ${fontSize}`}>
                        <strong>{item.code}: </strong>"{item.text}"
                      </p>
                    ))}
                  </div>
                )}

                {dayData.churchTradition.fathers && (
                  <div className="space-y-1.5 pt-2 border-t border-border/50">
                    <h4 className="font-serif font-bold text-xs uppercase text-amber-800 dark:text-amber-300">
                      • Padres da Igreja:
                    </h4>
                    {dayData.churchTradition.fathers.map((item, idx) => (
                      <p key={idx} className={`font-serif text-muted-foreground ${fontSize}`}>
                        <strong>{item.author}: </strong>"{item.text}"{item.source ? ` (${item.source})` : ""}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* STEP 4: PRÁTICA ESPIRITUAL */}
        {currentStep === 3 && (
          <div className="space-y-4 animate-fade-in">
            {/* Oração de Entrega */}
            {dayData.deliveryPrayer && (
              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 font-serif">
                  Passo 11 • Oração de Entrega a São Miguel
                </span>
                <p className={`font-serif whitespace-pre-line leading-relaxed text-foreground ${fontSize}`}>
                  {dayData.deliveryPrayer}
                </p>
              </div>
            )}

            {/* Exercício Espiritual */}
            <div className="rounded-2xl border border-border bg-card p-5 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 font-serif">
                Passo 12 • Exercício Espiritual
              </span>
              <p className={`font-serif italic leading-relaxed text-foreground ${fontSize}`}>
                "{dayData.spiritualExercise}"
              </p>
            </div>

            {/* Citações dos Santos */}
            <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 font-serif flex items-center gap-1">
                <Quote size={12} /> Passo 13 • Citações dos Santos
              </span>
              {dayData.saintQuotesList ? (
                <div className="space-y-3">
                  {dayData.saintQuotesList.map((sq, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-muted/30 border border-border/50 space-y-1.5">
                      <span className="text-sm font-serif font-bold text-amber-800 dark:text-amber-300">
                        {sq.author}
                      </span>
                      <p className={`font-serif italic text-muted-foreground leading-relaxed ${fontSize}`}>
                        "{sq.quote}"
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className={`font-serif italic text-muted-foreground ${fontSize}`}>
                  "{dayData.saintQuote}"
                </p>
              )}
            </div>
          </div>
        )}

        {/* STEP 5: EXAME & PENITÊNCIA */}
        {currentStep === 4 && (
          <div className="space-y-4 animate-fade-in">
            {/* Exame de Consciência */}
            <div className="rounded-2xl border border-border bg-card p-5 space-y-3 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 font-serif">
                Passo 14 • Exame de Consciência (3 Perguntas Diárias)
              </span>
              <ul className="space-y-2.5">
                {dayData.examination.map((q, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 bg-muted/30 p-3 rounded-xl border border-border/60">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300 font-bold font-mono text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className={`font-serif text-foreground ${fontSize}`}>{q}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Penitência sugerida para hoje */}
            <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-5 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 font-serif flex items-center gap-1.5">
                <Heart size={12} className="text-amber-500" /> Passo 15 • Penitência Sugerida para Hoje
              </span>
              <p className={`font-serif font-bold italic text-foreground ${fontSize}`}>
                "{dayData.suggestedPenance}"
              </p>
              {penanceText && (
                <div className="pt-2 border-t border-amber-500/20 text-xs font-serif text-amber-900/80 dark:text-amber-200/80">
                  <span className="font-bold uppercase text-[9px] tracking-wider block">Sua Penitência Registrada:</span>
                  <p className="italic">"{penanceText}"</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 6: CONSAGRAÇÃO & ORAÇÃO FINAL */}
        {currentStep === 5 && (
          <div className="space-y-5 animate-fade-in">
            {dayData.familyConsecration && (
              <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-5 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 font-serif">
                  Passo 16 • Consagração da Família a São Miguel Arcanjo
                </span>
                <p className={`font-serif whitespace-pre-line leading-relaxed text-foreground ${fontSize}`}>
                  {dayData.familyConsecration}
                </p>
              </div>
            )}

            <div className="rounded-2xl border-2 border-amber-600/40 bg-amber-500/10 p-5 space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 font-serif">
                Passo 17 • Oração Final
              </span>
              <p className={`font-serif whitespace-pre-line leading-relaxed text-foreground ${fontSize}`}>
                {dayData.complementaryPrayer}
              </p>
            </div>

            {/* Final Completion Box */}
            <div className="rounded-2xl border border-amber-500/30 bg-card p-5 text-center space-y-3 shadow-md">
              <Sparkles size={24} className="mx-auto text-amber-500" />
              <h3 className="font-serif text-lg font-bold text-foreground">
                Parabéns! Você concluiu a oração do Dia {dayNumber}.
              </h3>
              <p className="text-xs font-serif text-muted-foreground max-w-sm mx-auto">
                Que São Miguel Arcanjo ilumine seus passos e guarde seu coração neste combate espiritual.
              </p>

              <Button
                onClick={onToggleComplete}
                className={`w-full py-5 font-serif font-bold text-sm rounded-xl cursor-pointer transition-all shadow-md ${
                  isCompleted
                    ? "bg-emerald-700 hover:bg-emerald-800 text-white"
                    : "bg-amber-500 hover:bg-amber-400 text-slate-950"
                }`}
              >
                <CheckCircle2 className="mr-2 h-5 w-5" />
                {isCompleted ? `Dia ${dayNumber} Marcado como Rezado ✓` : `Marcar Dia ${dayNumber} como Rezado`}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Sticky Bottom Action Navigation Bar (offset above the app's own mobile tab bar so it isn't hidden behind it) */}
      <div className="fixed bottom-[calc(var(--mobile-bottom-nav-height)+var(--safe-area-bottom))] lg:bottom-0 left-0 right-0 z-30 bg-card/95 backdrop-blur-md border-t border-border p-3 flex items-center justify-between gap-3 shadow-lg max-w-2xl mx-auto rounded-t-2xl">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrev}
          disabled={currentStep === 0}
          className="font-serif font-semibold text-xs flex-1 cursor-pointer"
        >
          <ChevronLeft size={14} className="mr-1" /> Anterior
        </Button>

        <span className="text-xs font-serif font-bold text-amber-700 dark:text-amber-400 px-2 shrink-0">
          Etapa {currentStep + 1}/{steps.length}
        </span>

        <Button
          size="sm"
          onClick={handleNext}
          disabled={currentStep === steps.length - 1}
          className="bg-amber-600 hover:bg-amber-700 text-white font-serif font-semibold text-xs flex-1 cursor-pointer"
        >
          Próximo <ChevronRight size={14} className="ml-1" />
        </Button>
      </div>
    </div>
  );
}
