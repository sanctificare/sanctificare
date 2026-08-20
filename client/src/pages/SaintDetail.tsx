import { useState, useEffect } from "react";
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
  ArrowRight,
  Type,
  Eye,
  EyeOff,
  SlidersHorizontal,
  X,
  BellRing
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
import {
  isSaintFavorite,
  toggleFavoriteSaint
} from "@/lib/saintDevotion";
import SaintShareCardModal from "@/components/SaintShareCardModal";

type FontSize = "sm" | "base" | "lg" | "xl" | "2xl";
type FontFamily = "serif" | "sans";

const FONT_SIZE_MAP: Record<FontSize, { body: string; quote: string; label: string }> = {
  sm: { body: "text-sm leading-relaxed", quote: "text-sm sm:text-base", label: "P" },
  base: { body: "text-base leading-relaxed", quote: "text-base sm:text-lg", label: "M" },
  lg: { body: "text-lg leading-loose", quote: "text-lg sm:text-xl", label: "G" },
  xl: { body: "text-xl leading-loose", quote: "text-xl sm:text-2xl", label: "GG" },
  "2xl": { body: "text-2xl leading-loose", quote: "text-2xl sm:text-3xl", label: "MAX" },
};

const FONT_SIZES_LIST: FontSize[] = ["sm", "base", "lg", "xl", "2xl"];

export default function SaintDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [, setLocation] = useLocation();
  const [copiedPrayer, setCopiedPrayer] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Estados de Leitura & Modo Contemplativo
  const [fontSize, setFontSize] = useState<FontSize>(() => {
    return (localStorage.getItem("sanctificare_saint_font_size") as FontSize) || "base";
  });
  const [fontFamily, setFontFamily] = useState<FontFamily>(() => {
    return (localStorage.getItem("sanctificare_saint_font_family") as FontFamily) || "serif";
  });
  const [isZenMode, setIsZenMode] = useState<boolean>(false);
  const [showReaderSettings, setShowReaderSettings] = useState<boolean>(false);

  const saint = getSaintBySlug(slug || "");

  // Estado de Santo Protetor / Favorito
  const [isFavorite, setIsFavorite] = useState<boolean>(() => {
    return saint ? isSaintFavorite(saint.slug) : false;
  });

  useEffect(() => {
    if (!saint) return;
    setIsFavorite(isSaintFavorite(saint.slug));

    const handleFavChange = () => {
      setIsFavorite(isSaintFavorite(saint.slug));
    };

    window.addEventListener("sanctificare_favorites_changed", handleFavChange);
    return () => {
      window.removeEventListener("sanctificare_favorites_changed", handleFavChange);
    };
  }, [saint?.slug]);

  const handleToggleFavorite = () => {
    if (!saint) return;
    const nowFav = toggleFavoriteSaint(saint.slug);
    setIsFavorite(nowFav);
    if (nowFav) {
      toast.success(`${saint.name} adicionado aos seus Santos Protetores! 🙏`);
    } else {
      toast.info(`${saint.name} removido dos seus Santos Protetores.`);
    }
  };

  const handleFontSizeChange = (delta: number) => {
    const currentIndex = FONT_SIZES_LIST.indexOf(fontSize);
    const newIndex = currentIndex + delta;
    if (newIndex >= 0 && newIndex < FONT_SIZES_LIST.length) {
      const nextSize = FONT_SIZES_LIST[newIndex];
      setFontSize(nextSize);
      localStorage.setItem("sanctificare_saint_font_size", nextSize);
    }
  };

  const handleFontFamilyToggle = (family: FontFamily) => {
    setFontFamily(family);
    localStorage.setItem("sanctificare_saint_font_family", family);
  };

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

  const handleShare = () => {
    setIsShareModalOpen(true);
  };

  // Primeira letra para capitular medieval
  const firstLetter = saint.biography.charAt(0);
  const remainingBiography = saint.biography.slice(1);

  const currentFontClass = fontFamily === "serif" ? "font-serif" : "font-sans";
  const currentSizeClass = FONT_SIZE_MAP[fontSize];

  return (
    <div
      className={`min-h-screen transition-colors duration-500 text-foreground relative overflow-hidden pb-20 ${
        isZenMode
          ? "bg-[#FAF7F0] dark:bg-[#12110E]"
          : "bg-[oklch(0.97_0.01_85)] dark:bg-[oklch(0.12_0.03_260)]"
      }`}
    >
      {/* Padrão de fundo suave */}
      <div className="absolute inset-0 bg-pattern-cross opacity-[0.02] dark:opacity-[0.04] pointer-events-none" />

      {/* MODAL DE COMPARTILHAMENTO DE CARD SACRO */}
      <SaintShareCardModal
        saint={saint}
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />

      {/* BARRA FIXA DO MODO CONTEMPLATIVO */}
      {isZenMode && (
        <aside aria-label="Controles do modo contemplativo" className="sticky top-0 z-50 bg-[#FAF7F0]/90 dark:bg-[#12110E]/90 backdrop-blur-md border-b border-amber-500/20 px-4 py-3 shadow-xs">
          <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
            <button
              onClick={() => setIsZenMode(false)}
              className="flex items-center gap-2 text-xs font-semibold text-amber-900 dark:text-amber-300 hover:text-amber-700 transition-colors"
            >
              <EyeOff className="w-4 h-4" />
              <span>Sair do Modo Contemplativo</span>
            </button>

            {/* Controles rápidos de leitura */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleFavorite}
                className={`p-1.5 rounded-lg border transition-colors ${
                  isFavorite
                    ? "bg-rose-500 text-white border-rose-500"
                    : "bg-amber-500/10 border-amber-500/20 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20"
                }`}
                title={isFavorite ? "Remover dos Santos Protetores" : "Adicionar aos Santos Protetores"}
              >
                <Heart className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`} />
              </button>

              <div className="flex items-center rounded-lg bg-amber-500/10 border border-amber-500/20 p-0.5">
                <button
                  onClick={() => handleFontSizeChange(-1)}
                  disabled={fontSize === "sm"}
                  className="px-2 py-1 text-xs font-bold disabled:opacity-30 text-amber-900 dark:text-amber-200 hover:bg-amber-500/20 rounded"
                  title="Diminuir fonte"
                >
                  A-
                </button>
                <span className="px-1.5 text-[11px] font-bold text-amber-800 dark:text-amber-300">
                  {currentSizeClass.label}
                </span>
                <button
                  onClick={() => handleFontSizeChange(1)}
                  disabled={fontSize === "2xl"}
                  className="px-2 py-1 text-xs font-bold disabled:opacity-30 text-amber-900 dark:text-amber-200 hover:bg-amber-500/20 rounded"
                  title="Aumentar fonte"
                >
                  A+
                </button>
              </div>

              <div className="flex items-center rounded-lg bg-amber-500/10 border border-amber-500/20 p-0.5">
                <button
                  onClick={() => handleFontFamilyToggle("serif")}
                  className={`px-2 py-1 text-xs font-serif font-bold rounded transition-colors ${
                    fontFamily === "serif"
                      ? "bg-amber-600 text-white shadow-xs"
                      : "text-amber-900 dark:text-amber-200 hover:bg-amber-500/20"
                  }`}
                  title="Fonte Serifada (Clássica)"
                >
                  Serifa
                </button>
                <button
                  onClick={() => handleFontFamilyToggle("sans")}
                  className={`px-2 py-1 text-xs font-sans font-bold rounded transition-colors ${
                    fontFamily === "sans"
                      ? "bg-amber-600 text-white shadow-xs"
                      : "text-amber-900 dark:text-amber-200 hover:bg-amber-500/20"
                  }`}
                  title="Fonte Sem Serifa (Moderna)"
                >
                  Sans
                </button>
              </div>
            </div>
          </div>
        </aside>
      )}

      <main
        className={`mx-auto py-6 sm:py-8 relative z-10 px-4 sm:px-6 transition-all duration-500 ${
          isZenMode ? "max-w-2xl" : "max-w-4xl"
        }`}
      >
        {/* Banner Google Play (apenas modo normal) */}
        {!isZenMode && (
          <div className="mb-6">
            <GooglePlayBanner variant="card" showDismiss={true} />
          </div>
        )}

        {/* Barra superior de navegação (apenas modo normal) */}
        {!isZenMode && (
          <div className="flex items-center justify-between gap-3 mb-6">
            <Link href="/santoral">
              <button className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-neutral-800/70 border border-border/50 text-xs sm:text-sm font-medium hover:bg-muted transition-colors shadow-sm">
                <ChevronLeft className="w-4 h-4" />
                <span>Santoral & Calendário</span>
              </button>
            </Link>

            <div className="flex items-center gap-2">
              {/* Botão de Santo Protetor / Favorito */}
              <button
                onClick={handleToggleFavorite}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border transition-all text-xs font-semibold shadow-sm ${
                  isFavorite
                    ? "bg-rose-500/15 border-rose-500/40 text-rose-700 dark:text-rose-300 hover:bg-rose-500/25"
                    : "bg-white dark:bg-neutral-800/70 border-border/50 text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
                title={isFavorite ? "Remover dos Meus Santos Protetores" : "Favoritar como Santo Protetor"}
              >
                <Heart className={`w-4 h-4 ${isFavorite ? "fill-rose-500 text-rose-500" : ""}`} />
                <span className="hidden sm:inline">
                  {isFavorite ? "Meu Protetor" : "Protetor"}
                </span>
              </button>

              {/* Botão de Ajustes de Leitura */}
              <button
                onClick={() => setShowReaderSettings(!showReaderSettings)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border transition-all text-xs font-medium shadow-sm ${
                  showReaderSettings
                    ? "bg-amber-500 text-white border-amber-600 shadow-md"
                    : "bg-white dark:bg-neutral-800/70 border-border/50 text-foreground hover:bg-muted"
                }`}
                title="Ajuste de Leitura e Tipografia"
              >
                <Type className="w-4 h-4" />
                <span className="hidden sm:inline">Ajuste de Leitura</span>
              </button>

              {/* Botão de Modo Contemplativo */}
              <button
                onClick={() => {
                  setIsZenMode(true);
                  setShowReaderSettings(false);
                  toast.info("Modo Contemplativo ativado. Uma leitura em paz e oração.");
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs font-semibold transition-colors shadow-sm"
                title="Ativar Modo Contemplativo"
              >
                <Eye className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span className="hidden sm:inline">Contemplar</span>
              </button>

              {/* Botão de Compartilhar Card Sacro */}
              <button
                onClick={handleShare}
                className="p-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-900 dark:text-amber-200 transition-colors shadow-sm"
                aria-label="Compartilhar Card Sacro"
                title="Compartilhar Card Sacro"
              >
                <Share2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </button>
            </div>
          </div>
        )}

        {/* PAINEL FLUTUANTE / EXPANSÍVEL DE AJUSTE DE LEITURA */}
        {showReaderSettings && !isZenMode && (
          <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-white dark:bg-neutral-900 border-2 border-amber-500/40 shadow-lg space-y-4 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center justify-between pb-2 border-b border-border/40">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <h3 className="font-bold text-sm text-foreground">
                  Ajustes de Tipografia & Leitura Confortável
                </h3>
              </div>
              <button
                onClick={() => setShowReaderSettings(false)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Controle de Tamanho */}
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-muted-foreground block">
                  Tamanho do Texto:
                </span>
                <div className="flex items-center justify-between gap-2 p-1.5 rounded-xl bg-muted/50 border border-border/40">
                  <button
                    onClick={() => handleFontSizeChange(-1)}
                    disabled={fontSize === "sm"}
                    className="px-3 py-1 rounded-lg bg-white dark:bg-neutral-800 border border-border/40 text-xs font-bold disabled:opacity-40 hover:bg-amber-500/10 transition-colors"
                  >
                    A- (Diminuir)
                  </button>
                  <span className="text-xs font-bold text-amber-800 dark:text-amber-300">
                    Tamanho: {currentSizeClass.label}
                  </span>
                  <button
                    onClick={() => handleFontSizeChange(1)}
                    disabled={fontSize === "2xl"}
                    className="px-3 py-1 rounded-lg bg-white dark:bg-neutral-800 border border-border/40 text-xs font-bold disabled:opacity-40 hover:bg-amber-500/10 transition-colors"
                  >
                    A+ (Aumentar)
                  </button>
                </div>
              </div>

              {/* Família Tipográfica */}
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-muted-foreground block">
                  Estilo da Fonte:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleFontFamilyToggle("serif")}
                    className={`p-2 rounded-xl border text-xs font-serif font-bold flex items-center justify-center gap-1.5 transition-all ${
                      fontFamily === "serif"
                        ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                        : "bg-muted/50 border-border/40 text-foreground hover:bg-muted"
                    }`}
                  >
                    <span>Serifa Sacra</span>
                  </button>
                  <button
                    onClick={() => handleFontFamilyToggle("sans")}
                    className={`p-2 rounded-xl border text-xs font-sans font-bold flex items-center justify-center gap-1.5 transition-all ${
                      fontFamily === "sans"
                        ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                        : "bg-muted/50 border-border/40 text-foreground hover:bg-muted"
                    }`}
                  >
                    <span>Sem Serifa (Limpa)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Hero Card do Santo */}
        <div
          className={`mb-8 rounded-3xl border transition-all ${
            isZenMode
              ? "p-6 sm:p-7 bg-white/70 dark:bg-neutral-900/70 border-amber-500/20 text-center"
              : "p-6 sm:p-8 bg-gradient-to-b from-white via-white to-amber-50/20 dark:from-[oklch(0.16_0.04_260)] dark:via-[oklch(0.14_0.03_260)] dark:to-[oklch(0.12_0.03_260)] border-amber-500/30 shadow-md"
          }`}
        >
          <div
            className={`flex flex-col ${
              isZenMode ? "items-center text-center" : "sm:flex-row items-center sm:items-start text-center sm:text-left"
            } gap-6`}
          >
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
              <div
                className={`flex flex-wrap items-center gap-2 ${
                  isZenMode ? "justify-center" : "justify-center sm:justify-start"
                }`}
              >
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
              {saint.patronage.length > 0 && !isZenMode && (
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

              {/* Botões de Ação de Devoção */}
              {!isZenMode && (
                <div className="pt-3 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <button
                    onClick={handleShare}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-neutral-800/80 hover:bg-muted border border-border/50 text-foreground text-xs font-semibold transition-colors shadow-xs"
                    title="Gerar Card Sacro para WhatsApp e Redes"
                  >
                    <Share2 className="w-3.5 h-3.5 text-amber-600" />
                    <span>Gerar Card Sacro</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Citação em Destaque */}
          {saint.quote && (
            <div className="mt-6 pt-6 border-t border-border/40 text-center sm:text-left">
              <blockquote className={`${currentFontClass} italic ${currentSizeClass.quote} text-amber-800 dark:text-amber-300 leading-snug`}>
                "{saint.quote}"
              </blockquote>
            </div>
          )}
        </div>

        {/* FICHA CANÔNICA & HISTÓRICA */}
        {(saint.birthInfo || saint.deathInfo || saint.canonization) && (
          <section className="mb-8 p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-amber-500/5 via-white to-white dark:from-[oklch(0.16_0.04_260/0.9)] dark:via-[oklch(0.14_0.03_260/0.8)] dark:to-[oklch(0.13_0.03_260/0.8)] border border-amber-500/30 shadow-sm">
            <div className="flex items-center gap-2.5 pb-3.5 border-b border-border/40 mb-4">
              <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-300 flex items-center justify-center">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-display text-lg sm:text-xl font-bold text-foreground">
                  Ficha Histórica & Canônica
                </h2>
                <p className="text-[11px] text-muted-foreground">
                  Registros cronológicos e canônicos da Tradição da Santa Sé
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
              {saint.birthInfo && (
                <div className="p-3.5 sm:p-4 rounded-2xl bg-white/80 dark:bg-neutral-900/60 border border-border/40 space-y-1 shadow-xs">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-amber-700 dark:text-amber-400 block">
                    Nascimento / Origem
                  </span>
                  <p className="text-xs sm:text-sm font-medium text-foreground leading-snug">
                    {saint.birthInfo}
                  </p>
                </div>
              )}

              {saint.deathInfo && (
                <div className="p-3.5 sm:p-4 rounded-2xl bg-white/80 dark:bg-neutral-900/60 border border-border/40 space-y-1 shadow-xs">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-rose-600 dark:text-rose-400 block">
                    Páscoa / Trânsito / Martírio
                  </span>
                  <p className="text-xs sm:text-sm font-medium text-foreground leading-snug">
                    {saint.deathInfo}
                  </p>
                </div>
              )}

              {saint.canonization && (
                <div className="p-3.5 sm:p-4 rounded-2xl bg-white/80 dark:bg-neutral-900/60 border border-border/40 space-y-1 shadow-xs">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-amber-700 dark:text-amber-400 block">
                    Canonização / Doutoramento
                  </span>
                  <p className="text-xs sm:text-sm font-medium text-foreground leading-snug">
                    {saint.canonization}
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* 1. SEÇÃO: VIDA & LENDA DOURADA (HAGIOGRAFIA) */}
        <section className="mb-8 p-6 sm:p-8 rounded-3xl bg-white dark:bg-[oklch(0.16_0.04_260/0.7)] border border-border/50 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-border/40">
            <BookOpen className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <h2 className="font-display text-xl font-bold text-foreground">
              Vida & Lenda Dourada (Hagiografia)
            </h2>
          </div>

          <div className={`prose prose-neutral dark:prose-invert max-w-none text-foreground/90 ${currentFontClass} ${currentSizeClass.body}`}>
            <p>
              {/* Capitular Medieval */}
              <span className="float-left text-4xl sm:text-5xl font-display font-bold text-amber-600 dark:text-amber-400 leading-none pr-3 pt-1">
                {firstLetter}
              </span>
              {remainingBiography}
            </p>
          </div>
        </section>

        {/* SEÇÃO: ICONOGRAFIA SAGRADA & ATRIBUTOS */}
        {saint.iconography && saint.iconography.length > 0 && (
          <section className="mb-8 p-6 sm:p-8 rounded-3xl bg-white dark:bg-[oklch(0.16_0.04_260/0.7)] border border-border/50 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-border/40">
              <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <div>
                <h2 className="font-display text-xl font-bold text-foreground">
                  Iconografia Sagrada & Atributos
                </h2>
                <p className="text-xs text-muted-foreground">
                  Símbolos tradicionais com que o Santo é representado na Arte Sacra Católica
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {saint.iconography.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl bg-amber-500/5 dark:bg-amber-950/20 border border-amber-500/20 flex items-start gap-2.5 text-xs sm:text-sm text-foreground/90 ${currentFontClass}`}
                >
                  <span className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 2. SEÇÃO: MARTÍRIO OU TRÂNSITO CELESTIAL */}
        <section className="mb-8 p-6 sm:p-8 rounded-3xl bg-white dark:bg-[oklch(0.16_0.04_260/0.7)] border border-border/50 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-border/40">
            <Award className="w-5 h-5 text-rose-500" />
            <h2 className="font-display text-xl font-bold text-foreground">
              O Triunfo do Martírio e Páscoa Eterna
            </h2>
          </div>

          <p className={`${currentFontClass} ${currentSizeClass.body} text-foreground/90 leading-relaxed`}>
            {saint.martyrdomOrPassing}
          </p>
        </section>

        {/* SEÇÃO: PRINCIPAIS OBRAS & ESCRITOS */}
        {saint.majorWorks && saint.majorWorks.length > 0 && (
          <section className="mb-8 p-6 sm:p-8 rounded-3xl bg-white dark:bg-[oklch(0.16_0.04_260/0.7)] border border-border/50 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-border/40">
              <BookOpen className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <div>
                <h2 className="font-display text-xl font-bold text-foreground">
                  Tratados, Obras & Escritos Notáveis
                </h2>
                <p className="text-xs text-muted-foreground">
                  Patrimônio doutrinal e espiritual legado à Santa Igreja
                </p>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              {saint.majorWorks.map((work, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-xl bg-muted/40 border border-border/40 flex items-center gap-3 text-xs sm:text-sm font-medium text-foreground ${currentFontClass}`}
                >
                  <span className="w-6 h-6 rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-300 flex items-center justify-center text-xs font-bold shrink-0 font-sans">
                    {idx + 1}
                  </span>
                  <span>{work}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 3. SEÇÃO: RELÍQUIAS & TRADIÇÃO SAGRADA */}
        <section className="mb-8 p-6 sm:p-8 rounded-3xl bg-white dark:bg-[oklch(0.16_0.04_260/0.7)] border border-border/50 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-border/40">
            <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <h2 className="font-display text-xl font-bold text-foreground">
              Relíquias Sagradas & Tradição da Igreja
            </h2>
          </div>

          <p className={`${currentFontClass} ${currentSizeClass.body} text-foreground/90 leading-relaxed`}>
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
            <p className={`${currentFontClass} italic ${currentSizeClass.quote} text-foreground leading-relaxed`}>
              "{saint.prayer}"
            </p>
          </div>
        </section>

        {/* AÇÕES INTEGRADAS NO APP (ocultas no modo contemplativo) */}
        {!isZenMode && (
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
        )}
      </main>
    </div>
  );
}
