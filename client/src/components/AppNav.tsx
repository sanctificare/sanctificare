import { useState } from "react";
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
import { Menu, X, Crown, BookOpen, Heart, Users, Home, User, ScrollText, Radio, Cross, Flame, Music } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { RosaryIcon } from "@/components/RosaryIcon";
import { PrayingHandsIcon } from "@/components/PrayingHandsIcon";

const navLinks = [
  { href: "/dashboard", label: "Início", icon: Home },
  { href: "/rosario", label: "Rosário", icon: RosaryIcon },
  { href: "/oracoes", label: "Orações", icon: PrayingHandsIcon },
  { href: "/lectio", label: "Lectio Divina", icon: ScrollText },
  { href: "/quando-deus-fala", label: "Quando Deus Fala", icon: Radio },
  { href: "/via-sacra", label: "Via-Sacra", icon: Cross },
  { href: "/vela-virtual", label: "Vela Virtual", icon: Flame },
  { href: "/musica-sacra", label: "Música Sacra", icon: Music },
  { href: "/biblia", label: "Bíblia", icon: BookOpen },
  { href: "/intencoes", label: "Intenções", icon: Users },
];

export default function AppNav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [location] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase()
    : "FC";

  return (
    <nav className="sticky top-0 z-50 bg-[oklch(0.22_0.07_260)] border-b border-[oklch(0.75_0.12_75/0.3)] shadow-lg">
      <div className="container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={isAuthenticated ? "/dashboard" : "/"}>
            <div className="flex items-center gap-3 cursor-pointer group">
              <img
                src="/assets/sanctificare-logo.webp"
                alt="Sanctificare"
                className="w-9 h-9 rounded-full object-cover"
              />
              <span className="font-display text-lg font-semibold text-[oklch(0.88_0.08_80)] tracking-wide group-hover:text-[oklch(0.95_0.06_82)] transition-colors">
                Sanctificare
              </span>
            </div>
          </Link>

          {/* Nav Desktop */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(({ href, label, icon: Icon }) => (
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
            </div>
          )}

          {/* Ações direita */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link href="/premium">
                  <Button
                    size="sm"
                    className="hidden md:flex items-center gap-2 bg-[oklch(0.75_0.12_75)] hover:bg-[oklch(0.70_0.13_73)] text-[oklch(0.15_0.02_260)] font-semibold text-xs tracking-wide"
                  >
                    <Crown size={13} />
                    Premium
                  </Button>
                </Link>
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
                    <DropdownMenuItem asChild>
                      <Link href="/temas">
                        <span className="mr-2">🎨</span> Personalizar Temas
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
              <a href={getLoginUrl()}>
                <Button
                  size="sm"
                  className="bg-[oklch(0.75_0.12_75)] hover:bg-[oklch(0.70_0.13_73)] text-[oklch(0.15_0.02_260)] font-semibold text-sm"
                >
                  Entrar
                </Button>
              </a>
            )}

            {/* Mobile menu toggle */}
            {isAuthenticated && (
              <button
                className="md:hidden text-[oklch(0.80_0.03_260)] hover:text-[oklch(0.88_0.08_80)] p-1"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        {isAuthenticated && mobileOpen && (
          <div className="md:hidden border-t border-[oklch(0.75_0.12_75/0.2)] py-3 animate-fade-in">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href}>
                <button
                  className={`flex items-center gap-3 w-full px-4 py-3 text-sm font-medium transition-colors ${
                    location === href
                      ? "text-[oklch(0.88_0.08_80)] bg-[oklch(0.75_0.12_75/0.15)]"
                      : "text-[oklch(0.75_0.03_260)] hover:text-[oklch(0.88_0.08_80)]"
                  }`}
                  onClick={() => setMobileOpen(false)}
                >
                  <Icon size={16} />
                  {label}
                </button>
              </Link>
            ))}
            <div className="px-4 pt-2 pb-1">
              <Link href="/premium">
                <Button
                  size="sm"
                  className="w-full bg-[oklch(0.75_0.12_75)] hover:bg-[oklch(0.70_0.13_73)] text-[oklch(0.15_0.02_260)] font-semibold"
                  onClick={() => setMobileOpen(false)}
                >
                  <Crown size={14} className="mr-2" /> Assinar Premium
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
