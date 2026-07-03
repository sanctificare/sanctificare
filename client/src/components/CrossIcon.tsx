import React from "react";

export function Cross({
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
      <line x1="12" y1="4" x2="12" y2="20" />
      <line x1="8" y1="9" x2="16" y2="9" />
    </svg>
  );
}
