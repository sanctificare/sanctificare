import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import AppNav from "@/components/AppNav";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Flame,
  Pause,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  Users,
  Eye,
  EyeOff,
  Heart,
  Plus,
  Clock,
} from "lucide-react";

const LOGO_IMG = "/assets/sanctificare-logo-v2.webp";
const VIDEO_SRC = "/r2-storage/vela-virtual/vela-loop.mp4";
const BUNNY_LIBRARY_ID = import.meta.env.VITE_BUNNY_LIBRARY_ID || "";
const BUNNY_VIDEO_ID = "8889173b-bfcb-49fe-b062-39c2d4075018";
const BUNNY_THUMBNAIL = `https://vz-b07d3b4c-295.b-cdn.net/${BUNNY_VIDEO_ID}/thumbnail.jpg`;

type AudioTrack = {
  id: string;
  label: string;
  description: string;
  src: string | null;
};

type Ambience = {
  id: string;
  label: string;
  pageClass: string;
  overlayClass: string;
};

const AUDIO_TRACKS: AudioTrack[] = [
  {
    id: "silencio",
    label: "Silêncio total",
    description: "Sem trilha musical, apenas recolhimento.",
    src: null,
  },
  {
    id: "instrumental",
    label: "Instrumental leve",
    description: "Trilha suave para acompanhar a oração.",
    src: "/assets/vela-virtual/musica-ambiente.mp3",
  },
  {
    id: "gregoriano",
    label: "Canto gregoriano",
    description: "Opcional: adicione o arquivo para habilitar.",
    src: "/r2-storage/vela-virtual/musica-gregoriano.mp3",
  },
];

const AMBIENCES: Ambience[] = [
  {
    id: "capela",
    label: "Capela",
    pageClass: "bg-[oklch(0.09_0.03_260)]",
    overlayClass:
      "bg-gradient-to-t from-black/70 via-black/20 to-transparent",
  },
  {
    id: "noite",
    label: "Noite silenciosa",
    pageClass: "bg-[oklch(0.07_0.03_275)]",
    overlayClass:
      "bg-gradient-to-t from-[oklch(0.04_0.02_280/0.86)] via-[oklch(0.12_0.04_275/0.24)] to-transparent",
  },
  {
    id: "dourado",
    label: "Luz dourada",
    pageClass: "bg-[oklch(0.11_0.04_85)]",
    overlayClass:
      "bg-gradient-to-t from-[oklch(0.08_0.02_85/0.84)] via-[oklch(0.75_0.10_82/0.16)] to-transparent",
  },
];

const RECOLLECTION_PHRASES = [
  "Aquietai o coração e reconhecei a presença de Deus.",
  "Respire devagar e entregue ao Senhor tudo o que pesa hoje.",
  "Permanecei em mim, e eu permanecerei em vós.",
  "Nesta chama, ofereça sua gratidão e sua confiança.",
  "No silêncio, Deus trabalha o que as palavras não alcançam.",
];

export default function VelaVirtual() {
  const { isAuthenticated, loading } = useAuth();
  const [newIntention, setNewIntention] = useState("");
  const [candleType, setCandleType] = useState<"intencao" | "defuntos" | "agradecimento" | "adoracao">("intencao");
  
  // Controle da vela local/sessão atual
  const [isCandleLit, setIsCandleLit] = useState(false);
  const [privateCandleIntention, setPrivateCandleIntention] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.55);
  const [videoFailed, setVideoFailed] = useState(false);
  const [audioFailed, setAudioFailed] = useState(false);
  const [cleanMode, setCleanMode] = useState(false);
  const [selectedTrackId, setSelectedTrackId] = useState("instrumental");
  const [silentGuidedMode, setSilentGuidedMode] = useState(false);
  const [selectedAmbienceId, setSelectedAmbienceId] = useState("capela");
  const [showPhrase, setShowPhrase] = useState(true);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [unavailableTrackIds, setUnavailableTrackIds] = useState<string[]>([]);

  const selectedTrack = useMemo(
    () => AUDIO_TRACKS.find((track) => track.id === selectedTrackId) ?? AUDIO_TRACKS[0],
    [selectedTrackId]
  );

  const selectedAmbience = useMemo(
    () => AMBIENCES.find((ambience) => ambience.id === selectedAmbienceId) ?? AMBIENCES[0],
    [selectedAmbienceId]
  );

  const currentPhrase = RECOLLECTION_PHRASES[phraseIndex % RECOLLECTION_PHRASES.length];

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!selectedTrack?.src) {
      audio.pause();
      setAudioFailed(false);
      return;
    }

    audio.src = selectedTrack.src;
    setAudioFailed(false);

    if (isPlaying && !silentGuidedMode) {
      audio
        .play()
        .then(() => {
          setAudioFailed(false);
        })
        .catch(() => {
          setAudioFailed(true);
        });
    }
  }, [selectedTrack, isPlaying, silentGuidedMode]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
  }, []);

  const startPrayerSpace = async () => {
    setIsPlaying(true);

    const video = videoRef.current;
    const audio = audioRef.current;

    if (video) {
      try {
        video.currentTime = 0;
        await video.play();
      } catch (videoErr) {
        console.warn("[VelaVirtual] Video playback failed:", videoErr);
      }
    }

    if (audio && selectedTrack?.src && !silentGuidedMode) {
      try {
        audio.src = selectedTrack.src;
        audio.currentTime = 0;
        await audio.play();
      } catch (audioErr) {
        console.warn("[VelaVirtual] Audio playback failed/blocked by browser:", audioErr);
      }
    }
  };

  const pausePrayerSpace = () => {
    videoRef.current?.pause();
    audioRef.current?.pause();
    setIsPlaying(false);
  };

  const resetPrayerSpace = () => {
    pausePrayerSpace();
    if (videoRef.current) videoRef.current.currentTime = 0;
    if (audioRef.current) audioRef.current.currentTime = 0;
  };

  const toggleSilentGuidedMode = () => {
    if (!silentGuidedMode) {
      setSilentGuidedMode(true);
      setSelectedTrackId("silencio");
      return;
    }

    setSilentGuidedMode(false);
    if (selectedTrackId === "silencio") {
      setSelectedTrackId("instrumental");
    }
  };

  const nextPhrase = () => {
    setPhraseIndex((current) => (current + 1) % RECOLLECTION_PHRASES.length);
  };

  const handleAudioError = () => {
    setAudioFailed(true);
    if (selectedTrack?.id) {
      setUnavailableTrackIds((current) =>
        current.includes(selectedTrack.id) ? current : [...current, selectedTrack.id]
      );
    }
  };

  const toggleMute = () => {
    setIsMuted((current) => !current);
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
        <div className="text-center max-w-sm px-6">
          <img src={LOGO_IMG} alt="Sanctificare" className="w-16 h-16 rounded-full mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold mb-2">Acesso Restrito</h2>
          <p className="text-muted-foreground mb-6">Entre para rezar no espaço da Vela Virtual.</p>
          <a href={getLoginUrl()}>
            <Button className="bg-[oklch(0.22_0.07_260)] text-white">Entrar</Button>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen text-white transition-colors duration-700 ${selectedAmbience.pageClass}`}
    >
      {!cleanMode && <AppNav />}

      <main className={`transition-all duration-500 ${cleanMode ? "w-full max-w-none p-0" : "container py-8"}`}>
        {!cleanMode && (
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 animate-fade-in border-b border-white/10 pb-4">
            <div>
              <div className="flex items-center gap-2 mb-2 text-[oklch(0.82_0.10_80)]">
                <Flame size={20} />
                <span className="text-sm font-medium tracking-wide uppercase">Espaço de Oração</span>
              </div>
              <h1 className="font-display text-3xl font-bold mb-2">Vela Virtual</h1>
              <p className="font-serif text-[oklch(0.82_0.02_260)] max-w-2xl">
                Uma chama acesa, silêncio interior e um espaço de recolhimento para permanecer diante de Deus.
              </p>
            </div>
          </div>
        )}
          <div
            className={`transition-all duration-500 ${
              cleanMode ? "w-full" : "grid gap-6 items-stretch grid-cols-1 lg:grid-cols-[1.1fr_0.9fr]"
            }`}
          >
            <Card className={`transition-all duration-500 ${cleanMode ? "border-none rounded-none bg-black shadow-none w-full" : "overflow-hidden border border-white/10 bg-[oklch(0.14_0.03_260)] shadow-2xl shadow-black/30"}`}>
              <CardContent className="p-0">
                <div className={`relative bg-black transition-all duration-700 overflow-hidden w-full ${cleanMode ? "h-[100dvh] sm:h-[92vh]" : "min-h-[350px] sm:min-h-[480px] lg:min-h-[540px]"}`}>
                  {BUNNY_LIBRARY_ID ? (
                    isPlaying ? (
                      <iframe
                        src={`https://iframe.mediadelivery.net/embed/${BUNNY_LIBRARY_ID}/${BUNNY_VIDEO_ID}?autoplay=true&loop=true&muted=true&controls=false&preload=true`}
                        loading="lazy"
                        className="absolute inset-0 w-full h-full border-none pointer-events-none scale-105"
                        allow="autoplay; encrypted-media"
                      />
                    ) : (
                      <img
                        src={BUNNY_THUMBNAIL}
                        alt="Vela Virtual"
                        className="absolute inset-0 w-full h-full object-cover opacity-80"
                      />
                    )
                  ) : !videoFailed ? (
                    <video
                      ref={videoRef}
                      className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${isPlaying ? "opacity-100" : "opacity-90"}`}
                      src={VIDEO_SRC}
                      autoPlay
                      loop
                      muted
                      playsInline
                      onError={() => setVideoFailed(true)}
                    />
                  ) : (
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_oklch(0.75_0.12_75/0.14),_transparent_45%),linear-gradient(180deg,_oklch(0.22_0.07_260),_oklch(0.08_0.03_260))] flex items-center justify-center">
                      <div className="relative flex flex-col items-center gap-4">
                        <div className="absolute -top-6 h-36 w-36 rounded-full bg-[oklch(0.82_0.10_80/0.18)] blur-3xl animate-pulse" />
                        <div className="relative h-40 w-40 rounded-full bg-[radial-gradient(circle_at_50%_38%,_#ffd98a_0,_#ffb84d_28%,_#7d340c_50%,_transparent_66%)] animate-[pulse_2.8s_ease-in-out_infinite]" />
                        <div className="absolute bottom-[28%] h-32 w-20 rounded-[40%_40%_28%_28%] bg-[linear-gradient(180deg,_#0d0b10,_#2f1e18_70%,_#4f3928)] shadow-[0_0_40px_rgba(0,0,0,0.45)]" />
                        <div className="absolute bottom-[30%] h-28 w-12 rounded-full bg-[radial-gradient(circle_at_50%_20%,_#ffe6aa,_#ff9f1a_40%,_#b84b0f_72%,_transparent_100%)] blur-[1px] animate-[flicker_1.8s_ease-in-out_infinite]" />
                        <p className="relative mt-36 text-sm text-[oklch(0.82_0.02_260)]">Vídeo da vela não encontrado. O espaço continua disponível.</p>
                      </div>
                    </div>
                  )}

                  <div
                    className={`absolute inset-0 transition-all duration-700 ${selectedAmbience.overlayClass}`}
                  />
                  <div className="absolute inset-0 flex flex-col justify-between p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
                      <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.18em] text-[oklch(0.82_0.10_80)] w-fit">
                        <Sparkles size={12} />
                        Oração silenciosa
                      </span>
                      {cleanMode ? (
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-white/20 bg-black/35 text-white hover:bg-black/60 text-xs px-2.5 sm:px-3 h-8 sm:h-9"
                            onClick={() => {
                              if (isPlaying) pausePrayerSpace();
                              else startPrayerSpace();
                            }}
                          >
                            {isPlaying ? <Pause size={14} className="mr-1.5 sm:mr-2" /> : <Play size={14} className="mr-1.5 sm:mr-2" />}
                            {isPlaying ? "Pausar" : "Iniciar"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-white/20 bg-black/35 text-white hover:bg-black/60 text-xs px-2.5 sm:px-3 h-8 sm:h-9"
                            onClick={toggleMute}
                          >
                            {isMuted ? <VolumeX size={14} className="mr-1.5 sm:mr-2" /> : <Volume2 size={14} className="mr-1.5 sm:mr-2" />}
                            {isMuted ? "Mudo" : "Som"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-white/20 bg-black/35 text-white hover:bg-black/60 text-xs px-2.5 sm:px-3 h-8 sm:h-9"
                            onClick={() => setCleanMode(false)}
                          >
                            Sair
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-white/70">
                          {isPlaying ? "Em oração" : "Pronto para começar"}
                        </span>
                      )}
                    </div>

                    {isCandleLit ? (
                      privateCandleIntention.trim() ? (
                        <div className="max-w-lg ml-auto text-right">
                          <div className="space-y-2 sm:space-y-3 animate-fade-in inline-block text-left max-w-full">
                            <span className="text-[11px] uppercase tracking-[0.14em] text-[oklch(0.82_0.10_80)] font-semibold block text-right">Minha Intenção</span>
                            <blockquote className="font-serif text-sm sm:text-lg lg:text-xl italic text-white/95 leading-relaxed bg-black/30 p-4 sm:p-5 rounded-2xl border border-white/10 backdrop-blur-sm shadow-xl text-left">
                              "{privateCandleIntention}"
                            </blockquote>
                            <p className="text-[10px] sm:text-xs text-white/60 font-serif text-right">Aquietai o coração e repousai nos braços do Senhor...</p>
                          </div>
                        </div>
                      ) : null
                    ) : (
                      <div className="max-w-lg">
                        <h2 className="font-display text-xl sm:text-3xl font-bold text-white mb-2 sm:mb-3">Acenda sua intenção interior</h2>
                        <p className="font-serif text-white/80 text-xs sm:text-sm leading-relaxed">
                          Feche os olhos, respire com calma e ofereça ao Senhor a sua prece. Esta vela virtual foi pensada para favorecer o recolhimento, o silêncio e a oração perseverante.
                        </p>
                      </div>
                    )}

                    {cleanMode && showPhrase && (
                      <div className="rounded-xl border border-white/15 bg-black/45 p-4 max-w-2xl backdrop-blur-sm transition-all duration-500">
                        <p className="font-serif text-xs sm:text-sm lg:text-base text-white/90 leading-relaxed">{currentPhrase}</p>
                        <div className="mt-3 flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-white/20 bg-transparent text-white hover:bg-white/10 text-xs h-8"
                            onClick={nextPhrase}
                          >
                            Próxima frase
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-white/20 bg-transparent text-white hover:bg-white/10 text-xs h-8"
                            onClick={() => setShowPhrase(false)}
                          >
                            Ocultar frase
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {!cleanMode && (
              <div className="space-y-6">
                {!isCandleLit ? (
                  <Card className="border border-white/10 bg-[oklch(0.13_0.03_260)] shadow-xl shadow-black/20">
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-center gap-2 text-[oklch(0.82_0.10_80)] mb-1">
                        <Plus size={16} />
                        <h2 className="font-display font-semibold text-sm uppercase tracking-wider">Acender uma nova vela</h2>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs text-white/70 block mb-1">Sua Intenção de Oração</label>
                          <textarea
                            value={newIntention}
                            onChange={(e) => setNewIntention(e.target.value)}
                            rows={3}
                            placeholder="Escreva aqui aquilo que deseja colocar nas mãos de Deus..."
                            className="w-full rounded-xl border border-white/10 bg-black/20 p-3 text-sm font-serif text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-[oklch(0.82_0.10_80)]"
                            maxLength={400}
                          />
                        </div>

                        <div>
                          <label className="text-xs text-white/70 block mb-1">Tipo de Devoção</label>
                          <select
                            value={candleType}
                            onChange={(e: any) => setCandleType(e.target.value)}
                            className="w-full rounded-xl border border-white/10 bg-[oklch(0.14_0.03_260)] p-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[oklch(0.82_0.10_80)]"
                          >
                            <option value="intencao">Intenção Geral</option>
                            <option value="adoracao">Adoração ao Santíssimo</option>
                            <option value="defuntos">Pelos Fiéis Defuntos</option>
                            <option value="agradecimento">Ação de Graças</option>
                          </select>
                        </div>

                      </div>

                      <Button
                        type="button"
                        onClick={async () => {
                          const trimmedIntention = newIntention.trim();

                          setPrivateCandleIntention(trimmedIntention);
                          setIsCandleLit(true);
                          setNewIntention("");
                          
                          // Iniciar o ambiente e modo limpo
                          await startPrayerSpace();
                          setCleanMode(true);
                        }}
                        className="w-full bg-[oklch(0.82_0.10_80)] hover:bg-[oklch(0.77_0.10_80)] text-[oklch(0.15_0.02_260)] font-semibold"
                      >
                        <Flame size={16} className="mr-2" />
                        Acender Vela e Rezar
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="border border-white/10 bg-[oklch(0.13_0.03_260)] shadow-xl shadow-black/20">
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-green-400">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                          </span>
                          <span className="text-xs font-semibold uppercase tracking-wider">Sua vela está acesa</span>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            pausePrayerSpace();
                            setIsCandleLit(false);
                            setPrivateCandleIntention("");
                            setCleanMode(false);
                          }}
                          className="border-red-500/35 hover:bg-red-950/20 text-red-400 text-xs px-2 h-7"
                        >
                          Apagar Vela
                        </Button>
                      </div>

                      {privateCandleIntention.trim() && (
                        <blockquote className="font-serif italic text-sm text-white/70 p-3 bg-black/20 rounded-xl border border-white/5">
                          "{privateCandleIntention}"
                        </blockquote>
                      )}

                      <div className="divider-gold opacity-30 my-2" />

                      <div className="space-y-3">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-white/50">Controles do Ambiente</p>
                        <div className="flex flex-wrap gap-2">
                          {!isPlaying ? (
                            <Button size="sm" className="bg-white/10 hover:bg-white/20 text-white" onClick={startPrayerSpace}>
                              <Play size={13} className="mr-1.5" /> Continuar
                            </Button>
                          ) : (
                            <Button size="sm" variant="outline" className="border-white/15 bg-white/5 text-white hover:bg-white/10" onClick={pausePrayerSpace}>
                              <Pause size={13} className="mr-1.5" /> Pausar
                            </Button>
                          )}
                          <Button size="sm" variant="outline" className="border-white/15 bg-white/5 text-white hover:bg-white/10" onClick={resetPrayerSpace}>
                            <RotateCcw size={13} className="mr-1.5" /> Reiniciar
                          </Button>
                          <Button size="sm" variant="outline" className="border-white/15 bg-white/5 text-white hover:bg-white/10" onClick={toggleMute}>
                            {isMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
                          </Button>
                          <Button
                            size="sm"
                            className="bg-[oklch(0.82_0.10_80)] text-[oklch(0.15_0.02_260)] hover:bg-[oklch(0.77_0.10_80)] font-semibold"
                            onClick={() => setCleanMode(true)}
                          >
                            Modo Limpo
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Card className="border border-white/10 bg-[oklch(0.13_0.03_260)] shadow-xl shadow-black/20">
                  <CardContent className="p-6 space-y-5">
                    <div>
                      <div className="flex items-center justify-between mb-2 text-sm text-white/75">
                        <span>Volume da Música</span>
                        <span>{isMuted ? "0%" : `${Math.round(volume * 100)}%`}</span>
                      </div>
                      <Slider
                        value={[isMuted ? 0 : volume]}
                        max={1}
                        step={0.05}
                        onValueChange={(value) => {
                          setVolume(value[0]);
                          if (value[0] > 0) setIsMuted(false);
                        }}
                      />
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs font-semibold uppercase tracking-widest text-[oklch(0.82_0.10_80)] mb-3">Fundo Musical</p>
                      <div className="space-y-1.5">
                        {AUDIO_TRACKS.map((track) => {
                          const isUnavailable = unavailableTrackIds.includes(track.id);
                          return (
                            <button
                              key={track.id}
                              type="button"
                              onClick={() => {
                                setAudioFailed(false);
                                setSelectedTrackId(track.id);
                                if (track.id !== "silencio") {
                                  setSilentGuidedMode(false);
                                }
                              }}
                              disabled={isUnavailable}
                              className={`w-full rounded-xl border px-3 py-2 text-left transition-all duration-300 ${
                                selectedTrackId === track.id
                                  ? "border-[oklch(0.82_0.10_80/0.8)] bg-[oklch(0.82_0.10_80/0.14)] text-white"
                                  : "border-white/10 bg-white/5 text-white/85 hover:bg-white/10"
                              } ${isUnavailable ? "opacity-45 cursor-not-allowed" : ""}`}
                            >
                              <p className="text-xs font-semibold">{track.label}</p>
                              <p className="text-[10px] text-white/60">{isUnavailable ? "Arquivo indisponível" : track.description}</p>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs font-semibold uppercase tracking-widest text-[oklch(0.82_0.10_80)] mb-2">Opções de Silêncio</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full border-white/15 bg-white/5 text-white hover:bg-white/10 text-xs"
                        onClick={toggleSilentGuidedMode}
                      >
                        {silentGuidedMode ? "Desativar silêncio guiado" : "Ativar silêncio guiado"}
                      </Button>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs font-semibold uppercase tracking-widest text-[oklch(0.82_0.10_80)] mb-3">Estilo Visual</p>
                      <div className="grid grid-cols-3 gap-2">
                        {AMBIENCES.map((ambience) => (
                          <button
                            key={ambience.id}
                            type="button"
                            onClick={() => setSelectedAmbienceId(ambience.id)}
                            className={`rounded-xl border py-1.5 text-xs font-medium transition-all duration-300 ${
                              selectedAmbienceId === ambience.id
                                ? "border-[oklch(0.82_0.10_80/0.8)] bg-[oklch(0.82_0.10_80/0.14)]"
                                : "border-white/10 bg-white/5 hover:bg-white/10"
                            }`}
                          >
                            {ambience.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-white/10 bg-[oklch(0.13_0.03_260)] shadow-xl shadow-black/20">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-semibold uppercase tracking-widest text-[oklch(0.82_0.10_80)]">Textos de recolhimento</p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-white/15 bg-white/5 text-white hover:bg-white/10 text-xs h-7 px-2"
                        onClick={() => setShowPhrase((current) => !current)}
                      >
                        {showPhrase ? "Ocultar" : "Mostrar"}
                      </Button>
                    </div>

                    {showPhrase && (
                      <div className="rounded-xl border border-white/10 bg-black/30 p-4 mb-4 transition-all duration-500">
                        <p className="font-serif text-sm text-white/90 leading-relaxed">{currentPhrase}</p>
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-3 border-white/15 bg-white/5 text-white hover:bg-white/10 text-xs"
                          onClick={nextPhrase}
                        >
                          Próxima frase
                        </Button>
                      </div>
                    )}

                    <p className="text-xs font-semibold uppercase tracking-widest text-[oklch(0.82_0.10_80)] mb-3">Sugestão de oração</p>
                    <div className="space-y-3 font-serif text-xs text-white/80 leading-relaxed">
                      <p>Senhor, neste instante eu coloco diante de Vós minhas intenções, minhas dores e minhas esperanças.</p>
                      <p>Recebei minha família, meu trabalho, meus medos e minhas alegrias. Que esta chama seja sinal da minha confiança na vossa presença.</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </main>

      <audio ref={audioRef} loop onError={handleAudioError} />
      {audioFailed && (
        <div className="fixed bottom-4 right-4 rounded-xl border border-white/10 bg-black/70 px-4 py-3 text-sm text-white/80 shadow-xl">
          Trilha selecionada indisponível. Escolha outra opção de som.
        </div>
      )}
    </div>
  );
}
