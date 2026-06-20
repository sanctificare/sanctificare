// Passagens curadas para a prática diária da Lectio Divina.
// Cada entrada inclui texto bíblico, contexto e perguntas guiadas para
// cada um dos cinco passos: Lectio, Meditatio, Oratio, Contemplatio, Actio.

export interface LectioStepGuide {
  prompt: string;
  helper: string;
}

export interface LectioPassage {
  id: string;
  reference: string;
  title: string;
  theme: string;
  text: string;
  context: string;
  steps: {
    lectio: LectioStepGuide;
    meditatio: LectioStepGuide;
    oratio: LectioStepGuide;
    contemplatio: LectioStepGuide;
    actio: LectioStepGuide;
  };
}

export const LECTIO_PASSAGES: LectioPassage[] = [
  {
    id: "mt-5-1-12",
    reference: "Mateus 5,1-12",
    title: "As Bem-aventuranças",
    theme: "Felicidade segundo o Reino",
    context:
      "No Sermão da Montanha, Jesus revela o coração do Reino e proclama bem-aventurados aqueles que o mundo considera frágeis.",
    text: `Vendo as multidões, Jesus subiu ao monte. Sentou-se, e os seus discípulos aproximaram-se dele. Então começou a ensiná-los, dizendo:

"Bem-aventurados os pobres em espírito, porque deles é o Reino dos Céus.
Bem-aventurados os aflitos, porque serão consolados.
Bem-aventurados os mansos, porque possuirão a terra.
Bem-aventurados os que têm fome e sede de justiça, porque serão saciados.
Bem-aventurados os misericordiosos, porque alcançarão misericórdia.
Bem-aventurados os puros de coração, porque verão a Deus.
Bem-aventurados os que promovem a paz, porque serão chamados filhos de Deus.
Bem-aventurados os que são perseguidos por causa da justiça, porque deles é o Reino dos Céus.

Bem-aventurados sois vós, quando vos injuriarem, perseguirem e, mentindo, disserem todo tipo de mal contra vós, por causa de mim. Alegrai-vos e exultai, porque será grande a vossa recompensa nos céus."`,
    steps: {
      lectio: {
        prompt: "O que o texto diz?",
        helper:
          "Leia devagar, em voz baixa. Sublinhe a palavra ou frase que mais toca seu coração.",
      },
      meditatio: {
        prompt: "O que o texto diz a mim?",
        helper:
          "Pergunte-se: qual bem-aventurança fala da minha vida hoje? Onde sinto pobreza, fome de justiça ou sede de paz?",
      },
      oratio: {
        prompt: "O que eu digo a Deus a partir do texto?",
        helper:
          "Responda ao Senhor com suas próprias palavras: louvor, pedido, oferta ou perdão.",
      },
      contemplatio: {
        prompt: "Como Deus me transforma?",
        helper:
          "Permaneça em silêncio adorando o Senhor que faz novas todas as coisas. Deixe-se olhar por Ele.",
      },
      actio: {
        prompt: "O que vou viver hoje?",
        helper:
          "Defina um gesto concreto de misericórdia, mansidão ou paz a colocar em prática ainda hoje.",
      },
    },
  },
  {
    id: "lc-10-38-42",
    reference: "Lucas 10,38-42",
    title: "Marta e Maria",
    theme: "A escolha da melhor parte",
    context:
      "Jesus é acolhido na casa de duas irmãs e revela que escutar a Palavra é o que verdadeiramente importa ao coração discípulo.",
    text: `Caminhando com seus discípulos, Jesus entrou num povoado, e certa mulher, chamada Marta, recebeu-o em sua casa. Ela tinha uma irmã, chamada Maria, que, sentando-se aos pés do Senhor, escutava a sua palavra.

Marta estava ocupada com muitos serviços. Aproximando-se, disse: "Senhor, não te importa que minha irmã me deixe servindo sozinha? Dize-lhe que me ajude."

O Senhor lhe respondeu: "Marta, Marta! Andas inquieta e te preocupas com muitas coisas. Porém, uma só é necessária. Maria escolheu a melhor parte, e esta não lhe será tirada."`,
    steps: {
      lectio: {
        prompt: "O que o texto diz?",
        helper:
          "Observe os gestos das duas irmãs. Repita a frase do Senhor a Marta com atenção.",
      },
      meditatio: {
        prompt: "O que o texto diz a mim?",
        helper:
          "Em que ponto da vida estou sendo Marta? Em que ponto estou sendo Maria?",
      },
      oratio: {
        prompt: "O que eu digo a Deus?",
        helper:
          "Peça ao Senhor o dom de escutar antes de servir, de adorar antes de agir.",
      },
      contemplatio: {
        prompt: "Como Deus me transforma?",
        helper:
          "Sente-se interiormente aos pés de Jesus. Não diga nada. Apenas permaneça.",
      },
      actio: {
        prompt: "O que vou viver hoje?",
        helper:
          "Escolha hoje um momento concreto de silêncio orante: 10 minutos com a Palavra, sem distrações.",
      },
    },
  },
  {
    id: "jo-15-1-8",
    reference: "João 15,1-8",
    title: "A Videira e os Ramos",
    theme: "Permanecer em Cristo",
    context:
      "Na Última Ceia, Jesus revela o mistério da união vital entre Ele e os discípulos.",
    text: `"Eu sou a verdadeira videira, e meu Pai é o agricultor. Todo ramo que, em mim, não dá fruto, ele o corta; e todo ramo que dá fruto, ele o limpa, para que dê ainda mais fruto.

Vós já estais limpos pela palavra que vos anunciei. Permanecei em mim, como eu permaneço em vós. Assim como o ramo não pode dar fruto por si mesmo, se não permanecer na videira, assim também vós, se não permanecerdes em mim.

Eu sou a videira; vós, os ramos. Quem permanece em mim, e eu nele, esse dá muito fruto, porque sem mim nada podeis fazer."`,
    steps: {
      lectio: {
        prompt: "O que o texto diz?",
        helper:
          "Repare quantas vezes aparece o verbo permanecer. Deixe a palavra ecoar.",
      },
      meditatio: {
        prompt: "O que o texto diz a mim?",
        helper:
          "Onde tenho tentado dar fruto sem permanecer? Que ramo seco há em mim?",
      },
      oratio: {
        prompt: "O que eu digo a Deus?",
        helper:
          "Peça a graça de permanecer e de aceitar a poda amorosa do Pai.",
      },
      contemplatio: {
        prompt: "Como Deus me transforma?",
        helper:
          "Imagine-se como ramo unido à videira. Sinta a seiva do Espírito.",
      },
      actio: {
        prompt: "O que vou viver hoje?",
        helper:
          "Identifique uma atividade que farei hoje unido a Cristo, em oração contínua.",
      },
    },
  },
  {
    id: "sl-23",
    reference: "Salmo 23(22)",
    title: "O Senhor é meu Pastor",
    theme: "Confiança em Deus",
    context:
      "Este salmo tão amado pela tradição cristã canta a confiança serena daquele que se sabe conduzido por Deus.",
    text: `O Senhor é o meu pastor: nada me faltará.
Em verdes prados ele me faz repousar.
Conduz-me junto às águas refrescantes
e restaura as forças de minha alma.

Pelos caminhos retos ele me leva, por amor do seu nome.
Ainda que eu caminhe por um vale tenebroso,
nenhum mal temerei, pois estás comigo;
teu bordão e teu báculo me dão segurança.

Preparas uma mesa para mim
à vista dos meus inimigos;
unges minha cabeça com óleo,
e meu cálice transborda.

Bondade e felicidade hão de seguir-me
por todos os dias de minha vida.
E habitarei na casa do Senhor
por longos, longos dias.`,
    steps: {
      lectio: {
        prompt: "O que o texto diz?",
        helper:
          "Leia o salmo duas vezes. Na segunda, repita lentamente o versículo que mais toca você.",
      },
      meditatio: {
        prompt: "O que o texto diz a mim?",
        helper:
          "Em que vale tenebroso estou hoje? Onde preciso reconhecer o cuidado do Pastor?",
      },
      oratio: {
        prompt: "O que eu digo a Deus?",
        helper:
          "Transforme o salmo em oração pessoal: nomeie suas faltas, medos e gratidões.",
      },
      contemplatio: {
        prompt: "Como Deus me transforma?",
        helper:
          "Repouse em silêncio sob o olhar do Pastor. Deixe-se conduzir.",
      },
      actio: {
        prompt: "O que vou viver hoje?",
        helper:
          "Leve consigo o versículo escolhido como mantra do dia, repetindo-o nas pausas.",
      },
    },
  },
  {
    id: "lc-15-11-32",
    reference: "Lucas 15,11-24",
    title: "O Pai Misericordioso",
    theme: "O abraço do Pai",
    context:
      "A mais bela parábola da misericórdia revela o coração de Deus que sempre espera o retorno do filho.",
    text: `Jesus disse: "Um homem tinha dois filhos. O mais jovem disse ao pai: 'Pai, dá-me a parte da herança que me cabe.' E o pai repartiu os bens entre eles.

Poucos dias depois, o filho mais jovem juntou tudo o que era seu e partiu para uma terra distante. E lá esbanjou tudo numa vida desregrada. Depois de ter gasto tudo, houve uma grande fome naquela região, e ele começou a passar necessidades.

Caindo em si, disse: 'Quantos empregados de meu pai têm pão em abundância, e eu aqui, morrendo de fome! Vou levantar-me e ir ao meu pai, e lhe direi: Pai, pequei contra o céu e contra ti.'

Levantou-se, pois, e foi ao seu pai. Quando ainda estava longe, seu pai o viu e se comoveu. Correndo, lançou-se-lhe ao pescoço e o cobriu de beijos.

O pai, porém, disse aos servos: 'Trazei depressa a melhor túnica e vesti-o; ponde-lhe um anel no dedo e sandálias nos pés. Trazei o novilho gordo e matai-o. Comamos e festejemos, porque este meu filho estava morto e tornou a viver, estava perdido e foi encontrado.'"`,
    steps: {
      lectio: {
        prompt: "O que o texto diz?",
        helper:
          "Note os gestos do pai: vê de longe, corre, abraça, beija, veste, celebra.",
      },
      meditatio: {
        prompt: "O que o texto diz a mim?",
        helper:
          "Onde estou na parábola? Saindo de casa, voltando, ou ressentido com o irmão?",
      },
      oratio: {
        prompt: "O que eu digo a Deus?",
        helper:
          "Reze com as palavras do filho: Pai, pequei. Ou apenas deixe-se abraçar em silêncio.",
      },
      contemplatio: {
        prompt: "Como Deus me transforma?",
        helper:
          "Acolha o abraço do Pai. Permaneça nele em silêncio. Esse é o seu lugar.",
      },
      actio: {
        prompt: "O que vou viver hoje?",
        helper:
          "Há alguém a quem preciso oferecer um gesto de misericórdia ou perdão hoje?",
      },
    },
  },
];

/** Retorna a passagem do dia, rotacionando pelo dia do ano. */
export function getDailyLectio(date: Date = new Date()): LectioPassage {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  const index = ((dayOfYear % LECTIO_PASSAGES.length) + LECTIO_PASSAGES.length) % LECTIO_PASSAGES.length;
  return LECTIO_PASSAGES[index];
}

export type LectioStepKey = keyof LectioPassage["steps"];

export const LECTIO_STEPS: Array<{
  key: LectioStepKey;
  label: string;
  subtitle: string;
  icon: string;
}> = [
  { key: "lectio", label: "Lectio", subtitle: "Leitura atenta", icon: "📖" },
  { key: "meditatio", label: "Meditatio", subtitle: "Meditação", icon: "💭" },
  { key: "oratio", label: "Oratio", subtitle: "Oração", icon: "🙏" },
  { key: "contemplatio", label: "Contemplatio", subtitle: "Contemplação", icon: "✨" },
  { key: "actio", label: "Actio", subtitle: "Ação concreta", icon: "🌱" },
];
