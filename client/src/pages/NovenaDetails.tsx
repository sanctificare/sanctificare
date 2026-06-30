import { useMemo, useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import NovenaAudioDock from "@/components/NovenaAudioDock";
import AppNav from "@/components/AppNav";
import { trpc } from "@/lib/trpc";
import { getNovenaBySlug } from "@/data/novenas";
import { Crown, Lock, CheckCircle2, PlayCircle, ArrowLeft, Heart, Info } from "lucide-react";
import { Link, useRoute } from "wouter";
import { toast } from "sonner";
import { getNovenaArt } from "@/lib/cardArt";

const LOGO_IMG = "/assets/logo-sanctificare.webp";
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
  
  // Lê o dia do parâmetro de busca (query param) ou inicia no dia 1
  const [selectedDay, setSelectedDay] = useState(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const dayParam = searchParams.get("day");
      if (dayParam) {
        const parsed = parseInt(dayParam, 10);
        if (parsed >= 1 && parsed <= 9) return parsed;
      }
    }
    return 1;
  });

  const [progress, setProgress] = useState<ProgressMap>(() => readProgress());
  const { data: subscription } = trpc.subscriptions.getActive.useQuery(undefined, { enabled: isAuthenticated });
  
  const utils = trpc.useUtils();
  const logPrayer = trpc.prayers.logPrayer.useMutation();

  const isPremium = true;
  
  const selectedNovena = useMemo(() => {
    if (!matched || !params?.slug) return undefined;
    return getNovenaBySlug(params.slug);
  }, [matched, params?.slug]);

  const safeDay = Math.min(Math.max(selectedDay, 1), selectedNovena?.days.length ?? 1);
  const currentDayContent = selectedNovena?.days.find((d) => d.day === safeDay);

  const isLocked = selectedNovena?.category === "premium" && !isPremium;
  const currentCompleted = selectedNovena ? progress[selectedNovena.id] ?? [] : [];

  // Intenção Particular da Novena
  const [intention, setIntention] = useState("");
  const [isEditingIntention, setIsEditingIntention] = useState(false);
  const [tempIntention, setTempIntention] = useState("");

  useEffect(() => {
    if (selectedNovena && typeof window !== "undefined") {
      const saved = localStorage.getItem(`sanctificare.novenas.intention.${selectedNovena.id}`) || "";
      setIntention(saved);
      setTempIntention(saved);
    }
  }, [selectedNovena]);

  const saveIntention = () => {
    if (!selectedNovena) return;
    localStorage.setItem(`sanctificare.novenas.intention.${selectedNovena.id}`, tempIntention);
    setIntention(tempIntention);
    setIsEditingIntention(false);
    toast.success("Intenção salva com sucesso!");
  };

  const toggleDayAsComplete = async () => {
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

    try {
      await logPrayer.mutateAsync({
        prayerType: "novena",
        prayerName: `${selectedNovena.name} - Dia ${safeDay}`
      });
      toast.success(`Dia ${safeDay} concluído. Persevere com fé na sua novena.`);
      await utils.prayers.getRecentLogs.invalidate();
      await utils.prayers.getAllLogs.invalidate();
    } catch (err) {
      console.error("[Novena log error]", err);
      toast.success(`Dia ${safeDay} marcado localmente.`);
    }
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
          <div className="rounded-2xl border border-[oklch(0.72_0.10_75/0.3)] bg-white p-8 text-center">
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

        {/* Layout Principal em 2 Colunas */}
        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 items-start">
          
          {/* Coluna Esquerda: Informações, Progresso e Intenção */}
          <div className="space-y-4">
            
            {/* Cartão de Informações da Novena */}
            <div className="rounded-2xl border border-[oklch(0.72_0.10_75/0.32)] bg-white p-5 shadow-[0_12px_40px_oklch(0.22_0.07_260/0.08)]">
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={getNovenaArt(selectedNovena.id).image}
                  alt={selectedNovena.name}
                  className="w-12 h-12 rounded-xl object-cover border border-[oklch(0.72_0.10_75/0.35)]"
                  loading="lazy"
                />
                <div>
                  <h1 className="font-serif text-lg font-semibold text-[oklch(0.22_0.07_260)] leading-tight">{selectedNovena.name}</h1>
                  <p className="text-xs text-muted-foreground mt-0.5">{selectedNovena.subtitle}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed font-sans mb-3">
                {selectedNovena.description}
              </p>
              <div className="flex items-center justify-between border-t border-border pt-3">
                <span className="text-xs font-semibold text-muted-foreground">Progresso</span>
                <span className="text-xs font-bold text-[oklch(0.22_0.07_260)]">{currentCompleted.length}/9 dias concluídos</span>
              </div>
            </div>

            {/* Barra de Progresso de 9 Dias (Estilo Hallow) */}
            <div className="rounded-2xl border border-[oklch(0.72_0.10_75/0.32)] bg-white p-5 shadow-[0_12px_40px_oklch(0.22_0.07_260/0.08)]">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold mb-3">Progresso da Jornada</p>
              <div className="grid grid-cols-5 gap-2 justify-items-center">
                {Array.from({ length: 9 }, (_, idx) => {
                  const dayNum = idx + 1;
                  const isDone = currentCompleted.includes(dayNum);
                  const isActive = dayNum === safeDay;

                  return (
                    <button
                      key={dayNum}
                      onClick={() => setSelectedDay(dayNum)}
                      disabled={isLocked}
                      className={`relative w-10 h-10 rounded-full flex items-center justify-center font-sans text-xs font-bold transition-all ${
                        isActive
                          ? "bg-[oklch(0.22_0.07_260)] text-white ring-2 ring-[oklch(0.75_0.12_75)] scale-110 shadow-sm"
                          : isDone
                          ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20"
                          : "bg-muted/40 hover:bg-muted text-muted-foreground border border-transparent"
                      }`}
                      title={`Ir para o Dia ${dayNum}`}
                    >
                      {isDone ? (
                        <CheckCircle2 size={15} className="text-emerald-600 fill-emerald-600/10" />
                      ) : (
                        dayNum
                      )}
                      
                      {isActive && (
                        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[oklch(0.75_0.12_75)]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Caixa de Intenção Particular (Estilo Hallow) */}
            <div className="rounded-2xl border border-[oklch(0.72_0.10_75/0.32)] bg-white p-5 shadow-[0_12px_40px_oklch(0.22_0.07_260/0.08)]">
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-1.5">
                  <Heart size={14} className="text-rose-500 fill-rose-500/10" />
                  <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold">Minha Intenção</span>
                </div>
                {!isEditingIntention && (
                  <button
                    onClick={() => setIsEditingIntention(true)}
                    className="text-xs text-[oklch(0.65_0.12_70)] hover:underline font-semibold"
                  >
                    {intention ? "Editar" : "Escrever"}
                  </button>
                )}
              </div>

              {isEditingIntention ? (
                <div className="space-y-2">
                  <textarea
                    value={tempIntention}
                    onChange={(e) => setTempIntention(e.target.value)}
                    placeholder="Escreva aqui sua intenção particular para esta novena (ex: pela cura de um familiar, por paz espiritual, etc.)..."
                    className="w-full text-xs rounded-lg border border-border p-2.5 bg-background text-foreground focus:ring-1 focus:ring-[oklch(0.75_0.12_75)] outline-none min-h-[80px] resize-none font-sans"
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-xs h-7 px-2"
                      onClick={() => {
                        setTempIntention(intention);
                        setIsEditingIntention(false);
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button
                      size="sm"
                      className="bg-[oklch(0.22_0.07_260)] hover:bg-[oklch(0.28_0.08_260)] text-white text-[11px] font-semibold h-7 px-3"
                      onClick={saveIntention}
                    >
                      Salvar
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-xs font-serif italic text-[oklch(0.38_0.03_260)] leading-relaxed pl-2.5 border-l-2 border-[oklch(0.75_0.12_75)]">
                  {intention ? (
                    `"${intention}"`
                  ) : (
                    <span className="text-muted-foreground/60 not-italic font-sans text-[11px]">
                      Você ainda não definiu sua intenção para esta novena. Toque em "Escrever" para colocar sua súplica diante do Senhor.
                    </span>
                  )}
                </p>
              )}
            </div>

          </div>

          {/* Coluna Direita: Conteúdo de Leitura do Dia */}
          <div className="rounded-2xl border border-[oklch(0.72_0.10_75/0.32)] bg-white p-6 shadow-[0_12px_40px_oklch(0.22_0.07_260/0.08)]">
            {currentDayContent ? (
              <>
                {isLocked ? (
                  <div className="py-12 text-center">
                    <div className="w-14 h-14 rounded-full bg-[oklch(0.75_0.12_75/0.14)] border border-[oklch(0.75_0.12_75/0.35)] flex items-center justify-center mx-auto mb-4">
                      <Lock size={22} className="text-[oklch(0.65_0.12_70)]" />
                    </div>
                    <h3 className="font-display text-xl font-bold text-[oklch(0.22_0.07_260)] mb-2">Esta é uma Novena Premium</h3>
                    <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-6">Assine o Sanctificare Premium para ter acesso irrestrito a todas as novenas, meditações e reflexões diárias.</p>
                    <Link href="/premium">
                      <Button className="bg-[oklch(0.22_0.07_260)] hover:bg-[oklch(0.28_0.08_260)] text-white font-semibold">
                        <Crown size={15} className="mr-2" />
                        Desbloquear com Premium
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-6">
                    
                    {/* Cabeçalho do Dia */}
                    <div className="border-b border-border/50 pb-4">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-[oklch(0.75_0.12_75)]">Dia {safeDay}</span>
                      <h2 className="font-serif text-2xl md:text-3xl font-bold text-[oklch(0.22_0.07_260)] mt-1 leading-tight">
                        {currentDayContent.title}
                      </h2>
                      {currentDayContent.audioUrl && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2 font-medium">
                          <Info size={12} className="text-[oklch(0.75_0.12_75)]" />
                          <span>Áudio guiado disponível no dock inferior ao reproduzir.</span>
                        </div>
                      )}
                    </div>

                    {/* Exibição permanentemente destacada da Intenção do usuário durante a leitura */}
                    {intention && (
                      <div className="rounded-xl border border-rose-100 bg-rose-50/20 p-3.5 flex gap-2.5 items-start">
                        <Heart size={14} className="text-rose-500 fill-rose-500/20 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="text-[10px] uppercase tracking-wider font-bold text-rose-700/80">Rezando por esta Intenção:</span>
                          <p className="text-xs font-serif italic text-rose-900/90 leading-normal mt-0.5">"{intention}"</p>
                        </div>
                      </div>
                    )}

                    {/* Reflexão do Dia */}
                    <div className="space-y-2">
                      <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Meditação</span>
                      <p className="text-sm font-sans leading-relaxed text-foreground/90 bg-muted/20 p-4 rounded-xl border border-border/25">
                        {currentDayContent.reflection}
                      </p>
                    </div>

                    {/* Oração do Dia */}
                    <div className="space-y-2">
                      <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Oração</span>
                      
                      {sagradoCoracaoPrayerSections ? (
                        <div className="space-y-4 font-sans text-sm leading-relaxed text-foreground/90">
                          <div className="p-4 rounded-xl border border-border/40 bg-muted/10">
                            <h4 className="font-display text-xs font-bold uppercase tracking-wider text-[oklch(0.30_0.07_260)] mb-2">
                              1. Oração Inicial para Todos os Dias
                            </h4>
                            <p className="whitespace-pre-line text-xs font-sans leading-relaxed text-muted-foreground">
                              {sagradoCoracaoPrayerSections.initialBody}
                            </p>
                          </div>

                          <div className="p-4 rounded-xl border border-[oklch(0.75_0.12_75/0.25)] bg-[oklch(0.75_0.12_75/0.03)]">
                            <h4 className="font-display text-xs font-bold uppercase tracking-wider text-[oklch(0.75_0.12_75)] mb-2">
                              2. Súplica Diária (Dia {safeDay})
                            </h4>
                            <p className="whitespace-pre-line font-sans">
                              {currentDayContent.reflection}
                            </p>
                          </div>

                          <div className="p-4 rounded-xl border border-border/40 bg-muted/10">
                            <h4 className="font-display text-xs font-bold uppercase tracking-wider text-[oklch(0.30_0.07_260)] mb-2">
                              3. Oração Final para Todos os Dias
                            </h4>
                            <p className="whitespace-pre-line text-xs font-sans leading-relaxed text-muted-foreground">
                              {sagradoCoracaoPrayerSections.finalBody}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="prose-prayer whitespace-pre-line rounded-xl border border-border/40 bg-muted/10 p-5 font-sans text-sm leading-relaxed text-foreground/90">
                          {currentDayContent.prayer}
                        </div>
                      )}
                    </div>

                    {/* Botões de Ação */}
                    <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-border/50">
                      {currentDayContent.audioUrl && (
                        <Button
                          onClick={() => setSelectedDay(safeDay)}
                          className="w-full sm:w-auto bg-[oklch(0.75_0.12_75)] hover:bg-[oklch(0.70_0.13_73)] text-[oklch(0.15_0.02_260)] font-bold text-xs"
                        >
                          <PlayCircle size={15} className="mr-2" />
                          Ouvir Áudio do Dia
                        </Button>
                      )}
                      
                      <Button
                        onClick={toggleDayAsComplete}
                        className="w-full sm:w-auto bg-[oklch(0.22_0.07_260)] hover:bg-[oklch(0.28_0.08_260)] text-white font-bold text-xs"
                      >
                        <CheckCircle2 size={15} className="mr-2" />
                        {currentCompleted.includes(safeDay) ? "Desmarcar Dia" : `Marcar Dia ${safeDay} como Rezado`}
                      </Button>
                    </div>

                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-10">
                <p className="text-muted-foreground">Conteúdo da novena não encontrado.</p>
              </div>
            )}
          </div>

        </div>
      </main>

      {/* Dock de Áudio integrado se disponível */}
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
