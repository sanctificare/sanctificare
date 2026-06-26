import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import AppNav from "@/components/AppNav";
import { Sun, Heart, Eye, EyeOff, Minus, Plus, CornerUpLeft, ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import LiturgyReadings from "@/components/LiturgyReadings";
import AudioPlayer from "@/components/AudioPlayer";
import { getLiturgyAudioByDate, type LiturgyDailyAudioTrack } from "@/data/liturgy-audio";
import { getDailyContent } from "@/data/daily";


const LOGO_IMG = "/assets/sanctificare-logo-v2.webp";

export interface LiturgicalTheme {
  name: string;
  primary: string;
  bgLight: string;
  border: string;
  glow: string;
  badge: string;
  accentText: string;
}

export function getLiturgicalTheme(color?: string | null): LiturgicalTheme {
  const c = color?.toLowerCase() || "";
  if (c.includes("verde")) {
    return {
      name: "Verde",
      primary: "text-emerald-600 dark:text-emerald-400",
      bgLight: "bg-emerald-500/5 dark:bg-emerald-950/10 border-emerald-500/10",
      border: "border-emerald-500/20 dark:border-emerald-500/30",
      glow: "shadow-[0_0_20px_rgba(16,185,129,0.08)]",
      badge: "bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 border-emerald-500/30",
      accentText: "text-emerald-700 dark:text-emerald-300",
    };
  }
  if (c.includes("roxo") || c.includes("violeta")) {
    return {
      name: "Roxo",
      primary: "text-purple-600 dark:text-purple-400",
      bgLight: "bg-purple-500/5 dark:bg-purple-950/10 border-purple-500/10",
      border: "border-purple-500/20 dark:border-purple-500/30",
      glow: "shadow-[0_0_20px_rgba(147,51,234,0.08)]",
      badge: "bg-purple-500/15 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300 border-purple-500/30",
      accentText: "text-purple-700 dark:text-purple-300",
    };
  }
  if (c.includes("vermelho")) {
    return {
      name: "Vermelho",
      primary: "text-rose-600 dark:text-rose-400",
      bgLight: "bg-rose-500/5 dark:bg-rose-950/10 border-rose-500/10",
      border: "border-rose-500/20 dark:border-rose-500/30",
      glow: "shadow-[0_0_20px_rgba(244,63,94,0.08)]",
      badge: "bg-rose-500/15 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300 border-rose-500/30",
      accentText: "text-rose-700 dark:text-rose-300",
    };
  }
  if (c.includes("branco") || c.includes("dourado")) {
    return {
      name: "Branco",
      primary: "text-amber-600 dark:text-amber-400",
      bgLight: "bg-amber-500/5 dark:bg-amber-950/10 border-amber-500/10",
      border: "border-amber-500/20 dark:border-amber-500/30",
      glow: "shadow-[0_0_20px_rgba(245,158,11,0.08)]",
      badge: "bg-amber-500/15 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300 border-amber-500/30",
      accentText: "text-amber-700 dark:text-amber-300",
    };
  }
  if (c.includes("rosa")) {
    return {
      name: "Rosa",
      primary: "text-pink-600 dark:text-pink-400",
      bgLight: "bg-pink-500/5 dark:bg-pink-950/10 border-pink-500/10",
      border: "border-pink-500/20 dark:border-pink-500/30",
      glow: "shadow-[0_0_20px_rgba(236,72,153,0.08)]",
      badge: "bg-pink-500/15 text-pink-700 dark:bg-pink-500/20 dark:text-pink-300 border-pink-500/30",
      accentText: "text-pink-700 dark:text-pink-300",
    };
  }
  return {
    name: "Comum",
    primary: "text-[oklch(0.65_0.14_70)]",
    bgLight: "bg-[oklch(0.75_0.12_75/0.05)] border-[oklch(0.75_0.12_75/0.1)]",
    border: "border-[oklch(0.75_0.12_75/0.2)]",
    glow: "shadow-[0_0_20px_rgba(191,155,48,0.05)]",
    badge: "bg-[oklch(0.75_0.12_75/0.1)] text-[oklch(0.65_0.14_70)] border-[oklch(0.75_0.12_75/0.2)]",
    accentText: "text-[oklch(0.65_0.14_70)]",
  };
}

export default function Liturgy() {
  const { isAuthenticated, loading } = useAuth();
  const logPrayer = trpc.prayers.logPrayer.useMutation();

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const dateInputRef = useRef<HTMLInputElement>(null);

  const formatDateToISO = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const selectedDateIso = formatDateToISO(selectedDate);
  const isTodaySelected = selectedDateIso === formatDateToISO(new Date());

  const { data: liturgy, isLoading: isFetchingLiturgy, error } = trpc.liturgy.getByDate.useQuery(
    { date: selectedDateIso }
  );



  const [liturgyAudio, setLiturgyAudio] = useState<LiturgyDailyAudioTrack | null>(null);
  const [isZenMode, setIsZenMode] = useState(false);
  const [fontSize, setFontSize] = useState<"sm" | "md" | "lg" | "xl">("md");



  useEffect(() => {
    let canceled = false;

    async function checkAudioAvailability() {
      const candidate = getLiturgyAudioByDate(liturgy?.liturgyDate);
      if (!candidate) {
        setLiturgyAudio(null);
        return;
      }

      try {
        const res = await fetch(candidate.audioUrl, { method: "HEAD" });
        if (!canceled) {
          setLiturgyAudio(res.ok ? candidate : null);
        }
      } catch {
        if (!canceled) {
          setLiturgyAudio(null);
        }
      }
    }

    checkAudioAvailability();
    return () => {
      canceled = true;
    };
  }, [liturgy?.liturgyDate]);

  const formattedDate = selectedDate.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const handlePrevDay = () => {
    const prev = new Date(selectedDate);
    prev.setDate(prev.getDate() - 1);
    setSelectedDate(prev);
  };

  const handleNextDay = () => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 1);
    setSelectedDate(next);
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  const handleLogLiturgy = async () => {
    if (!isAuthenticated) return;
    try {
      await logPrayer.mutateAsync({
        prayerType: "liturgia",
        prayerName: `Liturgia do Dia — ${liturgy?.celebration || "—"}`,
      });
      toast.success("Liturgia registrada!", {
        description: "Você rezou hoje em comunhão com a Igreja.",
      });
    } catch {
      toast.error("Não foi possível registrar sua leitura agora.");
    }
  };

  const theme = getLiturgicalTheme(liturgy?.color);
  const dailyContent = getDailyContent(selectedDate);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <img src={LOGO_IMG} alt="Sanctificare" className="w-16 h-16 rounded-full animate-pulse" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <img src={LOGO_IMG} alt="Sanctificare" className="w-16 h-16 rounded-full mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold mb-2">Acesso Restrito</h2>
          <p className="text-muted-foreground mb-6">Entre para rezar a Liturgia do Dia.</p>
          <a href={getLoginUrl()}>
            <Button>Entrar</Button>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isZenMode ? "bg-stone-50 dark:bg-stone-950 py-10" : "bg-background"}`}>
      {!isZenMode && <AppNav />}

      {isZenMode && (
        <div className="fixed top-4 left-4 z-50">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsZenMode(false)}
            className="bg-background/80 backdrop-blur-sm border-border shadow-md flex items-center gap-1.5 text-xs font-semibold"
          >
            <CornerUpLeft className="w-3.5 h-3.5" />
            Sair do Modo Focado
          </Button>
        </div>
      )}

      <div className={`mx-auto px-4 py-6 space-y-6 transition-all duration-500 ${isZenMode ? "max-w-2xl" : "max-w-3xl"}`}>
        {/* Header */}
        <div className="text-center space-y-2 mb-8 select-none">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sun className={`w-5 h-5 ${theme.primary}`} />
            <span className={`text-xs font-bold tracking-widest uppercase ${theme.accentText}`}>LITURGIA DIÁRIA</span>
          </div>

          <div className="flex items-center justify-center gap-2 md:gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrevDay}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              title="Dia anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>

            <h1 className="font-display text-xl md:text-3xl font-bold tracking-tight text-foreground min-w-[200px] md:min-w-[280px]">
              {formattedDate}
            </h1>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleNextDay}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              title="Próximo dia"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>

            {!isZenMode && (
              <div className="relative inline-block ml-1">
                <input
                  type="date"
                  ref={dateInputRef}
                  value={selectedDateIso}
                  onChange={(e) => {
                    if (e.target.value) {
                      setSelectedDate(new Date(e.target.value + "T12:00:00"));
                    }
                  }}
                  className="absolute opacity-0 pointer-events-none w-0 h-0"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => dateInputRef.current?.showPicker()}
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  title="Escolher data"
                >
                  <Calendar className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          {!isTodaySelected && !isZenMode && (
            <button
              onClick={handleToday}
              className="text-xs font-semibold text-muted-foreground hover:text-primary transition-colors underline block mx-auto mt-2"
            >
              Ir para Hoje
            </button>
          )}
        </div>

        {/* Error state */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
            <p className="font-semibold">Erro ao carregar a liturgia</p>
            <p className="text-xs mt-1">{error.message}</p>
          </div>
        )}

        {/* Loading state */}
        {isFetchingLiturgy && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        )}

        {/* Content */}
        {liturgy && !isFetchingLiturgy && (
          <>


            {liturgyAudio && (
              <AudioPlayer
                audioUrl={liturgyAudio.audioUrl}
                title={liturgyAudio.title}
                description={liturgyAudio.description}
                supportTitle="Texto da liturgia"
                supportDescription="Acompanhe a leitura enquanto escuta"
                supportText={[
                  liturgy.firstReading?.texto,
                  liturgy.psalm?.texto,
                  liturgy.secondReading?.texto,
                  liturgy.gospel?.texto,
                ]
                  .filter(Boolean)
                  .join("\n\n")}
              />
            )}

            <LiturgyReadings
              liturgy={liturgy}
              fontSize={fontSize}
              isZenMode={isZenMode}
              theme={theme}
            />

            {/* Log button */}
            {!isZenMode && (
              <div className="pt-6 border-t border-border">
                <Button
                  onClick={handleLogLiturgy}
                  disabled={logPrayer.isPending}
                  className="w-full"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  {logPrayer.isPending ? "Registrando..." : "Registrar que rezei hoje"}
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Compartilhe sua fé e celebre com a comunidade.
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Floating Toolbar */}
      {liturgy && !isFetchingLiturgy && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-background/80 dark:bg-stone-900/80 backdrop-blur-md border border-border shadow-lg rounded-full px-3 py-1.5 transition-all">
          <span className="text-xs text-muted-foreground font-semibold px-2 border-r border-border">Leitura</span>

          <button
            onClick={() => {
              if (fontSize === "xl") setFontSize("lg");
              else if (fontSize === "lg") setFontSize("md");
              else if (fontSize === "md") setFontSize("sm");
            }}
            disabled={fontSize === "sm"}
            className="p-1.5 hover:bg-accent rounded-full text-muted-foreground disabled:opacity-30 transition-colors"
            title="Diminuir fonte"
          >
            <Minus className="w-4 h-4" />
          </button>

          <span className="text-xs font-bold uppercase w-6 text-center select-none text-foreground">
            {fontSize}
          </span>

          <button
            onClick={() => {
              if (fontSize === "sm") setFontSize("md");
              else if (fontSize === "md") setFontSize("lg");
              else if (fontSize === "lg") setFontSize("xl");
            }}
            disabled={fontSize === "xl"}
            className="p-1.5 hover:bg-accent rounded-full text-muted-foreground disabled:opacity-30 transition-colors"
            title="Aumentar fonte"
          >
            <Plus className="w-4 h-4" />
          </button>

          <div className="w-px h-4 bg-border mx-1" />

          <button
            onClick={() => setIsZenMode(!isZenMode)}
            className={`p-1.5 rounded-full transition-colors flex items-center gap-1 ${
              isZenMode
                ? "bg-primary text-primary-foreground"
                : "hover:bg-accent text-muted-foreground"
            }`}
            title={isZenMode ? "Desativar modo focado" : "Ativar modo focado"}
          >
            {isZenMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      )}


    </div>
  );
}
