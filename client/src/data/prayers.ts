// Catálogo de orações tradicionais e mistérios do Rosário.
// Usado por Prayers.tsx e RosaryGuided.tsx.

export type PrayerCategory = "basic" | "premium";

export interface Prayer {
  id: string;
  type: string;
  name: string;
  description: string;
  icon: string;
  duration: string;
  category: PrayerCategory;
  content: string;
  audioUrl?: string;
}

export const PRAYERS: Prayer[] = [
  {
    id: "pai-nosso",
    type: "pai_nosso",
    name: "Pai Nosso",
    description: "A oração que o próprio Senhor ensinou aos discípulos.",
    icon: "🙏",
    duration: "1 min",
    category: "basic",
    audioUrl: "/audio/rosary/Pai-Nosso.mp3",
    content: `Pai nosso que estais nos céus,
santificado seja o vosso nome,
venha a nós o vosso reino,
seja feita a vossa vontade,
assim na terra como no céu.

O pão nosso de cada dia nos dai hoje,
perdoai-nos as nossas ofensas,
assim como nós perdoamos a quem nos tem ofendido,
e não nos deixeis cair em tentação,
mas livrai-nos do mal.
Amém.`,
  },
  {
    id: "ave-maria",
    type: "ave_maria",
    name: "Ave Maria",
    description: "Saudação angélica e súplica confiante à Virgem Maria.",
    icon: "🌹",
    duration: "1 min",
    category: "basic",
    audioUrl: "/audio/rosary/ave-maria1.mp3",
    content: `Ave Maria, cheia de graça,
o Senhor é convosco,
bendita sois vós entre as mulheres,
e bendito é o fruto do vosso ventre, Jesus.

Santa Maria, Mãe de Deus,
rogai por nós pecadores,
agora e na hora da nossa morte.
Amém.`,
  },
  {
    id: "gloria",
    type: "gloria",
    name: "Glória ao Pai",
    description: "Breve louvor à Santíssima Trindade.",
    icon: "✨",
    duration: "1 min",
    category: "basic",
    audioUrl: "/audio/rosary/gloria.mp3",
    content: `Glória ao Pai, ao Filho e ao Espírito Santo,
como era no princípio, agora e sempre,
pelos séculos dos séculos. Amém.`,
  },
  {
    id: "credo",
    type: "credo",
    name: "Credo Apostólico",
    description: "Profissão de fé da Igreja Católica.",
    icon: "✝️",
    duration: "2 min",
    category: "basic",
    content: `Creio em Deus Pai todo-poderoso,
criador do céu e da terra.

E em Jesus Cristo, seu único Filho, nosso Senhor,
que foi concebido pelo poder do Espírito Santo,
nasceu da Virgem Maria,
padeceu sob Pôncio Pilatos,
foi crucificado, morto e sepultado,
desceu à mansão dos mortos,
ressuscitou ao terceiro dia,
subiu aos céus,
está sentado à direita de Deus Pai todo-poderoso,
donde há de vir a julgar os vivos e os mortos.

Creio no Espírito Santo,
na Santa Igreja Católica,
na comunhão dos santos,
na remissão dos pecados,
na ressurreição da carne,
na vida eterna. Amém.`,
  },
  {
    id: "salve-rainha",
    type: "salve_rainha",
    name: "Salve Rainha",
    description: "Antiga oração mariana de confiança e invocação.",
    icon: "👑",
    duration: "2 min",
    category: "basic",
    audioUrl: "/audio/rosary/salve%20rainha.mp3",
    content: `Salve Rainha, Mãe de misericórdia,
vida, doçura e esperança nossa, salve!
A vós bradamos, os degredados filhos de Eva.
A vós suspiramos, gemendo e chorando
neste vale de lágrimas.

Eia, pois, advogada nossa,
esses vossos olhos misericordiosos a nós volvei.
E depois deste desterro,
mostrai-nos Jesus, bendito fruto do vosso ventre.

Ó clemente, ó piedosa,
ó doce sempre Virgem Maria!

Rogai por nós, Santa Mãe de Deus,
para que sejamos dignos das promessas de Cristo. Amém.`,
  },
  {
    id: "angelus",
    type: "angelus",
    name: "Angelus",
    description: "Oração tradicional rezada pela manhã, ao meio-dia e ao entardecer.",
    icon: "🔔",
    duration: "3 min",
    category: "basic",
    content: `V. O Anjo do Senhor anunciou a Maria.
R. E ela concebeu do Espírito Santo.
Ave Maria...

V. Eis aqui a serva do Senhor.
R. Faça-se em mim segundo a vossa palavra.
Ave Maria...

V. E o Verbo se fez carne.
R. E habitou entre nós.
Ave Maria...

V. Rogai por nós, Santa Mãe de Deus.
R. Para que sejamos dignos das promessas de Cristo.

Oremos:
Infundi, Senhor, em nossas almas a vossa graça,
para que nós, que pela anunciação do Anjo
conhecemos a encarnação do vosso Filho Jesus Cristo,
pela sua paixão e morte na cruz
sejamos conduzidos à glória da ressurreição.
Pelo mesmo Cristo, nosso Senhor. Amém.`,
  },
  {
    id: "oracao-fatima",
    type: "fatima",
    name: "Oração de Fátima",
    description: "Ensinada por Nossa Senhora aos pastorinhos.",
    icon: "🕊️",
    duration: "1 min",
    category: "basic",
    audioUrl: "/audio/rosary/jaculatoria.mp3",
    content: `Ó meu Jesus, perdoai-nos, livrai-nos do fogo do inferno; levai as almas todas para o Céu e socorrei principalmente as que mais precisarem. Amém.`,
  },
  {
    id: "anjo-da-guarda",
    type: "anjo_da_guarda",
    name: "Santo Anjo do Senhor",
    description: "Oração simples e confiada ao Anjo da Guarda.",
    icon: "👼",
    duration: "1 min",
    category: "basic",
    content: `Santo Anjo do Senhor, meu zeloso guardador,
se a ti me confiou a piedade divina,
sempre me rege, me guarde, me governe e me ilumine. Amém.`,
  },
  {
    id: "meditacao-sagrado-coracao",
    type: "meditacao",
    name: "Meditação do Sagrado Coração",
    description: "Meditação guiada diante do Sagrado Coração de Jesus.",
    icon: "❤️‍🔥",
    duration: "10 min",
    category: "premium",
    content: `Coração Sagrado de Jesus,
fonte inesgotável de misericórdia,
faço hoje silêncio diante de Vós.

Lembro-me de tudo o que recebi de Vossa bondade
e ofereço-Vos as alegrias e as fadigas deste dia.

Tomai a minha vida, transformai meu coração,
ensinai-me a amar como Vós amais.

Sagrado Coração de Jesus, em Vós confio.
  Sagrado Coração de Jesus, fazei o meu coração semelhante ao Vosso. Amém.`,
  },
  {
    id: "meditacao-divina-misericordia",
    type: "meditacao",
    name: "Terço da Divina Misericórdia",
    description: "Devoção confiada por Jesus a Santa Faustina.",
    icon: "💧",
    duration: "10 min",
    category: "basic",
    content: `Inicie com o sinal da cruz, o Pai Nosso, a Ave Maria e o Credo.

Nas contas maiores:
"Eterno Pai, eu Vos ofereço o Corpo e Sangue,
Alma e Divindade de Vosso diletíssimo Filho,
Nosso Senhor Jesus Cristo,
em expiação dos nossos pecados e dos do mundo inteiro."

Nas dez contas menores:
"Pela Sua dolorosa Paixão,
tende misericórdia de nós e do mundo inteiro."

Ao final, três vezes:
"Deus Santo, Deus Forte, Deus Imortal,
tende piedade de nós e do mundo inteiro." Amém.`,
  },
];

// --- Mistérios do Rosário --------------------------------------------------

export interface RosaryMystery {
  title: string;
  meditation: string;
}

export interface RosaryMysteryGroup {
  name: string;
  days: string;
  mysteries: RosaryMystery[];
}

export const ROSARY_MYSTERIES = {
  joyful: {
    name: "Mistérios Gozosos",
    days: "Segunda e Sábado",
    mysteries: [
      {
        title: "A Anunciação do Anjo a Maria",
        meditation:
          "O Arcanjo Gabriel anuncia a Maria que ela será a Mãe do Filho de Deus. Contemplemos a humildade e a obediência de Maria ao dizer: 'Eis aqui a serva do Senhor.'",
      },
      {
        title: "A Visitação de Maria a Isabel",
        meditation:
          "Maria, levando Jesus em seu ventre, visita sua prima Isabel. Peçamos a graça da caridade fraterna e do serviço alegre ao próximo.",
      },
      {
        title: "O Nascimento de Jesus em Belém",
        meditation:
          "O Filho de Deus nasce em uma manjedoura, pobre e simples. Contemplemos o mistério da pobreza e da humildade do Verbo encarnado.",
      },
      {
        title: "A Apresentação do Menino Jesus no Templo",
        meditation:
          "Maria e José apresentam Jesus no Templo. Simeão profetiza que uma espada de dor traspassará o coração de Maria. Peçamos a graça da obediência à Lei de Deus.",
      },
      {
        title: "O Encontro do Menino Jesus no Templo",
        meditation:
          "Após três dias procurando, Maria e José encontram Jesus no Templo, entre os doutores. Peçamos a graça de sempre buscar a Jesus em nossas vidas.",
      },
    ],
  },
  sorrowful: {
    name: "Mistérios Dolorosos",
    days: "Terça e Sexta",
    mysteries: [
      {
        title: "A Agonia de Jesus no Horto",
        meditation:
          "Jesus sua sangue no Getsêmani, antecipando a Paixão. Peçamos a graça de aceitar a vontade de Deus em nossas dores.",
      },
      {
        title: "A Flagelação de Jesus",
        meditation:
          "Jesus é cruelmente açoitado por amor a nós. Contemplemos as dores do Senhor e peçamos a graça da pureza.",
      },
      {
        title: "A Coroação de Espinhos",
        meditation:
          "Jesus é coroado de espinhos e escarnecido como rei. Peçamos a graça de humildade e perdão das ofensas.",
      },
      {
        title: "Jesus Carrega a Cruz a Caminho do Calvário",
        meditation:
          "Jesus sobe ao Calvário carregando a Cruz. Peçamos a graça da paciência nas tribulações da vida.",
      },
      {
        title: "A Crucifixão e Morte de Jesus",
        meditation:
          "Jesus morre na Cruz pela salvação do mundo. Contemplemos seu amor infinito e peçamos a graça da perseverança final.",
      },
    ],
  },
  glorious: {
    name: "Mistérios Gloriosos",
    days: "Quarta e Domingo",
    mysteries: [
      {
        title: "A Ressurreição de Jesus",
        meditation:
          "Jesus ressuscita ao terceiro dia, vencendo a morte. Peçamos a graça de viver uma vida nova em Cristo.",
      },
      {
        title: "A Ascensão de Jesus ao Céu",
        meditation:
          "Jesus sobe ao Céu, prometendo enviar o Espírito Santo. Peçamos a graça da esperança no Céu.",
      },
      {
        title: "A Vinda do Espírito Santo",
        meditation:
          "No dia de Pentecostes, o Espírito Santo desce sobre os Apóstolos e Maria. Peçamos os sete dons do Espírito Santo.",
      },
      {
        title: "A Assunção de Maria ao Céu",
        meditation:
          "Maria é elevada em corpo e alma à glória celestial. Peçamos a graça de uma boa morte.",
      },
      {
        title: "A Coroação de Maria como Rainha do Céu",
        meditation:
          "Maria é coroada Rainha do Céu e da terra. Contemplemos sua glória e peçamos sua maternal intercessão.",
      },
    ],
  },
  luminous: {
    name: "Mistérios Luminosos",
    days: "Quinta-feira",
    mysteries: [
      {
        title: "O Batismo de Jesus no Jordão",
        meditation:
          "Jesus é batizado por João Batista. O Pai O proclama Filho amado. Peçamos a graça de viver nossa identidade de filhos de Deus.",
      },
      {
        title: "As Bodas de Caná",
        meditation:
          "Jesus realiza seu primeiro milagre a pedido de Maria. Peçamos a graça da fé e da intercessão de Maria.",
      },
      {
        title: "O Anúncio do Reino de Deus",
        meditation:
          "Jesus prega o Evangelho e chama à conversão. Peçamos a graça de testemunhar o Reino com nossa vida.",
      },
      {
        title: "A Transfiguração do Senhor",
        meditation:
          "Jesus se transfigura diante de Pedro, Tiago e João. Peçamos a graça de contemplar a glória de Deus.",
      },
      {
        title: "A Instituição da Eucaristia",
        meditation:
          "Na Última Ceia, Jesus se entrega como alimento de vida eterna. Peçamos a graça da devoção eucarística.",
      },
    ],
  },
} as const satisfies Record<string, RosaryMysteryGroup>;

export type RosaryMysteryKey = keyof typeof ROSARY_MYSTERIES;

/**
 * Retorna o mistério tradicionalmente rezado no dia da semana atual.
 * Domingo: Gloriosos | Segunda: Gozosos | Terça: Dolorosos
 * Quarta: Gloriosos | Quinta: Luminosos | Sexta: Dolorosos | Sábado: Gozosos
 */
export function getTodayMystery(): RosaryMysteryKey {
  const day = new Date().getDay();
  switch (day) {
    case 0: // Domingo
    case 3: // Quarta
      return "glorious";
    case 1: // Segunda
    case 6: // Sábado
      return "joyful";
    case 2: // Terça
    case 5: // Sexta
      return "sorrowful";
    case 4: // Quinta
    default:
      return "luminous";
  }
}
