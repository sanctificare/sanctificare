import React from "react";

export function LiturgyIcon({
  size = 24,
  strokeWidth = 2,
  className = "",
  ...props
}: React.SVGProps<SVGSVGElement> & { size?: number | string; strokeWidth?: number | string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Host (Hóstia) */}
      <circle cx="12" cy="7" r="4.5" />
      {/* Tiny Cross inside the Host */}
      <line x1="12" y1="4.5" x2="12" y2="9.5" />
      <line x1="9.5" y1="7" x2="14.5" y2="7" />

      {/* Chalice Cup (Cálice) */}
      <path d="M 6.5,13 L 17.5,13" />
      <path d="M 6.5,13 C 6.5,17.5 10,18.5 12,18.5 C 14,18.5 17.5,17.5 17.5,13" />
      
      {/* Stem (Haste) */}
      <line x1="12" y1="18.5" x2="12" y2="22" />
      
      {/* Base */}
      <path d="M 8.5,22 C 10,21 14,21 15.5,22" />
    </svg>
  );
}
