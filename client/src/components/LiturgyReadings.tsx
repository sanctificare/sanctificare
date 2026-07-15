import { ChevronDown, ChevronUp, BookOpen, Share2 } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "../../../server/routers";
import type { LiturgicalTheme } from "../pages/Liturgy";
import { Button } from "@/components/ui/button";
import { getLiturgyReadingsAudioByDate } from "../data/liturgy-audio";
import ShareModal from "@/components/ShareModal";
import { isMobileApp } from "@/const";
import { shareText } from "@/lib/share";




type RouterOutput = inferRouterOutputs<AppRouter>;
type DailyLiturgyData = RouterOutput["liturgy"]["getByDate"];

interface LiturgyReadingsProps {
  liturgy: DailyLiturgyData;
  fontSize: "sm" | "md" | "lg" | "xl";
  isZenMode: boolean;
  theme: LiturgicalTheme;
}

const fontSizeClasses = {
  sm: "text-xs md:text-xs",
  md: "text-sm md:text-sm",
  lg: "text-base md:text-base",
  xl: "text-lg md:text-lg",
};

function renderTextWithDropCap(
  text: string,
  fontSizeClass: string,
  theme: LiturgicalTheme,
  enableDropCap: boolean
) {
  if (!text) return null;
  const trimmed = text.trim();

  // Divide o texto por números de versículo: ex: "6", "12", "35a", etc.
  // Apenas letras minúsculas de [a-g] seguidas por uma letra maiúscula são tratadas como sufixo do versículo.
  // Inclui aspas curvas (“ ” ‘ ’) no lookahead de aspas.
  const parts = trimmed.split(/(\b\d+(?:[a-g](?=["'""«“”‘’]?[A-ZÀ-Ö]))?(?=["'""«“”‘’]?[A-ZÀ-Öa-zØ-öø-ÿ]))/g);

  // Se não houver números de versículo, renderiza os parágrafos normais
  if (parts.length === 1) {
    const paragraphs = trimmed.split(/\n+/);
    return (
      <div className="space-y-4">
        {paragraphs.map((pText, idx) => {
          const pTrimmed = pText.trim();
          if (!pTrimmed) return null;

          if (enableDropCap && idx === 0) {
            const firstLetter = pTrimmed.charAt(0);
            const rest = pTrimmed.slice(1);
            const isAlpha = /^[a-zA-ZÀ-ÖØ-öø-ÿ]/.test(firstLetter);

            if (isAlpha) {
              return (
                <p key={idx} className={`leading-relaxed whitespace-pre-wrap font-sans ${fontSizeClass} text-foreground/90`}>
                  <span className={`float-left text-5xl md:text-6xl font-bold font-display mr-2.5 mt-1 leading-[0.85] select-none ${theme.primary}`}>
                    {firstLetter}
                  </span>
                  {rest}
                </p>
              );
            }
          }

          return (
            <p key={idx} className={`leading-relaxed whitespace-pre-wrap font-sans ${fontSizeClass} text-foreground/90`}>
              {pTrimmed}
            </p>
          );
        })}
      </div>
    );
  }

  // Se houver versículos, constrói os blocos
  const blocks: React.ReactNode[] = [];
  const introText = parts[0]?.trim();
  let firstLetterRendered = false;

  if (introText) {
    if (enableDropCap) {
      const firstLetter = introText.charAt(0);
      const rest = introText.slice(1);
      const isAlpha = /^[a-zA-ZÀ-ÖØ-öø-ÿ]/.test(firstLetter);

      if (isAlpha) {
        blocks.push(
          <p key="intro" className={`leading-relaxed whitespace-pre-wrap font-sans ${fontSizeClass} text-foreground/90 mb-4`}>
            <span className={`float-left text-5xl md:text-6xl font-bold font-display mr-2.5 mt-1 leading-[0.85] select-none ${theme.primary}`}>
              {firstLetter}
            </span>
            {rest}
          </p>
        );
        firstLetterRendered = true;
      } else {
        blocks.push(
          <p key="intro" className={`leading-relaxed whitespace-pre-wrap font-sans ${fontSizeClass} text-foreground/90 mb-4`}>
            {introText}
          </p>
        );
      }
    } else {
      blocks.push(
        <p key="intro" className={`leading-relaxed whitespace-pre-wrap font-sans ${fontSizeClass} text-foreground/90 mb-4`}>
          {introText}
        </p>
      );
    }
  }

  for (let i = 1; i < parts.length; i += 2) {
    const verseNum = parts[i];
    const verseText = parts[i + 1]?.trim() || "";

    const shouldApplyDropCapHere = enableDropCap && !firstLetterRendered && i === 1;
    let contentNode: React.ReactNode;

    if (shouldApplyDropCapHere) {
      const firstLetter = verseText.charAt(0);
      const rest = verseText.slice(1);
      const isAlpha = /^[a-zA-ZÀ-ÖØ-öø-ÿ]/.test(firstLetter);

      if (isAlpha) {
        contentNode = (
          <>
            <span className={`float-left text-5xl md:text-6xl font-bold font-display mr-2.5 mt-1 leading-[0.85] select-none ${theme.primary}`}>
              {firstLetter}
            </span>
            {rest}
          </>
        );
        firstLetterRendered = true;
      } else {
        contentNode = verseText;
      }
    } else {
      contentNode = verseText;
    }

    blocks.push(
      <div key={`verse-${verseNum}-${i}`} className="flex items-start gap-3 my-2 group">
        <span className={`text-[0.75em] font-sans font-bold select-none min-w-[1.75rem] text-right pt-[0.25em] leading-none transition-colors duration-200 ${theme.primary} opacity-85 group-hover:opacity-100`}>
          {verseNum}
        </span>
        <p className={`flex-1 leading-relaxed whitespace-pre-wrap font-sans ${fontSizeClass} text-foreground/90`}>
          {contentNode}
        </p>
      </div>
    );
  }

  return <div className="space-y-2">{blocks}</div>;
}

function SingedPsalmPlayer({ audioUrl }: { audioUrl: string }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isShareOpen, setIsShareOpen] = useState(false);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  };

  const handleShare = async () => {
    const isMobile =
      isMobileApp() ||
      (typeof navigator !== "undefined" &&
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    if (isMobile) {
      if (typeof window === "undefined") return;
      const pageUrl = window.location.href;
      await shareText({
        title: "Salmo Cantado",
        text: `Ouça o Salmo Cantado da Liturgia de hoje no Sanctificare: ${pageUrl}`,
      });
    } else {
      setIsShareOpen(true);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration);
    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);

    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);

    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
    };
  }, [audioUrl]);

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const val = parseFloat(e.target.value);
    audioRef.current.currentTime = val;
    setCurrentTime(val);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-amber-600/5 to-transparent p-4 my-3 shadow-sm">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
      <div className="flex items-center justify-between gap-4 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
              />
            </svg>
          </div>
          <div className="text-left">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">
              Salmo Cantado
            </h4>
            <p className="text-[10px] text-muted-foreground">
              Ouça a versão cantada deste salmo
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleShare}
            className="h-9 w-9 rounded-full border border-amber-500/20 text-amber-600 hover:bg-amber-500/10 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 shrink-0 transition-all duration-300 flex items-center justify-center"
            aria-label="Compartilhar salmo cantado"
          >
            <Share2 className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={togglePlay}
            className="h-9 w-9 rounded-full bg-amber-500 text-white hover:bg-amber-600 hover:text-white shrink-0 shadow-md transition-all duration-300 hover:scale-105 flex items-center justify-center"
          >
            {isPlaying ? (
              <svg
                className="w-4 h-4 fill-current"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 9v6m4-6v6" />
              </svg>
            ) : (
              <svg
                className="w-4 h-4 fill-current ml-0.5"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              </svg>
            )}
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 min-w-0 bg-black/5 dark:bg-white/5 p-2 rounded-lg">
        <span className="text-[10px] font-mono text-muted-foreground/80 tabular-nums shrink-0">
          {formatTime(currentTime)}
        </span>
        <input
          type="range"
          min={0}
          max={duration || 100}
          value={currentTime}
          onChange={handleSeek}
          className="flex-1 h-1 bg-stone-200 dark:bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
        />
        <span className="text-[10px] font-mono text-muted-foreground/80 tabular-nums shrink-0">
          {formatTime(duration)}
        </span>
      </div>

      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        title="Salmo Cantado"
        description="Ouça o Salmo Cantado da Liturgia de hoje."
        url={typeof window !== "undefined" ? window.location.href : ""}
      />
    </div>
  );
}

export default function LiturgyReadings({ liturgy, fontSize, isZenMode, theme }: LiturgyReadingsProps) {
  const [expandedSection, setExpandedSection] = useState<string>("gospel");

  if (!liturgy) {
    return (
      <div className="text-center text-muted-foreground py-12">
        <p>Nenhuma liturgia disponível para esta data.</p>
      </div>
    );
  }

  const audios = getLiturgyReadingsAudioByDate(liturgy.liturgyDate);

  const sections = [
    {
      id: "celebration",
      label: "Celebração",
      content: liturgy.celebration || "—",
      color: liturgy.color,
    },
    {
      id: "firstReading",
      label: "1ª Leitura",
      reading: liturgy.firstReading,
    },
    {
      id: "psalm",
      label: "Salmo Responsorial",
      reading: liturgy.psalm,
      isPsalm: true,
      audioUrl: audios.singedPsalm,
    },
    {
      id: "secondReading",
      label: "2ª Leitura",
      reading: liturgy.secondReading,
    },
    {
      id: "gospel",
      label: "Evangelho",
      reading: liturgy.gospel,
    },
  ];

  const toggleSection = (id: string) => {
    setExpandedSection(expandedSection === id ? "" : id);
  };

  return (
    <div className="space-y-4">
      {sections.map((section) => {
        const isExpanded = expandedSection === section.id;
        const reading = "reading" in section ? section.reading : null;

        if (reading === null && section.id !== "celebration") {
          return null;
        }

        return (
          <div
            key={section.id}
            className={`border rounded-xl overflow-hidden transition-all duration-300 ${
              isZenMode
                ? `${theme.border} bg-white dark:bg-stone-900/40 shadow-sm`
                : `border-border bg-white dark:bg-card hover:shadow-md ${theme.glow}`
            }`}
          >
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full px-5 py-4 flex items-center justify-between hover:bg-accent/40 transition-colors"
            >
              <div className="flex items-center gap-3">
                {section.color && section.id === "celebration" && (
                  <div
                    className="w-3.5 h-3.5 rounded-full shadow-inner border border-black/10"
                    style={{
                      backgroundColor: getColorHex(section.color),
                    }}
                    title={`Cor: ${section.color}`}
                  />
                )}
                <span className={`font-semibold text-sm tracking-wide ${isExpanded ? theme.accentText : "text-foreground"}`}>
                  {section.label}
                </span>
                {section.id === "celebration" && section.color && (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${theme.badge}`}>
                    {section.color}
                  </span>
                )}
              </div>
              {isExpanded ? (
                <ChevronUp className={`w-4 h-4 ${theme.primary}`} />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              )}
            </button>

            {isExpanded && (
              <div className={`px-5 py-4 border-t border-border transition-colors bg-white dark:bg-stone-950/20`}>
                {section.id === "celebration" ? (
                  <p className={`font-sans leading-relaxed ${fontSizeClasses[fontSize]} text-foreground`}>
                    {section.content}
                  </p>
                ) : reading ? (
                  <div className="space-y-3">
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                      {reading.referencia}
                      {reading.titulo && ` — ${reading.titulo}`}
                    </p>


                    
                    {renderTextWithDropCap(
                      reading.texto,
                      fontSizeClasses[fontSize],
                      theme,
                      section.id !== "psalm"
                    )}

                    {reading.refrao && section.isPsalm && (
                      <div className={`mt-4 p-3 rounded-lg border-l-4 italic ${isZenMode ? `${theme.border} bg-white dark:bg-stone-900/50` : "bg-accent/20 border-accent"} text-sm leading-relaxed text-foreground/80`}>
                        <strong>Refrão:</strong> {reading.refrao}
                      </div>
                    )}

                    {section.id === "gospel" && (
                      <div className="mt-4 pt-3 border-t border-border/20 flex items-center justify-between">
                        <a href={`/lectio?date=${liturgy.liturgyDate || ""}`}>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className={`text-xs flex items-center gap-1.5 border-border hover:bg-accent/85 transition-all font-semibold ${theme.accentText}`}
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                            Meditar com Lectio Divina
                          </Button>
                        </a>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground italic">
                    Não há {section.label.toLowerCase()} hoje.
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}

    </div>
  );
}

// Mapa simples de nomes de cores litúrgicas para hex (aproximado)
function getColorHex(color: string): string {
  const colorMap: Record<string, string> = {
    Branco: "#f5f5f5",
    Vermelho: "#dc2626",
    Verde: "#16a34a",
    Roxo: "#9333ea",
    Preto: "#1f2937",
  };
  return colorMap[color] || "#9ca3af";
}
