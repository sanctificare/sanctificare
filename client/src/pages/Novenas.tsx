import { useState, useMemo } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { applyImageFallback, getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { NOVENAS, getNovenaPath } from "@/data/novenas";
import { Crown, Lock } from "lucide-react";
import { Link } from "wouter";
import { getNovenaArt } from "@/lib/cardArt";
import { NOVENA_PROGRESS_STORAGE_KEY, ProgressMap, buildNovenasInProgressItems, parseNovenaProgress } from "@/lib/novenaProgress";

const LOGO_IMG = "/assets/logo-sanctificare.webp";

function readProgress(): ProgressMap {
  if (typeof window === "undefined") return {};
  const raw = localStorage.getItem(NOVENA_PROGRESS_STORAGE_KEY);
  return parseNovenaProgress(raw);
}

// SVG circular progress ring
function ProgressRing({ done, total }: { done: number; total: number }) {
  const r = 14;
  const circ = 2 * Math.PI * r;
  const progress = total > 0 ? done / total : 0;
  const dash = progress * circ;
  const gap = circ - dash;
  const isComplete = done >= total && total > 0;

  if (done === 0) return null;

  return (
    <svg width="36" height="36" viewBox="0 0 36 36" className="absolute left-2 top-2 drop-shadow-md z-20">
      <circle cx="18" cy="18" r={r} fill="rgba(0,0,0,0.45)" stroke="none" />
      <circle cx="18" cy="18" r={r} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2.5" />
      <circle
        cx="18" cy="18" r={r}
        fill="none"
        stroke={isComplete ? "oklch(0.65 0.17 145)" : "oklch(0.75 0.12 75)"}
        strokeWidth="2.5"
        strokeDasharray={`${dash} ${gap}`}
        strokeLinecap="round"
        transform="rotate(-90 18 18)"
        style={{ transition: "stroke-dasharray 0.6s ease" }}
      />
      {isComplete ? (
        <text x="18" y="23" textAnchor="middle" fontSize="13" fill="oklch(0.65 0.17 145)" fontWeight="800">✓</text>
      ) : (
        <text x="18" y="21.5" textAnchor="middle" fontSize="8" fill="white" fontWeight="700">{done}/{total}</text>
      )}
    </svg>
  );
}

export default function Novenas() {
  const { isAuthenticated, loading } = useAuth();
  const [progress] = useState<ProgressMap>(() => readProgress());
  const { data: subscription } = trpc.subscriptions.getActive.useQuery(undefined, { enabled: isAuthenticated });

  const isPremium = Boolean(subscription);
  const activeNovenas = buildNovenasInProgressItems(progress, NOVENAS);

  const stats = useMemo(() => {
    const totalDays = Object.values(progress).reduce(
      (sum, days) => sum + (Array.isArray(days) ? days.length : 0),
      0
    );
    const started = Object.keys(progress).filter(
      (id) => Array.isArray(progress[id]) && (progress[id] as number[]).length > 0
    ).length;
    const completed = Object.keys(progress).filter(
      (id) => Array.isArray(progress[id]) && (progress[id] as number[]).length >= 9
    ).length;
    return { totalDays, started, completed };
  }, [progress]);

  const faithNovenas = NOVENAS.filter((n) =>
    ["novena-sagrado-coracao-jesus"].includes(n.id)
  );
  const intercessionNovenas: typeof NOVENAS = [];

  const renderNovenaCard = (novena: typeof NOVENAS[number]) => {
    const locked = novena.category === "premium" && !isPremium;
    const done = progress[novena.id]?.length ?? 0;
    const total = novena.days.length;
    const isComplete = done >= total && done > 0;
    const art = getNovenaArt(novena.id);

    return (
      <Link key={novena.id} href={getNovenaPath(novena)}>
        <button
          className={`cover-card aspect-square group relative ${isComplete ? "ring-2 ring-emerald-500/70 ring-offset-2 ring-offset-transparent" : ""}`}
        >
          <img
            src={art.image}
            alt={novena.name}
            className="cover-card-image"
            loading="lazy"
            onError={(event) => applyImageFallback(event.currentTarget)}
          />
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to top, oklch(0.10 0.03 260 / 0.87) 0%, ${art.overlay ?? "oklch(0.28 0.07 260 / 0.58)"} 55%, oklch(0.10 0.02 260 / 0.12) 100%)`,
            }}
          />
          <ProgressRing done={done} total={total} />
          {locked && (
            <div className="absolute right-2 top-2 w-8 h-8 rounded-full bg-[oklch(0.75_0.12_75/0.24)] border border-[oklch(0.75_0.12_75/0.45)] flex items-center justify-center z-20">
              <Lock size={13} className="text-[oklch(0.90_0.05_84)]" />
            </div>
          )}
          <div className="cover-card-content flex flex-col items-start gap-1">
            {isComplete ? (
              <span className="font-bold rounded-full px-1.5 py-0.5 bg-emerald-500/85 text-white text-[9px] tracking-wide uppercase">Concluída</span>
            ) : novena.category === "premium" ? (
              <span className="badge-premium text-[10px] scale-90 origin-left">Premium</span>
            ) : (
              <span className="font-semibold rounded-full px-1.5 py-0.5 bg-[oklch(0.40_0.10_150/0.80)] text-white text-[9px] tracking-wide uppercase">Disponível</span>
            )}
            <p className="cover-card-title mt-0.5">{novena.name}</p>
          </div>
        </button>
      </Link>
    );
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <img src={LOGO_IMG} alt="Sanctificare" className="w-16 h-16 object-contain animate-pulse" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <img src={LOGO_IMG} alt="Sanctificare" className="w-16 h-16 object-contain mx-auto mb-4" />
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
      <main className="container py-10 relative z-10">

        {/* Cabecalho */}
        <div className="mb-8 animate-fade-in text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-[oklch(0.22_0.07_260)] mb-3">Novenas</h1>
          <p className="font-serif text-[oklch(0.38_0.03_260)] text-lg max-w-2xl mx-auto">
            Escolha uma novena e percorra seus 9 dias com espírito de constância, recolhimento e confiança em Deus.
          </p>
        </div>

        {/* Jornada de oracao */}
        {stats.totalDays > 0 && (
          <div className="mb-8 animate-fade-in rounded-2xl border border-[oklch(0.72_0.10_75/0.30)] bg-gradient-to-r from-[oklch(0.97_0.02_82)] to-white dark:from-stone-900 dark:to-stone-950 p-5 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[oklch(0.55_0.06_260)] mb-4">
              📿 Sua jornada de oração
            </h2>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-black text-[oklch(0.75_0.12_75)]">{stats.totalDays}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold mt-0.5">Dias rezados</p>
              </div>
              <div className="border-x border-border">
                <p className="text-2xl font-black text-[oklch(0.22_0.07_260)]">{stats.started}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold mt-0.5">Em andamento</p>
              </div>
              <div>
                <p className="text-2xl font-black text-emerald-600">{stats.completed}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold mt-0.5">Concluídas</p>
              </div>
            </div>
            {stats.completed > 0 && (
              <p className="text-xs text-center text-[oklch(0.45_0.05_260)] mt-4 font-serif italic">
                "Perseverai na oração, vigilantes e agradecidos." — Cl 4,2
              </p>
            )}
          </div>
        )}

        {/* Novenas em Andamento */}
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
                    <img
                      src={art.image}
                      alt={novena.name}
                      className="w-20 h-20 md:w-24 md:h-24 rounded-xl object-cover border border-border"
                      onError={(event) => applyImageFallback(event.currentTarget)}
                    />
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

        {faithNovenas.length > 0 && (
          <div className="mb-10 animate-fade-in">
            <h2 className="font-display text-lg font-bold text-[oklch(0.22_0.07_260)] mb-4">Novenas</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {faithNovenas.map(renderNovenaCard)}
            </div>
          </div>
        )}

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