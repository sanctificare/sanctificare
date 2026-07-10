import { useMemo, useState } from "react";
import { Link } from "wouter";
import { BookOpenText, Check, CircleHelp, Headphones, Quote } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IMITACAO_PILULAS } from "@/data/imitacao-pilulas";

export default function ImitacaoCristoRetiro() {
  const [selectedId, setSelectedId] = useState(IMITACAO_PILULAS[0].id);
  const [activeTab, setActiveTab] = useState<"audio" | "text">("audio");

  const selected = useMemo(
    () => IMITACAO_PILULAS.find((pill) => pill.id === selectedId) ?? IMITACAO_PILULAS[0],
    [selectedId]
  );

  return (
    <div className="min-h-screen bg-[oklch(0.97_0.01_85)] pb-10">
      <main className="container py-7">
        <div className="mb-5">
          <Link href="/degraus-de-perfeicao">
            <button className="mb-3 text-sm font-medium text-[oklch(0.65_0.12_70)] hover:underline">← Voltar aos Degraus de Perfeição</button>
          </Link>
          <p className="text-xs font-semibold uppercase tracking-wide text-[oklch(0.65_0.12_70)]">Vida interior</p>
          <h1 className="font-display text-3xl font-bold text-[oklch(0.22_0.07_260)] sm:text-4xl">A Imitação de Cristo</h1>
          <p className="font-serif text-muted-foreground">Por Tomás de Kempis • Formato Áudio/Pílulas de 5 min</p>
        </div>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
          <section className="rounded-xl border border-[oklch(0.22_0.07_260/0.14)] bg-white p-4 sm:p-6">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "audio" | "text")}>
              <TabsList className="mb-4 bg-[oklch(0.22_0.07_260/0.06)]">
                <TabsTrigger value="audio" className="gap-2">
                  <Headphones size={15} />
                  Pílulas de Sabedoria
                </TabsTrigger>
                <TabsTrigger value="text" className="gap-2">
                  <BookOpenText size={15} />
                  Leitura em Texto
                </TabsTrigger>
              </TabsList>

              <TabsContent value="audio" className="space-y-4">
                <div className="rounded-xl border border-[oklch(0.65_0.12_70/0.4)] bg-[oklch(0.98_0.03_85)] p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-[oklch(0.65_0.12_70)]">{selected.id.toUpperCase()}</p>
                  <h2 className="mt-1 font-display text-2xl font-bold text-[oklch(0.22_0.07_260)]">{selected.title}</h2>
                  <p className="text-sm text-muted-foreground">Narrado por {selected.narrator} • {selected.durationLabel}</p>

                  {selected.audioUrl ? (
                    <audio className="mt-3 w-full" controls src={selected.audioUrl} preload="none" />
                  ) : (
                    <div className="mt-3 rounded-md border border-dashed border-[oklch(0.65_0.12_70/0.5)] bg-white px-3 py-2 text-sm text-muted-foreground">
                      Áudio em gravação. Enquanto isso, use a aba de texto para acompanhar toda a meditação.
                    </div>
                  )}
                </div>

                <blockquote className="rounded-lg border-l-4 border-[oklch(0.75_0.12_75)] bg-[oklch(0.97_0.02_85)] px-4 py-3 font-serif italic text-[oklch(0.30_0.06_260)]">
                  <Quote size={16} className="mb-2 text-[oklch(0.65_0.12_70)]" />
                  {selected.quote}
                </blockquote>

                <div className="rounded-lg border border-[oklch(0.55_0.11_145/0.2)] bg-[oklch(0.96_0.04_145)] p-3">
                  <div className="mb-1 flex items-center gap-2 text-[oklch(0.35_0.10_145)]">
                    <Check size={15} />
                    <p className="text-sm font-bold uppercase tracking-wide">Resolução prática proposta</p>
                  </div>
                  <p className="text-sm leading-relaxed text-[oklch(0.28_0.05_145)]">{selected.resolution}</p>
                </div>
              </TabsContent>

              <TabsContent value="text" className="space-y-4">
                <h2 className="font-display text-2xl font-bold text-[oklch(0.22_0.07_260)]">{selected.title}</h2>
                <p className="text-sm text-muted-foreground">{selected.description}</p>

                <blockquote className="rounded-lg border-l-4 border-[oklch(0.75_0.12_75)] bg-[oklch(0.97_0.02_85)] px-4 py-3 font-serif italic text-[oklch(0.30_0.06_260)]">
                  <Quote size={16} className="mb-2 text-[oklch(0.65_0.12_70)]" />
                  {selected.quote}
                </blockquote>

                <div className="rounded-lg border border-[oklch(0.55_0.11_145/0.2)] bg-[oklch(0.96_0.04_145)] p-3">
                  <div className="mb-1 flex items-center gap-2 text-[oklch(0.35_0.10_145)]">
                    <Check size={15} />
                    <p className="text-sm font-bold uppercase tracking-wide">Resolução prática</p>
                  </div>
                  <p className="text-sm leading-relaxed text-[oklch(0.28_0.05_145)]">{selected.resolution}</p>
                </div>

                <div className="rounded-lg border border-[oklch(0.55_0.11_70/0.2)] bg-[oklch(0.98_0.03_85)] p-3">
                  <div className="mb-1 flex items-center gap-2 text-[oklch(0.55_0.11_70)]">
                    <CircleHelp size={15} />
                    <p className="text-sm font-bold uppercase tracking-wide">Exame de consciência</p>
                  </div>
                  <p className="text-sm leading-relaxed text-[oklch(0.36_0.06_70)]">{selected.exam}</p>
                </div>

                <div className="rounded-lg border border-[oklch(0.22_0.07_260/0.12)] bg-[oklch(0.99_0.01_90)] p-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[oklch(0.65_0.12_70)]">Guia devoto</p>
                  <p className="whitespace-pre-line font-serif text-base leading-8 text-[oklch(0.28_0.04_260)]">{selected.scriptText}</p>
                </div>
              </TabsContent>
            </Tabs>
          </section>

          <aside className="rounded-xl border border-[oklch(0.22_0.07_260/0.14)] bg-white p-3">
            <h3 className="mb-2 px-2 text-xs font-bold uppercase tracking-wide text-[oklch(0.65_0.12_70)]">Pílulas de Sabedoria</h3>
            <div className="max-h-[75vh] space-y-2 overflow-y-auto pr-1">
              {IMITACAO_PILULAS.map((pill) => {
                const active = pill.id === selected.id;
                return (
                  <button
                    key={pill.id}
                    onClick={() => setSelectedId(pill.id)}
                    className={`w-full rounded-lg border px-3 py-2 text-left transition-colors ${
                      active
                        ? "border-[oklch(0.65_0.12_70)] bg-[oklch(0.98_0.03_85)]"
                        : "border-[oklch(0.22_0.07_260/0.14)] bg-white hover:border-[oklch(0.65_0.12_70/0.5)]"
                    }`}
                  >
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wide text-[oklch(0.65_0.12_70)]">{pill.id.toUpperCase()}</span>
                      <span className="text-[10px] text-muted-foreground">{pill.durationLabel}</span>
                    </div>
                    <p className="line-clamp-2 text-sm font-semibold text-[oklch(0.22_0.07_260)]">{pill.title}</p>
                    <p className="text-[11px] text-muted-foreground">Livro 1, cap.</p>
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
