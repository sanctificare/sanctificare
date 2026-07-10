import { useMemo, useState } from "react";
import { Link } from "wouter";
import { BookOpenText, Check, CircleHelp, Headphones, Quote, Type } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IMITACAO_PILULAS } from "@/data/imitacao-pilulas";
import { Button } from "@/components/ui/button";

export default function ImitacaoCristoRetiro() {
  const [selectedId, setSelectedId] = useState(IMITACAO_PILULAS[0].id);
  const [activeTab, setActiveTab] = useState<"audio" | "text">("audio");
  const [fontSize, setFontSize] = useState<"sm" | "md" | "lg" | "xl">("md");

  const selected = useMemo(
    () => IMITACAO_PILULAS.find((pill) => pill.id === selectedId) ?? IMITACAO_PILULAS[0],
    [selectedId]
  );

  const fontSizeClasses = {
    sm: "text-xs md:text-sm leading-6",
    md: "text-sm md:text-base leading-7",
    lg: "text-base md:text-lg leading-8",
    xl: "text-lg md:text-xl leading-9",
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 pb-10 ${
      activeTab === "audio" ? "bg-[#070b19]" : "bg-[oklch(0.97_0.01_85)]"
    }`}>
      {/* Pattern background */}
      <div className={`absolute inset-0 pointer-events-none transition-opacity duration-500 ${
        activeTab === "audio" ? "bg-pattern-cross opacity-[0.01]" : "bg-pattern-cross opacity-[0.015]"
      }`} />

      <main className="container py-7 relative z-10">
        <div className="mb-5">
          <Link href="/degraus-de-perfeicao">
            <button className={`mb-3 text-sm font-medium hover:underline transition-colors ${
              activeTab === "audio" ? "text-amber-500/80 hover:text-amber-400" : "text-[oklch(0.65_0.12_70)]"
            }`}>
              ← Voltar aos Degraus de Perfeição
            </button>
          </Link>
          <p className={`text-xs font-semibold uppercase tracking-wide transition-colors ${
            activeTab === "audio" ? "text-amber-500/60" : "text-[oklch(0.65_0.12_70)]"
          }`}>
            Vida interior
          </p>
          <h1 className={`font-display text-3xl font-bold sm:text-4xl transition-colors ${
            activeTab === "audio" ? "text-slate-100" : "text-[oklch(0.22_0.07_260)]"
          }`}>
            A Imitação de Cristo
          </h1>
          <p className={`font-serif transition-colors text-sm ${
            activeTab === "audio" ? "text-slate-400" : "text-muted-foreground"
          }`}>
            Por Tomás de Kempis • Formato Áudio/Pílulas de 5 min
          </p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
          <section className={`rounded-2xl border transition-all duration-500 p-4 sm:p-6 ${
            activeTab === "audio"
              ? "bg-[#0b1329] border-amber-500/10 text-slate-100 shadow-[0_12px_40px_rgba(11,19,41,0.2)]"
              : "bg-[#fcfbf7] border-[oklch(0.72_0.10_75/0.25)] text-[#2d251e] shadow-[0_12px_40px_rgba(232,223,199,0.15)]"
          }`}>
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "audio" | "text")}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-border/20 pb-4 mb-4 gap-4">
                <TabsList className={`p-1 rounded-xl transition-all w-fit ${
                  activeTab === "audio"
                    ? "bg-white/5 border border-white/10"
                    : "bg-[oklch(0.22_0.07_260/0.06)]"
                }`}>
                  <TabsTrigger value="audio" className={`gap-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                    activeTab === "audio"
                      ? "data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950 text-slate-400"
                      : "data-[state=active]:bg-[oklch(0.75_0.12_75)] data-[state=active]:text-white text-muted-foreground"
                  }`}>
                    <Headphones size={14} />
                    Pílulas de Sabedoria
                  </TabsTrigger>
                  <TabsTrigger value="text" className={`gap-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                    activeTab === "text"
                      ? "data-[state=active]:bg-[oklch(0.75_0.12_75)] data-[state=active]:text-white text-muted-foreground"
                      : "data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950 text-slate-400"
                  }`}>
                    <BookOpenText size={14} />
                    Leitura em Texto
                  </TabsTrigger>
                </TabsList>

                {/* Font Size controls (only visible in Text Tab) */}
                {activeTab === "text" && (
                  <div className="flex items-center gap-1.5 bg-[oklch(0.22_0.07_260/0.04)] p-1 rounded-lg border border-border/30">
                    <span className="text-[10px] font-bold text-[#6e5e52] px-2 flex items-center gap-1">
                      <Type size={12} /> Fonte
                    </span>
                    {(["sm", "md", "lg", "xl"] as const).map((size) => (
                      <button
                        key={size}
                        onClick={() => setFontSize(size)}
                        className={`w-7 h-7 rounded text-xs font-bold transition-all cursor-pointer ${
                          fontSize === size
                            ? "bg-[oklch(0.22_0.07_260)] text-white"
                            : "text-[#6e5e52] hover:bg-black/5"
                        }`}
                      >
                        {size.toUpperCase()}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <TabsContent value="audio" className="space-y-6 animate-fade-in outline-none">
                <div className="rounded-xl border border-amber-500/10 bg-white/5 p-5 backdrop-blur-md relative overflow-hidden flex flex-col items-center text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500/80">{selected.id.toUpperCase()}</span>
                  <h2 className="mt-1 font-display text-2xl font-bold text-slate-100 leading-tight">{selected.title}</h2>
                  <p className="text-xs text-slate-400 mt-1">Narrado por {selected.narrator} • {selected.durationLabel}</p>

                  {/* Visual de Capa e Frase Devocional */}
                  <div className="flex flex-col items-center justify-center my-5">
                    <div className="relative w-36 h-36">
                      <div className="absolute -inset-1.5 rounded-3xl bg-gradient-to-tr from-amber-600 to-amber-300 blur-sm opacity-60" />
                      <img
                        src="/assets/degraus/imitacao_cristo_essence.jpg"
                        alt="Essência de A Imitação de Cristo"
                        className="relative w-36 h-36 rounded-3xl object-cover z-10 border border-white/10 shadow-2xl"
                      />
                    </div>
                  </div>

                  {selected.audioUrl ? (
                    <audio className="mt-2 w-full max-w-sm rounded-lg accent-amber-500" controls src={selected.audioUrl} preload="none" />
                  ) : (
                    <div className="mt-2 rounded-md border border-dashed border-amber-500/20 bg-white/5 px-3 py-2 text-sm text-slate-400 max-w-sm">
                      Áudio em gravação. Enquanto isso, use a aba de texto para acompanhar toda a meditação.
                    </div>
                  )}
                </div>

                <blockquote className="rounded-lg border-l-4 border-amber-500 bg-white/5 px-4 py-3 font-serif italic text-slate-300 text-sm">
                  <Quote size={14} className="mb-1 text-amber-500/80" />
                  {selected.quote}
                </blockquote>

                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4">
                  <div className="mb-1 flex items-center gap-2 text-emerald-400">
                    <Check size={15} />
                    <p className="text-xs font-bold uppercase tracking-wide">Resolução prática proposta</p>
                  </div>
                  <p className="text-sm leading-relaxed text-emerald-100">{selected.resolution}</p>
                </div>
              </TabsContent>

              <TabsContent value="text" className="space-y-6 animate-fade-in text-[#2d251e] outline-none">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[oklch(0.65_0.12_70)]">{selected.id.toUpperCase()}</span>
                  <h2 className="font-display text-2xl font-bold text-[oklch(0.22_0.07_260)] leading-tight">{selected.title}</h2>
                  <p className="text-xs text-muted-foreground mt-1">{selected.description}</p>
                </div>

                <blockquote className="rounded-lg border-l-4 border-[oklch(0.75_0.12_75)] bg-[oklch(0.97_0.02_85)] px-4 py-3 font-serif italic text-[oklch(0.30_0.06_260)] text-sm">
                  <Quote size={14} className="mb-1 text-[oklch(0.65_0.12_70)]" />
                  {selected.quote}
                </blockquote>

                <div className="rounded-lg border border-[oklch(0.55_0.11_145/0.2)] bg-[oklch(0.96_0.04_145)] p-3">
                  <div className="mb-1 flex items-center gap-2 text-[oklch(0.35_0.10_145)]">
                    <Check size={14} />
                    <p className="text-xs font-bold uppercase tracking-wide">Resolução prática</p>
                  </div>
                  <p className="text-sm leading-relaxed text-[oklch(0.28_0.05_145)]">{selected.resolution}</p>
                </div>

                <div className="rounded-lg border border-[oklch(0.55_0.11_70/0.2)] bg-[oklch(0.98_0.03_85)] p-3">
                  <div className="mb-1 flex items-center gap-2 text-[oklch(0.55_0.11_70)]">
                    <CircleHelp size={14} />
                    <p className="text-xs font-bold uppercase tracking-wide">Exame de consciência</p>
                  </div>
                  <p className="text-sm leading-relaxed text-[oklch(0.36_0.06_70)]">{selected.exam}</p>
                </div>

                <div className="rounded-lg border border-[oklch(0.22_0.07_260/0.12)] bg-[#fdfdfb] p-5 shadow-sm">
                  <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-[oklch(0.65_0.12_70)] border-b border-[oklch(0.22_0.07_260/0.05)] pb-1.5">Texto Completo</p>
                  <p className={`whitespace-pre-line font-serif text-[#2d251e]/90 first-letter:float-left first-letter:text-5xl first-letter:font-bold first-letter:font-display first-letter:mr-2.5 first-letter:mt-1 first-letter:leading-[0.85] first-letter:text-[oklch(0.75_0.12_75)] ${fontSizeClasses[fontSize]}`}>
                    {selected.scriptText}
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </section>

          <aside className={`rounded-2xl border transition-all duration-500 p-3 h-fit ${
            activeTab === "audio"
              ? "bg-[#0b1329] border-amber-500/10 text-slate-100"
              : "bg-white border-[oklch(0.22_0.07_260/0.08)] text-[#2d251e]"
          }`}>
            <h3 className={`mb-3 px-2 text-xs font-bold uppercase tracking-widest transition-colors ${
              activeTab === "audio" ? "text-amber-500/80" : "text-[oklch(0.65_0.12_70)]"
            }`}>
              Meditações
            </h3>
            <div className="max-h-[70vh] space-y-2 overflow-y-auto pr-1">
              {IMITACAO_PILULAS.map((pill) => {
                const active = pill.id === selected.id;
                return (
                  <button
                    key={pill.id}
                    onClick={() => setSelectedId(pill.id)}
                    className={`w-full rounded-xl border px-3 py-2.5 text-left transition-all cursor-pointer ${
                      active
                        ? activeTab === "audio"
                          ? "border-amber-500 bg-amber-500/10"
                          : "border-[oklch(0.65_0.12_70)] bg-[oklch(0.98_0.03_85)] shadow-sm"
                        : activeTab === "audio"
                          ? "border-white/5 bg-white/5 hover:border-amber-500/40 hover:bg-white/10"
                          : "border-[oklch(0.22_0.07_260/0.08)] bg-white hover:border-[oklch(0.65_0.12_70/0.4)]"
                    }`}
                  >
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <span className={`text-[9px] font-bold uppercase tracking-wider transition-colors ${
                        active ? (activeTab === "audio" ? "text-amber-400" : "text-[oklch(0.65_0.12_70)]") : "text-muted-foreground"
                      }`}>{pill.id.toUpperCase()}</span>
                      <span className="text-[9px] text-muted-foreground">{pill.durationLabel}</span>
                    </div>
                    <p className={`line-clamp-2 text-xs font-bold transition-colors ${
                      activeTab === "audio" ? "text-slate-100" : "text-[oklch(0.22_0.07_260)]"
                    }`}>{pill.title}</p>
                  </button>
                );
              })}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
