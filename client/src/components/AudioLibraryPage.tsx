import { useMemo, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { applyImageFallback, getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Headphones, Crown, Clock, Play, type LucideIcon } from "lucide-react";
import AudioPlayer from "@/components/AudioPlayer";
import {
  formatTrackDuration,
  isAudioTrackReady,
  type AudioCollection,
  type AudioMeditationTrack,
} from "@/data/audio-meditations";
import { getAudioCollectionArt } from "@/lib/cardArt";

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
  const { isAuthenticated, loading } = useAuth();

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
                    return (
                      <button
                        key={track.id}
                        onClick={() => {
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
                              (active
                                ? "bg-[oklch(0.75_0.12_75)] text-[oklch(0.15_0.02_260)]"
                                : "bg-[oklch(0.22_0.07_260/0.08)] text-[oklch(0.22_0.07_260)]")
                            }
                          >
                            <Play size={16} fill="currentColor" />
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
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-[oklch(0.75_0.12_75/0.2)] text-[oklch(0.55_0.12_70)]">
                                  <Crown size={10} /> Premium
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
                            <div
                              className={
                                "flex items-center gap-1.5 mt-2 text-xs " +
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
                      </button>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>

          {/* Rodapé / CTA premium */}
          <div className="mt-10 rounded-2xl bg-[oklch(0.22_0.07_260)] p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-pattern-cross opacity-20" />
            <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-display text-lg font-bold text-white mb-1">
                  Mais áudios no Premium
                </h3>
                <p className="text-sm text-[oklch(0.88_0.06_82)]">
                  Desbloqueie meditações exclusivas e narrações para sono e descanso.
                </p>
              </div>
              <Link href="/premium">
                <Button className="bg-[oklch(0.75_0.12_75)] hover:bg-[oklch(0.70_0.13_73)] text-[oklch(0.15_0.02_260)] font-semibold">
                  <Crown size={14} className="mr-2" /> Conhecer Premium
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Player flutuante fixado na parte inferior da tela */}
      {selectedTrack && trackReady && (
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
    </div>
  );
}
