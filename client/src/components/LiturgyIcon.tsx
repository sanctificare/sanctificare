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
      {/* Book cover outline */}
      <path d="M 6,3 L 17,3 C 18.1,3 19,3.9 19,5 L 19,19 C 19,20.1 18.1,21 17,21 L 6,21 C 5.4,21 5,20.6 5,20 L 5,4 C 5,3.4 5.4,3 6,3 Z" />
      {/* Book spine line */}
      <line x1="8" y1="3" x2="8" y2="21" />
      
      {/* Latin Cross on the cover */}
      <line x1="13.5" y1="7" x2="13.5" y2="17" />
      <line x1="11" y1="10.5" x2="16" y2="10.5" />
    </svg>
  );
}
