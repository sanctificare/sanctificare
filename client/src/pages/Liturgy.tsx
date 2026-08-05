import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl, resolveR2Redirect } from "@/const";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Minus, Plus, CornerUpLeft, ChevronLeft, ChevronRight, Calendar, Type, Play, Pause, RotateCcw, Volume2, VolumeX, Music, Share2, Sparkles, Star, Headphones, BookOpen, ShieldCheck, ArrowRight, CheckCircle2, UserCheck } from "lucide-react";
import { Heart } from "@/components/HeartIcon";
import { trpc } from "@/lib/trpc";
import { LiturgyIcon } from "@/components/LiturgyIcon";
import { toast } from "sonner";
import LiturgyReadings from "@/components/LiturgyReadings";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { getPrayerArt } from "@/lib/cardArt";
import { getLiturgyAudioByDate, getLiturgyReadingsAudioByDate, type LiturgyDailyAudioTrack } from "@/data/liturgy-audio";
import { getDailyContent } from "@/data/daily";
import { isMobileApp } from "@/const";
import { shareText } from "@/lib/share";
import ShareModal from "@/components/ShareModal";
import { useOfflineSync } from "@/hooks/useOfflineSync";


const LOGO_IMG = "/assets/sanctificare-logo-v2.webp";

export interface LiturgicalTheme {
  name: string;
  primary: string;
  bgLight: string;
  border: string;
  glow: string;
  badge: string;
  accentText: string;
}

export function getLiturgicalTheme(color?: string | null): LiturgicalTheme {
  const c = color?.toLowerCase() || "";
  if (c.includes("verde")) {
    return {
      name: "Verde",
      primary: "text-emerald-600 dark:text-emerald-400",
      bgLight: "bg-emerald-500/5 dark:bg-emerald-950/10 border-emerald-500/10",
      border: "border-emerald-500/20 dark:border-emerald-500/30",
      glow: "shadow-[0_0_20px_rgba(16,185,129,0.08)]",
      badge: "bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 border-emerald-500/30",
      accentText: "text-emerald-700 dark:text-emerald-300",
    };
  }
  if (c.includes("roxo") || c.includes("violeta")) {
    return {
      name: "Roxo",
      primary: "text-purple-600 dark:text-purple-400",
      bgLight: "bg-purple-500/5 dark:bg-purple-950/10 border-purple-500/10",
      border: "border-purple-500/20 dark:border-purple-500/30",
      glow: "shadow-[0_0_20px_rgba(147,51,234,0.08)]",
      badge: "bg-purple-500/15 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300 border-purple-500/30",
      accentText: "text-purple-700 dark:text-purple-300",
    };
  }
  if (c.includes("vermelho")) {
    return {
      name: "Vermelho",
      primary: "text-rose-600 dark:text-rose-400",
      bgLight: "bg-rose-500/5 dark:bg-rose-950/10 border-rose-500/10",
      border: "border-rose-500/20 dark:border-rose-500/30",
      glow: "shadow-[0_0_20px_rgba(244,63,94,0.08)]",
      badge: "bg-rose-500/15 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300 border-rose-500/30",
      accentText: "text-rose-700 dark:text-rose-300",
    };
  }
  if (c.includes("branco") || c.includes("dourado")) {
    return {
      name: "Branco",
      primary: "text-amber-600 dark:text-amber-400",
      bgLight: "bg-amber-500/5 dark:bg-amber-950/10 border-amber-500/10",
      border: "border-amber-500/20 dark:border-amber-500/30",
      glow: "shadow-[0_0_20px_rgba(245,158,11,0.08)]",
      badge: "bg-amber-500/15 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300 border-amber-500/30",
      accentText: "text-amber-700 dark:text-amber-300",
    };
  }
  if (c.includes("rosa")) {
    return {
      name: "Rosa",
      primary: "text-pink-600 dark:text-pink-400",
      bgLight: "bg-pink-500/5 dark:bg-pink-950/10 border-pink-500/10",
      border: "border-pink-500/20 dark:border-pink-500/30",
      glow: "shadow-[0_0_20px_rgba(236,72,153,0.08)]",
      badge: "bg-pink-500/15 text-pink-700 dark:bg-pink-500/20 dark:text-pink-300 border-pink-500/30",
      accentText: "text-pink-700 dark:text-pink-300",
    };
  }
  return {
    name: "Comum",
    primary: "text-[oklch(0.65_0.14_70)]",
    bgLight: "bg-[oklch(0.75_0.12_75/0.05)] border-[oklch(0.75_0.12_75/0.1)]",
    border: "border-[oklch(0.75_0.12_75/0.2)]",
    glow: "shadow-[0_0_20px_rgba(191,155,48,0.05)]",
    badge: "bg-[oklch(0.75_0.12_75/0.1)] text-[oklch(0.65_0.14_70)] border-[oklch(0.75_0.12_75/0.2)]",
    accentText: "text-[oklch(0.65_0.14_70)]",
  };
}

export default function Liturgy() {
  const { queueOfflinePrayerLog } = useOfflineSync();
  const { isAuthenticated, loading } = useAuth();
  const logPrayer = trpc.prayers.logPrayer.useMutation();

  const [isOffline, setIsOffline] = useState<boolean>(
    typeof navigator !== "undefined" ? !navigator.onLine : false
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const dateInputRef = useRef<HTMLInputElement>(null);

  const formatDateToISO = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const selectedDateIso = formatDateToISO(selectedDate);
  const isTodaySelected = selectedDateIso === formatDateToISO(new Date());

  const { data: liturgyFromServer, isLoading: isFetchingLiturgy, error } = trpc.liturgy.getByDate.useQuery(
    { date: selectedDateIso }
  );

  const [liturgy, setLiturgy] = useState<any>(null);

  useEffect(() => {
    if (liturgyFromServer) {
      setLiturgy(liturgyFromServer);
      try {
        localStorage.setItem(`sanctificare_liturgy_cache_${selectedDateIso}`, JSON.stringify(liturgyFromServer));
      } catch (err) {
        console.warn("Erro ao salvar cache da liturgia:", err);
      }
    }
  }, [liturgyFromServer, selectedDateIso]);

  useEffect(() => {
    if (!liturgyFromServer) {
      try {
        const saved = localStorage.getItem(`sanctificare_liturgy_cache_${selectedDateIso}`);
        if (saved) {
          setLiturgy(JSON.parse(saved));
        } else {
          setLiturgy(null);
        }
      } catch (err) {
        console.error("Erro ao carregar cache da liturgia:", err);
      }
    }
  }, [liturgyFromServer, selectedDateIso]);



  interface AudioTrack {
    url: string;
    title: string;
    description: string;
    supportText?: string;
  }

  const [playlist, setPlaylist] = useState<AudioTrack[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [audioUnavailable, setAudioUnavailable] = useState(false);
  const [isZenMode, setIsZenMode] = useState(false);
  const [fontSize, setFontSize] = useState<"sm" | "md" | "lg" | "xl">(
    (localStorage.getItem("sanctificare_liturgy_font_size") as any) || "md"
  );
  const [fontFamily, setFontFamily] = useState<"serif" | "sans">(
    (localStorage.getItem("sanctificare_liturgy_font_family") as any) || "serif"
  );

  const toggleFontFamily = () => {
    const next = fontFamily === "serif" ? "sans" : "serif";
    setFontFamily(next);
    localStorage.setItem("sanctificare_liturgy_font_family", next);
  };



  useEffect(() => {
    if (!liturgy) {
      setPlaylist([]);
      setCurrentTrackIndex(0);
      setAudioUnavailable(false);
      return;
    }

    // 1. Verifica se existe o áudio diário unificado (narração geral)
    const unifiedAudio = getLiturgyAudioByDate(liturgy.liturgyDate);
    if (unifiedAudio) {
      setPlaylist([
        {
          url: unifiedAudio.audioUrl,
          title: unifiedAudio.title,
          description: unifiedAudio.description || "Narração humana da Liturgia Diária.",
          supportText: [
            liturgy.firstReading?.texto,
            liturgy.psalm?.texto,
            liturgy.secondReading?.texto,
            liturgy.gospel?.texto,
          ]
            .filter(Boolean)
            .join("\n\n"),
        },
      ]);
      setCurrentTrackIndex(0);
      setAudioUnavailable(false);
      return;
    }

    // 2. Se não houver áudio unificado, verifica se há áudios individuais no R2 (Julho/26)
    const individualAudios = getLiturgyReadingsAudioByDate(liturgy.liturgyDate);
    if (individualAudios.firstReading || individualAudios.gospel) {
      const tracks: AudioTrack[] = [];

      if (individualAudios.firstReading && liturgy.firstReading) {
        tracks.push({
          url: individualAudios.firstReading,
          title: `1ª Leitura - ${liturgy.firstReading.referencia || ""}`,
          description: "Acompanhe a primeira leitura",
          supportText: liturgy.firstReading.texto,
        });
      }

      if (individualAudios.secondReading && liturgy.secondReading) {
        tracks.push({
          url: individualAudios.secondReading,
          title: `2ª Leitura - ${liturgy.secondReading.referencia || ""}`,
          description: "Acompanhe a segunda leitura",
          supportText: liturgy.secondReading.texto,
        });
      }

      if (individualAudios.gospel && liturgy.gospel) {
        tracks.push({
          url: individualAudios.gospel,
          title: `Evangelho - ${liturgy.gospel.referencia || ""}`,
          description: "Acompanhe a proclamação do Evangelho",
          supportText: liturgy.gospel.texto,
        });
      }

      if (tracks.length > 0) {
        setPlaylist(tracks);
        setCurrentTrackIndex(0);
        setAudioUnavailable(false);
        return;
      }
    }

    setPlaylist([]);
    setCurrentTrackIndex(0);
    setAudioUnavailable(true);
  }, [liturgy?.liturgyDate]);

  const [activeTab, setActiveTab] = useState<"audio" | "text">("audio");
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [playingUrl, setPlayingUrl] = useState("");
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [shareData, setShareData] = useState({
    title: "Salmo Responsorial Cantado",
    description: "Ouça o Salmo Responsorial Cantado da Liturgia de hoje."
  });

  useEffect(() => {
    let active = true;
    const currentTrack = playlist[currentTrackIndex];
    if (currentTrack?.url) {
      resolveR2Redirect(currentTrack.url).then((url) => {
        if (active) setPlayingUrl(url);
      });
    } else {
      setPlayingUrl("");
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
    }
    return () => {
      active = false;
    };
  }, [playlist, currentTrackIndex]);

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
      if (currentTrackIndex < playlist.length - 1) {
        setCurrentTrackIndex((prev) => prev + 1);
      }
    };

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [playingUrl, currentTrackIndex, playlist.length]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !playingUrl) return;

    if (currentTrackIndex > 0) {
      audio.play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  }, [playingUrl, currentTrackIndex]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    if (playlist.length === 0) {
      setActiveTab("text");
    } else {
      setActiveTab("audio");
    }
  }, [playlist]);

  const readingsAudio = getLiturgyReadingsAudioByDate(liturgy?.liturgyDate);

  const psalmAudioRef = useRef<HTMLAudioElement>(null);
  const [isPsalmPlaying, setIsPsalmPlaying] = useState(false);
  const [psalmCurrentTime, setPsalmCurrentTime] = useState(0);
  const [psalmDuration, setPsalmDuration] = useState(0);
  const [isPsalmMuted, setIsPsalmMuted] = useState(false);
  const [psalmPlayingUrl, setPsalmPlayingUrl] = useState("");

  useEffect(() => {
    let active = true;
    if (readingsAudio?.singedPsalm) {
      resolveR2Redirect(readingsAudio.singedPsalm).then((url) => {
        if (active) setPsalmPlayingUrl(url);
      });
    } else {
      setPsalmPlayingUrl("");
      setIsPsalmPlaying(false);
      setPsalmCurrentTime(0);
      setPsalmDuration(0);
    }
    return () => {
      active = false;
    };
  }, [readingsAudio?.singedPsalm]);

  useEffect(() => {
    const audio = psalmAudioRef.current;
    if (!audio) return;

    const updateTime = () => setPsalmCurrentTime(audio.currentTime);
    const updateDuration = () => {
      if (Number.isFinite(audio.duration)) {
        setPsalmDuration(audio.duration);
      }
    };
    const handleEnded = () => {
      setIsPsalmPlaying(false);
      setPsalmCurrentTime(0);
    };

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [psalmPlayingUrl]);

  useEffect(() => {
    if (psalmAudioRef.current) {
      psalmAudioRef.current.volume = isPsalmMuted ? 0 : volume;
    }
  }, [volume, isPsalmMuted]);

  const togglePlay = () => {
    const audio = audioRef.current;
    const psalmAudio = psalmAudioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      // Pause psalm player first!
      if (isPsalmPlaying && psalmAudio) {
        psalmAudio.pause();
        setIsPlaying(false);
      }
      audio.play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  };

  const handleSeek = (value: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = value;
    setCurrentTime(value);
  };

  const handleRestart = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    setCurrentTime(0);
    audio.play().then(() => setIsPlaying(true));
  };

  const togglePlayPsalm = () => {
    const psalmAudio = psalmAudioRef.current;
    const mainAudio = audioRef.current;
    if (!psalmAudio) return;

    if (isPsalmPlaying) {
      psalmAudio.pause();
      setIsPsalmPlaying(false);
    } else {
      // Pause main player first!
      if (isPlaying && mainAudio) {
        mainAudio.pause();
        setIsPlaying(false);
      }
      psalmAudio.play()
        .then(() => setIsPsalmPlaying(true))
        .catch(() => setIsPsalmPlaying(false));
    }
  };

  const handleSeekPsalm = (value: number) => {
    const audio = psalmAudioRef.current;
    if (!audio) return;
    audio.currentTime = value;
    setPsalmCurrentTime(value);
  };

  const handleRestartPsalm = () => {
    const audio = psalmAudioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    setPsalmCurrentTime(0);
    audio.play().then(() => setIsPlaying(true));
  };

  const handleSharePsalm = () => {
    const title = liturgy?.psalm?.referencia || "Salmo Responsorial";
    setShareData({
      title,
      description: `Versão cantada do salmo ${liturgy?.psalm?.referencia || "de hoje"}.`,
    });
    setIsShareOpen(true);
  };

  const handleShareLiturgy = () => {
    const title = liturgy?.celebration || "Liturgia Diária";
    setShareData({
      title,
      description: `Leituras e Reflexão da Liturgia Diária de hoje (${formattedDate}).`,
    });
    setIsShareOpen(true);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formattedDate = selectedDate.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const handlePrevDay = () => {
    const prev = new Date(selectedDate);
    prev.setDate(prev.getDate() - 1);
    setSelectedDate(prev);
  };

  const handleNextDay = () => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 1);
    setSelectedDate(next);
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  const handleLogLiturgy = async () => {
    if (!isAuthenticated) return;
    const prayerName = `Liturgia do Dia — ${liturgy?.celebration || "—"}`;
    try {
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        queueOfflinePrayerLog("liturgia", prayerName);
        return;
      }
      await logPrayer.mutateAsync({
        prayerType: "liturgia",
        prayerName: prayerName,
      });
      toast.success("Liturgia registrada!", {
        description: "Você rezou hoje em comunhão com a Igreja.",
      });
    } catch {
      console.error("Erro ao registrar liturgia:");
      queueOfflinePrayerLog("liturgia", prayerName);
    }
  };

  const theme = getLiturgicalTheme(liturgy?.color);
  const dailyContent = getDailyContent(selectedDate);

  // Dynamic SEO & Structured Data (JSON-LD) for Google Ranqueamento & Rich Snippets
  useEffect(() => {
    if (typeof window === "undefined") return;

    const celebrationTitle = liturgy?.celebration ? ` - ${liturgy.celebration}` : "";
    document.title = `Liturgia Diária em Áudio e Texto | Sanctificare${celebrationTitle}`;

    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute(
      "content",
      `Acompanhe a Liturgia Diária de hoje com narração em áudio de alta fidelidade, 1ª leitura, Salmo Responsorial cantado e Evangelho proclamado. Fortaleça sua vida espiritual no Sanctificare.`
    );

    const schemaId = "sanctificare-liturgy-jsonld";
    let scriptEl = document.getElementById(schemaId) as HTMLScriptElement | null;
    if (!scriptEl) {
      scriptEl = document.createElement("script");
      scriptEl.id = schemaId;
      scriptEl.type = "application/ld+json";
      document.head.appendChild(scriptEl);
    }

    const currentTrack = playlist[currentTrackIndex];
    const jsonLdData = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebPage",
          "@id": "https://sanctificare.app/liturgia",
          "url": "https://sanctificare.app/liturgia",
          "name": `Liturgia Diária em Áudio e Texto${celebrationTitle}`,
          "description": "Liturgia Diária completa com áudio narrado, Salmo Responsorial cantado e texto integral do Evangelho do Dia.",
          "inLanguage": "pt-BR"
        },
        {
          "@type": "AudioObject",
          "name": liturgy?.celebration ? `Áudio Liturgia Diária - ${liturgy.celebration}` : "Liturgia Diária em Áudio",
          "description": "Narração em áudio das leituras da Liturgia Diária católica.",
          "contentUrl": currentTrack?.url || "https://sanctificare.app/liturgia",
          "encodingFormat": "audio/mpeg",
          "inLanguage": "pt-BR"
        },
        {
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "O que é a Liturgia Diária?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "A Liturgia Diária é a sequência oficial de leituras bíblicas oferecidas pela Igreja Católica para cada dia do ano litúrgico, composta por Leitura, Salmo Responsorial e Evangelho."
              }
            },
            {
              "@type": "Question",
              "name": "A Liturgia Diária no Sanctificare é gratuita?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Sim! A leitura e o áudio da Liturgia Diária estão disponíveis gratuitamente no site e aplicativo Sanctificare para todos os fiéis."
              }
            },
            {
              "@type": "Question",
              "name": "Quais outros recursos o app Sanctificare oferece?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "O Sanctificare oferece o Santo Rosário Guiado em Áudio, Lectio Divina diária, Quaresma de São Miguel Arcanjo, Exame de Consciência e acompanhamento do seu hábito espiritual."
              }
            }
          ]
        }
      ]
    };

    scriptEl.textContent = JSON.stringify(jsonLdData);
  }, [liturgy, playlist, currentTrackIndex]);



  return (
    <div className={`min-h-screen transition-colors duration-500 ${isZenMode ? "bg-stone-50 dark:bg-stone-950 py-10" : "bg-background"}`}>
      {/* Landing Page Top Navigation Header (For Paid Ads Traffic & Visitors) */}
      {!isZenMode && (
        <header className="w-full border-b border-amber-500/20 bg-[#070c19] text-white py-3 px-4 sticky top-0 z-40 shadow-lg backdrop-blur-md bg-opacity-95">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <a href="/" className="flex items-center gap-2.5 group">
              <img src={LOGO_IMG} alt="Sanctificare Logo" className="w-8 h-8 rounded-lg object-contain border border-amber-500/30 shadow-md group-hover:scale-105 transition-transform" />
              <div className="text-left">
                <span className="font-serif font-bold text-base tracking-tight text-white block leading-none">Sanctificare</span>
                <span className="text-[10px] text-amber-400 font-sans tracking-wide">Liturgia Diária & Oração</span>
              </div>
            </a>
            
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline-flex items-center gap-1 text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full font-medium">
                <Sparkles className="w-3 h-3 text-amber-400" />
                100% Gratuito
              </span>
              <a
                href="/login?tab=cadastrar&path=/liturgia"
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl shadow-md transition-all transform hover:scale-105 flex items-center gap-1.5"
              >
                <span>Criar Conta Grátis</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </header>
      )}

      {isZenMode && (
        <div className="fixed top-4 left-4 z-50">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsZenMode(false)}
            className="bg-background/80 backdrop-blur-sm border-border shadow-md flex items-center gap-1.5 text-xs font-semibold"
          >
            <CornerUpLeft className="w-3.5 h-3.5" />
            Sair do Modo Focado
          </Button>
        </div>
      )}

      <div 
        className={`mx-auto px-4 py-6 space-y-6 transition-all duration-500 ${isZenMode ? "max-w-2xl" : "max-w-3xl"}`}
      >
        {/* Landing Hero Title (SEO H1 & Value Proposition) */}
        {!isZenMode && (
          <div className="text-center pt-2 pb-1 space-y-2 max-w-2xl mx-auto">
            <h1 className="font-serif text-2xl md:text-4xl font-extrabold text-foreground tracking-tight leading-tight">
              Liturgia Diária em Áudio e Texto
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground max-w-lg mx-auto">
              Acompanhe as leituras do dia, o Salmo Responsorial cantado e proclamado com narração em áudio de alta fidelidade.
            </p>
          </div>
        )}

        {/* Header / Date Selector */}
        <div className="text-center space-y-2 mb-8 select-none">
          <div className="flex items-center justify-center gap-2 mb-2">
            <LiturgyIcon className={`w-5 h-5 ${theme.primary}`} />
            <span className={`text-xs font-bold tracking-widest uppercase ${theme.accentText}`}>LITURGIA DIÁRIA</span>
          </div>

          <div className="flex items-center justify-center gap-2 md:gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrevDay}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              title="Dia anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>

            <h1 className="font-display text-xl md:text-3xl font-bold tracking-tight text-foreground min-w-[200px] md:min-w-[280px]">
              {formattedDate}
            </h1>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleNextDay}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              title="Próximo dia"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>

            {!isZenMode && (
              <div className="relative inline-block ml-1">
                <input
                  type="date"
                  ref={dateInputRef}
                  value={selectedDateIso}
                  onChange={(e) => {
                    if (e.target.value) {
                      setSelectedDate(new Date(e.target.value + "T12:00:00"));
                    }
                  }}
                  className="absolute opacity-0 pointer-events-none w-0 h-0"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    try {
                      if (dateInputRef.current) {
                        if (typeof dateInputRef.current.showPicker === "function") {
                          dateInputRef.current.showPicker();
                        } else {
                          dateInputRef.current.click();
                        }
                      }
                    } catch (err) {
                      console.warn("[Liturgy] showPicker failed fallback to click:", err);
                      dateInputRef.current?.click();
                    }
                  }}
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  title="Escolher data"
                >
                  <Calendar className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          {!isTodaySelected && !isZenMode && (
            <button
              onClick={handleToday}
              className="text-xs font-semibold text-muted-foreground hover:text-primary transition-colors underline block mx-auto mt-2"
            >
              Ir para Hoje
            </button>
          )}
        </div>

        {/* Error state */}
        {error && !liturgy && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
            <p className="font-semibold">Erro ao carregar a liturgia</p>
            <p className="text-xs mt-1">{error.message}</p>
          </div>
        )}

        {/* Loading state */}
        {isFetchingLiturgy && !liturgy && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        )}

        {/* Content */}
        {liturgy && (
          <>
            {isOffline && (
              <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-center">
                <span className="font-serif text-xs text-amber-700 dark:text-amber-300">
                  ⚡ Visualização Offline: Exibindo leituras salvas no cache do seu dispositivo.
                </span>
              </div>
            )}
            <audio ref={audioRef} src={playingUrl} preload="metadata" />

            <div className={`rounded-2xl border transition-all duration-500 p-6 ${
              activeTab === "audio" && playlist.length > 0
                ? "bg-[#0b1329] border-amber-500/20 text-slate-100 shadow-[0_12px_40px_rgba(11,19,41,0.2)]"
                : "bg-[#fcfbf7] border-[oklch(0.72_0.10_75/0.25)] text-[#2d251e] shadow-[0_12px_40px_rgba(232,223,199,0.15)]"
            }`}>
              {/* Seleção de Abas do Conceito B (se houver playlist) */}
              {playlist.length > 0 && (
                <div className="flex border-b border-white/10 dark:border-white/10 mb-6">
                  <button
                    onClick={() => setActiveTab("audio")}
                    className={`flex-1 py-3 text-center text-xs font-bold uppercase tracking-wider transition-all border-b-2 flex items-center justify-center gap-1.5 ${
                      activeTab === "audio"
                        ? "border-amber-500 text-amber-400 font-extrabold"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span>Áudio</span>
                    {isPlaying && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab("text")}
                    className={`flex-1 py-3 text-center text-xs font-bold uppercase tracking-wider transition-all border-b-2 flex items-center justify-center gap-1.5 ${
                      activeTab === "text"
                        ? "border-amber-500 text-amber-600 dark:text-amber-400 font-extrabold"
                        : activeTab === "audio"
                        ? "border-transparent text-slate-100 hover:text-white font-bold text-sm"
                        : "border-transparent text-foreground hover:text-amber-600 font-bold"
                    }`}
                  >
                    <span>Texto</span>
                  </button>
                </div>
              )}

              {activeTab === "audio" && playlist.length > 0 && playlist[currentTrackIndex] ? (
                /* ==========================================
                   ABA ÁUDIO: Visual Navy + Gold + Glassmorphism
                   ========================================== */
                <div className="space-y-6 animate-fade-in text-center">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-amber-500/80">
                      {liturgy.color ? `Cor Litúrgica: ${liturgy.color}` : "LITURGIA DIÁRIA"}
                    </span>
                    <h2 className="font-serif text-xl md:text-2xl font-bold text-white mt-1 leading-tight max-w-md mx-auto">
                      {liturgy.celebration || "Leituras do Dia"}
                    </h2>
                  </div>

                  {/* Visual de Capa e Frase Devocional */}
                  <div className="flex flex-col items-center justify-center my-6">
                    <div className="relative w-36 h-36 mb-6">
                      <div
                        className={`absolute -inset-1.5 rounded-3xl bg-gradient-to-tr from-amber-600 to-amber-300 blur-sm transition-opacity duration-1000 ${
                          isPlaying ? "opacity-90 animate-pulse" : "opacity-40"
                        }`}
                      />
                      {isPlaying && (
                        <div className="absolute inset-0 rounded-3xl bg-amber-500/25 blur-md animate-ping" style={{ animationDuration: '3s' }} />
                      )}
                      <img
                        src={getPrayerArt("liturgia").image}
                        alt="Liturgia Diária"
                        className={`relative w-36 h-36 rounded-3xl object-cover z-10 border border-white/10 shadow-2xl transition-transform duration-[6000ms] ${
                          isPlaying ? "scale-[1.03]" : "scale-100"
                        }`}
                      />
                    </div>

                    {/* Frase Devocional de Destaque */}
                    <p className="text-center text-amber-500/90 text-sm font-serif italic max-w-xs px-4 mt-2">
                      "{dailyContent.verse.text}"
                      <span className="block text-[10px] not-italic uppercase tracking-wider text-amber-500/60 mt-1 font-sans">
                        — {dailyContent.verse.reference}
                      </span>
                    </p>
                  </div>

                  {/* Controles de Áudio (Navy + Gold + Glassmorphism) */}
                  <div className="w-full max-w-sm mx-auto bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md shadow-lg flex flex-col gap-3">
                    {/* Progress bar */}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-300 w-8 text-right font-sans">
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
                      <span className="text-[10px] text-slate-300 w-8 font-sans">
                        -{formatTime(Math.max(duration - currentTime, 0))}
                      </span>
                    </div>

                    {/* Controls Buttons */}
                    <div className="flex items-center justify-between px-2">
                      <button
                        onClick={handleRestart}
                        className="text-slate-300 hover:text-white p-1.5 rounded-full hover:bg-white/5 transition-colors"
                        title="Reiniciar áudio"
                      >
                        <RotateCcw size={15} />
                      </button>

                      <button
                        onClick={handleShareLiturgy}
                        className="text-slate-300 hover:text-white p-1.5 rounded-full hover:bg-white/5 transition-colors"
                        title="Compartilhar áudio"
                      >
                        <Share2 size={15} />
                      </button>

                      <button
                        onClick={togglePlay}
                        className="w-11 h-11 rounded-full bg-[#bf9926] hover:bg-[#a37e1a] text-slate-950 flex items-center justify-center shadow-md transition-transform hover:scale-105"
                        title={isPlaying ? "Pausar" : "Reproduzir"}
                      >
                        {isPlaying ? (
                          <Pause size={16} fill="currentColor" />
                        ) : (
                          <Play size={16} fill="currentColor" className="ml-0.5" />
                        )}
                      </button>

                      <div className="flex items-center gap-1 group">
                        <button
                          onClick={() => setIsMuted(!isMuted)}
                          className="text-slate-300 hover:text-white p-1.5 rounded-full hover:bg-white/5 transition-colors"
                        >
                          {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
                        </button>
                      </div>
                    </div>
                  </div>


                </div>
              ) : (
                /* ==========================================
                   ABA TEXTO: Visual Book / Cream Paper
                   ========================================== */
                <div className="space-y-6 animate-fade-in text-[#2d251e]">
                  {playlist.length === 0 && audioUnavailable && !isZenMode && (
                    <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-900">
                      <p className="font-semibold">Áudio indisponível para esta data</p>
                      <p className="mt-1 text-xs opacity-80">
                        As leituras em texto seguem disponíveis abaixo para sua oração e acompanhamento da liturgia.
                      </p>
                    </div>
                  )}

                  <div className={fontFamily === "serif" ? "font-serif" : "font-sans"}>
                    <LiturgyReadings
                      liturgy={liturgy}
                      fontSize={fontSize}
                      isZenMode={isZenMode}
                      theme={theme}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Log button */}
            {!isZenMode && (
              <div className="pt-6 border-t border-border">
                {readingsAudio?.singedPsalm && (
                  <div className="w-full max-w-sm mx-auto mb-6 text-left animate-fade-in">
                    <p className="text-[11px] font-bold text-stone-500 dark:text-stone-400 pl-1 uppercase tracking-wide">
                      {liturgy.psalm?.referencia || "Salmo Responsorial"}
                    </p>
                    <div className="w-full mt-2 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/30 border-2 border-amber-400/60 dark:border-amber-500/50 rounded-2xl p-4 shadow-md flex flex-col gap-3 transition-all duration-300">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-xl bg-amber-500/25 border border-amber-500/50 text-amber-600 dark:text-amber-300 flex-shrink-0 flex items-center justify-center w-10 h-10">
                            <Music className="w-5 h-5" />
                          </div>
                          <div className="text-left">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">
                              Salmo Responsorial Cantado
                            </h4>
                            <p className="text-[10px] text-amber-600/70 dark:text-amber-400/70 mt-0.5">
                              Ouça a versão cantada deste salmo
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handleSharePsalm}
                            className="w-9 h-9 rounded-full border border-amber-400/50 flex items-center justify-center text-amber-600 dark:text-amber-400 bg-white dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-all cursor-pointer shadow-sm hover:scale-105 shrink-0"
                            title="Compartilhar salmo"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={togglePlayPsalm}
                            className="w-10 h-10 rounded-full bg-amber-500 hover:bg-amber-400 text-white flex items-center justify-center shadow-lg shadow-amber-500/40 transition-transform hover:scale-105 cursor-pointer shrink-0"
                            title={isPsalmPlaying ? "Pausar" : "Reproduzir"}
                          >
                            {isPsalmPlaying ? (
                              <Pause size={14} fill="currentColor" />
                            ) : (
                              <Play size={14} fill="currentColor" className="ml-0.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      <audio ref={psalmAudioRef} src={psalmPlayingUrl} preload="metadata" />

                      {/* Timeline/Progress Bar Row */}
                      <div className="flex items-center gap-3 bg-amber-100/60 dark:bg-amber-950/40 border border-amber-300/40 dark:border-amber-700/30 p-2 rounded-xl">
                        <span className="text-[10px] font-mono text-amber-700 dark:text-amber-400 w-8 shrink-0 text-center select-none">
                          {formatTime(psalmCurrentTime)}
                        </span>
                        <input
                          type="range"
                          min={0}
                          max={psalmDuration || 100}
                          step={0.1}
                          value={psalmCurrentTime}
                          onChange={(e) => handleSeekPsalm(Number(e.target.value))}
                          className="flex-1 h-1 bg-amber-200 dark:bg-amber-900 rounded-lg appearance-none cursor-pointer accent-amber-500"
                        />
                        <span className="text-[10px] font-mono text-amber-700 dark:text-amber-400 w-8 shrink-0 text-center select-none">
                          {formatTime(psalmDuration)}
                        </span>
                      </div>
                    </div>
                  </div>
              </div>
            )}

            {/* LANDING PAGE SECTIONS AROUND PLAYER (CRO & SEO) */}
            {!isZenMode && (
              <>
                {/* 1. Value Proposition Cards */}
                <div className="pt-8 pb-4 space-y-6">
                  <div className="text-center space-y-1">
                    <h3 className="font-serif text-xl font-bold text-foreground">
                      Por que cultivar sua vida de oração no Sanctificare?
                    </h3>
                    <p className="text-xs text-muted-foreground max-w-lg mx-auto">
                      Um ambiente sacro e sem distrações projetado para aproximar você do Evangelho todos os dias.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 flex items-start gap-3 shadow-sm hover:border-amber-500/40 transition-colors">
                      <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0">
                        <Headphones className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-foreground">Áudios Narrados & Salmo Cantado</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          Ouça a liturgia diária completa enquanto se desloca para o trabalho, no carro ou no seu momento devocional.
                        </p>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 flex items-start gap-3 shadow-sm hover:border-amber-500/40 transition-colors">
                      <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-foreground">Lectio Divina & Meditações</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          Reflexões profundas com o método secular da Igreja para meditar no Evangelho de hoje.
                        </p>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 flex items-start gap-3 shadow-sm hover:border-amber-500/40 transition-colors">
                      <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-foreground">Santo Rosário Guiado</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          Reze os mistérios do dia com áudios mediativos, dezenas passo a passo e intenções da comunidade.
                        </p>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 flex items-start gap-3 shadow-sm hover:border-amber-500/40 transition-colors">
                      <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-foreground">Quaresma de São Miguel & Orações</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          Catálogo completo de orações em áudio, novenas e guia prático de exame de consciência.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>



                {/* 3. Perguntas Frequentes (FAQ SEO & Conversion) */}
                <div className="pt-6 pb-4 space-y-4 border-t border-border">
                  <div className="text-center space-y-1">
                    <h3 className="font-serif text-xl font-bold text-foreground">
                      Perguntas Frequentes sobre a Liturgia Diária
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Tire suas dúvidas e saiba como rezar melhor com o Sanctificare.
                    </p>
                  </div>

                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="faq-1">
                      <AccordionTrigger className="text-xs md:text-sm font-semibold">
                        O que é a Liturgia Diária da Igreja Católica?
                      </AccordionTrigger>
                      <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
                        A Liturgia Diária é a sequência oficial de leituras bíblicas oferecidas pela Igreja Católica para cada dia do ano. Ela é composta pela 1ª Leitura, Salmo Responsorial (frequentemente cantado), 2ª Leitura (em domingos e solenidades) e a Proclamação do Santo Evangelho.
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="faq-2">
                      <AccordionTrigger className="text-xs md:text-sm font-semibold">
                        O acesso à Liturgia Diária no Sanctificare é gratuito?
                      </AccordionTrigger>
                      <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
                        Sim! Você pode ouvir o áudio narrado e ler o texto integral da Liturgia Diária todos os dias de forma totalmente gratuita, diretamente no navegador ou no aplicativo Sanctificare.
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="faq-3">
                      <AccordionTrigger className="text-xs md:text-sm font-semibold">
                        Quais os benefícios de criar uma conta no Sanctificare?
                      </AccordionTrigger>
                      <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
                        Ao criar sua conta gratuita, você desbloqueia o acompanhamento do seu plano diário de oração, histórico de leituras concluídas, acesso ao Santo Rosário meditativo em áudio, Quaresma de São Miguel, Lectio Divina e lembretes diários para não perder seu momento de reflexão.
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="faq-4">
                      <AccordionTrigger className="text-xs md:text-sm font-semibold">
                        Como funciona o aplicativo no celular?
                      </AccordionTrigger>
                      <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
                        O Sanctificare pode ser acessado em qualquer smartphone, tablet ou computador. Você também pode salvar o aplicativo na sua tela inicial para acesso rápido aos áudios e leituras.
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>

                {/* 4. Banner Final de Conversão */}
                <div className="my-8 p-6 md:p-8 rounded-3xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 text-slate-950 shadow-2xl relative overflow-hidden text-center space-y-4">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                  
                  <span className="inline-block bg-slate-950/20 text-slate-950 font-bold text-[10px] uppercase tracking-widest px-3 py-1 rounded-full">
                    ✦ Experimente sem compromisso
                  </span>

                  <h3 className="font-serif text-2xl md:text-3xl font-extrabold tracking-tight">
                    Fortaleça sua vida espiritual diariamente
                  </h3>

                  <p className="text-xs md:text-sm text-slate-900 max-w-md mx-auto font-medium">
                    Junte-se a milhares de católicos que transformaram sua rotina com a Liturgia em Áudio, Santo Rosário e Meditações Diárias.
                  </p>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                    <a
                      href="/login?tab=cadastrar&path=/liturgia"
                      className="w-full sm:w-auto bg-slate-950 hover:bg-slate-900 text-white font-bold text-sm px-6 py-3 rounded-2xl shadow-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2"
                    >
                      <span>Criar Minha Conta Grátis</span>
                      <ArrowRight className="w-4 h-4 text-amber-400" />
                    </a>
                    <a
                      href="/explore"
                      className="w-full sm:w-auto bg-white/20 hover:bg-white/30 text-slate-950 font-bold text-sm px-6 py-3 rounded-2xl transition-all flex items-center justify-center gap-2"
                    >
                      <span>Conhecer Recursos</span>
                    </a>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* STICKY MOBILE BOTTOM CTA BAR */}
      {!isZenMode && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 p-3 bg-[#070c19]/95 backdrop-blur-md border-t border-amber-500/20 shadow-2xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <img src={LOGO_IMG} alt="Sanctificare" className="w-7 h-7 rounded-lg" />
            <div>
              <p className="text-xs font-bold text-white leading-none">Sanctificare App</p>
              <p className="text-[10px] text-amber-400 mt-0.5 font-medium">Liturgia & Rosário em Áudio</p>
            </div>
          </div>
          <a
            href="/login?tab=cadastrar&path=/liturgia"
            className="bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-xs px-3.5 py-2 rounded-xl shadow-md whitespace-nowrap"
          >
            Criar Conta Grátis
          </a>
        </div>
      )}

      {/* Floating Toolbar */}
      {liturgy && activeTab === "text" && (
        <div className="fixed bottom-[calc(var(--mobile-bottom-nav-height)+var(--safe-area-bottom)+0.5rem)] right-6 lg:bottom-6 lg:right-6 z-50 flex items-center gap-2 bg-background/80 dark:bg-stone-900/80 backdrop-blur-md border border-border shadow-lg rounded-full px-3 py-1.5 transition-all">
          <span className="text-xs text-muted-foreground font-semibold px-2 border-r border-border">Leitura</span>

          <button
            onClick={() => {
              let nextSize: "sm" | "md" | "lg" | "xl" = fontSize;
              if (fontSize === "xl") nextSize = "lg";
              else if (fontSize === "lg") nextSize = "md";
              else if (fontSize === "md") nextSize = "sm";
              setFontSize(nextSize);
              localStorage.setItem("sanctificare_liturgy_font_size", nextSize);
            }}
            disabled={fontSize === "sm"}
            className="p-1.5 hover:bg-accent rounded-full text-muted-foreground disabled:opacity-30 transition-colors"
            title="Diminuir fonte"
          >
            <Minus className="w-4 h-4" />
          </button>

          <span className="text-xs font-bold uppercase w-6 text-center select-none text-foreground">
            {fontSize}
          </span>

          <button
            onClick={() => {
              let nextSize: "sm" | "md" | "lg" | "xl" = fontSize;
              if (fontSize === "sm") nextSize = "md";
              else if (fontSize === "md") nextSize = "lg";
              else if (fontSize === "lg") nextSize = "xl";
              setFontSize(nextSize);
              localStorage.setItem("sanctificare_liturgy_font_size", nextSize);
            }}
            disabled={fontSize === "xl"}
            className="p-1.5 hover:bg-accent rounded-full text-muted-foreground disabled:opacity-30 transition-colors"
            title="Aumentar fonte"
          >
            <Plus className="w-4 h-4" />
          </button>

          <div className="w-px h-4 bg-border mx-1" />

          <button
            onClick={toggleFontFamily}
            className={`p-1.5 rounded-full transition-colors ${
              fontFamily === "serif"
                ? "bg-accent text-accent-foreground"
                : "hover:bg-accent text-muted-foreground"
            }`}
            title="Alternar estilo de fonte (Serifada / Sem Serifas)"
          >
            <Type className="w-4 h-4" />
          </button>

          <div className="w-px h-4 bg-border mx-1" />

          <button
            onClick={() => setIsZenMode(!isZenMode)}
            className={`p-1.5 rounded-full transition-colors flex items-center gap-1 ${
              isZenMode
                ? "bg-primary text-primary-foreground"
                : "hover:bg-accent text-muted-foreground"
            }`}
            title={isZenMode ? "Desativar modo focado" : "Ativar modo focado"}
          >
            {isZenMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      )}

      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        title={shareData.title}
        description={shareData.description}
        url={typeof window !== "undefined" ? window.location.href : ""}
      />
    </div>
  );
}
