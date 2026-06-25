export interface PrayerCatalogItem {
  id: string;
  title: string;
  desc: string;
  speaker: string;
  duration: string;
  cover: string;
  accent?: string;
  detailsDesc: string;
  guides: string[];
  mediaOptions: string[];
  /** Rota autenticada de destino (usada na LP para redirecionar via login) */
  url: string;
}

export const dailyRoutine: PrayerCatalogItem[] = [
  {
    id: "rosario-diario",
    title: "Santo Rosário Diário",
    desc: "Mistérios do Dia",
    speaker: "Equipe Sanctificare",
    duration: "15-20 min",
    cover: "/assets/dashboard/rosario.png",
    accent: "bg-[oklch(0.55_0.14_15/0.1)] text-[oklch(0.55_0.14_15)]",
    detailsDesc: "Hoje meditaremos nos mistérios da nossa redenção. Una-se a nós para rezar o Santo Rosário, meditando nos mistérios gozosos, dolorosos, gloriosos ou luminosos correspondentes ao dia de hoje.",
    guides: ["Jonathan Roumie", "Voz Masculina", "Voz Feminina", "Leitura Silenciosa"],
    mediaOptions: ["18 min - Áudio Completo", "12 min - Versão Curta", "Apenas Texto"],
    url: "/rosario",
  },
  {
    id: "evangelho-dia",
    title: "Evangelho do Dia",
    desc: "Lectio Divina & Reflexão",
    speaker: "Equipe Sanctificare",
    duration: "5-8 min",
    cover: "/assets/dashboard/lectio.png",
    accent: "bg-[oklch(0.65_0.14_70/0.1)] text-[oklch(0.65_0.14_70)]",
    detailsDesc: "Ouça o Evangelho do dia acompanhado de uma meditação baseada no método da Lectio Divina (Leitura, Meditação, Oração, Contemplação).",
    guides: ["Voz Masculina", "Voz Feminina", "Leitura Silenciosa"],
    mediaOptions: ["8 min - Áudio & Reflexão", "5 min - Apenas Leitura"],
    url: "/liturgia",
  },
  {
    id: "homilia-diaria",
    title: "Homilia Diária",
    desc: "Evangelho Comentado",
    speaker: "Equipe Sanctificare",
    duration: "3-5 min",
    cover: "/assets/dashboard/oracoes.png",
    accent: "bg-[oklch(0.40_0.10_260/0.1)] text-[oklch(0.40_0.10_260)]",
    detailsDesc: "Uma reflexão teológica rápida e profunda sobre o Evangelho do dia para iluminar suas escolhas cotidianas à luz da doutrina católica.",
    guides: ["Voz Masculina", "Voz Feminina", "Leitura Silenciosa"],
    mediaOptions: ["4 min - Áudio completo", "Apenas texto transcrito"],
    url: "/liturgia",
  },
  {
    id: "oferecimento-manha",
    title: "Oferecimento do Dia",
    desc: "Oração da Manhã",
    speaker: "Equipe Sanctificare",
    duration: "2 min",
    cover: "/assets/dashboard/quando-deus-fala.png",
    accent: "bg-[oklch(0.45_0.12_200/0.1)] text-[oklch(0.45_0.12_200)]",
    detailsDesc: "Entregue suas intenções, trabalhos, alegrias e sofrimentos deste dia ao Sagrado Coração de Jesus por meio do Imaculado Coração de Maria.",
    guides: ["Equipe Sanctificare", "Voz Masculina", "Voz Feminina"],
    mediaOptions: ["2 min - Áudio", "1 min - Apenas Texto"],
    url: "/oracoes",
  }
];

export const trendingPrayers: PrayerCatalogItem[] = [
  {
    id: "novena-espirito",
    title: "Novena do Espírito Santo",
    desc: "Graças do Consolador",
    speaker: "Santo Afonso de Ligório",
    duration: "9 dias • 12 min",
    cover: "/assets/dashboard/intencoes.png",
    detailsDesc: "Clame pelos sete dons do Espírito Santo nesta novena tradicional escrita por Santo Afonso de Ligório para preparar a alma para Pentecostes.",
    guides: ["Santo Afonso de Ligório", "Voz Masculina", "Voz Feminina"],
    mediaOptions: ["12 min - Áudio Diário", "Apenas Leituras"],
    url: "/novenas",
  },
  {
    id: "via-sacra",
    title: "Via-Sacra",
    desc: "As 14 Estações",
    speaker: "São Josemaria Escrivá",
    duration: "25 min",
    cover: "/assets/dashboard/via-sacra.png",
    detailsDesc: "Acompanhe Nosso Senhor Jesus Cristo em Seu caminho de dor até o Calvário. Meditações profundas escritas por São Josemaria Escrivá para cada estação.",
    guides: ["São Josemaria Escrivá", "Voz Masculina", "Voz Feminina"],
    mediaOptions: ["25 min - Áudio Completo", "15 min - Versão Meditativa"],
    url: "/via-sacra",
  },
  {
    id: "musica-sacra",
    title: "Música Sacra",
    desc: "Gregorianos & Polifonia",
    speaker: "Coro da Abadia de Solesmes",
    duration: "60 min",
    cover: "/assets/dashboard/musica-sacra.png",
    detailsDesc: "Acalme seu coração e encontre o recolhimento com uma seleção curada de cantos gregorianos e polifonia sacra tradicional da Igreja.",
    guides: ["Abadia de Solesmes", "Polifonia Clássica", "Sons Contemplativos"],
    mediaOptions: ["60 min - Álbum completo", "30 min - Seleção Curta"],
    url: "/musica-sacra",
  },
  {
    id: "vela-virtual",
    title: "Vela Virtual",
    desc: "Entrega de Intenção",
    speaker: "Equipe Sanctificare",
    duration: "1 min",
    cover: "/assets/dashboard/vela-virtual.png",
    detailsDesc: "Acenda uma vela virtual em nosso altar de preces, registrando suas intenções de oração e unindo-se à intercessão de toda a comunidade católica.",
    guides: ["Equipe Sanctificare", "Silêncio contemplativo"],
    mediaOptions: ["1 min - Reflexão guiada", "Apenas visualização"],
    url: "/vela-virtual",
  }
];

export const allPrayers = [...dailyRoutine, ...trendingPrayers];
