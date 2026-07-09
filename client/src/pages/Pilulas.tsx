import { useState } from "react";
import { BookHeart, Check, CircleHelp, Clock3, FileText, Quote, Sparkles } from "lucide-react";
import { WISDOM_PILLS } from "@/data/wisdom-pills";

const CARD_CATEGORIES = ["Vida interior", "Virtudes", "Vida de oração"] as const;

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

          <section aria-label="Dias do retiro" className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {WISDOM_PILLS.map((pill, index) => {
              const active = pill.id === selectedPill.id;
              const category = CARD_CATEGORIES[index % CARD_CATEGORIES.length];
              return (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => setSelectedId(pill.id)}
                  className={`h-full rounded-2xl border bg-white p-5 text-left transition-all ${
                    active
                      ? "border-[oklch(0.65_0.12_70)] shadow-[0_8px_28px_oklch(0.65_0.12_70/0.18)]"
                      : "border-[oklch(0.22_0.07_260/0.12)] hover:border-[oklch(0.65_0.12_70/0.45)] hover:shadow-sm"
                  }`}
                >
                  <span className="inline-flex rounded-md border border-[oklch(0.65_0.12_70/0.35)] bg-[oklch(0.97_0.03_85)] px-2 py-1 text-xs font-bold uppercase tracking-wide text-[oklch(0.65_0.12_70)]">
                    {category}
                  </span>

                  <h3 className="mt-4 font-display text-3xl leading-tight text-[oklch(0.22_0.07_260)]">
                    {pill.title.replace(/^Dia \d+:\s*/, "")}
                  </h3>
                  <p className="mt-1 text-xl font-medium text-[oklch(0.30_0.06_260)]">Por {pill.narrator}</p>

                  <p className="mt-4 min-h-20 text-lg leading-relaxed text-muted-foreground">{pill.description}</p>

                  <div className="mt-5 border-t border-[oklch(0.22_0.07_260/0.12)] pt-3 text-[oklch(0.65_0.12_70)]">
                    <div className="flex items-center justify-between gap-3 text-base font-semibold">
                      <span className="inline-flex items-center gap-2">
                        <FileText size={16} />
                        {active ? "Lendo agora" : "Ler meditação"}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-[oklch(0.30_0.05_260)]">
                        <Clock3 size={15} />
                        5 min
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </section>

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
      </main>
    </div>
  );
}