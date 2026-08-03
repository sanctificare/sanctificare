import { GOOGLE_PLAY_URL } from "@/components/GooglePlayBanner";

interface GooglePlayBadgeProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function GooglePlayLogo({ className = "h-6 w-auto" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M99.5 28.5C92 33 87.5 41 87.5 50V462C87.5 471 92 479 99.5 483.5L304 256L99.5 28.5Z" fill="#00D2FF"/>
      <path d="M304 256L99.5 483.5C104.5 486.5 110.5 488 116.5 488C123 488 129.5 486 135 482.5L383 339.5L304 256Z" fill="#00F076"/>
      <path d="M383 172.5L135 29.5C129.5 26 123 24 116.5 24C110.5 24 104.5 25.5 99.5 28.5L304 256L383 172.5Z" fill="#FF3A44"/>
      <path d="M424.5 231.5L383 172.5L304 256L383 339.5L424.5 280.5C437.5 273 444 264.5 444 256C444 247.5 437.5 239 424.5 231.5Z" fill="#FFC107"/>
    </svg>
  );
}

export default function GooglePlayBadge({ size = "md", className = "" }: GooglePlayBadgeProps) {
  const sizeClasses = {
    sm: "px-3 py-1.5 rounded-lg gap-2",
    md: "px-4 py-2 rounded-xl gap-3",
    lg: "px-5 py-2.5 rounded-xl gap-3.5",
  }[size];

  const iconSizes = {
    sm: "h-5 w-auto",
    md: "h-6 w-auto",
    lg: "h-8 w-auto",
  }[size];

  const subtextSizes = {
    sm: "text-[8px]",
    md: "text-[9.5px]",
    lg: "text-[11px]",
  }[size];

  const titleSizes = {
    sm: "text-xs font-bold",
    md: "text-sm sm:text-base font-extrabold",
    lg: "text-base sm:text-lg font-extrabold",
  }[size];

  return (
    <a
      href={GOOGLE_PLAY_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Disponível no Google Play"
      className={`inline-flex items-center bg-black hover:bg-neutral-900 text-white border border-neutral-700/80 hover:border-neutral-500 shadow-md hover:scale-[1.03] transition-all duration-200 select-none group cursor-pointer ${sizeClasses} ${className}`}
    >
      <GooglePlayLogo className={`${iconSizes} shrink-0 transition-transform group-hover:scale-105`} />
      <div className="flex flex-col text-left leading-tight justify-center">
        <span className={`${subtextSizes} uppercase font-semibold text-neutral-300 tracking-wider`}>
          DISPONÍVEL NO
        </span>
        <span className={`${titleSizes} tracking-wide text-white font-sans`}>
          Google Play
        </span>
      </div>
    </a>
  );
}
