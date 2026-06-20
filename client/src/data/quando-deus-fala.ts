export interface DiscernmentTopic {
  id: string;
  title: string;
  hint: string;
  scripture: string;
  reflection: string;
  prayer: string;
}

export interface DailyListening {
  id: string;
  question: string;
  scripture: string;
  invocation: string;
  action: string;
}

export const DISCERNMENT_TOPICS: DiscernmentTopic[] = [
  {
    id: "medo",
    title: "Estou com medo",
    hint: "Quando a ansiedade cresce, Deus convida a confiar.",
    scripture: "Isaías 41,10",
    reflection: "Observe qual medo mais ocupa seu interior hoje e entregue isso ao Senhor pelo nome.",
    prayer: "Jesus, eu confio em Vós. Sustentai meu coração com a vossa paz.",
  },
  {
    id: "decisao",
    title: "Preciso decidir",
    hint: "A voz de Deus ilumina o caminho com verdade e paz.",
    scripture: "Tiago 1,5",
    reflection: "Pergunte-se: qual escolha me torna mais fiel ao Evangelho e mais caridoso?",
    prayer: "Espírito Santo, dai-me luz para escolher o que mais agrada a Deus.",
  },
  {
    id: "ferida",
    title: "Estou ferido",
    hint: "Deus fala também nas feridas, com misericórdia.",
    scripture: "Salmo 147,3",
    reflection: "Não esconda sua dor. Leve-a em oração como ela está, sem maquiar.",
    prayer: "Senhor, toca minhas feridas e faz nascer vida nova onde estou quebrado.",
  },
  {
    id: "vocacao",
    title: "Busco minha vocação",
    hint: "A vontade de Deus amadurece no tempo da escuta fiel.",
    scripture: "1 Samuel 3,10",
    reflection: "A vocação se confirma em pequenos atos de obediência e serviço.",
    prayer: "Fala, Senhor, teu servo escuta. Mostra-me o próximo passo.",
  },
  {
    id: "perdao",
    title: "Preciso perdoar",
    hint: "A voz de Deus sempre nos conduz à reconciliação.",
    scripture: "Efésios 4,32",
    reflection: "Perdoar é um caminho. Comece por pedir a graça de querer perdoar.",
    prayer: "Pai, cura meu coração e ensina-me a perdoar como fui perdoado.",
  },
  {
    id: "gratidao",
    title: "Quero agradecer",
    hint: "A gratidão afina o ouvido para reconhecer Deus em tudo.",
    scripture: "1 Tessalonicenses 5,18",
    reflection: "Liste três sinais concretos da bondade de Deus no seu dia.",
    prayer: "Obrigado, Senhor, por tua fidelidade nos detalhes da minha história.",
  },
];

export const DAILY_LISTENING: DailyListening[] = [
  {
    id: "escuta-1",
    question: "O que Deus está me pedindo hoje?",
    scripture: "João 2,5",
    invocation: "Senhor, abre meus ouvidos e meu coração.",
    action: "Escolha um gesto concreto de obediência ao Evangelho ainda hoje.",
  },
  {
    id: "escuta-2",
    question: "Onde Deus já me visitou hoje e eu talvez não percebi?",
    scripture: "Lucas 24,32",
    invocation: "Fica conosco, Senhor.",
    action: "Anote um momento de consolação e agradeça por ele.",
  },
  {
    id: "escuta-3",
    question: "Qual apego preciso entregar para ouvir melhor?",
    scripture: "Mateus 6,21",
    invocation: "Jesus manso e humilde de coração, fazei meu coração semelhante ao vosso.",
    action: "Renuncie a uma distração que te afasta da presença de Deus.",
  },
  {
    id: "escuta-4",
    question: "Que pessoa Deus está me convidando a amar melhor hoje?",
    scripture: "João 13,34",
    invocation: "Dai-me, Senhor, um coração servo e atento.",
    action: "Faça um ato de caridade silencioso e ofereça por essa pessoa.",
  },
  {
    id: "escuta-5",
    question: "Que passo de fé preciso dar hoje, mesmo com medo?",
    scripture: "Salmo 37,5",
    invocation: "Conduze-me, Senhor, no caminho da paz.",
    action: "Diga seu sim a Deus em uma decisão concreta de hoje.",
  },
  {
    id: "escuta-6",
    question: "O que Deus quer curar em mim neste tempo?",
    scripture: "Marcos 10,51",
    invocation: "Senhor, que eu veja.",
    action: "Apresente essa intenção em uma breve oração antes de dormir.",
  },
  {
    id: "escuta-7",
    question: "Como posso permanecer mais tempo na presença de Deus hoje?",
    scripture: "João 15,4",
    invocation: "Permanece em mim, Senhor.",
    action: "Reserve 10 minutos de silêncio orante sem celular.",
  },
];

export function getDailyListening(date: Date = new Date()): DailyListening {
  const dayOfYear = Math.floor(
    (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) /
      (1000 * 60 * 60 * 24)
  );
  const index =
    ((dayOfYear % DAILY_LISTENING.length) + DAILY_LISTENING.length) %
    DAILY_LISTENING.length;
  return DAILY_LISTENING[index];
}
