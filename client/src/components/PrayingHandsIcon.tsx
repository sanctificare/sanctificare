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
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Center dividing line where index fingers/palms touch */}
      <line x1="12" y1="3" x2="12" y2="17" />

      {/* Diverging wrists at the bottom */}
      <path d="M 12,17 C 11,19.5 10,21.5 9,23" />
      <path d="M 12,17 C 13,19.5 14,21.5 15,23" />

      {/* Left Hand Contours */}
      <path d="M 3,20 C 4.5,18 7,14 7,10 C 7,6 9.5,3 12,3" />
      <path d="M 5,21.5 C 6.2,19.5 8.5,16 8.5,12 C 8.5,8.5 10.2,6 12,6" />
      <path d="M 7.5,22.5 C 8.5,20.8 10,17.5 10,14 C 10,11.2 11,9 12,9" />

      {/* Right Hand Contours */}
      <path d="M 21,20 C 19.5,18 17,14 17,10 C 17,6 14.5,3 12,3" />
      <path d="M 19,21.5 C 17.8,19.5 15.5,16 15.5,12 C 15.5,8.5 13.8,6 12,6" />
      <path d="M 16.5,22.5 C 15.5,20.8 14,17.5 14,14 C 14,11.2 13,9 12,9" />
    </svg>
  );
}
