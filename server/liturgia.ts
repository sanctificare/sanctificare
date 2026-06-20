import type {
  InsertDailyLiturgy,
  LiturgyAntiphons,
  LiturgyPrayers,
  LiturgyReading,
} from "../drizzle/schema";

// Fonte pública da liturgia diária em PT-BR.
const LITURGIA_API_BASE = "https://liturgia.up.railway.app";
const FETCH_TIMEOUT_MS = 15_000;

// Formato bruto retornado pela API.
interface RawReading {
  referencia?: string;
  titulo?: string;
  texto?: string;
  refrao?: string;
}

interface RawLiturgiaResponse {
  data?: string; // "DD/MM/YYYY"
  liturgia?: string;
  cor?: string;
  dia?: string; // oração do dia (coleta)
  oferendas?: string;
  comunhao?: string;
  primeiraLeitura?: RawReading | string;
  salmo?: RawReading | string;
  segundaLeitura?: RawReading | string;
  evangelho?: RawReading | string;
  antifonas?: { entrada?: string; comunhao?: string };
}

/** Converte "YYYY-MM-DD" em partes numéricas para a query da API. */
function isoToParts(isoDate: string): { dia: number; mes: number; ano: number } {
  const [ano, mes, dia] = isoDate.split("-").map(Number);
  if (!ano || !mes || !dia) {
    throw new Error(`Data inválida (esperado YYYY-MM-DD): ${isoDate}`);
  }
  return { dia, mes, ano };
}

/** Data de hoje em "YYYY-MM-DD" no fuso de São Paulo. */
export function todayIsoSaoPaulo(): string {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return fmt.format(new Date()); // en-CA já produz "YYYY-MM-DD"
}

/** Normaliza um campo de leitura que pode vir como objeto ou string ("Não há ..."). */
function normalizeReading(raw: RawReading | string | undefined): LiturgyReading | null {
  if (!raw || typeof raw === "string") return null;
  if (!raw.texto && !raw.referencia) return null;
  return {
    referencia: raw.referencia ?? "",
    titulo: raw.titulo,
    texto: raw.texto ?? "",
    refrao: raw.refrao,
  };
}

/**
 * Busca a liturgia de uma data na API externa e devolve já no formato da tabela.
 * Lança em caso de erro de rede, timeout ou payload inválido.
 */
export async function fetchLiturgyForDate(isoDate: string): Promise<InsertDailyLiturgy> {
  const { dia, mes, ano } = isoToParts(isoDate);
  const url = `${LITURGIA_API_BASE}/?dia=${dia}&mes=${mes}&ano=${ano}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  let raw: RawLiturgiaResponse;
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    if (!res.ok) {
      throw new Error(`Liturgia API respondeu ${res.status} para ${isoDate}`);
    }
    raw = (await res.json()) as RawLiturgiaResponse;
  } finally {
    clearTimeout(timeout);
  }

  const gospel = normalizeReading(raw.evangelho);
  if (!gospel) {
    throw new Error(`Liturgia API não retornou evangelho para ${isoDate}`);
  }

  const prayers: LiturgyPrayers = {
    coleta: raw.dia,
    oferendas: raw.oferendas,
    comunhao: raw.comunhao,
  };

  const antiphons: LiturgyAntiphons | undefined = raw.antifonas
    ? { entrada: raw.antifonas.entrada, comunhao: raw.antifonas.comunhao }
    : undefined;

  return {
    liturgyDate: isoDate,
    celebration: raw.liturgia ?? null,
    color: raw.cor ?? null,
    firstReading: normalizeReading(raw.primeiraLeitura),
    psalm: normalizeReading(raw.salmo),
    secondReading: normalizeReading(raw.segundaLeitura),
    gospel,
    prayers,
    antiphons,
  };
}
