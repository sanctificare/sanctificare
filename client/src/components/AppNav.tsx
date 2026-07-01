import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Crown, BookOpen, Users, Home, User, ScrollText, Cross, Flame, Music, Film, Sun, CalendarCheck2, ChevronDown, CheckCircle2, Search, MoreHorizontal } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { RosaryIcon } from "@/components/RosaryIcon";
import { PrayingHandsIcon } from "@/components/PrayingHandsIcon";

const mainLinks = [
  { href: "/dashboard", label: "Início", icon: Home },
  { href: "/plano-diario", label: "Plano Diário", icon: CheckCircle2 },
  { href: "/rosario", label: "Rosário", icon: RosaryIcon },
  { href: "/oracoes", label: "Orações", icon: PrayingHandsIcon },
  { href: "/liturgia", label: "Liturgia", icon: Sun },
  { href: "/biblia", label: "Bíblia", icon: BookOpen },
  { href: "/novenas", label: "Novenas", icon: CalendarCheck2 },
];

const moreLinks = [
  { href: "/lectio", label: "Lectio Divina", icon: ScrollText },
  { href: "/via-sacra", label: "Via-Sacra", icon: Cross },
  { href: "/vela-virtual", label: "Vela Virtual", icon: Flame },
  { href: "/musica-sacra", label: "Música Sacra", icon: Music },
  { href: "/videos", label: "Vídeos", icon: Film },
  { href: "/intencoes", label: "Intenções", icon: Users },
];

const allNavLinks = [...mainLinks, ...moreLinks];

const mobilePrimaryLinks = [
  { href: "/dashboard", label: "Início", icon: Home },
  { action: "search", label: "Buscar", icon: Search },
  { href: "/plano-diario", label: "Plano", icon: CheckCircle2 },
  { href: "/perfil", label: "Perfil", icon: User },
] as const;

export default function AppNav() {
  const [location] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const { data: dailyPlan } = trpc.dailyPlan.getStatus.useQuery(undefined, { enabled: isAuthenticated });

  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase()
    : "FC";

  const isMoreLinkActive = moreLinks.some(link => location === link.href);

  return (
    <nav className="sticky top-0 z-50 bg-[oklch(0.22_0.07_260)] border-b border-[oklch(0.75_0.12_75/0.3)] shadow-lg">
      <div className="container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={isAuthenticated ? "/dashboard" : "/"}>
            <div className="flex items-center gap-3 cursor-pointer group">
              <img
                src="/assets/logo-sanctificare.webp"
                alt="Sanctificare"
                className="w-9 h-9 rounded-full object-cover"
              />
              <span className="hidden sm:inline font-display text-lg font-semibold text-[oklch(0.88_0.08_80)] tracking-wide group-hover:text-[oklch(0.95_0.06_82)] transition-colors">
                Sanctificare
              </span>
            </div>
          </Link>

          {/* Nav Desktop */}
          {isAuthenticated && (
            <div className="hidden lg:flex items-center gap-1">
              {mainLinks.map(({ href, label, icon: Icon }) => (
                <Link key={href} href={href}>
                  <button
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      location === href
                        ? "bg-[oklch(0.75_0.12_75/0.2)] text-[oklch(0.88_0.08_80)]"
                        : "text-[oklch(0.80_0.03_260)] hover:text-[oklch(0.88_0.08_80)] hover:bg-[oklch(0.75_0.12_75/0.1)]"
                    }`}
                  >
                    <Icon size={15} />
                    {label}
                  </button>
                </Link>
              ))}

              {/* Mais Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 focus:outline-none ${
                      isMoreLinkActive
                        ? "bg-[oklch(0.75_0.12_75/0.2)] text-[oklch(0.88_0.08_80)]"
                        : "text-[oklch(0.80_0.03_260)] hover:text-[oklch(0.88_0.08_80)] hover:bg-[oklch(0.75_0.12_75/0.1)]"
                    }`}
                  >
                    Mais <ChevronDown size={14} className="opacity-70" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48 bg-[oklch(0.22_0.07_260)] border border-[oklch(0.75_0.12_75/0.3)] shadow-xl text-white">
                  {moreLinks.map(({ href, label, icon: Icon }) => (
                    <DropdownMenuItem key={href} asChild className="focus:bg-[oklch(0.75_0.12_75/0.2)] focus:text-[oklch(0.88_0.08_80)]">
                      <Link href={href} className="flex items-center gap-2 w-full px-3 py-2 text-sm font-medium text-[oklch(0.80_0.03_260)]">
                        <Icon size={15} />
                        {label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          {/* Ações direita */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => window.dispatchEvent(new CustomEvent("open-global-search"))}
                  className="hidden lg:flex text-[oklch(0.80_0.03_260)] hover:text-white hover:bg-[oklch(0.75_0.12_75/0.1)] rounded-full h-9 w-9 items-center justify-center focus:outline-none"
                  title="Buscar no app (Ctrl + K)"
                >
                  <Search size={18} />
                </Button>
                <Link href="/premium">
                  <Button
                    size="sm"
                    className="hidden lg:flex items-center gap-2 bg-[oklch(0.75_0.12_75)] hover:bg-[oklch(0.70_0.13_73)] text-[oklch(0.15_0.02_260)] font-semibold text-xs tracking-wide"
                  >
                    <Crown size={13} />
                    Premium
                  </Button>
                </Link>
                {dailyPlan && (
                  <Link href="/plano-diario">
                    <div className="hidden lg:flex items-center gap-1 cursor-pointer px-3 py-1.5 rounded-full bg-[oklch(0.75_0.12_75/0.1)] border border-[oklch(0.75_0.12_75/0.2)] text-[oklch(0.75_0.12_75)] hover:bg-[oklch(0.75_0.12_75/0.2)] transition-all duration-200 text-xs font-bold font-sans">
                      <Flame size={14} fill="currentColor" className="animate-pulse" />
                      <span>{dailyPlan.streak} {dailyPlan.streak === 1 ? "dia" : "dias"}</span>
                    </div>
                  </Link>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-[oklch(0.75_0.12_75/0.5)]">
                      <Avatar className="w-8 h-8 border-2 border-[oklch(0.75_0.12_75/0.5)]">
                        <AvatarFallback className="bg-[oklch(0.35_0.08_255)] text-[oklch(0.88_0.08_80)] text-xs font-display">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <div className="px-3 py-2">
                      <p className="text-sm font-semibold truncate">{user?.name || "Usuário"}</p>
                      <p className="text-xs text-muted-foreground truncate">{user?.email || ""}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/perfil">
                        <User size={14} className="mr-2" /> Meu Perfil
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/premium">
                        <Crown size={14} className="mr-2 text-[oklch(0.70_0.12_75)]" /> Planos Premium
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={logout}
                    >
                      Sair
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Link href={getLoginUrl()}>
                <Button
                  size="sm"
                  className="bg-[oklch(0.75_0.12_75)] hover:bg-[oklch(0.70_0.13_73)] text-[oklch(0.15_0.02_260)] font-semibold text-sm"
                >
                  Entrar
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {isAuthenticated && (
        <>
          <div className="h-20 lg:hidden" />
          <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden border-t border-[oklch(0.75_0.12_75/0.3)] bg-[oklch(0.22_0.07_260/0.97)] backdrop-blur-md">
            <div className="grid grid-cols-5 px-2 py-1">
              {mobilePrimaryLinks.map((item) => {
                const isActive = "href" in item && location === item.href;
                const Icon = item.icon;

                if ("action" in item) {
                  return (
                    <button
                      key={item.action}
                      onClick={() => window.dispatchEvent(new CustomEvent("open-global-search"))}
                      className="flex h-16 flex-col items-center justify-center gap-1 rounded-xl text-[oklch(0.80_0.03_260)] transition-colors hover:text-[oklch(0.88_0.08_80)]"
                      aria-label={item.label}
                    >
                      <Icon size={19} />
                      <span className="text-[11px] font-medium leading-none">{item.label}</span>
                    </button>
                  );
                }

                return (
                  <Link key={item.href} href={item.href}>
                    <button
                      className={`flex h-16 w-full flex-col items-center justify-center gap-1 rounded-xl transition-all ${
                        isActive
                          ? "bg-[oklch(0.75_0.12_75/0.2)] text-[oklch(0.92_0.07_82)]"
                          : "text-[oklch(0.80_0.03_260)] hover:text-[oklch(0.88_0.08_80)]"
                      }`}
                    >
                      <Icon size={19} />
                      <span className="text-[11px] font-medium leading-none">{item.label}</span>
                    </button>
                  </Link>
                );
              })}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className={`flex h-16 flex-col items-center justify-center gap-1 rounded-xl transition-all ${
                      isMoreLinkActive
                        ? "bg-[oklch(0.75_0.12_75/0.2)] text-[oklch(0.92_0.07_82)]"
                        : "text-[oklch(0.80_0.03_260)] hover:text-[oklch(0.88_0.08_80)]"
                    }`}
                    aria-label="Mais"
                  >
                    <MoreHorizontal size={19} />
                    <span className="text-[11px] font-medium leading-none">Mais</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="top" align="end" className="mb-2 w-56 bg-[oklch(0.22_0.07_260)] border border-[oklch(0.75_0.12_75/0.3)] shadow-xl text-white">
                  {allNavLinks.map(({ href, label, icon: Icon }) => (
                    <DropdownMenuItem key={href} asChild className="focus:bg-[oklch(0.75_0.12_75/0.2)] focus:text-[oklch(0.88_0.08_80)]">
                      <Link href={href} className="flex items-center gap-2 w-full px-3 py-2 text-sm font-medium text-[oklch(0.80_0.03_260)]">
                        <Icon size={15} />
                        {label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator className="bg-[oklch(0.75_0.12_75/0.25)]" />
                  <DropdownMenuItem asChild>
                    <Link href="/premium" className="flex items-center gap-2 w-full px-3 py-2 text-sm font-medium text-[oklch(0.80_0.03_260)]">
                      <Crown size={15} className="text-[oklch(0.75_0.12_75)]" />
                      Planos Premium
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={logout}>
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </>
      )}
    </nav>
  );
}
