import { getLoginUrl } from "@/const";
import { getNovenaArt } from "@/lib/cardArt";
import { openRouteInApp } from "@/lib/deepLink";
import type { Novena } from "@/data/novenas";
import { Check, ChevronRight, Lock, Play } from "lucide-react";

type PublicNovenaDetailsProps = {
  novena: Novena;
  path: string;
};

export default function PublicNovenaDetails({ novena, path }: PublicNovenaDetailsProps) {
  const art = getNovenaArt(novena.id);

  return (
    <main className="min-h-screen bg-white px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[minmax(18rem,24rem)_minmax(0,1fr)] lg:items-start">
        <section className="lg:sticky lg:top-24">
          <h1 className="font-display text-3xl font-bold text-black sm:text-4xl">{novena.name.replace("Novena a ", "")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{novena.subtitle}</p>

          <img
            src={art.image}
            alt={novena.name}
            className="mt-6 aspect-square w-full rounded-lg object-cover"
          />

          <p className="mt-5 text-sm leading-relaxed text-muted-foreground">{novena.description}</p>

          <button
            onClick={() => openRouteInApp(path)}
            className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-black px-5 text-base font-bold text-white transition-colors hover:bg-black/80"
          >
            <Play className="h-4 w-4 fill-current" />
            Iniciar no app
          </button>
          <a
            href={getLoginUrl(path)}
            className="mt-3 flex h-11 w-full items-center justify-center rounded-full border border-black/15 text-sm font-semibold text-black transition-colors hover:bg-black/5"
          >
            Entrar para acompanhar
          </a>
          <p className="mt-4 text-center text-xs text-muted-foreground">Acompanhe os nove dias e salve seu progresso no app.</p>
        </section>

        <section aria-label={`Sessões de ${novena.name}`}>
          <div className="border-b border-black/10 pb-4">
            <p className="text-sm font-bold text-black">{novena.days.length} sessões</p>
          </div>

          <ol className="divide-y divide-black/10">
            {novena.days.map((day, index) => {
              const isPreview = index === 0;
              const summary = day.reflection
                ? day.reflection.replace(/\n+/g, " ").replace(/[🎯🛡️📖📜🏛️]/g, "").trim()
                : novena.description;

              return (
                <li key={day.day} className={`flex gap-3 py-4 ${isPreview ? "text-black" : "text-black/35"}`}>
                  <span className="mt-0.5 w-5 text-right text-sm font-bold">{day.day}</span>
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate text-base font-bold">{day.title.replace(/^Dia \d+:\s*/, "")}</h2>
                    <p className="mt-0.5 truncate text-sm">{summary}</p>
                    <p className="mt-1 text-xs">Dia {day.day} · {day.duration ?? "oração guiada"}</p>
                  </div>
                  {isPreview ? (
                    <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-black text-white" aria-label="Prévia disponível no app">
                      <Play className="h-3.5 w-3.5 fill-current" />
                    </span>
                  ) : (
                    <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center" aria-label="Disponível no app">
                      <Lock className="h-4 w-4" />
                    </span>
                  )}
                </li>
              );
            })}
          </ol>

          <div className="mt-6 flex items-center gap-2 rounded-lg bg-black/[0.03] p-4 text-sm text-muted-foreground">
            <Check className="h-4 w-4 shrink-0 text-emerald-700" />
            As sessões completas, áudios e progresso ficam disponíveis após entrar no app.
            <ChevronRight className="ml-auto h-4 w-4 shrink-0" />
          </div>
        </section>
      </div>
    </main>
  );
}