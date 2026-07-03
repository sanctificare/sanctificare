import React from "react";

export function PrayingHandsIcon({
  size = 24,
  className = "",
  ...props
}: React.SVGProps<SVGSVGElement> & { size?: number | string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Symmetrical Praying Hands (Pressed Palms) */}
      <path d="M12 3c0 0-3.5 4-3.5 9c0 4.5 2.5 6.5 3.5 8.5" />
      <path d="M12 3c0 0 3.5 4 3.5 9c0 4.5-2.5 6.5-3.5 8.5" />
      
      {/* Contact Line */}
      <line x1="12" y1="3" x2="12" y2="17" />
      
      {/* Sleeves / Cuff details */}
      <path d="M8 21h8" />
      <path d="M9.5 21v2" />
      <path d="M14.5 21v2" />
    </svg>
  );
}
