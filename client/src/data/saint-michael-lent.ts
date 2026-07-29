export interface JourneyDay {
  number: number;
  title: string;
  theme: string;
  scripture: {
    reference: string;
    text: string;
    explanation: string;
  };
  meditation: string;
  virtue: string;
  purpose: string;
  suggestedPenance: string;
  spiritualExercise: string;
  examination: string[];
  saintQuote: string;
  complementaryPrayer: string;
  audioNarratedUrl?: string;
  audioContemplativeUrl?: string;
}

export interface SpiritualJourney {
  id: string;
  title: string;
  description: string;
  image: string;
  totalDays: number;
  traditionalStart: { month: number; day: number };
  traditionalEnd: { month: number; day: number };
  allowsCustomStart: boolean;
  category: string;
  accessType: "traditional-free";
  days: JourneyDay[];
}

export const SAINT_MICHAEL_TRADITIONAL_PRAYERS = [
  {
    title: "Preparação",
    content: "Prepare um lugar recolhido para a oração. Se possível, acenda uma vela benta como sinal de fé e de entrega a Deus. Escolha a penitência que deseja oferecer nesta Quaresma e recolha o coração na presença do Senhor.",
  },
  {
    title: "Sinal da Cruz",
    content: "Em nome do Pai, do Filho e do Espírito Santo. Amém.",
  },
  {
    title: "Oração inicial atribuída ao Papa São Leão XIII",
    content: "São Miguel Arcanjo, defendei-nos no combate. Sede nosso refúgio contra as maldades e ciladas do demônio. Ordene-lhe Deus, instantemente o pedimos; e vós, príncipe da milícia celeste, pelo poder divino, precipitai no inferno a Satanás e a todos os espíritos malignos que quotas andam pelo mundo para perder as almas. Amém.",
  },
  {
    title: "Invocação ao Sacratíssimo Coração de Jesus",
    content: "Sacratíssimo Coração de Jesus, tende piedade de nós.\n\nSacratíssimo Coração de Jesus, tende piedade de nós.\n\nSacratíssimo Coração de Jesus, tende piedade de nós.",
  },
  {
    title: "Ladainha de São Miguel Arcanjo",
    content: `Senhor, tende piedade de nós.
Cristo, tende piedade de nós.
Senhor, tende piedade de nós.
Cristo, ouvi-nos.
Cristo, atendei-nos.

Deus Pai do Céu, tende piedade de nós.
Deus Filho, Redentor do mundo, tende piedade de nós.
Deus Espírito Santo, tende piedade de nós.
Santíssima Trindade, que sois um só Deus, tende piedade de nós.

Santa Maria, Rainha dos Anjos, rogai por nós.
São Miguel Arcanjo, rogai por nós.
São Miguel, cheio da graça de Deus, rogai por nós.
São Miguel, perfeito adorador do Verbo Divino, rogai por nós.
São Miguel, coroado de honra e de glória, rogai por nós.
São Miguel, poderosíssimo príncipe dos exércitos do Senhor, rogai por nós.
São Miguel, porta-estandarte da Santíssima Trindade, rogai por nós.
São Miguel, guardião do Paraíso, rogai por nós.
São Miguel, guia e consolador do povo israelita, rogai por nós.
São Miguel, esplendor e fortaleza da Igreja militante, rogai por nós.
São Miguel, honra e alegria da Igreja triunfante, rogai por nós.
São Miguel, luz dos Anjos, rogai por nós.
São Miguel, baluarte dos cristãos, rogai por nós.
São Miguel, força dos que combatem pelo estandarte da Cruz, rogai por nós.
São Miguel, luz e confiança das almas no último momento da vida, rogai por nós.
São Miguel, socorro muito certo, rogai por nós.
São Miguel, nosso auxílio em todas as adversidades, rogai por nós.
São Miguel, arauto da sentença eterna, rogai por nós.
São Miguel, consolador das almas do Purgatório, rogai por nós.
São Miguel, a quem o Senhor incumbiu de receber as almas depois da morte, rogai por nós.
São Miguel, nosso príncipe, rogai por nós.
São Miguel, nosso advogado, rogai por nós.

Cordeiro de Deus, que tirais o pecado do mundo, perdoai-nos, Senhor.
Cordeiro de Deus, que tirais o pecado do mundo, ouvi-nos, Senhor.
Cordeiro de Deus, que tirais o pecado do mundo, tende piedade de nós.

Rogai por nós, ó glorioso São Miguel, príncipe da Igreja de Jesus Cristo.
Para que sejamos dignos de suas promessas.

Oremos: Senhor Jesus Cristo, santificai-nos por uma bênção sempre nova e concedei-nos, pela intercessão de São Miguel Arcanjo, aquela sabedoria que nos ensina a juntar riquezas no Céu e a trocar os bens do tempo presente pelos bens eternos. Vós que viveis e reinais pelos séculos dos séculos. Amém.`,
  },
  {
    title: "Oração conclusiva tradicional",
    content: "Gloriosíssimo príncipe da milícia celeste, São Miguel Arcanjo, defendei-nos no combate e na luta contra os principados e potestades, contra os dominadores deste mundo tenebroso, contra os espíritos malignos espalhados pelos ares. Vinde em auxílio dos homens, que Deus criou incorruptíveis à sua imagem e semelhança e resgatou por grande preço da tirania do demônio. Combatei hoje, com o exército dos Anjos, a batalha do Senhor, como outrora combatestes contra Lúcifer, chefe do orgulho, e contra seus anjos apóstatas. Amém.",
  },
] as const;

export const SAINT_MICHAEL_CONSECRATION = "Ó nobilíssimo príncipe dos Anjos, valoroso guerreiro do Altíssimo, zeloso defensor da glória do Senhor, terror dos espíritos rebeldes, amor e delícia de todos os Anjos justos, meu diletíssimo Arcanjo São Miguel, desejando eu fazer parte do número dos vossos devotos e servos, a vós hoje me consagro, me dou e me ofereço. Ponho a mim mesmo, a minha família e tudo o que me pertence debaixo da vossa poderosíssima proteção. Amém.";

export const SAINT_MICHAEL_LENT: SpiritualJourney = {
  id: "quaresma-sao-miguel-arcanjo",
  title: "Quaresma de São Miguel Arcanjo",
  description: "Quarenta dias de oração, penitência e combate espiritual sob a proteção de São Miguel Arcanjo.",
  image: "/assets/dashboard/novenas.webp",
  totalDays: 40,
  traditionalStart: { month: 8, day: 15 },
  traditionalEnd: { month: 9, day: 29 },
  allowsCustomStart: true,
  category: "devocional",
  accessType: "traditional-free",
  days: [
    {
      number: 1,
      title: "Dia 1",
      theme: "Quem é como Deus?",
      scripture: {
        reference: "Apocalipse 12,7",
        text: "Houve então uma batalha no céu: Miguel e seus anjos guerrearam contra o Dragão.",
        explanation: "Na Sagrada Escritura, o nome 'Mi-Ka-El' expressa o grito de vitória dos anjos fiéis contra a soberba de Lúcifer. Enquanto o adversário quis ser como Deus, São Miguel coloca a soberania divina acima de todas as coisas.",
      },
      meditation: "O nome de Miguel é uma pergunta que recoloca todas as coisas diante de Deus: quem é como Deus? Ao iniciar esta Quaresma, reconheça com humildade que somente o Senhor é digno de toda adoração. Peça a São Miguel a graça de permanecer fiel quando o orgulho tentar ocupar o lugar de Deus em seu coração.",
      virtue: "Humildade",
      purpose: "Realizar uma boa ação sem contar a ninguém.",
      suggestedPenance: "Renunciar a uma pequena satisfação e oferecê-la pela conversão dos pecadores.",
      spiritualExercise: "Reserve 5 minutos de silêncio absoluto para contemplar a grandeza de Deus e reconhecer a própria pequenez com profunda gratidão.",
      examination: [
        "Tenho buscado a vontade de Deus antes da minha?",
        "Em que situações o orgulho tem ferido minha relação com os outros?",
        "Hoje consegui praticar o bem sem procurar reconhecimento?",
      ],
      saintQuote: "A humildade é o fundamento e a guarda de todas as virtudes. - São Bernardo de Claraval",
      complementaryPrayer: "São Miguel Arcanjo, ensinai-me a adorar somente a Deus e a servir com humildade. Guardai meu coração de todo orgulho e conduzi-me na fidelidade a Cristo. Amém.",
    },
    {
      number: 2,
      title: "Dia 2",
      theme: "Revesti-vos da armadura de Deus",
      scripture: {
        reference: "Efésios 6,11",
        text: "Revesti-vos da armadura de Deus, para que possais resistir às ciladas do demônio.",
        explanation: "São Paulo utiliza a imagem militar da armadura romana para explicar as armas espirituais do cristão: a verdade por cinturão, a justiça por couraça, a fé por escudo e a Palavra de Deus como espada.",
      },
      meditation: "A fortaleza cristã não é dureza de coração, mas perseverança serena em Deus. São Paulo convida-nos a vestir a armadura que o Senhor oferece: verdade, justiça, fé e oração. Nas dificuldades deste dia, não lute sozinho; invoque São Miguel e permaneça firme na graça.",
      virtue: "Fortaleza",
      purpose: "Diante de cada dificuldade, rezar: “São Miguel Arcanjo, defendei-nos no combate”.",
      suggestedPenance: "Evitar murmurações e reclamações durante o dia.",
      spiritualExercise: "Sempre que sentir impaciência ou vontade de reclamar, faça uma pausa respirando fundo e pronunciando internamente a oração a São Miguel.",
      examination: [
        "De que dificuldade tenho fugido em vez de entregá-la a Deus?",
        "Minhas palavras hoje foram de esperança ou de murmuração?",
        "Tenho recorrido à oração antes de reagir às contrariedades?",
      ],
      saintQuote: "A medida do amor é amar sem medida. - São Bernardo de Claraval",
      complementaryPrayer: "Príncipe da milícia celeste, fortalecei-me nas provações. Que eu me revista da fé e responda às dificuldades com confiança, silêncio e perseverança. Amém.",
    },
  ],
};