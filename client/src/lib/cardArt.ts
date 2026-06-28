type CardArt = {
  image: string;
  overlay?: string;
};

const FALLBACK_ART: CardArt = {
  image: "/assets/sanctificare-hero.webp",
  overlay: "oklch(0.28 0.07 260 / 0.6)",
};

const PRAYER_ART: Record<string, CardArt> = {
  pai_nosso: { image: "/assets/sanctificare-hero.webp", overlay: "oklch(0.27 0.08 260 / 0.62)" },
  ave_maria: { image: "/assets/sanctificare-hero.webp", overlay: "oklch(0.46 0.13 18 / 0.58)" },
  gloria: { image: "/assets/sanctificare-hero.webp", overlay: "oklch(0.52 0.13 80 / 0.55)" },
  credo: { image: "/assets/via-sacra/imagens/1estacao.webp", overlay: "oklch(0.24 0.07 260 / 0.64)" },
  salve_rainha: { image: "/assets/via-sacra/imagens/2estacao.webp", overlay: "oklch(0.39 0.16 335 / 0.56)" },
  angelus: { image: "/assets/via-sacra/imagens/3estacao.webp", overlay: "oklch(0.34 0.08 210 / 0.58)" },
  fatima: { image: "/assets/sanctificare-hero.webp", overlay: "oklch(0.53 0.1 120 / 0.55)" },
  anjo_da_guarda: { image: "/assets/sanctificare-hero.webp", overlay: "oklch(0.45 0.12 40 / 0.56)" },
  novena: { image: "/assets/via-sacra/imagens/3estacao.webp", overlay: "oklch(0.27 0.09 260 / 0.64)" },
  meditacao: { image: "/assets/via-sacra/imagens/2estacao.webp", overlay: "oklch(0.38 0.17 20 / 0.58)" },
  liturgia: { image: "/assets/via-sacra/imagens/1estacao.webp", overlay: "oklch(0.3 0.12 225 / 0.6)" },
  rosario: { image: "/assets/sanctificare-rosary.webp", overlay: "oklch(0.22 0.08 260 / 0.6)" },
  lectio_divina: { image: "/assets/via-sacra/imagens/3estacao.webp", overlay: "oklch(0.35 0.11 225 / 0.58)" },
};

const NOVENA_ART: Record<string, CardArt> = {
  "novena-sagrado-coracao-jesus": { image: "/assets/novenas/sagrado-coracao-jesus.png", overlay: "oklch(0.39 0.17 22 / 0.58)" },
  "novena-divino-espirito-santo": { image: "/assets/novenas/divino-espirito-santo.png", overlay: "oklch(0.35 0.1 215 / 0.58)" },
  "novena-nossa-senhora-perpetuo-socorro": { image: "/assets/novenas/nossa-senhora-perpetuo-socorro.png", overlay: "oklch(0.45 0.13 290 / 0.56)" },
  "novena-sao-jose": { image: "/assets/novenas/sao-jose.png", overlay: "oklch(0.42 0.11 110 / 0.56)" },
};

const LECTIO_STEP_ART: Record<string, string> = {
  lectio: "/assets/via-sacra/imagens/1estacao.webp",
  meditatio: "/assets/via-sacra/imagens/2estacao.webp",
  oratio: "/assets/via-sacra/imagens/3estacao.webp",
  contemplatio: "/assets/sanctificare-hero.webp",
  actio: "/assets/sanctificare-rosary.webp",
};

const AUDIO_COLLECTION_ART: Record<string, string> = {
  "meditacoes-contemplativas": "/assets/via-sacra/imagens/3estacao.webp",
  "historias-da-biblia": "/assets/via-sacra/imagens/1estacao.webp",
  "canto-gregoriano": "/assets/composers/canto-gregoriano.png",
  "polifonia-sacra": "/assets/via-sacra/imagens/2estacao.webp",
  "para-meditar": "/assets/via-sacra/imagens/3estacao.webp",
  "mariana": "/assets/sanctificare-rosary.webp",
  "tempos-liturgicos": "/assets/sanctificare-hero.webp",
  // Coleções por Artista/Compositor
  "js-bach": "/assets/composers/js-bach.png",
  "tomas-luis-de-victoria": "/assets/composers/tomas-luis-de-victoria.png",
  "palestrina": "/assets/composers/palestrina.png",
  "mozart": "/assets/composers/mozart.png",
  "schubert": "/assets/composers/schubert.png",
  "faure": "/assets/composers/faure.png",
  "bruckner": "/assets/composers/bruckner.png",
  "handel": "/assets/composers/handel.png",
  "charles-gounod": "/assets/composers/charles-gounod.png",
  "antonio-vivaldi": "/assets/composers/antonio-vivaldi.png",
};

export function getPrayerArt(prayerType: string): CardArt {
  return PRAYER_ART[prayerType] ?? FALLBACK_ART;
}

export function getNovenaArt(novenaId: string): CardArt {
  return NOVENA_ART[novenaId] ?? FALLBACK_ART;
}

export function getLectioStepArt(stepKey: string): string {
  return LECTIO_STEP_ART[stepKey] ?? FALLBACK_ART.image;
}

export function getAudioCollectionArt(collectionId: string): string {
  return AUDIO_COLLECTION_ART[collectionId] ?? FALLBACK_ART.image;
}

export function getLiturgySectionArt(sectionId: string): string {
  if (sectionId === "first_reading") return "/assets/via-sacra/imagens/1estacao.webp";
  if (sectionId === "psalm") return "/assets/via-sacra/imagens/3estacao.webp";
  return "/assets/via-sacra/imagens/2estacao.webp";
}
