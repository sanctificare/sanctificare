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
        explanation: `No plano original da criação, os anjos foram provados na sua liberdade e no seu amor ao Criador. O Dragão representa a soberba angelical, a pretensão de autossuficiência e a rejeição da soberania de Deus. O nome Miguel (Mi-ka-El) não é apenas um nome próprio, mas uma pergunta teológica vibrante de vitória divina: "Quem é como Deus?".

Com este brado de humildade radical e adoração pura, São Miguel derrotou a soberba do anjo rebelde que ousou dizer "Não servirei" (Non serviam). O combate retratado em Apocalipse 12 é o protótipo eterno de nossa batalha diária contra o orgulho e a autoexaltação que nos afastam da presença viva do Pai.

Ao contemplarmos esta passagem bíblica, somos chamados a imitar a atitude dos Santos Anjos. Reconhecer a nossa pequenez diante da majestade de Deus não é humilhação estéril, mas a chave que abre as portas para a verdadeira liberdade e santidade cristã.`,
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
      theme: "Revesti-vos da Armadura de Deus (O Combate contra a Acídia e o Desânimo)",
      scripture: {
        reference: "Efésios 6, 11-17",
        text: "Revesti-vos da armadura de Deus, para que possais resistir às ciladas do demônio. Pois não é contra homens de carne e sangue que temos de lutar, mas contra os principados e potestades, contra os dominadores deste mundo tenebroso, contra os espíritos malignos espalhados pelos ares. Por isso, empenhai as armas de Deus, para que possais resistir no dia mau e, depois de ter vencido tudo, permanecer inabaláveis.",
        explanation: `A guerra espiritual travada pelo cristão não é realizada com violência humana ou forças carnais, mas com a graça onipotente de Deus. O Apóstolo São Paulo nos exorta a tomar a couraça da justiça, o capacete da salvação, o escudo da fé e a espada do Espírito, que é a Palavra viva de Deus.

Sob a proteção soberana de São Miguel Arcanjo, general das milícias celestes, aprendemos que o demônio costuma atacar sutilmente pela tibieza, pelo cansaço e pela paralisia do desânimo. Revestir-se da armadura divina significa viver vigilante na graça santificante e alimentar a alma com os sacramentos da Igreja.

Diante das adversidades do dia a dia, a Palavra nos convida a permanecer inabaláveis, sabendo que a vitória final pertence ao Senhor. Não combatemos sozinhos: os exércitos angélicos batalham ao nosso lado contra as potências das trevas.`,
      },
      meditation: `Irmão e irmã na fé, no segundo dia de nossa Quaresma de São Miguel Arcanjo, a Igreja nos chama à vigilância das armas espirituais. Muitas vezes iniciamos nossa caminhada com grande entusiasmo, mas logo ao primeiro sinal de cansaço ou contrariedade, sentimos o peso da tentação e a sutil paralisia da acídia — a preguiça da alma e a tibieza espiritual.

O inimigo de nossas almas busca nos desarmar retirando nossa esperança e nossa constante união com Deus. Ele não precisa nos derrubar de uma só vez; basta nos fazer murmurar diante dos pequenos sacrifícios diários, ceder ao desânimo e abandonar a frequência aos sacramentos e à oração diária.

São Miguel Arcanjo é o grande estrategista do Céu. Ele não combate com armas terrenas, mas com a contemplação da Glória de Deus e com uma fidelidade inabalável. Quando invocamos o Arcanjo São Miguel no meio de nossas lutas cotidianas, seu brado nos recorda que nenhuma força das trevas pode prevalecer sobre aquele que está revestido da graça de Cristo. Não consinta com os pensamentos de derrota. Erga a cabeça, renove a sua fé e vista hoje a armadura da perseverança.`,
      virtue: "Fortaleza (Combate contra a Acídia e o Desânimo)",
      purpose: "Evitar murmurações e reclamações durante todo o dia, oferecendo cada contrariedade com alegria por amor a Cristo.",
      suggestedPenance: "Evitar murmurações e reclamações durante todo o dia, oferecendo cada contrariedade com um sorriso por amor a Cristo.",
      spiritualExercise: "Sempre que sentir impaciência, cansaço ou vontade de reclamar durante o dia, faça uma pausa, respire fundo e reze internamente 3 vezes: 'São Miguel Arcanjo, defendei-me e fortalecei minha fé'.",
      churchTradition: {
        cic: [
          {
            code: "CIC §2015",
            text: "O caminho da perfeição passa pela cruz. Não há santidade sem renúncia e sem combate espiritual. O progresso espiritual implica a ascese e a mortificação, que conduzem gradualmente a viver na paz e na alegria das bem-aventuranças.",
          },
          {
            code: "CIC §2728",
            text: "O combate de oração deve enfrentar aquilo que experimentamos como nossas falhas: o desânimo diante de nossas aridez e tibieza, e a tristeza de não termos dado tudo ao Senhor.",
          },
        ],
        fathers: [
          {
            author: "Santo Inácio de Antioquia",
            text: "Permanecei firmes como a bigorna sob os golpes do martelo. É próprio do grande atleta receber golpes e vencer.",
            source: "Carta a São Policarpo",
          },
        ],
        doctors: [
          {
            author: "São João da Cruz",
            text: "A alma que caminha no amor de Deus não se cansa nem se enfada nas dificuldades; encontra sua força no silêncio da esperança.",
          },
          {
            author: "São Padre Pio de Pietrelcina",
            text: "A oração é a melhor arma que possuímos; ela é uma chave que abre o coração de Deus. Não desanimeis se a luta for árdua.",
          },
        ],
        magisterium: [
          {
            author: "Papa São Leão Magno",
            text: "O combate espiritual é inevitável aos filhos de Deus. Ninguém pode alcançar a vitória se recusar entrar no combate das virtudes contra os vícios.",
          },
        ],
      },
      deliveryPrayer: `Feche suavemente os olhos. Coloque a mão sobre o peito e respire fundo na presença de Deus.

São Miguel Arcanjo, invencível defensor da Igreja, eis-me aqui diante de vós no segundo dia deste santo combate. Entrego em vossas mãos toda a minha fraqueza, a minha tibieza e a tentação de desanimar diante das cruzes de cada dia.

Alcançai-me do Espírito Santo a força para jamais murmurar ou ceder ao desânimo. Revesti a minha alma com a couraça da fé e o escudo da verdade. Que diante de qualquer cilada do adversário, eu possa clamar com confiança: São Miguel Arcanjo, defendei-nos no combate! Amém.`,
      familyConsecration: "Ó Grande São Miguel Arcanjo, príncipe e chefe das legiões angélicas, penetrado do sentimento de vossa grandeza, de vossa, bondade e vosso poder, em presença da adorável Santíssima Trindade, da Virgem Maria e toda a corte celeste, venho hoje consagrar minha família a vós. Quero, com minha família, vos honrar e invocar fielmente. Recebei-nos sob vossa especial proteção e dignai-vos desde então velar sobre os nossos interesses espirituais e temporais. Conservai entre nós a perfeita união do espírito dos corações e do amor familiar. Defendei-nos contra o ataque inimigo, preservai-nos de todo mal e, particularmente, da desgraça de ofender a Deus. Que por nossos cuidados, devotados e vigilantes, cheguemos todos à felicidade eterna. Dignai-vos, grande São Miguel Arcanjo, reunir todos os membros de nossa família. Amém.",
      examination: [
        "Murmurei ou reclamei das cruzes e deveres ordinários do meu dia?",
        "Cedi ao desânimo ou à preguiça na hora da oração e das minhas obrigações?",
        "Busquei a força de Deus nos momentos de tentação ou tentei lutar apenas com minhas próprias forças?",
      ],
      saintQuote: "A oração é a melhor arma que temos; é a chave que abre o Coração de Deus. - São Padre Pio de Pietrelcina",
      saintQuotesList: [
        {
          author: "São Padre Pio de Pietrelcina",
          quote: "A oração é a melhor arma que temos; é a chave que abre o Coração de Deus. Deveis falar a Jesus também com o coração, além de com os lábios.",
          source: "Cartas Espirituais",
        },
        {
          author: "São João Maria Vianney (Cura d'Ars)",
          quote: "O demônio não teme as almas mornas, mas treme diante daquela que reza com perseverança e vive revestida da graça de Deus.",
          source: "Sermões do Cura d'Ars",
        },
        {
          author: "Santa Teresa d'Ávila",
          quote: "Determinação, e determinada determinação de nunca parar até alcançar a fonte da água viva, venha o que vier, custe o que custar.",
          source: "Caminho de Perfeição",
        },
        {
          author: "São João da Cruz",
          quote: "Nas dificuldades e securas espirituais, mantenha a alma em paz e confiança; Deus combate por aqueles que n'Ele esperam.",
          source: "Ditos de Luz e Amor",
        },
      ],
      complementaryPrayer: "Deus Todo-Poderoso e Eterno, que por um prodígio de bondade e misericórdia para a salvação dos homens, escolhestes para Príncipe de vossa Igreja o gloriosíssimo Arcanjo São Miguel, tornai-nos dignos, nós vos pedimos, de sermos preservados de todos os nossos inimigos, a fim de que, na hora da nossa morte, nenhum deles nos possa inquietar, mas que nos seja dado ser introduzidos por ele na presença da vossa excelsa e divina Majestade. Por Jesus Cristo, nosso Senhor. Amém.",
    },
    {
      number: 3,
      title: "Dia 3",
      theme: "O Escudo da Fé (O Combate contra as Dúvidas e a Incredulidade)",
      scripture: {
        reference: "Efésios 6, 16",
        text: "Em todas as circunstâncias, empenhai o escudo da fé, com o qual podereis apagar todos os dardos inflamados do Maligno.",
        explanation: `O escudo da fé é a proteção indispensável para guardar o coração humano das investidas sopradas pelo adversário das nossas almas. O inimigo busca semear pensamentos de dúvida, ceticismo e desconfiança em relação à misericórdia, à providência e às promessas de Cristo.

Quando levantamos o escudo da fé através da oração perseverante e do recolhimento, os dardos inflamados da incerteza perdem inteiramente o seu poder destrutivo. A fé teologal não se baseia em sentimentos passageiros, mas na adesão firme da inteligência à Verdade divina revelada.

São Miguel Arcanjo nos ensina a permanecer inabaláveis mesmo nas horas de aridez espiritual e escuridão exterior. Quem se apoia na palavra de Deus com confiança filial jamais será confundido pelas tempestades da vida.`,
      },
      meditation: `Irmão e irmã na fé, no terceiro dia da Quaresma de São Miguel Arcanjo, somos chamados a fortificar nossa fé diante das tempestades da vida. O demônio ataca a inteligência e o coração espalhando o veneno da dúvida: faz-nos duvidar da misericórdia de Deus após uma queda, duvidar do cuidado divino na doença ou no desemprego, e duvidar de que o Senhor escuta nossas preces.

São Miguel Arcanjo é o protótipo da fé inabalável. Quando Lúcifer e os anjos rebeldes duvidaram da sabedoria e do plano de Deus, Miguel se levantou não por força própria, mas ancorado na certeza absoluta da grandeza do Senhor. Sua resposta ao demônio foi a própria afirmação de fé: 'Quem é como Deus?'.

Em nossa caminhada diária, ter fé não significa ausência de trevas ou sentimentos de aridez, mas a decisão firme da vontade em aderir à Verdade revelada por Cristo e preservada pela Santa Igreja. Quando a dúvida bater à porta da sua alma, não discuta com a tentação; erga o escudo da fé, faça um ato de entrega e confie totalmente nos desígnios do Pai.`,
      virtue: "Fé Viva e Inabalável",
      purpose: "Fazer atos explícitos de fé ('Senhor, eu creio, mas aumentai a minha fé!') ao longo do dia, especialmente diante de apreensões.",
      suggestedPenance: "Abster-se de reclamações ou conversas fúteis e fazer 3 atos de fé durante o dia.",
      spiritualExercise: "Em um momento de recolhimento, de joelhos se possível, reze devagar o Credo e ofereça sua mente para ser iluminada pela luz de Cristo.",
      churchTradition: {
        cic: [
          {
            code: "CIC §1814",
            text: "A fé é a virtude teologal pela qual cremos em Deus e em tudo o que Ele nos disse e revelou, e que a Santa Igreja nos propõe para crer, porque Ele é a própria verdade.",
          },
          {
            code: "CIC §162",
            text: "A fé é um dom gratuito que Deus faz ao homem. Podemos perder este dom inestimável; para viver, crescer e perseverar na fé até o fim, devemos alimentá-la com a Palavra de Deus e a oração.",
          },
        ],
        fathers: [
          {
            author: "São João Crisóstomo",
            text: "A fé é a luz da alma, a porta da vida e o fundamento da salvação eterna.",
            source: "Homilias sobre o Evangelho de São Mateus",
          },
        ],
        doctors: [
          {
            author: "São Tomás de Aquino",
            text: "Crer é um ato da inteligência que assente à verdade divina por imperativo da vontade movida por Deus mediante a graça.",
          },
          {
            author: "São Bernardo de Claraval",
            text: "A fé não é uma opinião incerta, mas uma certeza firme que habita no fundo do coração pelo Espírito Santo.",
          },
        ],
        magisterium: [
          {
            author: "Papa Bento XVI",
            text: "A fé é um encontro pessoal com Jesus Cristo que transforma a existência e nos concede o olhar com o qual Deus vê a realidade.",
          },
        ],
      },
      deliveryPrayer: `Feche suavemente os olhos e coloque a mão sobre a Sagrada Escritura ou sobre o coração.

São Miguel Arcanjo, Príncipe da Milícia Celeste e Defensor da Fé Católica, vinde em meu auxílio. Apagai com o vosso escudo brilhante todos os dardos inflamados da dúvida, do ceticismo e da insegurança espiritual que tentam perturbar a minha alma.

Alcançai-me do Senhor uma fé viva, operante pela caridade e inabalável nas provações. Que eu caminhe firme, não por vista humana, mas pela certeza de que Deus nunca falha. São Miguel, guardai minha fé até o meu último suspiro. Amém.`,
      familyConsecration: "Ó Grande São Miguel Arcanjo, príncipe e chefe das legiões angélicas, penetrado do sentimento de vossa grandeza, de vossa, bondade e vosso poder, em presença da adorável Santíssima Trindade, da Virgem Maria e toda a corte celeste, venho hoje consagrar minha família a vós. Quero, com minha família, vos honrar e invocar fielmente. Recebei-nos sob vossa especial proteção e dignai-vos desde então velar sobre os nossos interesses espirituais e temporais. Conservai entre nós a perfeita união do espírito dos corações e do amor familiar. Defendei-nos contra o ataque inimigo, preservai-nos de todo mal e, particularmente, da desgraça de ofender a Deus. Que por nossos cuidados, devotados e vigilantes, cheguemos todos à felicidade eterna. Dignai-vos, grande São Miguel Arcanjo, reunir todos os membros de nossa família. Amém.",
      examination: [
        "Deixei que a dúvida ou o ceticismo esfriassem meu fervor na oração e nos sacramentos?",
        "Procurei alimentar minha fé com boas leituras e a palavra de Deus, ou alimentei a mente com distrações mundanas?",
        "Diante de dificuldades, confiei na Providência divina ou me deixei levar pelo desespero secular?",
      ],
      saintQuote: "A fé é a garantia das coisas que se esperam e a certeza das realidades que não se vêem. - São Paulo Apóstolo",
      saintQuotesList: [
        {
          author: "São Padre Pio de Pietrelcina",
          quote: "Tenha fé e confiança; não se preocupe com o amanhã, pois o mesmo Pai Celestial que cuida de você hoje cuidará de você amanhã.",
          source: "Cartas Espirituais",
        },
        {
          author: "Santo Agostinho",
          quote: "A fé é crer no que não vês; e a recompensa desta fé é ver o que crês.",
          source: "Sermões",
        },
        {
          author: "São João da Cruz",
          quote: "Para a alma que caminha na fé, a própria escuridão se torna guia segura para a união com Deus.",
          source: "Subida do Monte Carmelo",
        },
        {
          author: "São Francisco de Sales",
          quote: "Uma fé viva não se assusta com as secas espirituais, porque sabe que o Sol da Justiça continua brilhando atrás das nuvens.",
          source: "Introdução à Vida Devota",
        },
      ],
      complementaryPrayer: "Deus Todo-Poderoso e Eterno, que por um prodígio de bondade e misericórdia para a salvação dos homens, escolhestes para Príncipe de vossa Igreja o gloriosíssimo Arcanjo São Miguel, tornai-nos dignos, nós vos pedimos, de sermos preservados de todos os nossos inimigos, a fim de que, na hora da nossa morte, nenhum deles nos possa inquietar, mas que nos seja dado ser introduzidos por ele na presença da vossa excelsa e divina Majestade. Por Jesus Cristo, nosso Senhor. Amém.",
    },
    {
      number: 4,
      title: "Dia 4",
      theme: "O Gládio da Verdade (O Combate contra a Mentira e a Fofoca)",
      scripture: {
        reference: "Salmo 141 (140), 3 / Efésios 4, 25",
        text: "Ponde, Senhor, uma guarda à minha boca, e guardai a porta dos meus lábios! Por isso, renunciai à mentira e falai a verdade cada um ao seu próximo, pois somos membros uns dos outros.",
        explanation: `A língua humana possui o imenso poder de edificar ou de destruir vidas e reputações. Jesus chama o demônio de 'pai da mentira', pois é através do engano, da fofoca e da calúnia que as trevas semeiam discórdia nos lares, comunidades e corações.

O salmista e o apóstolo São Paulo pedem uma guarda divina para a boca, exortando os fiéis a renunciar a toda mentira e a cultivar a veracidade nas palavras. Guardar a língua dos comentários maldosos e da maledicência é um ato fundamental de caridade e maturidade espiritual.

São Miguel Arcanjo, porta-estandarte da Verdade Altíssima, inspira-nos a usar a palavra para louvar a Deus e transmitir consolo aos irmãos. Uma alma que domina a sua linguagem guarda a sua consciência na perfeita paz de Cristo.`,
      },
      meditation: `Irmão e irmã na fé, no quarto dia de nossa Quaresma de São Miguel Arcanjo, voltamos o nosso olhar para a vigilância das palavras. Quantas vezes a paz das famílias, das comunidades e do próprio coração é destruída por murmurações, julgamentos precipitados, mentiras 'sociais' ou comentários maldosos a respeito dos irmãos.

Jesus nos ensina que do coração procede a boca. A mentira e a fofoca são sementes do maligno, que busca semear a divisão e o rancor entre os filhos de Deus. São Miguel Arcanjo é o porta-estandarte da Verdade Divina. Onde reina a mentira, aí está o espírito das trevas; onde reina a verdade dita com caridade, aí está a presença dos Santos Anjos.

Combater a mentira exige coragem para assumir os próprios erros, moderação ao falar dos outros e a santa decisão de guardar silêncio quando a palavra não for para edificar. Hoje, peça a São Miguel a graça de purificar a sua linguagem e tornar suas palavras fonte de luz, consolo e verdade.`,
      virtue: "Veracidade e Pureza de Lábios",
      purpose: "Não falar mal de ninguém durante todo o dia e elogiar com sinceridade uma qualidade de alguém com quem tenho dificuldade de conviver.",
      suggestedPenance: "Guardar silêncio sobre os defeitos alheios e evitar qualquer exagero ou mentira nas conversas do dia.",
      spiritualExercise: "Fazer uma pausa de silêncio de 10 minutos antes da oração da noite para examinar as palavras ditas ao longo do dia e pedir perdão por qualquer leviandade.",
      churchTradition: {
        cic: [
          {
            code: "CIC §2467",
            text: "O homem busca naturalmente a verdade. É tenazmente obrigado a aderir à verdade e a ordenar toda a sua vida segundo as exigências da verdade.",
          },
          {
            code: "CIC §2477",
            text: "O respeito pela reputação das pessoas proíbe qualquer atitude e palavra capazes de lhes causar um dano injusto: a detração e a calúnia.",
          },
        ],
        fathers: [
          {
            author: "São Gregório Nazianzeno",
            text: "A palavra é o espelho da alma: como é o homem, assim é a sua palavra.",
          },
        ],
        doctors: [
          {
            author: "São Tomás de Aquino",
            text: "A mentira é um vício oposto à veracidade. Todo engano nas palavras fere a justiça e a ordem devida nas relações humanas.",
          },
          {
            author: "São Francisco de Sales",
            text: "A língua do murmurador é como um dardo envenenado que fere três pessoas ao mesmo tempo: quem fala, quem escuta e aquele de quem se fala.",
          },
        ],
        magisterium: [
          {
            author: "Papa Francisco",
            text: "A fofoca é um terrorismo de palavras. Quem fofoca mata a reputação do irmão e destrói a comunhão da Igreja.",
          },
        ],
      },
      deliveryPrayer: `São Miguel Arcanjo, guerreiro da Verdade Altíssima, purificai a minha boca e o meu coração. Bani da minha vida toda mentira, engano, falsidade e o hábito destrutivo de falar dos defeitos dos outros.

Alcançai-me a graça da honestidade interior e da mansidão nas palavras. Que a minha língua seja usada apenas para louvar a Deus, defender a fé e semear a paz no meu lar e no meu trabalho. São Miguel Arcanjo, arcanjo da verdade, rogai por nós! Amém.`,
      familyConsecration: "Ó Grande São Miguel Arcanjo, príncipe e chefe das legiões angélicas, penetrado do sentimento de vossa grandeza, de vossa, bondade e vosso poder, em presença da adorável Santíssima Trindade, da Virgem Maria e toda a corte celeste, venho hoje consagrar minha família a vós. Quero, com minha família, vos honrar e invocar fielmente. Recebei-nos sob vossa especial proteção e dignai-vos desde então velar sobre os nossos interesses espirituais e temporais. Conservai entre nós a perfeita união do espírito dos corações e do amor familiar. Defendei-nos contra o ataque inimigo, preservai-nos de todo mal e, particularmente, da desgraça de ofender a Deus. Que por nossos cuidados, devotados e vigilantes, cheguemos todos à felicidade eterna. Dignai-vos, grande São Miguel Arcanjo, reunir todos os membros de nossa família. Amém.",
      examination: [
        "Falei mal de alguém ou divulguei fatos desnecessários sobre a vida de um irmão?",
        "Usei de mentiras, meias-verdades ou exagero para me defender ou me beneficiar?",
        "Consenti em ouvir conversas maldosas e fofocas sem defender a reputação do ausente?",
      ],
      saintQuote: "A verdade vos libertará. - Jesus Cristo (João 8, 32)",
      saintQuotesList: [
        {
          author: "São Bento de Nursia",
          quote: "Não dar testemunho falso; não murmurar; não falar mal de ninguém e pôr a guarda da boca no falar.",
          source: "Regra de São Bento",
        },
        {
          author: "São Felipe Neri",
          quote: "Falar mal do próximo é como espalhar penas ao vento: é impossível depois recolhê-las todas.",
          source: "Máximas Espirituais",
        },
        {
          author: "São Bernardo de Claraval",
          quote: "A calúnia é uma flecha de três pontas: fere o caluniador, quem a ouve e aquele que é caluniado.",
          source: "Sermões",
        },
        {
          author: "Santo Afonso Maria de Ligório",
          quote: "Quem guarda a sua boca guarda a sua alma de muitas aflições e amarguras.",
          source: "A Prática do Amor a Jesus Cristo",
        },
      ],
      complementaryPrayer: "Deus Todo-Poderoso e Eterno, que por um prodígio de bondade e misericórdia para a salvação dos homens, escolhestes para Príncipe de vossa Igreja o gloriosíssimo Arcanjo São Miguel, tornai-nos dignos, nós vos pedimos, de sermos preservados de todos os nossos inimigos, a fim de que, na hora da nossa morte, nenhum deles nos possa inquietar, mas que nos seja dado ser introduzidos por ele na presença da vossa excelsa e divina Majestade. Por Jesus Cristo, nosso Senhor. Amém.",
    },
    {
      number: 5,
      title: "Dia 5",
      theme: "A Castidade da Alma e do Corpo (O Combate contra a Luxúria e a Impureza)",
      scripture: {
        reference: "1 Coríntios 6, 19-20 / Mateus 5, 8",
        text: "Bem-aventurados os puros de coração, porque verão a Deus. Acaso não sabeis que o vosso corpo é templo do Espírito Santo, que habita em vós? Glorificai, pois, a Deus no vosso corpo!",
        explanation: `A virtude da castidade é a celebração do amor autêntico e a vitória da graça sobre a concupiscência e o egoísmo. A Sagrada Escritura nos recorda solenemente que o nosso corpo é templo e habitação do Espírito Santo, devendo ser guardado com profundo respeito e santidade.

Os puros de coração recebem a promessa de contemplar a Deus. São Miguel Arcanjo, espelho de pureza angélica, nos ensina a rejeitar prontamente as tentações da luxúria, da pornografia e de todas as contaminações morais propostas pelo mundo contemporâneo.

O combate pela pureza exige a custódia vigilante dos olhos, a modéstia no comportamento e o recurso frequente ao sacramento da Confissão. Preservar o corpo e a mente puros é preparar o coração para ser um sacrário vivo do Amor Divino.`,
      },
      meditation: `Irmão e irmã na fé, no quinto dia de nossa Quaresma de São Miguel Arcanjo, meditamos sobre a beleza da pureza de coração e da santa castidade. Em um mundo saturado de erotismo, pornografia e desordens morais, manter a alma e os sentidos puros tornou-se um ato heroico de combate espiritual.

São Miguel Arcanjo é o guardião da pureza angélica. Os anjos contemplam a face Imaculada de Deus e não consentem com nada que seja desordenado. A impureza obscurece a inteligência, paralisa a vida de oração, destrói os relacionamentos e arrasta a alma para a tristeza egocêntrica.

O combate pela castidade não é apenas uma renúncia negativa, mas uma afirmação positiva do amor sublime. Exige a custódia dos olhos (evitando olhar imagens e vídeos impróprios), a modéstia no vestir e no falar, e a imediata rejeição dos pensamentos impuros. Se você caiu ou se sente tentado nesta área, não desespere: peça o auxílio de São Miguel e corra para o sacramento da Confissão.`,
      virtue: "Castidade e Modéstia de Sentidos",
      purpose: "Fazer a custódia dos olhos no celular e na internet hoje, evitando visualizar imagens, vídeos ou conteúdos sugestivos.",
      suggestedPenance: "Oferecer um jejum de telas (redes sociais/entretenimento fútil) durante metade do dia pela pureza das famílias.",
      spiritualExercise: "Rezar um Mistério do Terço (ou 3 Ave-Marias) de joelhos, pedindo a Nossa Senhora Rainha dos Anjos e a São Miguel a graça da castidade nos pensamentos, olhares e ações.",
      churchTradition: {
        cic: [
          {
            code: "CIC §2337",
            text: "A castidade significa a integração bem-sucedida da sexualidade na pessoa e, portanto, a unidade interior do homem no seu ser corporal e espiritual.",
          },
          {
            code: "CIC §2520",
            text: "O combate pela pureza envolve a modéstia, que guarda a intimidade da pessoa e recusa desvendar o que deve permanecer oculto.",
          },
        ],
        fathers: [
          {
            author: "São João Crisóstomo",
            text: "A castidade faz do homem terrestre um anjo do céu; ela ilumina a mente para ver a Deus.",
          },
        ],
        doctors: [
          {
            author: "São Tomás de Aquino",
            text: "A luxúria enfraquece a razão e gera a cegueira da alma, enquanto a pureza conserva a clareza do julgamento moral.",
          },
          {
            author: "Santo Afonso Maria de Ligório",
            text: "Nas tentações contra a pureza, a melhor vitória é a fuga imediata e o recurso à oração à Virgem Santíssima.",
          },
        ],
        magisterium: [
          {
            author: "São João Paulo II",
            text: "O corpo humano traz em si a marca do mistério da criação e da redenção. Ele deve ser tratado com profundo respeito e santidade.",
          },
        ],
      },
      deliveryPrayer: `Ó São Miguel Arcanjo, guarda imaculado do trono de Deus, defendei a pureza dos meus pensamentos, dos meus olhos e do meu corpo. Afastai de mim todo espírito de luxúria, sensualidade e contaminação do mundo.

Cercai-me com as vossas asas de luz e obtende-me da Virgem Maria a graça de um coração puro, humilde e transparente. Que o meu corpo permaneça digno de ser templo do Espírito Santo. São Miguel, defensor da santidade, rogai por nós! Amém.`,
      familyConsecration: "Ó Grande São Miguel Arcanjo, príncipe e chefe das legiões angélicas, penetrado do sentimento de vossa grandeza, de vossa, bondade e vosso poder, em presença da adorável Santíssima Trindade, da Virgem Maria e toda a corte celeste, venho hoje consagrar minha família a vós. Quero, com minha família, vos honrar e invocar fielmente. Recebei-nos sob vossa especial proteção e dignai-vos desde então velar sobre os nossos interesses espirituais e temporais. Conservai entre nós a perfeita união do espírito dos corações e do amor familiar. Defendei-nos contra o ataque inimigo, preservai-nos de todo mal e, particularmente, da desgraça de ofender a Deus. Que por nossos cuidados, devotados e vigilantes, cheguemos todos à felicidade eterna. Dignai-vos, grande São Miguel Arcanjo, reunir todos os membros de nossa família. Amém.",
      examination: [
        "Consenti em pensamentos, olhares ou desejos impuros ao longo do dia?",
        "Consumi imagens, conteúdos na internet ou conversas que ferem a modéstia e a castidade?",
        "Recorri prontamente à oração ao sentir a tentação ou brinquei com a ocasião de pecado?",
      ],
      saintQuote: "Bem-aventurados os puros de coração, porque verão a Deus. - Jesus Cristo (Mateus 5, 8)",
      saintQuotesList: [
        {
          author: "São Domingos Sávio",
          quote: "A morte, mas não o pecado! A pureza é a flor mais preciosa da alma.",
        },
        {
          author: "São Padre Pio de Pietrelcina",
          quote: "A modéstia é a guardiã da castidade. Quem não cuida dos olhares dificilmente guardará o coração.",
        },
        {
          author: "São Francisco de Sales",
          quote: "A castidade é o lírio das virtudes; torna os homens semelhantes aos anjos no céu.",
        },
        {
          author: "São João Bosco",
          quote: "Queridos jovens, guardai a santa pureza, pois ela é a chave para a alegria verdadeira e para o amor de Deus.",
        },
      ],
      complementaryPrayer: "Deus Todo-Poderoso e Eterno, que por um prodígio de bondade e misericórdia para a salvação dos homens, escolhestes para Príncipe de vossa Igreja o gloriosíssimo Arcanjo São Miguel, tornai-nos dignos, nós vos pedimos, de sermos preservados de todos os nossos inimigos, a fim de que, na hora da nossa morte, nenhum deles nos possa inquietar, mas que nos seja dado ser introduzidos por ele na presença da vossa excelsa e divina Majestade. Por Jesus Cristo, nosso Senhor. Amém.",
    },
    {
      number: 6,
      title: "Dia 6",
      theme: "O Desapego dos Bens Terrenos (O Combate contra a Avareza e a Ganância)",
      scripture: {
        reference: "Mateus 6, 19-21",
        text: "Não ajunteis tesouros na terra, onde a traça e a ferrugem roem e onde os ladrões escavam e roubam. Ajunteis tesouros no céu... pois onde estiver o teu tesouro, aí estará também o teu coração.",
        explanation: `O apego desordenado ao dinheiro, aos bens materiais e ao conforto egoísta escraviza a alma e endurece o coração humano. Nosso Senhor Jesus Cristo nos alerta categoricamente sobre a fragilidade dos tesouros terrenos e nos convida a acumular bens eternos no Céu.

Onde está o nosso tesouro, aí estará inevitavelmente o nosso coração. São Miguel Arcanjo, administrador dos bens celestes, ensina-nos a viver com espírito de pobreza evangélica, usando os recursos materiais com justiça, responsabilidade e generosidade para com os necessitados.

A avareza gera ansiedade e desconfiança na Providência divina, enquanto o desapego sincero traz a verdadeira liberdade interior. Ao partilhar o que temos com alegria, abrimos espaço para que a riqueza insondável da graça de Deus transborde em nossa existência.`,
      },
      meditation: `Irmão e irmã na fé, no sexto dia de nossa caminhada devocional, meditamos sobre o combate contra a avareza e o apego desordenado às coisas materiais. O dinheiro e os bens deste mundo foram criados para servir ao sustento honesto e à caridade; contudo, quando o coração humano se prende às posses, transforma o ouro em um ídolo que ocupa o lugar de Deus.

São Miguel Arcanjo é o administrador dos bens celestes. Ele sabe que a verdadeira riqueza não consiste no que acumulamos, mas no amor e na graça que oferecemos a Deus e aos irmãos. A ganância gera ansiedade, inveja, injustiça e endurecimento de coração diante dos necessitados.

Ser desapegado não significa desprezar o trabalho ou a providência, mas viver com espírito de pobreza evangélica: usar do mundo como se não usasse, partilhar com alegria o que se tem e confiar que o Pai Celestial cuida de nós. Hoje, examine o seu coração: onde está o seu tesouro? O que você precisa desapegar para ser verdadeiramente livre em Deus?`,
      virtue: "Generosidade e Pobreza de Espírito",
      purpose: "Fazer uma doação, esmola ou gesto concreto de ajuda material a alguém necessitado ou a uma obra da Igreja.",
      suggestedPenance: "Renunciar a uma compra supérflua ou gasto desnecessário no dia de hoje e destinar o valor à caridade.",
      spiritualExercise: "Separar roupas, livros ou objetos que você não usa mais e doá-los com alegria a quem precisa.",
      churchTradition: {
        cic: [
          {
            code: "CIC §2536",
            text: "O décimo mandamento proíbe a ganância e o desejo de uma apropriação imoderada dos bens terrestres; proíbe a avareza desmedida, nascida da paixão desordenada pelas riquezas.",
          },
          {
            code: "CIC §2545",
            text: "Todos os fiéis devem orientar retamente os seus afetos, para que não sejam impedidos de buscar a caridade perfeita pelo uso das coisas do mundo.",
          },
        ],
        fathers: [
          {
            author: "São Basílio Magno",
            text: "O pão que guardas em excesso pertence ao faminto; o manto que penduras no teu armário pertence ao nu.",
          },
        ],
        doctors: [
          {
            author: "São Tomás de Aquino",
            text: "A avareza é um pecado contra a justiça e a caridade, pois faz o homem amar os bens materiais mais do que a Deus e ao próximo.",
          },
          {
            author: "São Francisco de Assis",
            text: "Possuir bens sem partilhar é perder o tesouro do Céu. A santa pobreza é o caminho da perfeita liberdade do espírito.",
          },
        ],
        magisterium: [
          {
            author: "Papa Leão XIII",
            text: "Os bens materiais são dados por Deus para a utilidade comum. Quem recebeu mais riquezas tem a obrigação moral de usá-las para o bem dos necessitados.",
          },
        ],
      },
      deliveryPrayer: `Glorioso São Miguel Arcanjo, libertai o meu coração de todo apego ganancioso ao dinheiro, aos bens e aos confortos deste mundo. Ensinai-me a buscar em primeiro lugar o Reino de Deus e a Sua justiça.

Concedei-me um coração generoso para partilhar com os necessitados e uma alma desapegada de todas as coisas passageiras. Que o meu único tesouro seja a graça de Cristo e a amizade com os Santos Anjos. São Miguel, nosso protetor, rogai por nós! Amém.`,
      familyConsecration: "Ó Grande São Miguel Arcanjo, príncipe e chefe das legiões angélicas, penetrado do sentimento de vossa grandeza, de vossa, bondade e vosso poder, em presença da adorável Santíssima Trindade, da Virgem Maria e toda a corte celeste, venho hoje consagrar minha família a vós. Quero, com minha família, vos honrar e invocar fielmente. Recebei-nos sob vossa especial proteção e dignai-vos desde então velar sobre os nossos interesses espirituais e temporais. Conservai entre nós a perfeita união do espírito dos corações e do amor familiar. Defendei-nos contra o ataque inimigo, preservai-nos de todo mal e, particularmente, da desgraça de ofender a Deus. Que por nossos cuidados, devotados e vigilantes, cheguemos todos à felicidade eterna. Dignai-vos, grande São Miguel Arcanjo, reunir todos os membros de nossa família. Amém.",
      examination: [
        "Fui avarento, egoísta ou apegado demais ao dinheiro e às minhas posses no dia de hoje?",
        "Senti ansiedade desmedida com relação aos bens materiais, duvidando da Providência divina?",
        "Deixei de praticar a caridade ou ajudei quem necessitava com má vontade ou avareza?",
      ],
      saintQuote: "Onde estiver o teu tesouro, aí estará também o teu coração. - Jesus Cristo (Mateus 6, 21)",
      saintQuotesList: [
        {
          author: "São Francisco de Assis",
          quote: "Lembre-se de que quando você deixar este mundo, não poderá levar nada do que recebeu, mas apenas o que deu.",
        },
        {
          author: "Santo Agostinho",
          quote: "Deus não precisa do teu dinheiro, mas o teu irmão faminto precisa. Dando ao pobre, dás a Deus.",
        },
        {
          author: "São João Maria Vianney",
          quote: "O avarento é como um porco que só é útil depois de morto. O generoso já vive a alegria do Céu na terra.",
        },
        {
          author: "São João Crisóstomo",
          quote: "Não ser ganancioso é uma grande riqueza; ser generoso é a coroa das virtudes cristãs.",
        },
      ],
      complementaryPrayer: "Deus Todo-Poderoso e Eterno, que por um prodígio de bondade e misericórdia para a salvação dos homens, escolhestes para Príncipe de vossa Igreja o gloriosíssimo Arcanjo São Miguel, tornai-nos dignos, nós vos pedimos, de sermos preservados de todos os nossos inimigos, a fim de que, na hora da nossa morte, nenhum deles nos possa inquietar, mas que nos seja dado ser introduzidos por ele na presença da vossa excelsa e divina Majestade. Por Jesus Cristo, nosso Senhor. Amém.",
    },
    {
      number: 7,
      title: "Dia 7",
      theme: "A Doçura do Perdão (O Combate contra a Ira, o Rancor e a Vingança)",
      scripture: {
        reference: "Colossenses 3, 12-13 / Mateus 6, 14-15",
        text: "Suportai-vos uns aos outros e perdoai-vos mutuamente, caso alguém tenha motivo de queixa contra o outro. Assim como o Senhor vos perdoou, assim fazei vós também. Se perdoardes aos homens as suas ofensas, o vosso Pai Celestial também vos perdoará.",
        explanation: `O rancor, a ira e o desejo de vingança mantêm a alma aprisionada ao passado e abrem brechas profundas para a ação do maligno. A Palavra de Deus exorta os fiéis a perdoarem mutuamente com generosidade, assim como o Senhor nos perdoou incondicionalmente na Cruz.

O perdão cristão não depende de sentimentos humanos ou da mudança da outra pessoa; é uma decisão consciente da vontade motivada pela graça divina. Perdoar é entregar a dor e a reparação nas mãos de Deus, libertando o devedor e curando a própria alma.

São Miguel Arcanjo, príncipe da paz e da misericórdia, auxilia-nos a superar as amarguras e a imitar o Imaculado Coração de Jesus. A alma que perdoa de coração abre o caminho para receber o perdão e a paz celestial.`,
      },
      meditation: `Irmão e irmã na fé, no sétimo dia de nossa Quaresma de São Miguel Arcanjo, enfrentamos uma das batalhas mais decisivas do coração humano: a vitória do perdão sobre a ira, o ressentimento e a vingança. Quem guarda rancor bebe um veneno esperando que o outro morra.

O demônio alimenta a mágoa relembrando constantemente as ofensas recebidas, os julgamentos injustos e as feridas do passado. Ele sabe que uma alma ressentida não consegue rezar com verdade o Pai-Nosso ('perdoai-nos as nossas ofensas assim como nós perdoamos...').

São Miguel Arcanjo é o guardião da paz divina. Ele nos ensina que a verdadeira grandeza não está em revidar os golpes ou guardar ressentimentos, mas em imitar o Imaculado Coração de Jesus no alto da Cruz, quando pediu: 'Pai, perdoa-lhes, eles não sabem o que fazem'. Perdoar não significa fingir que o mal não existiu, mas entregar a dor a Cristo e desejar a salvação daquele que nos feriu. Peça hoje a São Miguel a graça de arrancar todas as raízes de amargura da sua alma.`,
      virtue: "Mansidão, Misericórdia e Perdão",
      purpose: "Rezar um Pai-Nosso com intenção amorosa por uma pessoa que me magoou ou com quem tenho ressentimento.",
      suggestedPenance: "Guardar silêncio diante de uma provocação ou impaciência, oferecendo o incômodo pela paz da família.",
      spiritualExercise: "Escrever o nome de pessoas a quem preciso perdoar e, diante de uma imagem de Cristo Crucificado, declarar: 'Em Nome de Jesus e com o auxílio de São Miguel, eu te perdoo de coração'.",
      churchTradition: {
        cic: [
          {
            code: "CIC §2843",
            text: "A recusa de perdoar aos nossos irmãos fecha o nosso coração; a sua dureza torna-o impermeável ao amor misericordioso do Pai.",
          },
          {
            code: "CIC §2302",
            text: "A ira é um desejo de vingança. Desejar a vingança para o mal de quem se deve punir é ilícito; mas é louvável impor uma reparação para a correção dos vícios e a conservação da justiça.",
          },
        ],
        fathers: [
          {
            author: "São João Crisóstomo",
            text: "Nada nos torna tão semelhantes a Deus quanto a disposição de perdoar os que nos ofenderam.",
          },
        ],
        doctors: [
          {
            author: "São Tomás de Aquino",
            text: "O perdão das ofensas é uma obra de misericórdia espiritual superior a dar bens materiais, pois cura a alma da divisão e da amargura.",
          },
          {
            author: "São Francisco de Sales",
            text: "Um só ato de perdão dito com o coração vale mais do que muitos dias de jejum e grandes mortificações.",
          },
        ],
        magisterium: [
          {
            author: "São João Paulo II",
            text: "Não há paz sem perdão. O perdão é a chave para curar as feridas da história e dos relacionamentos humanos.",
          },
        ],
      },
      deliveryPrayer: `São Miguel Arcanjo, Príncipe da Paz e guerreiro da Caridade Divina, vinde em auxílio do meu coração ferido. Arrancai do meu peito toda raiz de rancor, ira, amargura, ressentimento e desejo de vingança.

Concedei-me a santa mansidão do Coração de Jesus para perdoar a todos os que me magoaram, caluniaram ou injustiçaram. Que a minha alma seja libertada do peso do passado pela força do perdão evangélico. São Miguel, defensor da paz, rogai por nós! Amém.`,
      familyConsecration: "Ó Grande São Miguel Arcanjo, príncipe e chefe das legiões angélicas, penetrado do sentimento de vossa grandeza, de vossa, bondade e vosso poder, em presença da adorável Santíssima Trindade, da Virgem Maria e toda a corte celeste, venho hoje consagrar minha família a vós. Quero, com minha família, vos honrar e invocar fielmente. Recebei-nos sob vossa especial proteção e dignai-vos desde então velar sobre os nossos interesses espirituais e temporais. Conservai entre nós a perfeita união do espírito dos corações e do amor familiar. Defendei-nos contra o ataque inimigo, preservai-nos de todo mal e, particularmente, da desgraça de ofender a Deus. Que por nossos cuidados, devotados e vigilantes, cheguemos todos à felicidade eterna. Dignai-vos, grande São Miguel Arcanjo, reunir todos os membros de nossa família. Amém.",
      examination: [
        "Guardei raiva, ressentimento ou desejo de vingança contra alguém no dia de hoje?",
        "Recusei-me a perdoar ou alimentei pensamentos de amargura lembrando ofensas passadas?",
        "Reagi com agressividade, ironia ou ira verbal diante de uma contrariedade no lar ou no trabalho?",
      ],
      saintQuote: "Perdoai e sereis perdoados. - Jesus Cristo (Lucas 6, 37)",
      saintQuotesList: [
        {
          author: "São Padre Pio de Pietrelcina",
          quote: "Perdoe a todos de coração; o perdão é o perfume que a flor exala sobre o calcanhar que a esmagou.",
        },
        {
          author: "Santa Faustina Kowalska",
          quote: "Se a alma não praticar a misericórdia e o perdão, não alcançará a misericórdia de Deus no dia do julgamento.",
        },
        {
          author: "São Josemaría Escrivá",
          quote: "Não guardes ressentimentos na alma: perdoa imediatamente e esquece o mal, vencendo o mal com o bem.",
        },
        {
          author: "São Francisco de Assis",
          quote: "Onde há caridade e sabedoria, não há temor nem ignorância. Onde há paciência e humildade, não há ira nem perturbação.",
        },
      ],
      complementaryPrayer: "Deus Todo-Poderoso e Eterno, que por um prodígio de bondade e misericórdia para a salvação dos homens, escolhestes para Príncipe de vossa Igreja o gloriosíssimo Arcanjo São Miguel, tornai-nos dignos, nós vos pedimos, de sermos preservados de todos os nossos inimigos, a fim de que, na hora da nossa morte, nenhum deles nos possa inquietar, mas que nos seja dado ser introduzidos por ele na presença da vossa excelsa e divina Majestade. Por Jesus Cristo, nosso Senhor. Amém.",
    },
    {
      number: 8,
      title: "Dia 8",
      theme: "O Amor Fraterno e Caridade (O Combate contra a Inveja e os Juízos Temerários)",
      scripture: {
        reference: "1 Coríntios 13, 4-7 / Tiago 3, 16",
        text: "A caridade é paciente, a caridade é prestativa. Não é invejosa, não se ostenta, não se incha de orgulho... Pois onde há inveja e espírito de discórdia, aí há perturbação e toda espécie de maus atos.",
        explanation: `A caridade fraterna é o coração do Evangelho e o mandamento distintivo dos discípulos de Cristo. A inveja, por sua vez, é o pecado capital pelo qual o demônio trouxe a morte ao mundo: o desgosto pelo bem do próximo e o desejo de ver a ruína do irmão.

A Sagrada Escritura ensina que a caridade é paciente, benigna e não se alegra com a injustiça, mas congratula-se com a verdade. São Miguel e as milícias celestes vivem em perfeita comunhão e rejubilam-se com a glória e as virtudes dos seus irmãos anjos.

Vencer a inveja e os julgamentos temerários exige uma constante purificação do olhar interior, aprendendo a valorizar os dons dos outros como se fossem nossos. Onde reina o amor fraterno sincero, aí se manifesta a vitória de Deus sobre o mal.`,
      },
      meditation: `Irmão e irmã na fé, no oitavo dia de nossa Quaresma de São Miguel Arcanjo, meditamos sobre o mandamento novo da caridade e o combate contra o pecado capital da inveja. A inveja foi a porta pela qual a morte entrou no mundo: o diabo teve inveja da dignidade do homem e da glória de Deus.

Quando nos entristecemos com o sucesso, os dons ou a felicidade do irmão, estamos permitindo que o veneno da serpente contamine a nossa alma. A inveja nos impede de amar, gera julgamentos temerários e destrói o dom da comunhão na família e na Igreja.

São Miguel Arcanjo e a corte dos anjos fiéis vivem em perfeita harmonia e alegria com as virtudes uns dos outros. No Céu, o bem de um anjo é a alegria de todos os outros. Aprenda com os anjos a alegrar-se sinceramente com as bênçãos e os talentos do seu próximo. Hoje, peça a São Miguel a graça de substituir todo olhar invejoso por um olhar de benevolência, gratidão e amor fraterno.`,
      virtue: "Caridade Fraterna e Benevolência",
      purpose: "Agradecer a Deus em oração pelo bem, talento ou conquista de alguém de quem costumo sentir inveja ou rivalidade.",
      suggestedPenance: "Prestar um serviço humilde e discreto em casa ou no trabalho sem esperar agradecimento.",
      spiritualExercise: "Fazer um elogio sincero e encorajador a uma pessoa com quem sinto concorrência ou rivalidade.",
      churchTradition: {
        cic: [
          {
            code: "CIC §2539",
            text: "A inveja é um pecado capital. Designa a tristeza experimentada diante do bem do próximo e o desejo imoderado de se apossar dele, mesmo injustamente.",
          },
          {
            code: "CIC §1823",
            text: "Jesus faz da caridade o mandamento novo. Amando os seus até o fim, manifesta o amor do Pai que Ele mesmo recebe.",
          },
        ],
        fathers: [
          {
            author: "São Basílio Magno",
            text: "Como a ferrugem consome o ferro, assim a inveja consome a alma que a abriga.",
          },
        ],
        doctors: [
          {
            author: "São Tomás de Aquino",
            text: "A inveja se opõe diretamente à caridade, pela qual nos alegramos com o bem do próximo como se fosse nosso próprio bem.",
          },
          {
            author: "São Gregório Magno",
            text: "Da inveja nascem a mágoa, a murmuração, a calúnia, a alegria na adversidade do próximo e o desgosto na sua prosperidade.",
          },
        ],
        magisterium: [
          {
            author: "Papa Bento XVI",
            text: "A caridade é o coração da Igreja e da vida cristã. Sem o amor fraterno, todas as nossas obras e orações perdem o valor diante de Deus.",
          },
        ],
      },
      deliveryPrayer: `São Miguel Arcanjo, Príncipe do Amor e da Harmonia Celeste, expulsai da minha alma todo germe de inveja, ciúme, rivalidade e julgamento temerário.

Alcançai-me a graça de ver o meu próximo com os olhos misericordiosos de Cristo. Que eu me alegre sinceramente com os dons e as vitórias dos meus irmãos, reconhecendo que todas as bênçãos vêm da infinita bondade do Pai. São Miguel, protetor da caridade, rogai por nós! Amém.`,
      familyConsecration: "Ó Grande São Miguel Arcanjo, príncipe e chefe das legiões angélicas, penetrado do sentimento de vossa grandeza, de vossa, bondade e vosso poder, em presença da adorável Santíssima Trindade, da Virgem Maria e toda a corte celeste, venho hoje consagrar minha família a vós. Quero, com minha família, vos honrar e invocar fielmente. Recebei-nos sob vossa especial proteção e dignai-vos desde então velar sobre os nossos interesses espirituais e temporais. Conservai entre nós a perfeita união do espírito dos corações e do amor familiar. Defendei-nos contra o ataque inimigo, preservai-nos de todo mal e, particularmente, da desgraça de ofender a Deus. Que por nossos cuidados, devotados e vigilantes, cheguemos todos à felicidade eterna. Dignai-vos, grande São Miguel Arcanjo, reunir todos os membros de nossa família. Amém.",
      examination: [
        "Senti inveja, ciúme ou incômodo diante do sucesso, bens ou virtudes de alguém hoje?",
        "Alegrei-me secretamente com o erro, o sofrimento ou o fracasso de outra pessoa?",
        "Pratiquei a caridade fraterna com paciência ou fui frio e indiferente com os meus familiares e colegas?",
      ],
      saintQuote: "Nisto todos conhecerão que sois meus discípulos: se vos amardes uns aos outros. - Jesus Cristo (João 13, 35)",
      saintQuotesList: [
        {
          author: "São João da Cruz",
          quote: "No anoitecer da vida, seremos examinados sobre o amor.",
        },
        {
          author: "São Vicente de Paulo",
          quote: "A caridade é o paraíso das almas e o vínculo da perfeição; onde há amor verdadeiro, Deus aí habita.",
        },
        {
          author: "Santa Teresinha do Menino Jesus",
          quote: "Compreendi que a caridade não deve ficar encerrada no fundo do coração; deve iluminar a todos.",
        },
        {
          author: "São Francisco de Sales",
          quote: "Querubins e serafins amam a Deus acima de tudo, mas os homens têm o privilégio de amar a Deus amando o próximo.",
        },
      ],
      complementaryPrayer: "Deus Todo-Poderoso e Eterno, que por um prodígio de bondade e misericórdia para a salvação dos homens, escolhestes para Príncipe de vossa Igreja o gloriosíssimo Arcanjo São Miguel, tornai-nos dignos, nós vos pedimos, de sermos preservados de todos os nossos inimigos, a fim de que, na hora da nossa morte, nenhum deles nos possa inquietar, mas que nos seja dado ser introduzidos por ele na presença da vossa excelsa e divina Majestade. Por Jesus Cristo, nosso Senhor. Amém.",
    },
    {
      number: 9,
      title: "Dia 9",
      theme: "A Temperança nas Palavras e Ações (O Combate contra a Gula e os Excessos)",
      scripture: {
        reference: "1 Coríntios 10, 31 / Filipenses 3, 19",
        text: "Quer comais, quer bebais ou façais qualquer outra coisa, fazei tudo para a glória de Deus. Não façais do ventre o vosso deus, mas vivei com sobriedade.",
        explanation: `A virtude da temperança e o autodomínio são essenciais para moderar as paixões sensíveis e direcionar todos os desejos corporais para a glória de Deus. O Apóstolo São Paulo nos exorta a viver com sobriedade, evitando fazer dos apetites carnais o nosso centro.

A gula e a falta de disciplina enfraquecem a vontade da alma, tornando o espírito pesado e vulnerável às tentações do inimigo. A ascese, o jejum e a mortificação corporal praticados com amor não desvalorizam a matéria, mas reordenam a alma sob o domínio da razão iluminada pela fé.

São Miguel Arcanjo, modelo de sobriedade e retidão, convida-nos a controlar os impulsos do corpo para nos dedicarmos à oração e ao serviço divino. A alma sóbria é forte no combate e livre para amar.`,
      },
      meditation: `Irmão e irmã na fé, no nono dia de nossa Quaresma de São Miguel Arcanjo, meditamos sobre a virtude cardinal da temperança e o combate contra a gula e os excessos sensíveis. Em uma sociedade consumista que incentiva a satisfação imediata de todos os desejos, aprender a dizer 'não' ao próprio corpo é um sinal de maturidade espiritual.

A gula não consiste apenas no excesso de comida ou bebida, mas na busca desordenada do prazer sensível, na impaciência nas refeições, no apego ao luxo culinário e na incapacidade de suportar a menor privação corporal. Uma alma que não domina a sua boca e o seu estômago dificilmente dominará os seus olhos, sua língua e suas paixões.

São Miguel Arcanjo nos convida à sobriedade dos filhos de Deus. O jejum e a abstinência praticados com amor não depreciam o corpo, mas purificam os sentidos, tornam a oração mais fervorosa e libertam a vontade das amarras da carne. Hoje, ofereça ao Senhor o domínio dos seus apetites para que o seu espírito possa voar livre em direção ao Céu.`,
      virtue: "Temperança e Sobriedade",
      purpose: "Fazer uma mortificação corporal discreta nas refeições hoje: deixar de comer algo que gosto ou não repetir o prato.",
      suggestedPenance: "Abster-se de refrigerantes, doces ou petiscos durante o dia de hoje, oferecendo o sacrifício pela santificação dos sacerdotes.",
      spiritualExercise: "Fazer uma pausa de oração antes das refeições, abençoando os alimentos e dando graças a Deus pelo pão de cada dia.",
      churchTradition: {
        cic: [
          {
            code: "CIC §1809",
            text: "A temperança é a virtude moral que modera a atração dos prazeres e assegura o domínio da vontade sobre os instintos.",
          },
          {
            code: "CIC §2043",
            text: "O quarto mandamento da Igreja (jejuar e abster-se de carne) assegura os tempos de ascese e de penitência que nos preparam para as festas litúrgicas.",
          },
        ],
        fathers: [
          {
            author: "São João Crisóstomo",
            text: "O jejum é o alimento da alma, o fortalecimento da mente e a destruição dos maus pensamentos.",
          },
        ],
        doctors: [
          {
            author: "São Tomás de Aquino",
            text: "A gula embota o sentido espiritual e inclina o homem à preguiça e à imoralidade, enquanto a sobriedade eleva a mente à contemplação.",
          },
          {
            author: "São Bernardo de Claraval",
            text: "Aquele que controla a gula abre a porta para todas as outras virtudes entrarem em seu coração.",
          },
        ],
        magisterium: [
          {
            author: "Papa São Paulo VI",
            text: "A penitência corporal é uma exigência permanente da vida cristã para reprimir os impulsos da natureza decaída e viver no Espírito.",
          },
        ],
      },
      deliveryPrayer: `São Miguel Arcanjo, Príncipe da Pureza e da Ordem Divina, ajudai-me a ter autodomínio e sobriedade em todas as coisas. Libertai a minha alma de toda escravidão da gula, dos excessos e da busca desordenada de prazeres sensíveis.

Fortalecei a minha vontade para praticar o jejum e a mortificação com alegria e amor a Cristo. Que o meu corpo seja sempre um instrumento dócil ao serviço do Espírito Santo. São Miguel, guerreiro da sobriedade, rogai por nós! Amém.`,
      familyConsecration: "Ó Grande São Miguel Arcanjo, príncipe e chefe das legiões angélicas, penetrado do sentimento de vossa grandeza, de vossa, bondade e vosso poder, em presença da adorável Santíssima Trindade, da Virgem Maria e toda a corte celeste, venho hoje consagrar minha família a vós. Quero, com minha família, vos honrar e invocar fielmente. Recebei-nos sob vossa especial proteção e dignai-vos desde então velar sobre os nossos interesses espirituais e temporais. Conservai entre nós a perfeita união do espírito dos corações e do amor familiar. Defendei-nos contra o ataque inimigo, preservai-nos de todo mal e, particularmente, da desgraça de ofender a Deus. Que por nossos cuidados, devotados e vigilantes, cheguemos todos à felicidade eterna. Dignai-vos, grande São Miguel Arcanjo, reunir todos os membros de nossa família. Amém.",
      examination: [
        "Cedi à gula, comendo ou bebendo em excesso por pura busca de prazer?",
        "Fui impaciente, exigente ou reclamei das refeições preparadas em casa?",
        "Consegui manter a mortificação e o jejum oferecidos ao Senhor ou desisti ao primeiro sinal de incômodo?",
      ],
      saintQuote: "O Reino de Deus não é comida nem bebida, mas justiça, paz e alegria no Espírito Santo. - São Paulo (Romanos 14, 17)",
      saintQuotesList: [
        {
          author: "São Padre Pio de Pietrelcina",
          quote: "A mortificação dos sentidos e da boca é o caminho mais curto para unir a alma a Deus na oração.",
        },
        {
          author: "São João Maria Vianney",
          quote: "O diabo não tem medo de um estômago cheio, mas treme diante do cristão que sabe jejuar e orar.",
        },
        {
          author: "Santa Teresa d'Ávila",
          quote: "Não sejamos escravos do nosso corpo; o corpo deve servir à alma para alcançar a vida eterna.",
        },
        {
          author: "São Francisco de Assis",
          quote: "Devemos ser severos com o nosso irmão jumento (o corpo), mas cheios de amor pela alma remida por Cristo.",
        },
      ],
      complementaryPrayer: "Deus Todo-Poderoso e Eterno, que por um prodígio de bondade e misericórdia para a salvação dos homens, escolhestes para Príncipe de vossa Igreja o gloriosíssimo Arcanjo São Miguel, tornai-nos dignos, nós vos pedimos, de sermos preservados de todos os nossos inimigos, a fim de que, na hora da nossa morte, nenhum deles nos possa inquietar, mas que nos seja dado ser introduzidos por ele na presença da vossa excelsa e divina Majestade. Por Jesus Cristo, nosso Senhor. Amém.",
    },
    {
      number: 10,
      title: "Dia 10",
      theme: "A Santa Esperança e Confiança Divina (O Combate contra a Ansiedade e o Desespero)",
      scripture: {
        reference: "Filipenses 4, 6-7 / Salmo 27 (26), 1",
        text: "Não vos inquieteis com coisa alguma; mas em todas as circunstâncias apresentai os vossos pedidos a Deus pela oração e pela súplica, acompanhadas de ação de graças. E a paz de Deus... guardará os vossos corações.",
        explanation: `A ansiedade sufocante, as preocupações excessivas e o desespero nascem da tentativa errônea de controlar o futuro com nossas próprias forças limitadas, esquecendo a paternidade amorosa de Deus. O Apóstolo São Paulo exorta a apresentar todas as petições a Deus através da oração cheia de confiança.

A virtude teologal da esperança concede ao cristão a certeza inabalável de que a nossa vida e o universo estão sob o amparo da Providência divina. Nada sucede sem a permissão ou vontade de Deus, que faz todas as coisas concorrerem para o bem dos que O amam.

São Miguel Arcanjo, mensageiro da vitória divina, convida-nos a depositar os medos e inquietações aos pés do Senhor. Ao abandonarmos o amanhã na fidelidade de Cristo, experimentamos a paz que excede todo o entendimento humano.`,
      },
      meditation: `Irmão e irmã na fé, no décimo dia de nossa Quaresma de São Miguel Arcanjo, meditamos sobre o dom da esperança cristã e o combate contra a ansiedade sufocante, as preocupações excessivas e o desespero. Quantas noites mal dormidas e corações aflitos porque tentamos controlar o amanhã com nossas próprias forças limitadas!

O demônio aproveita-se das incertezas da vida — problemas financeiros, enfermidades, futuro dos filhos ou crises da sociedade — para plantar o pânico e a desconfiança na Providência divina. Uma alma perturbada pela ansiedade perde a paz, a alegria e a capacidade de escutar a voz de Deus no silêncio.

São Miguel Arcanjo é o mensageiro da paz e da vitória de Deus. Ele nos recorda que o Altíssimo está no trono e governa o universo com sabedoria, amor e poder misericordioso. Nada acontece sem a permissão ou vontade permissiva do Pai. Quando as ondas do mar da vida se levantarem, não olhe para a tempestade; invoque São Miguel, entregue o seu futuro a Deus e descanse sob o manto da Providência Divina.`,
      virtue: "Esperança Teologal e Confiança na Providência",
      purpose: "Entregar verbalmente a Deus uma preocupação que tira a minha paz e rezar a jaculatória: 'Jesus, eu confio em Vós!' sempre que a ansiedade voltar.",
      suggestedPenance: "Evitar consultar notícias sensacionalistas ou checar o celular compulsivamente para acalmar a mente na paz de Cristo.",
      spiritualExercise: "Fazer uma lista de 5 bênçãos reais que Deus já concedeu na sua vida e dar graças de todo o coração.",
      churchTradition: {
        cic: [
          {
            code: "CIC §1817",
            text: "A esperança é a virtude teologal pela qual desejamos o Reino dos Céus e a Vida Eterna como nossa felicidade, pondo nossa confiança nas promessas de Cristo.",
          },
          {
            code: "CIC §305",
            text: "Jesus pede um abandono filial à Providência do Pai Celeste, que cuida até das menores necessidades dos Seus filhos.",
          },
        ],
        fathers: [
          {
            author: "Santo Agostinho",
            text: "Fizeste-nos, Senhor, para Ti, e o nosso coração permanecerá inquieto enquanto não descansar em Ti.",
          },
        ],
        doctors: [
          {
            author: "São Tomás de Aquino",
            text: "A esperança apoia-se na omnipotência e na misericórdia de Deus; por isso, para quem confia no Senhor, nada é impossível.",
          },
          {
            author: "São Francisco de Sales",
            text: "Não antecipes os males de amanhã. O mesmo Pai que cuida de ti hoje, cuidará de ti amanhã e sempre.",
          },
        ],
        magisterium: [
          {
            author: "Papa Bento XVI",
            text: "Quem tem esperança vive de modo diferente; foi-lhe dada uma vida nova pela certeza de que a história está nas mãos de Deus.",
          },
        ],
      },
      deliveryPrayer: `São Miguel Arcanjo, poderoso defensor e anjo da Paz Divina, afastai do meu coração toda a ansiedade sufocante, o medo do futuro, a agitação interior e o desespero.

Ensina-me a abandonar a minha vida, a minha família e todas as minhas preocupações nas mãos amorosas do Pai Celestial. Revesti-me com o escudo da santa esperança para caminhar em paz, sabendo que Deus tudo provê. São Miguel, anjo da esperança, rogai por nós! Amém.`,
      familyConsecration: "Ó Grande São Miguel Arcanjo, príncipe e chefe das legiões angélicas, penetrado do sentimento de vossa grandeza, de vossa, bondade e vosso poder, em presença da adorável Santíssima Trindade, da Virgem Maria e toda a corte celeste, venho hoje consagrar minha família a vós. Quero, com minha família, vos honrar e invocar fielmente. Recebei-nos sob vossa especial proteção e dignai-vos desde então velar sobre os nossos interesses espirituais e temporais. Conservai entre nós a perfeita união do espírito dos corações e do amor familiar. Defendei-nos contra o ataque inimigo, preservai-nos de todo mal e, particularmente, da desgraça de ofender a Deus. Que por nossos cuidados, devotados e vigilantes, cheguemos todos à felicidade eterna. Dignai-vos, grande São Miguel Arcanjo, reunir todos os membros de nossa família. Amém.",
      examination: [
        "Deixei-me dominar pela ansiedade, impaciência ou agitação por causa dos problemas do amanhã?",
        "Duvidei do amor ou da Providência de Deus diante de uma dificuldade ou incerteza?",
        "Procurei a paz de espírito na oração e nos sacramentos ou em distrações mundanas?",
      ],
      saintQuote: "O Senhor é minha luz e minha salvação: de quem terei medo? - Salmo 27 (26), 1",
      saintQuotesList: [
        {
          author: "São Padre Pio de Pietrelcina",
          quote: "Reze, espere e não se preocupe. A preocupação é inútil. Deus é misericordioso e ouvirá a sua oração.",
        },
        {
          author: "Santa Teresa d'Ávila",
          quote: "Nada te perturbe, nada te espante; tudo passa, Deus não muda. A paciência tudo alcança; quem a Deus tem, nada lhe falta.",
        },
        {
          author: "São Francisco de Sales",
          quote: "Não temas o que possa acontecer amanhã; o mesmo Pai Eterno que cuida de ti hoje cuidará de ti amanhã.",
        },
        {
          author: "São João da Cruz",
          quote: "Quem confia plenamente em Deus não teme as tempestades deste mundo, pois sua ancoragem está no Céu.",
        },
      ],
      complementaryPrayer: "Deus Todo-Poderoso e Eterno, que por um prodígio de bondade e misericórdia para a salvação dos homens, escolhestes para Príncipe de vossa Igreja o gloriosíssimo Arcanjo São Miguel, tornai-nos dignos, nós vos pedimos, de sermos preservados de todos os nossos inimigos, a fim de que, na hora da nossa morte, nenhum deles nos possa inquietar, mas que nos seja dado ser introduzidos por ele na presença da vossa excelsa e divina Majestade. Por Jesus Cristo, nosso Senhor. Amém.",
    },
  ],
};