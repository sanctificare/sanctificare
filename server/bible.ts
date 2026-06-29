import fs from "fs";
import path from "path";

export interface Verse {
  numero: number;
  texto: string;
}

export interface Chapter {
  capitulo: number;
  versiculos: Verse[];
}

export interface Book {
  livro: string;
  capitulos: Chapter[];
}

// Maps client-side book IDs to indices in the biblia.json array
const BOOK_ID_TO_INDEX: Record<string, number> = {
  gn: 0, ex: 1, lv: 2, nm: 3, dt: 4, js: 5, jz: 6, rt: 7, "1sm": 8, "2sm": 9,
  "1rs": 10, "2rs": 11, "1cr": 12, "2cr": 13, esd: 14, ne: 15, tb: 16, jt: 17,
  est: 18, "1mc": 19, "2mc": 20, jó: 21, sl: 22, pv: 23, ecl: 24, ct: 25,
  sb: 26, si: 27, is: 28, jr: 29, lm: 30, br: 31, ez: 32, dn: 33, os: 34,
  jl: 35, am: 36, ab: 37, jn: 38, mq: 39, na: 40, hb: 41, sf: 42, ag: 43,
  zc: 44, ml: 45, mt: 46, mc: 47, lc: 48, jo: 49, at: 50, rm: 51, "1co": 52,
  "2co": 53, gl: 54, ef: 55, fl: 56, cl: 57, "1ts": 58, "2ts": 59, "1tm": 60,
  "2tm": 61, tt: 62, fm: 63, hb2: 64, tg: 65, "1pe": 66, "2pe": 67, "1jo": 68,
  "2jo": 69, "3jo": 70, jd: 71, ap: 72
};

let bibleData: Book[] | null = null;

/**
 * Loads the biblia.json file from the server's data folder.
 * Caches the parsed array in memory for subsequent calls.
 */
export function loadBible(): Book[] {
  if (!bibleData) {
    const filePath = path.join(process.cwd(), "server", "data", "biblia.json");
    try {
      const content = fs.readFileSync(filePath, "utf8");
      bibleData = JSON.parse(content);
      console.log(`[Bible] Successfully loaded ${bibleData?.length} books from ${filePath}`);
    } catch (error) {
      console.error("[Bible] Failed to load biblia.json from path:", filePath, error);
      bibleData = [];
    }
  }
  return bibleData!;
}

/**
 * Retrieves the list of verses for a given book (by client ID) and chapter number.
 */
export function getChapter(bookId: string, chapterNum: number): string[] {
  const bible = loadBible();
  const index = BOOK_ID_TO_INDEX[bookId.toLowerCase()];
  if (index === undefined) {
    throw new Error(`Livro com o ID "${bookId}" não encontrado.`);
  }
  const book = bible[index];
  if (!book) {
    throw new Error(`O livro no índice ${index} correspondente a "${bookId}" não está na base de dados.`);
  }
  const chapter = book.capitulos.find((c) => c.capitulo === chapterNum);
  if (!chapter) {
    throw new Error(`Capítulo ${chapterNum} do livro "${book.livro}" não foi encontrado.`);
  }
  return chapter.versiculos.map((v) => v.texto);
}

export interface SearchResult {
  bookId: string;
  bookName: string;
  chapter: number;
  verse: number;
  text: string;
}

const BOOK_INDEX_TO_ID = [
  "gn", "ex", "lv", "nm", "dt", "js", "jz", "rt", "1sm", "2sm",
  "1rs", "2rs", "1cr", "2cr", "esd", "ne", "tb", "jt", "est", "1mc",
  "2mc", "jó", "sl", "pv", "ecl", "ct", "sb", "si", "is", "jr",
  "lm", "br", "ez", "dn", "os", "jl", "am", "ab", "jn", "mq",
  "na", "hb", "sf", "ag", "zc", "ml", "mt", "mc", "lc", "jo",
  "at", "rm", "1co", "2co", "gl", "ef", "fl", "cl", "1ts", "2ts",
  "1tm", "2tm", "tt", "fm", "hb2", "tg", "1pe", "2pe", "1jo", "2jo",
  "3jo", "jd", "ap"
];

/**
 * Searches the Bible text for a case-insensitive query string.
 * Limits results to 50 items for speed.
 */
export function search(query: string): SearchResult[] {
  const bible = loadBible();
  const results: SearchResult[] = [];
  const lowerQuery = query.toLowerCase().trim();

  if (lowerQuery.length < 3) return results;

  for (let bIndex = 0; bIndex < bible.length; bIndex++) {
    const book = bible[bIndex];
    const bookId = BOOK_INDEX_TO_ID[bIndex];
    if (!bookId) continue;

    for (const chapter of book.capitulos) {
      for (const verse of chapter.versiculos) {
        if (verse.texto.toLowerCase().includes(lowerQuery)) {
          results.push({
            bookId,
            bookName: book.livro,
            chapter: chapter.capitulo,
            verse: verse.numero,
            text: verse.texto
          });

          if (results.length >= 50) {
            return results;
          }
        }
      }
    }
  }
  return results;
}
