import { useMemo, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import NovenaAudioDock from "@/components/NovenaAudioDock";
import AppNav from "@/components/AppNav";
import { trpc } from "@/lib/trpc";
import { getNovenaBySlug } from "@/data/novenas";
import { Crown, Lock, CheckCircle2, ListMusic, PlayCircle, ArrowLeft } from "lucide-react";
import { Link, useRoute } from "wouter";
import { toast } from "sonner";
import { getNovenaArt } from "@/lib/cardArt";

const LOGO_IMG = "/assets/sanctificare-logo.webp";
const PROGRESS_KEY = "sanctificare.novenas.progress.v1";
const INITIAL_PRAYER_MARKER = "ORAÇÃO INICIAL PARA TODOS OS DIAS";
const FINAL_PRAYER_MARKER = "ORAÇÃO FINAL PARA TODOS OS DIAS";

type ProgressMap = Record<string, number[]>;

function readProgress(): ProgressMap {
  if (typeof window === "undefined") return {};

  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as ProgressMap;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeProgress(progress: ProgressMap) {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
}

function splitCommonPrayers(prayerText: string) {
  const initialIndex = prayerText.indexOf(INITIAL_PRAYER_MARKER);
  const finalIndex = prayerText.indexOf(FINAL_PRAYER_MARKER);

  if (initialIndex === -1 || finalIndex === -1 || finalIndex <= initialIndex) {
    return null;
  }

  const initialBody = prayerText
    .slice(initialIndex + INITIAL_PRAYER_MARKER.length, finalIndex)
    .trim();
  const finalBody = prayerText
    .slice(finalIndex + FINAL_PRAYER_MARKER.length)
    .trim();

  return { initialBody, finalBody };
}

export default function NovenaDetails() {
  const [matched, params] = useRoute<{ slug: string }>("/novenas/:slug");
  const { isAuthenticated, loading } = useAuth();
  const [selectedDay, setSelectedDay] = useState(1);
  const [progress, setProgress] = useState<ProgressMap>(() => readProgress());
  const { data: subscription } = trpc.subscriptions.getActive.useQuery(undefined, { enabled: isAuthenticated });

  const isPremium = !!subscription;
  const selectedNovena = useMemo(() => {
    if (!matched || !params?.slug) return undefined;
    return getNovenaBySlug(params.slug);
  }, [matched, params?.slug]);

  const safeDay = Math.min(Math.max(selectedDay, 1), selectedNovena?.days.length ?? 1);
  const currentDayContent = selectedNovena?.days.find((d) => d.day === safeDay);

  const isLocked = selectedNovena?.category === "premium" && !isPremium;
  const currentCompleted = selectedNovena ? progress[selectedNovena.id] ?? [] : [];

  const toggleDayAsComplete = () => {
    if (!selectedNovena) return;
    if (isLocked) return;

    const done = progress[selectedNovena.id] ?? [];
    const alreadyDone = done.includes(safeDay);
    const nextDays = alreadyDone ? done.filter((day) => day !== safeDay) : [...done, safeDay].sort((a, b) => a - b);

    const nextProgress = {
      ...progress,
      [selectedNovena.id]: nextDays,
    };

    setProgress(nextProgress);
    writeProgress(nextProgress);

    if (alreadyDone) {
      toast.info(`Dia ${safeDay} desmarcado.`);
      return;
    }

    toast.success(`Dia ${safeDay} concluído. Persevere com fé na sua novena.`);
  };

  const getShortDayTitle = (title: string) => {
    const parts = title.split(":");
    return parts.length > 1 ? parts.slice(1).join(":").trim() : title;
  };

  const sagradoCoracaoPrayerSections = useMemo(() => {
    if (!currentDayContent) return null;
    if (selectedNovena?.id !== "novena-sagrado-coracao-jesus") return null;
    return splitCommonPrayers(currentDayContent.prayer);
  }, [currentDayContent, selectedNovena?.id]);

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
          <p className="text-muted-foreground mb-6">Entre para acompanhar esta novena e seus dias de oração.</p>
          <a href={getLoginUrl()}><Button>Entrar</Button></a>
        </div>
      </div>
    );
  }

  if (!selectedNovena) {
    return (
      <div className="min-h-screen bg-[oklch(0.965_0.012_82)]">
        <AppNav />
        <main className="container py-10">
          <div className="rounded-2xl border border-[oklch(0.72_0.10_75/0.3)] bg-[oklch(1_0_0/0.82)] p-8 text-center">
            <h1 className="font-display text-2xl font-bold text-[oklch(0.22_0.07_260)] mb-2">Novena não encontrada</h1>
            <p className="text-muted-foreground mb-5">Esta rota de novena não existe ou foi removida.</p>
            <Link href="/novenas">
              <Button>Voltar ao catálogo</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[oklch(0.965_0.012_82)] relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_oklch(0.90_0.04_85/0.40),_transparent_55%),linear-gradient(180deg,_oklch(1_0_0/0.30),_transparent)]" />
      <div className="pointer-events-none absolute inset-0 bg-pattern-cross opacity-25" />
      <AppNav />

      <main className={`container py-10 relative z-10 ${currentDayContent?.audioUrl && !isLocked ? "pb-36" : ""}`}>
        <div className="mb-5">
          <Link href="/novenas">
            <button className="inline-flex items-center gap-2 text-sm font-medium text-[oklch(0.30_0.07_260)] hover:text-[oklch(0.24_0.07_260)] transition-colors">
              <ArrowLeft size={16} />
              Voltar ao catálogo de novenas
            </button>
          </Link>
        </div>

        <section className="rounded-2xl border border-[oklch(0.72_0.10_75/0.32)] bg-[linear-gradient(165deg,_oklch(1_0_0/0.88),_oklch(0.96_0.015_83/0.96))] p-6 shadow-[0_12px_40px_oklch(0.22_0.07_260/0.08)]">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <img
                  src={getNovenaArt(selectedNovena.id).image}
                  alt={selectedNovena.name}
                  className="w-9 h-9 rounded-lg object-cover border border-[oklch(0.72_0.10_75/0.35)]"
                  loading="lazy"
                />
                <h1 className="font-serif text-2xl font-semibold text-[oklch(0.22_0.07_260)] leading-tight">{selectedNovena.name}</h1>
                {selectedNovena.category === "premium" ? (
                  <span className="badge-premium flex items-center gap-1"><Crown size={10} /> Premium</span>
                ) : null}
              </div>
              <p className="text-sm text-muted-foreground">{selectedNovena.subtitle}</p>
            </div>

            <div className="text-right">
              <p className="text-xs text-muted-foreground">Progresso</p>
              <p className="font-semibold text-sm text-[oklch(0.22_0.07_260)]">{currentCompleted.length}/9 dias</p>
            </div>
          </div>

          {currentDayContent ? (
            <>
              <div className="grid grid-cols-1 xl:grid-cols-[320px_minmax(0,1fr)] gap-5 mb-6">
                <div className="rounded-2xl border border-[oklch(0.72_0.10_75/0.35)] bg-[linear-gradient(155deg,_oklch(0.30_0.10_258),_oklch(0.22_0.07_260))] p-5 text-white shadow-[0_12px_30px_oklch(0.22_0.07_260/0.25)]">
                  <div className="rounded-xl border border-white/20 bg-white/10 p-4 mb-4">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-[oklch(0.87_0.05_85)] mb-1">Sessão atual</p>
                    <h2 className="font-serif text-2xl leading-tight mb-2">Dia {safeDay}</h2>
                    <p className="text-sm text-[oklch(0.94_0.02_85)] line-clamp-3">
                      {currentDayContent.title}
                    </p>
                  </div>

                  <Button
                    onClick={() => setSelectedDay(safeDay)}
                    disabled={isLocked}
                    className="w-full bg-[oklch(0.75_0.12_75)] hover:bg-[oklch(0.70_0.13_73)] text-[oklch(0.15_0.02_260)] font-semibold"
                  >
                    <PlayCircle size={16} className="mr-2" />
                    Reproduzir sessão do dia
                  </Button>

                  <p className="text-sm text-[oklch(0.91_0.02_85)] mt-4 leading-relaxed font-serif">
                    {selectedNovena.description}
                  </p>
                </div>

                <div className="rounded-2xl border border-[oklch(0.72_0.10_75/0.28)] bg-[oklch(1_0_0/0.72)] p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <ListMusic size={16} className="text-[oklch(0.62_0.11_72)]" />
                      <p className="text-xs uppercase tracking-[0.12em] font-semibold text-[oklch(0.30_0.07_260)]">Sessões da novena</p>
                    </div>
                    <span className="text-xs text-muted-foreground">9 dias</span>
                  </div>

                  <div className="max-h-[360px] overflow-y-auto pr-1 space-y-2">
                    {selectedNovena.days.map((dayItem) => {
                      const done = currentCompleted.includes(dayItem.day);
                      const active = dayItem.day === safeDay;

                      return (
                        <button
                          key={dayItem.day}
                          onClick={() => setSelectedDay(dayItem.day)}
                          disabled={isLocked}
                          className={`w-full text-left rounded-xl border p-3 transition-all ${
                            active
                              ? "border-[oklch(0.65_0.12_70)] bg-[oklch(0.82_0.09_80/0.16)]"
                              : "border-border bg-white/80 hover:border-[oklch(0.65_0.12_70/0.35)]"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-7 h-7 rounded-full border flex items-center justify-center text-xs font-semibold ${
                              active
                                ? "border-[oklch(0.65_0.12_70)] text-[oklch(0.28_0.07_260)]"
                                : "border-[oklch(0.22_0.07_260/0.25)] text-muted-foreground"
                            } ${done ? "ring-1 ring-[oklch(0.45_0.12_150/0.55)]" : ""}`}>
                              {dayItem.day}
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="font-serif text-base font-semibold text-[oklch(0.22_0.07_260)] leading-tight truncate">
                                {getShortDayTitle(dayItem.title)}
                              </p>
                              <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                                {dayItem.reflection}
                              </p>
                            </div>

                            <PlayCircle size={16} className="text-[oklch(0.22_0.07_260)] mt-1 flex-shrink-0" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {isLocked ? (
                <div className="rounded-xl border border-[oklch(0.75_0.12_75/0.35)] bg-[oklch(0.75_0.12_75/0.06)] p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-[oklch(0.75_0.12_75/0.14)] border border-[oklch(0.75_0.12_75/0.35)] flex items-center justify-center mx-auto mb-3">
                    <Lock size={18} className="text-[oklch(0.65_0.12_70)]" />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-[oklch(0.22_0.07_260)] mb-1">Conteúdo premium</h3>
                  <p className="text-sm text-muted-foreground mb-4">Assine para acessar esta novena completa e continuar seu caminho de oração com todos os dias disponíveis.</p>
                  <Link href="/premium">
                    <Button className="bg-[oklch(0.22_0.07_260)] hover:bg-[oklch(0.28_0.08_260)] text-white font-semibold">
                      <Crown size={14} className="mr-2" />
                      Tornar-se Premium
                    </Button>
                  </Link>
                </div>
              ) : (
                <>
                  <div className="divider-gold mb-4" />
                  <h3 className="font-serif text-2xl md:text-[1.85rem] font-semibold text-[oklch(0.22_0.07_260)] mb-2 leading-tight">
                    {currentDayContent.title}
                  </h3>

                  {sagradoCoracaoPrayerSections ? (
                    <div className="space-y-5 mb-5">
                      <div className="rounded-xl border border-[oklch(0.72_0.10_75/0.22)] bg-[oklch(1_0_0/0.62)] p-5">
                        <h4 className="font-display text-sm font-semibold uppercase tracking-[0.08em] text-[oklch(0.30_0.07_260)] mb-3">
                          ORAÇÃO INICIAL PARA TODOS OS DIAS
                        </h4>
                        <p className="whitespace-pre-line font-serif text-[1.06rem] leading-8 text-[oklch(0.26_0.03_260)]">
                          {sagradoCoracaoPrayerSections.initialBody}
                        </p>
                      </div>

                      <div className="rounded-xl border border-[oklch(0.60_0.09_145/0.35)] bg-[oklch(0.96_0.03_145/0.65)] p-5">
                        <h4 className="font-display text-sm font-semibold uppercase tracking-[0.08em] text-[oklch(0.34_0.09_145)] mb-3">
                          {`ORAÇÃO DO DIA ${safeDay}`}
                        </h4>
                        <p className="whitespace-pre-line font-serif text-[1.08rem] leading-8 text-[oklch(0.24_0.05_165)]">
                          {currentDayContent.reflection}
                        </p>
                      </div>

                      <div className="rounded-xl border border-[oklch(0.72_0.10_75/0.22)] bg-[oklch(1_0_0/0.62)] p-5">
                        <h4 className="font-display text-sm font-semibold uppercase tracking-[0.08em] text-[oklch(0.30_0.07_260)] mb-3">
                          ORAÇÃO FINAL PARA TODOS OS DIAS
                        </h4>
                        <p className="whitespace-pre-line font-serif text-[1.06rem] leading-8 text-[oklch(0.26_0.03_260)]">
                          {sagradoCoracaoPrayerSections.finalBody}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-base md:text-lg text-[oklch(0.38_0.03_260)] mb-4 font-serif leading-relaxed">
                        {currentDayContent.reflection}
                      </p>
                      <div className="prose-prayer whitespace-pre-line mb-5 rounded-xl border border-[oklch(0.72_0.10_75/0.20)] bg-[oklch(1_0_0/0.60)] p-5 font-serif text-[1.1rem] leading-8 text-[oklch(0.26_0.03_260)]">
                        {currentDayContent.prayer}
                      </div>
                    </>
                  )}
                  <Button
                    onClick={toggleDayAsComplete}
                    className="bg-[oklch(0.22_0.07_260)] hover:bg-[oklch(0.28_0.08_260)] text-white font-semibold"
                  >
                    <CheckCircle2 size={15} className="mr-2" />
                    {currentCompleted.includes(safeDay) ? "Desmarcar dia" : `Marcar o dia ${safeDay} como rezado`}
                  </Button>
                </>
              )}
            </>
          ) : (
            <div className="text-center py-10">
              <p className="text-muted-foreground">Conteúdo da novena não encontrado.</p>
            </div>
          )}
        </section>
      </main>

      {currentDayContent?.audioUrl && !isLocked ? (
        <NovenaAudioDock
          audioUrl={currentDayContent.audioUrl}
          title={selectedNovena.name}
          subtitle={`Dia ${safeDay}: ${currentDayContent.title}`}
        />
      ) : null}
    </div>
  );
}
