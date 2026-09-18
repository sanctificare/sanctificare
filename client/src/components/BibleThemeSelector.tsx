import { cn } from "@/lib/utils";

export type BibleReadingTheme = "light" | "sepia" | "dark" | "system";

const OPTIONS: { value: BibleReadingTheme; label: string }[] = [
  { value: "light", label: "Claro" },
  { value: "sepia", label: "Sépia" },
  { value: "dark", label: "Escuro" },
  { value: "system", label: "Auto" },
];

interface BibleThemeSelectorProps {
  value: BibleReadingTheme;
  onChange: (theme: BibleReadingTheme) => void;
  className?: string;
}

// Always-visible reading theme switch. The Bible ignores the app-wide
// light/dark toggle; "Auto" follows the device setting.
export function BibleThemeSelector({ value, onChange, className }: BibleThemeSelectorProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Tema:</span>
      <div role="radiogroup" aria-label="Tema de leitura" className="inline-flex rounded-full border border-border bg-card p-0.5 shadow-sm">
        {OPTIONS.map((option) => {
          const isActive = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={isActive}
              onClick={() => onChange(option.value)}
              className={cn(
                "min-h-9 rounded-full px-3 text-xs font-semibold transition-colors sm:px-4",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
