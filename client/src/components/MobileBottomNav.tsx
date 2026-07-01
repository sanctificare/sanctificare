import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { BookOpen, Home, Sun, CalendarCheck2, User } from "lucide-react";
import { RosaryIcon } from "@/components/RosaryIcon";

const mobileLinks = [
  { href: "/dashboard", label: "Início", icon: Home },
  { href: "/rosario", label: "Rosário", icon: RosaryIcon },
  { href: "/biblia", label: "Bíblia", icon: BookOpen },
  { href: "/liturgia", label: "Liturgia", icon: Sun },
  { href: "/novenas", label: "Novenas", icon: CalendarCheck2 },
  { href: "/profile", label: "Perfil", icon: User },
] as const;

function isActiveRoute(location: string, href: string) {
  if (href === "/dashboard") return location === href;
  return location === href || location.startsWith(`${href}/`);
}

export default function MobileBottomNav() {
  const [location] = useLocation();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) return null;

  return (
    <>
      <div className="h-[calc(5rem+env(safe-area-inset-bottom))] lg:hidden" />
      <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden border-t border-[oklch(0.75_0.12_75/0.25)] bg-[oklch(0.12_0.03_260/0.96)] text-white shadow-[0_-12px_30px_oklch(0.08_0.02_260/0.22)] backdrop-blur-xl pb-[env(safe-area-inset-bottom)]">
        <div className="grid grid-cols-6 px-2 py-1.5 gap-0.5">
          {mobileLinks.map((item) => {
            const isActive = isActiveRoute(location, item.href);
            const Icon = item.icon;

            return (
              <Link key={item.href} href={item.href}>
                <button
                  aria-current={isActive ? "page" : undefined}
                  className={`flex h-[3.75rem] w-full flex-col items-center justify-center gap-1 rounded-xl transition-all ${
                    isActive
                      ? "bg-white text-[oklch(0.18_0.04_260)] shadow-sm"
                      : "text-[oklch(0.78_0.03_260)] hover:text-white"
                  }`}
                >
                  <Icon size={20} className={isActive ? "scale-105" : ""} />
                  <span className={`text-[10px] leading-none ${isActive ? "font-bold" : "font-medium"}`}>
                    {item.label}
                  </span>
                </button>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}