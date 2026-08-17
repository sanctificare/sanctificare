import { useState } from "react";
import { Link, useParams, useLocation } from "wouter";
import {
  ChevronLeft,
  Share2,
  Crown,
  Flame,
  BookOpen,
  Calendar,
  Sparkles,
  Shield,
  Copy,
  Check,
  Award,
  Heart,
  ArrowRight
} from "lucide-react";
import {
  getSaintBySlug,
  MONTH_NAMES_PT,
  getSaintLiturgicalStyle,
  SAINTS_DATABASE
} from "@/data/santoral";
import { toast } from "sonner";
import { shareText } from "@/lib/share";
import GooglePlayBanner from "@/components/GooglePlayBanner";

export default function SaintDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [, setLocation] = useLocation();
  const [copiedPrayer, setCopiedPrayer] = useState(false);

  const saint = getSaintBySlug(slug || "");

  if (!saint) {
    return (
      <div className="min-h-screen bg-[oklch(0.97_0.01_85)] dark:bg-[oklch(0.12_0.03_260)] py-12 px-4 flex flex-col items-center justify-center text-center">
        <Crown className="w-12 h-12 text-amber-500/40 mb-3" />
        <h2 className="font-display text-2xl font-bold mb-2">Santo não encontrado</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Não localizamos a hagiografia para este registro no catálogo.
        </p>
        <Link href="/santoral">
          <button className="px-5 py-2.5 rounded-xl bg-amber-600 text-white font-medium text-sm">
            Voltar ao Calendário Santoral
          </button>
        </Link>
      </div>
    );
  }

  const style = getSaintLiturgicalStyle(saint.liturgicalColor);

  const handleCopyPrayer = () => {
    navigator.clipboard.writeText(`${saint.name} - Oração de Intercessão\n\n"${saint.prayer}"\n\nRezado via Sanctificare.`);
    setCopiedPrayer(true);
    toast.success("Oração copiada para a área de transferência!");
    setTimeout(() => setCopiedPrayer(false), 2500);
  };

  const handleShare = async () => {
    const text = `Conheça a história e oração de ${saint.name} (${saint.day} de ${MONTH_NAMES_PT[saint.month - 1]}) no Santoral do Sanctificare: https://sanctificare.app/santoral/${saint.slug}`;
    await shareText({
      title: `${saint.name} - Santoral Sanctificare`,
      text: text,
    });
  };

  // Primeira letra para capitular medieval
  const firstLetter = saint.biography.charAt(0);
  const remainingBiography = saint.biography.slice(1);

  return (
    <div className="min-h-screen bg-[oklch(0.97_0.01_85)] dark:bg-[oklch(0.12_0.03_260)] text-foreground relative overflow-hidden pb-20">
      {/* Padrão de fundo */}
      <div className="absolute inset-0 bg-pattern-cross opacity-[0.02] dark:opacity-[0.04] pointer-events-none" />

      <main className="container max-w-4xl py-6 sm:py-8 relative z-10 px-4 sm:px-6">
        {/* Banner Google Play (apenas desktop web) */}
        <div className="mb-6">
          <GooglePlayBanner variant="card" showDismiss={true} />
        </div>

        {/* Barra superior de navegação */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <Link href="/santoral">
            <button className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-neutral-800/70 border border-border/50 text-xs sm:text-sm font-medium hover:bg-muted transition-colors shadow-sm">
              <ChevronLeft className="w-4 h-4" />
              <span>Santoral & Calendário</span>
            </button>
          </Link>

          <button
            onClick={handleShare}
            className="p-2.5 rounded-xl bg-white dark:bg-neutral-800/70 border border-border/50 text-muted-foreground hover:text-foreground transition-colors shadow-sm"
            aria-label="Compartilhar"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        {/* Hero Card do Santo */}
        <div className="mb-8 p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-white via-white to-amber-50/20 dark:from-[oklch(0.16_0.04_260)] dark:via-[oklch(0.14_0.03_260)] dark:to-[oklch(0.12_0.03_260)] border border-amber-500/30 shadow-md">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
            {/* Ícone Sacro com Auréola */}
            <div className="relative shrink-0">
              <div className="absolute -inset-2 rounded-2xl bg-gradient-to-tr from-amber-500/30 to-yellow-300/30 blur-sm -z-10" />
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-amber-100 dark:bg-amber-950/40 border-2 border-amber-500/50 shadow-md">
                <img
                  src={saint.image}
                  alt={saint.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Informações Principais */}
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-900 dark:text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {saint.day} de {MONTH_NAMES_PT[saint.month - 1]}
                </span>

                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${style.badge}`}>
                  {saint.rank} • {style.label}
                </span>

                {saint.isHolyDayOfObligation && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-500/25 text-yellow-900 dark:text-yellow-200 border border-yellow-500/50 flex items-center gap-1">
                    <Crown className="w-3.5 h-3.5 text-yellow-500" /> Festa de Guarda
                  </span>
                )}
              </div>

              <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
                {saint.name}
              </h1>

              <p className="text-sm sm:text-base text-muted-foreground font-medium">
                {saint.title}
              </p>

              {/* Chips de Patronatos */}
              {saint.patronage.length > 0 && (
                <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-1.5">
                  <span className="text-xs font-semibold text-muted-foreground mr-1">Patrono de:</span>
                  {saint.patronage.map((p, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-0.5 rounded-lg bg-amber-500/10 text-amber-900 dark:text-amber-300 border border-amber-500/20 text-xs"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Citação em Destaque */}
          {saint.quote && (
            <div className="mt-6 pt-6 border-t border-border/40 text-center sm:text-left">
              <blockquote className="font-serif italic text-base sm:text-lg text-amber-800 dark:text-amber-300">
                "{saint.quote}"
              </blockquote>
            </div>
          )}
        </div>

        {/* 1. SEÇÃO: VIDA & LENDA DOURADA (HAGIOGRAFIA) */}
        <section className="mb-8 p-6 sm:p-8 rounded-3xl bg-white dark:bg-[oklch(0.16_0.04_260/0.7)] border border-border/50 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-border/40">
            <BookOpen className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <h2 className="font-display text-xl font-bold text-foreground">
              Vida & Lenda Dourada (Hagiografia)
            </h2>
          </div>

          <div className="prose prose-neutral dark:prose-invert max-w-none text-foreground/90 leading-relaxed text-sm sm:text-base">
            <p className="font-serif">
              {/* Capitular Medieval */}
              <span className="float-left text-4xl sm:text-5xl font-display font-bold text-amber-600 dark:text-amber-400 leading-none pr-3 pt-1">
                {firstLetter}
              </span>
              {remainingBiography}
            </p>
          </div>
        </section>

        {/* 2. SEÇÃO: MARTÍRIO OU TRÂNSITO CELESTIAL */}
        <section className="mb-8 p-6 sm:p-8 rounded-3xl bg-white dark:bg-[oklch(0.16_0.04_260/0.7)] border border-border/50 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-border/40">
            <Award className="w-5 h-5 text-rose-500" />
            <h2 className="font-display text-xl font-bold text-foreground">
              O Triunfo do Martírio e Páscoa Eterna
            </h2>
          </div>

          <p className="text-sm sm:text-base text-foreground/90 leading-relaxed font-serif">
            {saint.martyrdomOrPassing}
          </p>
        </section>

        {/* 3. SEÇÃO: RELÍQUIAS & TRADIÇÃO SAGRADA */}
        <section className="mb-8 p-6 sm:p-8 rounded-3xl bg-white dark:bg-[oklch(0.16_0.04_260/0.7)] border border-border/50 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-border/40">
            <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <h2 className="font-display text-xl font-bold text-foreground">
              Relíquias Sagradas & Tradição da Igreja
            </h2>
          </div>

          <p className="text-sm sm:text-base text-foreground/90 leading-relaxed">
            {saint.relicsAndTradition}
          </p>
        </section>

        {/* 4. SEÇÃO: ORAÇÃO OFICIAL DE INTERCESSÃO */}
        <section className="mb-8 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border-2 border-amber-500/40 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-amber-500/20">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <h2 className="font-display text-xl font-bold text-foreground">
                Oração Oficial de Intercessão
              </h2>
            </div>

            <button
              onClick={handleCopyPrayer}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-900 dark:text-amber-200 text-xs font-semibold transition-colors"
            >
              {copiedPrayer ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Copiada!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar Oração</span>
                </>
              )}
            </button>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white/80 dark:bg-neutral-900/60 border border-amber-500/20">
            <p className="font-serif italic text-sm sm:text-base text-foreground leading-relaxed">
              "{saint.prayer}"
            </p>
          </div>
        </section>

        {/* AÇÕES INTEGRADAS NO APP */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
          {/* Acender Vela */}
          <Link href="/vela-virtual">
            <button className="w-full p-4 rounded-2xl bg-white dark:bg-neutral-800/70 border border-amber-500/30 hover:border-amber-500 hover:shadow-md transition-all flex items-center justify-between group text-left">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-600 flex items-center justify-center">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-foreground">Vela Virtual</h4>
                  <p className="text-[11px] text-muted-foreground">Pedir intercessão do Santo</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>

          {/* Novena vinculada */}
          {saint.linkedNovenaSlug ? (
            <Link href={`/novenas/${saint.linkedNovenaSlug}`}>
              <button className="w-full p-4 rounded-2xl bg-white dark:bg-neutral-800/70 border border-amber-500/30 hover:border-amber-500 hover:shadow-md transition-all flex items-center justify-between group text-left">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-600 flex items-center justify-center">
                    <Crown className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-foreground">Rezar Novena</h4>
                    <p className="text-[11px] text-muted-foreground">Jornada de 9 dias</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          ) : (
            <Link href="/novenas">
              <button className="w-full p-4 rounded-2xl bg-white dark:bg-neutral-800/70 border border-border/50 hover:border-amber-500/40 hover:shadow-md transition-all flex items-center justify-between group text-left">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-muted text-muted-foreground flex items-center justify-center">
                    <Crown className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-foreground">Novenas</h4>
                    <p className="text-[11px] text-muted-foreground">Ver todas as novenas</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          )}

          {/* Liturgia Diária */}
          <Link href="/liturgia">
            <button className="w-full p-4 rounded-2xl bg-white dark:bg-neutral-800/70 border border-border/50 hover:border-amber-500/40 hover:shadow-md transition-all flex items-center justify-between group text-left sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-foreground">Liturgia da Missa</h4>
                  <p className="text-[11px] text-muted-foreground">Leituras e Salmo</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
        </div>
      </main>
    </div>
  );
}
