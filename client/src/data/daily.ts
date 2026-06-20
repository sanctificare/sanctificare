export interface DailyContent {
  verse: {
    text: string;
    reference: string;
  };
  saint: {
    name: string;
    title: string;
    summary: string;
  };
  reflection: {
    title: string;
    content: string;
    prayerAction: string;
  };
}

const DAILY_LIBRARY: DailyContent[] = [
  {
    verse: {
      text: "O Senhor é minha luz e minha salvação; de quem terei medo?",
      reference: "Salmo 27,1",
    },
    saint: {
      name: "São José",
      title: "Guardião silencioso da Sagrada Família",
      summary:
        "Exemplo de obediência e confiança. Ensina a servir com firmeza, discrição e sem buscar aplausos.",
    },
    reflection: {
      title: "Fidelidade nas coisas pequenas",
      content:
        "Deus costuma nos moldar no cotidiano simples. O amor fiel nas pequenas escolhas prepara o coração para grandes fidelidades.",
      prayerAction: "Hoje, faça uma obra escondida de caridade por alguém da sua casa.",
    },
  },
  {
    verse: {
      text: "Permanecei em mim, e eu permanecerei em vós.",
      reference: "João 15,4",
    },
    saint: {
      name: "Santa Teresinha do Menino Jesus",
      title: "A pequena via do amor",
      summary:
        "Mostrou que a santidade é possível para todos por meio de confiança, simplicidade e amor concreto.",
    },
    reflection: {
      title: "Permanecer antes de produzir",
      content:
        "A fecundidade espiritual nasce da intimidade com Cristo. Sem raiz nele, o fruto não amadurece nem permanece.",
      prayerAction: "Reserve 10 minutos de silêncio e repita: Jesus, eu confio em Vós.",
    },
  },
  {
    verse: {
      text: "Felizes os misericordiosos, porque alcançarão misericórdia.",
      reference: "Mateus 5,7",
    },
    saint: {
      name: "São Francisco de Assis",
      title: "Paz e reconciliação",
      summary:
        "Testemunhou pobreza evangélica e misericórdia, vendo em cada pessoa um irmão.",
    },
    reflection: {
      title: "Misericórdia prática",
      content:
        "Perdoar não é negar a dor, mas entregar o julgamento a Deus e renunciar à tentação de devolver o mal.",
      prayerAction: "Ore por uma pessoa com quem você tem dificuldade e abençoe o nome dela.",
    },
  },
  {
    verse: {
      text: "Lancai sobre Ele toda a vossa preocupação, porque Ele cuida de vós.",
      reference: "1 Pedro 5,7",
    },
    saint: {
      name: "Santo Agostinho",
      title: "Coração inquieto em busca de Deus",
      summary:
        "Sua conversão recorda que nenhuma história está perdida quando o coração se abre à graça.",
    },
    reflection: {
      title: "Entregar as ansiedades",
      content:
        "A ansiedade perde força quando a alma aprende a descansar mais na providência do que no próprio controle.",
      prayerAction: "Escreva uma preocupação e apresente-a a Deus em uma breve oração.",
    },
  },
  {
    verse: {
      text: "Faça-se em mim segundo a tua palavra.",
      reference: "Lucas 1,38",
    },
    saint: {
      name: "Nossa Senhora",
      title: "Modelo de disponibilidade a Deus",
      summary:
        "No fiat de Maria, aprendemos a abrir espaço para que Deus conduza nossos passos com mansidão e firmeza.",
    },
    reflection: {
      title: "Dizer sim no hoje",
      content:
        "A vontade de Deus se revela em fidelidade progressiva. O sim de hoje sustenta o sim de amanhã.",
      prayerAction: "Reze uma Ave Maria pedindo docilidade para acolher a vontade divina.",
    },
  },
  {
    verse: {
      text: "Tudo posso naquele que me fortalece.",
      reference: "Filipenses 4,13",
    },
    saint: {
      name: "São Paulo Apóstolo",
      title: "Missionário da esperança",
      summary:
        "Mostrou que a fraqueza humana pode se tornar lugar de manifestação da força de Cristo.",
    },
    reflection: {
      title: "Força que vem de Deus",
      content:
        "Não é autossuficiência, mas abandono confiante. Cristo fortalece para amar, servir e perseverar até o fim.",
      prayerAction: "Antes de uma tarefa difícil, invoque: Senhor, fortalece-me para te servir.",
    },
  },
];

function getDayOfYearIndex(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 1);
  const diff = date.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / 86400000);
  return dayOfYear;
}

export function getDailyContent(date: Date = new Date()): DailyContent {
  const dayIndex = getDayOfYearIndex(date);
  return DAILY_LIBRARY[dayIndex % DAILY_LIBRARY.length];
}
