import { useEffect, useState } from "react";

// The Android app pins its native theme to light, so the WebView always reports
// prefers-color-scheme: light. MainActivity exposes the real system setting.
type SanctificareSystemBridge = { isSystemDark?: () => boolean };

const DARK_QUERY = "(prefers-color-scheme: dark)";

function readSystemDark(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const bridge = (window as unknown as { SanctificareSystem?: SanctificareSystemBridge }).SanctificareSystem;
    if (typeof bridge?.isSystemDark === "function") return bridge.isSystemDark();
  } catch {
    // Fall back to the media query below.
  }
  return window.matchMedia?.(DARK_QUERY).matches ?? false;
}

export function useSystemDarkMode() {
  const [isDark, setIsDark] = useState(readSystemDark);

  useEffect(() => {
    const update = () => setIsDark(readSystemDark());
    const media = window.matchMedia?.(DARK_QUERY);
    media?.addEventListener("change", update);
    // The native bridge has no change event; re-read when the app returns.
    document.addEventListener("visibilitychange", update);
    return () => {
      media?.removeEventListener("change", update);
      document.removeEventListener("visibilitychange", update);
    };
  }, []);

  return isDark;
}
