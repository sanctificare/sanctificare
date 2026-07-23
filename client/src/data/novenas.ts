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
    audioUrl: "https://pub-21852f9bf53947ed985e54ec1a2bd8a2.r2.dev/Novena%20ao%20Sagrado%20Cora%C3%A7%C3%A3o%20de%20Jesus.mp3",
  }));
}

const NOSSA_SENHORA_BOM_REMEDIO_PRAYER = `✝️ Oração Tradicional da Novena (Rezada em todos os 09 dias)

Ó Rainha do Céu e da Terra, Santíssima Virgem, nós Vos veneramos. Vós sois a Filha bem-amada do Deus Altíssimo, a eleita Mãe do Verbo Encarnado, a imaculada Esposa do Espírito Santo, o sagrado Vaso da Altíssima Trindade.

Ó Mãe do Divino Redentor, que, sob o título de Nossa Senhora do Bom Remédio, vindes em ajuda de todos os que Vos invocam, estendei a nós a vossa proteção maternal. Dependemos de Vós, ó querida Mãe, como filhos sem ajuda e necessitados dependem de mãe terna e cuidadosa.

(Rezar 1 Ave-Maria)

Nossa Senhora do Bom Remédio, fonte de ajuda infalível, permiti-nos retirar de vosso tesouro de graças, nos momentos de necessidade, tudo quanto precisarmos. Tocai os corações dos pecadores, para procurarem a reconciliação e o perdão. Confortai os aflitos e os abandonados, ajudai aos pobres e aos que perderam a esperança, amparai os enfermos e os que sofrem. Possam eles ser curados de corpo e alma, e fortalecidos no espírito para suportar seus sofrimentos com paciente resignação e fortaleza cristã. Nossa Senhora do Bom Remédio!

(Rezar 1 Ave-Maria)

Querida Senhora do Bom Remédio, fonte de ajuda infalível, vosso Coração compassivo conhece o remédio para toda aflição e miséria que encontramos na vida. Ajudai-nos, com vossas orações e intercessão, a encontrar remédio para nossos problemas e necessidades, especialmente (Apresente aqui a sua intenção particular)...

De nossa parte, ó amorosa Mãe, nós nos comprometemos a um estilo de vida mais intensamente cristão, a uma observância mais cuidadosa da Lei de Deus, a sermos mais conscientes em cumprir as obrigações do nosso estado de vida, e a esforçar-nos para sermos instrumentos de salvação neste mundo arruinado.

Querida Senhora do Bom Remédio, nós Vos pedimos que estejais sempre presente junto a nós e, por vossa intercessão, possamos gozar de saúde de corpo, de paz de espírito, e crescer na Fé e no amor ao vosso Filho, Jesus.

(Rezar 1 Ave-Maria)

– Rogai por nós, ó Santa Mãe do Bom Remédio.
– Para que possamos aprofundar nossa dedicação ao vosso Filho e reavivar o mundo com o seu Espírito.`;

function buildNossaSenhoraBomRemedioDays(): NovenaDay[] {
  const daysData = [
    {
      day: 1,
      title: "Dia 1: A Origem Histórica (1198) e o Regaço Maternal nas Necessidades",
      reflection: `🎯 Intenção do Dia: Pelo acolhimento filial e libertação das angústias espirituais e temporais.

🛡️ Virtude Guardiã: Confiança Filial e Abandono em Deus

📖 Meditação & Reflexão:

📜 História: A invocação remonta ao ano de 1198, quando São João de Matha fundou a Ordem da Santíssima Trindade (Trinitários) em Paris, com a missão divina de resgatar cristãos escravizados nas Cruzadas. Sem recursos financeiros, recorreu à Virgem Maria, nomeando-A Padroeira sob o título de "Nossa Senhora do Bom Remédio". Milagrosamente, a Santíssima Virgem providenciava as bolsas de moedas necessárias para libertar milhares de prisioneiros.

🏛️ Teologia Mariana: Maria é reconhecida como a "Mediatriz de Todas as Graças" e o "Vaso da Altíssima Trindade". Como ensina São Bernardo de Claraval, Deus quis que não recebêssemos nenhum bem que não passasse pelas mãos maternais de Maria. O título de "Bom Remédio" acentua Seu papel intercessor cujas mãos transmitem os remédios espirituais e materiais do Coração de Jesus.

📖 Bíblia (João 2, 1-11): "Faltando o vinho, a mãe de Jesus disse-lhe: 'Eles não têm mais vinho!' [...] Sua mãe disse aos serventes: 'Fazei tudo o que ele vos disser'." Nas Bodas de Caná, Maria antecipa a hora de Jesus e transforma a água da aflição no vinho transbordante da alegria divina.`,
    },
    {
      day: 2,
      title: "Dia 2: O Remédio contra a Escravidão do Pecado e Reconciliação",
      reflection: `🎯 Intenção do Dia: Pela libertação das correntes do pecado, conversão sincera do coração e frutuosa confissão sacramental.

🛡️ Virtude Guardiã: Contrição Perfeita e Arrependimento

📖 Meditação & Reflexão:

📜 História: No contexto do resgate medieval de escravos no Norte da África, a maior preocupação de São João de Matha era impedir que os cristãos aprisionados perdessem a fé católica sob tortura, caindo na escravidão espiritual. Nossa Senhora do Bom Remédio era invocada como a libertadora das almas presas no cativeiro do pecado.

🏛️ Teologia Mariana: O Catecismo da Igreja Católica ensina que o pecado é a pior das escravidões. Maria é a Refugium Peccatorum (Refúgio dos Pecadores). Ela conduz o pecador arrependido aos pés do sacerdote no Sacramento da Penitência, onde o Sangue Preciosíssimo de Seu Filho lava todas as manchas espirituais.

📖 Bíblia (Lucas 15, 17-20.24): "Caindo em si, disse o filho pródigo: 'Levantar-me-ei e irei a meu pai...' Levantou-se, pois, e foi para seu pai. Estava ainda longe, quando seu pai o viu e, movido de compaixão, correu-lhe ao encontro, abraçou-o e cobriu-o de beijos."`,
    },
    {
      day: 3,
      title: "Dia 3: O Consolo do Coração Aflito ao Pé da Cruz",
      reflection: `🎯 Intenção do Dia: Pelo alívio das dores emocionais, superação do abandono, depressão e desolação interior.

🛡️ Virtude Guardiã: Esperança Inabalável na Provação

📖 Meditação & Reflexão:

📜 História: Durante as epidemias de peste e guerras na Europa medieval, os mosteiros trinitários dedicados a Nossa Senhora do Bom Remédio transformavam-se em hospitais. A imagem da Virgem trazia esperança quando a medicina falhava, testemunhando incontáveis prodígios aos agonizantes.

🏛️ Teologia Mariana: Maria é a Mater Dolorosa e a Consolatrix Afflictorum (Consoladora dos Aflitos). Ao permanecer de pé junto à Cruz (Stabat Mater), Ela conheceu o ápice do sofrimento. Maria compreende intimamente cada lágrima e fortalece nossa fé no triunfo da Ressurreição.

📖 Bíblia (João 19, 25-27): "Junto à cruz de Jesus estavam de pé sua mãe... Jesus disse à sua mãe: 'Mulher, eis aí o teu filho'. Depois disse ao discípulo: 'Eis aí a tua mãe'." No Calvário, Maria recebeu a humanidade inteira como Seus filhos.`,
    },
    {
      day: 4,
      title: "Dia 4: Providência Divina e Auxílio aos Pobres e Endividados",
      reflection: `🎯 Intenção do Dia: Pela libertação do endividamento, providência no sustento diário, emprego digno e justiça social.

🛡️ Virtude Guardiã: Confiança na Providência e Generosidade

📖 Meditação & Reflexão:

📜 História: A Ordem dos Trinitários destinava por regra estatutária um terço de todas as suas receitas exclusivamente para o resgate dos cativos pobres sem recursos. Por isso, Nossa Senhora do Bom Remédio é venerada há mais de 800 anos como a Provedora das Causas Econômicas Desesperadas.

🏛️ Teologia Mariana: Na teologia do Magnificat, Maria canta a ação libertadora de Deus que "encheu de bens os famintos e despediu os ricos de mãos vazias" (Lc 1, 53). Como Mãe da Igreja, Nossa Senhora ensina que a verdadeira prosperidade católica está ligada à honestidade, trabalho e justiça.

📖 Bíblia (Lucas 1, 46-52): "A minha alma engrandece o Senhor... porque olhou para a humilhação de sua serva... Derrubou os poderosos de seus tronos e exaltou os humildes."`,
    },
    {
      day: 5,
      title: "Dia 5: A Cura da Enfermidade do Corpo e a Fortaleza da Alma",
      reflection: `🎯 Intenção do Dia: Pela restauração da saúde física, cura de doenças crônicas ou graves e fortaleza nos diagnósticos difíceis.

🛡️ Virtude Guardiã: Fé Operante e Paciência Cristã

📖 Meditação & Reflexão:

📜 História: Na iconografia tradicional, Nossa Senhora do Bom Remédio segura em Sua mão direita o Menino Jesus e, na esquerda, uma sacola de remédios salutares. Milhares de ex-votos nos santuários trinitários testemunham milagres de cura de doenças graves obtidas por Sua intercessão.

🏛️ Teologia Mariana: Cristo é o Supreme Medicus (Divino Médico). Maria, como Salus Infirmorum (Saúde dos Enfermos), é a Mãe que aplica o remédio salvífico de Cristo. A Igreja nos encoraja a pedir com filial confiança a cura física quando for para a glória de Deus e salvação da alma.

📖 Bíblia (Marcos 5, 27-29.34): "Ela tinha ouvido falar de Jesus... e tocou na sua veste... Jesus disse-lhe: 'Minha filha, a tua fé te salvou; vai em paz e fica curada do teu mal'."`,
    },
    {
      day: 6,
      title: "Dia 6: O Compromisso com a Vida Cristã e Observância da Lei de Deus",
      reflection: `🎯 Intenção do Dia: Pela fidelidade aos Dez Mandamentos, vivência coerente da fé e santificação do estado de vida.

🛡️ Virtude Guardiã: Coerência de Vida e Obediência à Vontade de Deus

📖 Meditação & Reflexão:

📜 História: Os cativos libertados por intercessão de Nossa Senhora do Bom Remédio faziam uma promessa solene: participar de uma procissão vestindo túnicas brancas com a cruz trinitária (vermelha e azul) e dedicar suas vidas à oração e à fidelidade aos mandamentos.

🏛️ Teologia Mariana: Como ensina São Luís Maria Grignion de Montfort e o Papa São João Paulo II (Redemptoris Mater), a verdadeira devoção mariana não consiste em sentimentalismo, mas na imitação das virtudes de Maria e na obediência ao Evangelho.

📖 Bíblia (Mateus 7, 21.24-25): "Nem todo o que me diz: 'Senhor, Senhor!' entrará no Reino dos Céus, mas aquele que faz a vontade de meu Pai... Todo aquele que ouve estas minhas palavras e as põe em prática é comparável a um homem sensato que construiu a sua casa sobre a rocha."`,
    },
    {
      day: 7,
      title: "Dia 7: A Saúde do Corpo, a Sanidade da Mente e a Paz Espiritual",
      reflection: `🎯 Intenção do Dia: Pela superação da depressão, síndrome do pânico, insônia, perturbações mentais e restauração da paz interior.

🛡️ Virtude Guardiã: Serenidade e Confiança no Senhor

📖 Meditação & Reflexão:

📜 História: Nos escritos dos Doutores da Igreja, a paz da alma é a "tranquilidade da ordem" (São Agostinho). Diante do esgotamento emocional, os fiéis recorrem a Nossa Senhora do Bom Remédio pedindo a cura das feridas da memória e traumas do passado.

🏛️ Teologia Mariana: Maria é a Regina Pacis (Rainha da Paz). Ao invocarmos a Senhora do Bom Remédio, pedimos que a luz do Espírito Santo ilumine a nossa mente, afaste pensamentos de angústia e traga o reequilíbrio interior.

📖 Bíblia (Filipenses 4, 6-7): "Não vos inquieteis com coisa alguma, mas apresentai as vossas necessidades a Deus em todas as ocasiões... E a paz de Deus, que excede todo o entendimento, guardará os vossos corações e as vossas mentes em Cristo Jesus."`,
    },
    {
      day: 8,
      title: "Dia 8: Ser Instrumentos de Salvação e Misericórdia no Mundo",
      reflection: `🎯 Intenção do Dia: Pelo zelo apostólico, prática das obras de misericórdia corporais e espirituais e caridade fraterna.

🛡️ Virtude Guardiã: Caridade Missionária e Zelo Pelas Almas

📖 Meditação & Reflexão:

📜 História: Os religiosos trinitários não apenas resgatavam cativos, mas fundavam albergues, lares e escolas para acolher os libertados. Ao rezar a novena, somos chamados a ser as mãos estendidas de Maria no mundo.

🏛️ Teologia Mariana: A Constituição Dogmática Lumen Gentium (cap. VIII) ensina que Maria é o modelo perfeito da Igreja na caridade. Quem recebe o "Bom Remédio" da graça não pode retê-lo para si; torna-se remédio para os irmãos através das Obras de Misericórdia.

📖 Bíblia (Mateus 5, 14-16): "Vós sois a luz do mundo. Não se pode esconder uma cidade situada sobre um monte... Assim brilhe a vossa luz diante dos homens, para que vejam as vossas boas obras e glorifiquem o vosso Pai que está nos céus."`,
    },
    {
      day: 9,
      title: "Dia 9: Reavivar o Mundo no Espírito de Cristo, Gratidão e Perseverança",
      reflection: `🎯 Intenção do Dia: Ação de graças pelas graças recebidas, perseverança final na Fé e coroação do compromisso espiritual.

🛡️ Virtude Guardiã: Perseverança Final e Gratidão Adoradora

📖 Meditação & Reflexão:

📜 História: No encerramento da festa litúrgica (8 de Outubro), a Ordem Trinitária entoava o solene Te Deum e consagrava todos os libertados ao Imaculado Coração de Maria. Há mais de 8 séculos, esta novena é refúgio de fiéis no mundo todo.

🏛️ Teologia Mariana: O objetivo de toda devoção mariana é levar a Cristo. Maria é a Odigitria (A que mostra o Caminho). No final da Novena, colocamos aos pés de Nossa Senhora do Bom Remédio o compromisso de perseverar na vida sacramental e na fidelidade à Igreja.

📖 Bíblia (Apocalipse 12, 1 / Colossenses 3, 15.17): "Apareceu no céu um grande sinal: uma Mulher vestida de sol, com a lua debaixo dos pés e uma coroa de doze estrelas na cabeça... E a paz de Cristo domine em vossos corações... dando por ele graças a Deus Pai."`,
    },
  ];

  return daysData.map((d) => ({
    day: d.day,
    title: d.title,
    reflection: d.reflection,
    prayer: NOSSA_SENHORA_BOM_REMEDIO_PRAYER,
    audioUrl: "https://pub-21852f9bf53947ed985e54ec1a2bd8a2.r2.dev/Novena%20a%20Nossa%20Senhora%20do%20Bom%20Rem%C3%A9dio.mp3",
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
    id: "novena-nossa-senhora-bom-remedio",
    slug: "novena-a-nossa-senhora-do-bom-remedio",
    name: "Novena a Nossa Senhora do Bom Remédio",
    subtitle: "Fonte de Ajuda Infalível e Libertação",
    description:
      "Nove dias de oração, reflexão e libertação sob a proteção maternal da Virgem Trinitária, Padroeira das causas desesperadas e libertadora dos cativos.",
    icon: "👑",
    category: "basic",
    duration: "9 dias",
    days: buildNossaSenhoraBomRemedioDays(),
  },
];

export function getNovenaBySlug(slug: string): Novena | undefined {
  return NOVENAS.find((novena) => novena.slug === slug);
}

export function getNovenaPath(novena: Novena): string {
  return `/novenas/${novena.slug}`;
}
