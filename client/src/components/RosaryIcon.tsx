import React from "react";

export function RosaryIcon({
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
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Upper loop chain connecting line */}
      <circle cx="12" cy="7.5" r="5" stroke="currentColor" strokeWidth="0.7" strokeDasharray="1.2 1.2" fill="none" opacity="0.45" />

      {/* Drop chain connecting line */}
      <line x1="12" y1="16.2" x2="12" y2="19.4" stroke="currentColor" strokeWidth="0.9" opacity="0.5" />

      {/* Large beads (Our Father / Mistérios) */}
      <circle cx="12" cy="2.5" r="1.05" fill="currentColor" />
      <circle cx="16.33" cy="5.0" r="1.05" fill="currentColor" />
      <circle cx="16.33" cy="10.0" r="1.05" fill="currentColor" />
      <circle cx="7.67" cy="10.0" r="1.05" fill="currentColor" />
      <circle cx="7.67" cy="5.0" r="1.05" fill="currentColor" />

      {/* Small beads (Hail Mary / Ave Maria) */}
      <circle cx="13.71" cy="2.8" r="0.65" fill="currentColor" />
      <circle cx="15.21" cy="3.67" r="0.65" fill="currentColor" />
      <circle cx="16.92" cy="6.63" r="0.65" fill="currentColor" />
      <circle cx="16.92" cy="8.37" r="0.65" fill="currentColor" />
      <circle cx="15.21" cy="11.33" r="0.65" fill="currentColor" />
      <circle cx="13.71" cy="12.2" r="0.65" fill="currentColor" />
      <circle cx="10.29" cy="12.2" r="0.65" fill="currentColor" />
      <circle cx="8.79" cy="11.33" r="0.65" fill="currentColor" />
      <circle cx="7.08" cy="8.37" r="0.65" fill="currentColor" />
      <circle cx="7.08" cy="6.63" r="0.65" fill="currentColor" />
      <circle cx="8.79" cy="3.67" r="0.65" fill="currentColor" />
      <circle cx="10.29" cy="2.8" r="0.65" fill="currentColor" />

      {/* Central Medal (ellipse representing Mary's medal) */}
      <ellipse cx="12" cy="14.3" rx="1.7" ry="2.1" stroke="currentColor" strokeWidth="1.1" fill="none" />
      {/* Highly stylized silhouette of Mary's profile/head inside the medal */}
      <path d="M 12.3,13.4 C 11.9,13.4 11.6,13.7 11.6,14.2 C 11.6,14.7 11.8,14.9 12.2,15.0" stroke="currentColor" strokeWidth="0.6" strokeLinecap="round" fill="none" />

      {/* Drop Beads */}
      <circle cx="12" cy="17.1" r="0.65" fill="currentColor" />
      <circle cx="12" cy="18.4" r="0.65" fill="currentColor" />

      {/* Latin Cross at the bottom, slightly thicker for crisp rendering */}
      <path
        d="M 11.4,19.4 H 12.6 V 20.4 H 13.8 V 21.2 H 12.6 V 23.6 H 11.4 V 21.2 H 10.2 V 20.4 H 11.4 Z"
        stroke="currentColor"
        strokeWidth="0.8"
        fill="currentColor"
        strokeLinejoin="miter"
      />
    </svg>
  );
}
