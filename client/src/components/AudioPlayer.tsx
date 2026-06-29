import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BookOpen,
  Pause,
  Play,
  RotateCcw,
  Share2,
  Volume2,
  VolumeX,
} from "lucide-react";
import { formatTime } from "@/data/rosary-audio";
import { resolveR2Redirect } from "@/const";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AudioPlayerProps {
  audioUrl: string;
  title: string;
  description?: string;
  artworkUrl?: string;
  supportTitle?: string;
  supportDescription?: string;
  supportText?: string;
  onTrackEnd?: () => void;
  onTrackError?: () => void;
  autoPlay?: boolean;
  onPlayStateChange?: (isPlaying: boolean) => void;
}

const FALLBACK_ARTWORK_URL = "/assets/sanctificare-logo-v2.webp";

/** 
 * Split text into tokens preserving whitespace structure for rendering.
 * Returns an array of { word, trailingSpace } objects.
 */
function tokenizePrayerText(text: string): { word: string; trailingSpace: string; isLineBreak: boolean }[] {
  const tokens: { word: string; trailingSpace: string; isLineBreak: boolean }[] = [];
  // Split on whitespace boundaries but keep newlines as separate tokens
  const parts = text.split(/(\n+|\s+)/);
  
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (!part) continue;

    // If it's purely newlines, add a line break token
    if (/^\n+$/.test(part)) {
      tokens.push({ word: "", trailingSpace: part, isLineBreak: true });
      continue;
    }

    // If it's purely spaces/tabs, skip (it will be attached to previous word)
    if (/^\s+$/.test(part) && !part.includes("\n")) {
      if (tokens.length > 0) {
        tokens[tokens.length - 1].trailingSpace = part;
      }
      continue;
    }

    // It's a word
    if (part.trim()) {
      tokens.push({ word: part.trim(), trailingSpace: " ", isLineBreak: false });
    }
  }

  return tokens;
}

interface TimestampedSegment {
  startTime: number;
  endTime: number;
  tokens: { word: string; trailingSpace: string; isLineBreak: boolean }[];
}

function parseTimeToSeconds(minStr: string, secStr: string, msStr?: string): number {
  const min = parseInt(minStr, 10);
  const sec = parseInt(secStr, 10);
  const ms = msStr ? parseFloat("0." + msStr) : 0;
  return min * 60 + sec + ms;
}

function parseTimestampedText(text: string): TimestampedSegment[] | null {
  const lines = text.split("\n");
  const segments: TimestampedSegment[] = [];
  const timestampRegex = /^\[(\d{1,2}):(\d{2})(?:\.(\d+))?\s*-\s*(\d{1,2}):(\d{2})(?:\.(\d+))?\]\s*(.*)$/;

  let hasTimestamps = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (segments.length > 0) {
        segments[segments.length - 1].tokens.push({ word: "", trailingSpace: "\n", isLineBreak: true });
      }
      continue;
    }

    const match = trimmed.match(timestampRegex);
    if (match) {
      hasTimestamps = true;
      const startMin = match[1];
      const startSec = match[2];
      const startMs = match[3];
      const endMin = match[4];
      const endSec = match[5];
      const endMs = match[6];
      const content = match[7];

      const startTime = parseTimeToSeconds(startMin, startSec, startMs);
      const endTime = parseTimeToSeconds(endMin, endSec, endMs);
      
      const tokens = tokenizePrayerText(content);
      segments.push({
        startTime,
        endTime,
        tokens,
      });
    } else {
      if (segments.length > 0) {
        const tokens = tokenizePrayerText(trimmed);
        segments[segments.length - 1].tokens.push(...tokens);
      } else {
        const tokens = tokenizePrayerText(trimmed);
        segments.push({
          startTime: 0,
          endTime: 0,
          tokens,
        });
      }
    }
  }

  return hasTimestamps ? segments : null;
}

export default function AudioPlayer({
  audioUrl,
  title,
  description,
  artworkUrl,
  supportTitle,
  supportDescription,
  supportText,
  onTrackEnd,
  onTrackError,
  autoPlay = false,
  onPlayStateChange,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const activeWordRef = useRef<HTMLSpanElement>(null);

  const [playingUrl, setPlayingUrl] = useState("");

  useEffect(() => {
    let active = true;
    resolveR2Redirect(audioUrl).then((url) => {
      if (active) {
        setPlayingUrl(url);
      }
    });
    return () => {
      active = false;
    };
  }, [audioUrl]);

  useEffect(() => {
    onPlayStateChange?.(isPlaying);
  }, [isPlaying, onPlayStateChange]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
    const handleEnded = () => {
      setIsPlaying(false);
      onTrackEnd?.();
    };
    const handleError = () => {
      setIsPlaying(false);
      setHasError(true);
      onTrackError?.();
    };

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
    };
  }, [onTrackEnd, onTrackError]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      audio.load();
    }

    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setHasError(false);
  }, [playingUrl]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!autoPlay || !audio) return;

    setCurrentTime(0);
    audio.currentTime = 0;
    audio
      .play()
      .then(() => setIsPlaying(true))
      .catch(() => setIsPlaying(false));
  }, [playingUrl, autoPlay]);

  // Auto-scroll to keep the active word visible in the support dialog
  useEffect(() => {
    if (isSupportOpen && activeWordRef.current) {
      activeWordRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [isSupportOpen, currentTime]);

  const playAudio = () => {
    if (!audioRef.current) return;

    audioRef.current
      .play()
      .then(() => setIsPlaying(true))
      .catch(() => setIsPlaying(false));
  };

  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    playAudio();
  };

  const restartTrack = () => {
    if (!audioRef.current) return;

    audioRef.current.currentTime = 0;
    setCurrentTime(0);
    if (isPlaying || autoPlay) playAudio();
  };

  const handleSeekChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextTime = Number(event.target.value);
    if (!audioRef.current) return;

    audioRef.current.currentTime = nextTime;
    setCurrentTime(nextTime);
  };

  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextVolume = Number(event.target.value);
    setVolume(nextVolume);
    if (nextVolume > 0) setIsMuted(false);
  };

  const handleShare = async () => {
    if (typeof window === "undefined") return;

    const pageUrl = window.location.href;
    const shareData = {
      title,
      text: description || `Estou ouvindo ${title} no Sanctificare.`,
      url: pageUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(pageUrl);
      }
    } catch {
      // Ignora cancelamentos/erros de share para não interromper a oração.
    }
  };

  const toggleMute = () => {
    setIsMuted((muted) => !muted);
  };

  const progressMax = duration || 100;
  const remainingTime = Math.max((duration || 0) - currentTime, 0);
  const volumeValue = isMuted ? 0 : volume;
  const volumePercent = Math.round(volumeValue * 100);
  const hasSupport = Boolean(supportText);

  // Parse support text as timestamped segments if timestamps exist
  const timestampedSegments = useMemo(() => {
    if (!supportText) return null;
    return parseTimestampedText(supportText);
  }, [supportText]);

  // Tokenize the support text for fallback linear karaoke highlighting
  const supportTokens = useMemo(() => {
    if (!supportText || timestampedSegments) return [];
    return tokenizePrayerText(supportText);
  }, [supportText, timestampedSegments]);

  // Calculate which word index is currently active based on audio progress
  const wordCount = useMemo(() => supportTokens.filter((t) => !t.isLineBreak && t.word).length, [supportTokens]);
  const audioProgress = duration > 0 ? currentTime / duration : 0;
  // Use a small offset so the first word is highlighted at the very start
  const activeWordIndex = Math.min(Math.floor(audioProgress * wordCount), wordCount - 1);

  const renderKaraokeText = useCallback(() => {
    if (timestampedSegments) {
      return (
        <div className="prose-prayer whitespace-pre-line karaoke-text">
          {timestampedSegments.map((segment, segIdx) => {
            const isSegmentActive = isPlaying && currentTime >= segment.startTime && currentTime <= segment.endTime;
            const isSegmentSpoken = currentTime > segment.endTime;
            
            // Calculate active word index within this segment if it is active
            const segmentWords = segment.tokens.filter((t) => !t.isLineBreak && t.word);
            const segmentWordCount = segmentWords.length;
            let activeWordInSegIndex = -1;
            
            if (isSegmentActive && segmentWordCount > 0) {
              const segProgress = (currentTime - segment.startTime) / (segment.endTime - segment.startTime);
              activeWordInSegIndex = Math.min(Math.floor(segProgress * segmentWordCount), segmentWordCount - 1);
            }

            let wordInSegIdx = -1;

            return (
              <p key={`seg-${segIdx}`} className="mb-4 last:mb-0">
                {segment.tokens.map((token, tokenIdx) => {
                  if (token.isLineBreak) {
                    return <br key={`br-${segIdx}-${tokenIdx}`} />;
                  }

                  wordInSegIdx++;
                  const isActive = isSegmentActive && wordInSegIdx === activeWordInSegIndex;
                  const isSpoken = isSegmentSpoken || (isSegmentActive && wordInSegIdx < activeWordInSegIndex);

                  let className = "karaoke-word";
                  if (isActive) className += " karaoke-word--active";
                  else if (isSpoken) className += " karaoke-word--spoken";
                  else className += " karaoke-word--upcoming";

                  return (
                    <span
                      key={`w-${segIdx}-${tokenIdx}`}
                      ref={isActive ? activeWordRef : undefined}
                      className={className}
                    >
                      {token.word}
                      {token.trailingSpace === " " ? " " : ""}
                    </span>
                  );
                })}
              </p>
            );
          })}
        </div>
      );
    }

    if (!supportTokens.length) return null;

    let wordIdx = -1;
    return (
      <p className="prose-prayer whitespace-pre-line karaoke-text">
        {supportTokens.map((token, i) => {
          if (token.isLineBreak) {
            return <br key={`br-${i}`} />;
          }

          wordIdx++;
          const isActive = wordIdx === activeWordIndex && isPlaying;
          const isSpoken = wordIdx < activeWordIndex;

          let className = "karaoke-word";
          if (isActive) className += " karaoke-word--active";
          else if (isSpoken) className += " karaoke-word--spoken";
          else className += " karaoke-word--upcoming";

          return (
            <span
              key={`w-${i}`}
              ref={isActive ? activeWordRef : undefined}
              className={className}
            >
              {token.word}{token.trailingSpace === " " ? " " : ""}
            </span>
          );
        })}
      </p>
    );
  }, [timestampedSegments, supportTokens, activeWordIndex, isPlaying, currentTime]);

  return (
    <div className="audio-player-shell">
      <audio ref={audioRef} src={playingUrl} preload="auto" />

      <div className="audio-player-artwork">
        <img src={artworkUrl || FALLBACK_ARTWORK_URL} alt="" aria-hidden="true" />
      </div>

      <div className="audio-player-body">
        <div className="audio-player-top-row">
          <div className="audio-player-copy">
            <div className="audio-player-title-row">
              <h3>{title}</h3>
            </div>
            {description && <p>{description}</p>}
            {hasError && <p className="audio-player-error">Este arquivo de áudio não está disponível no momento.</p>}
          </div>
        </div>

        <div className="audio-player-bottom-row">
          <div className="audio-player-timeline">
            <span>{formatTime(Math.floor(currentTime))}</span>
            <input
              type="range"
              min={0}
              max={progressMax}
              step={0.1}
              value={Math.min(currentTime, progressMax)}
              onChange={handleSeekChange}
              aria-label="Progresso do áudio"
            />
            <span>-{formatTime(Math.floor(remainingTime))}</span>
          </div>

          <div className="audio-player-actions">
            <div className="audio-player-controls" aria-label="Controles de áudio">
              <button type="button" className="audio-player-reset" onClick={restartTrack} aria-label="Reiniciar áudio">
                <RotateCcw size={15} />
              </button>
              <button
                type="button"
                className="audio-player-main-button"
                onClick={togglePlayPause}
                aria-label={isPlaying ? "Pausar áudio" : "Reproduzir áudio"}
              >
                {isPlaying ? <Pause size={19} fill="currentColor" /> : <Play size={19} fill="currentColor" />}
              </button>
            </div>

            <div className="audio-player-actions-divider" />

            <button
              type="button"
              className="audio-player-icon-button"
              onClick={handleShare}
              aria-label="Compartilhar nas redes sociais"
            >
              <Share2 size={17} />
            </button>
            {hasSupport ? (
              <button
                type="button"
                className="audio-player-icon-button audio-player-support-button"
                onClick={() => setIsSupportOpen(true)}
                aria-label="Texto de apoio"
              >
                <BookOpen size={17} />
              </button>
            ) : null}
            <div className="audio-player-volume">
              <button
                type="button"
                className="audio-player-icon-button"
                onClick={toggleMute}
                aria-label={isMuted ? "Ativar som" : "Silenciar"}
              >
                {isMuted ? <VolumeX size={17} /> : <Volume2 size={17} />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={volumeValue}
                onChange={handleVolumeChange}
                aria-label={`Volume ${volumePercent}%`}
              />
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isSupportOpen} onOpenChange={setIsSupportOpen}>
        <DialogContent className="max-h-[82vh] overflow-hidden sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl text-[oklch(0.22_0.07_260)]">
              {supportTitle || title}
            </DialogTitle>
            {(supportDescription || description) && (
              <DialogDescription>{supportDescription || description}</DialogDescription>
            )}
          </DialogHeader>
          <div className="max-h-[58vh] overflow-y-auto pr-2 karaoke-scroll">
            {renderKaraokeText()}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
