export type NovenaCategory = "basic" | "premium";

export interface NovenaDay {
  day: number;
  title: string;
  reflection: string;
  prayer: string;
  audioUrl?: string;
}

export interface Novena {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  description: string;
  icon: string;
  category: NovenaCategory;
  duration: string;
  days: NovenaDay[];
}

function buildSimpleDays(theme: string, prayerText: string): NovenaDay[] {
  return Array.from({ length: 9 }, (_, i) => ({
    day: i + 1,
    title: `Dia ${i + 1}`,
    reflection: `${theme} - medite neste dia com espírito de entrega, confiança e perseverança diante da graça de Deus.`,
    prayer: prayerText,
  }));
}

const SAGRADO_CORACAO_AUDIO_BASE_PATH = "/audio/novenas/sagrado-coracao-jesus";

const SAGRADO_CORACAO_INITIAL_PRAYER = `ORAÇÃO INICIAL PARA TODOS OS DIAS

Lembrai-vos, ó dulcíssimo Jesus, que nunca se ouviu dizer
que alguém, recorrendo com confiança ao vosso Sagrado Coração, implorando vossa
divina assistência e reclamando a vossa infinita misericórdia, fosse por vós
abandonado. Possuído, pois, e animado da mesma confiança, ó Coração Sagrado de
Jesus, Rei de todos os corações, recorro a vós, e gemendo sob o peso de meus
pecados, me prostro diante de vós. Meu Jesus, pelo vosso precioso Sangue e pelo
amor de vosso divino Coração, não desprezeis as minhas súplicas, mas ouvi-as
favoravelmente e dignai-vos atender-me. Amém.`;

const SAGRADO_CORACAO_FINAL_PRAYER = `ORAÇÃO FINAL PARA TODOS OS DIAS

Pai-Nosso, Ave-Maria e Glória ao Pai.
Jesus, manso e humilde de coração, fazei o nosso coração semelhante ao vosso.
Dulcíssimo Coração de Jesus, vosso precioso Sangue é a vida da minha alma; só em vós quero
viver, só a vós quero amar e servir. Pela sede ardente que vos abrasa de me
salvar, iluminai o meu espírito com a luz de vossa divina graça. Santificai o
meu coração, fortalecei a minha vontade, perdoai os meus pecados e curai todas
as minhas misérias. Aumentai minha fé, fortificai a minha esperança e acendei
em mim cada vez mais o fogo do vosso santo amor. Concedei-me, enfim, todas as
graças que espero alcançar com esta novena. Ó dulcíssimo Jesus, vivei em mim
agora e por todo o sempre. Amém.

Doce Coração de Jesus,
Fazei que eu vos ame cada vez mais!`;

function buildSagradoCoracaoDays(): NovenaDay[] {
  const reflections = [
    {
      title: "Primeiro dia: Coração de Jesus, templo da Santíssima Trindade",
      reflection:
        "Pondera, alma minha, como o Coração de Jesus foi o templo mais sagrado que neste mundo teve a Trindade Santíssima e Beatíssima. Um só ato de amor, reverência, adoração ou qualquer virtude que saia deste Coração unido à Pessoa do divino Verbo é para Deus de estima infinitamente maior que todos os atos de todas as criaturas. Considera, alma minha, quanta glória recebeu a Santíssima Trindade com as adorações e louvores de Jesus. E se também deves ser templo da Trindade pela graça, pede ao Senhor que faça o teu coração conforme a este ardentíssimo Coração.",
    },
    {
      title: "Segundo dia: Coração de Jesus, artífice do Santíssimo Sacramento",
      reflection:
        "Pondera, alma minha, que do soberano Coração de Jesus saiu o Diviníssimo Sacramento, onde temos depositado o Sangue sacratíssimo que manou do seu lado. Tamanho foi o amor do Coração de Jesus que, se não se tivesse deixado no Santíssimo Sacramento, não poderia morrer na cruz. Impaciente de ausências, vendo que havia de partir para o Pai, inventou esta indústria amorosa de partir e ficar juntamente. Considera quanto deves a este Coração abrasado e confunde-te de tão pouco agradeceres por tantos bens.",
    },
    {
      title: "Terceiro dia: Coração de Jesus, sarça de penetrantes espinhos",
      reflection:
        "Pondera, alma minha, que desde o primeiro alento de vida até o último suspiro na cruz, o Coração de Jesus nunca viveu sem penas. Ao aceitar padecer pelos homens, começaram também suas dores. Antes dos tormentos exteriores, Jesus tolerava interiormente as penas ao ver as ofensas ao Eterno Pai. No horto, foi tão viva a representação do sofrimento que seu sangue rompeu por todos os poros. Confunde-te, alma minha, da tibieza com que amas este Divino Coração e da negligência com que evitas imitá-lo.",
    },
    {
      title: "Quarto dia: Coração de Jesus, fornalha abrasadíssima de caridade",
      reflection:
        "Pondera, alma minha, que o extremo com que este Sagrado Coração amou e ama a Deus só o próprio Deus pode compreender. Seu peito era fornalha de incêndios, e seu Coração, mina de labaredas que subiam até Deus. Veio à terra para acender esse fogo, e mesmo um mundo infinitamente maior não bastaria para conter tanta caridade. As finezas de Cristo e seus contínuos benefícios são chamas dessa fornalha. É possível, alma minha, permanecer fria diante de tanto amor?",
    },
    {
      title: "Quinto dia: Coração de Jesus, paraíso de delícias celestiais",
      reflection:
        "Pondera, alma minha, que neste suavíssimo Coração se encerram todas as delícias do paraíso. Ele é o mar por onde entram e saem os rios dos divinos regalos: entram por Deus e saem para deliciar as almas justas. Muitos santos, admitidos neste paraíso interior, pediam moderação das consolações por não poderem suportar tanta abundância. Pobre de ti, alma minha, se participas tão pouco dessas riquezas. Aprende a amar este centro de amor e te farás digna das delícias deste paraíso.",
    },
    {
      title: "Sexto dia: Coração de Jesus, tesouro riquíssimo de graças",
      reflection:
        "Pondera, alma minha, que assim como o tesouro é agregado de riquezas, o Coração de Jesus é depósito de infinitas graças. Nele encontras inocência suma, humildade profundíssima, fortaleza imensa e sabedoria sem fim. Para compreender tais riquezas, considera quem as comunicou e a quem foram comunicadas: o Eterno Pai ao seu Filho amado. Se a liberalidade do Pai é infinita, imensuráveis são as graças deste Coração. Alma minha, ama este tesouro para participares de suas riquezas.",
    },
    {
      title: "Sétimo dia: Coração de Jesus, abismo de imensa piedade",
      reflection:
        "Pondera, alma minha, como é piedoso este amante Coração: a ninguém nega sua misericórdia. Toda alma aflita que recorre com fé encontra consolação e remédio. Ofendido por nossas culpas, ele dissimula, espera o arrependimento e perdoa. E se recaímos, não se esgota sua paciência; antes, nos busca com auxílios e inspirações repetidas. Se voltamos para Ele, alegra-se e nos acolhe. Crendo nisso, alma minha, como não morrer de amor por este Coração?",
    },
    {
      title: "Oitavo dia: Coração de Jesus, atrativo dos nossos corações",
      reflection:
        "Pondera, alma minha, o que disse Nosso Senhor: somente depois de exaltado na cruz se abriria seu lado, ficando patente o seu amante Coração. Quem nele pusesse os olhos seria atraído por suavíssima violência e render-se-ia ao amor. Se não te rendes, é porque não o contemplas. Deste Coração manam verdades que dissipam trevas, fogo que aquece almas frias, luzes contra ignorâncias, misericórdias que lavam culpas, doçuras, auxílios e inspirações. Se visses que dele mana todo bem, deixarias de amá-lo?",
    },
    {
      title: "Nono dia: Coração de Jesus, penhor de vida eterna",
      reflection:
        "Pondera, alma minha, que assim como o coração humano é princípio da vida temporal, o Coração de Jesus é para nós princípio da vida eterna. Para alcançar a vida eterna, é necessário perdão dos pecados; e do lado aberto de Cristo saíram sangue e água, sinais da redenção e do Batismo. Por isso, este Coração é a porta da vida eterna. Como Deus deu vida ao homem no paraíso com um sopro, Cristo soprou sobre os discípulos o Espírito Santo, mostrando que a graça vem de seu Coração. Ama-o e imita-o para alcançares a graça e a glória eterna.",
    },
  ];

  return reflections.map((item, index) => ({
    day: index + 1,
    title: item.title,
    reflection: item.reflection,
    prayer: `${SAGRADO_CORACAO_INITIAL_PRAYER}\n\n${SAGRADO_CORACAO_FINAL_PRAYER}`,
    audioUrl: `${SAGRADO_CORACAO_AUDIO_BASE_PATH}/dia-${index + 1}.mp3`,
  }));
}

export const NOVENAS: Novena[] = [
  {
    id: "novena-sagrado-coracao-jesus",
    slug: "novena-ao-sagrado-coracao-de-jesus",
    name: "Novena ao Sagrado Coração de Jesus",
    subtitle: "Doce Coração de Jesus",
    description:
      "Nove dias de meditação e súplica diante do Sagrado Coração. Tradicionalmente inicia-se na quarta-feira que precede Corpus Christi.",
    icon: "❤️",
    category: "basic",
    duration: "9 dias",
    days: buildSagradoCoracaoDays(),
  },
  {
    id: "novena-divino-espirito-santo",
    slug: "novena-do-divino-espirito-santo",
    name: "Novena do Divino Espírito Santo",
    subtitle: "Vinde, Espírito Santo",
    description: "Nove dias suplicando luz, fortaleza e discernimento para as escolhas da vida cotidiana.",
    icon: "🕊️",
    category: "basic",
    duration: "9 dias",
    days: buildSimpleDays(
      "Pequena invocação ao Espírito Santo",
      `Vinde, Espírito Santo,
    enchei os corações dos vossos fiéis
e acendei neles o fogo do vosso amor.

    Enviai o vosso Espírito e tudo será criado,
e renovareis a face da terra.

Oremos:
    Ó Deus, que instruístes os corações dos vossos fiéis
    com a luz do Espírito Santo,
fazei que apreciemos retamente todas as coisas
    segundo o mesmo Espírito
    e gozemos sempre de sua consolação.
    Por Cristo, Senhor nosso. Amém.`
    ),
  },
  {
    id: "novena-nossa-senhora-perpetuo-socorro",
    slug: "novena-nossa-senhora-do-perpetuo-socorro",
    name: "Novena de Nossa Senhora do Perpétuo Socorro",
    subtitle: "Refúgio e auxílio dos cristãos",
    description: "Nove dias de súplica filial e confiança na intercessão da Mãe do Perpétuo Socorro.",
    icon: "🌟",
    category: "premium",
    duration: "9 dias",
    days: buildSimpleDays(
      "Entrega filial a Nossa Senhora",
      `Ó Mãe do Perpétuo Socorro,
concedei-me a graça de invocar sempre o vosso poderosíssimo nome,
que é o socorro dos vivos e a salvação dos moribundos.

Ó Mãe puríssima,
fazei que o vosso nome seja, daqui por diante,
a minha respiração contínua.
Não tardeis, Virgem Santíssima, em socorrer-me,
todas as vezes que vos invocar,
porque, em todas as tentações,
em todas as necessidades,
nunca cessarei de vos chamar,
repetindo sempre o vosso santo nome: Maria, Maria!

Que consolação, que doçura,
que confiança, que ternura inunda a minha alma,
ao pronunciar o vosso santo nome
e somente ao pensar em vós!

Dou graças ao Senhor Deus
por ter-vos dado, para meu bem,
um nome tão doce, tão amável, tão poderoso.
Mas não me basta, ó Mãe querida,
pronunciar este nome.
Quero invocar-vos com o amor que vos consagro,
para que esse amor me mova a chamar-vos sempre:
Maria, Mãe do Perpétuo Socorro! Amém.`
    ),
  },
  {
    id: "novena-sao-jose",
    slug: "novena-de-sao-jose",
    name: "Novena de São José",
    subtitle: "Patrono da Igreja e das famílias",
    description: "Nove dias pedindo a intercessão de São José pelo trabalho, pela família e pela proteção do lar.",
    icon: "🛠️",
    category: "premium",
    duration: "9 dias",
    days: buildSimpleDays(
      "Confiança no silêncio e obediência de São José",
      `Glorioso São José,
    escolhido por Deus para ser guardião da Sagrada Família,
protegei nossas casas,
abençoai nosso trabalho
e sustentai-nos na vontade de Deus.

    São José,
    modelo de justiça e fidelidade,
    rogai por nós. Amém.`
    ),
  },
];

export function getNovenaBySlug(slug: string): Novena | undefined {
  return NOVENAS.find((novena) => novena.slug === slug);
}

export function getNovenaPath(novena: Novena): string {
  return `/novenas/${novena.slug}`;
}
