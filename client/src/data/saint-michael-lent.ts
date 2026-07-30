export interface ChurchTraditionSection {
  cic?: { code: string; text: string }[];
  fathers?: { author: string; text: string; source?: string }[];
  doctors?: { author: string; text: string }[];
  magisterium?: { author: string; text: string }[];
}

export interface SaintQuoteItem {
  author: string;
  quote: string;
  source?: string;
}

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
  saintQuotesList?: SaintQuoteItem[];
  churchTradition?: ChurchTraditionSection;
  deliveryPrayer?: string;
  familyConsecration?: string;
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
    title: "1. Preparação do Ambiente & Intenção",
    content: "Encontre um local silencioso, de preferência diante de uma imagem de São Miguel Arcanjo ou um crucifixo. Recolha seus pensamentos e faça uma pausa de silêncio para se colocar na presença de Deus.",
  },
  {
    title: "2. Iluminação da Vela",
    content: "Acenda uma vela benta (caso seja possível) simbolizando a luz de Cristo que dissipa as trevas e sua intenção de oração que sobe aos céus.",
  },
  {
    title: "3. Sinal da Cruz",
    content: "Pelo sinal da Santa Cruz, livrai-nos, Deus, Nosso Senhor, dos nossos inimigos. Em nome do Pai, e do Filho, e do Espírito Santo. Amém.",
  },
  {
    title: "4. Oração Inicial a São Miguel Arcanjo (Papa Leão XIII)",
    content: "São Miguel Arcanjo, defendei-nos no combate; sede o nosso refúgio contra as maldades e ciladas do demônio. Ordene-lhe Deus, instantemente o pedimos, e vós, príncipe da milícia celeste, pela virtude divina, precipitai no inferno a Satanás e a todos os espíritos malignos que vagam pelo mundo para perder as almas. Amém.",
  },
  {
    title: "5. Invocação ao Sacratíssimo Coração de Jesus",
    content: "Sacratíssimo Coração de Jesus, tende piedade de nós. (Rezar 3 vezes)\n\nSacratíssimo Coração de Jesus, tende piedade de nós.\n\nSacratíssimo Coração de Jesus, tende piedade de nós.",
  },
  {
    title: "6. Ladainha Completa de São Miguel Arcanjo",
    content: `Senhor, tende piedade de nós.
Jesus Cristo, tende piedade de nós.
Senhor, tende piedade de nós.
Jesus Cristo, ouvi-nos.
Jesus Cristo, atendei-nos.

Pai Celestial, que sois Deus, tende piedade de nós.
Filho, Redentor do mundo, que sois Deus, tende piedade de nós.
Espírito Santo, que sois Deus, tende piedade de nós.
Santíssima Trindade, que sois um só Deus, tende piedade de nós.

Santa Maria, Rainha dos Anjos, rogai por nós.
São Miguel Arcanjo, rogai por nós.
São Miguel, cheio da graça de Deus, rogai por nós.
São Miguel, perfeito adorador do Verbo Divino, rogai por nós.
São Miguel, coroado de glória e de honra, rogai por nós.
São Miguel, poderosíssimo Príncipe dos Exércitos do Senhor, rogai por nós.
São Miguel, porta-estandarte da Santíssima Trindade, rogai por nós.
São Miguel, guardião do Paraíso, rogai por nós.
São Miguel, guia e consolador do povo de Deus, rogai por nós.
São Miguel, esplendor e fortaleza da Igreja militante, rogai por nós.
São Miguel, honra e alegria da Igreja triunfante, rogai por nós.
São Miguel, luz dos anjos, rogai por nós.
São Miguel, baluarte dos cristãos, rogai por nós.
São Miguel, força daqueles que combatem sob a cruz, rogai por nós.
São Miguel, luz e confiança das almas no último momento da vida, rogai por nós.
São Miguel, socorro certíssimo, rogai por nós.
São Miguel, nosso auxílio em todas as nossas adversidades, rogai por nós.
São Miguel, mensageiro da sentença eterna, rogai por nós.
São Miguel, consolador das almas do Purgatório, rogai por nós.
São Miguel, a quem o Senhor incumbiu de receber as almas após a morte, rogai por nós.
São Miguel, nosso Príncipe, rogai por nós.
São Miguel, nosso Advogado, rogai por nós.

Cordeiro de Deus, que tirais o pecado do mundo, perdoai-nos, Senhor.
Cordeiro de Deus, que tirais o pecado do mundo, ouvi-nos, Senhor.
Cordeiro de Deus, que tirais o pecado do mundo, tende piedade de nós.

V. Rogai por nós, ó glorioso São Miguel, príncipe da Igreja de Cristo.
R. Para que sejamos dignos de suas promessas.`,
  },
  {
    title: "7. Consagração Solene a São Miguel Arcanjo",
    content: "Consagração a São Miguel Arcanjo: Ó nobilíssimo Príncipe dos Anjos, valoroso guerreiro do Altíssimo, zeloso defensor da glória do Senhor, terror dos espíritos rebeldes, amor e delícia de todos os anjos justos, meu amado Arcanjo São Miguel, desejando eu fazer parte do número dos vossos devotos e servos, a vós hoje me ofereço e me dedico, e coloco a mim mesmo, minha família, meu trabalho, meus bens e toda a minha vida sob a vossa proteção. É pouca a oferta do meu serviço, sendo eu um miserável pecador, mas vós engrandecereis o afeto do meu coração. Lembrai-vos de que, se a partir de hoje estou sob vosso patronato, deveis assistir-me em toda a minha vida, obter-me o perdão dos meus muitos e graves pecados, a graça de amar de coração a meu Deus, ao meu doce Salvador Jesus e à minha doce Mãe Maria, e impetrar-me todos os auxílios necessários para alcançar a coroa da glória eterna. Defendei-me sempre dos inimigos da minha alma, especialmente no último momento da minha vida. Vinde, pois, ó glorioso Príncipe, assistir-me na última luta e com a vossa arma poderosa lançai para longe de mim, nos abismos do inferno, aquele anjo prevaricador e soberbo que um dia prostrastes no combate do Céu. Amém.",
  },
  {
    title: "8. Consagração da Família a São Miguel Arcanjo",
    content: "Ó Grande São Miguel Arcanjo, príncipe e chefe das legiões angélicas, penetrado do sentimento de vossa grandeza, de vossa, bondade e vosso poder, em presença da adorável Santíssima Trindade, da Virgem Maria e toda a corte celeste, venho hoje consagrar minha família a vós. Quero, com minha família, vos honrar e invocar fielmente. Recebei-nos sob vossa especial proteção e dignai-vos desde então velar sobre os nossos interesses espirituais e temporais. Conservai entre nós a perfeita união do espírito dos corações e do amor familiar. Defendei-nos contra o ataque inimigo, preservai-nos de todo mal e, particularmente, da desgraça de ofender a Deus. Que por nossos cuidados, devotados e vigilantes, cheguemos todos à felicidade eterna. Dignai-vos, grande São Miguel Arcanjo, reunir todos os membros de nossa família. Amém.",
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
      theme: "Quem é como Deus? (O Combate contra a Soberba)",
      scripture: {
        reference: "Apocalipse 12, 7-9",
        text: "Houve então uma batalha no céu: Miguel e seus anjos guerrearam contra o Dragão. O Dragão lutou juntamente com os seus anjos, mas não prevaleceu; e já não houve lugar para eles no céu.",
        explanation: "No plano original da criação, os anjos foram provados na sua liberdade e amor a Deus. O dragão representa a soberba angelical, a pretensão de autossubstância. O nome Miguel (Mi-ka-El) não é apenas um nome próprio, mas uma pergunta teológica de vitória divina: \"Quem é como Deus?\". Com este grito de humildade radical e adoração, São Miguel derrotou a soberba do anjo rebelde que dizia \"Não servirei\" (Non serviam). O combate de Apocalipse 12 é o protótipo de nossa batalha diária contra o orgulho que nos afasta da presença viva de Deus.",
      },
      meditation: `Irmão e irmã na fé, ao iniciarmos esta Quaresma de São Miguel Arcanjo, convido você a olhar honestamente para o seu coração. Como devotos, muitas vezes trazemos feridas profundas escondidas sob a aparência de piedade. Queremos fazer a vontade de Deus, mas quantas vezes exigimos, no fundo, que Deus faça a nossa vontade?

São Francisco de Assis, no ano de 1224, retirou-se para a solidão do Monte Alverne porque sabia que o inimigo ataca principalmente pela vaidade. Quando o meu eu tenta se colocar no centro, a vida se torna pesada, azeda e cheia de melindres. Quando ouço um conselho ou uma crítica, o meu orgulho imediatamente se levanta para se defender. Quando alguém não reconhece o meu valor ou o meu trabalho na família ou na comunidade, o amargor toma conta do meu espírito.

O brado de São Miguel "Quem é como Deus?" não é um grito de arrogância triunfalista, mas um ato de amor sublime e desapego absoluto. Dizer "Quem é como Deus?" significa libertar-se da necessidade de controlar tudo, de impressionar os outros ou de guardar ressentimentos. Significa reconhecer com doçura: "Eu não sou Deus. Eu não posso salvar a mim mesmo. Eu preciso do meu Salvador e do auxílio dos Seus anjos."

Neste primeiro dia, não tenha medo de se apresentar diante do Senhor exatamente como você está: cansado, com suas imperfeições e lutas diárias. Deixe que o Arcanjo São Miguel arranque do seu peito as garras do orgulho e plante a semente da verdadeira paz.`,
      virtue: "Humildade (Combate contra a Soberba)",
      purpose: "Praticar a mansidão diante de contrariedades, sem se justificar nem reagir com rispidez.",
      suggestedPenance: "Renunciar a uma pequena satisfação e oferecê-la pela conversão dos pecadores.",
      spiritualExercise: "Hoje pratique a mansidão diante de uma contrariedade: se for interrompido, criticado ou contrariado no dia de hoje, não se justifique nem reaja com rispidez. Guarde silêncio amoroso e diga interiormente: 'São Miguel, ensina-me a ser pequeno para que Deus seja tudo em mim'.",
      churchTradition: {
        cic: [
          {
            code: "CIC §391-392",
            text: "A Escritura atesta o impacto nefasto daquele que Jesus chama de 'homicida desde o princípio'... Este pecado consiste na escolha livre destes espíritos criados, que rejeitaram radical e irrevogavelmente a Deus e o seu Reino.",
          },
          {
            code: "CIC §1850",
            text: "O pecado é uma ofensa a Deus... É o amor de si mesmo até ao desprezo de Deus.",
          },
        ],
        fathers: [
          {
            author: "Santo Agostinho",
            text: "Dois amores fundaram, pois, duas cidades: o amor de si mesmo até ao desprezo de Deus, a cidade terrestre; o amor de Deus até ao desprezo de si mesmo, a cidade celestial. Aquela gloria-se em si mesma; esta, no Senhor.",
            source: "De Civitate Dei",
          },
        ],
        doctors: [
          {
            author: "São Tomás de Aquino",
            text: "A soberba é assim chamada porque o homem quer erguer-se acima daquilo que é... Por isso, a soberba é o princípio e a raiz de todo pecado.",
          },
          {
            author: "São Bernardo de Claraval",
            text: "A humildade é a virtude pela qual o homem se conhece exatamente como é e, por este conhecimento verdadeiro, se torna desprezível aos seus próprios olhos.",
          },
        ],
        magisterium: [
          {
            author: "Papa São Gregório Magno",
            text: "A soberba é o sinal da ruína iminente. Quando o coração se engorda de complacência própria, deixa de ter espaço para a luz e a graça do Espírito Santo.",
          },
        ],
      },
      deliveryPrayer: `Feche suavemente os olhos. Descanse suas mãos no colo, relaxe os ombros e acompanhe mentalmente em recolhimento absoluto.

Senhor Deus, Pai de infinita Misericórdia... Eis-me aqui, no início desta jornada de 40 dias. Fecho meus olhos para o barulho do mundo e abro a minha alma para a Vossa presença radiante.

Reconheço, Senhor, as vezes em que deixei o orgulho guiar minhas palavras, os meus julgamentos e as minhas atitudes no lar e no trabalho. Reconheço as vezes em que quis ser servido em vez de servir, e em que busquei aplausos humanos.

Hoje, na companhia de São Miguel Arcanjo, deposito aos Vossos pés todo o meu egocentrismo. Com o Santo Arcanjo eu proclamo do fundo do meu ser: Quem é como Deus? Ninguém, Senhor! Só Vós sois a minha Rocha, o meu Rei e a minha Salvação.

Enviai o Vosso Arcanjo São Miguel para defender o meu coração neste combate. Que a Vossa graça me conceda a alegria da simplicidade e o dom da santa humildade. Amém.`,
      familyConsecration: "Ó Grande São Miguel Arcanjo, príncipe e chefe das legiões angélicas, penetrado do sentimento de vossa grandeza, de vossa, bondade e vosso poder, em presença da adorável Santíssima Trindade, da Virgem Maria e toda a corte celeste, venho hoje consagrar minha família a vós. Quero, com minha família, vos honrar e invocar fielmente. Recebei-nos sob vossa especial proteção e dignai-vos desde então velar sobre os nossos interesses espirituais e temporais. Conservai entre nós a perfeita união do espírito dos corações e do amor familiar. Defendei-nos contra o ataque inimigo, preservai-nos de todo mal e, particulamente, da desgraça de ofender a Deus. Que por nossos cuidados, devotados e vigilantes, cheguemos todos à felicidade eterna. Dignai-vos, grande São Miguel Arcanjo, reunir todos os membros de nossa família. Amém.",
      examination: [
        "Senti raiva ou ressentimento quando minhas opiniões não foram aceitas ou quando não recebi atenção?",
        "Busquei me gabar ou chamar atenção para os meus méritos e virtudes ao longo do dia?",
        "Critiquei ou julguei alguém interiormente para me sentir superior?",
      ],
      saintQuote: "A humildade é a pedra angular de todas as virtudes cristãs. Sem ela, nenhuma outra virtude pode subsistir na alma. - São Bernardo de Claraval",
      saintQuotesList: [
        {
          author: "São Bernardo de Claraval",
          quote: "A humildade é a pedra angular de todas as virtudes cristãs. Sem ela, nenhuma outra virtude pode subsistir na alma.",
          source: "Sermões sobre o Cântico dos Cânticos",
        },
        {
          author: "Santo Afonso Maria de Ligório",
          quote: "Um coração cheio de si mesmo não deixa espaço para Deus; esvazia-te de ti mesmo para que Deus possa te preencher com Sua presença.",
          source: "A Prática do Amor a Jesus Cristo",
        },
        {
          author: "São Tomás de Aquino",
          quote: "A verdadeira humildade não consiste em fingir que não temos dons, mas em reconhecer que tudo o que temos vem de Deus e a Ele pertence.",
          source: "Suma Teológica",
        },
        {
          author: "São Francisco de Sales",
          quote: "Não te inquietes se fores esquecido ou pouco estimado pelos homens. Se Deus te ama e te guarda sob Suas asas, o que mais podes desejar?",
          source: "Introdução à Vida Devota",
        },
      ],
      complementaryPrayer: "Deus Todo-Poderoso e Eterno, que por um prodígio de bondade e misericórdia para a salvação dos homens, escolhestes para Príncipe de vossa Igreja o gloriosíssimo Arcanjo São Miguel, tornai-nos dignos, nós vos pedimos, de sermos preservados de todos os nossos inimigos, a fim de que, na hora da nossa morte, nenhum deles nos possa inquietar, mas que nos seja dado ser introduzidos por ele na presença da vossa excelsa e divina Majestade. Por Jesus Cristo, nosso Senhor. Amém.",
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