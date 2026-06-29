// Catálogo da seção "Música Sacra" do Sanctificare.
//
// Reúne obras-primas da tradição musical cristã (canto gregoriano, polifonia
// renascentista, barroco e romântico) para meditação, reflexão e contemplação.
//
// Todas as COMPOSIÇÕES listadas são de domínio público. As GRAVAÇÕES devem ser
// obtidas de fontes com licença livre (ex.: Musopen — CC0) antes de publicar.
//
// Cada faixa segue o mesmo padrão de status "planned" | "ready" usado em
// audio-meditations.ts: enquanto o arquivo .mp3 não estiver na pasta pública
// correspondente, a faixa fica como "planned" e a página mostra o caminho
// esperado. Assim que o arquivo for publicado, basta trocar para "ready".

import type { AudioCollection } from "@/data/audio-meditations";

const SACRED_MUSIC_BASE_PATH = "/audio/musica-sacra";

function sacredMusicUrl(fileName: string): string {
  return `${SACRED_MUSIC_BASE_PATH}/${fileName}`;
}

export const SACRED_MUSIC_COLLECTIONS: AudioCollection[] = [
  {
    id: "canto-gregoriano",
    kind: "sacred-music",
    title: "Canto Gregoriano",
    subtitle: "Silêncio e recolhimento",
    description:
      "A oração cantada da Igreja ao longo dos séculos. Melodias puras, sem instrumentos, para aquietar o coração e entrar na presença de Deus.",
    icon: "🎼",
    tracks: [
      {
        id: "greg-salve-regina",
        title: "Salve Regina",
        description:
          "A antífona mariana mais cantada da tradição, súplica confiante à Mãe de Misericórdia.",
        reference: "Antífona Mariana",
        durationSec: 300,
        narrator: "Schola Gregoriana",
        status: "planned",
        audioUrl: sacredMusicUrl("salve-regina.mp3"),
      },
      {
        id: "greg-lux-aeterna",
        title: "Lux Aeterna",
        description:
          "Luz eterna que brilha sobre os fiéis. Canto luminoso de esperança e descanso na vida eterna.",
        reference: "Missa de Réquiem",
        durationSec: 240,
        narrator: "Schola Gregoriana",
        status: "planned",
        audioUrl: sacredMusicUrl("lux-aeterna.mp3"),
      },
      {
        id: "greg-kyrie-orbis-factor",
        title: "Kyrie (Orbis Factor)",
        description:
          "Súplica pura de misericórdia: Senhor, tende piedade. Início do recolhimento orante.",
        reference: "Ordinário da Missa",
        durationSec: 210,
        narrator: "Schola Gregoriana",
        status: "planned",
        audioUrl: sacredMusicUrl("kyrie-orbis-factor.mp3"),
      },
    ],
  },
  {
    id: "js-bach",
    kind: "sacred-music",
    title: "Johann Sebastian Bach",
    subtitle: "Soli Deo Gloria",
    description:
      "O grande mestre do Barroco, cujas obras sacras foram escritas inteiramente para a glória de Deus e edificação da alma.",
    icon: "⛪",
    tracks: [
      {
        id: "med-kyrie-eleison-bach",
        title: "Kyrie eleison (Missa em Si Menor)",
        description:
          "Clamor solene por misericórdia na grandiosa abertura de uma das maiores obras corais da humanidade.",
        reference: "Missa em Si Menor, BWV 232",
        durationSec: 938,
        narrator: "European Archive (Coro e Orquestra)",
        status: "ready",
        audioUrl: "/r2-storage/bach-kyrie-eleison.mp3",
      },
      {
        id: "bach-christe-eleison-mass-b-minor",
        title: "Christe eleison (Missa em Si Menor)",
        description:
          "Um comovente dueto soprano que clama por misericórdia ao Cristo Salvador na segunda parte da Missa em Si Menor.",
        reference: "Missa em Si Menor, BWV 232",
        durationSec: 300,
        narrator: "European Archive (Coro e Orquestra)",
        status: "ready",
        audioUrl: "/r2-storage/J.S%20Bach%20-%20Mass%20in%20B%20minor%20-%202.%20Christe%20eleison.mp3",
      },
      {
        id: "bach-gloria-mass-b-minor",
        title: "Gloria in excelsis Deo (Missa em Si Menor)",
        description:
          "O radiante e majestoso hino de louvor dos anjos, abrindo a seção de Glória da grandiosa Missa em Si Menor.",
        reference: "Missa em Si Menor, BWV 232",
        durationSec: 441,
        narrator: "European Archive (Coro e Orquestra)",
        status: "ready",
        audioUrl: "/r2-storage/J.S%20Bach%20-%20Mass%20in%20B%20minor%20-%204.%20Gloria.mp3",
      },
      {
        id: "bach-laudamus-te-mass-b-minor",
        title: "Laudamus te (Missa em Si Menor)",
        description:
          "Uma alegre e virtuosa ária soprano de louvor e adoração à glória de Deus na seção de Glória da Missa em Si Menor.",
        reference: "Missa em Si Menor, BWV 232",
        durationSec: 258,
        narrator: "European Archive (Coro e Orquestra)",
        status: "ready",
        audioUrl: "/r2-storage/J.S%20Bach%20-%20Mass%20in%20B%20minor%20-%205.%20Laudamus.mp3",
      },
      {
        id: "bach-sanctus-bwv237",
        title: "Sanctus em Dó maior, BWV 237",
        description:
          "Um coro festivo e brilhante de louvor e exultação celestial: 'Santo, Santo, Santo é o Senhor'.",
        reference: "BWV 237",
        durationSec: 94,
        narrator: "European Archive (Coro e Orquestra)",
        status: "ready",
        audioUrl: "/r2-storage/Sanctus%20in%20C%20major%2C%20BWV%20237%20-%20Chorus.mp3",
      },
      {
        id: "bach-sanctus-bwv240",
        title: "Sanctus em Sol maior, BWV 240",
        description:
          "Um breve e solene coro barroco entoando a aclamação de louvor angelical do Sanctus.",
        reference: "BWV 240",
        durationSec: 87,
        narrator: "European Archive (Coro e Orquestra)",
        status: "ready",
        audioUrl: "/r2-storage/Sanctus%20in%20G%20major%2C%20BWV%20240%20-%20Chorus.mp3",
      },
      {
        id: "med-erbarme-dich",
        title: "Erbarme dich",
        description:
          "A emocionante ária do arrependimento de Pedro: \"Tem piedade, meu Deus, por amor das minhas lágrimas.\"",
        reference: "Paixão segundo Mateus, BWV 244",
        durationSec: 420,
        narrator: "Mitglieder des Rundfunkchores Berlin",
        status: "planned",
        audioUrl: sacredMusicUrl("erbarme-dich.mp3"),
      },
      {
        id: "med-ich-habe-genug",
        title: "Ich habe genug",
        description:
          "\"Tenho o suficiente\" — o doce repouso da alma que encontrou tudo o que precisa na presença do Salvador.",
        reference: "Cantata BWV 82",
        durationSec: 480,
        narrator: "European Archive",
        status: "planned",
        audioUrl: sacredMusicUrl("ich-habe-genug.mp3"),
        premium: true,
      },
      {
        id: "bach-magnificat-gloria-patri",
        title: "Gloria Patri (Magnificat em Ré maior)",
        description:
          "O coro final e triunfante do Magnificat em Ré maior de Bach, proclamando louvor à Santíssima Trindade.",
        reference: "Magnificat em Ré maior, BWV 243",
        durationSec: 158,
        narrator: "European Archive (Coro e Orquestra)",
        status: "ready",
        audioUrl: "/r2-storage/J.S%20Bach%20-%20Magnificat%20in%20D%20-%20Chorus%20Gloria%20Patri.mp3",
      },
      {
        id: "bach-magnificat-anima-mea",
        title: "Magnificat anima mea (Magnificat em Ré maior)",
        description:
          "O coro de abertura do Magnificat em Ré maior de Bach, cantando a exultação da Virgem Maria em Deus seu Salvador.",
        reference: "Magnificat em Ré maior, BWV 243",
        durationSec: 212,
        narrator: "European Archive (Coro e Orquestra)",
        status: "ready",
        audioUrl: "/r2-storage/J.S%20Bach%20-%20Magnificat%20in%20D%20-%20Chorus%20Magnificat%20anima%20mea.mp3",
      },
    ],
  },
  {
    id: "tomas-luis-de-victoria",
    kind: "sacred-music",
    title: "Tomás Luis de Victoria",
    subtitle: "Mística e Polifonia Espanhola",
    description:
      "O maior compositor do Renascimento espanhol. Suas obras expressam um misticismo ardente e uma profunda interioridade.",
    icon: "✝️",
    tracks: [
      {
        id: "poli-o-magnum-mysterium",
        title: "O Magnum Mysterium",
        description:
          "A contemplação do grande mistério do Natal: Deus que se faz humilde e nasce entre os animais.",
        reference: "Moteto Natalino",
        durationSec: 270,
        narrator: "The Tudor Consort",
        status: "planned",
        audioUrl: sacredMusicUrl("o-magnum-mysterium.mp3"),
      },
      {
        id: "poli-tenebrae-responsories",
        title: "Tenebrae Responsories",
        description:
          "Cantos solenes das trevas da Semana Santa, meditativos e profundos, para acompanhar a Paixão do Senhor.",
        reference: "Responsórios de Trevas",
        durationSec: 360,
        narrator: "The Tudor Consort",
        status: "planned",
        audioUrl: sacredMusicUrl("tenebrae-responsories.mp3"),
        premium: true,
      },
    ],
  },
  {
    id: "palestrina",
    kind: "sacred-music",
    title: "Giovanni Pierluigi da Palestrina",
    subtitle: "A perfeição da harmonia",
    description:
      "O mestre supremo da polifonia renascentista romana, cuja música pura e equilibrada foi tomada como modelo para a liturgia.",
    icon: "🏛️",
    tracks: [
      {
        id: "poli-sicut-cervus",
        title: "Sicut Cervus",
        description:
          "\"Como a corça anseia pelas fontes de água, assim a minha alma anseia por Vós, ó Deus.\"",
        reference: "Salmo 42 (41)",
        durationSec: 197,
        narrator: "Coro e Orquestra Domine Maris",
        status: "ready",
        audioUrl: "/r2-storage/Sicut%20cervus.mp3",
      },
    ],
  },
  {
    id: "mozart",
    kind: "sacred-music",
    title: "Wolfgang Amadeus Mozart",
    subtitle: "A beleza do classicismo",
    description:
      "A genialidade clássica expressa na música sacra, unindo a grandiosidade coral ao drama humano e divino.",
    icon: "🎻",
    tracks: [
      {
        id: "lit-lacrimosa",
        title: "Lacrimosa (Requiem)",
        description:
          "A última e comovente página escrita por Mozart em seu leito de morte. Lágrimas e esperança ante a eternidade.",
        reference: "Requiem em Ré menor, K. 626",
        durationSec: 210,
        narrator: "European Archive (Coro e Orquestra)",
        status: "planned",
        audioUrl: sacredMusicUrl("lacrimosa.mp3"),
      },
    ],
  },
  {
    id: "schubert",
    kind: "sacred-music",
    title: "Franz Schubert",
    subtitle: "Melodia e Devoção",
    description:
      "A sensibilidade do Romantismo aplicada à oração mariana mais célebre do repertório clássico.",
    icon: "🌹",
    tracks: [
      {
        id: "mar-ave-maria-schubert",
        title: "Ave Maria",
        description:
          "A melodia mariana mais famosa do mundo. Uma terna e confiante súplica à Mãe de Deus.",
        reference: "Franz Schubert",
        durationSec: 270,
        narrator: "Bradley Chapman (Canto e Piano)",
        status: "planned",
        audioUrl: sacredMusicUrl("ave-maria-schubert.mp3"),
      },
    ],
  },
  {
    id: "faure",
    kind: "sacred-music",
    title: "Gabriel Fauré",
    subtitle: "Esperança e Consolo",
    description:
      "A serenidade da música francesa no final do século XIX, trazendo paz e uma visão luminosa da eternidade.",
    icon: "🕊️",
    tracks: [
      {
        id: "med-in-paradisum",
        title: "In Paradisum (Requiem)",
        description:
          "\"Que os anjos te conduzam ao paraíso.\" Canto de despedida cheio de serenidade, paz e repouso eterno.",
        reference: "Requiem, Op. 48",
        durationSec: 210,
        narrator: "European Archive",
        status: "planned",
        audioUrl: sacredMusicUrl("in-paradisum.mp3"),
      },
    ],
  },
  {
    id: "bruckner",
    kind: "sacred-music",
    title: "Anton Bruckner",
    subtitle: "Fé e Monumentalidade",
    description:
      "Compositor profundamente católico, cujos motetos corais trazem a grandiosidade das catedrais para a música a cappella.",
    icon: "🕯️",
    tracks: [
      {
        id: "mar-ave-maria-bruckner",
        title: "Ave Maria",
        description:
          "Uma sublime e grandiosa composição a cappella dedicada à Virgem Maria, repleta de contraste e devoção.",
        reference: "Anton Bruckner",
        durationSec: 240,
        narrator: "The Tudor Consort",
        status: "planned",
        audioUrl: sacredMusicUrl("ave-maria-bruckner.mp3"),
      },
    ],
  },
  {
    id: "handel",
    kind: "sacred-music",
    title: "George Frideric Handel",
    subtitle: "Majestade e Triunfo",
    description:
      "A glória e o esplendor do oratório barroco britânico, celebrando a realeza e o triunfo de Cristo.",
    icon: "👑",
    tracks: [
      {
        id: "lit-hallelujah",
        title: "Hallelujah (Messias)",
        description:
          "O coro triunfante e inconfundível que celebra o reinado eterno de Cristo. Júbilo e louvor de Ressurreição.",
        reference: "Oratório O Messias, HWV 56",
        durationSec: 240,
        narrator: "European Archive",
        status: "planned",
        audioUrl: sacredMusicUrl("hallelujah.mp3"),
        premium: true,
      },
    ],
  },
  {
    id: "charles-gounod",
    kind: "sacred-music",
    title: "Charles Gounod",
    subtitle: "Lirismo e Devoção",
    description:
      "Compositor romântico francês célebre por suas óperas e música sacra, incluindo a sua famosa Ave Maria composta sobre o Prelúdio nº 1 de J.S. Bach.",
    icon: "🎻",
    tracks: [
      {
        id: "gounod-ave-maria-guitar",
        title: "Ave Maria (for Guitar)",
        description:
          "A clássica e comovente meditação mariana de Gounod, adaptada para violão solo.",
        reference: "Charles Gounod",
        durationSec: 140,
        narrator: "Violão Solo",
        status: "ready",
        audioUrl: "/r2-storage/Ave%20Maria%20(for%20Guitar).mp3",
      },
    ],
  },
  {
    id: "antonio-vivaldi",
    kind: "sacred-music",
    title: "Antonio Vivaldi",
    subtitle: "O Brilho do Barroco Italiano",
    description:
      "O 'Padre Ruivo' de Veneza, cujas obras instrumentais e sacras transmitem uma energia radiante, vivacidade e profunda devoção.",
    icon: "🎻",
    tracks: [
      {
        id: "vivaldi-concerto-rv588",
        title: "Concerto em Dó maior, RV 588",
        description:
          "Brilhante concerto para diversos instrumentos solo (flautas, chalameus, violinos, bandolins, teorbas e violoncelo).",
        reference: "RV 588",
        durationSec: 695,
        narrator: "European Archive",
        status: "ready",
        audioUrl: "/r2-storage/Concerto%20for%20two%20flutes%2C%20two%20shawms%2C%20two%20violins%2C%20two%20mandolins%2C%20two%20theorbos%20and%20cello%20in%20C%2C%20RV588.mp3",
      },
      {
        id: "vivaldi-gloria-rv589",
        title: "Gloria em Ré maior, RV 589",
        description:
          "A mais famosa obra coral sacra de Vivaldi, um hino jubilante de louvor e adoração.",
        reference: "RV 589",
        durationSec: 311,
        narrator: "European Archive (Coro e Orquestra)",
        status: "ready",
        audioUrl: "/r2-storage/Gloria%20in%20D%20major%2C%20RV%20589.mp3",
      },
      {
        id: "vivaldi-laudate-dominum-rv606",
        title: "Laudate Dominum, RV 606",
        description:
          "Um salmo de louvor vibrante e enérgico (Salmo 116), cantando 'Louvai ao Senhor todas as nações' com coro e cordas.",
        reference: "RV 606",
        durationSec: 221,
        narrator: "Orchestra Gli Armonici (Coro e Orquestra)",
        status: "ready",
        audioUrl: "/r2-storage/Orchestra%20Gli%20Armonici%2C%20100908%20Concerto%20della%20Madonna%20dei%20fiori%2C%2007%20A.Vivaldi%2C%20RV606%2C%20Laudate%20Dominum.mp3",
      },
    ],
  },
];
