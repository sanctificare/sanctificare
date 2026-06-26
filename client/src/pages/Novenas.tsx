import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import AppNav from "@/components/AppNav";
import { trpc } from "@/lib/trpc";
import { NOVENAS, getNovenaPath } from "@/data/novenas";
import { Crown, Lock, Sparkles, CalendarCheck2 } from "lucide-react";
import { Link } from "wouter";
import { getNovenaArt } from "@/lib/cardArt";
import { NOVENA_PROGRESS_STORAGE_KEY, ProgressMap, buildNovenasInProgressItems, parseNovenaProgress } from "@/lib/novenaProgress";

const LOGO_IMG = "/assets/sanctificare-logo-v2.webp";

function readProgress(): ProgressMap {
  if (typeof window === "undefined") return {};

  const raw = localStorage.getItem(NOVENA_PROGRESS_STORAGE_KEY);
  return parseNovenaProgress(raw);
}

export default function Novenas() {
  const { isAuthenticated, loading } = useAuth();
  const [progress] = useState<ProgressMap>(() => readProgress());
  const { data: subscription } = trpc.subscriptions.getActive.useQuery(undefined, { enabled: isAuthenticated });

  const isPremium = !!subscription;

  const activeNovenas = buildNovenasInProgressItems(progress, NOVENAS);

  // Divide as novenas restantes por temas
  const faithNovenas = NOVENAS.filter((n) =>
    ["novena-sagrado-coracao-jesus", "novena-divino-espirito-santo"].includes(n.id)
  );
  const intercessionNovenas = NOVENAS.filter((n) =>
    ["novena-nossa-senhora-perpetuo-socorro", "novena-sao-jose"].includes(n.id)
  );

  const renderNovenaCard = (novena: typeof NOVENAS[number]) => {
    const locked = novena.category === "premium" && !isPremium;
    const done = progress[novena.id]?.length ?? 0;
    const art = getNovenaArt(novena.id);

    return (
      <Link key={novena.id} href={getNovenaPath(novena)}>
        <button className="cover-card aspect-square group">
          <img
            src={art.image}
            alt={novena.name}
            className="cover-card-image"
            loading="lazy"
          />
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to top, oklch(0.10 0.03 260 / 0.87) 0%, ${art.overlay ?? "oklch(0.28 0.07 260 / 0.58)"} 55%, oklch(0.10 0.02 260 / 0.12) 100%)`,
            }}
          />

          <div className="absolute left-3 top-3 rounded-full bg-black/30 px-2 py-1 flex items-center gap-1 text-white/90">
            <CalendarCheck2 size={11} />
            <span className="text-[10px] font-semibold tracking-[0.03em]">{done}/9 dias</span>
          </div>

          {locked ? (
            <div className="absolute right-3 top-3 w-8 h-8 rounded-full bg-[oklch(0.75_0.12_75/0.24)] border border-[oklch(0.75_0.12_75/0.45)] flex items-center justify-center">
              <Lock size={13} className="text-[oklch(0.90_0.05_84)]" />
            </div>
          ) : null}

          {novena.category === "premium" ? (
            <span className="cover-card-kicker badge-premium">Premium</span>
          ) : (
            <span className="cover-card-kicker font-semibold rounded-full px-2 py-1 bg-[oklch(0.40_0.10_150/0.80)] text-white">Disponível</span>
          )}

          <div className="cover-card-content">
            <p className="cover-card-title">{novena.name}</p>
            <p className="text-[0.72rem] text-white/85 mt-1 hidden md:block">{novena.subtitle}</p>
            <p className="cover-card-desc hidden md:block">{novena.description}</p>
          </div>
        </button>
      </Link>
    );
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
        <div className="text-center">
          <img src={LOGO_IMG} alt="Sanctificare" className="w-16 h-16 rounded-full mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold mb-2">Acesso Restrito</h2>
          <p className="text-muted-foreground mb-6">Entre para percorrer as novenas e seus dias de oração.</p>
          <a href={getLoginUrl()}><Button>Entrar</Button></a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[oklch(0.965_0.012_82)] relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_oklch(0.90_0.04_85/0.40),_transparent_55%),linear-gradient(180deg,_oklch(1_0_0/0.30),_transparent)]" />
      <div className="pointer-events-none absolute inset-0 bg-pattern-cross opacity-25" />
      <AppNav />

      <main className="container py-10 relative z-10">
        <div className="mb-8 animate-fade-in text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-[oklch(0.22_0.07_260)] mb-3">
            Novenas
          </h1>
          <p className="font-serif text-[oklch(0.38_0.03_260)] text-lg max-w-2xl mx-auto">
            Escolha uma novena e percorra seus 9 dias com espírito de constância, recolhimento e confiança em Deus.
          </p>
        </div>

        {/* Bloco de Novenas em Andamento (Estilo Hallow) */}
        {activeNovenas.length > 0 && (
          <div className="mb-10 animate-fade-in">
            <h2 className="font-display text-lg font-bold text-[oklch(0.22_0.07_260)] mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              Continuar Rezando
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeNovenas.map(({ novena, completed, nextDay, progressPercent }) => {
                const art = getNovenaArt(novena.id);
                const totalDays = Math.max(1, novena.days.length);
                return (
                  <div key={novena.id} className="relative rounded-2xl border border-[oklch(0.72_0.10_75/0.25)] bg-white dark:bg-card p-4 flex gap-4 shadow-sm hover:shadow-md transition-all duration-300">
                    <img src={art.image} alt={novena.name} className="w-20 h-20 md:w-24 md:h-24 rounded-xl object-cover border border-border" />
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <h3 className="font-serif text-lg font-bold text-[oklch(0.22_0.07_260)] truncate">{novena.name}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">Devocional • Dia {nextDay} pendente</p>
                      </div>
                      
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-[11px] font-semibold mb-1 text-muted-foreground">
                          <span>{completed.length}/{totalDays} dias concluídos</span>
                          <span>{progressPercent}%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                          <div className="h-full bg-[oklch(0.75_0.12_75)] transition-all duration-500" style={{ width: `${progressPercent}%` }} />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center pr-1">
                      <Link href={`${getNovenaPath(novena)}?day=${nextDay}`}>
                        <Button size="sm" className="bg-[oklch(0.22_0.07_260)] hover:bg-[oklch(0.28_0.08_260)] text-white text-xs font-semibold px-4">
                          Rezar
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="mb-10 rounded-3xl border border-[oklch(0.72_0.10_75/0.35)] bg-[linear-gradient(145deg,_oklch(1_0_0/0.86),_oklch(0.95_0.02_82/0.95))] p-7 relative overflow-hidden shadow-[0_16px_50px_oklch(0.22_0.07_260/0.08)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_oklch(0.80_0.10_78/0.18),_transparent_40%)]" />
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="badge-premium">Jornada de 9 dias</span>
              </div>
              <h2 className="font-display text-2xl font-bold text-[oklch(0.24_0.07_260)] mb-1">Sua biblioteca de devoções</h2>
              <p className="text-sm text-[oklch(0.42_0.03_260)]">Cada novena abre um caminho próprio de oração diária, com texto, meditação e apoio em áudio.</p>
            </div>
            <div className="rounded-xl border border-[oklch(0.72_0.10_75/0.45)] bg-[oklch(0.82_0.09_80/0.15)] px-4 py-2">
              <span className="text-[oklch(0.28_0.06_260)] text-sm font-semibold">{NOVENAS.length} novenas disponíveis</span>
            </div>
          </div>
        </div>

        {/* Categoria 1: Fé e Entrega */}
        <section className="mb-10">
          <div className="mb-4">
            <h2 className="font-display text-xl font-bold text-[oklch(0.22_0.07_260)]">Fé e Entrega ao Senhor</h2>
            <p className="text-sm text-muted-foreground">Caminhos de intimidade com Jesus e docilidade ao Espírito Santo.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {faithNovenas.map(renderNovenaCard)}
          </div>
        </section>

        {/* Categoria 2: Intercessão */}
        <section className="mb-10">
          <div className="mb-4">
            <h2 className="font-display text-xl font-bold text-[oklch(0.22_0.07_260)]">Intercessão e Devoção</h2>
            <p className="text-sm text-muted-foreground">Una-se à oração da Mãe de Deus e de São José em suas necessidades.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {intercessionNovenas.map(renderNovenaCard)}
          </div>
        </section>

        {!isPremium ? (
          <div className="mt-6 rounded-xl border border-[oklch(0.75_0.12_75/0.3)] bg-[oklch(0.75_0.12_75/0.08)] p-4 max-w-xl mx-auto">
            <div className="flex items-center gap-2 mb-2">
              <Crown size={15} className="text-[oklch(0.65_0.12_70)]" />
              <span className="font-semibold text-sm text-[oklch(0.22_0.07_260)]">Desbloqueie mais novenas</span>
            </div>
            <p className="text-xs text-muted-foreground mb-3">A assinatura libera novas novenas e outros itinerários de oração para acompanhar sua vida espiritual.</p>
            <Link href="/premium">
              <Button className="w-full bg-[oklch(0.22_0.07_260)] hover:bg-[oklch(0.28_0.08_260)] text-white font-semibold text-xs">
                Ver planos
              </Button>
            </Link>
          </div>
        ) : null}
      </main>
    </div>
  );
}
