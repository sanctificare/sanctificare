import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import AppNav from "@/components/AppNav";
import { trpc } from "@/lib/trpc";
import { Heart, BookOpen, Sun, Crown, ChevronRight, Clock } from "lucide-react";
import { RosaryIcon } from "@/components/RosaryIcon";

const LOGO_IMG = "/assets/sanctificare-logo.webp";

const quickLinks = [
  { href: "/rosario", label: "Rosário", desc: "Reze o Terço completo", image: "/assets/dashboard/rosario.png", overlay: "oklch(0.22 0.08 260 / 0.60)" },
  { href: "/oracoes", label: "Orações", desc: "Orações da tradição", image: "/assets/dashboard/oracoes.png", overlay: "oklch(0.28 0.08 145 / 0.60)" },
  { href: "/lectio", label: "Lectio Divina", desc: "Leitura orante", image: "/assets/dashboard/lectio.png", overlay: "oklch(0.32 0.11 240 / 0.60)" },
  { href: "/via-sacra", label: "Via-Sacra", desc: "14 estações com guia", image: "/assets/dashboard/via-sacra.png", overlay: "oklch(0.36 0.15 20 / 0.60)" },
  { href: "/vela-virtual", label: "Vela Virtual", desc: "Silêncio e oração", image: "/assets/dashboard/vela-virtual.png", overlay: "oklch(0.50 0.10 85 / 0.56)" },
  { href: "/musica-sacra", label: "Música Sacra", desc: "Meditação e contemplação", image: "/assets/dashboard/musica-sacra.png", overlay: "oklch(0.34 0.10 300 / 0.58)" },
  { href: "/biblia", label: "Bíblia Sagrada", desc: "Percorra as Escrituras", image: "/assets/dashboard/biblia.png", overlay: "oklch(0.26 0.08 230 / 0.62)" },
  { href: "/videos", label: "Vídeos", desc: "Histórias e passagens com IA", image: "/assets/dashboard/videos.png", overlay: "oklch(0.40 0.12 15 / 0.60)" },
  { href: "/intencoes", label: "Intenções", desc: "Ore com a comunidade", image: "/assets/dashboard/intencoes.png", overlay: "oklch(0.30 0.10 190 / 0.60)" },
];

function getDayOfWeek() {
  const days = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
  return days[new Date().getDay()];
}

function getFormattedDate() {
  return new Date().toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" });
}

function getMystery() {
  const day = new Date().getDay();
  const mysteries: Record<number, string> = {
    0: "Mistérios Gloriosos",
    1: "Mistérios Gozosos",
    2: "Mistérios Dolorosos",
    3: "Mistérios Gloriosos",
    4: "Mistérios Luminosos",
    5: "Mistérios Dolorosos",
    6: "Mistérios Gozosos",
  };
  return mysteries[day] || "Mistérios Gozosos";
}

export default function Dashboard() {
  const { user, isAuthenticated, loading } = useAuth();
  const { data: logs } = trpc.prayers.getRecentLogs.useQuery(undefined, { enabled: isAuthenticated });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <img src={LOGO_IMG} alt="Sanctificare" className="w-16 h-16 rounded-full animate-pulse" />
          <p className="font-serif text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <img src={LOGO_IMG} alt="Sanctificare" className="w-16 h-16 rounded-full mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold mb-2">Acesso Restrito</h2>
          <p className="text-muted-foreground mb-6">Entre para retomar sua jornada de oração no app.</p>
          <a href={getLoginUrl()}>
            <Button className="bg-[oklch(0.22_0.07_260)] text-white">Entrar</Button>
          </a>
        </div>
      </div>
    );
  }

  const firstName = user?.name?.split(" ")[0] || "Fiel";

  return (
    <div className="min-h-screen bg-[oklch(0.97_0.01_85)]">
      <AppNav />

      <main className="container py-8">
        {/* Saudação */}
        <div className="mb-8 animate-fade-in">
          <div className="bg-[oklch(0.22_0.07_260)] rounded-2xl p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-pattern-cross opacity-20" />
            <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <p className="text-[oklch(0.70_0.03_260)] text-sm font-medium mb-1">{getDayOfWeek()}, {getFormattedDate()}</p>
                <h1 className="font-display text-3xl font-bold text-white mb-2">
                  Bem-vindo, {firstName}
                </h1>
                <p className="font-serif text-[oklch(0.80_0.02_260)] text-base">
                  Hoje a Igreja contempla os <span className="text-[oklch(0.82_0.10_80)] font-semibold">{getMystery()}</span>
                </p>
              </div>
              <div className="flex gap-3">
                <Link href="/rosario">
                  <Button className="bg-[oklch(0.75_0.12_75)] hover:bg-[oklch(0.70_0.13_73)] text-[oklch(0.15_0.02_260)] font-semibold">
                    <RosaryIcon size={15} className="mr-2" />
                    Rezar o Rosário
                  </Button>
                </Link>
                <Link href="/liturgia">
                  <Button variant="outline" className="border-[oklch(0.75_0.12_75/0.4)] text-white hover:bg-[oklch(0.75_0.12_75/0.1)] bg-transparent">
                    <Sun size={15} className="mr-2" />
                    Liturgia
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Acesso Rápido */}
        <div className="mb-8">
          <h2 className="font-display text-xl font-bold text-[oklch(0.22_0.07_260)] mb-4">Acesso Rápido</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {quickLinks.map(({ href, label, desc, image, overlay }) => (
              <Link key={href} href={href}>
                <div className="cover-card group cursor-pointer">
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
                    <p className="cover-card-desc">{desc}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Versículo do Dia + Histórico */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Versículo */}
          <div className="lg:col-span-2 prayer-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen size={16} className="text-[oklch(0.65_0.14_70)]" />
              <h3 className="font-display text-sm font-semibold text-[oklch(0.22_0.07_260)] uppercase tracking-wide">
                Versículo do Dia
              </h3>
            </div>
            <div className="divider-gold mb-4" />
            <blockquote className="font-serif text-xl italic text-[oklch(0.25_0.03_260)] leading-relaxed mb-3">
              "Tudo posso naquele que me fortalece."
            </blockquote>
            <p className="text-sm font-semibold text-[oklch(0.65_0.14_70)]">Filipenses 4:13</p>
            <div className="mt-6">
              <Link href="/liturgia">
                <Button variant="outline" size="sm" className="text-[oklch(0.22_0.07_260)] border-[oklch(0.22_0.07_260/0.3)]">
                  Ver Liturgia do Dia
                  <ChevronRight size={14} className="ml-1" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Histórico recente */}
          <div className="prayer-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock size={16} className="text-[oklch(0.40_0.10_260)]" />
              <h3 className="font-display text-sm font-semibold text-[oklch(0.22_0.07_260)] uppercase tracking-wide">
                Orações Recentes
              </h3>
            </div>
            <div className="divider-gold mb-4" />
            {logs && logs.length > 0 ? (
              <div className="space-y-3">
                {logs.slice(0, 5).map((log: any) => (
                  <div key={log.id} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[oklch(0.22_0.07_260/0.08)] flex items-center justify-center flex-shrink-0">
                      <Heart size={13} className="text-[oklch(0.55_0.14_15)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{log.prayerName}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(log.completedAt).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <Heart size={28} className="text-muted-foreground mx-auto mb-2 opacity-40" />
                <p className="text-sm text-muted-foreground">Nenhuma oração foi registrada ainda.</p>
                <Link href="/oracoes">
                  <Button size="sm" variant="outline" className="mt-3 text-xs">
                    Começar a rezar
                  </Button>
                </Link>
              </div>
            )}
            {logs && logs.length > 0 && (
              <Link href="/perfil">
                <Button variant="outline" size="sm" className="w-full mt-4 text-xs">
                  Ver histórico completo
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Banner Premium */}
        <div className="mt-6 rounded-2xl bg-gradient-to-r from-[oklch(0.22_0.07_260)] to-[oklch(0.30_0.09_255)] p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[oklch(0.75_0.12_75/0.2)] border border-[oklch(0.75_0.12_75/0.4)] flex items-center justify-center">
              <Crown size={22} className="text-[oklch(0.82_0.10_80)]" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-white">Aprofunde sua vida de oração</h3>
              <p className="text-sm text-[oklch(0.75_0.03_260)]">Novenas, meditações e áudios para acompanhar com mais constância a sua caminhada espiritual</p>
            </div>
          </div>
          <Link href="/premium">
            <Button className="bg-[oklch(0.75_0.12_75)] hover:bg-[oklch(0.70_0.13_73)] text-[oklch(0.15_0.02_260)] font-semibold whitespace-nowrap">
              Conhecer planos
              <ChevronRight size={15} className="ml-1" />
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
