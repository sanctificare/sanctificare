export type LiturgicalRank = "Solenidade" | "Festa" | "Memória" | "Memória Facultativa";
export type LiturgicalColor = "branco" | "vermelho" | "verde" | "roxo" | "rosa" | "dourado";

export interface Saint {
  slug: string;
  name: string;
  title: string;
  day: number;
  month: number; // 1 a 12
  rank: LiturgicalRank;
  isHolyDayOfObligation?: boolean; // Festa de Guarda / Preceito
  liturgicalColor: LiturgicalColor;
  summary: string;
  quote?: string;
  biography: string;
  martyrdomOrPassing: string;
  relicsAndTradition: string;
  patronage: string[];
  prayer: string;
  image: string;
  linkedNovenaSlug?: string;
  linkedPrayerId?: string;
  // Campos Canônicos & Históricos Enriquecidos
  birthInfo?: string;
  deathInfo?: string;
  canonization?: string;
  iconography?: string[];
  majorWorks?: string[];
}

export const SAINTS_DATABASE: Saint[] = [
  // JANEIRO
  {
    slug: "santa-maria-mae-de-deus",
    name: "Santa Maria, Mãe de Deus",
    title: "Theotókos • Rainha do Céu e da Terra",
    day: 1,
    month: 1,
    rank: "Solenidade",
    isHolyDayOfObligation: true,
    liturgicalColor: "branco",
    summary: "Celebração da Maternidade Divina da Santíssima Virgem, dogma proclamado no Concílio de Éfeso (431 d.C.).",
    quote: "Minha alma engrandece o Senhor e meu espírito se alegra em Deus, meu Salvador.",
    biography: "No primeiro dia do ano civil, a Igreja coloca sob o manto da Santíssima Virgem todos os seus filhos. A maternidade divina de Maria é a fonte de todas as suas graças e privilégios. Sendo Mãe de Jesus Cristo, verdadeiro Deus e verdadeiro Homem, Maria é com toda a verdade a 'Theotókos' (Mãe de Deus), conforme solenemente definido pelo III Concílio Ecumênico de Éfeso em 431 contra a heresia nestoriana.",
    martyrdomOrPassing: "Ao final de sua vida terrena, a Virgem Maria foi assunta em corpo e alma à glória dos céus, onde reina como Rainha dos Anjos e dos Santos ao lado de seu Filho Divino.",
    relicsAndTradition: "A Santa Casa de Loreto (Itália) e o Santo Manto da Virgem preservado em Chartres (França) são alguns dos mais venerados memoriais de sua presença entre os homens.",
    patronage: ["Mães de família", "Toda a Cristandade", "A Paz no Mundo"],
    prayer: "Ó Deus, que pela virgindade fecunda de Maria destes à humanidade a salvação eterna, concedei-nos sentir a sua intercessão, por quem merecemos receber o Autor da vida, Jesus Cristo, vosso Filho. Amém.",
    image: "/assets/dashboard/oracoes.webp",
    linkedNovenaSlug: "nossa-senhora-das-gracas",
    birthInfo: "c. 20 a.C. em Jerusalém ou Nazaré, Judeia",
    deathInfo: "Dormição e Assunção aos Céus em Jerusalém / Éfeso",
    canonization: "Maternidade Divina (Theotókos) proclamada pelo Concílio de Éfeso (431 d.C.)",
    iconography: [
      "Manto azul e túnica vermelha",
      "Coroa de doze estrelas",
      "Lua sob os pés",
      "Menino Jesus nos braços"
    ],
    majorWorks: [
      "Cântico do Magnificat (Lc 1, 46-55)"
    ]
  },
  {
    slug: "santo-antao-abade",
    name: "Santo Antão, Abade",
    title: "Pai dos Monges do Deserto",
    day: 17,
    month: 1,
    rank: "Memória",
    liturgicalColor: "branco",
    summary: "O grande eremita do deserto egípcio que venceu combates espirituais e inspirou o monaquismo cristão.",
    quote: "Aquele que permanece no deserto e no recolhimento está livre de três combates: o do ouvir, o do falar e o do ver; resta-lhe apenas um: o do coração.",
    biography: "Nascido no Egito por volta do ano 251, Santo Antão ouviu na igreja a passagem evangélica: 'Se queres ser perfeito, vai, vende tudo o que tens e dá aos pobres'. Distribuiu imediatamente sua herança e retirou-se para a solidão do deserto da Tebaida. Ali travou lutas heróicas contra as tentações demoníacas através de jejuns, vigílias e oração ininterrupta. Sua vida, escrita por Santo Atanásio de Alexandria, converteu incontáveis almas no mundo antigo.",
    martyrdomOrPassing: "Faleceu santamente em idade avançadíssima, aos 105 anos, cercado por seus discípulos e ordenando que seu túmulo permanecesse oculto para evitar homenagens humanas.",
    relicsAndTradition: "Seu corpo foi posteriormente trasladado para Alexandria, depois Constantinopla, e no século XI levado para Saint-Antoine-l'Abbaye, na França, onde operou milagres contra o chamado 'fogo de Santo Antão'.",
    patronage: ["Monges", "Eremitas", "Agricultores", "Animais domésticos"],
    prayer: "Ó Deus, que concedestes a Santo Antão servir-vos no deserto com uma vida admirável, fazei que, por sua intercessão, saibamos renunciar a nós mesmos e amar-vos sempre sobre todas as coisas. Por Cristo, nosso Senhor. Amém.",
    image: "/assets/dashboard/lectio.webp",
    birthInfo: "c. 251 d.C. em Coma (Heracleópolis Magna), Alto Egito",
    deathInfo: "356 d.C. (105 anos) no Monte Colzim, Deserto Oriental do Egito",
    canonization: "Culto imemorial confirmado pelos Santos Padres da Igreja",
    iconography: [
      "Cruz em forma de T (Tau)",
      "Sino e cajado de eremita",
      "Livro das Sagradas Escrituras",
      "Porco aos pés (domínio sobre as paixões)"
    ],
    majorWorks: [
      "Cartas de Santo Antão aos Monges",
      "Sentenças do Deserto (Apophthegmata Patrum)"
    ]
  },
  {
    slug: "sao-sebastiao-martir",
    name: "São Sebastião, Mártir",
    title: "Defensor da Fé e Protetor contra Pestes",
    day: 20,
    month: 1,
    rank: "Memória",
    liturgicalColor: "vermelho",
    summary: "Oficial da guarda pretoriana de Roma que sustentou os mártires e derramou o próprio sangue por Cristo.",
    quote: "Não temais os sofrimentos do corpo passageiro; olhai para a coroa eterna que vos está reservada no Céu.",
    biography: "São Sebastião foi um distinto capitão da guarda imperial romana no reinado de Diocleciano. Usava secretamente de sua posição de prestígio para encorajar os cristãos presos que vacilavam diante das torturas. Descoberto como cristão, recusou-se a adorar os deuses pagãos. Diocleciano ordenou que fosse amarrado a um tronco e trespassado por flechas. Dado como morto, foi recolhido e curado pela piedosa Santa Irene. Recuperado, voltou a apresentar-se ao imperador repreendendo sua crueldade contra os inocentes.",
    martyrdomOrPassing: "Diante de sua nova e corajosa confissão de fé, o imperador ordenou que fosse espancado com varas até a morte no Hipódromo do Palatino, alcançando assim a palma do duplo martírio em 288 d.C.",
    relicsAndTradition: "Seu corpo repousa na Basílica de São Sebastião Extramuros, em Roma, sobre uma das mais célebres catacumbas do cristianismo primitivo.",
    patronage: ["Soldados", "Atletas", "Protetor contra a peste, a fome e a guerra", "Co-padroeiro da cidade do Rio de Janeiro"],
    prayer: "Concedei-nos, Senhor, o espírito de fortaleza, para que, sustentados pelo admirável exemplo do vosso mártir São Sebastião, aprendamos a obedecer antes a Vós do que aos homens. Por Cristo, nosso Senhor. Amém.",
    image: "/assets/dashboard/via-sacra.webp",
    birthInfo: "c. 256 d.C. em Narbona (Gália) ou Milão (Itália)",
    deathInfo: "20 de janeiro de 288 d.C. (32 anos) em Roma",
    canonization: "Culto imemorial martirial desde a Igreja Primitiva",
    iconography: [
      "Amarrado a um tronco e trespassado por flechas",
      "Armadura de capitão romano",
      "Palma gloriosa do martírio"
    ]
  },
  {
    slug: "sao-tomas-de-aquino",
    name: "São Tomás de Aquino",
    title: "Doutor Angélico • Patrono dos Estudantes",
    day: 28,
    month: 1,
    rank: "Memória",
    liturgicalColor: "branco",
    summary: "O maior teólogo e filósofo da Igreja Católica, autor da Suma Teológica e dos hinos eucarísticos.",
    quote: "Não quero outra recompensa senão a Vós, meu Senhor!",
    biography: "Nascido no castelo de Roccasecca na Itália (1225), Tomás entrou para a novel Ordem dos Pregadores (Dominicanos) contrariando a família nobre. Discípulo de Santo Alberto Magno, sintetizou de forma sublime a filosofia aristotélica e a teologia cristã, demonstrando que a Fé e a Razão são asas harmônicas do conhecimento da verdade. Compôs a magistral 'Suma Teológica' e os solenes hinos da festa de Corpus Christi (como o Pange Lingua e o Tantum Ergo).",
    martyrdomOrPassing: "Em 1274, a caminho do Concílio de Lyon, adoeceu na Abadia cisterciense de Fossanova. Ao receber o Santo Viático, professou seu amor infinito à Eucaristia e entregou sua alma pura a Deus.",
    relicsAndTradition: "Suas insignes relíquias repousam sob o altar da Igreja dos Jacobinos, em Toulouse (França).",
    patronage: ["Estudantes", "Universidades católicas", "Teólogos", "Acadêmicos"],
    prayer: "Ó Deus, que tornastes São Tomás de Aquino célebre pelo amor à santidade e pela dedicação à ciência sagrada, concedei-nos compreender seus ensinamentos e imitar seus exemplos. Por Cristo, nosso Senhor. Amém.",
    image: "/assets/dashboard/biblia.webp",
    birthInfo: "1225 no Castelo de Roccasecca, Reino da Sicília (Itália)",
    deathInfo: "7 de março de 1274 (49 anos) na Abadia de Fossanova, Itália",
    canonization: "18 de julho de 1323 pelo Papa João XXII • Proclamado Doutor da Igreja em 1567 por São Pio V",
    iconography: [
      "Sol resplandecente no peito",
      "Pomba do Espírito Santo no ouvido",
      "Hábito dominicano",
      "Suma Teológica e pena de escrever",
      "Cálice e Ostensório"
    ],
    majorWorks: [
      "Suma Teológica (Summa Theologiae)",
      "Suma contra os Gentios",
      "Hinos Eucarísticos (Pange Lingua, Tantum Ergo, Adoro Te Devote, Panis Angelicus)",
      "Catena Aurea (Cadeia de Ouro)"
    ]
  },

  // MARÇO
  {
    slug: "sao-jose-esposo-de-maria",
    name: "São José, Esposo da Virgem Maria",
    title: "Patrono Universal da Igreja • Terror dos Demônios",
    day: 19,
    month: 3,
    rank: "Solenidade",
    isHolyDayOfObligation: true,
    liturgicalColor: "branco",
    summary: "O Justo e Castíssimo patriarca escolhido por Deus para guardar a Sagrada Família de Nazaré.",
    quote: "Eis o servo fiel e prudente a quem o Senhor confiou a sua casa.",
    biography: "Descendente da linhagem real do Rei Davi, São José foi o homem justo a quem o Pai Eterno confiou a custódia virginal de Nossa Senhora e a criação paternal do Verbo Encarnado. Silencioso, forte, obediente aos desígnios divinos nos sonhos angélicos, protegeu o Menino Jesus da fúria de Herodes na fuga para o Egito e sustentou a casa de Nazaré com o suor de seu trabalho de carpinteiro.",
    martyrdomOrPassing: "Teve a morte mais sublime da história humana, expirando docemente nos braços amorosos de Jesus e de Maria, razão pela qual é o supremo patrono da boa morte.",
    relicsAndTradition: "Seu santo cinto e manto são preservados em santuários como Roma e Aachen; inúmeros Papas atestaram o poder invencível de sua intercessão.",
    patronage: ["Igreja Universal", "Famílias", "Trabalhadores", "Pai de família", "Moribundos", "Proteção contra as ciladas do demônio"],
    prayer: "A vós, São José, recorremos em nossa tribulação. Pelo laço sagrado de caridade que vos uniu à Virgem Imaculada Mãe de Deus, e pelo amor paternal que tivestes ao Menino Jesus, protegei a herança adquirida por Cristo e defendei a nós vossos devotos. Amém.",
    image: "/assets/dashboard/oracoes.webp",
    linkedNovenaSlug: "sao-jose",
    birthInfo: "Século I a.C. em Belém / Nazaré, linhagem real do Rei Davi",
    deathInfo: "c. 30 d.C. em Nazaré, repousando nos braços de Jesus e Maria",
    canonization: "Proclamado Patrono Universal da Igreja em 1870 pelo Beato Papa Pio IX",
    iconography: [
      "Lírio florido (símbolo de sua castidade perfeitíssima)",
      "Menino Jesus no colo",
      "Ferramentas de carpinteiro (esquadro e serrote)",
      "Cajado florido"
    ]
  },
  {
    slug: "anunciacao-do-senhor",
    name: "Anunciação do Senhor",
    title: "O Mistério da Encarnação do Verbo Divino",
    day: 25,
    month: 3,
    rank: "Solenidade",
    liturgicalColor: "branco",
    summary: "O momento sagrado em que o Arcanjo Gabriel anunciou à Virgem Maria que dela nasceria o Salvador do mundo.",
    quote: "Eis aqui a serva do Senhor; faça-se em mim segundo a tua palavra.",
    biography: "Nove meses antes do Santo Natal, celebramos o momento culminante da história da salvação: o Arcanjo São Gabriel é enviado à modesta casa de Nazaré. Diante do 'Fiat' humilde e incondicional de Maria Santíssima, o Espírito Santo desceu sobre ela e a Segunda Pessoa da Santíssima Trindade assumiu nossa carne humana no seio puríssimo da Virgem.",
    martyrdomOrPassing: "Celebração do mistério da Encarnação, princípio de nossa redenção.",
    relicsAndTradition: "A Gruta da Anunciação em Nazaré e a Santa Casa transportada milagrosamente pelos anjos para Loreto (Itália).",
    patronage: ["Mulheres grávidas", "Nascituros", "Vocacionados", "A vida humana desde a concepção"],
    prayer: "Ó Deus, que pela anunciacão do Anjo quisestes que vosso Verbo assumisse a nossa carne no seio da Virgem Maria, concedei aos vossos servos, que a proclamam verdadeira Mãe de Deus, serem ajudados por sua intercessão junto de Vós. Por nosso Senhor Jesus Cristo. Amém.",
    image: "/assets/dashboard/novenas.webp",
    birthInfo: "Nazaré da Galileia (c. 5 a.C.)",
    deathInfo: "Princípio e aurora da Redenção do gênero humano",
    canonization: "Solenidade Maior do Senhor no Calendário Litúrgico Romano",
    iconography: [
      "Arcanjo Gabriel com o lírio da pureza",
      "Espírito Santo em forma de Pomba luminosa",
      "Virgem Maria em oração acolhendo o Anjo"
    ]
  },

  // MAIO
  {
    slug: "nossa-senhora-de-fatima",
    name: "Nossa Senhora de Fátima",
    title: "Rainha do Santo Rosário",
    day: 13,
    month: 5,
    rank: "Memória",
    liturgicalColor: "branco",
    summary: "As aparições da Virgem Mãe aos três pastorinhos na Cova da Iria com o apelo à oração do Rosário e penitência.",
    quote: "Rezem o Terço todos os dias para alcançar a paz para o mundo e o fim da guerra.",
    biography: "Em 1917, no vilarejo de Fátima (Portugal), a Virgem Maria apareceu seis vezes aos pastorinhos Lúcia, Francisco e Jacinta. Mostrou-lhes a realidade do Céu, do Purgatório e do Inferno, pedindo a consagração da Rússia ao seu Imaculado Coração, a comunhão reparadora nos Primeiros Sábados e a oração diária do Santo Rosário pela conversão dos pecadores. O milagre do Sol no dia 13 de outubro confirmou diante de 70 mil pessoas a autenticidade divina da mensagem.",
    martyrdomOrPassing: "Os videntes São Francisco e Santa Jacinta Marto viveram vidas de heroica expiação e faleceram santamente na infância, sendo canonizados pelo Papa Francisco.",
    relicsAndTradition: "O Santuário de Fátima na Cova da Iria atrai milhões de peregrinos anualmente. A coroa da imagem guarda a bala que atingiu São João Paulo II no atentado de 1981.",
    patronage: ["A Paz mundial", "Portugal", "Devotos do Santo Rosário", "Conversão dos pecadores"],
    prayer: "Santíssima Virgem de Fátima, que repetistes com insistência o pedido de rezar o Terço todos os dias, dai-nos perseverança e amor ardente na oração, para obtermos a salvação de nossas almas e a paz no mundo. Por Cristo, nosso Senhor. Amém.",
    image: "/assets/dashboard/rosario.webp",
    linkedNovenaSlug: "nossa-senhora-de-fatima",
    birthInfo: "Primeira aparição em 13 de maio de 1917 na Cova da Iria, Fátima (Portugal)",
    deathInfo: "Milagre do Sol presenciado por 70 mil pessoas em 13 de outubro de 1917",
    canonization: "Aparições aprovadas pelo Bispo de Leiria em 1930 com confirmação da Santa Sé",
    iconography: [
      "Vestes brancas puríssimas com bordados dourados",
      "Santo Terço de contas brancas nas mãos",
      "Coração Imaculado cercado de espinhos",
      "Azinheira sagrada"
    ],
    majorWorks: [
      "Mensagem de Fátima (Segredos de Fátima e Devoção Reparadora dos Primeiros Sábados)"
    ]
  },
  {
    slug: "santa-rita-de-cassia",
    name: "Santa Rita de Cássia",
    title: "Advogada das Causas Impossíveis e Desesperadas",
    day: 22,
    month: 5,
    rank: "Memória",
    liturgicalColor: "branco",
    summary: "Esposa, mãe, viúva e monja agostiniana que recebeu o estigma do espinho da Paixão de Cristo na fronte.",
    quote: "Nada é impossível para quem ama a Cruz de Jesus Cristo com todo o coração.",
    biography: "Santa Rita nasceu em Roccaporena, Itália, em 1381. Suportou com doçura heróica e paciência um marido violento, convertendo-o antes de sua morte. Após a perda trágica dos filhos, superou ódios entre famílias para reconciliar a cidade e ingressou milagrosamente no mosteiro agostiniano de Santa Maria Madalena em Cássia. Por 15 anos levou na testa a chaga viva e dolorosa de um dos espinhos da coroa do Senhor.",
    martyrdomOrPassing: "Faleceu em 22 de maio de 1457; no momento de sua morte, os sinos de Cássia tocaram milagrosamente sozinhos pelos anjos e a cela encheu-se de suave perfume de rosas.",
    relicsAndTradition: "Seu corpo incorrupto repousa na Basílica de Santa Rita em Cássia (Itália), emanando prodigiosamente fragrâncias celestes até os dias de hoje.",
    patronage: ["Causas desesperadas e impossíveis", "Mulheres mal casadas", "Mães angustiadas", "Vítimas de abusos"],
    prayer: "Ó gloriosa Santa Rita de Cássia, advogada dos casos desesperados, olhai com compaixão para as minhas aflições. Vós que tão intimamente participastes das dores de Jesus, alcançai-me de Deus a graça que ardentemente vos suplico. Por Cristo, nosso Senhor. Amém.",
    image: "/assets/dashboard/oracoes.webp",
    linkedNovenaSlug: "santa-rita-de-cassia",
    birthInfo: "1381 em Roccaporena, Úmbria (Itália)",
    deathInfo: "22 de maio de 1457 (76 anos) em Cássia, Itália",
    canonization: "24 de maio de 1900 pelo Papa Leão XIII",
    iconography: [
      "Espinho vivo sangrando na fronte",
      "Rosas e figos milagrosos",
      "Crucifixo contemplado em êxtase",
      "Hábito monástico agostiniano"
    ]
  },
  {
    slug: "santa-joana-d-arc",
    name: "Santa Joana d'Arc, Virgem e Mártir",
    title: "A Donzela de Orléans • Padroeira da França",
    day: 30,
    month: 5,
    rank: "Memória",
    liturgicalColor: "vermelho",
    summary: "Jovem camponesa de 17 anos que, guiada por São Miguel Arcanjo, libertou a França e morreu na fogueira invocando Jesus.",
    quote: "Eu não tenho medo; Deus está comigo, foi para isso que eu nasci!",
    biography: "Nascida em Domrémy em 1412 durante a Guerra dos Cem Anos, Joana era uma donzela piedosa e iletrada. Aos treze anos, começou a ouvir as vozes celestes de São Miguel Arcanjo, Santa Catarina de Alexandria e Santa Margarida de Antioquia, que a instruíram a coroar o Delfim Carlos VII e expulsar os invasores. Com coragem sobrenatural e pureza imaculada, comandou o exército francês sob o estandarte de Jesus e Maria, rompendo o cerco de Orléans.",
    martyrdomOrPassing: "Traída e vendida aos inimigos ingleses, foi submetida a um julgamento eclesiástico fraudulento. Condenada injustamente como herege, foi queimada viva na praça de Rouen aos 19 anos em 30 de maio de 1431, fitando uma cruz e gritando o Santo Nome de 'Jesus' até seu último suspiro.",
    relicsAndTradition: "Seu coração permaneceu intacto e incólume no meio das cinzas ardentes, sendo atirado ao rio Sena pelos carrascos atônitos. A Santa Sé reabilitou totalmente sua honra em 1456 e a canonizou em 1920.",
    patronage: ["Soldados", "França", "Jovens patriotas", "Vítimas de injustiças e calúnias", "Cativos"],
    prayer: "Ó Deus, que suscitastes admiravelmente Santa Joana d'Arc para defender a fé e a pátria com pureza e fortaleza indômita, concedei-nos, por sua intercessão, vencer as batalhas espirituais e permanecer fiéis a Cristo até a morte. Amém.",
    image: "/assets/dashboard/quaresma-sao-miguel.webp",
    birthInfo: "6 de janeiro de 1412 em Domrémy, Ducado de Bar (França)",
    deathInfo: "30 de maio de 1431 (19 anos) em Rouen, Normandia (França)",
    canonization: "16 de maio de 1920 pelo Papa Bento XV",
    iconography: [
      "Armadura de cavaleiro com estandarte de Jesus e Maria",
      "Espada consagrada de Fierbois",
      "Palma do martírio e lírio da França",
      "Crucifixo fitado na fogueira"
    ]
  },

  // JUNHO
  {
    slug: "santo-antonio-de-padua",
    name: "Santo Antônio de Pádua e Lisboa",
    title: "Doutor Evangélico • O Santo de Todo o Mundo",
    day: 13,
    month: 6,
    rank: "Festa",
    liturgicalColor: "branco",
    summary: "Frade franciscano de eloqüência incomparável, mestre das Sagradas Escrituras e amigo dos pobres.",
    quote: "A linguagem viva é o exemplo. Calem-se as palavras e falem as obras.",
    biography: "Fernando de Bulhões nasceu em Lisboa (1195). Cônego agostiniano, comoveu-se com o martírio dos primeiros franciscanos em Marrocos e abraçou a Regra de São Francisco, tomando o nome de Antônio. Destacou-se por sua pregação inflamada que convertia multidões de hereges na Itália e na França, merecendo o título de 'Martelo dos Hereges'. Teve a visão mística do Menino Jesus em seus braços.",
    martyrdomOrPassing: "Faleceu santamente nos arredores de Pádua em 13 de junho de 1231, com apenas 36 anos, exclamando: 'Vejo o meu Senhor Jesus!'. Foi canonizado menos de um ano após sua morte.",
    relicsAndTradition: "Sua santa língua e cordas vocais permanecem milagrosamente incorruptas na Basílica del Santo em Pádua (Itália).",
    patronage: ["Pobres", "Objetos perdidos", "Lisboa e Pádua", "Casamentos santos", "Padeiros e agricultores"],
    prayer: "Ó Deus, que destes a Santo Antônio o dom de comover corações pela pregação do Evangelho e pelo socorro aos necessitados, fazei que, pelo seu auxílio, sejamos firmes na caridade cristã. Por Cristo, nosso Senhor. Amém.",
    image: "/assets/dashboard/oracoes.webp",
    linkedNovenaSlug: "santo-antonio",
    birthInfo: "15 de agosto de 1195 em Lisboa, Reino de Portugal",
    deathInfo: "13 de junho de 1231 (35 anos) no Convento de Arcella, Pádua (Itália)",
    canonization: "30 de maio de 1232 pelo Papa Gregório IX • Proclamado Doutor da Igreja em 1946 por Pio XII",
    iconography: [
      "Menino Jesus nos braços",
      "Lírio da pureza virginal",
      "Livro dos Santos Evangelhos",
      "Pão dos Pobres",
      "Hábito franciscano com cordão de três nós"
    ],
    majorWorks: [
      "Sermões Dominicais e Festivos (Sermones)",
      "Comentários aos Salmos"
    ]
  },
  {
    slug: "sao-joao-batista",
    name: "Natividade de São João Batista",
    title: "O Precursor do Messias • A Voz que Clama no Deserto",
    day: 24,
    month: 6,
    rank: "Solenidade",
    liturgicalColor: "branco",
    summary: "O maior entre os nascidos de mulher, santificado ainda no seio materno ao ouvir a saudação de Maria.",
    quote: "É necessário que Ele cresça e que eu diminua.",
    biography: "Filho de Zacarias e Santa Isabel, João Batista foi santificado pela graça divina no ventre de sua mãe no momento da Visitação de Nossa Senhora. Viveu na austeridade do deserto, pregando o batismo de penitência e apontando o Cordeiro de Deus que tira o pecado do mundo. A Igreja celebra excepcionalmente sua natividade carnal e seu martírio.",
    martyrdomOrPassing: "Foi decapitado na fortaleza de Maqueronte por ordem do rei Herodes Ântipas, após repreender corajosamente o adultério e escândalo do soberano.",
    relicsAndTradition: "A cabeça venerada de São João Batista é preservada na Basílica de San Silvestro in Capite em Roma e na Catedral de Amiens na França.",
    patronage: ["Profetas", "Conversão de corações", "Costureiros", "Monarquias cristãs"],
    prayer: "Ó Deus, que suscitastes São João Batista para preparar para Cristo, o Senhor, um povo perfeito, concedei à vossa Igreja as alegrias espirituais e guiai os passos dos fiéis no caminho da salvação e da paz. Amém.",
    image: "/assets/dashboard/liturgia.webp",
    birthInfo: "c. 6 a.C. em Aim Karim, Montanhas da Judeia",
    deathInfo: "c. 31 d.C. na Fortaleza de Maqueronte, Decápolis",
    canonization: "O maior dos profetas, santificado no seio materno",
    iconography: [
      "Vestes de pele de camelo com cinto de couro",
      "Cordeiro com a flâmula 'Ecce Agnus Dei'",
      "Concha do Batismo no Rio Jordão",
      "Cajado em forma de cruz"
    ]
  },
  {
    slug: "sao-pedro-e-sao-paulo",
    name: "São Pedro e São Paulo, Apóstolos",
    title: "As Colunas da Igreja de Roma e Príncipes dos Apóstolos",
    day: 29,
    month: 6,
    rank: "Solenidade",
    isHolyDayOfObligation: true,
    liturgicalColor: "vermelho",
    summary: "O primeiro Papa e Vigário de Cristo junto ao Apóstolo dos Gentios, que consagraram Roma com o sangue do martírio.",
    quote: "Tu és o Cristo, o Filho do Deus vivo! / Combati o bom combate, terminei a corrida, guardei a fé.",
    biography: "Pedro, o pescador da Galiléia, recebeu de Cristo as Chaves do Reino dos Céus como rocha visível da Igreja ('Tu és Pedro, e sobre esta pedra edificarei a minha Igreja'). Paulo, de perseguidor feroz dos cristãos a Doutor das Nações, levou o Evangelho aos confins do Império Romano através de suas viagens e epístolas inspiradas pelo Espírito Santo.",
    martyrdomOrPassing: "Ambos sofreram o martírio sob a perseguição de Nero em Roma por volta de 67 d.C.: São Pedro crucificado de cabeça para baixo na Colina Vaticana por considerar-se indigno de morrer como o Mestre; São Paulo decapitado nas Três Fontes por ser cidadão romano.",
    relicsAndTradition: "Os túmulos sagrados dos Apóstolos estão sob os altares papais da Basílica de São Pedro no Vaticano e da Basílica de São Paulo Extramuros em Roma.",
    patronage: ["O Santo Padre o Papa", "A Santa Sé Apostólica", "Pescadores", "Missionários", "Teólogos e juristas"],
    prayer: "Ó Deus, que nos dais a santa alegria de celebrar a solenidade dos Apóstolos Pedro e Paulo, concedei à vossa Igreja seguir em tudo a doutrina daqueles por quem começou a receber a fé. Por Cristo, nosso Senhor. Amém.",
    image: "/assets/dashboard/biblia.webp",
    birthInfo: "São Pedro em Betsaida da Galileia (c. 1 a.C.) • São Paulo em Tarso da Cilícia (c. 5 d.C.)",
    deathInfo: "c. 64-67 d.C. em Roma sob a perseguição de Nero",
    canonization: "Príncipes dos Apóstolos e Fundadores da Sé Romana",
    iconography: [
      "São Pedro com as Chaves de Ouro e Prata e o Galo",
      "São Paulo com a Espada e o Livro das Epístolas",
      "Mantos apostólicos clássicos"
    ],
    majorWorks: [
      "Primeira e Segunda Epístola de São Pedro",
      "14 Epístolas Paulinas (Romanos, Coríntios, Gálatas, Efésios, Filipenses, etc.)"
    ]
  },

  // JULHO
  {
    slug: "sao-bento-de-nursia",
    name: "São Bento de Núrsia, Abade",
    title: "Patriarca dos Monges do Ocidente • Padroeiro da Europa",
    day: 11,
    month: 7,
    rank: "Festa",
    liturgicalColor: "branco",
    summary: "Pai da civilização cristã medieval, autor da Santa Regra e propagador da oração e trabalho (Ora et Labora).",
    quote: "Nada preferir ao amor de Cristo.",
    biography: "Nascido em Núrsia por volta de 480, abandonou os estudos em Roma para buscar somente a Deus na solidão de Subiaco. Fundou a célebre Abadia de Monte Cassino e redigiu a Santa Regra Beneditina, alicerce da espiritualidade e da cultura monástica que reconstruiu a Europa após a queda do Império Romano. Operou inúmeros milagres contra venenos e armadilhas do demônio com o sinal da Santa Cruz.",
    martyrdomOrPassing: "Faleceu em 547 de pé diante do altar de Monte Cassino, sustentado pelos braços de seus irmãos monges, em atitude de oração com as mãos elevadas aos céus após receber o Corpo do Senhor.",
    relicsAndTradition: "A famosa Medalha-Cruz de São Bento contém exorcismos seculares ('Vade Retro Satana') com poder imenso contra as forças das trevas. Seus restos descansam sob o altar de Monte Cassino.",
    patronage: ["Europa", "Monges", "Agricultores", "Engenheiros", "Proteção contra feitiçarias e tentações diabólicas"],
    prayer: "A Cruz Sagrada seja a minha luz, não seja o dragão meu guia. Retira-te, satanás! Nunca me aconselhes coisas vãs. É mau o que me ofereces, bebe tu mesmo o teu veneno. Rogai por nós, glorioso Patriarca São Bento, para que sejamos dignos das promessas de Cristo. Amém.",
    image: "/assets/dashboard/lectio.webp",
    linkedPrayerId: "oracao-sao-bento",
    birthInfo: "c. 480 d.C. em Núrsia, Úmbria (Itália)",
    deathInfo: "21 de março de 547 d.C. (67 anos) na Abadia de Monte Cassino, Itália",
    canonization: "1220 pelo Papa Honório III • Proclamado Padroeiro Principal da Europa em 1964 por São Paulo VI",
    iconography: [
      "Hábito beneditino negro com capuz",
      "Livro da Santa Regra (Regula Benedicti)",
      "Cálice quebrado com serpente saindo",
      "Corvo com pedaço de pão",
      "Báculo abacial e a Medalha-Cruz"
    ],
    majorWorks: [
      "A Santa Regra de São Bento (Regula Benedicti)"
    ]
  },

  // AGOSTO
  {
    slug: "santo-afonso-de-ligorio",
    name: "Santo Afonso Maria de Ligório",
    title: "Doutor Zelosíssimo da Igreja • Fundador dos Redentoristas",
    day: 1,
    month: 8,
    rank: "Memória",
    liturgicalColor: "branco",
    summary: "Mestre da teologia moral, apóstolo do povo simples e grande cantor das glórias de Maria Santíssima.",
    quote: "Quem reza se salva; quem não reza se condena.",
    biography: "Advogado de sucesso estrondoso em Nápoles, Afonso abandonou os tribunais após um erro em processo para dedicar-se inteiramente a Cristo ('Mundo, eu te conheci, adeus!'). Ordenado sacerdote, fundou a Congregação do Santíssimo Redentor para evangelizar os camponeses e pastores mais abandonados. Escreveu clássicos espirituais inestimáveis como 'As Glórias de Maria', 'A Prática do Amor a Jesus Cristo' e o 'Tratado de Teologia Moral'.",
    martyrdomOrPassing: "Suportou com admirável resignação terríveis dores de artrite cervical deformante e morreu santamente com a imagem de Maria nas mãos em 1787, aos 90 anos.",
    relicsAndTradition: "Seu corpo incorrupto é venerado na Basílica de Santo Afonso em Pagani, perto de Nápoles.",
    patronage: ["Confessores", "Moralistas", "Advogados", "Pregadores de missões populares"],
    prayer: "Ó Deus, que na vossa Igreja suscitastes Santo Afonso Maria como modelo de zelo pelas almas, concedei-nos, inflamados pelo mesmo amor, trabalhar pela salvação dos irmãos e alcançar com ele a glória do Céu. Amém.",
    image: "/assets/dashboard/oracoes.webp",
    birthInfo: "27 de setembro de 1696 em Marianella, Nápoles (Itália)",
    deathInfo: "1 de agosto de 1787 (90 anos) em Pagani, Nápoles (Itália)",
    canonization: "26 de maio de 1839 pelo Papa Gregório XVI • Proclamado Doutor da Igreja em 1871 pelo Beato Pio IX",
    iconography: [
      "Hábito e crucifixo redentorista",
      "Estola episcopal e mitra de bispo",
      "Ícone de Nossa Senhora do Perpétuo Socorro",
      "Pena de escrever e tratados morais"
    ],
    majorWorks: [
      "As Glórias de Maria (Le Glorie di Maria)",
      "A Prática do Amor a Jesus Cristo",
      "Tratado de Teologia Moral",
      "A Oração: Grande Meio de Salvação",
      "Visitas ao Santíssimo Sacramento e a Maria Santíssima"
    ]
  },
  {
    slug: "sao-joao-maria-vianney",
    name: "São João Maria Vianney (Cura d'Ars)",
    title: "Padroeiro de Todos os Párocos e Sacerdotes",
    day: 4,
    month: 8,
    rank: "Memória",
    liturgicalColor: "branco",
    summary: "O humilde pároco da aldeia de Ars que passava até 18 horas no confessionário e reconverteu a França.",
    quote: "O Sacerdócio é o amor do Coração de Jesus. Se compreendêssemos bem o que é um padre na terra, morreríamos, não de pavor, mas de amor.",
    biography: "Nascido em Dardilly perto de Lyon (1786), enfrentou imensas dificuldades nos estudos sacerdotais devido à sua simplicidade, mas foi ordenado por seu fervor e virtude singular. Enviado à pequena e espiritualmente fria paróquia de Ars, converteu toda a população com jejuns rigorosos, adoração noturna diante do Sacrário e caridade inesgotável. Milhares de peregrinos de toda a Europa viajavam até Ars para confessar-se com ele.",
    martyrdomOrPassing: "Faleceu extenuado pelo zelo pastoral em 4 de agosto de 1859, aos 73 anos.",
    relicsAndTradition: "Seu corpo incorrupto repousa na Basílica de Ars (França), e seu coração intacto é venerado como relíquia insigne.",
    patronage: ["Párocos", "Sacerdotes", "Confessores"],
    prayer: "Deus de bondade e misericórdia, que fizestes de São João Maria Vianney um sacerdote admirável pelo zelo pastoral e amor à oração e à penitência, dai-nos, por seu exemplo e intercessão, ganhar para Cristo os nossos irmãos e alcançar com eles a glória eterna. Amém.",
    image: "/assets/dashboard/oracoes.webp",
    birthInfo: "8 de maio de 1786 em Dardilly, Reino da França",
    deathInfo: "4 de agosto de 1859 (73 anos) em Ars-sur-Formans, França",
    canonization: "31 de maio de 1925 pelo Papa Pio XI • Proclamado Padroeiro Universal dos Párocos em 1929",
    iconography: [
      "Sobrepeliz e estola roxa de confessor",
      "Cálice sacerdotal",
      "Crucifixo nas mãos e imagem da Virgem Maria"
    ],
    majorWorks: [
      "Sermões e Homilias do Santo Cura d'Ars",
      "Catequeses sobre o Sacerdócio e a Sagrada Eucaristia"
    ]
  },
  {
    slug: "transfiguracao-do-senhor",
    name: "Transfiguração do Senhor",
    title: "A Revelação da Glória Divina de Cristo no Monte Tabor",
    day: 6,
    month: 8,
    rank: "Festa",
    liturgicalColor: "branco",
    summary: "Cristo manifesta o esplendor de sua divindade aos apóstolos Pedro, Tiago e João na presença de Moisés e Elias.",
    quote: "Este é o meu Filho muito amado, no qual pus todo o meu enlevo: ouvi-o!",
    biography: "Pouco antes de sua Paixão em Jerusalém, Jesus subiu com Pedro, Tiago e João a um alto monte (tradicionalmente o Monte Tabor). Ali transfigurou-se diante deles: seu rosto resplandeceu como o sol e suas vestes tornaram-se brancas como a luz. Apareceram Moisés (a Lei) e Elias (os Profetas) conversando com Ele sobre sua Páscoa. Uma nuvem luminosa cobriu-os e a voz do Pai proclamou a filiação divina de Jesus.",
    martyrdomOrPassing: "Festa da manifestação gloriosa da divindade de Jesus para fortalecer os discípulos no escândalo da Cruz.",
    relicsAndTradition: "A Basílica da Transfiguração no cume do Monte Tabor na Galileia.",
    patronage: ["Toda a Igreja", "Contemplativos", "Buscadores da luz de Deus"],
    prayer: "Ó Deus, que na gloriosa Transfiguração de vosso Filho unigênito confirmastes os mistérios da fé pelo testemunho da Lei e dos Profetas e manifestastes a nossa admirável adoção de filhos, concedei-nos ouvir a voz do vosso Filho amado para nos tornarmos seus co-herdeiros. Amém.",
    image: "/assets/dashboard/liturgia.webp",
    birthInfo: "Monte Tabor, Galileia (c. 30 d.C.)",
    deathInfo: "Manifestação celeste da divindade do Salvador",
    canonization: "Festa Litúrgica Universal instituída em 1457 pelo Papa Calisto III",
    iconography: [
      "Cristo resplandecente no cume do Monte",
      "Moisés com as Tábuas da Lei e Elias profeta",
      "Pedro, Tiago e João deslumbrados e prostrados"
    ]
  },
  {
    slug: "sao-domingos-de-gusmao",
    name: "São Domingos de Gusmão",
    title: "Fundador da Ordem dos Pregadores (Dominicanos) • Apóstolo do Santo Rosário",
    day: 8,
    month: 8,
    rank: "Memória",
    liturgicalColor: "branco",
    summary: "O grande pregador da verdade evangélica que combateu as heresias com a caridade e a oração do Rosário.",
    quote: "Um homem que governa suas paixões é senhor do mundo. Nós devemos dominá-las ou ser dominados por elas.",
    biography: "Nascido em Caleruega (Espanha) por volta de 1170, Domingos dedicou-se à oração e ao estudo das Sagradas Escrituras. Diante da heresia albigense no sul da França, compreendeu que o combate espiritual exigia homens que pregassem a verdade com profunda pobreza evangélica, santidade de vida e sólida doutrina. Fundou a Ordem dos Frades Pregadores (Dominicanos). Segundo piedosa tradição, recebeu de Nossa Senhora o Santo Rosário como arma invencível de conversão.",
    martyrdomOrPassing: "Faleceu santamente em Bolonha em 1221, exortando seus irmãos frades: 'Não choreis; ser-vos-ei mais útil do Céu do que fui na terra'.",
    relicsAndTradition: "Seu corpo repousa na magnífica Arca de São Domingos na Basílica Patriarcal de São Domingos em Bolonha.",
    patronage: ["Pregadores", "Astrônomos", "Cientistas", "República Dominicana"],
    prayer: "Venha em auxílio da vossa Igreja, Senhor, a intercessão de São Domingos, para que ela seja sempre enriquecida pelos seus ensinamentos e protegida pelas suas orações. Por Cristo, nosso Senhor. Amém.",
    image: "/assets/dashboard/rosario.webp",
    birthInfo: "c. 1170 em Caleruega, Reino de Castela (Espanha)",
    deathInfo: "6 de agosto de 1221 (51 anos) em Bolonha, Itália",
    canonization: "13 de julho de 1234 pelo Papa Gregório IX",
    iconography: [
      "Hábito dominicano preto e branco",
      "Estrela brilhante na fronte",
      "Cão com a tocha acesa na boca (Domini Canes)",
      "Santo Rosário e Lírio da castidade"
    ],
    majorWorks: [
      "Regra e Constituições da Ordem dos Pregadores",
      "Instituição e propagação do Santo Rosário da Virgem Maria"
    ]
  },
  {
    slug: "sao-lourenco-diacono",
    name: "São Lourenço, Diácono e Mártir",
    title: "Guardião dos Tesouros da Igreja de Roma",
    day: 10,
    month: 8,
    rank: "Festa",
    liturgicalColor: "vermelho",
    summary: "O heróico diácono que apresentou os pobres como os verdadeiros tesouros de Cristo e foi martirizado sobre a grelha.",
    quote: "Eis aqui os tesouros da Igreja: os pobres, os enfermos e os desvalidos!",
    biography: "Primeiro dos sete diáconos da Igreja de Roma sob o Papa São Sisto II. Quando o prefeito romano exigiu a entrega de todas as riquezas e cálices de ouro da Igreja, Lourenço pediu três dias de prazo; reuniu então todos os cegos, coxos, viúvas e órfãos sustentados pela caridade cristã e os apresentou ao tirano pagão dizendo: 'Estes são os tesouros perpétuos da Igreja!'.",
    martyrdomOrPassing: "Foi amarrado a uma grelha de ferro sobre brasas incandescentes em 258 d.C. Em meio aos tormentos, manteve serenidade inabalável e disse com santa ironia ao carrasco: 'Este lado já está assado; virai e comei'. Converteu senadores romanos que testemunharam seu triunfo.",
    relicsAndTradition: "A Basílica de São Lourenço Fora dos Muros em Roma abriga seu sepulcro e a pedra onde seu corpo martirizado repousou.",
    patronage: ["Diáconos", "Cozinheiros e padeiros", "Bibliotecários", "Bombeiros", "Pobres de Roma"],
    prayer: "Ó Deus, cujo amor ardente concedeu a São Lourenço a graça de ser fiel no serviço da Igreja e glorioso no martírio, fazei que amemos o que ele amou e pratiquemos o que ele ensinou. Por nosso Senhor Jesus Cristo. Amém.",
    image: "/assets/dashboard/via-sacra.webp",
    birthInfo: "31 de dezembro de 225 em Huesca (Hispânia) ou Valência",
    deathInfo: "10 de agosto de 258 (32 anos) em Roma",
    canonization: "Culto imemorial martirial da Igreja de Roma",
    iconography: [
      "Dalmática diaconal vermelha",
      "Grelha de ferro do martírio",
      "Palma da vitória",
      "Bolsa com moedas distribuídas aos pobres"
    ]
  },
  {
    slug: "santa-clara-de-assis",
    name: "Santa Clara de Assis",
    title: "Esposa de Cristo e Fundadora das Clarissas",
    day: 11,
    month: 8,
    rank: "Memória",
    liturgicalColor: "branco",
    summary: "A nobre donzela que seguiu o ideal franciscano de altíssima pobreza e expulsou invasores sustentando o Ostensório.",
    quote: "Amai totalmente Aquele que totalmente se entregou por vosso amor.",
    biography: "Nascida em nobre família de Assis em 1194, aos 18 anos fugiu de casa no Domingo de Ramos para consagrar-se a Deus sob a direção de São Francisco na igrejinha da Porciúncula. Fundou a Ordem das Damas Pobres (Clarissas) no Convento de São Damião. Quando a cidade e o mosteiro foram cercados por soldados sarracenos mercenários, Clara, enferma, prostrou-se com o Santíssimo Sacramento na janela; uma voz do Sacrário prometeu proteção e os invasores fugiram tomados de pavor.",
    martyrdomOrPassing: "Faleceu em 11 de agosto de 1253, consolada pela bênção papal de Inocêncio IV que lhe aprovou a Regra do Privilégio da Pobreza.",
    relicsAndTradition: "Seu corpo incorrupto repousa na Basílica de Santa Clara em Assis.",
    patronage: ["Televisão e telecomunicações (proclamada por Pio XII)", "Clarissas", "Bordadeiras", "Olhos e visão"],
    prayer: "Ó Deus, que por vossa misericórdia conduzistes Santa Clara ao amor da pobreza evangélica, concedei-nos, por sua intercessão, seguir a Cristo com coração desprendido e contemplar-vos na glória do vosso Reino. Amém.",
    image: "/assets/dashboard/oracoes.webp",
    birthInfo: "16 de julho de 1194 em Assis, Ducado de Espoleto (Itália)",
    deathInfo: "11 de agosto de 1253 (59 anos) em Assis, Itália",
    canonization: "26 de setembro de 1255 pelo Papa Alexandre IV",
    iconography: [
      "Ostensório com o Santíssimo Sacramento",
      "Hábito marrom franciscano e véu",
      "Lírio da virgindade pura",
      "Livro da Regra de Santa Clara"
    ],
    majorWorks: [
      "Regra de Santa Clara (Forma Vitae)",
      "Testamento e Bênção de Santa Clara",
      "Cartas a Santa Inês de Praga"
    ]
  },
  {
    slug: "sao-maximiliano-kolbe",
    name: "São Maximiliano Maria Kolbe, Mártir",
    title: "O Apóstolo da Imaculada • Mártir da Caridade em Auschwitz",
    day: 14,
    month: 8,
    rank: "Memória",
    liturgicalColor: "vermelho",
    summary: "Frade franciscano conventual que fundou a Milícia da Imaculada e deu voluntariamente a vida para salvar um pai de família.",
    quote: "O ódio não é força criadora; só o amor é construtivo.",
    biography: "Frade franciscano polonês que ardia de amor por Maria Santíssima. Fundou a 'Milícia da Imaculada' e construiu a 'Cidade da Imaculada' (Niepokalanów), usando as mais modernas prensas de impressão e rádio para evangelizar. Preso pelos nazistas na Segunda Guerra Mundial, foi enviado ao campo de concentração de Auschwitz, onde secretamente confessava os prisioneiros e distribuía sua parca ração de pão.",
    martyrdomOrPassing: "Em julho de 1941, quando um prisioneiro fugiu e os guardas selecionaram 10 homens para morrer de fome no 'Bunker da Morte', Kolbe deu um passo à frente e ofereceu-se para morrer no lugar do sargento Franciszek Gajowniczek. No bunker, transformou o local de horrores em capela de hinos a Nossa Senhora até ser executado com uma injeção de ácido fênico em 14 de agosto de 1941.",
    relicsAndTradition: "Proclamado por São João Paulo II como 'o Padroeiro do nosso século difícil' e Mártir da Caridade.",
    patronage: ["Jornalistas e comunicadores", "Famílias", "Prisioneiros", "Vítimas de perseguições e totalitarismos"],
    prayer: "Ó Deus, que inflamastes São Maximiliano Maria Kolbe de amor ardente pela Virgem Imaculada e de caridade heróica pelo próximo, concedei-nos, por sua intercessão, trabalhar sem descanso pela vossa glória até a doação da própria vida. Amém.",
    image: "/assets/dashboard/oracoes.webp",
    birthInfo: "8 de janeiro de 1894 em Zduńska Wola, Polônia",
    deathInfo: "14 de agosto de 1941 (47 anos) em Auschwitz, Polônia",
    canonization: "10 de outubro de 1982 por São João Paulo II como Mártir da Caridade",
    iconography: [
      "Hábito franciscano conventual com capuz",
      "Uniforme de prisioneiro com o número 16670",
      "Duas coroas celestes (branca e vermelha)",
      "Medalha Milagrosa"
    ],
    majorWorks: [
      "Escritos sobre a Consagração à Imaculada (Rycerz Niepokalanej)",
      "Estatutos da Milícia da Imaculada"
    ]
  },
  {
    slug: "assuncao-de-nossa-senhora",
    name: "Assunção da Bem-Aventurada Virgem Maria",
    title: "A Rainha Assunta ao Céu em Corpo e Alma",
    day: 15,
    month: 8,
    rank: "Solenidade",
    isHolyDayOfObligation: true,
    liturgicalColor: "branco",
    summary: "O triunfo da Mãe de Deus levada pelos anjos à glória eterna, primícia da ressurreição de todos os justos.",
    quote: "Apareceu no céu um grande sinal: uma Mulher vestida de sol, com a lua debaixo dos pés e uma coroa de doze estrelas.",
    biography: "Dogma solenemente proclamado pelo Papa Pio XII na Constituição Apostólica Munificentissimus Deus (1950): a Imaculada Mãe de Deus, a sempre Virgem Maria, terminado o curso de sua vida terrestre, foi elevada em corpo e alma à glória celestial. Por não ter contraído a mancha do pecado original, seu corpo puríssimo não conheceu a corrupção da sepultura, antecipando a glorificação de todos os remidos.",
    martyrdomOrPassing: "Na pia tradição da 'Dormição de Maria' (Dormitio Virginis), os Apóstolos reuniram-se em Jerusalém para o seu trânsito e encontraram o túmulo vazio repleto de lírios e perfumes celestes.",
    relicsAndTradition: "A Basílica da Dormição e a Tumba de Maria no Getsêmani em Jerusalém são centros antiquíssimos de peregrinação.",
    patronage: ["Toda a Igreja Católica", "Padroeira de diversas dioceses e nações", "Esperança dos fiéis na ressurreição"],
    prayer: "Ó Deus eterno e todo-poderoso, que elevastes em corpo e alma à glória celeste a Imaculada Virgem Maria, Mãe do vosso Filho, concedei-nos que, sempre atentos às coisas do alto, mereçamos participar da sua glória. Por Cristo, nosso Senhor. Amém.",
    image: "/assets/dashboard/novenas.webp",
    birthInfo: "Solenidade Litúrgica e Dogma de Fé Católica",
    deathInfo: "Dormitio Virginis e Assunção corporal aos Céus",
    canonization: "Dogma proclamado em 1950 pelo Papa Pio XII (Munificentissimus Deus)",
    iconography: [
      "Virgem Maria elevada aos céus cercada de coros de anjos",
      "Túmulo aberto com lírios e rosas",
      "Manto dourado sobre túnica pura",
      "Coroa celestial"
    ]
  },
  {
    slug: "sao-bernardo-de-claraval",
    name: "São Bernardo de Claraval",
    title: "Doutor Melífluo da Igreja • Abade e Cantor da Virgem Maria",
    day: 20,
    month: 8,
    rank: "Memória",
    liturgicalColor: "branco",
    summary: "O grande abade cisterciense cuja ardente eloquência, sabedoria mística e filial devoção a Maria inflamaram toda a Cristandade.",
    quote: "Olha para a estrela, invoca Maria! Nos perigos, nas angústias, nas dúvidas, pensa em Maria, invoca Maria.",
    biography: "Nascido em Fontaine-lès-Dijon (França) em 1090 em berço nobre, Bernardo ingressou no nascente e rigoroso mosteiro de Cister levando consigo quatro irmãos e dezenas de nobres companheiros. Pouco depois fundou a célebre Abadia de Claraval (Clairvaux), tornando-se um dos maiores líderes espirituais da Idade Média. Pacificou disputas na Igreja, aconselhou Papas e soberanos, defendeu com firmeza a reta fé contra erros doutrinários e compôs admiráveis sermões e tratados de mística cristã. Ardoroso amante da Mãe de Deus, a Tradição atribui-lhe a invocação final da Salve Rainha ('Ó clemente, ó piedosa, ó doce sempre Virgem Maria') e a oração do 'Lembrai-vos' (Memorare). Foi proclamado Doutor da Igreja pelo Papa Pio VIII.",
    martyrdomOrPassing: "Faleceu santamente na Abadia de Claraval em 20 de agosto de 1153, aos 63 anos, cercado pelas orações de centenas de seus filhos espirituais.",
    relicsAndTradition: "Suas relíquias foram preservadas na Catedral de Troyes; o Papa Pio XII dedicou-lhe a encíclica comemorativa 'Doctor Mellifluus' em 1953.",
    patronage: ["Apicultores", "Fabricantes de velas", "Gibraltar", "Pregadores", "Ordem Cisterciense"],
    prayer: "Ó Deus, que fizestes do abade São Bernardo um homem inflamado de zelo pela vossa casa e uma luz radiante na vossa Igreja, concedei-nos, por sua intercessão, o mesmo fervor de espírito para que andemos sempre como filhos da luz. Por nosso Senhor Jesus Cristo. Amém.",
    image: "/assets/dashboard/oracoes.webp",
    birthInfo: "c. 1090 em Fontaine-lès-Dijon, Borgonha (França)",
    deathInfo: "20 de agosto de 1153 (63 anos) na Abadia de Claraval, França",
    canonization: "18 de janeiro de 1174 pelo Papa Alexandre III • Proclamado Doutor da Igreja em 1830 por Pio VIII",
    iconography: [
      "Hábito cisterciense branco",
      "Báculo pastoral de abade",
      "Colmeia (símbolo do Doutor Melífluo)",
      "Instrumentos da Paixão de Cristo",
      "Livro aberto de sermões marianos"
    ],
    majorWorks: [
      "Tratado do Amor de Deus (De Diligendo Deo)",
      "Sermões sobre o Cântico dos Cânticos",
      "Os Graus da Humildade e da Soberba",
      "Oração Lembrai-vos (Memorare)",
      "Homilias sobre a Virgem Mãe (In Laudibus Virginis Matris)"
    ]
  },
  {
    slug: "sao-pio-x",
    name: "São Pio X, Papa",
    title: "O Papa da Eucaristia • Restaurador de Todas as Coisas em Cristo",
    day: 21,
    month: 8,
    rank: "Memória",
    liturgicalColor: "branco",
    summary: "Papa humilde de origem camponesa que incentivou a comunhão diária, a comunhão para crianças e combateu os erros do modernismo.",
    quote: "Instaurare omnia in Christo — Restaurar todas as coisas em Cristo!",
    biography: "Giuseppe Sarto nasceu em Riese (Itália) em 1835 em família paupérrima. Percorreu todos os graus da hierarquia eclesiástica com simplicidade seráfica. Eleito Sumo Pontífice em 1903 sob o lema 'Instaurar todas as coisas em Cristo', promoveu a catequese universal, promulgou a comunhão frequente e a primeira eucaristia desde a idade da razão, reformou o canto litúrgico gregoriano e codificou o Direito Canônico.",
    martyrdomOrPassing: "Com o coração despedaçado pelo início da Primeira Guerra Mundial em 1914, faleceu em santidade proclamando: 'Nasci pobre, vivi pobre e quero morrer pobre'.",
    relicsAndTradition: "Seu corpo incorrupto repousa sob o altar na Basílica de São Pedro no Vaticano.",
    patronage: ["Catequistas", "Primeira Comunhão", "Peregrinos", "Arquidioceses e paróquias pelo mundo"],
    prayer: "Ó Deus, que para defender a fé católica e restaurar todas as coisas em Cristo cumulastes o Papa São Pio X de sabedoria celeste e fortaleza apostólica, concedei-nos, dóceis às suas instruções e exemplos, alcançar o prêmio eterno. Amém.",
    image: "/assets/dashboard/biblia.webp",
    birthInfo: "2 de junho de 1835 em Riese, Reino Lombardo-Vêneto (Itália)",
    deathInfo: "20 de agosto de 1914 (79 anos) no Palácio Apostólico Vaticano, Roma",
    canonization: "29 de maio de 1954 pelo Papa Pio XII",
    iconography: [
      "Trajes pontifícios brancos com pálio e solidéu",
      "Ostensório e Cálice da Sagrada Eucaristia",
      "Catecismo Maior nas mãos"
    ],
    majorWorks: [
      "Catecismo Maior de São Pio X",
      "Encíclica Pascendi Dominici Gregis (contra os erros do modernismo)",
      "Decreto Quam Singulari (sobre a comunhão das crianças)",
      "Motu Proprio Tra le Sollecitudini (sobre a música sacra)"
    ]
  },
  {
    slug: "nossa-senhora-rainha",
    name: "Nossa Senhora Rainha",
    title: "Rainha do Universo e Mãe de Misericórdia",
    day: 22,
    month: 8,
    rank: "Memória",
    liturgicalColor: "branco",
    summary: "Celebração da realeza celestial da Virgem Maria coroada à direita de seu Filho Jesus Cristo.",
    quote: "A Rainha está à vossa direita, ornada com ouro de Ofir.",
    biography: "Oitava da solenidade da Assunção, esta festa foi instituída pelo Papa Pio XII na encíclica 'Ad Caeli Reginam' (1954). Maria é Rainha pela sua maternidade divina em relação a Cristo Rei do Universo, pela sua íntima associação à obra redentora do Calvário e pelo seu poder incomparável de intercessão materna por toda a humanidade.",
    martyrdomOrPassing: "Memória mariana ligada ao 5º Mistério Glorioso do Santo Rosário: a Coroação de Maria Santíssima no Céu.",
    relicsAndTradition: "Venerada sob este título em incontáveis santuários e catedrais de todo o orbe católico.",
    patronage: ["Toda a criação", "A Igreja militante", "A Paz entre os povos"],
    prayer: "Ó Deus, que nos destes por Mãe e Rainha a Mãe do vosso próprio Filho, concedei-nos que, sustentados pelo seu auxílio maternal, alcancemos no reino do Céu a glória prometida aos vossos filhos. Por Cristo, nosso Senhor. Amém.",
    image: "/assets/dashboard/novenas.webp",
    birthInfo: "Memória Mariana e Oitava da Solenidade da Assunção",
    deathInfo: "Instituída pelo Papa Pio XII na Encíclica Ad Caeli Reginam (1954)",
    canonization: "Festa do Calendário Romano Universal ligada à realeza de Maria",
    iconography: [
      "Virgem Maria coroada pela Santíssima Trindade",
      "Cetro real de ouro e manto régio",
      "Globo terrestre sob os pés"
    ]
  },
  {
    slug: "santa-rosa-de-lima",
    name: "Santa Rosa de Lima",
    title: "Primeira Flor de Santidade da América • Padroeira do Continente",
    day: 23,
    month: 8,
    rank: "Memória",
    liturgicalColor: "branco",
    summary: "A jovem leiga da Ordem Terceira Dominicana que viveu na oração contínua e na penitência ardente em Lima (Peru).",
    quote: "Fora da Cruz não há outra escada pela qual possamos subir ao Céu.",
    biography: "Isabel Flores de Oliva nasceu em Lima em 1586. Chamada de 'Rosa' pela sua radiante formosura, consagrou a virgindade a Cristo desde pequena. Ingressou na Ordem Terceira de São Domingos, construiu um modesto eremitério no jardim de sua casa e dedicou-se a orações, rigorosas mortificações e ao cuidado amoroso dos doentes, escravos e indígenas abandonados de Lima.",
    martyrdomOrPassing: "Faleceu santamente em 24 de agosto de 1617 aos 31 anos; seu velório comoveu toda a capital do Vice-Reino do Peru.",
    relicsAndTradition: "Foi a primeira santa canonizada de todo o continente americano (pelo Papa Clemente X em 1671). Suas relíquias são veneradas na Basílica de Nossa Senhora do Rosário em Lima.",
    patronage: ["América Latina", "Peru", "Filipinas", "Floristas e jardineiros"],
    prayer: "Ó Deus, que fizestes florescer na América o lírio da pureza e da penitência na vida de Santa Rosa de Lima, concedei-nos, por sua intercessão, seguir seus passos na terra para fruirmos eternamente a vossa beleza no Céu. Amém.",
    image: "/assets/dashboard/oracoes.webp",
    birthInfo: "20 de abril de 1586 em Lima, Vice-Reino do Peru",
    deathInfo: "24 de agosto de 1617 (31 anos) em Lima, Peru",
    canonization: "12 de abril de 1671 pelo Papa Clemente X (Primeira Santa do Continente Americano)",
    iconography: [
      "Coroa de rosas com pontas de espinhos na fronte",
      "Menino Jesus nos braços",
      "Hábito dominicano da Ordem Terceira",
      "Âncora de fé"
    ]
  },
  {
    slug: "sao-bartolomeu-apostolo",
    name: "São Bartolomeu, Apóstolo e Mártir",
    title: "O Apóstolo Íntegro • Natanael sob a Figueira",
    day: 24,
    month: 8,
    rank: "Festa",
    liturgicalColor: "vermelho",
    summary: "O apóstolo elogiado por Cristo como 'um verdadeiro israelita em quem não há fingimento', que levou o Evangelho ao Oriente.",
    quote: "Mestre, Tu és o Filho de Deus, Tu és o Rei de Israel!",
    biography: "Identificado como o Natanael dos Evangelhos, natural de Caná da Galileia. Conduzido a Jesus pelo apóstolo Filipe, ouviu de Cristo o supremo elogio de sua sinceridade e pureza de intenção. Após o Pentecostes, pregou o Evangelho na Índia, na Mesopotâmia e na Grande Armênia, convertendo multidões com milagres e ensinamentos.",
    martyrdomOrPassing: "Na Armênia, por ter convertido o rei Polímio e recusado prestar culto aos ídolos, foi esfolado vivo e decapitado por ordem do príncipe Astíages por amor a Jesus Cristo.",
    relicsAndTradition: "Suas relíquias são preservadas com grande veneração na Basílica de São Bartolomeu na Ilha Tiberina em Roma.",
    patronage: ["Curtidores de couro", "Sapateiros", "Gesseiros", "Armênia"],
    prayer: "Fortalecei em nós, Senhor, a fé com que o apóstolo São Bartolomeu se uniu com sinceridade de coração a vosso Filho, e fazei que, pelas suas preces, a vossa Igreja seja para todos os povos sinal de salvação. Por Cristo, nosso Senhor. Amém.",
    image: "/assets/dashboard/via-sacra.webp",
    birthInfo: "Século I d.C. em Caná da Galileia (identificado como Natanael)",
    deathInfo: "c. 71 d.C. em Albanópolis, Grande Armênia",
    canonization: "Um dos Doze Apóstolos do Colégio Apostólico de Cristo",
    iconography: [
      "Faca de esfolador nas mãos",
      "Pele do próprio corpo sobre o braço",
      "Livro dos Santos Evangelhos",
      "Palma do martírio"
    ]
  },
  {
    slug: "santa-monica",
    name: "Santa Mônica",
    title: "Modelo de Mãe Cristã • Mãe de Santo Agostinho",
    day: 27,
    month: 8,
    rank: "Memória",
    liturgicalColor: "branco",
    summary: "A mãe cujas lágrimas, orações e jejuns perseverantes durante décadas obtiveram a conversão do grande Santo Agostinho.",
    quote: "Uma coisa me fazia desejar viver mais um pouco: ver-te cristão católico antes de morrer. Deus concedeu-me isso com fartura!",
    biography: "Nascida em Tagaste no norte da África (331 d.C.), suportou com paciência heróica um marido pagão irascível até convertê-lo. Seu filho mais velho, Agostinho, dotado de inteligência brilhante, perdeu-se na vida dissoluta e nas heresias maniqueístas. Mônica seguiu o filho até Milão, chorando e rezando incessantemente diante do Sacrário, merecendo a célebre consolação de Santo Ambrósio: 'É impossível que se perca o filho de tantas lágrimas!'.",
    martyrdomOrPassing: "Após testemunhar o batismo de Agostinho em Milão, faleceu santamente no porto de Óstia Tiberina aos 56 anos, em sublime colóquio místico com o filho sobre as alegrias da vida eterna.",
    relicsAndTradition: "Seu corpo venerável repousa na Basílica de Sant'Agostino em Roma.",
    patronage: ["Mães de família", "Esposas em dificuldades", "Conversão de filhos rebeldes", "Vítimas de abusos verbais"],
    prayer: "Senhor Deus, consolador dos que choram, que acolhestes com misericórdia as lágrimas de Santa Mônica pela conversão do seu filho Agostinho, concedei-nos, por intercessão de ambos, chorar nossos pecados e encontrar o vosso perdão. Por Cristo, nosso Senhor. Amém.",
    image: "/assets/dashboard/oracoes.webp",
    birthInfo: "c. 331 d.C. em Tagaste, Numídia (atual Argélia)",
    deathInfo: "387 d.C. (56 anos) em Óstia Tiberina, perto de Roma (Itália)",
    canonization: "Culto imemorial reconhecido pela Igreja Católica",
    iconography: [
      "Véu de matrona cristã e hábito sóbrio",
      "Livro de orações e crucifixo",
      "Lágrimas de intercessão materna",
      "Santo Agostinho ao lado"
    ]
  },
  {
    slug: "santo-agostinho-bispo",
    name: "Santo Agostinho de Hipona",
    title: "Doutor da Graça • Bispo e Pai da Igreja",
    day: 28,
    month: 8,
    rank: "Memória",
    liturgicalColor: "branco",
    summary: "Uma das mentes mais brilhantes da humanidade, autor das 'Confissões' e da 'Cidade de Deus'.",
    quote: "Tarde te amei, ó Beleza tão antiga e tão nova, tarde te amei! Criaste-nos para Vós, Senhor, e o nosso coração vive inquieto enquanto não repousar em Vós.",
    biography: "Nascido em Tagaste (354), após uma juventude pecaminosa e seduzida por falsas filosofias, converteu-se em Milão ao ouvir Santo Ambrósio e ser tocado pela graça divina. Batizado, retornou à África onde foi consagrado Bispo de Hipona. Pastoreou incansavelmente seu rebanho, refutou as grandes heresias de sua época (donatismo, pelagianismo) e legou à posteridade tratados de teologia insuperáveis.",
    martyrdomOrPassing: "Faleceu em 430 durante o cerco de Hipona pelos bárbaros vândalos, rezando os Salmos penitenciais afixados nas paredes de seu quarto.",
    relicsAndTradition: "Seus restos mortais descansam na Basílica de San Pietro in Ciel d'Oro em Pavia (Itália).",
    patronage: ["Teólogos", "Filósofos", "Tipógrafos", "Buscadores da verdade"],
    prayer: "Renovai, Senhor, na vossa Igreja o espírito com que cumulastes o bispo Santo Agostinho, para que, repousando unicamente em Vós, busquemos sem cessar a fonte da verdadeira sabedoria. Por Cristo, nosso Senhor. Amém.",
    image: "/assets/dashboard/biblia.webp",
    birthInfo: "13 de novembro de 354 em Tagaste, Numídia (atual Argélia)",
    deathInfo: "28 de agosto de 430 (75 anos) em Hipona, Numídia",
    canonization: "Proclamado Doutor da Igreja pelo Papa Bonifácio VIII em 1298",
    iconography: [
      "Coração em chamas transpassado por flecha divina",
      "Mitra e báculo de bispo",
      "Pena de doutor e tinteiro",
      "Livros das Confissões e Cidade de Deus"
    ],
    majorWorks: [
      "Confissões (Confessiones)",
      "A Cidade de Deus (De Civitate Dei)",
      "Da Trindade (De Trinitate)",
      "A Doutrina Cristã (De Doctrina Christiana)",
      "Regra de Santo Agostinho"
    ]
  },
  {
    slug: "martirio-de-sao-joao-batista",
    name: "Martírio de São João Batista",
    title: "O Precursor do Senhor • Mártir da Verdade e da Castidade",
    day: 29,
    month: 8,
    rank: "Memória",
    liturgicalColor: "vermelho",
    summary: "O maior entre os nascidos de mulher que selou seu testemunho profético derramando o sangue pela fidelidade à Lei de Deus.",
    quote: "Importa que Ele cresça e que eu diminua.",
    biography: "João Batista, o precursor do Messias e a voz que clamava no deserto, teve a coragem evangélica de repreender o tetrarca Herodes Antipas por viver em adultério público com Herodíades, mulher de seu irmão Filipe. Lançado no cárcere da fortaleza de Maqueronte, manteve-se inquebrantável na defesa da santidade do matrimônio.",
    martyrdomOrPassing: "Durante o banquete de aniversário de Herodes, Salomé dançou e obteve a promessa de qualquer pedido sob juramento. Instigada pela mãe vingativa, pediu a cabeça de São João Batista num prato. O profeta foi decapitado na prisão em fidelidade à verdade.",
    relicsAndTradition: "Sua cabeça venerável é guardada na Basílica de San Silvestro in Capite em Roma; a Igreja celebra tanto seu nascimento (24 de junho) quanto seu glorioso martírio.",
    patronage: ["Profetas", "Defensores da moral matrimonial", "Cativos e prisioneiros de consciência"],
    prayer: "Ó Deus, que escolhestes São João Batista como precursor do nascimento e da morte de vosso Filho, concedei que, assim como ele deu a vida pelo testemunho da verdade e da justiça, nós também combatamos com coragem pela fé em vosso Evangelho. Por nosso Senhor Jesus Cristo. Amém.",
    image: "/assets/dashboard/via-sacra.webp",
    birthInfo: "c. 6 a.C. em Aim Karim, Judeia",
    deathInfo: "c. 31-32 d.C. na Fortaleza de Maqueronte",
    canonization: "Memória universal do Precursor do Messias",
    iconography: [
      "Cabeça de São João Batista sobre bandeja de prata",
      "Espada do carrasco",
      "Vestes de pele de camelo",
      "Cruz de cana"
    ]
  },

  // SETEMBRO
  {
    slug: "sao-padre-pio-de-pietrelcina",
    name: "São Pio de Pietrelcina (Padre Pio)",
    title: "O Estigmatizado do Gargano • Mártir do Confessionário",
    day: 23,
    month: 9,
    rank: "Memória",
    liturgicalColor: "branco",
    summary: "Frade capuchinho que carregou as cinco chagas de Cristo por 50 anos e passava até 16 horas diárias no confessionário.",
    quote: "Reze, tenha fé e não se preocupe. A oração é a melhor arma que temos; é a chave que abre o coração de Deus.",
    biography: "Francesco Forgione nasceu em Pietrelcina (Itália) em 1887. Entrou para a Ordem dos Frades Menores Capuchinhos. Em 1918, rezando diante do crucifixo no convento de San Giovanni Rotondo, recebeu as dolorosas chagas visíveis de Jesus nas mãos, nos pés e no peito. Deus cumulou-o de dons extraordinários: discernimento das consciências, bilocação, profecia e o perfume místico de santidade. Construiu a monumental 'Casa Alívio do Sofrimento'.",
    martyrdomOrPassing: "Faleceu santamente em 23 de setembro de 1968, murmurando com o terço nas mãos os doces nomes: 'Jesus, Maria'. No instante de sua morte, as feridas dos estigmas cicatrizaram-se milagrosamente sem deixar rastro.",
    relicsAndTradition: "Seu corpo repousa em San Giovanni Rotondo, visitado anualmente por milhões de peregrinos do mundo inteiro.",
    patronage: ["Confessores", "Doentes e agentes de saúde", "Jovens em discernimento", "Voluntários de caridade"],
    prayer: "Deus eterno e todo-poderoso, que concedestes a São Pio de Pietrelcina a graça singular de participar da Cruz do vosso Filho e renovar as vossas maravilhas pelo ministério da misericórdia, dai-nos, por sua intercessão, suportar nossos sofrimentos e acolher vosso perdão. Amém.",
    image: "/assets/dashboard/oracoes.webp",
    linkedNovenaSlug: "padre-pio",
    birthInfo: "25 de maio de 1887 em Pietrelcina, Benevento (Itália)",
    deathInfo: "23 de setembro de 1968 (81 anos) em San Giovanni Rotondo, Foggia (Itália)",
    canonization: "16 de junho de 2002 por São João Paulo II",
    iconography: [
      "Mãos com mitenes (meias-luvas) cobrindo os estigmas",
      "Hábito marrom capuchinho com capuz",
      "Santo Rosário nas mãos",
      "Cálice da Santa Missa"
    ],
    majorWorks: [
      "Epistolário de São Pio de Pietrelcina (4 volumes de direção espiritual)",
      "Máximas Espirituais sobre a Oração e a Confissão"
    ]
  },
  {
    slug: "sao-miguel-gabriel-e-rafael",
    name: "Santos Arcanjos Miguel, Gabriel e Rafael",
    title: "Os Príncipes da Milícia Celeste",
    day: 29,
    month: 9,
    rank: "Festa",
    liturgicalColor: "branco",
    summary: "Os santos arcanjos que assistem diante do trono de Deus e combatem em defesa da Igreja e dos fiéis.",
    quote: "Quem como Deus? (Quis ut Deus!)",
    biography: "A Sagrada Escritura revela os três arcanjos celestes: São Miguel ('Quem como Deus?'), o invencível chefe dos exércitos celestes que precipitou Lúcifer no abismo e guarda o povo de Deus; São Gabriel ('Força de Deus'), o mensageiro da Encarnação à Virgem Maria e a Zacarias; e São Rafael ('Medicina de Deus'), o guia providencial e curador de Tobias.",
    martyrdomOrPassing: "Puro espíritos criados por Deus para a sua glória e para a salvação dos homens.",
    relicsAndTradition: "A lendária espada e Santuário do Monte Gargano (Itália), consagrado pelo próprio São Miguel, o Mont-Saint-Michel (França) e a Linha Sagrada dos Arcanjos.",
    patronage: ["Polícia e forças de segurança (S. Miguel)", "Comunicação e correios (S. Gabriel)", "Médicos, viajantes e noivos (S. Rafael)"],
    prayer: "São Miguel Arcanjo, defendei-nos no combate; sede o nosso refúgio contra as maldades e ciladas do demônio. Ordene-lhe Deus, instantemente o pedimos, e vós, príncipe da milícia celeste, pela virtude divina, precipitai no inferno a satanás e a todos os espíritos malignos que andam pelo mundo para perder as almas. Amém.",
    image: "/assets/dashboard/quaresma-sao-miguel.webp",
    linkedNovenaSlug: "sao-miguel-arcanjo",
    birthInfo: "Puros espíritos celestes criados por Deus antes da fundação do cosmos",
    deathInfo: "Imortais, assistem perpetuamente diante do Trono do Altíssimo",
    canonization: "Festa Litúrgica Bíblica dos Três Santos Arcanjos",
    iconography: [
      "São Miguel com espada reluzente, balança da justiça e dragão abatido",
      "São Gabriel com o lírio branco da Anunciação",
      "São Rafael com o peixe medicinal e bordão de peregrino"
    ]
  },
  {
    slug: "sao-jeronimo-presbitero",
    name: "São Jerônimo, Presbítero e Doutor",
    title: "O Tradutor da Vulgata • Doutor das Sagradas Escrituras",
    day: 30,
    month: 9,
    rank: "Memória",
    liturgicalColor: "branco",
    summary: "O sábio eremita de Belém que traduziu a Bíblia dos originais hebraico e grego para o latim.",
    quote: "Desconhecer as Escrituras é desconhecer o próprio Cristo.",
    biography: "Nascido na Dalmácia em 347, dotado de erudição monumental em latim, grego e hebraico, foi secretário do Papa São Dâmaso I, que lhe encomendou a tradução oficial da Bíblia para o latim vulgar (a Vulgata). Retirou-se para uma cela rupestre ao lado da Gruta da Natividade em Belém, onde passou décadas em severa penitência, jejuns e estudos incessantes.",
    martyrdomOrPassing: "Faleceu octogenário em Belém no ano de 420, cercado por seus monges e discípulos da Sagrada Escritura.",
    relicsAndTradition: "Suas relíquias sagradas foram posteriormente trasladadas para a Basílica de Santa Maria Maior em Roma.",
    patronage: ["Biblistas", "Tradutores", "Estudiosos da Bíblia", "Bibliotecários"],
    prayer: "Ó Deus, que destes a São Jerônimo um afeto vivo e suave pela Sagrada Escritura, fazei que o vosso povo se alimente com mais abundância da vossa Palavra e encontre nela a fonte da verdadeira vida. Por Cristo, nosso Senhor. Amém.",
    image: "/assets/dashboard/biblia.webp",
    birthInfo: "c. 347 d.C. em Estridão, Dalmácia (atual Croácia/Eslovênia)",
    deathInfo: "30 de setembro de 420 (73 anos) em Belém, Judeia",
    canonization: "Proclamado Doutor da Igreja pelo Papa Bonifácio VIII em 1298",
    iconography: [
      "Leão manso ao lado",
      "Chapéu cardinalício vermelho e hábito de eremita",
      "Pedra na mão para penitência peitoral",
      "Crânio e relógio de areia",
      "Livros sagrados da Bíblia Vulgata"
    ],
    majorWorks: [
      "A Bíblia Vulgata Latina (tradução dos textos originais)",
      "Comentários aos Profetas e Evangelhos",
      "De Viris Illustribus (Sobre os Homens Ilustres)",
      "Epistolário de São Jerônimo"
    ]
  },

  // OUTUBRO
  {
    slug: "santa-teresinha-do-menino-jesus",
    name: "Santa Teresinha do Menino Jesus",
    title: "Doutora da Igreja • Padroeira das Missões",
    day: 1,
    month: 10,
    rank: "Memória",
    liturgicalColor: "branco",
    summary: "A jovem carmelita de Lisieux que ensinou a 'Pequena Via' da infância espiritual e do amor incondicional a Deus.",
    quote: "No coração da Igreja, minha Mãe, eu serei o Amor!",
    biography: "Marie-Françoise-Thérèse Martin nasceu em Alençon (1873). Entrou com apenas 15 anos para o Carmelo de Lisieux com autorização especial do Papa Leão XIII. Sem jamais sair do claustro, compreendeu que o segredo da santidade não reside em grandes façanhas exteriores, mas na entrega total, filial e simples ao Amor Misericordioso de Deus em cada detalhe do dia a dia. Seu manuscrito autobiográfico 'História de uma Alma' incendiou o mundo de fervor.",
    martyrdomOrPassing: "Morreu aos 24 anos consumida pela tuberculose em 30 de setembro de 1897, prometendo: 'Passarei o meu Céu fazendo o bem sobre a terra. Farei cair uma chuva de rosas'.",
    relicsAndTradition: "A Basílica de Santa Teresa em Lisieux é um dos maiores centros de peregrinação da França.",
    patronage: ["Missões católicas universais", "Floristas", "Enfermos de tuberculose", "A 'Pequena Via'"],
    prayer: "Ó Deus, que abris as portas do vosso Reino aos pequeninos e humildes, concedei-nos seguir com confiança o caminho de Santa Teresinha do Menino Jesus, para que, por sua intercessão, nos seja revelada a vossa glória eterna. Por nosso Senhor Jesus Cristo. Amém.",
    image: "/assets/dashboard/oracoes.webp",
    linkedNovenaSlug: "santa-teresinha",
    birthInfo: "2 de janeiro de 1873 em Alençon, Normandia (França)",
    deathInfo: "30 de setembro de 1897 (24 anos) no Carmelo de Lisieux, França",
    canonization: "17 de maio de 1925 pelo Papa Pio XI • Proclamada Doutora da Igreja em 1997 por São João Paulo II",
    iconography: [
      "Crucifixo coberto de rosas nos braços",
      "Hábito carmelita marrom com manto branco e véu preto",
      "Chuva mística de pétalas de rosas"
    ],
    majorWorks: [
      "História de uma Alma (L'Histoire d'une Âme)",
      "Poesias e Orações Espirituais",
      "Últimos Colóquios (Novissima Verba)"
    ]
  },
  {
    slug: "sao-francisco-de-assis",
    name: "São Francisco de Assis",
    title: "O Pobrezinho de Assis • Fundador dos Franciscanos",
    day: 4,
    month: 10,
    rank: "Memória",
    liturgicalColor: "branco",
    summary: "Renunciou a todas as riquezas para casar-se com a 'Senhora Pobreza' e recebeu no Monte Alverne os estigmas de Cristo.",
    quote: "Senhor, fazei-me instrumento de vossa paz. Onde houver ódio, que eu leve o amor.",
    biography: "Filho de um rico comerciante de tecidos em Assis (1181), abandonou suas roupas e vaidades na presença do bispo após ouvir a voz do crucifixo de São Damião: 'Francisco, vai e reconstrói a minha Igreja que está em ruínas!'. Reuniu companheiros na mais radical pobreza evangélica, fundando a Ordem dos Frades Menores, as Clarissas (com Santa Clara) e a Ordem Terceira. Dois anos antes de sua morte, no Monte Alverne, recebeu a sublime impressão dos estigmas de Nosso Senhor.",
    martyrdomOrPassing: "Em 3 de outubro de 1226, acolheu a 'Irmã Morte' deitado nu sobre o solo na Porciúncula, louvando o Senhor pelo dom da criação.",
    relicsAndTradition: "A magnífica Basílica de São Francisco em Assis abriga sua tumba em rocha sólida, patrimônio espiritual da humanidade.",
    patronage: ["Ecologia e meio ambiente", "Animais", "Itália", "A paz e o diálogo", "Comerciantes e alfaiates"],
    prayer: "Ó Deus, que fizestes São Francisco assemelhar-se ao Cristo pela pobreza e pela humildade, concedei-nos, trilhando os seus passos, seguir o vosso Filho e unir-nos a Vós na jubilosa caridade. Por Cristo, nosso Senhor. Amém.",
    image: "/assets/dashboard/lectio.webp",
    birthInfo: "1181/1182 em Assis, Úmbria (Itália)",
    deathInfo: "3 de outubro de 1226 (44 anos) na Porciúncula de Santa Maria dos Anjos, Assis",
    canonization: "16 de julho de 1228 pelo Papa Gregório IX (apenas dois anos após o trânsito)",
    iconography: [
      "Cinco Chagas/Estigmas de Cristo visíveis",
      "Hábito de sarja marrom com cordão franciscano de três nós",
      "Lobo de Gúbio e pássaros dóceis",
      "Crucifixo de São Damião"
    ],
    majorWorks: [
      "Cântico das Criaturas (Cântico do Irmão Sol)",
      "Regra Bulada dos Frades Menores",
      "Testamento de São Francisco",
      "Admoestações e Cartas"
    ]
  },
  {
    slug: "nossa-senhora-aparecida",
    name: "Nossa Senhora da Conceição Aparecida",
    title: "Rainha e Padroeira Principal do Brasil",
    day: 12,
    month: 10,
    rank: "Solenidade",
    isHolyDayOfObligation: true,
    liturgicalColor: "branco",
    summary: "A imagem milagrosa da Imaculada Conceição pescada nas águas do Rio Paraíba do Sul que uniu o povo brasileiro na fé.",
    quote: "A vós, ó Mãe Aparecida, consagramos a nossa pátria, as nossas famílias e os nossos corações.",
    biography: "Em outubro de 1717, três pescadores humildes (Domingos Garcia, Felipe Pedroso e João Alves) foram encarregados de conseguir peixes para a comitiva do Conde de Assumar no Rio Paraíba do Sul. Após horas sem pescar nada, puxaram na rede primeiro o corpo e depois a cabeça de uma imagem de terracota da Imaculada Conceição enegrecida pelas águas. Logo em seguida, suas redes encheram-se de peixes tão abundantes que o barco quase soçobrou. O milagre das velas acesas, a cura do cego e a libertação do escravo Zacarias atestaram o carinho maternal da Virgem pela terra brasileira.",
    martyrdomOrPassing: "Padroeira solene do Brasil proclamada pelo Papa Pio XI em 1930.",
    relicsAndTradition: "O Santuário Nacional de Aparecida em São Paulo é a segunda maior basílica mariana do mundo católico.",
    patronage: ["Brasil", "Pescadores", "Povo brasileiro", "Famílias e gestantes"],
    prayer: "Ó incomparável Senhora da Conceição Aparecida, Mãe de Deus e nossa Mãe, volvei vosso olhar misericordioso sobre o Brasil. Protegei as nossas famílias, amparai os necessitados e concedei-nos a graça de vivermos sempre fiéis a vosso Filho Jesus Cristo. Amém.",
    image: "/assets/dashboard/novenas.webp",
    linkedNovenaSlug: "nossa-senhora-aparecida",
    birthInfo: "Encontro milagroso da imagem em outubro de 1717 no Rio Paraíba do Sul (SP)",
    deathInfo: "Coroação solene em 1904 e consagração da Basílica Nacional em 1980 por São João Paulo II",
    canonization: "Proclamada Padroeira Principal do Brasil pelo Papa Pio XI em 16 de julho de 1930",
    iconography: [
      "Imagem de terracota escura da Imaculada Conceição",
      "Manto azul-anil bordado com as bandeiras do Brasil e do Vaticano",
      "Coroa imperial de ouro",
      "Mãos postas em prece maternal"
    ]
  },
  {
    slug: "santa-teresa-de-jesus",
    name: "Santa Teresa de Jesus (de Ávila)",
    title: "Primeira Doutora da Igreja • Reformadora do Carmelo",
    day: 15,
    month: 10,
    rank: "Memória",
    liturgicalColor: "branco",
    summary: "Mística insigne, reformadora dos Carmelitas Descalços com São João da Cruz e mestra da oração contemplativa.",
    quote: "Nada te turbe, nada te espante; tudo passa, Deus não muda. A paciência tudo alcança. Quem a Deus tem, nada lhe falta: só Deus basta!",
    biography: "Nascida em Ávila (Espanha) em 1515, ingressou no Mosteiro da Encarnação. Experimentou profunda conversão diante de uma imagem de Cristo chagado. Sob inspiração do Espírito Santo e enfrentando incompreensões titânicas, fundou dezenas de conventos reformados baseados na estrita clausura, oração contínua e pobreza evangélica. Escreveu tratados místicos imortais como 'Castelo Interior (Moradas)' e 'Caminho de Perfeição'.",
    martyrdomOrPassing: "Faleceu em Alba de Tormes em 1582, exclamando jubilosa: 'Enfim, Senhor, sou filha da Igreja!'.",
    relicsAndTradition: "Seu coração transverberado pelo dardo do serafim e seu braço incorrupto repousam em Alba de Tormes.",
    patronage: ["Escritores católicos", "Místicos", "Pessoas em enfermidades corporais", "Professores de oração"],
    prayer: "Ó Deus, que pelo vosso Espírito suscitastes Santa Teresa de Jesus para mostrar à vossa Igreja o caminho da perfeição, fazei que nos alimentemos sempre da sua celestial doutrina e nos acendamos no desejo da verdadeira santidade. Amém.",
    image: "/assets/dashboard/lectio.webp",
    birthInfo: "28 de março de 1515 em Ávila, Reino de Castela (Espanha)",
    deathInfo: "4 de outubro de 1582 (67 anos) em Alba de Tormes, Salamanca (Espanha)",
    canonization: "12 de março de 1622 pelo Papa Gregório XV • Proclamada Primeira Mulher Doutora da Igreja em 1970 por São Paulo VI",
    iconography: [
      "Dardo de fogo do Serafim transpassando o coração (Transverberação)",
      "Pomba do Espírito Santo no ombro",
      "Pena e livro de mística cristã",
      "Hábito carmelita descalço"
    ],
    majorWorks: [
      "Castelo Interior ou Livro das Moradas (El Castillo Interior)",
      "Caminho de Perfeição (Camino de Perfección)",
      "Livro da Vida (Autobiografia)",
      "Livro das Fundações",
      "Conceitos do Amor de Deus"
    ]
  },
  {
    slug: "sao-joao-paulo-ii",
    name: "São João Paulo II, Papa",
    title: "O Peregrino da Paz • O Papa da Família e da Misericórdia",
    day: 22,
    month: 10,
    rank: "Memória",
    liturgicalColor: "branco",
    summary: "O Papa polonês que demoliu o comunismo, instituiu a Divina Misericórdia e conclamou o mundo a não ter medo de Cristo.",
    quote: "Não tenhais medo! Abri, melhor, escancarai as portas a Cristo!",
    biography: "Karol Wojtyła nasceu em Wadowice (Polônia) em 1920. Sobreviveu à ocupação nazista e ao jugo comunista, sendo eleito bispo de Roma em 1978 — o primeiro Papa não-italiano em 455 anos. Viajou por 129 países, fundou a Jornada Mundial da Juventude, proclamou o Catecismo da Igreja Católica e consagrou o mundo à Divina Misericórdia de Santa Faustina. Perdoou pessoalmente na prisão o homem que tentou assassiná-lo na Praça de São Pedro.",
    martyrdomOrPassing: "Faleceu santamente na véspera do Domingo da Misericórdia em 2 de abril de 2005, diante de uma multidão em vigília ininterrupta de oração em Roma.",
    relicsAndTradition: "Seu túmulo repousa na Capela de São Sebastião dentro da Basílica de São Pedro no Vaticano.",
    patronage: ["Jovens", "Famílias", "Polônia", "Jornadas Mundiais da Juventude"],
    prayer: "Ó Deus, rico de misericórdia, que chamastes São João Paulo II para governar a vossa Igreja inteira, concedei que, instruídos por seus ensinamentos, abramos com confiança os nossos corações à graça salvadora de Cristo. Amém.",
    image: "/assets/dashboard/oracoes.webp",
    birthInfo: "18 de maio de 1920 em Wadowice, Polônia",
    deathInfo: "2 de abril de 2005 (84 anos) no Palácio Apostólico Vaticano, Roma",
    canonization: "27 de abril de 2014 pelo Papa Francisco (Beatificado em 2011 por Bento XVI)",
    iconography: [
      "Férula papal (báculo com o crucifixo curvado)",
      "Pálio arquiepiscopal e vestes brancas",
      "Brasão pontifício com o monograma mariano 'M' e o lema 'Totus Tuus'"
    ],
    majorWorks: [
      "Catecismo da Igreja Católica (1992)",
      "Encíclicas Fides et Ratio, Evangelium Vitae, Veritatis Splendor, Redemptor Hominis e Dives in Misericordia",
      "Teologia do Corpo (Catequeses sobre o Amor Humano)",
      "Livro 'Cruzando o Limiar da Esperança'"
    ]
  },

  // NOVEMBRO
  {
    slug: "todos-os-santos",
    name: "Solenidade de Todos os Santos",
    title: "A Multidão dos Eleitos no Céu",
    day: 1,
    month: 11,
    rank: "Solenidade",
    isHolyDayOfObligation: true,
    liturgicalColor: "branco",
    summary: "Celebração de todos os santos conhecidos e desconhecidos que triunfaram na fé e contemplam a face de Deus.",
    quote: "Vi uma grande multidão que ninguém podia contar, de todas as nações, tribos, povos e línguas, diante do Trono e do Cordeiro.",
    biography: "Neste dia bendito, a Igreja militante da terra une seu louvor à Igreja triunfante do Céu. Celebramos não apenas os santos canonizados nos altares, mas a multidão imensa de pais, mães, mártires anônimos, jovens e anciãos que lavaram suas vestes no Sangue do Cordeiro e agora intercedem perpetuamente por nós na bem-aventurança eterna.",
    martyrdomOrPassing: "A comunhão e vitória eterna de todos os amigos de Deus.",
    relicsAndTradition: "Instituída pelo Papa Gregório IV no século IX para celebrar a vocação universal de todos os cristãos à santidade.",
    patronage: ["Toda a humanidade chamada à santidade", "A vocação cristã"],
    prayer: "Deus eterno e todo-poderoso, que nos dais celebrar numa só festa os méritos de todos os vossos Santos, concedei-nos, pela sua infinita intercessão, a plenitude da vossa misericórdia. Por nosso Senhor Jesus Cristo. Amém.",
    image: "/assets/dashboard/liturgia.webp",
    birthInfo: "Celebração Universal da Igreja Triunfante no Céu",
    deathInfo: "Instituída pelo Papa Gregório IV em 835 d.C.",
    canonization: "Solenidade Maior de Preceito e Comunhão dos Eleitos",
    iconography: [
      "Multidão dos Santos diante do Trono do Cordeiro",
      "Vestes brancas purificadas no Sangue de Cristo",
      "Palmas da vitória e coroas de glória"
    ]
  },

  // DEZEMBRO
  {
    slug: "imaculada-conceicao",
    name: "Imaculada Conceição da Bem-Aventurada Virgem Maria",
    title: "A Toda Pura • Preservada de Toda Mancha de Pecado",
    day: 8,
    month: 12,
    rank: "Solenidade",
    isHolyDayOfObligation: true,
    liturgicalColor: "branco",
    summary: "O dogma da Virgem Maria concebida sem a mancha do pecado original desde o primeiro instante de sua existência.",
    quote: "Ave Maria, cheia de graça, o Senhor é convosco!",
    biography: "Proclamado solenemente pelo Beato Papa Pio IX na Bula Ineffabilis Deus em 8 de dezembro de 1854: em previsão dos méritos infinitos de Jesus Cristo Salvador, a Virgem Maria foi preservada imune de toda mancha da culpa original desde o primeiro instante de sua conceição no seio de Santa Ana. Quatro anos depois, em Lourdes, a própria Mãe de Deus confirmou a Santa Bernadette: 'Eu sou a Imaculada Conceição'.",
    martyrdomOrPassing: "Aurora bendita que precede o nascimento do Sol da Justiça.",
    relicsAndTradition: "A Coluna da Imaculada na Piazza di Spagna em Roma, onde o Papa deposita flores todo dia 8 de dezembro.",
    patronage: ["Igreja Católica", "Brasil (co-padroeira e rainha)", "Estados Unidos", "Portugal", "Pureza e castidade"],
    prayer: "Ó Deus, que pela Imaculada Conceição da Virgem preparastes para o vosso Filho morada digna dele, preservando-a de toda mancha em previsão da morte do vosso Filho, concedei-nos chegar puros até Vós por sua materna intercessão. Amém.",
    image: "/assets/dashboard/novenas.webp",
    linkedNovenaSlug: "imaculada-conceicao",
    birthInfo: "Dogma proclamado em 8 de dezembro de 1854 pelo Beato Pio IX (Bula Ineffabilis Deus)",
    deathInfo: "Preservada de toda mancha da culpa original desde a conceição",
    canonization: "Padroeira Principal de Portugal e das Américas sob este título",
    iconography: [
      "Virgem Maria esmagando a cabeça da serpente infernal",
      "Túnica branca e manto azul-celeste",
      "Doze estrelas em auréola luminosa",
      "Mãos unidas em oração e recolhimento"
    ]
  },
  {
    slug: "natal-de-nosso-senhor-jesus-cristo",
    name: "Natal de Nosso Senhor Jesus Cristo",
    title: "A Natividade do Verbo Encarnado",
    day: 25,
    month: 12,
    rank: "Solenidade",
    isHolyDayOfObligation: true,
    liturgicalColor: "dourado",
    summary: "O Verbo Eterno se fez carne e habitou entre nós na santa noite de Belém.",
    quote: "Glória a Deus no mais alto dos céus e paz na terra aos homens por Ele amados!",
    biography: "O cumprimento das profecias milenares: no silêncio sagrado da noite em Belém da Judéia, na pobreza de uma gruta de animais, a Santíssima Virgem deu à luz o Salvador do Mundo, envolvendo-o em panos e reclinando-o numa manjedoura. Os anjos cantaram no céu e os pastores adoraram o Rei da Glória feito frágil Menino por nosso amor.",
    martyrdomOrPassing: "O início visível de nossa Redenção divina.",
    relicsAndTradition: "A Gruta da Natividade em Belém e as tábuas sagradas da Santa Manjedoura preservadas na Basílica de Santa Maria Maior em Roma.",
    patronage: ["Toda a humanidade", "Crianças", "A família cristã", "A paz universal"],
    prayer: "Ó Deus, que admiravelmente criastes a dignidade da natureza humana e mais admiravelmente a restaurastes, concedei-nos participar da divindade daquele que se dignou assumir a nossa humanidade, vosso Filho Jesus Cristo. Amém.",
    image: "/assets/dashboard/liturgia.webp",
    birthInfo: "Natividade histórica do Verbo de Deus Encarnado em Belém da Judeia",
    deathInfo: "Cumprimento de todas as promessas messiânicas do Antigo Testamento",
    canonization: "Solenidade Suprema da Encarnação do Salvador",
    iconography: [
      "Menino Jesus na manjedoura envolto em panos",
      "Santíssima Virgem Maria e São José em adoração",
      "Anjos cantando 'Gloria in Excelsis Deo'",
      "Estrela de Belém e pastores com cordeiros"
    ]
  }
];

export const MONTH_NAMES_PT = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

/**
 * Retorna o santo/celebração de uma data específica.
 */
export function getSaintForDate(month: number, day: number): Saint | undefined {
  return SAINTS_DATABASE.find(s => s.month === month && s.day === day);
}

/**
 * Retorna o santo/celebração do dia atual (se houver celebração específica cadastrada para a data).
 */
export function getTodaySaint(date: Date = new Date()): Saint | undefined {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return getSaintForDate(month, day);
}

/**
 * Retorna um santo em destaque para o mês ou data (exato se houver, ou a celebração mais próxima do mês).
 */
export function getFeaturedSaint(date: Date = new Date()): Saint {
  const exact = getTodaySaint(date);
  if (exact) return exact;

  // Busca a celebração mais próxima no mês atual para sugestão
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const monthSaints = getSaintsForMonth(month);
  if (monthSaints.length > 0) {
    const sorted = [...monthSaints].sort((a, b) => Math.abs(a.day - day) - Math.abs(b.day - day));
    return sorted[0];
  }

  // Fallback padrão seguro
  return SAINTS_DATABASE[0];
}

/**
 * Retorna todos os santos de determinado mês (1 a 12).
 */
export function getSaintsForMonth(month: number): Saint[] {
  return SAINTS_DATABASE.filter(s => s.month === month).sort((a, b) => a.day - b.day);
}

/**
 * Retorna um santo pelo seu slug.
 */
export function getSaintBySlug(slug: string): Saint | undefined {
  return SAINTS_DATABASE.find(s => s.slug === slug);
}

/**
 * Retorna todas as Festas de Guarda / Dias de Preceito.
 */
export function getHolyDaysOfObligation(): Saint[] {
  return SAINTS_DATABASE.filter(s => s.isHolyDayOfObligation);
}

/**
 * Retorna as cores e estilos litúrgicos formatados em classes Tailwind.
 */
export function getSaintLiturgicalStyle(color?: LiturgicalColor | string | null) {
  const c = color?.toLowerCase() || "branco";
  if (c.includes("vermelho")) {
    return {
      bg: "bg-rose-500/10 dark:bg-rose-950/20",
      border: "border-rose-500/30",
      text: "text-rose-600 dark:text-rose-400",
      badge: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30",
      dot: "bg-rose-500",
      label: "Vermelho (Mártires / Apóstolos)"
    };
  }
  if (c.includes("verde")) {
    return {
      bg: "bg-emerald-500/10 dark:bg-emerald-950/20",
      border: "border-emerald-500/30",
      text: "text-emerald-600 dark:text-emerald-400",
      badge: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
      dot: "bg-emerald-500",
      label: "Verde (Tempo Comum)"
    };
  }
  if (c.includes("roxo") || c.includes("violeta")) {
    return {
      bg: "bg-purple-500/10 dark:bg-purple-950/20",
      border: "border-purple-500/30",
      text: "text-purple-600 dark:text-purple-400",
      badge: "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30",
      dot: "bg-purple-500",
      label: "Roxo (Penitência / Espera)"
    };
  }
  if (c.includes("dourado")) {
    return {
      bg: "bg-amber-500/15 dark:bg-amber-950/30",
      border: "border-amber-500/50",
      text: "text-amber-600 dark:text-amber-300",
      badge: "bg-amber-500/25 text-amber-800 dark:text-amber-200 border-amber-500/50 shadow-sm",
      dot: "bg-amber-400",
      label: "Dourado (Grandes Solenidades)"
    };
  }
  // Branco padrão
  return {
    bg: "bg-amber-100/10 dark:bg-amber-950/10",
    border: "border-amber-300/30 dark:border-amber-500/20",
    text: "text-amber-700 dark:text-amber-300",
    badge: "bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-400/30",
    dot: "bg-amber-200",
    label: "Branco (Santos / Virgens / Doutores)"
  };
}

/**
 * Busca flexível de santos por termo.
 */
export function searchSaints(query: string, categoryFilter?: string | null): Saint[] {
  const q = query.trim().toLowerCase();
  return SAINTS_DATABASE.filter(saint => {
    const matchesQuery =
      q.length === 0 ||
      saint.name.toLowerCase().includes(q) ||
      saint.title.toLowerCase().includes(q) ||
      saint.summary.toLowerCase().includes(q) ||
      saint.biography.toLowerCase().includes(q) ||
      saint.patronage.some(p => p.toLowerCase().includes(q)) ||
      (saint.birthInfo && saint.birthInfo.toLowerCase().includes(q)) ||
      (saint.deathInfo && saint.deathInfo.toLowerCase().includes(q)) ||
      (saint.canonization && saint.canonization.toLowerCase().includes(q)) ||
      (saint.iconography && saint.iconography.some(i => i.toLowerCase().includes(q))) ||
      (saint.majorWorks && saint.majorWorks.some(w => w.toLowerCase().includes(q)));

    if (!matchesQuery) return false;

    if (!categoryFilter || categoryFilter === "todos") return true;
    if (categoryFilter === "guarda") return !!saint.isHolyDayOfObligation;
    if (categoryFilter === "solenidades") return saint.rank === "Solenidade";
    if (categoryFilter === "martires") return saint.liturgicalColor === "vermelho" || saint.title.toLowerCase().includes("mártir");
    if (categoryFilter === "doutores") return saint.title.toLowerCase().includes("doutor") || saint.title.toLowerCase().includes("doutora");
    if (categoryFilter === "marianos") return saint.slug.includes("nossa-senhora") || saint.slug.includes("maria") || saint.slug.includes("imaculada") || saint.slug.includes("assuncao");

    return true;
  });
}
