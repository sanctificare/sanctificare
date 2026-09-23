// Catálogo de recursos do app usado pelo rastreamento próprio (tabela app_events)
// e pelo painel administrativo. Mantido em shared/ para que cliente e servidor
// classifiquem as telas da mesma forma.

export const FEATURE_LABELS: Record<string, string> = {
  dashboard: "Início",
  explorar: "Explorar",
  oracoes: "Orações",
  rosario: "Santo Rosário",
  liturgia: "Liturgia Diária",
  lectio: "Lectio Divina",
  via_sacra: "Via-Sacra",
  vela_virtual: "Vela Virtual",
  musica_sacra: "Música Sacra",
  biblia: "Bíblia",
  novenas: "Novenas",
  santoral: "Santoral / Calendário",
  quaresma_sao_miguel: "Quaresma de São Miguel",
  intencoes: "Intenções",
  perfil: "Perfil",
  plano_diario: "Plano Diário",
  videos: "Vídeos Bíblicos",
  degraus_perfeicao: "Degraus de Perfeição",
  premium: "Premium",
  apoie: "Apoie a Missão",
  outros: "Outras telas",
};

// Ordem importa: o primeiro prefixo que casar vence.
const PATH_PREFIXES: Array<[string, string]> = [
  ["/dashboard", "dashboard"],
  ["/explore", "explorar"],
  ["/oracoes", "oracoes"],
  ["/oracao/", "oracoes"],
  ["/rosario", "rosario"],
  ["/liturgia", "liturgia"],
  ["/lectio", "lectio"],
  ["/via-sacra", "via_sacra"],
  ["/vela-virtual", "vela_virtual"],
  ["/musica-sacra", "musica_sacra"],
  ["/biblia", "biblia"],
  ["/novenas", "novenas"],
  ["/santoral", "santoral"],
  ["/calendario", "santoral"],
  ["/quaresma-de-sao-miguel", "quaresma_sao_miguel"],
  ["/quaresma-sao-miguel", "quaresma_sao_miguel"],
  ["/intencoes", "intencoes"],
  ["/perfil", "perfil"],
  ["/profile", "perfil"],
  ["/plano-diario", "plano_diario"],
  ["/videos", "videos"],
  ["/degraus-de-perfeicao", "degraus_perfeicao"],
  ["/premium", "premium"],
  ["/apoie-a-missao", "apoie"],
];

// Telas que não representam uso de um recurso (login, admin, páginas legais).
const IGNORED_PREFIXES = ["/login", "/redefinir-senha", "/admin", "/privacidade", "/404"];

/** Retorna a chave do recurso para um caminho, ou null se a tela não deve ser contada. */
export function featureFromPath(rawPath: string): string | null {
  const path = (rawPath || "/").split(/[?#]/)[0].toLowerCase();
  if (path === "/" || IGNORED_PREFIXES.some((p) => path.startsWith(p))) return null;
  for (const [prefix, feature] of PATH_PREFIXES) {
    const matches = prefix.endsWith("/")
      ? path.startsWith(prefix)
      : path === prefix || path.startsWith(`${prefix}/`);
    if (matches) {
      return feature;
    }
  }
  return "outros";
}

export function featureLabel(feature: string): string {
  return FEATURE_LABELS[feature] ?? feature;
}

/** Classifica a origem de um cadastro a partir de utm_source e/ou do referrer. */
export function classifyAcquisitionSource(input: {
  utmSource?: string | null;
  referrerHost?: string | null;
  platform?: string | null;
}): string {
  const utm = input.utmSource?.trim().toLowerCase();
  const host = input.referrerHost?.trim().toLowerCase() ?? "";
  const probe = utm || host;

  if (probe) {
    if (/instagram|^ig$/.test(probe)) return "instagram";
    if (/facebook|^fb$|fb\.com|fbclid/.test(probe)) return "facebook";
    if (/whatsapp|wa\.me|^wa$/.test(probe)) return "whatsapp";
    if (/youtube|youtu\.be/.test(probe)) return "youtube";
    if (/tiktok/.test(probe)) return "tiktok";
    if (/google|gclid/.test(probe)) return "google";
    if (/bing|duckduckgo|yahoo|ecosia/.test(probe)) return "outros_buscadores";
    if (/t\.co|twitter|x\.com/.test(probe)) return "x_twitter";
    if (/telegram|t\.me/.test(probe)) return "telegram";
    if (/email|newsletter|resend|mail/.test(probe)) return "email";
    if (/play\.google|playstore|play_store/.test(probe)) return "play_store";
    if (/sanctificare/.test(probe)) return "direto";
    return utm ? utm.slice(0, 40) : "outros_sites";
  }

  if (input.platform === "android") return "play_store";
  if (input.platform === "ios") return "app_store";
  return "direto";
}

export const ACQUISITION_SOURCE_LABELS: Record<string, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  whatsapp: "WhatsApp",
  youtube: "YouTube",
  tiktok: "TikTok",
  google: "Google",
  outros_buscadores: "Outros buscadores",
  x_twitter: "X / Twitter",
  telegram: "Telegram",
  email: "E-mail",
  play_store: "Play Store (Android)",
  app_store: "App Store (iOS)",
  direto: "Direto / digitou o endereço",
  outros_sites: "Outros sites",
  desconhecido: "Sem dados (cadastro antigo)",
};

export function acquisitionSourceLabel(source: string): string {
  return ACQUISITION_SOURCE_LABELS[source] ?? source;
}

export const PLATFORM_LABELS: Record<string, string> = {
  android: "App Android",
  ios: "App iOS",
  web: "Site (navegador)",
  desconhecido: "Sem dados",
};
