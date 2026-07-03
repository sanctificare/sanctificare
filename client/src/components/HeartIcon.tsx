import React from "react";

export function Heart({
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
      {/* Sacred Heart Cross on top */}
      <line x1="12" y1="1.5" x2="12" y2="7.5" />
      <line x1="9.5" y1="3.5" x2="14.5" y2="3.5" />

      {/* Shifted & Scaled Heart */}
      <path 
        d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" 
        transform="translate(1.8, 3.8) scale(0.85)"
      />
    </svg>
  );
}
