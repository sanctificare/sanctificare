import { useState } from "react";
import { BookHeart, Check, ChevronRight, CircleHelp, Quote, Sparkles } from "lucide-react";
import { WISDOM_PILLS } from "@/data/wisdom-pills";

export default function Pilulas() {
  const [selectedId, setSelectedId] = useState(WISDOM_PILLS[0].id);
  const selectedPill = WISDOM_PILLS.find((pill) => pill.id === selectedId) ?? WISDOM_PILLS[0];

  return (
    <div className="min-h-screen bg-[oklch(0.97_0.01_85)] pb-14">
      <main className="container py-8">
        <div className="mx-auto max-w-5xl">
          <header className="mb-8 border-b border-[oklch(0.22_0.07_260/0.12)] pb-7">
            <div className="mb-3 flex items-center gap-2 text-[oklch(0.65_0.12_70)]">
              <Sparkles size={18} />
              <span className="text-sm font-semibold">Retiro de 10 dias</span>
            </div>
            <h1 className="font-display text-3xl font-bold text-[oklch(0.22_0.07_260)] sm:text-4xl">
              Pílulas de Sabedoria
            </h1>
            <p className="mt-2 max-w-2xl font-serif text-lg text-muted-foreground">
              Um itinerário de recolhimento inspirado em A Imitação de Cristo, de Tomás de Kempis.
            </p>
          </header>

          <div className="grid gap-6 lg:grid-cols-[17rem_minmax(0,1fr)]">
            <nav aria-label="Dias do retiro" className="lg:sticky lg:top-24 lg:self-start">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-5 lg:grid-cols-1">
                {WISDOM_PILLS.map((pill, index) => {
                  const active = pill.id === selectedPill.id;
                  return (
                    <button
                      key={pill.id}
                      type="button"
                      onClick={() => setSelectedId(pill.id)}
                      className={`flex min-h-14 items-center gap-3 rounded-lg border px-3 py-2 text-left transition-colors ${
                        active
                          ? "border-[oklch(0.22_0.07_260)] bg-[oklch(0.22_0.07_260)] text-white shadow-sm"
                          : "border-[oklch(0.22_0.07_260/0.12)] bg-white text-[oklch(0.22_0.07_260)] hover:border-[oklch(0.65_0.12_70/0.6)]"
                      }`}
                    >
                      <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${active ? "bg-[oklch(0.75_0.12_75)] text-[oklch(0.22_0.07_260)]" : "bg-[oklch(0.22_0.07_260/0.08)]"}`}>
                        {index + 1}
                      </span>
                      <span className="min-w-0 flex-1 text-sm font-semibold leading-tight line-clamp-2">{pill.title.replace(/^Dia \d+: /, "")}</span>
                      <ChevronRight size={15} className={active ? "text-[oklch(0.88_0.08_80)]" : "text-muted-foreground"} />
                    </button>
                  );
                })}
              </div>
            </nav>

            <article className="border border-[oklch(0.22_0.07_260/0.12)] bg-white p-5 shadow-sm sm:p-8">
              <div className="mb-5 flex items-center gap-2 text-sm text-[oklch(0.65_0.12_70)]">
                <BookHeart size={18} />
                <span>{selectedPill.narrator}</span>
              </div>
              <h2 className="font-display text-2xl font-bold text-[oklch(0.22_0.07_260)] sm:text-3xl">{selectedPill.title}</h2>
              <p className="mt-3 font-serif text-lg leading-relaxed text-muted-foreground">{selectedPill.description}</p>

              <blockquote className="my-7 border-l-4 border-[oklch(0.75_0.12_75)] bg-[oklch(0.97_0.02_85)] px-5 py-4 font-serif text-xl italic leading-relaxed text-[oklch(0.30_0.06_260)]">
                <Quote size={18} className="mb-2 text-[oklch(0.65_0.12_70)]" />
                {selectedPill.quote}
              </blockquote>

              <section className="mb-7 rounded-lg border border-[oklch(0.55_0.11_145/0.2)] bg-[oklch(0.96_0.04_145)] p-4">
                <div className="mb-2 flex items-center gap-2 text-[oklch(0.35_0.10_145)]">
                  <Check size={17} />
                  <h3 className="font-display text-lg font-bold">Resolução prática</h3>
                </div>
                <p className="leading-relaxed text-[oklch(0.28_0.05_145)]">{selectedPill.resolution}</p>
              </section>

              <section className="mb-8 rounded-lg border border-[oklch(0.55_0.11_70/0.2)] bg-[oklch(0.98_0.03_85)] p-4">
                <div className="mb-2 flex items-center gap-2 text-[oklch(0.55_0.11_70)]">
                  <CircleHelp size={17} />
                  <h3 className="font-display text-lg font-bold">Exame de consciência</h3>
                </div>
                <p className="leading-relaxed text-[oklch(0.36_0.06_70)]">{selectedPill.exam}</p>
              </section>

              <div className="border-t border-[oklch(0.22_0.07_260/0.12)] pt-7">
                <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-[oklch(0.65_0.12_70)]">Meditação</p>
                <div className="whitespace-pre-line font-serif text-lg leading-8 text-[oklch(0.28_0.04_260)]">
                  {selectedPill.scriptText}
                </div>
              </div>
            </article>
          </div>
        </div>
      </main>
    </div>
  );
}