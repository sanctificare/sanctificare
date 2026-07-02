import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Search, Compass, Heart, BookOpen, Flame, Calendar, Users, Sun, Cross, Music, Play, HelpCircle, CheckCircle2, ChevronRight } from "lucide-react";
import { RosaryIcon } from "@/components/RosaryIcon";

const LOGO_IMG = "/assets/logo-sanctificare.webp";

const exploreCards = [
  { href: "/plano-diario", label: "Plano Diário", desc: "Suas metas espirituais", image: "/assets/dashboard/plano-diario.png", overlay: "oklch(0.25 0.09 75 / 0.60)", category: "Práticas" },
  { href: "/rosario", label: "Rosário", desc: "Reze o Terço completo", image: "/assets/dashboard/rosario.png", overlay: "oklch(0.22 0.08 260 / 0.60)", category: "Devocional" },
  { href: "/oracoes", label: "Orações", desc: "Orações da tradição", image: "/assets/dashboard/oracoes.png", overlay: "oklch(0.28 0.08 145 / 0.60)", category: "Devocional" },
  { href: "/lectio", label: "Lectio Divina", desc: "Leitura orante", image: "/assets/dashboard/lectio.png", overlay: "oklch(0.32 0.11 240 / 0.60)", category: "Estudo" },
  { href: "/via-sacra", label: "Via-Sacra", desc: "14 estações com guia", image: "/assets/dashboard/via-sacra.png", overlay: "oklch(0.36 0.15 20 / 0.60)", category: "Devocional" },
  { href: "/vela-virtual", label: "Vela Virtual", desc: "Silêncio e oração", image: "/assets/dashboard/vela-virtual.png", overlay: "oklch(0.50 0.10 85 / 0.56)", category: "Práticas" },
  { href: "/musica-sacra", label: "Música Sacra", desc: "Meditação e contemplação", image: "/assets/dashboard/musica-sacra.png", overlay: "oklch(0.34 0.10 300 / 0.58)", category: "Práticas" },
  { href: "/novenas", label: "Novenas", desc: "Jornadas de 9 dias de devoção", image: "/assets/dashboard/novenas.png", overlay: "oklch(0.28 0.08 260 / 0.60)", category: "Devocional" },
  { href: "/videos", label: "Vídeos", desc: "Histórias e passagens com IA", image: "/assets/dashboard/videos.png", overlay: "oklch(0.40 0.12 15 / 0.60)", category: "Estudo" },
  { href: "/intencoes", label: "Intenções", desc: "Ore com a comunidade", image: "/assets/dashboard/intencoes.png", overlay: "oklch(0.30 0.10 190 / 0.60)", category: "Comunidade" },
  { href: "/liturgia", label: "Liturgia", desc: "Leituras e salmo do dia", image: "/assets/dashboard/liturgia.png", overlay: "oklch(0.40 0.15 80 / 0.60)", category: "Estudo" },
  { href: "/biblia", label: "Bíblia Sagrada", desc: "Os 73 livros das Escrituras", image: "/assets/dashboard/biblia.png", overlay: "oklch(0.35 0.10 40 / 0.60)", category: "Estudo" },
];

export default function Explore() {
  const { isAuthenticated, loading } = useAuth();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <img src={LOGO_IMG} alt="Sanctificare" className="w-16 h-16 object-contain animate-pulse" />
          <p className="font-serif text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <img src={LOGO_IMG} alt="Sanctificare" className="w-16 h-16 object-contain mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold mb-2">Acesso Restrito</h2>
          <p className="text-muted-foreground mb-6">Entre para explorar os recursos de oração no app.</p>
          <a href={getLoginUrl()}>
            <Button className="bg-[oklch(0.22_0.07_260)] text-white">Entrar</Button>
          </a>
        </div>
      </div>
    );
  }

  const categories = ["Todos", "Devocional", "Estudo", "Práticas", "Comunidade"];

  const filteredCards = exploreCards.filter(card => {
    const matchesSearch = card.label.toLowerCase().includes(search.toLowerCase()) || 
                          card.desc.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !selectedCategory || selectedCategory === "Todos" || card.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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

        {/* Search & Filter Bar */}
        <div className="mb-8 flex flex-col md:flex-row items-center justify-between gap-4 bg-white/60 dark:bg-[oklch(0.17_0.04_260/0.4)] backdrop-blur-md border border-border/40 p-4 rounded-xl shadow-sm">
          <div className="relative w-full md:max-w-xs">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar prática ou recurso..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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
            {filteredCards.map(({ href, label, desc, image, overlay }) => (
              <Link key={href} href={href}>
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
                    <p className="cover-card-title">{label}</p>
                    <p className="cover-card-desc hidden sm:line-clamp-2">{desc}</p>
                  </div>
                </div>
              </Link>
            ))}
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
