import { getLoginUrl } from "@/const";
import { openRouteInApp } from "@/lib/deepLink";
import type { ViaSacraStation } from "@/data/via-sacra";
import { Check, ChevronRight, Play } from "lucide-react";

type PublicViaSacraDetailsProps = {
  stations: ViaSacraStation[];
  path: string;
};

export default function PublicViaSacraDetails({ stations, path }: PublicViaSacraDetailsProps) {
  const firstStation = stations[0];

  return (
    <main className="min-h-screen bg-white px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[minmax(18rem,24rem)_minmax(0,1fr)] lg:items-start">
        <section className="lg:sticky lg:top-24">
          <h1 className="font-display text-3xl font-bold text-black sm:text-4xl">Via-Sacra</h1>
          <p className="mt-2 text-sm text-muted-foreground">Caminho da Paixão do Senhor</p>

          <img
            src={firstStation?.imageUrl}
            alt="Via-Sacra"
            className="mt-6 aspect-square w-full rounded-lg object-cover"
          />

          <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
            Percorra as 14 estações da Via-Sacra com meditação e oração em cada etapa.
            No app, você acompanha o caminho completo com recursos guiados.
          </p>

          <button
            onClick={() => openRouteInApp(path)}
            className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-black px-5 text-base font-bold text-white transition-colors hover:bg-black/80"
          >
            <Play className="h-4 w-4 fill-current" />
            Iniciar Via-Sacra
          </button>
          <p className="mt-4 text-center text-xs text-muted-foreground">Acompanhe as estações e salve seu progresso no app.</p>
        </section>

        <section aria-label="Sessões da Via-Sacra">
          <div className="border-b border-black/10 pb-4">
            <p className="text-sm font-bold text-black">{stations.length} sessões</p>
          </div>

          <ol className="divide-y divide-black/10">
            {stations.map((station, index) => {
              const isPreview = index === 0;
              const summary = station.meditation.trim();

              return (
                <li key={station.id} className={`flex gap-3 py-4 ${isPreview ? "text-black" : "text-black/35"}`}>
                  <span className="mt-0.5 w-5 text-right text-sm font-bold">{station.order}</span>
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate text-base font-bold">{station.title}</h2>
                    <p className="mt-0.5 truncate text-sm">{summary}</p>
                    <p className="mt-1 text-xs">Estação {station.order}</p>
                  </div>
                  {isPreview ? (
                    <a
                      href={getLoginUrl(path)}
                      className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-black text-white transition-transform hover:scale-105"
                      aria-label="Entrar para iniciar a Via-Sacra"
                    >
                      <Play className="h-3.5 w-3.5 fill-current" />
                    </a>
                  ) : (
                    <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-black/15 text-white" aria-label="Sessão desativada">
                      <Play className="h-3.5 w-3.5 fill-current" />
                    </span>
                  )}
                </li>
              );
            })}
          </ol>

          <div className="mt-6 flex items-center gap-2 rounded-lg bg-black/[0.03] p-4 text-sm text-muted-foreground">
            <Check className="h-4 w-4 shrink-0 text-emerald-700" />
            As sessões completas e o progresso ficam disponíveis após entrar no app.
            <ChevronRight className="ml-auto h-4 w-4 shrink-0" />
          </div>
        </section>
      </div>
    </main>
  );
}