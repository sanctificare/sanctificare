import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import AppNav from "@/components/AppNav";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Link } from "wouter";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  PlayCircle,
  Square,
  Headphones,
  Cross,
  RotateCcw,
} from "lucide-react";
import { VIA_SACRA_STATIONS } from "@/data/via-sacra";

const LOGO_IMG = "/assets/sanctificare-logo-v2.webp";

export default function ViaSacra() {
  const { isAuthenticated, loading } = useAuth();
  const logPrayer = trpc.prayers.logPrayer.useMutation();

  const [stationIndex, setStationIndex] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoGuide, setAutoGuide] = useState(false);
  const [completed, setCompleted] = useState(false);

  const station = VIA_SACRA_STATIONS[stationIndex];
  const total = VIA_SACRA_STATIONS.length;
  const progress = Math.round(((stationIndex + 1) / total) * 100);
  const isLast = stationIndex === total - 1;

  const supportsSpeech = useMemo(
    () => typeof window !== "undefined" && "speechSynthesis" in window,
    []
  );

  const narrationText = useMemo(() => {
    return `Estação ${station.order}. ${station.title}. Palavra: ${station.scripture}. Meditação: ${station.meditation}. Oração: ${station.prayer}`;
  }, [station]);

  const invocationLines = useMemo(() => station.scripture.split("\n"), [station.scripture]);
  const prayerLines = useMemo(() => station.prayer.split("\n"), [station.prayer]);

  const stopAudio = useCallback(() => {
    if (!supportsSpeech) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setAutoGuide(false);
  }, [supportsSpeech]);

  const speakCurrentStation = useCallback(
    (keepAutoGuide: boolean) => {
      if (!supportsSpeech) {
        toast.error("Áudio guiado indisponível", {
          description: "Seu navegador não oferece suporte à síntese de voz.",
        });
        return;
      }

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(narrationText);
      utterance.lang = "pt-BR";
      utterance.rate = 0.92;
      utterance.pitch = 1;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        if (keepAutoGuide) {
          if (stationIndex < total - 1) {
            setStationIndex((prev) => prev + 1);
          } else {
            setAutoGuide(false);
          }
        }
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        setAutoGuide(false);
        toast.error("Não foi possível reproduzir o áudio desta estação.");
      };

      window.speechSynthesis.speak(utterance);
    },
    [narrationText, stationIndex, supportsSpeech, total]
  );

  useEffect(() => {
    if (autoGuide) {
      speakCurrentStation(true);
    }
  }, [autoGuide, stationIndex, speakCurrentStation]);

  useEffect(() => {
    return () => {
      if (supportsSpeech) {
        window.speechSynthesis.cancel();
      }
    };
  }, [supportsSpeech]);

  const handleNext = () => {
    if (!isLast) {
      setStationIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (stationIndex > 0) {
      setStationIndex((prev) => prev - 1);
    }
  };

  const handleStartGuided = () => {
    if (completed) setCompleted(false);
    setAutoGuide(true);
  };

  const handlePlayCurrent = () => {
    setAutoGuide(false);
    speakCurrentStation(false);
  };

  const handleReset = () => {
    stopAudio();
    setStationIndex(0);
    setCompleted(false);
  };

  const handleComplete = async () => {
    if (!isAuthenticated) return;

    try {
      await logPrayer.mutateAsync({
        prayerType: "via_sacra",
        prayerName: "Via-Sacra Completa",
      });
      setCompleted(true);
      toast.success("Via-Sacra concluída", {
        description: "Que Cristo fortaleça sua caminhada diária.",
      });
    } catch {
      toast.error("Não foi possível registrar sua oração agora.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <img
          src={LOGO_IMG}
          alt="Sanctificare"
          className="w-16 h-16 rounded-full animate-pulse"
        />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <img
            src={LOGO_IMG}
            alt="Sanctificare"
            className="w-16 h-16 rounded-full mx-auto mb-4"
          />
          <h2 className="font-display text-2xl font-bold mb-2">Acesso Restrito</h2>
          <p className="text-muted-foreground mb-6">Entre para rezar a Via-Sacra.</p>
          <a href={getLoginUrl()}>
            <Button className="bg-[oklch(0.22_0.07_260)] text-white">Entrar</Button>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[oklch(0.97_0.01_85)]">
      <AppNav />

      <main className="container py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 animate-fade-in">
            <div className="flex items-center gap-2 mb-2">
              <Cross size={20} className="text-[oklch(0.55_0.14_15)]" />
              <span className="text-sm text-muted-foreground font-medium">Via-Sacra</span>
            </div>
            <h1 className="font-display text-3xl font-bold text-[oklch(0.22_0.07_260)] mb-2">
              Caminho da Paixão do Senhor
            </h1>
            <p className="font-serif text-muted-foreground">
              14 estações com meditação, texto e áudio guiado em cada etapa.
            </p>
          </div>

          <div className="mb-6 prayer-card p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Progresso da Via-Sacra</p>
                <p className="font-display text-xl text-[oklch(0.22_0.07_260)] font-semibold">
                  Estação {station.order} de {total}
                </p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="outline"
                  className="border-[oklch(0.22_0.07_260/0.25)]"
                  onClick={handlePlayCurrent}
                  disabled={isSpeaking}
                >
                  <Headphones size={16} className="mr-2" />
                  Ouvir estação atual
                </Button>
                {!autoGuide ? (
                  <Button
                    className="bg-[oklch(0.22_0.07_260)] hover:bg-[oklch(0.28_0.08_260)] text-white"
                    onClick={handleStartGuided}
                  >
                    <PlayCircle size={16} className="mr-2" />
                    Iniciar áudio guiado
                  </Button>
                ) : (
                  <Button
                    className="bg-[oklch(0.55_0.14_15)] hover:bg-[oklch(0.50_0.14_15)] text-white"
                    onClick={stopAudio}
                  >
                    <Square size={16} className="mr-2" />
                    Parar áudio guiado
                  </Button>
                )}
                <Button variant="outline" onClick={handleReset}>
                  <RotateCcw size={16} className="mr-2" />
                  Reiniciar
                </Button>
              </div>
            </div>
            <div className="mt-4 h-2 bg-[oklch(0.22_0.07_260/0.10)] rounded-full overflow-hidden">
              <div
                className="h-full bg-[oklch(0.65_0.14_70)] transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
            <aside className="prayer-card p-4 h-fit lg:sticky lg:top-24">
              <h2 className="font-display text-sm uppercase tracking-wider text-[oklch(0.22_0.07_260)] mb-3">
                Estações
              </h2>
              <div className="space-y-2 max-h-[540px] overflow-y-auto pr-1">
                {VIA_SACRA_STATIONS.map((item, index) => {
                  const active = index === stationIndex;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setAutoGuide(false);
                        setStationIndex(index);
                      }}
                      className={
                        "w-full text-left rounded-xl border p-3 transition-colors " +
                        (active
                          ? "border-[oklch(0.22_0.07_260)] bg-[oklch(0.22_0.07_260/0.06)]"
                          : "border-[oklch(0.22_0.07_260/0.15)] hover:bg-[oklch(0.22_0.07_260/0.03)]")
                      }
                    >
                      <p className="text-xs text-muted-foreground mb-1">{item.order}ª estação</p>
                      <p className="text-sm font-semibold text-[oklch(0.22_0.07_260)] line-clamp-2">
                        {item.title}
                      </p>
                    </button>
                  );
                })}
              </div>
            </aside>

            <section className="prayer-card overflow-hidden">
              <div className="relative aspect-[16/9] bg-[oklch(0.22_0.07_260)]">
                <img
                  src={station.imageUrl}
                  alt={`Ilustração da ${station.order}ª estação da Via-Sacra`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.12_0.04_260/0.7)] to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <p className="text-xs uppercase tracking-[0.18em] text-[oklch(0.80_0.07_80)] mb-1">
                    Estação {station.order}
                  </p>
                  <h2 className="font-display text-2xl md:text-3xl text-white font-bold">
                    {station.title}
                  </h2>
                </div>
              </div>

              <div className="p-6 md:p-7 theme-contemplative-a">
                <p className="text-xs font-semibold uppercase tracking-widest text-[oklch(0.65_0.12_70)] mb-2">
                  Invocação
                </p>
                <div className="font-serif text-sm text-muted-foreground mb-5 whitespace-pre-line">
                  <p>{invocationLines[0] ?? ""}</p>
                  {invocationLines[1] ? (
                    <p>
                      <strong>
                        <em>{invocationLines[1]}</em>
                      </strong>
                    </p>
                  ) : null}
                </div>

                <p className="text-xs font-semibold uppercase tracking-widest text-[oklch(0.65_0.12_70)] mb-2">
                  Meditação
                </p>
                <p className="meditation-text italic mb-6">
                  {station.meditation}
                </p>

                <p className="text-xs font-semibold uppercase tracking-widest text-[oklch(0.65_0.12_70)] mb-2">
                  Oração
                </p>
                <div className="meditation-text mb-8 whitespace-pre-line">
                  {prayerLines.map((line, index) => {
                    const isFinalPrayerLine =
                      line.trim() === "Pai-nosso, Ave-Maria, Glória.";

                    return (
                      <p
                        key={`${station.id}-prayer-${index}`}
                        className={isFinalPrayerLine ? "my-4" : undefined}
                      >
                        {isFinalPrayerLine ? (
                          <strong>
                            <em>{line}</em>
                          </strong>
                        ) : (
                          line
                        )}
                      </p>
                    );
                  })}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handlePrev} disabled={stationIndex === 0}>
                      <ChevronLeft size={16} className="mr-1" />
                      Anterior
                    </Button>
                    <Button variant="outline" onClick={handleNext} disabled={isLast}>
                      Próxima
                      <ChevronRight size={16} className="ml-1" />
                    </Button>
                  </div>

                  {isLast ? (
                    <Button
                      className="bg-[oklch(0.55_0.14_15)] hover:bg-[oklch(0.50_0.14_15)] text-white"
                      onClick={handleComplete}
                      disabled={logPrayer.isPending}
                    >
                      <CheckCircle2 size={16} className="mr-2" />
                      {logPrayer.isPending ? "Registrando..." : "Marcar Via-Sacra como concluída"}
                    </Button>
                  ) : (
                    <Link href="/oracoes">
                      <Button variant="ghost" className="text-muted-foreground">
                        Voltar para orações
                      </Button>
                    </Link>
                  )}
                </div>

                {completed && (
                  <div className="mt-4 rounded-xl border border-[oklch(0.40_0.12_150/0.35)] bg-[oklch(0.40_0.12_150/0.08)] p-4">
                    <p className="text-sm font-semibold text-[oklch(0.22_0.07_260)] mb-1">Via-Sacra concluída</p>
                    <p className="text-sm text-muted-foreground">
                      Sua oração foi registrada no histórico. Que o Senhor sustente o seu dia.
                    </p>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
