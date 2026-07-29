import { useAuth } from "@/_core/hooks/useAuth";
import { isMobileApp } from "@/const";
import { Button } from "@/components/ui/button";
import LoadingOverlay from "@/components/ui/LoadingOverlay";
import { useState, useEffect, useRef, useMemo } from "react";
import { Link, useLocation } from "wouter";
import {
  BookOpen, Users, Crown, Star, Shield, Calendar, ArrowRight,
  Sparkles, Check, Volume2, Search, Flame, Heart as HeartLucide,
  ChevronDown, ChevronUp, Play, Pause, X, MessageSquare, Sun, Moon,
  Crosshair, Radio, HelpCircle
} from "lucide-react";
import { PrayingHandsIcon } from "@/components/PrayingHandsIcon";
import { Cross } from "@/components/CrossIcon";
import { RosaryIcon } from "@/components/RosaryIcon";
import { Heart } from "@/components/HeartIcon";
import { LiturgyIcon } from "@/components/LiturgyIcon";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const HERO_IMG = "/assets/sanctificare-hero.webp";
const LOGO_IMG = "/assets/sanctificare-logo-v2.webp";
const ROSARY_IMG = "/assets/sanctificare-rosary.webp";

// --- Dados de Novenas com Oração do Dia 1 para Degustação ---

interface FeaturedNovena {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  description: string;
  icon: string;
  badge: string;
  category: "basic" | "premium";
  day1Title: string;
  day1Reflection: string;
  day1Prayer: string;
}

const FEATURED_NOVENAS: FeaturedNovena[] = [
  {
    id: "novena-desatadora-nos",
    slug: "novena-a-nossa-senhora-desatadora-dos-nos",
    name: "Novena a N. S. Desatadora dos Nós",
    subtitle: "Desfaça os nós da sua vida e encontre a paz",
    description: "Invocação poderosa para desatar os nós do desespero, problemas familiares, angústias e dificuldades financeiras.",
    icon: "⚓",
    badge: "Mais Rezada",
    category: "basic",
    day1Title: "Dia 1: A Mãe que Desata o Nó da Ansiedade e das Tribulações",
    day1Reflection: "Santa Maria, cheia da presença de Deus, durante a tua vida aceitaste com toda a humildade a vontade do Pai e o maligno nunca foi capaz de te envolver com as suas confusões. Junto do teu Filho, intercedeste pelas nossas dificuldades e, com toda a paciência e simplicidade, nos deste exemplo de como desatar os nós da nossa vida.",
    day1Prayer: `Ó Maria, Mãe Desatadora dos Nós, eu me coloco hoje diante de ti.
Tua sabedoria maternal e teu amor incondicional são para mim refúgio e consolo.
Mãe amada, acolhe em tuas mãos o nó que sufoca o meu coração (apresente aqui sua intenção)...
Eu sei que tu nunca desamparas um filho que a ti recorre. Desata, ó Mãe, este nó pela força da tua intercessão junto a Jesus!
Por Cristo, nosso Senhor. Amém.

(Rezar 1 Pai-Nosso, 1 Ave-Maria e 1 Glória ao Pai)`
  },
  {
    id: "novena-sao-miguel",
    slug: "novena-a-sao-miguel-arcanjo",
    name: "Novena a São Miguel Arcanjo",
    subtitle: "Proteção Espiritual e Combate da Fé",
    description: "Nove dias de quaresma e oração invocando o Príncipe da Milícia Celeste para defender sua família e alma contra todo mal.",
    icon: "⚔️",
    badge: "Proteção",
    category: "basic",
    day1Title: "Dia 1: Proteção Contra as Ciladas do Maligno e Força na Fé",
    day1Reflection: "São Miguel Arcanjo é o grande defensor da glória de Deus e o protetor da Igreja. Ao clamar por São Miguel no primeiro dia da novena, pedimos a coragem necessária para vencer as tentações diárias e manter a fidelidade aos mandamentos divinos.",
    day1Prayer: `São Miguel Arcanjo, defendei-nos no combate, sede o nosso refúgio contra as maldades e ciladas do demônio.
Ordene-lhe Deus, instantemente o pedimos, e vós, príncipe da milícia celeste, pela virtude divina, precipitai no inferno a Satanás e aos outros espíritos malignos, que vagam pelo mundo para a perdição das almas.
Vem em meu auxílio, ó glorioso Arcanjo, e alcançai-me de Deus a graça de ser vitorioso nas minhas lutas espirituais. Amém.

(Rezar 1 Pai-Nosso, 3 Ave-Marias em honra às nove coros dos anjos)`
  },
  {
    id: "novena-santa-teresinha",
    slug: "novena-das-rosas-de-santa-teresinha",
    name: "Novena das Rosas de Santa Teresinha",
    subtitle: "Chuva de Rosas e Graças do Céu",
    description: "Pedindo a intercessão da Doutora da Igreja que prometeu passar o seu Céu fazendo o bem sobre a terra.",
    icon: "🌹",
    badge: "Devocional",
    category: "basic",
    day1Title: "Dia 1: A Pequena Via do Amor e da Confiança Filial",
    day1Reflection: "Santa Teresinha ensina-nos que a santidade não consiste em fazer grandes obras, mas em fazer as pequenas coisas com um amor infinito a Deus. No primeiro dia, pedimos a simplicidade de um coração de criança.",
    day1Prayer: `Santíssima Trindade, Pai, Filho e Espírito Santo, eu vos agradeço por todos os favores e graças com que enriquecestes a alma de vossa serva Santa Teresinha do Menino Jesus durante os 24 anos que passou na terra.
Pelos méritos de tão querida Santinha, concedei-me a graça que ardentemente vos peço (faça o seu pedido)... se for para vossa maior glória e salvação da minha alma.
Santa Teresinha, lembrai-vos da vossa promessa de fazer cair uma chuva de rosas sobre a terra e alcançai-me esta graça. Amém.`
  },
  {
    id: "novena-sagrado-coracao",
    slug: "novena-ao-sagrado-coracao-de-jesus",
    name: "Novena ao Sagrado Coração de Jesus",
    subtitle: "Doce Coração de Jesus, sede o meu amor",
    description: "Nove dias de profunda contemplação do amor misericordioso de Cristo e reparação ao Seu Divino Coração.",
    icon: "❤️",
    badge: "Tradicional",
    category: "basic",
    day1Title: "Dia 1: Coração de Jesus, Templo da Santíssima Trindade",
    day1Reflection: "O Coração de Jesus é o refúgio inexpugnável onde encontramos a paz verdadeira. No primeiro dia, contemplamos a mansidão do Salvador que nos convida: 'Vinde a mim todos vós que estais cansados e oprimidos, e eu vos aliviarei'.",
    day1Prayer: `Lembrai-vos, ó dulcíssimo Jesus, que nunca se ouviu dizer que alguém, recorrendo com confiança ao vosso Sagrado Coração, fosse por vós abandonado.
Possuído da mesma confiança, recorro a vós e me prostro diante de vossa divina majestade.
Meu Jesus, pelo vosso precioso Sangue e pelo amor do vosso Coração, ouvi favoravelmente as minhas preces e atendei o meu pedido nesta novena. Amém.

(Rezar 1 Pai-Nosso, 1 Ave-Maria e 1 Glória ao Pai)`
  },
  {
    id: "novena-sao-jose",
    slug: "novena-a-sao-jose",
    name: "Novena a São José",
    subtitle: "Patrono da Igreja e Provedor das Famílias",
    description: "Invocação ao Castíssimo Esposo de Maria e Pai Adotivo de Jesus para obter trabalho, amparo familiar e boa morte.",
    icon: "🪵",
    badge: "Família & Trabalho",
    category: "basic",
    day1Title: "Dia 1: São José, Homem Justo e Fiel Acolhedor dos Desígnios de Deus",
    day1Reflection: "São José é o modelo dos homens de fé e silêncio. Sem proferir uma única palavra nas Escrituras, agiu sempre com obediência pronta para proteger a Sagrada Família de Nazaré.",
    day1Prayer: `Ó glorioso São José, a quem foi dado o privilégio de ser o guardião do Filho de Deus e da Virgem Maria, a vós me dirijo com filial confiança.
Alcançai-me de Deus a graça da justiça, do trabalho digno e da paz em minha família.
Amparai-me nesta necessidade particular (coloque a sua intenção)... vós que sois o Terror dos Demônios e o Provedor dos necessitados. Amém.`
  },
  {
    id: "novena-nossa-senhora-bom-remedio",
    slug: "novena-a-nossa-senhora-do-bom-remedio",
    name: "Novena a N. S. do Bom Remédio",
    subtitle: "Fonte de Ajuda Infalível e Libertação dos Cativos",
    description: "Tradicional novena marianotrinitária para libertação de vícios, angústias financeiras e causas aflitivas.",
    icon: "👑",
    badge: "Libertação",
    category: "basic",
    day1Title: "Dia 1: A Origem Histórica e o Regaço Maternal nas Necessidades",
    day1Reflection: "A invocação a Nossa Senhora do Bom Remédio remonta ao ano de 1198. A Santíssima Virgem providenciava os recursos e a libertação para os cativos e aflitos que a Ela recorriam.",
    day1Prayer: `Ó Rainha do Céu e da Terra, Santíssima Virgem, nós vos veneramos! Vós sois a eleita Mãe do Verbo Encarnado e a Imaculada Esposa do Espírito Santo.
Nossa Senhora do Bom Remédio, fonte de ajuda infalível, atendei as nossas angústias e trazei o remédio divino para nossa alma e corpo. Amém.`
  }
];

// --- Catálogo de Orações para Degustação ---

interface LandingPrayer {
  id: string;
  name: string;
  category: "manha" | "noite" | "protecao" | "marianas" | "santos" | "latim" | "misericordia";
  categoryLabel: string;
  duration: string;
  icon: string;
  desc: string;
  content: string;
}

const LANDING_PRAYERS: LandingPrayer[] = [
  {
    id: "pai-nosso",
    name: "Pai Nosso",
    category: "manha",
    categoryLabel: "Fundamentais",
    duration: "1 min",
    icon: "🙏",
    desc: "A oração perfeita ensinada pelo próprio Nosso Senhor Jesus Cristo.",
    content: `Pai nosso que estais nos céus, santificado seja o vosso nome, venha a nós o vosso reino, seja feita a vossa vontade, assim na terra como no céu.

O pão nosso de cada dia nos dai hoje, perdoai-nos as nossas ofensas, assim como nós perdoamos a quem nos tem ofendido, e não nos deixeis cair em tentação, mas livrai-nos do mal. Amém.`
  },
  {
    id: "ave-maria",
    name: "Ave Maria",
    category: "marianas",
    categoryLabel: "Marianas",
    duration: "1 min",
    icon: "🌹",
    desc: "A saudação angélica do Arcanjo Gabriel e Isabel à Mãe de Deus.",
    content: `Ave Maria, cheia de graça, o Senhor é convosco, bendita sois vós entre as mulheres e bendito é o fruto do vosso ventre, Jesus.

Santa Maria, Mãe de Deus, rogai por nós pecadores, agora e na hora da nossa morte. Amém.`
  },
  {
    id: "oracao-sao-miguel",
    name: "Oração a São Miguel Arcanjo",
    category: "protecao",
    categoryLabel: "Proteção",
    duration: "2 min",
    icon: "⚔️",
    desc: "Oração composta pelo Papa Leão XIII para combate e proteção espiritual.",
    content: `São Miguel Arcanjo, defendei-nos no combate, sede o nosso refúgio contra as maldades e ciladas do demônio.

Ordene-lhe Deus, instantemente o pedimos, e vós, príncipe da milícia celeste, pela virtude divina, precipitai no inferno a Satanás e aos outros espíritos malignos, que vagam pelo mundo para a perdição das almas. Amém.`
  },
  {
    id: "salve-rainha",
    name: "Salve Rainha",
    category: "marianas",
    categoryLabel: "Marianas",
    duration: "2 min",
    icon: "👑",
    desc: "Antiga antífona mariana de profunda piedade e súplica filial.",
    content: `Salve Rainha, Mãe de misericórdia, vida, doçura e esperança nossa, salve! A vós bradamos, os degredados filhos de Eva. A vós suspiramos, gemendo e chorando neste vale de lágrimas.

Eia, pois, advogada nossa, esses vossos olhos misericordiosos a nós volvei. E depois deste desterro, mostrai-nos Jesus, bendito fruto do vosso ventre. Ó clemente, ó piedosa, ó doce sempre Virgem Maria!

Rogai por nós, Santa Mãe de Deus, para que sejamos dignos das promessas de Cristo. Amém.`
  },
  {
    id: "santo-anjo",
    name: "Santo Anjo do Senhor",
    category: "noite",
    categoryLabel: "Oração da Noite",
    duration: "1 min",
    icon: "👼",
    desc: "Oração tradicional ao nosso Anjo da Guarda para proteção noturna e diária.",
    content: `Santo Anjo do Senhor, meu zeloso guardador, se a ti me confiou a piedade divina, sempre me rege, me guarde, me governe e me ilumine. Amém.`
  },
  {
    id: "terco-misericordia",
    name: "Terço da Divina Misericórdia",
    category: "misericordia",
    categoryLabel: "Misericórdia",
    duration: "10 min",
    icon: "💧",
    desc: "Devoção revelada por Jesus a Santa Faustina para alcançar a misericórdia divina.",
    content: `Início: Pai Nosso, Ave Maria e Credo.

Nas contas grandes do Rosário:
"Eterno Pai, eu vos ofereço o Corpo e Sangue, Alma e Divindade de vosso diletíssimo Filho, Nosso Senhor Jesus Cristo, em expiação dos nossos pecados e dos do mundo inteiro."

Nas 10 contas pequenas:
"Pela Sua dolorosa Paixão, tende misericórdia de nós e do mundo inteiro."

Ao final (3 vezes):
"Deus Santo, Deus Forte, Deus Imortal, tende piedade de nós e do mundo inteiro." Amém.`
  },
  {
    id: "oracao-sao-bento",
    name: "Oração da Medalha de São Bento",
    category: "protecao",
    categoryLabel: "Proteção",
    duration: "2 min",
    icon: "🛡️",
    desc: "Invocação de exorcismo e proteção contra as forças do mal.",
    content: `A Cruz Sagrada seja a minha luz, não seja o dragão o meu guia.
Retira-te, Satanás! Nunca me aconselhes coisas vãs.
É mau o que me ofereces, bebe tu mesmo os teus venenos!
Em nome do Pai, do Filho e do Espírito Santo. Amém.`
  },
  {
    id: "anima-christi",
    name: "Anima Christi (Alma de Cristo)",
    category: "latim",
    categoryLabel: "Oração em Latim",
    duration: "2 min",
    icon: "🍷",
    desc: "Sublime oração pós-comunhão atribuída a Santo Inácio de Loyola.",
    content: `Anima Christi, sanctifica me.
Corpus Christi, salva me.
Sanguis Christi, inebria me.
Aqua lateris Christi, lava me.
Passio Christi, conforta me.
O bone Iesu, exaudi me.
Intra tua vulnera absconde me.
Ne permittas me separari a te.
Ab hoste maligno defende me.
In hora mortis meae voca me.
Et iube me venire ad te,
ut cum Sanctis tuis laudem te
in saecula saeculorum. Amen.`
  }
];

// --- Mural de Intenções Comunitário para Degustação ---

const COMMUNITY_INTENTIONS = [
  { id: 1, author: "Maria S.", city: "São Paulo, SP", text: "Pela restauração da minha família e pela cura da minha mãe.", count: 142 },
  { id: 2, author: "João Pedro", city: "Belo Horizonte, MG", text: "Em ação de graças por uma graça alcançada no trabalho e discernimento vocacional.", count: 89 },
  { id: 3, author: "Ana Clara", city: "Curitiba, PR", text: "Pedindo a intercessão de N. S. Desatadora dos Nós pela libertação das minhas dívidas.", count: 215 },
  { id: 4, author: "Pe. Carlos", city: "Rio de Janeiro, RJ", text: "Pelas vocações sacerdotais e religiosas da nossa Santa Igreja Católica.", count: 310 }
];

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Estados dos Modais de Degustação
  const [selectedNovena, setSelectedNovena] = useState<FeaturedNovena | null>(null);
  const [selectedPrayer, setSelectedPrayer] = useState<LandingPrayer | null>(null);
  const [isCandleLit, setIsCandleLit] = useState(false);
  const [candleIntent, setCandleIntent] = useState("");
  const [showCandleModal, setShowCandleModal] = useState(false);

  // Busca e Filtros de Orações
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");

  // Estado das intenções comunitárias (para o botão Rezar Junto)
  const [intentions, setIntentions] = useState(COMMUNITY_INTENTIONS);
  const [prayedIntentIds, setPrayedIntentIds] = useState<number[]>([]);

  useEffect(() => {
    if (loading) return;
    if (isAuthenticated) {
      navigate("/dashboard");
    } else if (isMobileApp()) {
      if (!sessionStorage.getItem('__cap_app_started')) {
        sessionStorage.setItem('__cap_app_started', '1');
        navigate("/login");
      }
    }
  }, [isAuthenticated, loading, navigate]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Determinar o Mistério do Rosário de Hoje
  const todayMystery = useMemo(() => {
    const day = new Date().getDay(); // 0 = Dom, 1 = Seg, 3 = Qua...
    switch (day) {
      case 1:
      case 6:
        return { name: "Mistérios Gozosos", desc: "Anunciação, Visitação, Nascimento, Apresentação e Encontro no Templo" };
      case 2:
      case 5:
        return { name: "Mistérios Dolorosos", desc: "Agonia no Horto, Flagelação, Coroação de Espinhos, Caminho do Calvário e Crucificação" };
      case 3:
      case 0:
        return { name: "Mistérios Gloriosos", desc: "Ressurreição, Ascensão, Vinda do Espírito Santo, Assunção e Coroação de Maria" };
      case 4:
        return { name: "Mistérios Luminosos", desc: "Batismo no Jordão, Bodas de Caná, Anúncio do Reino, Transfiguração e Instituição da Eucaristia" };
      default:
        return { name: "Mistérios Gloriosos", desc: "Ressurreição e Glória de Cristo" };
    }
  }, []);

  // Filtragem de Orações
  const filteredPrayers = useMemo(() => {
    return LANDING_PRAYERS.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            p.desc.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === "all" || p.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  const handlePrayTogether = (id: number) => {
    if (prayedIntentIds.includes(id)) return;
    setPrayedIntentIds([...prayedIntentIds, id]);
    setIntentions(intentions.map(item => item.id === id ? { ...item, count: item.count + 1 } : item));
  };

  const handleLightCandleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsCandleLit(true);
    setTimeout(() => {
      setShowCandleModal(false);
    }, 2000);
  };

  if (isAuthenticated || (!isMobileApp() && loading)) {
    return null;
  }

  if (
    isMobileApp() &&
    (loading || (!sessionStorage.getItem('__cap_app_started') && !isAuthenticated))
  ) {
    return <LoadingOverlay message="Inicializando o app..." />;
  }

  return (
    <div className="min-h-screen bg-[oklch(0.12_0.04_260)] text-white selection:bg-[oklch(0.75_0.12_75/0.3)] selection:text-white">
      
      {/* Sticky Header Navbar */}
      <nav 
        className={`sticky top-0 z-50 transition-all duration-300 border-b ${
          isScrolled 
            ? "bg-[oklch(0.18_0.06_260/0.92)] backdrop-blur-md border-[oklch(0.75_0.12_75/0.25)] shadow-lg py-3" 
            : "bg-[oklch(0.15_0.05_260)] border-[oklch(0.75_0.12_75/0.15)] py-4"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={LOGO_IMG} alt="Sanctificare Logo" className="w-9 h-9 object-contain drop-shadow-[0_0_8px_oklch(0.75_0.12_75/0.6)]" />
              <span className="font-display text-xl font-bold text-[oklch(0.88_0.08_80)] tracking-wide">
                Sanctificare
              </span>
            </div>
            
            <div className="hidden lg:flex items-center gap-6 text-sm text-[oklch(0.85_0.02_260)] font-medium">
              <a href="#novenas" className="hover:text-[oklch(0.88_0.08_80)] transition-colors">Novenas</a>
              <a href="#oracoes" className="hover:text-[oklch(0.88_0.08_80)] transition-colors">Orações</a>
              <a href="#rosario" className="hover:text-[oklch(0.88_0.08_80)] transition-colors">Santo Rosário</a>
              <a href="#vela-virtual" className="hover:text-[oklch(0.88_0.08_80)] transition-colors">Vela Virtual</a>
              <a href="#planos" className="hover:text-[oklch(0.88_0.08_80)] transition-colors">Planos</a>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/login?tab=entrar" className="text-xs sm:text-sm font-semibold text-[oklch(0.85_0.02_260)] hover:text-white transition-colors">
                Entrar
              </Link>
              <Link href="/login?tab=cadastrar">
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-[oklch(0.75_0.12_75)] to-[oklch(0.68_0.14_70)] hover:from-[oklch(0.70_0.13_73)] hover:to-[oklch(0.63_0.14_68)] text-[oklch(0.12_0.04_260)] font-bold px-4 py-2 shadow-gold rounded-lg transition-all hover:scale-[1.03]"
                >
                  Criar Conta
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION: PORTAL VIVO DE ORAÇÃO --- */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden py-16 bg-[oklch(0.15_0.05_260)]">
        {/* Background Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-30"
          style={{ backgroundImage: `url(${HERO_IMG})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[oklch(0.15_0.05_260/0.8)] via-[oklch(0.13_0.04_260/0.95)] to-[oklch(0.12_0.04_260)]" />

        {/* Glow Orbs */}
        <div className="absolute w-[500px] h-[500px] bg-[oklch(0.75_0.12_75/0.12)] rounded-full blur-3xl top-10 -left-20 pointer-events-none" />
        <div className="absolute w-[450px] h-[450px] bg-[oklch(0.40_0.12_200/0.15)] rounded-full blur-3xl bottom-10 -right-20 pointer-events-none" />

        <div className="relative container mx-auto px-4 z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Texto Hero */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 bg-[oklch(0.75_0.12_75/0.12)] border border-[oklch(0.75_0.12_75/0.3)] rounded-full px-4 py-1.5 shadow-sm">
                <Cross size={14} className="text-[oklch(0.85_0.10_80)]" />
                <span className="text-[oklch(0.88_0.08_80)] text-xs font-display tracking-wider uppercase font-semibold">
                  Seu Santuário de Recolhimento e Devoção
                </span>
              </div>

              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-white">
                Eleve o seu Coração <br className="hidden sm:inline" />
                ao Altíssimo na <span className="text-transparent bg-clip-text bg-gradient-to-r from-[oklch(0.88_0.08_80)] to-[oklch(0.75_0.12_75)]">Oração</span>
              </h1>

              <div className="border-l-4 border-[oklch(0.75_0.12_75)] pl-4 py-2 bg-[oklch(0.75_0.12_75/0.05)] rounded-r-xl max-w-xl">
                <p className="font-serif italic text-lg text-[oklch(0.88_0.02_260)] leading-relaxed">
                  "Sede santos, porque eu, o Senhor vosso Deus, sou santo."
                </p>
                <span className="text-xs font-sans font-bold tracking-wider text-[oklch(0.85_0.10_80)] block mt-1 uppercase">Lv 19, 2</span>
              </div>

              <p className="text-base text-[oklch(0.78_0.02_260)] max-w-xl leading-relaxed">
                Acesse novenas, o Santo Rosário, orações diárias e a Liturgia da Igreja. Reze agora mesmo e leve a vida de oração para o seu dia a dia.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                <Link href="/login?tab=cadastrar" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-gradient-to-r from-[oklch(0.75_0.12_75)] to-[oklch(0.68_0.14_70)] text-[oklch(0.12_0.04_260)] font-bold text-base px-8 py-6 rounded-xl shadow-gold hover:scale-[1.03] transition-all"
                  >
                    Iniciar Minha Caminhada Grátis
                  </Button>
                </Link>

                <a href="#novenas" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto border-[oklch(0.75_0.12_75/0.4)] text-[oklch(0.88_0.08_80)] hover:bg-[oklch(0.75_0.12_75/0.1)] px-6 py-6 rounded-xl font-semibold"
                  >
                    Explorar Novenas & Orações
                  </Button>
                </a>
              </div>
            </div>

            {/* Widget "A Igreja Hoje" / Liturgia do Dia */}
            <div className="lg:col-span-5">
              <div className="bg-[oklch(0.18_0.06_260/0.9)] backdrop-blur-xl border border-[oklch(0.75_0.12_75/0.3)] rounded-2xl p-6 shadow-2xl space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[oklch(0.75_0.12_75/0.08)] rounded-full blur-2xl pointer-events-none" />

                <div className="flex items-center justify-between border-b border-[oklch(0.75_0.12_75/0.15)] pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[oklch(0.75_0.12_75/0.15)] flex items-center justify-center text-[oklch(0.85_0.10_80)]">
                      <LiturgyIcon size={20} />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-white text-base">A Igreja Hoje</h3>
                      <p className="text-xs text-[oklch(0.75_0.02_260)] capitalize">
                        {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-[oklch(0.75_0.12_75/0.2)] text-[oklch(0.88_0.08_80)] border-[oklch(0.75_0.12_75/0.3)] font-sans">
                    Tempo Comum
                  </Badge>
                </div>

                {/* Card de Mistério do Dia */}
                <div className="bg-[oklch(0.14_0.04_260)] rounded-xl p-4 border border-white/5 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[oklch(0.85_0.10_80)] uppercase tracking-wider">
                    <RosaryIcon size={14} />
                    <span>Rosário de Hoje</span>
                  </div>
                  <h4 className="font-display font-bold text-lg text-white">{todayMystery.name}</h4>
                  <p className="text-xs text-[oklch(0.75_0.02_260)] leading-relaxed">
                    {todayMystery.desc}
                  </p>
                  <Link href="/login?tab=cadastrar&path=/rosario">
                    <button className="text-xs font-bold text-[oklch(0.85_0.10_80)] hover:underline inline-flex items-center gap-1 mt-2">
                      Rezar Santo Rosário <ArrowRight size={12} />
                    </button>
                  </Link>
                </div>

                {/* Evangelho de Hoje */}
                <div className="bg-[oklch(0.14_0.04_260)] rounded-xl p-4 border border-white/5 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[oklch(0.65_0.14_70)] uppercase tracking-wider">
                    <BookOpen size={14} />
                    <span>Evangelho do Dia</span>
                  </div>
                  <p className="text-xs font-serif italic text-[oklch(0.85_0.02_260)] leading-relaxed">
                    "Vós sois o sal da terra e a luz do mundo. Assim brilhe a vossa luz diante dos homens..."
                  </p>
                  <Link href="/login?tab=cadastrar&path=/liturgia">
                    <button className="text-xs font-bold text-[oklch(0.75_0.12_75)] hover:underline inline-flex items-center gap-1 mt-1">
                      Ler Liturgia Completa <ArrowRight size={12} />
                    </button>
                  </Link>
                </div>

                <div className="pt-2 text-center">
                  <span className="text-[11px] text-[oklch(0.65_0.02_260)]">
                    Acesso 100% gratuito à Liturgia diária da Santa Igreja.
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* --- SEÇÃO 2: HUB DE NOVENAS (DEGUSTAÇÃO DO DIA 1) --- */}
      <section id="novenas" className="py-20 bg-[oklch(0.13_0.04_260)] border-t border-[oklch(0.75_0.12_75/0.1)]">
        <div className="container mx-auto px-4">
          
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <Badge className="bg-[oklch(0.75_0.12_75/0.15)] text-[oklch(0.88_0.08_80)] border-[oklch(0.75_0.12_75/0.3)]">
              Devocionários & Novenas
            </Badge>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white">
              Novenas Tradicionais da Igreja
            </h2>
            <p className="text-sm sm:text-base text-[oklch(0.75_0.02_260)] leading-relaxed">
              Clique em qualquer novena para rezar o <strong>Dia 1</strong> imediatamente na landing page. Salve o seu progresso do Dia 1 ao Dia 9 criando sua conta.
            </p>
          </div>

          {/* Grid de Cards de Novena */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURED_NOVENAS.map((novena) => (
              <div 
                key={novena.id}
                className="bg-[oklch(0.17_0.05_260)] hover:bg-[oklch(0.19_0.06_260)] border border-[oklch(0.75_0.12_75/0.2)] rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:border-[oklch(0.75_0.12_75/0.5)] flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl">{novena.icon}</span>
                    <Badge variant="outline" className="border-[oklch(0.75_0.12_75/0.3)] text-[oklch(0.88_0.08_80)] text-[10px]">
                      {novena.badge}
                    </Badge>
                  </div>

                  <div>
                    <h3 className="font-display font-bold text-lg text-white group-hover:text-[oklch(0.88_0.08_80)] transition-colors">
                      {novena.name}
                    </h3>
                    <p className="text-xs font-medium text-[oklch(0.75_0.12_75)] mt-0.5">
                      {novena.subtitle}
                    </p>
                  </div>

                  <p className="text-xs text-[oklch(0.75_0.02_260)] line-clamp-3 leading-relaxed">
                    {novena.description}
                  </p>
                </div>

                <div className="pt-6 border-t border-[oklch(0.75_0.12_75/0.1)] mt-6 flex items-center justify-between gap-3">
                  <span className="text-[11px] text-[oklch(0.65_0.02_260)] font-sans">9 Dias • Texto & Áudio</span>
                  <Button
                    size="sm"
                    onClick={() => setSelectedNovena(novena)}
                    className="bg-[oklch(0.75_0.12_75)] hover:bg-[oklch(0.70_0.13_73)] text-[oklch(0.12_0.04_260)] font-bold text-xs px-4 py-2 rounded-lg transition-all"
                  >
                    Rezar Dia 1
                  </Button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* --- SEÇÃO 3: BIBLIOTECA DE ORAÇÕES (BUSCA & FILTROS) --- */}
      <section id="oracoes" className="py-20 bg-[oklch(0.15_0.05_260)]">
        <div className="container mx-auto px-4">
          
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
            <Badge className="bg-[oklch(0.75_0.12_75/0.15)] text-[oklch(0.88_0.08_80)] border-[oklch(0.75_0.12_75/0.3)]">
              Biblioteca de Orações
            </Badge>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white">
              Orações Tradicionais da Santa Igreja
            </h2>
            <p className="text-sm text-[oklch(0.75_0.02_260)]">
              Pesquise ou selecione uma categoria para rezar diretamente na tela.
            </p>
          </div>

          {/* Barra de Busca & Categorias */}
          <div className="max-w-3xl mx-auto mb-10 space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-3.5 text-[oklch(0.65_0.02_260)]" size={18} />
              <Input
                type="text"
                placeholder="Buscar oração (ex: Pai Nosso, São Miguel, Salve Rainha...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[oklch(0.18_0.06_260)] border-[oklch(0.75_0.12_75/0.25)] text-white pl-11 py-3 rounded-xl focus:border-[oklch(0.75_0.12_75)] placeholder:text-[oklch(0.55_0.02_260)] text-sm"
              />
            </div>

            {/* Chips de Categorias */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none justify-start sm:justify-center">
              {[
                { id: "all", label: "Todas" },
                { id: "manha", label: "Manhã" },
                { id: "noite", label: "Noite" },
                { id: "protecao", label: "Proteção" },
                { id: "marianas", label: "Marianas" },
                { id: "misericordia", label: "Misericórdia" },
                { id: "latim", label: "Latim" },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    activeCategory === cat.id
                      ? "bg-[oklch(0.75_0.12_75)] text-[oklch(0.12_0.04_260)] font-bold shadow-gold"
                      : "bg-[oklch(0.18_0.06_260)] text-[oklch(0.75_0.02_260)] hover:text-white hover:bg-[oklch(0.22_0.07_260)]"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Grid de Cards de Orações */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {filteredPrayers.map((prayer) => (
              <div 
                key={prayer.id}
                onClick={() => setSelectedPrayer(prayer)}
                className="bg-[oklch(0.18_0.06_260)] hover:bg-[oklch(0.21_0.07_260)] border border-[oklch(0.75_0.12_75/0.15)] hover:border-[oklch(0.75_0.12_75/0.4)] rounded-xl p-5 cursor-pointer transition-all duration-300 group flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{prayer.icon}</span>
                    <span className="text-[10px] text-[oklch(0.65_0.02_260)] font-sans">{prayer.duration}</span>
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-white text-base group-hover:text-[oklch(0.88_0.08_80)] transition-colors">
                      {prayer.name}
                    </h4>
                    <p className="text-xs text-[oklch(0.75_0.02_260)] line-clamp-2 mt-1">
                      {prayer.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-[oklch(0.75_0.12_75/0.1)] mt-4 flex items-center justify-between text-xs font-bold text-[oklch(0.75_0.12_75)]">
                  <span>Rezar Agora</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* --- SEÇÃO 4: SANTO ROSÁRIO INTERATIVO & TERÇOS GUIADOS --- */}
      <section id="rosario" className="py-20 bg-[oklch(0.13_0.04_260)] border-t border-[oklch(0.75_0.12_75/0.1)] relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-6 space-y-6">
              <Badge className="bg-[oklch(0.75_0.12_75/0.15)] text-[oklch(0.88_0.08_80)] border-[oklch(0.75_0.12_75/0.3)]">
                Oração Contemplativa
              </Badge>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-white leading-tight">
                Santo Rosário Guiado Passo a Passo
              </h2>
              <p className="text-sm sm:text-base text-[oklch(0.78_0.02_260)] leading-relaxed">
                Reze o Rosário com contador virtual de Ave-Marias, meditações por mistério e áudios narrados. Acompanhe a cadência da oração mariana sem se perder nas contas.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="bg-[oklch(0.17_0.05_260)] p-4 rounded-xl border border-[oklch(0.75_0.12_75/0.15)]">
                  <span className="text-xs text-[oklch(0.75_0.12_75)] font-bold block">4 Conjuntos de Mistérios</span>
                  <span className="text-xs text-[oklch(0.75_0.02_260)] mt-1 block">Gozosos, Dolorosos, Gloriosos e Luminosos</span>
                </div>
                <div className="bg-[oklch(0.17_0.05_260)] p-4 rounded-xl border border-[oklch(0.75_0.12_75/0.15)]">
                  <span className="text-xs text-[oklch(0.75_0.12_75)] font-bold block">Áudio em Alta Definição</span>
                  <span className="text-xs text-[oklch(0.75_0.02_260)] mt-1 block">Vozes masculinas e femininas com fundo sacro</span>
                </div>
              </div>

              <div className="pt-4">
                <Link href="/login?tab=cadastrar&path=/rosario">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-[oklch(0.75_0.12_75)] to-[oklch(0.68_0.14_70)] text-[oklch(0.12_0.04_260)] font-bold px-8 py-6 rounded-xl shadow-gold hover:scale-[1.03] transition-all"
                  >
                    Acessar Rosário Guiado
                  </Button>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6 flex justify-center">
              <div className="relative">
                <div className="w-[300px] sm:w-[380px] h-[300px] sm:h-[380px] rounded-full bg-gradient-to-tr from-[oklch(0.75_0.12_75/0.2)] to-transparent blur-3xl absolute top-0 left-0 pointer-events-none" />
                <img 
                  src={ROSARY_IMG} 
                  alt="Santo Rosário Sanctificare" 
                  className="w-[280px] sm:w-[360px] object-contain drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)] relative z-10 hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* --- SEÇÃO 5: MURAL DE INTENÇÕES & VELA VIRTUAL --- */}
      <section id="vela-virtual" className="py-20 bg-[oklch(0.15_0.05_260)]">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <Badge className="bg-[oklch(0.75_0.12_75/0.15)] text-[oklch(0.88_0.08_80)] border-[oklch(0.75_0.12_75/0.3)]">
              Comunidade de Oração
            </Badge>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white">
              Mural de Intenções & Vela Virtual
            </h2>
            <p className="text-sm text-[oklch(0.75_0.02_260)]">
              Una-se em oração pelos pedidos da comunidade ou acenda uma vela virtual por suas intenções.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Feed de Intenções */}
            <div className="lg:col-span-7 space-y-4">
              <h3 className="font-display text-lg font-bold text-white flex items-center gap-2 mb-4">
                <Users size={18} className="text-[oklch(0.75_0.12_75)]" />
                Intenções Recentes da Comunidade
              </h3>

              {intentions.map((intent) => {
                const hasPrayed = prayedIntentIds.includes(intent.id);
                return (
                  <div 
                    key={intent.id}
                    className="bg-[oklch(0.18_0.06_260)] border border-[oklch(0.75_0.12_75/0.15)] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-[oklch(0.75_0.12_75)] font-semibold">
                        <span>{intent.author}</span>
                        <span>•</span>
                        <span className="text-[oklch(0.65_0.02_260)]">{intent.city}</span>
                      </div>
                      <p className="text-sm text-[oklch(0.88_0.02_260)] font-serif italic">
                        "{intent.text}"
                      </p>
                    </div>

                    <Button
                      size="sm"
                      onClick={() => handlePrayTogether(intent.id)}
                      disabled={hasPrayed}
                      className={
                        hasPrayed
                          ? "bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 text-xs"
                          : "bg-[oklch(0.75_0.12_75/0.15)] hover:bg-[oklch(0.75_0.12_75/0.25)] text-[oklch(0.88_0.08_80)] border border-[oklch(0.75_0.12_75/0.3)] text-xs"
                      }
                    >
                      <PrayingHandsIcon size={14} className="mr-1.5" />
                      {hasPrayed ? "Rezado!" : `Rezar Junto (${intent.count})`}
                    </Button>
                  </div>
                );
              })}
            </div>

            {/* Card Acender Vela Virtual */}
            <div className="lg:col-span-5 bg-[oklch(0.18_0.06_260)] border border-[oklch(0.75_0.12_75/0.25)] rounded-2xl p-6 text-center space-y-5">
              <div className="w-14 h-14 bg-[oklch(0.75_0.12_75/0.15)] rounded-full flex items-center justify-center mx-auto text-[oklch(0.85_0.10_80)] shadow-gold">
                <Flame size={28} className="animate-pulse" />
              </div>

              <div>
                <h3 className="font-display font-bold text-xl text-white">Acender Vela Virtual</h3>
                <p className="text-xs text-[oklch(0.75_0.02_260)] mt-1 leading-relaxed">
                  Ofereça uma vela virtual de 7 dias com a sua prece no santuário digital do Sanctificare.
                </p>
              </div>

              <Button
                size="lg"
                onClick={() => setShowCandleModal(true)}
                className="w-full bg-gradient-to-r from-[oklch(0.75_0.12_75)] to-[oklch(0.68_0.14_70)] text-[oklch(0.12_0.04_260)] font-bold rounded-xl shadow-gold"
              >
                <Flame size={18} className="mr-2" />
                Acender Minha Vela
              </Button>
            </div>

          </div>
        </div>
      </section>

      {/* --- SEÇÃO 6: FORMAÇÃO ESPIRITUAL & RETIROS --- */}
      <section className="py-20 bg-[oklch(0.13_0.04_260)] border-t border-[oklch(0.75_0.12_75/0.1)]">
        <div className="container mx-auto px-4">
          
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <Badge className="bg-[oklch(0.75_0.12_75/0.15)] text-[oklch(0.88_0.08_80)] border-[oklch(0.75_0.12_75/0.3)]">
              Crescimento Espiritual
            </Badge>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white">
              Degraus de Perfeição & Formação
            </h2>
            <p className="text-sm text-[oklch(0.75_0.02_260)]">
              Retiros espirituais guiados por grandes mestres da vida interior.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Imitação de Cristo",
                desc: "Pílulas diárias do clássico espiritual de Tomás de Kempis para recolhimento interior.",
                icon: "📖",
                url: "/degraus-de-perfeicao/imitacao-de-cristo"
              },
              {
                title: "Filoteia",
                desc: "Introdução à Vida Devota de São Francisco de Sales para leigos no mundo.",
                icon: "🕊️",
                url: "/degraus-de-perfeicao/filoteia"
              },
              {
                title: "Via-Sacra",
                desc: "As 14 estações da Paixão de Nosso Senhor com imagens e meditações profundas.",
                icon: "✝️",
                url: "/via-sacra"
              },
              {
                title: "Vídeos Bíblicos",
                desc: "Séries e documentários sobre a vida dos Santos e passagens da Sagrada Escritura.",
                icon: "🎬",
                url: "/videos"
              }
            ].map((item, idx) => (
              <div key={idx} className="bg-[oklch(0.17_0.05_260)] border border-[oklch(0.75_0.12_75/0.15)] rounded-xl p-5 space-y-3 hover:border-[oklch(0.75_0.12_75/0.4)] transition-all">
                <span className="text-3xl">{item.icon}</span>
                <h3 className="font-display font-bold text-white text-base">{item.title}</h3>
                <p className="text-xs text-[oklch(0.75_0.02_260)] leading-relaxed">{item.desc}</p>
                <Link href={`/login?tab=cadastrar&path=${item.url}`}>
                  <button className="text-xs font-bold text-[oklch(0.75_0.12_75)] hover:underline inline-flex items-center gap-1 pt-2">
                    Acessar Conteúdo <ArrowRight size={12} />
                  </button>
                </Link>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* --- SEÇÃO 7: PLANOS & ASSINATURAS --- */}
      <section id="planos" className="py-20 bg-[oklch(0.15_0.05_260)]">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <Badge className="bg-[oklch(0.75_0.12_75/0.15)] text-[oklch(0.88_0.08_80)] border-[oklch(0.75_0.12_75/0.3)]">
              Planos & Apoio
            </Badge>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white">
              Escolha seu Caminho de Oração
            </h2>
            <p className="text-sm text-[oklch(0.75_0.02_260)]">
              Acesso gratuito garantido para os recursos fundamentais. Assine o Premium para apoiar a nossa missão.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            
            {/* Gratuito */}
            <div className="bg-[oklch(0.18_0.06_260)] border border-[oklch(0.75_0.12_75/0.15)] rounded-2xl p-6 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <h3 className="font-display font-bold text-xl text-white">Gratuito</h3>
                <div className="text-3xl font-bold text-white">R$ 0 <span className="text-xs font-normal text-[oklch(0.65_0.02_260)]">/ para sempre</span></div>
                <ul className="space-y-2 text-xs text-[oklch(0.78_0.02_260)]">
                  <li className="flex items-center gap-2"><Check size={14} className="text-[oklch(0.75_0.12_75)]" /> Liturgia do Dia Completa</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-[oklch(0.75_0.12_75)]" /> Bíblia Sagrada Completa (73 livros)</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-[oklch(0.75_0.12_75)]" /> Orações Básicas e Santo Rosário</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-[oklch(0.75_0.12_75)]" /> Mural de Intenções da Comunidade</li>
                </ul>
              </div>
              <Link href="/login?tab=cadastrar">
                <Button className="w-full bg-[oklch(0.75_0.12_75/0.2)] text-[oklch(0.88_0.08_80)] hover:bg-[oklch(0.75_0.12_75/0.3)] font-bold rounded-xl">
                  Começar Gratuitamente
                </Button>
              </Link>
            </div>

            {/* Premium Mensal */}
            <div className="bg-[oklch(0.18_0.06_260)] border border-[oklch(0.75_0.12_75/0.15)] rounded-2xl p-6 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <h3 className="font-display font-bold text-xl text-white">Premium Mensal</h3>
                <div className="text-3xl font-bold text-white">R$ 14,90 <span className="text-xs font-normal text-[oklch(0.65_0.02_260)]">/ mês</span></div>
                <ul className="space-y-2 text-xs text-[oklch(0.78_0.02_260)]">
                  <li className="flex items-center gap-2"><Check size={14} className="text-[oklch(0.75_0.12_75)]" /> Tudo do Plano Gratuito</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-[oklch(0.75_0.12_75)]" /> Áudios Narrados de Rosários e Terços</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-[oklch(0.75_0.12_75)]" /> Novenas e Meditações Exclusivas</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-[oklch(0.75_0.12_75)]" /> Histórico Espiritual Ilimitado</li>
                </ul>
              </div>
              <Link href="/login?tab=cadastrar&plan=monthly">
                <Button className="w-full bg-[oklch(0.75_0.12_75/0.2)] text-[oklch(0.88_0.08_80)] hover:bg-[oklch(0.75_0.12_75/0.3)] font-bold rounded-xl">
                  Experimentar 14 Dias Grátis
                </Button>
              </Link>
            </div>

            {/* Premium Anual (Destaque) */}
            <div className="bg-gradient-to-b from-[oklch(0.22_0.07_260)] to-[oklch(0.18_0.06_260)] border-2 border-[oklch(0.75_0.12_75)] rounded-2xl p-6 flex flex-col justify-between space-y-6 relative shadow-gold">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[oklch(0.75_0.12_75)] text-[oklch(0.12_0.04_260)] font-bold text-[10px] px-3 py-1 rounded-full uppercase tracking-wider">
                Economize 27%
              </div>
              <div className="space-y-4">
                <h3 className="font-display font-bold text-xl text-white">Premium Anual</h3>
                <div className="text-3xl font-bold text-[oklch(0.88_0.08_80)]">R$ 10,75 <span className="text-xs font-normal text-[oklch(0.65_0.02_260)]">/ mês*</span></div>
                <p className="text-[10px] text-[oklch(0.65_0.02_260)]">*Cobrado anualmente (R$ 129,00/ano)</p>
                <ul className="space-y-2 text-xs text-[oklch(0.88_0.02_260)]">
                  <li className="flex items-center gap-2"><Check size={14} className="text-[oklch(0.75_0.12_75)]" /> Acesso total ilimitado por 1 ano</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-[oklch(0.75_0.12_75)]" /> 3 meses sem custo adicional</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-[oklch(0.75_0.12_75)]" /> Retiros para Quaresma e Advento</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-[oklch(0.75_0.12_75)]" /> Suporte prioritário</li>
                </ul>
              </div>
              <Link href="/login?tab=cadastrar&plan=annual">
                <Button className="w-full bg-gradient-to-r from-[oklch(0.75_0.12_75)] to-[oklch(0.68_0.14_70)] text-[oklch(0.12_0.04_260)] font-bold rounded-xl shadow-gold hover:scale-[1.02] transition-transform">
                  Escolher Plano Anual
                </Button>
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* --- SEÇÃO 8: FAQ (PERGUNTAS FREQUENTES) --- */}
      <section className="py-20 bg-[oklch(0.13_0.04_260)] border-t border-[oklch(0.75_0.12_75/0.1)]">
        <div className="container mx-auto px-4 max-w-3xl">
          
          <div className="text-center mb-12 space-y-3">
            <h2 className="font-display text-3xl font-bold text-white">Dúvidas Frequentes</h2>
            <p className="text-sm text-[oklch(0.75_0.02_260)]">Respostas transparentes para você rezar com tranquilidade.</p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "O Sanctificare é gratuito?",
                a: "Sim! O acesso ao Santo Rosário, Liturgia do Dia, Bíblia Sagrada completa e ao Mural de Intenções é 100% gratuito. Oferecemos assinaturas Premium opcionais para ter acesso aos áudios narrados e novenas adicionais."
              },
              {
                q: "O conteúdo é fiel à Doutrina Católica?",
                a: "Sim, 100% fiel à Sagrada Escritura, à Tradição Apostólica e ao Magistério da Igreja Católica Apostólica Romana."
              },
              {
                q: "Como funciona o teste grátis de 14 dias do Premium?",
                a: "Você ganha 14 dias de acesso total aos áudios e novenas exclusivas sem compromisso. Pode cancelar quando quiser no seu perfil."
              },
              {
                q: "Preciso baixar um aplicativo pesado no celular?",
                a: "Não! O Sanctificare é um Web App moderno. Você pode usá-lo direto pelo navegador do celular ou computador, ou instalá-lo como aplicativo leve."
              }
            ].map((faq, idx) => (
              <div 
                key={idx}
                className="bg-[oklch(0.17_0.05_260)] border border-[oklch(0.75_0.12_75/0.15)] rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                  className="w-full px-6 py-4 text-left font-display font-bold text-white flex items-center justify-between text-base"
                >
                  <span>{faq.q}</span>
                  {openFaqIndex === idx ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                {openFaqIndex === idx && (
                  <div className="px-6 pb-4 text-xs text-[oklch(0.78_0.02_260)] leading-relaxed border-t border-[oklch(0.75_0.12_75/0.1)] pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* --- FOOTER / RODAPÉ --- */}
      <footer className="py-12 bg-[oklch(0.10_0.03_260)] border-t border-[oklch(0.75_0.12_75/0.1)] text-center text-xs text-[oklch(0.65_0.02_260)] space-y-4">
        <div className="flex items-center justify-center gap-2">
          <img src={LOGO_IMG} alt="Sanctificare Logo" className="w-6 h-6 object-contain" />
          <span className="font-display font-bold text-white text-sm">Sanctificare</span>
        </div>
        <p>"Ad Maiorem Dei Gloriam — Para a Maior Glória de Deus"</p>
        <p>© {new Date().getFullYear()} Sanctificare. Todos os direitos reservados.</p>
      </footer>

      {/* --- MODAL DE DEGUSTAÇÃO DE NOVENA (DIA 1) --- */}
      <Dialog open={!!selectedNovena} onOpenChange={() => setSelectedNovena(null)}>
        <DialogContent className="bg-[oklch(0.16_0.05_260)] border-[oklch(0.75_0.12_75/0.3)] text-white max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl">
          {selectedNovena && (
            <>
              <DialogHeader className="space-y-2 border-b border-[oklch(0.75_0.12_75/0.15)] pb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{selectedNovena.icon}</span>
                  <div>
                    <DialogTitle className="font-display font-bold text-xl text-white">
                      {selectedNovena.name}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-[oklch(0.75_0.12_75)] font-semibold mt-0.5">
                      {selectedNovena.day1Title}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Reflexão do Dia 1 */}
                <div className="bg-[oklch(0.13_0.04_260)] p-4 rounded-xl border border-white/5 space-y-2">
                  <span className="text-xs font-bold text-[oklch(0.88_0.08_80)] uppercase tracking-wider block">
                    📖 Meditação do Dia 1
                  </span>
                  <p className="text-xs text-[oklch(0.85_0.02_260)] leading-relaxed font-serif italic">
                    {selectedNovena.day1Reflection}
                  </p>
                </div>

                {/* Oração do Dia 1 */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-[oklch(0.75_0.12_75)] uppercase tracking-wider block">
                    🙏 Oração Tradicional
                  </span>
                  <div className="text-xs text-[oklch(0.88_0.02_260)] leading-relaxed whitespace-pre-line bg-[oklch(0.14_0.04_260)] p-4 rounded-xl border border-white/5 font-sans">
                    {selectedNovena.day1Prayer}
                  </div>
                </div>
              </div>

              <DialogFooter className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[oklch(0.75_0.12_75/0.15)] pt-4">
                <span className="text-[11px] text-[oklch(0.65_0.02_260)] text-center sm:text-left">
                  Deseja salvar seu progresso dos 9 dias no aplicativo?
                </span>
                <Link href={`/login?tab=cadastrar&path=/novenas/${selectedNovena.slug}`}>
                  <Button className="w-full sm:w-auto bg-gradient-to-r from-[oklch(0.75_0.12_75)] to-[oklch(0.68_0.14_70)] text-[oklch(0.12_0.04_260)] font-bold text-xs px-5 py-2.5 rounded-lg shadow-gold">
                    Continuar Novena no App (Criar Conta Grátis)
                  </Button>
                </Link>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* --- MODAL DE ORAÇÃO COMPLETA (DEGUSTAÇÃO) --- */}
      <Dialog open={!!selectedPrayer} onOpenChange={() => setSelectedPrayer(null)}>
        <DialogContent className="bg-[oklch(0.16_0.05_260)] border-[oklch(0.75_0.12_75/0.3)] text-white max-w-lg rounded-2xl">
          {selectedPrayer && (
            <>
              <DialogHeader className="space-y-2 border-b border-[oklch(0.75_0.12_75/0.15)] pb-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{selectedPrayer.icon}</span>
                  <div>
                    <DialogTitle className="font-display font-bold text-xl text-white">
                      {selectedPrayer.name}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-[oklch(0.75_0.02_260)]">
                      {selectedPrayer.desc}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="py-4">
                <div className="text-sm text-[oklch(0.90_0.02_260)] leading-relaxed whitespace-pre-line font-serif bg-[oklch(0.13_0.04_260)] p-5 rounded-xl border border-white/5">
                  {selectedPrayer.content}
                </div>
              </div>

              <DialogFooter className="flex items-center justify-between gap-3 border-t border-[oklch(0.75_0.12_75/0.15)] pt-3">
                <span className="text-[11px] text-[oklch(0.65_0.02_260)]">
                  Salve como favorita criando uma conta gratuita.
                </span>
                <Link href="/login?tab=cadastrar">
                  <Button size="sm" className="bg-[oklch(0.75_0.12_75)] hover:bg-[oklch(0.70_0.13_73)] text-[oklch(0.12_0.04_260)] font-bold text-xs">
                    Criar Conta Grátis
                  </Button>
                </Link>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* --- MODAL DE VELA VIRTUAL --- */}
      <Dialog open={showCandleModal} onOpenChange={setShowCandleModal}>
        <DialogContent className="bg-[oklch(0.16_0.05_260)] border-[oklch(0.75_0.12_75/0.3)] text-white max-w-md rounded-2xl">
          <DialogHeader className="text-center space-y-2">
            <div className="w-12 h-12 bg-[oklch(0.75_0.12_75/0.15)] rounded-full flex items-center justify-center mx-auto text-[oklch(0.85_0.10_80)]">
              <Flame size={24} className="animate-pulse" />
            </div>
            <DialogTitle className="font-display font-bold text-xl text-white">
              Acender Vela Virtual
            </DialogTitle>
            <DialogDescription className="text-xs text-[oklch(0.75_0.02_260)]">
              Escreva sua intenção para ser oferecida em oração.
            </DialogDescription>
          </DialogHeader>

          {isCandleLit ? (
            <div className="py-8 text-center space-y-3 animate-fade-in">
              <div className="w-16 h-16 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center mx-auto animate-bounce">
                <Flame size={36} />
              </div>
              <h4 className="font-display font-bold text-lg text-white">Sua Vela está Acesa!</h4>
              <p className="text-xs text-[oklch(0.75_0.02_260)] max-w-xs mx-auto">
                Que a luz de Cristo ilumine as suas intenções e traga paz ao seu coração.
              </p>
            </div>
          ) : (
            <form onSubmit={handleLightCandleSubmit} className="space-y-4 py-2">
              <textarea
                placeholder="Escreva sua intenção de oração (ex: Pela saúde da minha família, pela minha intenção particular...)"
                value={candleIntent}
                onChange={(e) => setCandleIntent(e.target.value)}
                required
                className="w-full h-28 bg-[oklch(0.13_0.04_260)] border border-[oklch(0.75_0.12_75/0.25)] text-white p-3 rounded-xl focus:border-[oklch(0.75_0.12_75)] placeholder:text-[oklch(0.55_0.02_260)] text-xs resize-none"
              />
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-[oklch(0.75_0.12_75)] to-[oklch(0.68_0.14_70)] text-[oklch(0.12_0.04_260)] font-bold rounded-xl shadow-gold"
              >
                Acender Vela Agora
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}
