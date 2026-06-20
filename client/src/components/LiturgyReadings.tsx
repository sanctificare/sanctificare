import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "../../../server/routers";

type RouterOutput = inferRouterOutputs<AppRouter>;
type DailyLiturgyData = RouterOutput["liturgy"]["getByDate"];

interface LiturgyReadingsProps {
  liturgy: DailyLiturgyData;
}

export default function LiturgyReadings({ liturgy }: LiturgyReadingsProps) {
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
      label: "Salmo",
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
    <div className="space-y-3">
      {sections.map((section) => {
        const isExpanded = expandedSection === section.id;
        const reading = "reading" in section ? section.reading : null;

        if (reading === null && section.id !== "celebration") {
          return null;
        }

        return (
          <div
            key={section.id}
            className="border border-border rounded-lg overflow-hidden bg-card hover:shadow-md transition-shadow"
          >
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-accent transition-colors"
            >
              <div className="flex items-center gap-3">
                {section.color && section.id === "celebration" && (
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor: getColorHex(section.color),
                    }}
                    title={`Cor: ${section.color}`}
                  />
                )}
                <span className="font-semibold text-sm">{section.label}</span>
                {section.id === "celebration" && section.color && (
                  <span className="text-xs text-muted-foreground ml-2">
                    ({section.color})
                  </span>
                )}
              </div>
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              )}
            </button>

            {isExpanded && (
              <div className="px-4 py-3 bg-muted/30 border-t border-border text-sm">
                {section.id === "celebration" ? (
                  <p className="text-foreground">{section.content}</p>
                ) : reading ? (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground font-semibold">
                      {reading.referencia}
                      {reading.titulo && ` — ${reading.titulo}`}
                    </p>
                    <p className="leading-relaxed whitespace-pre-wrap">
                      {reading.texto}
                    </p>
                    {reading.refrao && section.isPsalm && (
                      <div className="mt-3 p-2 bg-accent/20 rounded border-l-2 border-accent italic text-sm">
                        <strong>Refrão:</strong> {reading.refrao}
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

      {liturgy.prayers && (
        <div className="border border-border rounded-lg overflow-hidden bg-card mt-4 pt-3">
          <button
            onClick={() => toggleSection("prayers")}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-accent transition-colors"
          >
            <span className="font-semibold text-sm">Orações do Dia</span>
            {expandedSection === "prayers" ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
          {expandedSection === "prayers" && (
            <div className="px-4 py-3 bg-muted/30 border-t border-border text-sm space-y-3">
              {liturgy.prayers.coleta && (
                <div>
                  <p className="text-xs text-muted-foreground font-semibold mb-1">
                    Coleta
                  </p>
                  <p className="leading-relaxed">{liturgy.prayers.coleta}</p>
                </div>
              )}
              {liturgy.prayers.oferendas && (
                <div>
                  <p className="text-xs text-muted-foreground font-semibold mb-1">
                    Sobre as Oferendas
                  </p>
                  <p className="leading-relaxed">{liturgy.prayers.oferendas}</p>
                </div>
              )}
              {liturgy.prayers.comunhao && (
                <div>
                  <p className="text-xs text-muted-foreground font-semibold mb-1">
                    Depois da Comunhão
                  </p>
                  <p className="leading-relaxed">{liturgy.prayers.comunhao}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
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
