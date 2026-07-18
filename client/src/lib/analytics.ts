import { Capacitor } from "@capacitor/core";
import { isMobileApp } from "@/const";

type AnalyticsParams = Record<string, string | number | boolean | null | undefined>;

const GA_MEASUREMENT_ID = (import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined)?.trim();
const GTAG_SCRIPT_ID = "sanctificare-ga-script";

let webInitialized = false;
let nativeInitialized = false;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const isAndroidNative = () => isMobileApp() && Capacitor.getPlatform() === "android";

const sanitizeEventName = (name: string) =>
  name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_")
    .replace(/_+/g, "_")
    .slice(0, 40);

const cleanParams = (params: AnalyticsParams = {}) => {
  const output: Record<string, string | number | boolean | null> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue;
    output[key] = value;
  }
  return output;
};

const initWebAnalytics = (): boolean => {
  if (webInitialized) return true;
  if (typeof window === "undefined") return false;
  if (!GA_MEASUREMENT_ID) return false;

  const existingScript = document.getElementById(GTAG_SCRIPT_ID);
  if (!existingScript) {
    const script = document.createElement("script");
    script.id = GTAG_SCRIPT_ID;
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);
  }

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag(...args: unknown[]) {
    window.dataLayer?.push(args);
  };

  window.gtag("js", new Date());
  window.gtag("config", GA_MEASUREMENT_ID, { send_page_view: false });
  webInitialized = true;
  return true;
};

const initNativeAnalytics = async (): Promise<boolean> => {
  if (nativeInitialized) return true;
  if (!isAndroidNative()) return false;

  try {
    const { FirebaseAnalytics } = await import("@capacitor-firebase/analytics");
    await FirebaseAnalytics.setEnabled({ enabled: true });
    nativeInitialized = true;
    return true;
  } catch (err) {
    console.warn("[Analytics] Native initialization failed:", err);
    return false;
  }
};

export const initAnalytics = async () => {
  if (isAndroidNative()) {
    await initNativeAnalytics();
    return;
  }

  initWebAnalytics();
};

export const trackPageView = async (path: string) => {
  const screenName = path || "/";

  if (isAndroidNative()) {
    if (!(await initNativeAnalytics())) return;
    try {
      const { FirebaseAnalytics } = await import("@capacitor-firebase/analytics");
      await FirebaseAnalytics.setCurrentScreen({
        screenName,
        screenClassOverride: "MainActivity",
      });
    } catch (err) {
      console.warn("[Analytics] Failed to track native screen:", err);
    }
    return;
  }

  if (!initWebAnalytics()) return;
  window.gtag?.("event", "page_view", {
    page_path: path,
    page_title: document.title,
    page_location: window.location.href,
  });
};

export const trackEvent = async (name: string, params?: AnalyticsParams) => {
  const eventName = sanitizeEventName(name);
  if (!eventName) return;

  if (isAndroidNative()) {
    if (!(await initNativeAnalytics())) return;
    try {
      const { FirebaseAnalytics } = await import("@capacitor-firebase/analytics");
      await FirebaseAnalytics.logEvent({
        name: eventName,
        params: cleanParams(params),
      });
    } catch (err) {
      console.warn("[Analytics] Failed to track native event:", err);
    }
    return;
  }

  if (!initWebAnalytics()) return;
  window.gtag?.("event", eventName, cleanParams(params));
};

export const setAnalyticsUserId = async (userId: string | null) => {
  if (isAndroidNative()) {
    if (!(await initNativeAnalytics())) return;
    try {
      const { FirebaseAnalytics } = await import("@capacitor-firebase/analytics");
      await FirebaseAnalytics.setUserId({ userId });
    } catch (err) {
      console.warn("[Analytics] Failed to set native userId:", err);
    }
    return;
  }

  if (!initWebAnalytics()) return;
  if (!GA_MEASUREMENT_ID) return;

  window.gtag?.("config", GA_MEASUREMENT_ID, {
    user_id: userId ?? undefined,
  });
};
