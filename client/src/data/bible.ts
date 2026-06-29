export interface BibleBook {
  id: string;
  name: string;
  abbrev: string;
  testament: "old" | "new";
  chapters: number;
}

export const BIBLE_BOOKS: BibleBook[] = [
  // Antigo Testamento
  { id: "gn", name: "Gênesis", abbrev: "Gn", testament: "old", chapters: 50 },
  { id: "ex", name: "Êxodo", abbrev: "Ex", testament: "old", chapters: 40 },
  { id: "lv", name: "Levítico", abbrev: "Lv", testament: "old", chapters: 27 },
  { id: "nm", name: "Números", abbrev: "Nm", testament: "old", chapters: 36 },
  { id: "dt", name: "Deuteronômio", abbrev: "Dt", testament: "old", chapters: 34 },
  { id: "js", name: "Josué", abbrev: "Js", testament: "old", chapters: 24 },
  { id: "jz", name: "Juízes", abbrev: "Jz", testament: "old", chapters: 21 },
  { id: "rt", name: "Rute", abbrev: "Rt", testament: "old", chapters: 4 },
  { id: "1sm", name: "1 Samuel", abbrev: "1Sm", testament: "old", chapters: 31 },
  { id: "2sm", name: "2 Samuel", abbrev: "2Sm", testament: "old", chapters: 24 },
  { id: "1rs", name: "1 Reis", abbrev: "1Rs", testament: "old", chapters: 22 },
  { id: "2rs", name: "2 Reis", abbrev: "2Rs", testament: "old", chapters: 25 },
  { id: "1cr", name: "1 Crônicas", abbrev: "1Cr", testament: "old", chapters: 29 },
  { id: "2cr", name: "2 Crônicas", abbrev: "2Cr", testament: "old", chapters: 36 },
  { id: "esd", name: "Esdras", abbrev: "Esd", testament: "old", chapters: 10 },
  { id: "ne", name: "Neemias", abbrev: "Ne", testament: "old", chapters: 13 },
  { id: "tb", name: "Tobias", abbrev: "Tb", testament: "old", chapters: 14 },
  { id: "jt", name: "Judite", abbrev: "Jt", testament: "old", chapters: 16 },
  { id: "est", name: "Ester", abbrev: "Est", testament: "old", chapters: 16 },
  { id: "1mc", name: "1 Macabeus", abbrev: "1Mc", testament: "old", chapters: 16 },
  { id: "2mc", name: "2 Macabeus", abbrev: "2Mc", testament: "old", chapters: 15 },
  { id: "jó", name: "Jó", abbrev: "Jó", testament: "old", chapters: 42 },
  { id: "sl", name: "Salmos", abbrev: "Sl", testament: "old", chapters: 150 },
  { id: "pv", name: "Provérbios", abbrev: "Pv", testament: "old", chapters: 31 },
  { id: "ecl", name: "Eclesiastes", abbrev: "Ecl", testament: "old", chapters: 12 },
  { id: "ct", name: "Cântico dos Cânticos", abbrev: "Ct", testament: "old", chapters: 8 },
  { id: "sb", name: "Sabedoria", abbrev: "Sb", testament: "old", chapters: 19 },
  { id: "si", name: "Eclesiástico", abbrev: "Si", testament: "old", chapters: 51 },
  { id: "is", name: "Isaías", abbrev: "Is", testament: "old", chapters: 66 },
  { id: "jr", name: "Jeremias", abbrev: "Jr", testament: "old", chapters: 52 },
  { id: "lm", name: "Lamentações", abbrev: "Lm", testament: "old", chapters: 5 },
  { id: "br", name: "Baruc", abbrev: "Br", testament: "old", chapters: 6 },
  { id: "ez", name: "Ezequiel", abbrev: "Ez", testament: "old", chapters: 48 },
  { id: "dn", name: "Daniel", abbrev: "Dn", testament: "old", chapters: 14 },
  { id: "os", name: "Oséias", abbrev: "Os", testament: "old", chapters: 14 },
  { id: "jl", name: "Joel", abbrev: "Jl", testament: "old", chapters: 3 },
  { id: "am", name: "Amós", abbrev: "Am", testament: "old", chapters: 9 },
  { id: "ab", name: "Abdias", abbrev: "Ab", testament: "old", chapters: 1 },
  { id: "jn", name: "Jonas", abbrev: "Jn", testament: "old", chapters: 4 },
  { id: "mq", name: "Miquéias", abbrev: "Mq", testament: "old", chapters: 7 },
  { id: "na", name: "Naum", abbrev: "Na", testament: "old", chapters: 3 },
  { id: "hb", name: "Habacuc", abbrev: "Hb", testament: "old", chapters: 3 },
  { id: "sf", name: "Sofonias", abbrev: "Sf", testament: "old", chapters: 3 },
  { id: "ag", name: "Ageu", abbrev: "Ag", testament: "old", chapters: 2 },
  { id: "zc", name: "Zacarias", abbrev: "Zc", testament: "old", chapters: 14 },
  { id: "ml", name: "Malaquias", abbrev: "Ml", testament: "old", chapters: 4 },
  // Novo Testamento
  { id: "mt", name: "Mateus", abbrev: "Mt", testament: "new", chapters: 28 },
  { id: "mc", name: "Marcos", abbrev: "Mc", testament: "new", chapters: 16 },
  { id: "lc", name: "Lucas", abbrev: "Lc", testament: "new", chapters: 24 },
  { id: "jo", name: "João", abbrev: "Jo", testament: "new", chapters: 21 },
  { id: "at", name: "Atos dos Apóstolos", abbrev: "At", testament: "new", chapters: 28 },
  { id: "rm", name: "Romanos", abbrev: "Rm", testament: "new", chapters: 16 },
  { id: "1co", name: "1 Coríntios", abbrev: "1Co", testament: "new", chapters: 16 },
  { id: "2co", name: "2 Coríntios", abbrev: "2Co", testament: "new", chapters: 13 },
  { id: "gl", name: "Gálatas", abbrev: "Gl", testament: "new", chapters: 6 },
  { id: "ef", name: "Efésios", abbrev: "Ef", testament: "new", chapters: 6 },
  { id: "fl", name: "Filipenses", abbrev: "Fl", testament: "new", chapters: 4 },
  { id: "cl", name: "Colossenses", abbrev: "Cl", testament: "new", chapters: 4 },
  { id: "1ts", name: "1 Tessalonicenses", abbrev: "1Ts", testament: "new", chapters: 5 },
  { id: "2ts", name: "2 Tessalonicenses", abbrev: "2Ts", testament: "new", chapters: 3 },
  { id: "1tm", name: "1 Timóteo", abbrev: "1Tm", testament: "new", chapters: 6 },
  { id: "2tm", name: "2 Timóteo", abbrev: "2Tm", testament: "new", chapters: 4 },
  { id: "tt", name: "Tito", abbrev: "Tt", testament: "new", chapters: 3 },
  { id: "fm", name: "Filêmon", abbrev: "Fm", testament: "new", chapters: 1 },
  { id: "hb2", name: "Hebreus", abbrev: "Hb", testament: "new", chapters: 13 },
  { id: "tg", name: "Tiago", abbrev: "Tg", testament: "new", chapters: 5 },
  { id: "1pe", name: "1 Pedro", abbrev: "1Pe", testament: "new", chapters: 5 },
  { id: "2pe", name: "2 Pedro", abbrev: "2Pe", testament: "new", chapters: 3 },
  { id: "1jo", name: "1 João", abbrev: "1Jo", testament: "new", chapters: 5 },
  { id: "2jo", name: "2 João", abbrev: "2Jo", testament: "new", chapters: 1 },
  { id: "3jo", name: "3 João", abbrev: "3Jo", testament: "new", chapters: 1 },
  { id: "jd", name: "Judas", abbrev: "Jd", testament: "new", chapters: 1 },
  { id: "ap", name: "Apocalipse", abbrev: "Ap", testament: "new", chapters: 22 },
];

// Versículos famosos para demonstração
export const FAMOUS_VERSES: Record<string, string[]> = {
  jo: [
    "Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna. (Jo 3:16)",
    "Eu sou o caminho, a verdade e a vida. Ninguém vem ao Pai senão por mim. (Jo 14:6)",
    "Eu sou a ressurreição e a vida. Quem crê em mim, ainda que morra, viverá. (Jo 11:25)",
    "Deus é espírito, e os que o adoram devem adorá-lo em espírito e em verdade. (Jo 4:24)",
  ],
  sl: [
    "O Senhor é o meu pastor; nada me faltará. (Sl 23:1)",
    "Para ti, Senhor, elevo a minha alma. (Sl 25:1)",
    "Alegrei-me quando me disseram: Vamos à casa do Senhor! (Sl 122:1)",
    "Bendize, ó minha alma, ao Senhor, e não te esqueças de nenhum de seus benefícios. (Sl 103:2)",
  ],
  mt: [
    "Bem-aventurados os pobres em espírito, porque deles é o reino dos céus. (Mt 5:3)",
    "Vinde a mim, todos os que estais cansados e sobrecarregados, e eu vos darei descanso. (Mt 11:28)",
    "Pedi e dar-se-vos-á; buscai e achareis; batei e abrir-se-vos-á. (Mt 7:7)",
  ],
  fl: [
    "Tudo posso naquele que me fortalece. (Fl 4:13)",
    "Alegrai-vos sempre no Senhor. Outra vez digo: alegrai-vos. (Fl 4:4)",
    "A paz de Deus, que excede todo o entendimento, guardará os vossos corações e os vossos pensamentos em Cristo Jesus. (Fl 4:7)",
  ],
};

// Liturgia do dia - conteúdo de exemplo
export function getLiturgyForToday() {
  const today = new Date();
  const day = today.getDay();
  const month = today.getMonth() + 1;
  const date = today.getDate();

  const liturgies = [
    {
      firstReading: {
        reference: "Filipenses 4:4-9",
        text: "Irmãos, alegrai-vos sempre no Senhor. Outra vez digo: alegrai-vos! A vossa moderação seja conhecida de todos os homens. O Senhor está próximo. Não vos inquieteis com coisa alguma; antes, em tudo, fazei conhecidas as vossas petições a Deus, em oração e súplica, com ação de graças. E a paz de Deus, que excede todo o entendimento, guardará os vossos corações e os vossos pensamentos em Cristo Jesus.",
      },
      psalm: {
        reference: "Salmo 122",
        text: "Alegrei-me quando me disseram: Vamos à casa do Senhor!\nNossos pés já pisam os teus pátios, ó Jerusalém!\nJerusalém, cidade bem construída, compacta e unida!\nPara lá sobem as tribos, as tribos do Senhor.",
      },
      gospel: {
        reference: "João 14:1-6",
        text: "Não se turbe o vosso coração. Credes em Deus, crede também em mim. Na casa de meu Pai há muitas moradas. Se assim não fosse, eu vo-lo teria dito. Vou preparar-vos um lugar. E quando eu for e vos preparar um lugar, voltarei e vos tomarei para mim, para que onde eu estiver, vós também estejais. E para onde eu vou, vós sabeis o caminho. Disse-lhe Tomé: Senhor, não sabemos para onde vais; como podemos saber o caminho? Disse-lhe Jesus: Eu sou o caminho, a verdade e a vida. Ninguém vem ao Pai senão por mim.",
        reflection: "Jesus nos convida a confiar nele como o único caminho para o Pai. Em momentos de incerteza e turbulência, lembremos que Ele já foi preparar um lugar para nós. Nossa fé não é cega — é fundada na pessoa de Jesus Cristo, que é o próprio Caminho.",
      },
    },
  ];

  return liturgies[0];
}
