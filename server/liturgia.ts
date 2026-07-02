import type {
  InsertDailyLiturgy,
  LiturgyAntiphons,
  LiturgyPrayers,
  LiturgyReading,
} from "../drizzle/schema";
import { loadBible } from "./bible";

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
function cleanText(text: string): string[] {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/[^\w\s]/g, "") // remove punctuation
    .split(/\s+/)
    .filter(w => w.length >= 3);
}

function formatRanges(nums: number[]): string {
  if (nums.length === 0) return "";
  const sorted = Array.from(new Set(nums)).sort((a, b) => a - b);
  const ranges: string[] = [];
  let start = sorted[0];
  let prev = sorted[0];
  for (let i = 1; i <= sorted.length; i++) {
    if (i < sorted.length && sorted[i] === prev + 1) {
      prev = sorted[i];
    } else {
      if (start === prev) {
        ranges.push(`${start}`);
      } else {
        ranges.push(`${start}-${prev}`);
      }
      if (i < sorted.length) {
        start = sorted[i];
        prev = sorted[i];
      }
    }
  }
  return ranges.join(".");
}

export function resolvePsalmVerses(referencia: string, texto: string): string {
  try {
    // Se a referência já contiver versículos detalhados (ex: Sl 49(50), 7-8.11), não faz nada
    if (referencia.includes(",")) {
      const parts = referencia.split(",");
      if (parts.length > 1 && /\d+/.test(parts[1])) {
        return referencia;
      }
    }

    const numMatch = referencia.match(/\d+/);
    if (!numMatch) return referencia;
    const psalmNum = parseInt(numMatch[0]);

    // Carrega a Bíblia e localiza o livro de Salmos (índice 22)
    const bible = loadBible();
    const book = bible[22];
    if (!book || book.livro !== "Salmos") return referencia;

    const chapter = book.capitulos.find(c => c.capitulo === psalmNum);
    if (!chapter) return referencia;

    // Divide o texto do salmo em estrofes
    const stanzas = texto
      .split("\n")
      .map(s => s.replace(/^-\s*/, "").trim())
      .filter(s => s.length > 0);

    if (stanzas.length === 0) return referencia;

    const matchedVerses: number[] = [];

    // Prepara os versículos da Bíblia limpando o texto
    const bibleVerses = chapter.versiculos.map(v => ({
      numero: v.numero,
      words: cleanText(v.texto),
    }));

    for (const stanza of stanzas) {
      const stanzaWords = cleanText(stanza);
      if (stanzaWords.length === 0) continue;

      let bestVerseNum = -1;
      let maxMatches = 0;

      for (const bVerse of bibleVerses) {
        if (bVerse.words.length === 0) continue;
        let matches = 0;
        for (const word of stanzaWords) {
          if (bVerse.words.includes(word)) {
            matches++;
          }
        }
        if (matches > maxMatches) {
          maxMatches = matches;
          bestVerseNum = bVerse.numero;
        }
      }

      // Definimos um limiar mínimo de correspondência (pelo menos 2 palavras correspondendo)
      if (bestVerseNum !== -1 && maxMatches >= 2) {
        matchedVerses.push(bestVerseNum);
      }
    }

    if (matchedVerses.length > 0) {
      const versesStr = formatRanges(matchedVerses);
      return `${referencia}, ${versesStr}`;
    }
  } catch (err) {
    console.error("[Liturgy] Error resolving psalm verses:", err);
  }
  return referencia;
}

/** Normaliza um campo de leitura que pode vir como objeto ou string ("Não há ..."). */
function normalizeReading(raw: RawReading | string | undefined, isPsalm = false): LiturgyReading | null {
  if (!raw || typeof raw === "string") return null;
  if (!raw.texto && !raw.referencia) return null;
  let ref = raw.referencia ?? "";
  if (isPsalm && ref && raw.texto) {
    ref = resolvePsalmVerses(ref, raw.texto);
  }
  return {
    referencia: ref,
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
    psalm: normalizeReading(raw.salmo, true),
    secondReading: normalizeReading(raw.segundaLeitura),
    gospel,
    prayers,
    antiphons,
  };
}
