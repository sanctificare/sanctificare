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

// ── Rastreamento próprio (servidor do Sanctificare) ──
// Além do GA/Firebase, guardamos no nosso banco a origem do cadastro e o uso de
// recursos, para exibir no painel administrativo.

type AppPlatform = "android" | "ios" | "web";

type StoredAttribution = {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  referrerHost?: string;
  landingPath?: string;
  timezone?: string;
  language?: string;
  firstSeenAt: number;
};

type ServerEvent = { name: string; path?: string; occurredAt: number };

export type AnalyticsSink = {
  sendEvents: (input: { platform: AppPlatform; events: ServerEvent[] }) => Promise<unknown>;
  sendAttribution: (input: StoredAttribution & { platform: AppPlatform }) => Promise<unknown>;
};

const ATTRIBUTION_KEY = "sanctificare.attribution.v1";
const ATTRIBUTION_SENT_PREFIX = "sanctificare.attribution.sent.";
const MAX_QUEUED_EVENTS = 100;
const FLUSH_BATCH_SIZE = 50;
const FLUSH_INTERVAL_MS = 15_000;

let serverSink: AnalyticsSink | null = null;
let eventQueue: ServerEvent[] = [];
let flushTimer: number | null = null;
let flushing = false;
let lastScreenPath: string | null = null;

const getAppPlatform = (): AppPlatform => {
  const platform = Capacitor.getPlatform();
  return platform === "android" || platform === "ios" ? platform : "web";
};

const safeStorageGet = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const safeStorageSet = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Armazenamento indisponível (modo privado etc.): seguimos sem persistir.
  }
};

const trimParam = (value: string | null, max: number) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed.slice(0, max) : undefined;
};

/** Guarda o primeiro contato do aparelho com o app (UTM, referrer, página de entrada). */
const captureAttribution = () => {
  if (typeof window === "undefined") return;
  if (safeStorageGet(ATTRIBUTION_KEY)) return;

  const params = new URLSearchParams(window.location.search);
  let referrerHost: string | undefined;
  try {
    const host = document.referrer ? new URL(document.referrer).hostname.replace(/^www\./, "") : "";
    if (host && host !== window.location.hostname.replace(/^www\./, "")) {
      referrerHost = host.slice(0, 200);
    }
  } catch {
    referrerHost = undefined;
  }

  let utmSource = trimParam(params.get("utm_source") ?? params.get("ref"), 100);
  if (!utmSource && params.has("gclid")) utmSource = "google";
  if (!utmSource && params.has("fbclid")) utmSource = "facebook";

  let timezone: string | undefined;
  try {
    timezone = Intl.DateTimeFormat().resolvedOptions().timeZone?.slice(0, 64);
  } catch {
    timezone = undefined;
  }

  const attribution: StoredAttribution = {
    utmSource,
    utmMedium: trimParam(params.get("utm_medium"), 100),
    utmCampaign: trimParam(params.get("utm_campaign"), 150),
    referrerHost,
    landingPath: window.location.pathname.slice(0, 200),
    timezone,
    language: navigator.language?.slice(0, 16),
    firstSeenAt: Date.now(),
  };
  safeStorageSet(ATTRIBUTION_KEY, JSON.stringify(attribution));
};

const readAttribution = (): StoredAttribution | null => {
  const raw = safeStorageGet(ATTRIBUTION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredAttribution;
  } catch {
    return null;
  }
};

const scheduleFlush = (delay = FLUSH_INTERVAL_MS) => {
  if (flushTimer !== null || typeof window === "undefined") return;
  flushTimer = window.setTimeout(() => {
    flushTimer = null;
    void flushServerEvents();
  }, delay);
};

export const flushServerEvents = async () => {
  if (!serverSink || flushing || eventQueue.length === 0) return;
  flushing = true;
  const batch = eventQueue.slice(0, FLUSH_BATCH_SIZE);
  try {
    await serverSink.sendEvents({ platform: getAppPlatform(), events: batch });
    eventQueue = eventQueue.slice(batch.length);
  } catch (err) {
    // Mantém na fila para a próxima tentativa (ex.: sem internet).
    console.warn("[Analytics] Failed to send events to server:", err);
  } finally {
    flushing = false;
    if (eventQueue.length > 0) scheduleFlush();
  }
};

const queueServerEvent = (event: Omit<ServerEvent, "occurredAt">) => {
  eventQueue.push({ ...event, occurredAt: Date.now() });
  if (eventQueue.length > MAX_QUEUED_EVENTS) {
    eventQueue = eventQueue.slice(-MAX_QUEUED_EVENTS);
  }
  if (serverSink) {
    scheduleFlush(eventQueue.length >= 20 ? 0 : FLUSH_INTERVAL_MS);
  }
};

/**
 * Liga (ou desliga, com null) o envio para o servidor. Chamado pelo App quando
 * há um usuário logado; na primeira vez de cada usuário envia a origem do cadastro.
 */
export const setAnalyticsServerSink = (sink: AnalyticsSink | null, userId: number | null) => {
  const hadSink = serverSink !== null;
  serverSink = sink && userId !== null ? sink : null;
  if (!serverSink) {
    // Ao sair da conta, descarta o que era do usuário anterior. Antes do primeiro
    // login, mantém a fila para enviar a tela aberta logo após entrar.
    if (hadSink) {
      eventQueue = [];
      lastScreenPath = null;
    }
    return;
  }
  const activeSink = serverSink;

  scheduleFlush(1_000);

  const sentKey = `${ATTRIBUTION_SENT_PREFIX}${userId}`;
  if (safeStorageGet(sentKey)) return;
  const attribution = readAttribution();
  if (!attribution) return;
  activeSink
    .sendAttribution({ ...attribution, platform: getAppPlatform() })
    .then(() => safeStorageSet(sentKey, "1"))
    .catch((err) => console.warn("[Analytics] Failed to send attribution:", err));
};

if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") void flushServerEvents();
  });
}

export const initAnalytics = async () => {
  captureAttribution();

  if (isAndroidNative()) {
    await initNativeAnalytics();
    return;
  }

  initWebAnalytics();
};

export const trackPageView = async (path: string) => {
  const screenName = path || "/";

  // Re-renderizações com o mesmo caminho não contam como nova visita.
  if (screenName !== lastScreenPath) {
    lastScreenPath = screenName;
    queueServerEvent({ name: "screen_view", path: screenName.slice(0, 200) });
  }

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

  queueServerEvent({ name: eventName });

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
