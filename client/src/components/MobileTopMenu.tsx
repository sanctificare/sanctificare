import { useState } from "react";
import { Search, Calendar, Menu, X } from "lucide-react";
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
    <>
      {/* Hamburger button - top right corner */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 right-4 z-50 p-2 rounded-lg text-white hover:bg-[oklch(0.18_0.04_260/0.5)] transition-colors"
        aria-label="Menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Dropdown menu */}
      {isOpen && (
        <div className="lg:hidden fixed top-14 right-4 z-50 w-48 rounded-lg bg-[oklch(0.12_0.03_260/0.96)] border border-[oklch(0.75_0.12_75/0.25)] shadow-lg backdrop-blur-xl overflow-hidden">
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
    </>
  );
}
