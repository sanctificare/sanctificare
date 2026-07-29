import { useMemo, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { applyImageFallback, getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Headphones, Clock, Play, Lock, type LucideIcon } from "lucide-react";
import AudioPlayer from "@/components/AudioPlayer";
import {
  formatTrackDuration,
  isAudioTrackReady,
  type AudioCollection,
  type AudioMeditationTrack,
} from "@/data/audio-meditations";
import { getAudioCollectionArt } from "@/lib/cardArt";
import { trpc } from "@/lib/trpc";
import { UpgradeDialog } from "./UpgradeDialog";

const LOGO_IMG = "/assets/sanctificare-logo-v2.webp";

interface AudioLibraryPageProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  collections: AudioCollection[];
  authPrompt: string;
  guestPlayableTrackIds?: string[];
  guestNotice?: string;
}

export default function AudioLibraryPage({
  eyebrow,
  title,
  subtitle,
  icon: Icon,
  collections,
  authPrompt,
  guestPlayableTrackIds = [],
  guestNotice,
}: AudioLibraryPageProps) {
  const { isAuthenticated, loading } = useAuth();
  const { data: subscription } = trpc.subscriptions.get.useQuery(undefined, { enabled: isAuthenticated });

  const isPremium = useMemo(() => {
    return !!subscription &&
      (subscription.status === "active" ||
       subscription.status === "cancelled" ||
       subscription.status === "past_due");
  }, [subscription]);

  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  const guestPlayableTrackSet = useMemo(
    () => new Set(guestPlayableTrackIds),
    [guestPlayableTrackIds]
  );
  const hasGuestPreview = guestPlayableTrackSet.size > 0;

  const firstGuestPlayableTrackId = useMemo(() => {
    for (const collection of collections) {
      const found = collection.tracks.find((track) => guestPlayableTrackSet.has(track.id));
      if (found) return found.id;
    }
    return "";
  }, [collections, guestPlayableTrackSet]);

  const firstTrackId = useMemo(
    () => collections[0]?.tracks[0]?.id ?? "",
    [collections]
  );
  const [selectedTrackId, setSelectedTrackId] = useState<string>(firstTrackId);
  const [shouldAutoPlay, setShouldAutoPlay] = useState(false);

  const effectiveSelectedTrackId =
    !isAuthenticated && hasGuestPreview
      ? guestPlayableTrackSet.has(selectedTrackId)
        ? selectedTrackId
        : firstGuestPlayableTrackId
      : selectedTrackId;

  const effectiveSelectedTrack: AudioMeditationTrack | undefined = useMemo(() => {
    for (const collection of collections) {
      const found = collection.tracks.find((t) => t.id === effectiveSelectedTrackId);
      if (found) return found;
    }
    return undefined;
  }, [collections, effectiveSelectedTrackId]);

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

  if (!isAuthenticated && !hasGuestPreview) {
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

  const trackReady = isAudioTrackReady(effectiveSelectedTrack);

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
            {!isAuthenticated && hasGuestPreview && (
              <p className="mt-2 text-xs text-muted-foreground">
                {guestNotice ?? "Duas faixas estão disponíveis para escuta sem login."}
              </p>
            )}
          </div>

          {/* Player em destaque (somente placeholder de gravação pendente) */}
          {effectiveSelectedTrack && !trackReady && (
            <div className="mb-8 rounded-xl border border-[oklch(0.22_0.07_260/0.15)] bg-white p-6 animate-fade-in">
              <div className="flex items-center gap-2 mb-2">
                <Headphones
                  size={18}
                  className="text-[oklch(0.65_0.12_70)]"
                />
                <p className="font-display text-lg font-bold text-[oklch(0.22_0.07_260)]">
                  {effectiveSelectedTrack.title}
                </p>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                {effectiveSelectedTrack.description}
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
                    const active = track.id === effectiveSelectedTrackId;
                    const isLocked = isAuthenticated
                      ? !!(track.premium && !isPremium)
                      : !guestPlayableTrackSet.has(track.id);
                    return (
                      <button
                        key={track.id}
                        onClick={() => {
                          if (isLocked) {
                            if (isAuthenticated) {
                              setIsUpgradeModalOpen(true);
                            } else {
                              window.location.href = getLoginUrl();
                            }
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
      {effectiveSelectedTrack && trackReady && (!effectiveSelectedTrack.premium || isPremium || !isAuthenticated) && (
        <div className="fixed bottom-4 left-4 right-4 md:left-8 md:right-8 z-50 flex justify-center pointer-events-none animate-fade-in">
          <div className="w-full max-w-4xl pointer-events-auto">
            <AudioPlayer
              audioUrl={effectiveSelectedTrack.audioUrl}
              title={effectiveSelectedTrack.title}
              description={effectiveSelectedTrack.description}
              autoPlay={shouldAutoPlay}
            />
          </div>
        </div>
      )}

      {/* Upgrade Dialog para Áudio Premium */}
      <UpgradeDialog
        open={isUpgradeModalOpen}
        onOpenChange={setIsUpgradeModalOpen}
        description="Esta faixa de áudio e outras meditações guiadas exclusivas estão disponíveis apenas para assinantes Premium."
      />
    </div>
  );
}
