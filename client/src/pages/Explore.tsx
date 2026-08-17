import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { Search, Compass, Lock } from "lucide-react";
import GooglePlayBanner from "@/components/GooglePlayBanner";
import { isSaintMichaelLentActive } from "@/lib/saintMichaelConfig";

type ExploreCard = {
  href: string;
  label: string;
  desc: string;
  image: string;
  overlay: string;
  category: "Devocional" | "Estudo" | "Práticas" | "Comunidade";
};

const exploreCards: ExploreCard[] = [
  { href: "/santoral", label: "Santoral & Festas", desc: "Santos do dia, relíquias e festas de guarda", image: "/assets/dashboard/oracoes.webp", overlay: "oklch(0.35 0.12 75 / 0.60)", category: "Estudo" },
  { href: "/rosario", label: "Rosário", desc: "Reze o Terço completo", image: "/assets/dashboard/rosario.webp", overlay: "oklch(0.22 0.08 260 / 0.60)", category: "Devocional" },
  { href: "/oracoes", label: "Orações", desc: "Orações da tradição", image: "/assets/dashboard/oracoes.webp", overlay: "oklch(0.28 0.08 145 / 0.60)", category: "Devocional" },
  { href: "/lectio", label: "Lectio Divina", desc: "Leitura orante", image: "/assets/dashboard/lectio.webp", overlay: "oklch(0.32 0.11 240 / 0.60)", category: "Estudo" },
  { href: "/via-sacra", label: "Via-Sacra", desc: "14 estações com guia", image: "/assets/dashboard/via-sacra.webp", overlay: "oklch(0.36 0.15 20 / 0.60)", category: "Devocional" },
  { href: "/vela-virtual", label: "Vela Virtual", desc: "Silêncio e oração", image: "/assets/dashboard/vela-virtual.webp", overlay: "oklch(0.50 0.10 85 / 0.56)", category: "Práticas" },
  { href: "/musica-sacra", label: "Música Sacra", desc: "Meditação e contemplação", image: "/assets/dashboard/musica-sacra.webp", overlay: "oklch(0.34 0.10 300 / 0.58)", category: "Práticas" },
  { href: "/degraus-de-perfeicao", label: "Degraus de Perfeição", desc: "Clássicos para a vida espiritual", image: "/assets/dashboard/lectio.webp", overlay: "oklch(0.35 0.10 40 / 0.60)", category: "Estudo" },
  { href: "/novenas", label: "Novenas", desc: "Jornadas de 9 dias de devoção", image: "/assets/dashboard/novenas.webp", overlay: "oklch(0.28 0.08 260 / 0.60)", category: "Devocional" },
  { href: "/quaresma-sao-miguel", label: "Quaresma de São Miguel", desc: "40 dias de oração e combate espiritual", image: "/assets/dashboard/quaresma-sao-miguel.webp", overlay: "oklch(0.30 0.10 55 / 0.62)", category: "Devocional" },
  { href: "/videos", label: "Vídeos", desc: "Histórias e passagens com IA", image: "/assets/dashboard/videos.webp", overlay: "oklch(0.40 0.12 15 / 0.60)", category: "Estudo" },
  { href: "/liturgia", label: "Liturgia", desc: "Leituras e salmo do dia", image: "/assets/dashboard/liturgia.webp", overlay: "oklch(0.40 0.15 80 / 0.60)", category: "Estudo" },
  { href: "/biblia", label: "Bíblia Sagrada", desc: "Os 73 livros das Escrituras", image: "/assets/dashboard/biblia.webp", overlay: "oklch(0.35 0.10 40 / 0.60)", category: "Estudo" },
];

const AUTH_REQUIRED_PATHS = new Set(["/plano-diario", "/intencoes"]);

export function filterExploreCards(cards: ExploreCard[], search: string, selectedCategory: string | null): ExploreCard[] {
  const normalizedSearch = search.trim().toLowerCase();

  return cards.filter((card) => {
    const matchesSearch =
      normalizedSearch.length === 0 ||
      card.label.toLowerCase().includes(normalizedSearch) ||
      card.desc.toLowerCase().includes(normalizedSearch);

    const matchesCategory =
      !selectedCategory ||
      selectedCategory === "Todos" ||
      card.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });
}

export default function Explore() {
  const { isAuthenticated, user } = useAuth();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = ["Todos", "Devocional", "Estudo", "Práticas", "Comunidade"];

  const availableCards = exploreCards.filter(
    (card) => card.href !== "/quaresma-sao-miguel" || isSaintMichaelLentActive(user)
  );

  const filteredCards = filterExploreCards(availableCards, search, selectedCategory);

  return (
    <div className="min-h-screen bg-[oklch(0.97_0.01_85)] relative overflow-hidden pb-12">
      {/* Pattern background */}
      <div className="absolute inset-0 bg-pattern-cross opacity-[0.02] pointer-events-none" />
      
      <main className="container py-8 relative z-10">
        {/* Header */}
        <div className="mb-8 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-3 mb-2">
            <Compass className="w-7 h-7 text-[oklch(0.75_0.12_75)]" />
            <h1 className="font-display text-3xl font-bold text-[oklch(0.22_0.07_260)]">
              Explore
            </h1>
          </div>
          <p className="text-sm text-muted-foreground max-w-xl">
            Acesse todas as orações, leituras, acompanhamentos e ferramentas disponíveis para nutrir sua fé e perseverança.
          </p>
        </div>

        {/* Banner Google Play (apenas na web desktop) */}
        <div className="mb-6">
          <GooglePlayBanner variant="card" showDismiss={true} />
        </div>

        {/* Search & Filter Bar */}
        <div className="mb-8 flex flex-col md:flex-row items-center justify-between gap-4 bg-white/60 dark:bg-[oklch(0.17_0.04_260/0.4)] backdrop-blur-md border border-border/40 p-4 rounded-xl shadow-sm">
          <div className="relative w-full md:max-w-xs">
            <label htmlFor="explore-search" className="sr-only">
              Buscar prática ou recurso
            </label>
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              id="explore-search"
              type="text"
              placeholder="Buscar prática ou recurso..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Buscar prática ou recurso"
              className="pl-9 pr-4 py-2 w-full bg-white dark:bg-[oklch(0.12_0.03_260)] rounded-lg border border-border text-sm focus:outline-none focus:ring-1 focus:ring-[oklch(0.75_0.12_75)] text-foreground bg-transparent"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-start md:justify-end">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat === "Todos" ? null : cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  (cat === "Todos" && !selectedCategory) || selectedCategory === cat
                    ? "bg-[oklch(0.22_0.07_260)] text-white"
                    : "bg-white/80 dark:bg-[oklch(0.17_0.04_260/0.7)] text-muted-foreground hover:bg-white border border-border/50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Cards Grid */}
        {filteredCards.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 animate-fade-in">
            {filteredCards.map(({ href, label, desc, image, overlay }) => {
              const isLocked = !isAuthenticated && AUTH_REQUIRED_PATHS.has(href);
              const targetHref = isLocked ? getLoginUrl(href) : href;

              return (
                <Link key={href} href={targetHref}>
                  <div className="cover-card aspect-square group cursor-pointer border border-border/20 shadow-sm hover:shadow-lg transition-all duration-300">
                    <img
                      src={image}
                      alt={label}
                      className="cover-card-image"
                      loading="lazy"
                    />
                    <div
                      className="absolute inset-0"
                      style={{
                        background: `linear-gradient(to top, oklch(0.10 0.03 260 / 0.86) 0%, ${overlay} 56%, oklch(0.10 0.02 260 / 0.12) 100%)`,
                      }}
                    />
                    <div className="cover-card-content">
                      {isLocked && (
                        <span className="mb-1 inline-flex items-center gap-1 rounded-full border border-white/40 bg-black/35 px-2 py-0.5 text-[10px] font-semibold text-white">
                          <Lock className="h-3 w-3" />
                          Entrar para abrir
                        </span>
                      )}
                      <p className="cover-card-title">{label}</p>
                      <p className="cover-card-desc hidden sm:line-clamp-2">
                        {isLocked ? "Disponível no app com login" : desc}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Compass className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Nenhum recurso encontrado para sua busca.</p>
          </div>
        )}
      </main>
    </div>
  );
}
