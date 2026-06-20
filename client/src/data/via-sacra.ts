// Texto da Via-Sacra segundo Santo Afonso Maria de Ligório.
// Em cada estação, antes da meditação, costuma-se dizer:
//   V. Nós vos adoramos, ó Cristo, e vos bendizemos.
//   R. Porque pela vossa Santa Cruz remistes o mundo.
// E ao final da oração, o ato de amor:
//   "Eu vos amo, ó meu amabilíssimo Jesus, amo-vos mais do que a mim mesmo;
//    arrependo-me, de todo o coração, de vos ter ofendido.
//    Não permitais que eu torne a ofender-vos.
//    Concedei-me a graça de vos amar sempre, e fazei de mim o que vos aprouver."
// Reza-se também um Pai-Nosso, uma Ave-Maria e um Glória ao Pai.

export interface ViaSacraStation {
  id: string;
  order: number;
  title: string;
  scripture: string;
  meditation: string;
  prayer: string;
  imageUrl: string;
}

const STATION_INVOCATION =
  "℣. Nós vos adoramos, ó Cristo, e vos bendizemos.\n℟. Porque, por vossa santa Cruz, redimistes o mundo.";

const FINAL_PRAYERS = "Pai-nosso, Ave-Maria, Glória.";

export const VIA_SACRA_STATIONS: ViaSacraStation[] = [
  {
    id: "estacao-1",
    order: 1,
    title: "Jesus é condenado à morte",
    scripture: STATION_INVOCATION,
    meditation:
      "Contemplemos como Jesus Cristo, já flagelado e coroado de espinhos, foi por fim injustamente condenado à morte por Pilatos.",
    prayer: `Ó Jesus adorável, não foi Pilatos, mas minha vida iníqua que vos condenou à morte. Pelo mérito deste tão penoso itinerário, no qual entrais rumo ao monte Calvário, peço-vos que benignamente me acompanheis no caminho pelo qual minha alma se dirige à eternidade. Amo-vos, ó Jesus, meu Amor, mais do que a mim mesmo, e do fundo do coração me arrependo de ter-vos ofendido. Não permitais que eu novamente me separe de vós. Dai-me amor perpétuo a vós e fazei de mim o que quiserdes. O que vos for agradável também o será para mim.

${FINAL_PRAYERS}

A morrer crucificado,
Teu Jesus é condenado
Por teus crimes, pecador.
Pela Virgem dolorosa,
Vossa Mãe tão piedosa,
Perdoai-me, meu Jesus.`,
    imageUrl: "/assets/via-sacra/imagens/1estacao.webp",
  },
  {
    id: "estacao-2",
    order: 2,
    title: "Jesus carrega a Cruz",
    scripture: STATION_INVOCATION,
    meditation:
      "Contemplemos como Jesus Cristo, levando a Cruz aos ombros, lembrava-se no caminho de oferecer por nós ao Pai eterno a morte que havia de sofrer.",
    prayer: `Ó amabilíssimo Jesus, abraço todas as adversidades que, por vossa vontade, hei de tolerar até a morte e, pelo duro sofrimento que suportastes carregando a Cruz, peço-vos que me deis forças para que também eu possa carregar, com ânimo forte e paciente, minha própria cruz. Amo-vos, ó Jesus, meu Amor, e arrependo-me de ter-vos ofendido. Não permitais que novamente me separe de ti. Dai-me amor perpétuo a vós e fazei de mim o que quiserdes.

${FINAL_PRAYERS}

Com a Cruz é carregado,
E do peso acabrunhado,
Vai morrer por teu amor.
Pela Virgem dolorosa,
Vossa Mãe tão piedosa,
Perdoai-me, meu Jesus.`,
    imageUrl: "/assets/via-sacra/imagens/2estacao.webp",
  },
  {
    id: "estacao-3",
    order: 3,
    title: "Jesus cai pela primeira vez",
    scripture: STATION_INVOCATION,
    meditation:
      "Contemplemos a primeira queda de Jesus sob o peso da Cruz. Tinha Ele a carne, por causa da cruenta flagelação, ferida de muitos modos e a cabeça coroada de espinhos; derramara ainda tanto sangue, que mal podia mover os pés por falta de forças. E porque era oprimido pelo grave peso da Cruz e açulado sem clemência pelos soldados, por isso aconteceu-lhe de cair muitas vezes por terra ao longo do caminho.",
    prayer: `Ó meu Jesus, não é o peso da Cruz, mas o dos meus pecados que de tantas dores vos cobre. Rogo-vos, por esta vossa primeira queda, que me protejais de toda queda em pecado. Amo-vos, ó Jesus, de todo o meu coração; arrependo-me de ter-vos ofendido. Não me permitais novamente cair em pecado. Dai-me amor perpétuo a vós e fazei de mim o que quiserdes.

${FINAL_PRAYERS}

Pela Cruz tão oprimido,
Cai Jesus, desfalecido,
Pela tua salvação.
Pela Virgem dolorosa,
Vossa Mãe tão piedosa,
Perdoai-me, meu Jesus.`,
    imageUrl: "/assets/via-sacra/imagens/3estacao.webp",
  },
  {
    id: "estacao-4",
    order: 4,
    title: "Jesus se encontra com sua Mãe dolorosa",
    scripture: STATION_INVOCATION,
    meditation:
      "Contemplemos como deve ter sido o encontro, neste caminho, do Filho e da Mãe. Jesus e Maria se olharam entre si, e os olhares mudos que trocaram foram outras tantas setas a atravessar o coração amante de ambos.",
    prayer: `Ó amantíssimo Jesus, pela dor acerba que experimentastes neste encontro, tornai-me, eu vos peço, verdadeiramente devoto de vossa Mãe santíssima. E vós, ó minha dolorosa Rainha, intercedei por mim e alcançai-me uma tal memória dos suplícios de vosso Filho, que minha mente esteja para sempre detida na piedosa contemplação deles. Amo-vos, ó Jesus, meu Amor; arrependo-me de ter-vos ofendido. Não me permitais novamente pecar contra vós. Dai-me amor perpétuo a vós e fazei de mim o que quiserdes.

${FINAL_PRAYERS}

De Maria lacrimosa,
No encontro lastimosa,
Vê a imensa compaixão.
Pela Virgem dolorosa,
Vossa Mãe tão piedosa,
Perdoai-me, meu Jesus.`,
    imageUrl: "/assets/via-sacra/imagens/4estacao.webp",
  },
  {
    id: "estacao-5",
    order: 5,
    title: "O Cirineu ajuda Jesus a carregar a Cruz",
    scripture: STATION_INVOCATION,
    meditation:
      "Contemplemos como os judeus obrigaram Simão de Cirene a carregar a Cruz atrás do Senhor, vendo Jesus quase expirar a cada passo devido ao cansaço e temendo, por outra parte, que morresse no caminho aquele que queriam ver pregado à Cruz.",
    prayer: `Ó dulcíssimo Jesus, não quero, como o Cirineu, repudiar a Cruz. De bom grado a abraço e tomo sobre mim; abraço especialmente a morte que para mim estabelecestes, com todas as dores que ela trará consigo. Uno minha morte à vossa e, assim unida, ofereço-a a vós em sacrifício. Vós morrestes por amor a mim; quero também eu morrer por amor a vós, com a intenção de vos agradar. Vós, porém, ajudai-me com a vossa graça. Amo-vos, ó Jesus, meu Amor, e arrependo-me de ter-vos ofendido. Não permitais que eu novamente vos ofenda. Dai-me amor perpétuo a vós e fazei de mim o que quiserdes.

${FINAL_PRAYERS}

Em extremo desmaiado,
Teve auxílio, tão cansado,
Recebendo o Cireneu.
Pela Virgem dolorosa,
Vossa Mãe tão piedosa,
Perdoai-me, meu Jesus.`,
    imageUrl: "/assets/via-sacra/imagens/5estacao.webp",
  },
  {
    id: "estacao-6",
    order: 6,
    title: "Verônica limpa com um sudário o rosto de Jesus",
    scripture: STATION_INVOCATION,
    meditation:
      "Contemplemos como aquela santa mulher Verônica, vendo Jesus abatido pelas dores, com o rosto banhado em suor e sangue, estendeu-lhe um pano em que, purificada a face, Ele deixou impressa sua imagem.",
    prayer: `Ó meu Jesus, formosa era antes a vossa face; mas agora não aparece assim, tão deformada está por feridas e sangue! Ai de mim, como era formosa também minha alma, quando recebi a vossa graça pelo Batismo: mas, pecando, tornei-a disforme. Vós somente, meu Redentor, lhe podeis restituir a antiga beleza. Para que o façais, rogo-vos pelo mérito de vossa Paixão. Amo-vos, ó Jesus, meu Amor; arrependo-me de ter-vos ofendido. Não permitais que eu novamente vos ofenda. Dai-me amor perpétuo a vós e fazei de mim o que quiserdes.

${FINAL_PRAYERS}

O seu rosto ensanguentado,
Por Verônica enxugado,
Eis, no pano, apareceu.
Pela Virgem dolorosa,
Vossa Mãe tão piedosa,
Perdoai-me, meu Jesus.`,
    imageUrl: "/assets/via-sacra/imagens/6estacao.webp",
  },
  {
    id: "estacao-7",
    order: 7,
    title: "Jesus cai pela segunda vez",
    scripture: STATION_INVOCATION,
    meditation:
      "Contemplemos a segunda queda de Jesus sob o peso da Cruz, na qual se lhe aprofundam todas as chagas da venerável cabeça e de todo o corpo, e se renovam todas as angústias do doloroso Senhor.",
    prayer: `Ó mansíssimo Jesus, quantas vezes me concedestes o perdão! Eu, porém, recaí nos mesmos pecados e renovei minhas ofensas contra vós. Pelo mérito desta vossa nova queda, ajudai-me a perseverar em vossa graça até a morte. Fazei, em todas as tentações que avançarão contra mim, que em vós sempre me refugie. Amo-vos de todo o meu coração, ó Jesus, meu Amor; arrependo-me de ter-vos ofendido. Não permitais que eu novamente vos ofenda. Dai-me amor perpétuo a vós e fazei de mim o que quiserdes.

${FINAL_PRAYERS}

Outra vez desfalecido,
Pelas dores abatido,
Cai por terra o Salvador.
Pela Virgem dolorosa,
Vossa Mãe tão piedosa,
Perdoai-me, meu Jesus.`,
    imageUrl: "/assets/via-sacra/imagens/7estacao.webp",
  },
  {
    id: "estacao-8",
    order: 8,
    title: "Jesus fala às mulheres de Jerusalém",
    scripture: STATION_INVOCATION,
    meditation:
      "Contemplemos como estas mulheres, vendo Jesus morto de cansaço e coberto de sangue, são tocadas de comiseração e choram copiosamente. Mas, voltando-se a elas, Ele diz: Não choreis por mim; antes, chorai por vós mesmas e por vossos filhos.",
    prayer: `Ó doloroso Jesus, choro os pecados que cometi contra vós, não só pelas penas de que me fizeram digno, mas sobretudo pela tristeza que vos causaram a vós, que tanto me amastes. Ao choro me move menos o inferno que o amor a vós. Ó meu Jesus, amo-vos mais do que a mim mesmo; arrependo-me de ter-vos ofendido. Não permitais que eu novamente vos ofenda. Dai-me amor perpétuo a vós e fazei de mim o que quiserdes.

${FINAL_PRAYERS}

Das mulheres piedosas,
De Sião filhas chorosas,
É Jesus consolador.
Pela Virgem dolorosa,
Vossa Mãe tão piedosa,
Perdoai-me, meu Jesus.`,
  imageUrl: "/assets/via-sacra/imagens/8estacao.webp",
  },
  {
    id: "estacao-9",
    order: 9,
    title: "Jesus cai pela terceira vez",
    scripture: STATION_INVOCATION,
    meditation:
      "Contemplemos a terceira queda de Cristo sob o peso da Cruz. Caiu porque era demasiada a sua fraqueza e excessiva a crueldade dos algozes, que lhe queriam acelerar a marcha, embora Ele mal pudesse dar um passo.",
    prayer: `Ó Jesus tão maltratado, pelo mérito desta falta de forças que quisestes padecer no caminho do Calvário, confortai-me, eu vos peço, com tanto vigor, que já não tenha respeito algum às opiniões dos homens e domine minha natureza viciosa: porque ambas as coisas foram a causa por que desprezei outrora a vossa amizade. Amo-vos, ó Jesus, meu Amor, de todo o meu coração; arrependo-me de ter-vos ofendido. Não permitais que eu novamente vos ofenda. Dai-me amor perpétuo a vós e fazei de mim o que quiserdes.

${FINAL_PRAYERS}

Cai, terceira vez, prostrado,
Pelo peso redobrado
Dos pecados e da Cruz.
Pela Virgem dolorosa,
Vossa Mãe tão piedosa,
Perdoai-me, meu Jesus.`,
  imageUrl: "/assets/via-sacra/imagens/9estacao.webp",
  },
  {
    id: "estacao-10",
    order: 10,
    title: "Jesus é espoliado de suas vestes",
    scripture: STATION_INVOCATION,
    meditation:
      "Contemplemos com que violência arrancaram as vestes a Cristo. Como o traje interior estivesse muito pegado à carne, aberta pelos flagelos, os carnífices, ao puxarem-lha, rasgaram-lhe também a pele. Tenhamos compaixão de Nosso Senhor e lhe falemos assim:",
    prayer: `Ó inocentíssimo Jesus, pelo mérito da dor que padecestes nesta espoliação, ajudai-me, eu vos peço, a despir-me de todo afeto às coisas criadas e, com toda a inclinação de minha vontade, converter-me somente a vós, que sois tão digno do meu amor. Amo-vos de todo o meu coração; arrependo-me de ter-vos ofendido. Não permitais que eu novamente vos ofenda. Dai-me amor perpétuo a vós e fazei de mim o que quiserdes.

${FINAL_PRAYERS}

Dos vestidos despojado,
Por algozes maltratado,
Eu vos vejo, meu Jesus.
Pela Virgem dolorosa,
Vossa Mãe tão piedosa,
Perdoai-me, meu Jesus.`,
  imageUrl: "/assets/via-sacra/imagens/10estacao.webp",
  },
  {
    id: "estacao-11",
    order: 11,
    title: "Jesus é pregado à Cruz",
    scripture: STATION_INVOCATION,
    meditation:
      "Contemplemos como Jesus é arremessado sobre a Cruz e, de braços estendidos, oferece sua vida ao Pai eterno em sacrifício pela nossa salvação. Os carnífices o pregam à Cruz e, depois de erguerem esta, deixam-no levantado num infame patíbulo, abandonado a uma morte cruel.",
    prayer: `Ó Jesus tão desprezado, pregai meu coração aos vossos pés, para que, com vínculo de amor, eu permaneça sempre a vós ligado e jamais seja de vós separado. Amo-vos mais do que a mim mesmo, arrependo-me de ter-vos ofendido. Não permitais que eu novamente vos ofenda. Dai-me amor perpétuo a vós e fazei de mim o que quiserdes.

${FINAL_PRAYERS}

Sois por mim na Cruz pregado,
Insultado, blasfemado,
Com cegueira e com furor.
Pela Virgem dolorosa,
Vossa Mãe tão piedosa,
Perdoai-me, meu Jesus.`,
    imageUrl: "/assets/via-sacra/imagens/11estacao.webp",
  },
  {
    id: "estacao-12",
    order: 12,
    title: "Jesus morre na Cruz",
    scripture: STATION_INVOCATION,
    meditation:
      "Contemplemos Jesus preso à nossa Cruz. Após três horas de luta, consumido enfim pelas dores, Ele deu o corpo à morte e, de cabeça inclinada, entregou o espírito.",
    prayer: `Ó Jesus morto, movido por íntimos afetos de piedade, beijo esta Cruz em que vós, por minha causa, cumpristes o curso de vossa vida. Pelos pecados cometidos, mereci uma morte infeliz; mas vossa morte é minha esperança. Pelos méritos de vossa morte, concedei-me, peço-vos, que, abraçado aos vossos pés e abrasado de amor por vós, eu entregue um dia meu espírito. Amo-vos de todo o meu coração; arrependo-me de ter-vos ofendido. Não permitais que eu novamente vos ofenda. Dai-me amor perpétuo a vós e fazei de mim o que quiserdes.

${FINAL_PRAYERS}

Por meus crimes padecestes,
Meu Jesus, por mim morrestes,
Oh, quão grande é minha dor!
Pela Virgem dolorosa,
Vossa Mãe tão piedosa,
Perdoai-me, meu Jesus.`,
    imageUrl: "/assets/via-sacra/imagens/12estacao.webp",
  },
  {
    id: "estacao-13",
    order: 13,
    title: "Jesus é descido da Cruz",
    scripture: STATION_INVOCATION,
    meditation:
      "Contemplemos como dois dos discípulos de Jesus, José e Nicodemos, o tiram exânime da Cruz e o colocam nos braços de sua Mãe dolorosa, que recebe o Filho morto com grande amor e o abraça ternamente.",
    prayer: `Ó Mãe das Dores, pelo amor com que amais o vosso Filho, recebei-me como servo vosso e rogai a Ele por mim. E vós, ó meu Redentor, porque por mim morrestes, fazei, benignamente, com que eu vos ame; a vós somente desejo nem quero nada fora de vós. Amo-vos, ó Jesus, meu Amor, e arrependo-me de ter-vos ofendido. Não permitais que eu novamente vos ofenda. Dai-me amor perpétuo a vós e fazei de mim o que quiserdes.

${FINAL_PRAYERS}

Do madeiro vos tiraram
E à Mãe vos entregaram
Com que dor e compaixão!
Pela Virgem dolorosa,
Vossa Mãe tão piedosa,
Perdoai-me, meu Jesus.`,
    imageUrl: "/assets/via-sacra/imagens/13estacao.webp",
  },
  {
    id: "estacao-14",
    order: 14,
    title: "Jesus é sepultado",
    scripture: STATION_INVOCATION,
    meditation:
      "Contemplemos como os discípulos levam Jesus exânime ao lugar da sepultura. Triste, a Mãe os acompanha e com as próprias mãos acomoda o corpo do Filho à sepultura. Fecha-se este, enfim, e todos vão-se embora.",
    prayer: `Ó Jesus sepultado, beijo esta pedra que vos acolheu; mas, após três dias, haveis de ressurgir! Por vossa ressurreição, fazei-me, eu vos peço, ressurgir glorioso convosco no último dia e ir para o Céu, onde, unido a vós para sempre, vos hei de louvar e amar por toda a eternidade. Amo-vos e arrependo-me de ter-vos ofendido. Não permitais que eu novamente vos ofenda. Dai-me amor perpétuo a vós e fazei de mim o que quiserdes.

${FINAL_PRAYERS}

No sepulcro vos deixaram,
Sepultado, vos choraram,
Magoado o coração.
Meu Jesus, por vossos passos,
Recebei em vossos braços
A mim, pobre pecador.`,
    imageUrl: "/assets/via-sacra/imagens/14estacao.webp",
  },
];
