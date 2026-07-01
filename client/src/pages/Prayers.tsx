import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { PRAYERS, Prayer } from "@/data/prayers";
import { Crown, Clock, Heart, Lock, ChevronRight, X, Flame, Sparkles, Shield, Bell, Cross, Volume2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { PrayingHandsIcon } from "@/components/PrayingHandsIcon";
import { toast } from "sonner";
import AudioPlayer from "@/components/AudioPlayer";

const LOGO_IMG = "/assets/logo-sanctificare.webp";

type PrayerCardTheme = {
  icon: typeof Crown;
  accent: string;
  surface: string;
  ring: string;
  iconBg: string;
  iconColor: string;
  badgeBg: string;
  badgeText: string;
  badgeLabel: string;
};

const PRAYER_CARD_THEMES: Record<string, PrayerCardTheme> = {
  pai_nosso: {
    icon: Cross,
    accent: "oklch(0.52 0.11 255)",
    surface: "bg-[oklch(0.98_0.01_250)]",
    ring: "border-[oklch(0.80_0.07_250/0.45)] hover:border-[oklch(0.70_0.10_250/0.7)]",
    iconBg: "bg-[oklch(0.52_0.11_255/0.16)]",
    iconColor: "text-[oklch(0.40_0.10_255)]",
    badgeBg: "bg-[oklch(0.52_0.11_255/0.15)]",
    badgeText: "text-[oklch(0.34_0.09_255)]",
    badgeLabel: "Oração do Senhor",
  },
  ave_maria: {
    icon: Heart,
    accent: "oklch(0.58 0.16 24)",
    surface: "bg-[oklch(0.99_0.01_30)]",
    ring: "border-[oklch(0.84_0.09_24/0.45)] hover:border-[oklch(0.70_0.14_24/0.75)]",
    iconBg: "bg-[oklch(0.58_0.16_24/0.16)]",
    iconColor: "text-[oklch(0.47_0.13_24)]",
    badgeBg: "bg-[oklch(0.58_0.16_24/0.14)]",
    badgeText: "text-[oklch(0.42_0.13_24)]",
    badgeLabel: "Mariana",
  },
  gloria: {
    icon: Sparkles,
    accent: "oklch(0.66 0.15 92)",
    surface: "bg-[oklch(0.99_0.01_95)]",
    ring: "border-[oklch(0.86_0.10_92/0.45)] hover:border-[oklch(0.74_0.14_92/0.75)]",
    iconBg: "bg-[oklch(0.66_0.15_92/0.16)]",
    iconColor: "text-[oklch(0.50_0.12_92)]",
    badgeBg: "bg-[oklch(0.66_0.15_92/0.14)]",
    badgeText: "text-[oklch(0.44_0.11_92)]",
    badgeLabel: "Doxologia",
  },
  credo: {
    icon: Shield,
    accent: "oklch(0.45 0.09 260)",
    surface: "bg-[oklch(0.98_0.01_260)]",
    ring: "border-[oklch(0.78_0.08_260/0.45)] hover:border-[oklch(0.62_0.11_260/0.75)]",
    iconBg: "bg-[oklch(0.45_0.09_260/0.16)]",
    iconColor: "text-[oklch(0.34_0.08_260)]",
    badgeBg: "bg-[oklch(0.45_0.09_260/0.14)]",
    badgeText: "text-[oklch(0.32_0.07_260)]",
    badgeLabel: "Profissão de Fé",
  },
  salve_rainha: {
    icon: Crown,
    accent: "oklch(0.60 0.14 335)",
    surface: "bg-[oklch(0.99_0.01_340)]",
    ring: "border-[oklch(0.84_0.09_335/0.45)] hover:border-[oklch(0.72_0.13_335/0.75)]",
    iconBg: "bg-[oklch(0.60_0.14_335/0.16)]",
    iconColor: "text-[oklch(0.45_0.12_335)]",
    badgeBg: "bg-[oklch(0.60_0.14_335/0.14)]",
    badgeText: "text-[oklch(0.39_0.10_335)]",
    badgeLabel: "Mariana",
  },
  angelus: {
    icon: Bell,
    accent: "oklch(0.50 0.10 212)",
    surface: "bg-[oklch(0.98_0.01_215)]",
    ring: "border-[oklch(0.80_0.07_212/0.45)] hover:border-[oklch(0.66_0.11_212/0.75)]",
    iconBg: "bg-[oklch(0.50_0.10_212/0.16)]",
    iconColor: "text-[oklch(0.38_0.09_212)]",
    badgeBg: "bg-[oklch(0.50_0.10_212/0.14)]",
    badgeText: "text-[oklch(0.35_0.08_212)]",
    badgeLabel: "Liturgia Horária",
  },
  fatima: {
    icon: Flame,
    accent: "oklch(0.58 0.13 120)",
    surface: "bg-[oklch(0.98_0.01_120)]",
    ring: "border-[oklch(0.82_0.08_120/0.45)] hover:border-[oklch(0.70_0.12_120/0.75)]",
    iconBg: "bg-[oklch(0.58_0.13_120/0.16)]",
    iconColor: "text-[oklch(0.44_0.11_120)]",
    badgeBg: "bg-[oklch(0.58_0.13_120/0.14)]",
    badgeText: "text-[oklch(0.38_0.10_120)]",
    badgeLabel: "Jaculatória",
  },
  anjo_da_guarda: {
    icon: Shield,
    accent: "oklch(0.57 0.10 42)",
    surface: "bg-[oklch(0.99_0.01_45)]",
    ring: "border-[oklch(0.84_0.07_42/0.45)] hover:border-[oklch(0.72_0.11_42/0.75)]",
    iconBg: "bg-[oklch(0.57_0.10_42/0.16)]",
    iconColor: "text-[oklch(0.42_0.09_42)]",
    badgeBg: "bg-[oklch(0.57_0.10_42/0.14)]",
    badgeText: "text-[oklch(0.38_0.08_42)]",
    badgeLabel: "Proteção",
  },
  novena: {
    icon: Crown,
    accent: "oklch(0.51 0.11 260)",
    surface: "bg-[oklch(0.97_0.01_260)]",
    ring: "border-[oklch(0.77_0.08_260/0.5)] hover:border-[oklch(0.64_0.11_260/0.78)]",
    iconBg: "bg-[oklch(0.51_0.11_260/0.18)]",
    iconColor: "text-[oklch(0.39_0.09_260)]",
    badgeBg: "bg-[oklch(0.51_0.11_260/0.16)]",
    badgeText: "text-[oklch(0.35_0.08_260)]",
    badgeLabel: "Novena",
  },
  meditacao: {
    icon: Heart,
    accent: "oklch(0.58 0.14 18)",
    surface: "bg-[oklch(0.98_0.01_22)]",
    ring: "border-[oklch(0.82_0.09_18/0.5)] hover:border-[oklch(0.69_0.13_18/0.78)]",
    iconBg: "bg-[oklch(0.58_0.14_18/0.18)]",
    iconColor: "text-[oklch(0.44_0.12_18)]",
    badgeBg: "bg-[oklch(0.58_0.14_18/0.16)]",
    badgeText: "text-[oklch(0.38_0.10_18)]",
    badgeLabel: "Meditação",
  },
};

const DEFAULT_PRAYER_CARD_THEME: PrayerCardTheme = {
  icon: PrayingHandsIcon as unknown as typeof Crown,
  accent: "oklch(0.48 0.09 260)",
  surface: "bg-[oklch(0.98_0.01_260)]",
  ring: "border-[oklch(0.78_0.08_260/0.45)] hover:border-[oklch(0.65_0.10_260/0.75)]",
  iconBg: "bg-[oklch(0.48_0.09_260/0.16)]",
  iconColor: "text-[oklch(0.36_0.08_260)]",
  badgeBg: "bg-[oklch(0.48_0.09_260/0.14)]",
  badgeText: "text-[oklch(0.33_0.07_260)]",
  badgeLabel: "Oração",
};

export default function Prayers() {
  const { isAuthenticated, loading } = useAuth();
  const [location] = useLocation();
  const [selectedPrayer, setSelectedPrayer] = useState<Prayer | null>(null);
  const [praying, setPraying] = useState(false);
  const { data: subscription } = trpc.subscriptions.getActive.useQuery(undefined, { enabled: isAuthenticated });
  const logPrayer = trpc.prayers.logPrayer.useMutation();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    if (id) {
      const match = PRAYERS.find(p => p.id === id);
      if (match) {
        setSelectedPrayer(match);
        setPraying(false);
      }
    }
  }, [location]);

  const isPremium = true;

  const getPrayerCardTheme = (prayerType: string) => PRAYER_CARD_THEMES[prayerType] ?? DEFAULT_PRAYER_CARD_THEME;

  const handleCompletePrayerSilent = async (prayer: Prayer) => {
    if (!isAuthenticated) return;
    try {
      await logPrayer.mutateAsync({ prayerType: prayer.type, prayerName: prayer.name });
      toast.success("Oração registrada!", { description: `${prayer.name} adicionada ao seu histórico.` });
    } catch (err) {
      console.error("Erro ao registrar oração:", err);
    }
  };

  const handleOpenPrayer = (prayer: Prayer) => {
    if (prayer.category === "premium" && !isPremium) return;
    setSelectedPrayer(prayer);
    setPraying(false);

    // Automatically register text-only prayers when opened
    if (!prayer.audioUrl) {
      handleCompletePrayerSilent(prayer);
    }
  };

  const handleCompletePrayer = async (prayer: Prayer) => {
    if (!isAuthenticated) return;
    try {
      await logPrayer.mutateAsync({ prayerType: prayer.type, prayerName: prayer.name });
      toast.success("Oração registrada!", { description: `${prayer.name} adicionada ao seu histórico.` });
      setSelectedPrayer(null);
    } catch (err) {
      console.error("Erro ao registrar oração:", err);
      toast.error("Não foi possível registrar sua oração agora.");
    }
  };

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
          <p className="text-muted-foreground mb-6">Entre para rezar com as orações do app.</p>
          <a href={getLoginUrl()}><Button>Entrar</Button></a>
        </div>
      </div>
    );
  }

  const basicPrayers = PRAYERS.filter(p => p.category === "basic");
  const premiumPrayers = PRAYERS.filter(p => p.category === "premium");

  return (
    <div className="min-h-screen bg-[oklch(0.97_0.01_85)]">
      <main className="container py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-2 mb-2">
            <PrayingHandsIcon size={20} className="text-[oklch(0.55_0.14_15)]" />
            <span className="text-sm text-muted-foreground font-medium">Orações</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-[oklch(0.22_0.07_260)] mb-2">
            Orações Diárias
          </h1>
          <p className="font-serif text-muted-foreground">
            Reze com devoção e guarde no histórico a constância da sua vida de oração.
          </p>
        </div>

        {/* Rosário em destaque */}
        <div className="mb-8 rounded-2xl bg-[oklch(0.22_0.07_260)] p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-pattern-cross opacity-20" />
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="badge-premium">Destaque</span>
              </div>
              <h2 className="font-display text-xl font-bold text-white mb-1">Rosário</h2>
              <p className="text-sm text-[oklch(0.75_0.03_260)]">Reze o Santo Rosário com guia completo, mistérios e apoio visual para favorecer o recolhimento.</p>
            </div>
            <Link href="/rosario">
              <Button className="bg-[oklch(0.75_0.12_75)] hover:bg-[oklch(0.70_0.13_73)] text-[oklch(0.15_0.02_260)] font-semibold whitespace-nowrap">
                Rezar o Rosário
                <ChevronRight size={15} className="ml-1" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Vela Virtual em destaque */}
        <div className="mb-8 rounded-2xl bg-[oklch(0.12_0.03_260)] p-6 relative overflow-hidden border border-[oklch(0.82_0.10_80/0.18)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_oklch(0.82_0.10_80/0.12),_transparent_40%),radial-gradient(circle_at_bottom_left,_oklch(0.55_0.14_15/0.10),_transparent_36%)]" />
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="badge-premium">Novo espaço</span>
              </div>
              <h2 className="font-display text-xl font-bold text-white mb-1">Vela Virtual</h2>
              <p className="text-sm text-[oklch(0.78_0.03_260)]">Uma chama acesa, música discreta e um espaço sóbrio para oração pessoal e silêncio interior.</p>
            </div>
            <Link href="/vela-virtual">
              <Button className="bg-[oklch(0.82_0.10_80)] hover:bg-[oklch(0.77_0.10_80)] text-[oklch(0.15_0.02_260)] font-semibold whitespace-nowrap">
                Abrir Vela Virtual
                <Flame size={15} className="ml-1" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Orações Básicas */}
        <div className="mb-8">
          <h2 className="font-display text-xl font-bold text-[oklch(0.22_0.07_260)] mb-4">
            Orações Tradicionais
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
            {basicPrayers.map((prayer) => (
              (() => {
                const theme = getPrayerCardTheme(prayer.type);
                const Icon = theme.icon;
                return (
                  <button
                    key={prayer.id}
                    onClick={() => handleOpenPrayer(prayer)}
                    className={`group relative rounded-2xl border p-4 text-left transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${theme.surface} ${theme.ring}`}
                  >
                    <div className="absolute inset-x-0 top-0 h-1.5 rounded-t-2xl" style={{ backgroundColor: theme.accent }} />
                    <div className="mb-3 flex items-start justify-between gap-2 pt-1">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${theme.iconBg}`}>
                        <Icon size={18} className={theme.iconColor} />
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={`rounded-full px-2 py-1 text-[10px] font-semibold tracking-[0.03em] ${theme.badgeBg} ${theme.badgeText}`}>
                          {theme.badgeLabel}
                        </span>
                        <div className="flex gap-1 flex-wrap justify-end">
                          {prayer.audioUrl && (
                            <span className="rounded-full bg-[oklch(0.75_0.12_75/0.2)] text-[oklch(0.65_0.12_70)] px-1.5 py-0.5 flex items-center gap-0.5">
                              <Volume2 size={10} />
                              <span className="text-[9px] font-semibold tracking-[0.03em]">Áudio</span>
                            </span>
                          )}
                          <span className="rounded-full bg-black/10 px-2 py-1 flex items-center gap-1 text-[oklch(0.25_0.05_260)]">
                            <Clock size={11} />
                            <span className="text-[10px] font-semibold tracking-[0.03em]">{prayer.duration}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-display text-base font-bold text-[oklch(0.22_0.07_260)] mb-1 line-clamp-2">{prayer.name}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{prayer.description}</p>
                    </div>
                  </button>
                );
              })()
            ))}
          </div>
        </div>

        {/* Orações Premium */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="font-display text-xl font-bold text-[oklch(0.22_0.07_260)]">
              Conteúdo Premium
            </h2>
            <span className="badge-premium flex items-center gap-1">
              <Crown size={10} /> Premium
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
            {premiumPrayers.map((prayer) => (
              (() => {
                const theme = getPrayerCardTheme(prayer.type);
                const Icon = theme.icon;
                return (
                  <button
                    key={prayer.id}
                    onClick={() => handleOpenPrayer(prayer)}
                    className={`group relative rounded-2xl border p-4 text-left transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${theme.surface} ${theme.ring} ${!isPremium ? "opacity-90" : ""}`}
                  >
                {!isPremium && (
                  <div className="absolute inset-0 rounded-2xl bg-[oklch(0.97_0.01_85/0.48)] backdrop-blur-[2px] flex items-center justify-center z-20">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-[oklch(0.75_0.12_75/0.15)] border border-[oklch(0.75_0.12_75/0.4)] flex items-center justify-center">
                        <Lock size={16} className="text-[oklch(0.65_0.12_70)]" />
                      </div>
                      <span className="text-xs font-semibold text-[oklch(0.40_0.08_260)]">Premium</span>
                    </div>
                  </div>
                )}
                <div className="absolute inset-x-0 top-0 h-1.5 rounded-t-2xl" style={{ backgroundColor: theme.accent }} />
                <div className="mb-3 flex items-start justify-between gap-2 pt-1 relative z-10">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${theme.iconBg}`}>
                    <Icon size={18} className={theme.iconColor} />
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`rounded-full px-2 py-1 text-[10px] font-semibold tracking-[0.03em] ${theme.badgeBg} ${theme.badgeText}`}>
                      {theme.badgeLabel}
                    </span>
                    <div className="flex gap-1 flex-wrap justify-end">
                      {prayer.audioUrl && (
                        <span className="rounded-full bg-[oklch(0.75_0.12_75/0.2)] text-[oklch(0.65_0.12_70)] px-1.5 py-0.5 flex items-center gap-0.5">
                          <Volume2 size={10} />
                          <span className="text-[9px] font-semibold tracking-[0.03em]">Áudio</span>
                        </span>
                      )}
                      <span className="rounded-full bg-[oklch(0.82_0.10_80/0.88)] text-[oklch(0.17_0.02_260)] px-2 py-1 flex items-center gap-1">
                        <Crown size={11} />
                        <span className="text-[10px] font-semibold tracking-[0.03em]">Premium</span>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="relative z-10">
                  <h3 className="font-display text-base font-bold text-[oklch(0.22_0.07_260)] mb-1 line-clamp-2">{prayer.name}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 mb-3">{prayer.description}</p>
                  <div className="inline-flex rounded-full bg-black/10 px-2 py-1 items-center gap-1 text-[oklch(0.25_0.05_260)]">
                    <Clock size={11} />
                    <span className="text-[10px] font-semibold tracking-[0.03em]">{prayer.duration}</span>
                  </div>
                </div>
              </button>
                );
              })()
            ))}
          </div>

          {!isPremium && (
            <div className="mt-6 rounded-xl border border-[oklch(0.75_0.12_75/0.3)] bg-[oklch(0.75_0.12_75/0.05)] p-5 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Crown size={20} className="text-[oklch(0.65_0.12_70)]" />
                <div>
                  <p className="font-semibold text-sm text-[oklch(0.22_0.07_260)]">Desbloqueie todo o conteúdo</p>
                  <p className="text-xs text-muted-foreground">Novenas, meditações e áudios para aprofundar sua vida de oração.</p>
                </div>
              </div>
              <Link href="/premium">
                <Button className="bg-[oklch(0.22_0.07_260)] hover:bg-[oklch(0.28_0.08_260)] text-white font-semibold text-sm whitespace-nowrap">
                  Ver Planos Premium
                </Button>
              </Link>
            </div>
          )}
        </div>
      </main>

      {/* Modal de Oração */}
      <Dialog open={!!selectedPrayer} onOpenChange={() => setSelectedPrayer(null)}>
        <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto [&>[data-slot=dialog-close]_svg]:!size-5" aria-describedby={undefined}>
          {selectedPrayer && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div>
                    <DialogTitle className="font-display text-xl text-[oklch(0.22_0.07_260)]">
                      {selectedPrayer.name}
                    </DialogTitle>
                    <p className="text-xs text-muted-foreground">{selectedPrayer.description}</p>
                  </div>
                </div>
                <div className="divider-gold" />
              </DialogHeader>

              {selectedPrayer.audioUrl ? (
                <div className="py-2">
                  <AudioPlayer
                    audioUrl={selectedPrayer.audioUrl}
                    title={selectedPrayer.name}
                    description={selectedPrayer.description}
                    supportTitle="Texto da Oração"
                    supportDescription="Acompanhe a leitura"
                    supportText={selectedPrayer.content}
                    onTrackEnd={() => handleCompletePrayer(selectedPrayer)}
                  />
                </div>
              ) : (
                <div className="prose-prayer whitespace-pre-line py-4">
                  {selectedPrayer.content}
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
