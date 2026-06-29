import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, SkipForward, Share2, SlidersHorizontal, ListMusic, Volume2, VolumeX } from "lucide-react";
import { resolveR2Redirect } from "@/const";

interface NovenaAudioDockProps {
  audioUrl: string;
  title: string;
  subtitle: string;
  coverUrl?: string;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function NovenaAudioDock({
  audioUrl,
  title,
  subtitle,
  coverUrl = "/assets/sanctificare-logo-v2.webp",
}: NovenaAudioDockProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);

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
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDuration = () => setDuration(audio.duration || 0);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleDuration);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleDuration);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
    audio.pause();
    audio.currentTime = 0;
    audio.load();
  }, [playingUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      return;
    }

    audio
      .play()
      .then(() => setIsPlaying(true))
      .catch(() => setIsPlaying(false));
  };

  const handleSeek = (nextValue: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = nextValue;
    setCurrentTime(nextValue);
  };

  const skipIntro = () => {
    const audio = audioRef.current;
    if (!audio) return;
    const next = Math.min(audio.currentTime + 30, duration || audio.currentTime + 30);
    audio.currentTime = next;
    setCurrentTime(next);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-[oklch(0.75_0.12_75/0.28)] bg-[oklch(0.28_0.08_258)]/95 backdrop-blur-md">
      <audio ref={audioRef} src={playingUrl} preload="metadata" />

      <div className="container py-3">
        <div className="flex flex-col gap-3 xl:grid xl:grid-cols-[320px_minmax(0,1fr)_280px] xl:items-center xl:gap-5">
          <div className="flex items-center gap-3 min-w-0">
            <img src={coverUrl} alt={title} className="w-12 h-12 rounded-md object-cover border border-white/25" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{title}</p>
              <p className="text-xs text-[oklch(0.90_0.02_85)] truncate">{subtitle}</p>
            </div>
          </div>

          <div className="min-w-0">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Button
                type="button"
                variant="ghost"
                className="h-8 px-3 text-[oklch(0.92_0.03_85)] hover:text-white hover:bg-white/10"
                onClick={skipIntro}
              >
                <SkipForward size={14} className="mr-1" />
                Pular introdução
              </Button>
              <Button
                type="button"
                onClick={togglePlay}
                className="h-10 w-10 rounded-full bg-[oklch(0.75_0.12_75)] hover:bg-[oklch(0.70_0.13_73)] text-[oklch(0.15_0.02_260)] p-0"
              >
                {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-[oklch(0.90_0.02_85)] w-9 text-right">{formatTime(currentTime)}</span>
              <input
                type="range"
                min={0}
                max={duration || 100}
                step={0.1}
                value={currentTime}
                onChange={(event) => handleSeek(Number(event.target.value))}
                className="w-full h-1.5 rounded-lg accent-[oklch(0.75_0.12_75)]"
              />
              <span className="text-[11px] text-[oklch(0.90_0.02_85)] w-9">-{formatTime(Math.max(duration - currentTime, 0))}</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-1">
            <Button type="button" variant="ghost" className="h-8 w-8 p-0 text-[oklch(0.90_0.02_85)] hover:text-white hover:bg-white/10">
              <Share2 size={14} />
            </Button>
            <Button type="button" variant="ghost" className="h-8 w-8 p-0 text-[oklch(0.90_0.02_85)] hover:text-white hover:bg-white/10">
              <SlidersHorizontal size={14} />
            </Button>
            <Button type="button" variant="ghost" className="h-8 w-8 p-0 text-[oklch(0.90_0.02_85)] hover:text-white hover:bg-white/10">
              <ListMusic size={14} />
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="h-8 w-8 p-0 text-[oklch(0.90_0.02_85)] hover:text-white hover:bg-white/10"
              onClick={() => setIsMuted((prev) => !prev)}
            >
              {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
            </Button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={isMuted ? 0 : volume}
              onChange={(event) => {
                const next = Number(event.target.value);
                setVolume(next);
                if (next > 0) setIsMuted(false);
              }}
              className="w-20 h-1.5 rounded-lg accent-[oklch(0.90_0.02_85)]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
