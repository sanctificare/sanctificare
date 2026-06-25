import { ChevronDown, ChevronUp, BookOpen } from "lucide-react";
import React, { useState } from "react";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "../../../server/routers";
import type { LiturgicalTheme } from "../pages/Liturgy";
import { Button } from "@/components/ui/button";

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

export default function LiturgyReadings({ liturgy, fontSize, isZenMode, theme }: LiturgyReadingsProps) {
  const [expandedSection, setExpandedSection] = useState<string>("gospel");


  if (!liturgy) {
    return (
      <div className="text-center text-muted-foreground py-12">
        <p>Nenhuma liturgia disponível para esta data.</p>
      </div>
    );
  }

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
