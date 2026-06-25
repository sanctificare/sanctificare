import { useState, useMemo, useRef, useEffect } from "react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import AppNav from "@/components/AppNav";
import { trpc } from "@/lib/trpc";
import { BIBLE_VIDEOS, type BibleVideo } from "@/data/bible-videos";
import { Play, Lock, Crown, Clock, Sparkles, Film, Video, AlertCircle, Heart, Search, X, Share2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";

const LOGO_IMG = "/assets/sanctificare-logo-v2.webp";
const BUNNY_LIBRARY_ID = import.meta.env.VITE_BUNNY_LIBRARY_ID || "";
const TRUSTED_BUNNY_ORIGINS = new Set(["https://iframe.mediadelivery.net"]);

function VerticalVideoSkeleton() {
  return (
    <div className="aspect-[9/16] rounded-2xl border border-[oklch(0.88_0.01_260)] bg-black/40 p-4 flex flex-col justify-end space-y-3 relative overflow-hidden animate-pulse">
      <div className="absolute inset-0 bg-white/5 animate-pulse" />
      <div className="space-y-2 z-10 w-full">
        <Skeleton className="h-3 w-1/3 bg-white/20" />
        <Skeleton className="h-4 w-3/4 bg-white/20" />
        <Skeleton className="h-3 w-5/6 bg-white/20" />
        <Skeleton className="h-3 w-2/3 bg-white/20" />
      </div>
    </div>
  );
}

function HorizontalVideoSkeleton() {
  return (
    <div className="flex flex-col bg-white rounded-2xl border border-border overflow-hidden shadow-sm animate-pulse">
      <div className="aspect-video w-full bg-slate-200" />
      <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          <Skeleton className="h-3 w-1/4 bg-slate-300" />
          <Skeleton className="h-5 w-3/4 bg-slate-300" />
          <Skeleton className="h-3 w-full bg-slate-300" />
          <Skeleton className="h-3 w-5/6 bg-slate-300" />
        </div>
        <Skeleton className="h-9 w-full bg-slate-300" />
      </div>
    </div>
  );
}

function VerticalVideoCard({
  video,
  isVideoLocked,
  isFavorited,
  onToggleFavorite,
  onShare,
  playbackProgress,
  onPlay,
}: {
  video: BibleVideo;
  isVideoLocked: boolean;
  isFavorited: boolean;
  onToggleFavorite: (e: React.MouseEvent) => void;
  onShare: (e: React.MouseEvent) => void;
  playbackProgress?: { currentTime: number; progressPercent: number };
  onPlay: () => void;
}) {
  return (
    <div
      onClick={onPlay}
      id={`video-card-${video.id}`}
      className="group relative aspect-[9/16] rounded-2xl overflow-hidden border border-[oklch(0.88_0.01_260)] shadow-sm hover:shadow-lg hover:scale-[1.03] hover:ring-2 hover:ring-[oklch(0.75_0.12_75)] hover:border-transparent cursor-pointer transition-all duration-500 bg-black flex flex-col justify-end"
    >
      {/* Thumbnail */}
      <img
        src={video.thumbnail}
        alt={video.title}
        className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-500"
      />
      {/* Dark overlay gradients */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/30" />

      {/* Badges on top */}
      <div className="absolute top-3 left-3 right-3 flex justify-between items-center z-10">
        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-white/95 text-[oklch(0.22_0.07_260)] shadow-sm">
          Curto
        </span>
        {video.premium ? (
          <span className="flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-[oklch(0.75_0.12_75)] text-[oklch(0.15_0.02_260)] shadow-sm">
            <Crown size={9} />
            Premium
          </span>
        ) : (
          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-500 text-white shadow-sm">
            Grátis
          </span>
        )}
      </div>

      {/* Action Buttons (Always accessible on mobile, hover-focused on desktop) */}
      <div
        className="absolute top-11 right-3 flex flex-col items-center gap-1.5 z-20 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onShare}
          id={`btn-share-${video.id}`}
          className="w-8 h-8 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center border border-white/10 shadow-sm transition-all cursor-pointer hover:scale-105"
          title="Compartilhar"
        >
          <Share2 size={13} />
        </button>
        <button
          onClick={onToggleFavorite}
          id={`btn-fav-${video.id}`}
          className={`w-8 h-8 rounded-full flex items-center justify-center border shadow-sm transition-all cursor-pointer hover:scale-105 ${
            isFavorited
              ? "bg-red-600 border-red-500 text-white"
              : "bg-black/60 hover:bg-black/85 border-white/10 text-white"
          }`}
          title={isFavorited ? "Remover dos Favoritos" : "Adicionar aos Favoritos"}
        >
          <Heart size={13} className={isFavorited ? "fill-white" : ""} />
        </button>
      </div>

      {/* Play/Lock Hover Overlay */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/35 backdrop-blur-[2px] z-10">
        <div className="w-11 h-11 rounded-full bg-white/95 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
          {isVideoLocked ? (
            <Lock className="w-4 h-4 text-[oklch(0.65_0.12_70)]" />
          ) : (
            <Play className="w-4 h-4 text-[oklch(0.22_0.07_260)] fill-[oklch(0.22_0.07_260)] ml-0.5" />
          )}
        </div>
      </div>

      {/* Info on bottom */}
      <div className="p-4 flex flex-col justify-end z-10 relative">
        <div className="text-[9px] font-semibold text-white/70 uppercase tracking-wider mb-0.5">
          {video.category} • {video.narrator}
        </div>
        <h3 className="font-display text-sm font-bold text-white leading-tight mb-1 group-hover:text-[oklch(0.88_0.08_80)] transition-colors line-clamp-2">
          {video.title}
        </h3>
        <p className="text-[11px] text-white/80 line-clamp-2 leading-snug font-serif mb-2.5">
          {video.description}
        </p>
        <div className="flex items-center justify-between text-[10px] text-white/60">
          <span className="flex items-center gap-1">
            <Clock size={10} />
            {video.duration}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      {playbackProgress && (
        <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20 z-20">
          <div
            className="h-full bg-red-600 transition-all duration-300"
            style={{ width: `${playbackProgress.progressPercent}%` }}
          />
        </div>
      )}
    </div>
  );
}

function HorizontalVideoCard({
  video,
  isVideoLocked,
  isFavorited,
  onToggleFavorite,
  onShare,
  playbackProgress,
  onPlay,
}: {
  video: BibleVideo;
  isVideoLocked: boolean;
  isFavorited: boolean;
  onToggleFavorite: (e: React.MouseEvent) => void;
  onShare: (e: React.MouseEvent) => void;
  playbackProgress?: { currentTime: number; progressPercent: number };
  onPlay: () => void;
}) {
  return (
    <div
      id={`video-card-${video.id}`}
      className="group flex flex-col bg-white rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-lg hover:scale-[1.03] hover:ring-2 hover:ring-[oklch(0.75_0.12_75)] hover:border-transparent transition-all duration-500"
    >
      {/* Thumbnail Container */}
      <div className="relative aspect-video bg-black overflow-hidden cursor-pointer" onClick={onPlay}>
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Badges de Duração e Tipo */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/70 text-[10px] font-semibold text-white tracking-wide">
          <Clock size={10} />
          {video.duration}
        </div>

        <div className="absolute top-3 left-3 flex gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/95 text-[oklch(0.22_0.07_260)] shadow-sm">
            Longo
          </span>
          {video.premium ? (
            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[oklch(0.75_0.12_75)] text-[oklch(0.15_0.02_260)] shadow-sm">
              <Crown size={10} />
              Premium
            </span>
          ) : (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 shadow-sm">
              Grátis
            </span>
          )}
        </div>

        {/* Action Buttons (Always accessible on mobile, hover-focused on desktop) */}
        <div
          className="absolute top-3 right-3 flex items-center gap-1.5 z-20 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onShare}
            id={`btn-share-${video.id}`}
            className="w-8 h-8 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center border border-white/10 shadow-sm transition-all cursor-pointer hover:scale-105"
            title="Compartilhar"
          >
            <Share2 size={13} />
          </button>
          <button
            onClick={onToggleFavorite}
            id={`btn-fav-${video.id}`}
            className={`w-8 h-8 rounded-full flex items-center justify-center border shadow-sm transition-all cursor-pointer hover:scale-105 ${
              isFavorited
                ? "bg-red-600 border-red-500 text-white"
                : "bg-black/60 hover:bg-black/85 border-white/10 text-white"
            }`}
            title={isFavorited ? "Remover dos Favoritos" : "Adicionar aos Favoritos"}
          >
            <Heart size={13} className={isFavorited ? "fill-white" : ""} />
          </button>
        </div>

        {/* Play / Lock overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/35 backdrop-blur-[2px]">
          <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            {isVideoLocked ? (
              <Lock className="w-5 h-5 text-[oklch(0.65_0.12_70)]" />
            ) : (
              <Play className="w-5 h-5 text-[oklch(0.22_0.07_260)] fill-[oklch(0.22_0.07_260)] ml-0.5" />
            )}
          </div>
        </div>

        {/* Progress Bar */}
        {playbackProgress && (
          <div className="absolute bottom-0 left-0 w-full h-1 bg-white/25 z-20">
            <div
              className="h-full bg-red-600 transition-all duration-300"
              style={{ width: `${playbackProgress.progressPercent}%` }}
            />
          </div>
        )}
      </div>

      {/* Info Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="text-[10px] font-semibold text-[oklch(0.65_0.12_70)] uppercase tracking-wider mb-1">
            {video.category} • {video.narrator}
          </div>
          <h3
            className="font-display text-base font-bold text-[oklch(0.22_0.07_260)] mb-2 group-hover:text-[oklch(0.65_0.12_70)] transition-colors cursor-pointer"
            onClick={onPlay}
          >
            {video.title}
          </h3>
          <p className="font-serif text-sm text-muted-foreground line-clamp-3 leading-relaxed mb-4">
            {video.description}
          </p>
        </div>

        <Button
          variant={isVideoLocked ? "outline" : "default"}
          size="sm"
          id={`btn-action-${video.id}`}
          className={`w-full font-semibold ${
            isVideoLocked
              ? "border-[oklch(0.75_0.12_75/0.5)] text-[oklch(0.65_0.12_70)] hover:bg-[oklch(0.75_0.12_75/0.1)]"
              : "bg-[oklch(0.22_0.07_260)] hover:bg-[oklch(0.28_0.08_260)] text-white"
          }`}
          onClick={onPlay}
        >
          {isVideoLocked ? (
            <>
              <Lock size={13} className="mr-1.5" />
              Desbloquear com Premium
            </>
          ) : (
            <>
              <Play size={13} className="mr-1.5" />
              Assistir Agora
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

export default function VideosBiblicos() {
  const { isAuthenticated, loading } = useAuth();
  const [filter, setFilter] = useState<"all" | "short" | "long">("all");
  const [selectedVideo, setSelectedVideo] = useState<BibleVideo | null>(null);
  const [showPremiumLock, setShowPremiumLock] = useState(false);
  const [lockedVideoTitle, setLockedVideoTitle] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");

  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem("sanctificare_video_favorites");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [videoProgress, setVideoProgress] = useState<Record<string, { currentTime: number; progressPercent: number }>>(() => {
    try {
      const stored = localStorage.getItem("sanctificare_video_progress");
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const videoPlayerRef = useRef<HTMLVideoElement>(null);
  const lastSavedTimeRef = useRef<Record<string, number>>({});

  const { data: subscription, isLoading: subLoading } = trpc.subscriptions.getActive.useQuery(
    undefined, { enabled: isAuthenticated }
  );
  
  const logPrayer = trpc.prayers.logPrayer.useMutation();
  const isPremium = !!subscription;

  // Extract categories dynamically and add Favorites pill
  const categories = useMemo(() => {
    const cats = new Set(BIBLE_VIDEOS.map(v => v.category));
    return ["Todos", "Favoritos", ...Array.from(cats)];
  }, []);

  const filteredVideos = useMemo(() => {
    return BIBLE_VIDEOS.filter(video => {
      const matchesType = filter === "all" || video.type === filter;
      
      let matchesCategory = false;
      if (selectedCategory === "Todos") {
        matchesCategory = true;
      } else if (selectedCategory === "Favoritos") {
        matchesCategory = favorites.includes(video.id);
      } else {
        matchesCategory = video.category === selectedCategory;
      }

      const matchesSearch = searchQuery.trim() === "" ||
        video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.narrator.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesCategory && matchesSearch;
    });
  }, [filter, selectedCategory, searchQuery, favorites]);

  const handleToggleFavorite = (videoId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) => {
      const updated = prev.includes(videoId)
        ? prev.filter((id) => id !== videoId)
        : [...prev, videoId];
      localStorage.setItem("sanctificare_video_favorites", JSON.stringify(updated));
      toast.success(prev.includes(videoId) ? "Removido dos favoritos" : "Adicionado aos favoritos");
      return updated;
    });
  };

  const handleShareVideo = (video: BibleVideo, e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}${window.location.pathname}?v=${video.id}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      toast.success("Link copiado!", {
        description: `Compartilhe com seus amigos para assistirem: "${video.title}"`,
      });
    }).catch(() => {
      toast.error("Não foi possível copiar o link.");
    });
  };

  const updateVideoProgress = (videoId: string, currentTime: number, progressPercent: number) => {
    const lastSaved = lastSavedTimeRef.current[videoId] || 0;
    const timeDiff = Math.abs(currentTime - lastSaved);
    const isCompletedOrStarted = progressPercent > 97 || progressPercent < 3;

    if (timeDiff >= 2.5 || isCompletedOrStarted) {
      lastSavedTimeRef.current[videoId] = currentTime;

      if (progressPercent >= 3 && progressPercent <= 97) {
        setVideoProgress((prev) => {
          const updated = {
            ...prev,
            [videoId]: { currentTime, progressPercent },
          };
          localStorage.setItem("sanctificare_video_progress", JSON.stringify(updated));
          return updated;
        });
      } else {
        setVideoProgress((prev) => {
          if (!prev[videoId]) return prev;
          const updated = { ...prev };
          delete updated[videoId];
          localStorage.setItem("sanctificare_video_progress", JSON.stringify(updated));
          return updated;
        });
      }
    }
  };

  const handleTimeUpdate = () => {
    if (!selectedVideo || !videoPlayerRef.current) return;
    const video = videoPlayerRef.current;
    const currentTime = video.currentTime;
    const duration = video.duration;
    if (!duration || duration <= 0) return;

    const progressPercent = (currentTime / duration) * 100;
    updateVideoProgress(selectedVideo.id, currentTime, progressPercent);
  };

  const handleLoadedMetadata = () => {
    if (!selectedVideo || !videoPlayerRef.current) return;
    const video = videoPlayerRef.current;
    const saved = videoProgress[selectedVideo.id];
    if (saved && saved.currentTime > 0) {
      video.currentTime = saved.currentTime;
      toast.info("Retomando de onde você parou", {
        description: `Retomado em ${Math.floor(saved.currentTime / 60)}m ${Math.floor(saved.currentTime % 60)}s`,
      });
    }
  };

  // Listen for Bunny Stream iframe messages using player.js protocol
  useEffect(() => {
    if (!selectedVideo || !BUNNY_LIBRARY_ID) return;

    const handleMessage = (event: MessageEvent) => {
      if (!TRUSTED_BUNNY_ORIGINS.has(event.origin)) {
        return;
      }

      const iframe = document.getElementById("bunny-stream-embed") as HTMLIFrameElement | null;
      if (!iframe?.contentWindow || event.source !== iframe.contentWindow) {
        return;
      }

      let data;
      try {
        data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
      } catch {
        return;
      }

      if (data && typeof data === "object" && data.context === "player.js") {
        if (data.event === "ready") {
          if (iframe && iframe.contentWindow) {
            // Subscribe to timeupdate event
            iframe.contentWindow.postMessage(
              JSON.stringify({ method: "addEventListener", value: "timeupdate", context: "player.js" }),
              event.origin
            );

            // Restore progress if it exists
            const saved = videoProgress[selectedVideo.id];
            if (saved && saved.currentTime > 0) {
              iframe.contentWindow.postMessage(
                JSON.stringify({ method: "setCurrentTime", value: saved.currentTime, context: "player.js" }),
                event.origin
              );
              toast.info("Retomando de onde você parou", {
                description: `Retomado em ${Math.floor(saved.currentTime / 60)}m ${Math.floor(saved.currentTime % 60)}s`,
              });
            }
          }
        } else if (data.event === "timeupdate") {
          const seconds = data.value?.seconds ?? data.value?.secondsVal ?? 0;
          const duration = data.value?.duration ?? data.value?.durationVal ?? 0;
          if (duration > 0) {
            const progressPercent = (seconds / duration) * 100;
            updateVideoProgress(selectedVideo.id, seconds, progressPercent);
          }
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [selectedVideo]);



  // Handle direct link sharing (?v=video-id)
  useEffect(() => {
    if (!loading && !subLoading) {
      const params = new URLSearchParams(window.location.search);
      const videoId = params.get("v");
      if (videoId) {
        const video = BIBLE_VIDEOS.find(v => v.id === videoId);
        if (video) {
          const timer = setTimeout(() => {
            handlePlayVideo(video);
            window.history.replaceState({}, document.title, window.location.pathname);
          }, 300);
          return () => clearTimeout(timer);
        }
      }
    }
  }, [loading, subLoading]);

  const handlePlayVideo = async (video: BibleVideo) => {
    if (video.premium && !isPremium) {
      setLockedVideoTitle(video.title);
      setShowPremiumLock(true);
      return;
    }
    
    setSelectedVideo(video);

    // Registrar no histórico de oração/meditação como uma atividade realizada
    if (isAuthenticated) {
      try {
        await logPrayer.mutateAsync({
          prayerType: "video_biblico",
          prayerName: `Assistiu: ${video.title} (${video.type === "short" ? "Curto" : "Longo"})`,
        });
      } catch (err) {
        console.error("Erro ao registrar atividade:", err);
      }
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
          <p className="text-muted-foreground mb-6">Entre para contemplar os vídeos com IA.</p>
          <a href={getLoginUrl()}><Button>Entrar</Button></a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[oklch(0.97_0.01_85)]">
      <AppNav />

      <main className="container py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-2 mb-2">
            <Film size={20} className="text-[oklch(0.55_0.14_15)]" />
            <span className="text-sm text-muted-foreground font-medium">Vídeos</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-[oklch(0.22_0.07_260)] mb-2">
            Vídeos com IA
          </h1>
          <p className="font-serif text-muted-foreground max-w-2xl">
            Contemple passagens sagradas recriadas cinematograficamente com inteligência artificial. Assista a reflexões curtas e histórias completas.
          </p>
        </div>

        {/* Filtros e Busca */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-[oklch(0.75_0.12_75/0.2)] pb-6 animate-fade-in">
          {/* Format Selector */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              size="sm"
              id="btn-filter-all"
              onClick={() => setFilter("all")}
              className={`cursor-pointer ${filter === "all" ? "bg-[oklch(0.22_0.07_260)] text-white" : "text-[oklch(0.22_0.07_260)]"}`}
            >
              Todos os Vídeos
            </Button>
            <Button
              variant={filter === "short" ? "default" : "outline"}
              size="sm"
              id="btn-filter-short"
              onClick={() => setFilter("short")}
              className={`cursor-pointer ${filter === "short" ? "bg-[oklch(0.22_0.07_260)] text-white" : "text-[oklch(0.22_0.07_260)]"}`}
            >
              Curtos (Reflexões)
            </Button>
            <Button
              variant={filter === "long" ? "default" : "outline"}
              size="sm"
              id="btn-filter-long"
              onClick={() => setFilter("long")}
              className={`cursor-pointer ${filter === "long" ? "bg-[oklch(0.22_0.07_260)] text-white" : "text-[oklch(0.22_0.07_260)]"}`}
            >
              Longos (Histórias)
            </Button>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              id="input-video-search"
              placeholder="Buscar vídeos, narradores..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/70 border border-border/80 focus:border-[oklch(0.22_0.07_260)]/40 focus:bg-white text-sm pl-9 pr-8 py-2 rounded-xl focus:outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                id="btn-clear-search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-black/5 text-muted-foreground cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Category Pills Carousel */}
        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-none mb-6 animate-fade-in">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                id={`category-pill-${cat.toLowerCase().replace(/\s+/g, "-")}`}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer ${
                  isSelected
                    ? "bg-[oklch(0.55_0.14_15)] border-[oklch(0.55_0.14_15)] text-white shadow-sm"
                    : "bg-white/40 border-border/60 text-muted-foreground hover:bg-white/80 hover:text-[oklch(0.22_0.07_260)]"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {subLoading ? (
          <div className="space-y-12">
            {filter === "all" ? (
              <>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Video size={18} className="text-[oklch(0.55_0.14_15)]" />
                    <Skeleton className="h-6 w-48 bg-slate-200" />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <VerticalVideoSkeleton key={i} />
                    ))}
                  </div>
                </div>
                <div className="space-y-4 pt-4">
                  <div className="flex items-center gap-2">
                    <Film size={18} className="text-[oklch(0.55_0.14_15)]" />
                    <Skeleton className="h-6 w-48 bg-slate-200" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                      <HorizontalVideoSkeleton key={i} />
                    ))}
                  </div>
                </div>
              </>
            ) : filter === "short" ? (
              <div className="space-y-4">
                <Skeleton className="h-6 w-48 bg-slate-200" />
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <VerticalVideoSkeleton key={i} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Skeleton className="h-6 w-48 bg-slate-200" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <HorizontalVideoSkeleton key={i} />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : filteredVideos.length === 0 ? (
          selectedCategory === "Favoritos" && favorites.length === 0 ? (
            <div className="py-16 text-center max-w-md mx-auto space-y-4 animate-fade-in" id="empty-favorites-state">
              <div className="w-14 h-14 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto shadow-inner">
                <Heart size={24} className="fill-red-500" />
              </div>
              <h3 className="font-display text-xl font-bold text-[oklch(0.22_0.07_260)]">Nenhum favorito ainda</h3>
              <p className="font-serif text-sm text-muted-foreground leading-relaxed">
                Você ainda não favoritou nenhum vídeo. Clique no ícone de coração nos cards de vídeo para salvá-los aqui e assisti-los depois.
              </p>
              <Button
                variant="default"
                size="sm"
                onClick={() => setSelectedCategory("Todos")}
                className="mt-2 cursor-pointer bg-[oklch(0.22_0.07_260)] text-white hover:bg-[oklch(0.28_0.08_260)]"
                id="btn-back-to-all-videos"
              >
                Explorar Vídeos
              </Button>
            </div>
          ) : (
            <div className="py-16 text-center max-w-md mx-auto space-y-3 animate-fade-in" id="empty-search-state">
              <div className="w-12 h-12 rounded-full bg-white/40 flex items-center justify-center mx-auto text-muted-foreground">
                <AlertCircle size={20} />
              </div>
              <h3 className="font-display text-lg font-bold text-[oklch(0.22_0.07_260)]">Nenhum vídeo encontrado</h3>
              <p className="font-serif text-sm text-muted-foreground">
                Não encontramos vídeos correspondentes aos termos buscados ou aos filtros selecionados. Tente limpar os filtros ou buscar por outra palavra.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("Todos");
                  setFilter("all");
                }}
                className="mt-2 cursor-pointer"
                id="btn-clear-all-filters"
              >
                Limpar Todos os Filtros
              </Button>
            </div>
          )
        ) : filter === "all" ? (
          <div className="space-y-12 animate-fade-in">
            {/* Section: Curtos (Reflexões Verticais) */}
            {filteredVideos.some(v => v.type === "short") && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Video size={18} className="text-[oklch(0.55_0.14_15)]" />
                    <h2 className="font-display text-xl font-bold text-[oklch(0.22_0.07_260)]">
                      Reflexões Curtas (Formato Vertical)
                    </h2>
                  </div>
                  <Button variant="link" onClick={() => setFilter("short")} className="text-[oklch(0.65_0.12_70)] font-semibold p-0 cursor-pointer">
                    Ver Todos
                  </Button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {filteredVideos.filter(v => v.type === "short").map((video) => (
                    <VerticalVideoCard
                      key={video.id}
                      video={video}
                      isVideoLocked={video.premium && !isPremium}
                      isFavorited={favorites.includes(video.id)}
                      onToggleFavorite={(e) => handleToggleFavorite(video.id, e)}
                      onShare={(e) => handleShareVideo(video, e)}
                      playbackProgress={videoProgress[video.id]}
                      onPlay={() => handlePlayVideo(video)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Section: Longos (Histórias Horizontais) */}
            {filteredVideos.some(v => v.type === "long") && (
              <div className="space-y-4 pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Film size={18} className="text-[oklch(0.55_0.14_15)]" />
                    <h2 className="font-display text-xl font-bold text-[oklch(0.22_0.07_260)]">
                      Histórias Completas (Formato Horizontal)
                    </h2>
                  </div>
                  <Button variant="link" onClick={() => setFilter("long")} className="text-[oklch(0.65_0.12_70)] font-semibold p-0 cursor-pointer">
                    Ver Todos
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredVideos.filter(v => v.type === "long").map((video) => (
                    <HorizontalVideoCard
                      key={video.id}
                      video={video}
                      isVideoLocked={video.premium && !isPremium}
                      isFavorited={favorites.includes(video.id)}
                      onToggleFavorite={(e) => handleToggleFavorite(video.id, e)}
                      onShare={(e) => handleShareVideo(video, e)}
                      playbackProgress={videoProgress[video.id]}
                      onPlay={() => handlePlayVideo(video)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : filter === "short" ? (
          <div className="space-y-4 animate-fade-in">
            <h2 className="font-display text-xl font-bold text-[oklch(0.22_0.07_260)] flex items-center gap-2 mb-4">
              <Video size={18} className="text-[oklch(0.55_0.14_15)]" />
              Reflexões Curtas (Formato Vertical)
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredVideos.map((video) => (
                <VerticalVideoCard
                  key={video.id}
                  video={video}
                  isVideoLocked={video.premium && !isPremium}
                  isFavorited={favorites.includes(video.id)}
                  onToggleFavorite={(e) => handleToggleFavorite(video.id, e)}
                  onShare={(e) => handleShareVideo(video, e)}
                  playbackProgress={videoProgress[video.id]}
                  onPlay={() => handlePlayVideo(video)}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4 animate-fade-in">
            <h2 className="font-display text-xl font-bold text-[oklch(0.22_0.07_260)] flex items-center gap-2 mb-4">
              <Film size={18} className="text-[oklch(0.55_0.14_15)]" />
              Histórias Completas (Formato Horizontal)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVideos.map((video) => (
                <HorizontalVideoCard
                  key={video.id}
                  video={video}
                  isVideoLocked={video.premium && !isPremium}
                  isFavorited={favorites.includes(video.id)}
                  onToggleFavorite={(e) => handleToggleFavorite(video.id, e)}
                  onShare={(e) => handleShareVideo(video, e)}
                  playbackProgress={videoProgress[video.id]}
                  onPlay={() => handlePlayVideo(video)}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Modal do Player de Vídeo */}
      <Dialog open={selectedVideo !== null} onOpenChange={(open) => !open && setSelectedVideo(null)}>
        {selectedVideo && (
          <DialogContent className={`p-0 bg-black border-none shadow-2xl transition-all duration-300 flex flex-col max-h-[92vh] overflow-y-auto ${
            selectedVideo.type === "short"
              ? "max-w-sm md:max-w-[380px]"
              : "max-w-3xl"
          }`}>
            <DialogHeader className="sr-only">
              <DialogTitle>{selectedVideo.title}</DialogTitle>
              <DialogDescription>{selectedVideo.description}</DialogDescription>
            </DialogHeader>
            <div className={`relative w-full bg-black flex-shrink-0 ${
              selectedVideo.type === "short"
                ? "aspect-[9/16] max-h-[50vh] sm:max-h-[60vh] md:max-h-none"
                : "aspect-video"
            }`}>
              {BUNNY_LIBRARY_ID ? (
                <iframe
                  id="bunny-stream-embed"
                  src={`https://iframe.mediadelivery.net/embed/${BUNNY_LIBRARY_ID}/${selectedVideo.bunnyVideoId}?autoplay=true&loop=false&playsinline=true`}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full border-none"
                  allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : (
                <video
                  ref={videoPlayerRef}
                  src={selectedVideo.fallbackUrl}
                  controls
                  autoPlay
                  playsInline
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  className="w-full h-full object-contain"
                />
              )}
            </div>
            <div className="p-6 bg-[oklch(0.12_0.03_260)] text-white border-t border-white/10 flex-1 overflow-y-auto max-h-[35vh] md:max-h-none">
              <div className="flex items-center justify-between gap-4 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/10 text-white">
                  {selectedVideo.type === "short" ? "Vídeo Curto" : "Vídeo Longo"}
                </span>
                <span className="text-xs text-white/60 font-serif">
                  Narrado por: {selectedVideo.narrator}
                </span>
              </div>
              <div className="flex justify-between items-start gap-4 mb-2">
                <h2 className="font-display text-xl font-bold text-[oklch(0.88_0.08_80)] leading-tight">
                  {selectedVideo.title}
                </h2>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={(e) => handleShareVideo(selectedVideo, e)}
                    id={`btn-dialog-share-${selectedVideo.id}`}
                    className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition-all cursor-pointer"
                    title="Compartilhar"
                  >
                    <Share2 size={16} />
                  </button>
                  <button
                    onClick={(e) => handleToggleFavorite(selectedVideo.id, e)}
                    id={`btn-dialog-fav-${selectedVideo.id}`}
                    className={`p-2 rounded-full transition-all cursor-pointer ${
                      favorites.includes(selectedVideo.id)
                        ? "bg-red-600/80 text-white hover:bg-red-600"
                        : "bg-white/5 hover:bg-white/10 text-white"
                    }`}
                    title={favorites.includes(selectedVideo.id) ? "Remover dos Favoritos" : "Adicionar aos Favoritos"}
                  >
                    <Heart size={16} className={favorites.includes(selectedVideo.id) ? "fill-white" : ""} />
                  </button>
                </div>
              </div>
              <p className="font-serif text-sm text-white/80 leading-relaxed">
                {selectedVideo.description}
              </p>
            </div>
          </DialogContent>
        )}
      </Dialog>

      {/* Modal de Bloqueio Premium */}
      <Dialog open={showPremiumLock} onOpenChange={setShowPremiumLock}>
        <DialogContent className="max-w-md bg-white border border-border shadow-xl rounded-2xl p-6">
          <DialogHeader className="items-center text-center">
            <div className="w-14 h-14 rounded-full bg-[oklch(0.75_0.12_75/0.15)] border border-[oklch(0.75_0.12_75/0.4)] flex items-center justify-center mb-4">
              <Crown size={28} className="text-[oklch(0.65_0.12_70)]" />
            </div>
            <DialogTitle className="font-display text-xl text-[oklch(0.22_0.07_260)] font-bold">
              Conteúdo Premium Exclusivo
            </DialogTitle>
            <DialogDescription className="font-serif text-sm text-muted-foreground mt-2">
              O vídeo <strong>"{lockedVideoTitle}"</strong> e outras recriações cinematográficas bíblicas estão disponíveis somente para assinantes Premium.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-6">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-[oklch(0.97_0.01_85)] border border-border">
              <Sparkles size={18} className="text-[oklch(0.65_0.12_70)] flex-shrink-0 mt-0.5" />
              <div className="text-xs text-[oklch(0.22_0.07_260)] font-serif leading-relaxed">
                Acesse todos os vídeos curtos e longos gerados por IA, terços completos, novenas exclusivas e meditações diárias guiadas.
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Link href="/premium">
              <Button className="w-full bg-[oklch(0.75_0.12_75)] hover:bg-[oklch(0.70_0.13_73)] text-[oklch(0.15_0.02_260)] font-bold shadow-md">
                Ver Planos Premium
              </Button>
            </Link>
            <Button variant="outline" className="w-full" onClick={() => setShowPremiumLock(false)}>
              Voltar depois
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
