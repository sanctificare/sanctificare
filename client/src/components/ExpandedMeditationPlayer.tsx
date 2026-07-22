import { useCallback, useEffect, useRef, useState } from "react";
import { X, Play, Pause, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { resolveR2Redirect } from "@/const";
import { useAudioKeepAwake } from "@/hooks/useAudioKeepAwake";

interface ExpandedMeditationPlayerProps {
  audioUrl: string;
  title: string;
  subtitle: string;
  artworkUrl: string;
  reflection: string;
  prayer: string;
  onClose: () => void;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function ExpandedMeditationPlayer({
  audioUrl,
  title,
  subtitle,
  artworkUrl,
  reflection,
  prayer,
  onClose,
}: ExpandedMeditationPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  
  const [playingUrl, setPlayingUrl] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Resolve redirect for Cloudflare R2 audio link
  useEffect(() => {
    let active = true;
    resolveR2Redirect(audioUrl).then((url) => {
      if (active) setPlayingUrl(url);
    });
    return () => {
      active = false;
    };
  }, [audioUrl]);

  // Audio Event Listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => {
      if (Number.isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  // Sync Volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Auto-scroll text synced with audio progress (only if user is not actively scrolling)
  useEffect(() => {
    const el = textRef.current;
    if (el && duration > 0 && !isUserScrolling) {
      const progress = currentTime / duration;
      const maxScroll = el.scrollHeight - el.clientHeight;
      el.scrollTo({
        top: maxScroll * progress,
        behavior: "smooth",
      });
    }
  }, [currentTime, duration, isUserScrolling]);

  // Handle user manual scroll with a timeout to resume auto-scroll
  const handleScroll = () => {
    setIsUserScrolling(true);
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    scrollTimeoutRef.current = setTimeout(() => {
      setIsUserScrolling(false);
    }, 4000); // Resume auto-scroll after 4s of inactivity
  };

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  const playAudio = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
  }, []);

  const pauseAudio = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    setIsPlaying(false);
  }, []);

  const handleSeek = useCallback((value: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = value;
    setCurrentTime(value);
  }, []);

  useAudioKeepAwake({
    isPlaying,
    title,
    album: subtitle,
    artworkUrl,
    onPlay: playAudio,
    onPause: pauseAudio,
    onSeekTo: handleSeek,
  });

  const togglePlay = () => {
    if (isPlaying) {
      pauseAudio();
    } else {
      playAudio();
    }
  };

  const handleRestart = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    setCurrentTime(0);
    audio.play().then(() => setIsPlaying(true));
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-between p-6 select-none overflow-hidden bg-[radial-gradient(circle_at_center,_oklch(0.20_0.05_260),_oklch(0.08_0.02_260)_100%)]">
      {/* Background Gold Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-[250px] h-[250px] bg-amber-600/5 rounded-full blur-[90px] pointer-events-none" />

      {/* Hidden Audio element */}
      {playingUrl && <audio ref={audioRef} src={playingUrl} autoPlay />}

      {/* Top Header Row */}
      <div className="w-full flex items-center justify-between z-10">
        <span className="text-[10px] text-amber-500/80 font-bold uppercase tracking-widest font-sans">
          Modo Meditação
        </span>
        <button
          onClick={onClose}
          className="text-white/60 hover:text-white hover:bg-white/10 p-2 rounded-full transition-all"
          title="Fechar player"
        >
          <X size={20} />
        </button>
      </div>

      {/* Middle Section: Sacred Art & Title */}
      <div className="flex flex-col items-center justify-center my-auto py-4 z-10">
        {/* Pulsing Artwork */}
        <div className="relative w-36 h-36 md:w-44 md:h-44 mb-6">
          <div
            className={`absolute -inset-1 rounded-3xl bg-gradient-to-tr from-amber-600 to-amber-300 blur-sm opacity-60 transition-opacity duration-1000 ${
              isPlaying ? "opacity-90" : "opacity-50"
            }`}
          />
          {isPlaying && (
            <div className="absolute inset-0 rounded-3xl bg-amber-500/25 blur-md animate-ping" style={{ animationDuration: '3s' }} />
          )}
          <img
            src={artworkUrl}
            alt={title}
            className={`relative w-full h-full rounded-3xl object-cover z-10 border border-white/20 shadow-2xl transition-transform duration-[6000ms] ${
              isPlaying ? "scale-[1.03]" : "scale-100"
            }`}
          />
        </div>

        {/* Text Titles */}
        <div className="text-center max-w-sm px-4">
          <p className="text-[10px] text-amber-500 font-bold uppercase tracking-widest font-sans mb-1">
            {title}
          </p>
          <h2 className="text-white text-base md:text-lg font-serif font-semibold leading-snug">
            {subtitle}
          </h2>
        </div>
      </div>

      {/* Bottom Section: Glassmorphism Card (Controls + Text) */}
      <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-[2rem] p-5 md:p-6 backdrop-blur-lg shadow-2xl z-10 flex flex-col gap-4">
        {/* Synced scrollable text area */}
        <div
          ref={textRef}
          onScroll={handleScroll}
          className="h-40 md:h-48 overflow-y-auto pr-2 text-white/85 text-xs md:text-sm font-serif leading-relaxed space-y-4 scroll-smooth"
          style={{
            maskImage: "linear-gradient(to bottom, transparent, white 10%, white 90%, transparent)",
            WebkitMaskImage: "linear-gradient(to bottom, transparent, white 10%, white 90%, transparent)",
            scrollbarWidth: "none",
          }}
        >
          <div className="py-4 space-y-4">
            <div className="space-y-1">
              <span className="text-[9px] uppercase tracking-wider font-bold text-amber-500/90 block font-sans">
                Meditação do Dia
              </span>
              <p className="italic text-justify font-serif">{reflection}</p>
            </div>
            
            <div className="space-y-1 border-t border-white/10 pt-4">
              <span className="text-[9px] uppercase tracking-wider font-bold text-amber-500/90 block font-sans">
                Oração da Novena
              </span>
              <p className="whitespace-pre-line text-justify font-serif">{prayer}</p>
            </div>
          </div>
        </div>

        {/* Audio Slider Controls */}
        <div className="space-y-1 mt-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-white/60 font-sans w-8 text-right">
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              min={0}
              max={duration || 100}
              step={0.1}
              value={currentTime}
              onChange={(e) => handleSeek(Number(e.target.value))}
              className="flex-1 h-1 rounded-full accent-amber-500 bg-white/20 cursor-pointer outline-none"
              style={{
                background: `linear-gradient(to right, oklch(0.75 0.12 75) ${
                  duration > 0 ? (currentTime / duration) * 100 : 0
                }%, rgba(255,255,255,0.2) ${
                  duration > 0 ? (currentTime / duration) * 100 : 0
                }%)`,
              }}
            />
            <span className="text-[10px] text-white/60 font-sans w-8">
              -{formatTime(Math.max(duration - currentTime, 0))}
            </span>
          </div>
        </div>

        {/* Buttons Row */}
        <div className="flex items-center justify-between px-2 mt-1">
          {/* Restart */}
          <button
            onClick={handleRestart}
            className="text-white/60 hover:text-white p-2 rounded-full hover:bg-white/5 transition-colors"
            title="Reiniciar áudio"
          >
            <RotateCcw size={16} />
          </button>

          {/* Main Play/Pause (Gold Ring) */}
          <button
            onClick={togglePlay}
            className="w-12 h-12 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95"
            title={isPlaying ? "Pausar" : "Reproduzir"}
          >
            {isPlaying ? (
              <Pause size={18} fill="currentColor" />
            ) : (
              <Play size={18} fill="currentColor" className="ml-0.5" />
            )}
          </button>

          {/* Volume Mute Toggle */}
          <div className="flex items-center gap-1.5 group">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="text-white/60 hover:text-white p-2 rounded-full hover:bg-white/5 transition-colors"
              title={isMuted ? "Ativar som" : "Silenciar"}
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                const val = Number(e.target.value);
                setVolume(val);
                if (val > 0) setIsMuted(false);
              }}
              className="w-12 h-1 accent-amber-500 bg-white/20 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
