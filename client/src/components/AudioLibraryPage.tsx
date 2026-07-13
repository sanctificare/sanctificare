import { useMemo, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { applyImageFallback, getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Headphones, Clock, Play, Lock, Crown, type LucideIcon } from "lucide-react";
import AudioPlayer from "@/components/AudioPlayer";
import {
  formatTrackDuration,
  isAudioTrackReady,
  type AudioCollection,
  type AudioMeditationTrack,
} from "@/data/audio-meditations";
import { getAudioCollectionArt } from "@/lib/cardArt";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const LOGO_IMG = "/assets/logo-sanctificare.webp";

interface AudioLibraryPageProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  collections: AudioCollection[];
  authPrompt: string;
}

export default function AudioLibraryPage({
  eyebrow,
  title,
  subtitle,
  icon: Icon,
  collections,
  authPrompt,
}: AudioLibraryPageProps) {
  const { isAuthenticated, loading, user, refresh } = useAuth();
  const subscribeMutation = trpc.subscriptions.subscribe.useMutation();

  const isPremium = useMemo(() => {
    return !!user?.activeSubscription;
  }, [user]);

  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  const handleSubscribe = async (plan: "monthly" | "annual") => {
    try {
      await subscribeMutation.mutateAsync({ plan });
      toast.success("Assinatura Premium simulada com sucesso!");
      await refresh();
      setIsUpgradeModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao simular assinatura.");
    }
  };

  const firstTrackId = useMemo(
    () => collections[0]?.tracks[0]?.id ?? "",
    [collections]
  );
  const [selectedTrackId, setSelectedTrackId] = useState<string>(firstTrackId);
  const [shouldAutoPlay, setShouldAutoPlay] = useState(false);

  const selectedTrack: AudioMeditationTrack | undefined = useMemo(() => {
    for (const collection of collections) {
      const found = collection.tracks.find((t) => t.id === selectedTrackId);
      if (found) return found;
    }
    return collections[0]?.tracks[0];
  }, [collections, selectedTrackId]);

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
          <h2 className="font-display text-2xl font-bold mb-2">
            Acesso Restrito
          </h2>
          <p className="text-muted-foreground mb-6">{authPrompt}</p>
          <a href={getLoginUrl()}>
            <Button className="bg-[oklch(0.22_0.07_260)] text-white">
              Entrar
            </Button>
          </a>
        </div>
      </div>
    );
  }

  const trackReady = isAudioTrackReady(selectedTrack);

  return (
    <div className="min-h-screen bg-[oklch(0.97_0.01_85)]">
      <main className={"container py-8 " + (trackReady ? "pb-36" : "")}>
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8 animate-fade-in">
            <div className="flex items-center gap-2 mb-2">
              <Icon size={20} className="text-[oklch(0.65_0.14_70)]" />
              <span className="text-sm text-muted-foreground font-medium">
                {eyebrow}
              </span>
            </div>
            <h1 className="font-display text-3xl font-bold text-[oklch(0.22_0.07_260)] mb-1">
              {title}
            </h1>
            <p className="font-serif text-muted-foreground">{subtitle}</p>
          </div>

          {/* Player em destaque (somente placeholder de gravação pendente) */}
          {selectedTrack && !trackReady && (
            <div className="mb-8 rounded-xl border border-[oklch(0.22_0.07_260/0.15)] bg-white p-6 animate-fade-in">
              <div className="flex items-center gap-2 mb-2">
                <Headphones
                  size={18}
                  className="text-[oklch(0.65_0.12_70)]"
                />
                <p className="font-display text-lg font-bold text-[oklch(0.22_0.07_260)]">
                  {selectedTrack.title}
                </p>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                {selectedTrack.description}
              </p>
              <div className="rounded-lg bg-[oklch(0.22_0.07_260/0.03)] border border-[oklch(0.22_0.07_260/0.1)] p-3">
                <p className="text-xs text-[oklch(0.65_0.12_70)] font-semibold uppercase tracking-wide mb-1">
                  Em gravação
                </p>
                <p className="text-sm text-muted-foreground">
                  A narração está sendo preparada. Assim que o arquivo for
                  publicado, o player aparecerá aqui automaticamente.
                </p>
              </div>
            </div>
          )}

          {/* Coleções */}
          <div className="space-y-8">
            {collections.map((collection) => (
              <section key={collection.id}>
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src={getAudioCollectionArt(collection.id)}
                    alt={collection.title}
                    className="w-9 h-9 rounded-lg object-cover border border-[oklch(0.72_0.10_75/0.35)]"
                    loading="lazy"
                    onError={(event) => applyImageFallback(event.currentTarget)}
                  />
                  <div>
                    <h2 className="font-display text-xl font-bold text-[oklch(0.22_0.07_260)] leading-tight">
                      {collection.title}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {collection.subtitle}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  {collection.description}
                </p>

                <div className="space-y-3">
                  {collection.tracks.map((track) => {
                    const active = track.id === selectedTrackId;
                    const isLocked = track.premium && !isPremium;
                    return (
                      <button
                        key={track.id}
                        onClick={() => {
                          if (isLocked) {
                            setIsUpgradeModalOpen(true);
                            return;
                          }
                          setSelectedTrackId(track.id);
                          setShouldAutoPlay(true);
                        }}
                        className={
                          "w-full text-left rounded-xl border p-4 transition-all " +
                          (active
                            ? "bg-[oklch(0.22_0.07_260)] border-[oklch(0.22_0.07_260)] shadow"
                            : "bg-white border-[oklch(0.22_0.07_260/0.12)] hover:border-[oklch(0.22_0.07_260/0.35)]")
                        }
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={
                              "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center " +
                              (isLocked
                                ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                                : active
                                ? "bg-[oklch(0.75_0.12_75)] text-[oklch(0.15_0.02_260)]"
                                : "bg-[oklch(0.22_0.07_260/0.08)] text-[oklch(0.22_0.07_260)]")
                            }
                          >
                            {isLocked ? <Lock size={15} /> : <Play size={16} fill="currentColor" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p
                                className={
                                  "font-display font-semibold " +
                                  (active
                                    ? "text-white"
                                    : "text-[oklch(0.22_0.07_260)]")
                                }
                              >
                                {track.title}
                              </p>
                              {track.premium && (
                                <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                  active 
                                    ? "bg-white/20 text-white" 
                                    : "badge-premium text-amber-600 bg-amber-500/10 border border-amber-500/20"
                                }`}>
                                  Premium
                                </span>
                              )}
                            </div>
                            {track.reference && (
                              <p
                                className={
                                  "text-xs mb-1 " +
                                  (active
                                    ? "text-[oklch(0.75_0.12_75)]"
                                    : "text-[oklch(0.65_0.12_70)]")
                                }
                              >
                                {track.reference}
                              </p>
                            )}
                            <p
                              className={
                                "text-sm " +
                                (active
                                  ? "text-[oklch(0.88_0.06_82)]"
                                  : "text-muted-foreground")
                              }
                            >
                              {track.description}
                            </p>
                            <div className="mt-2 text-xs text-muted-foreground space-y-1">
                              {track.composer ? (
                                <p className="flex items-center gap-1 text-[oklch(0.65_0.12_70)]">
                                  <span className="font-semibold">Compositor:</span>
                                  <span>{track.composer}</span>
                                </p>
                              ) : null}
                              <div
                                className={
                                  "flex items-center gap-1.5 " +
                                  (active
                                    ? "text-[oklch(0.80_0.04_82)]"
                                    : "text-muted-foreground")
                                }
                              >
                                <Clock size={12} />
                                <span>{formatTrackDuration(track.durationSec)}</span>
                                <span aria-hidden>•</span>
                                <span>{track.narrator}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </div>
      </main>

      {/* Player flutuante fixado na parte inferior da tela */}
      {selectedTrack && trackReady && (!selectedTrack.premium || isPremium) && (
        <div className="fixed bottom-4 left-4 right-4 md:left-8 md:right-8 z-50 flex justify-center pointer-events-none animate-fade-in">
          <div className="w-full max-w-4xl pointer-events-auto">
            <AudioPlayer
              audioUrl={selectedTrack.audioUrl}
              title={selectedTrack.title}
              description={selectedTrack.description}
              autoPlay={shouldAutoPlay}
            />
          </div>
        </div>
      )}

      {/* Upgrade Dialog para Áudio Premium */}
      <Dialog open={isUpgradeModalOpen} onOpenChange={setIsUpgradeModalOpen}>
        <DialogContent className="sm:max-w-md bg-[#0b1329] text-slate-100 border-amber-500/20 rounded-3xl overflow-hidden p-6 sm:p-8">
          <div className="absolute w-48 h-48 rounded-full bg-amber-500/5 blur-3xl -top-10 -left-10 pointer-events-none" />
          
          <DialogHeader className="text-center relative z-10 flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-3">
              <Crown size={22} className="text-amber-500" />
            </div>
            <DialogTitle className="font-display text-2xl font-black text-white">
              Acesso Premium
            </DialogTitle>
            <DialogDescription className="font-serif text-slate-300 text-sm mt-2 text-center">
              Esta faixa de áudio e outras meditações guiadas exclusivas estão disponíveis apenas para assinantes Premium.
            </DialogDescription>
          </DialogHeader>

          <div className="border-t border-white/10 my-4 pt-4 space-y-3 text-xs text-slate-300 relative z-10">
            <div className="flex items-center gap-3">
              <span className="text-amber-400 font-bold">✓</span>
              <p>Músicas sacras selecionadas para oração e contemplação</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-amber-400 font-bold">✓</span>
              <p>Retiro completo "A Imitação de Cristo" e Novenas exclusivas</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-amber-400 font-bold">✓</span>
              <p>Áudios guiados do Rosário e Terço Mariano</p>
            </div>
          </div>

          <div className="mt-5 space-y-3 relative z-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                onClick={() => handleSubscribe("monthly")}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs uppercase tracking-wider h-10 transition-all rounded-xl cursor-pointer"
              >
                Mensal • R$ 14,90
              </Button>
              <Button
                onClick={() => handleSubscribe("annual")}
                className="bg-transparent border border-amber-500/50 hover:bg-amber-500/10 text-amber-400 font-bold text-xs uppercase tracking-wider h-10 transition-all rounded-xl cursor-pointer"
              >
                Anual • R$ 149,00
              </Button>
            </div>
            <p className="text-[10px] text-center text-slate-400 mt-2">
              Cancele a qualquer momento nas configurações do seu perfil.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
