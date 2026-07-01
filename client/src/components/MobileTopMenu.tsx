import { useState } from "react";
import { Search, Calendar, ChevronDown } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";

export default function MobileTopMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) return null;

  const handleSearch = () => {
    window.dispatchEvent(new CustomEvent("open-global-search"));
    setIsOpen(false);
  };

  return (
    <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[oklch(0.12_0.03_260/0.96)] border-b border-[oklch(0.75_0.12_75/0.25)] backdrop-blur-xl">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between text-white hover:bg-[oklch(0.18_0.04_260/0.5)] transition-colors"
      >
        <span className="text-sm font-medium">Menu</span>
        <ChevronDown
          size={20}
          className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="border-t border-[oklch(0.75_0.12_75/0.25)] bg-[oklch(0.16_0.03_260/0.98)]">
          <button
            onClick={handleSearch}
            className="w-full px-4 py-3 flex items-center gap-3 text-[oklch(0.78_0.03_260)] hover:text-white hover:bg-[oklch(0.18_0.04_260/0.5)] transition-colors border-b border-[oklch(0.75_0.12_75/0.25)]"
          >
            <Search size={18} />
            <span className="text-sm font-medium">Busca</span>
          </button>

          <a
            href="/plano-diario"
            onClick={() => setIsOpen(false)}
            className="w-full px-4 py-3 flex items-center gap-3 text-[oklch(0.78_0.03_260)] hover:text-white hover:bg-[oklch(0.18_0.04_260/0.5)] transition-colors"
          >
            <Calendar size={18} />
            <span className="text-sm font-medium">Plano Diário</span>
          </a>
        </div>
      )}
    </div>
  );
}
