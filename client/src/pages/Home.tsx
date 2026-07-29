import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl, isMobileApp } from "@/const";
import { Button } from "@/components/ui/button";
import LoadingOverlay from "@/components/ui/LoadingOverlay";
import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { BookOpen, Users, Crown, Star,
  ChevronRight, Shield,
  ArrowRight, Compass, Check,
  MessageSquare, Lock,
  ChevronDown, ChevronUp, Play, Pause
} from "lucide-react";
import { PrayingHandsIcon } from "@/components/PrayingHandsIcon";
import { Cross } from "@/components/CrossIcon";
import { RosaryIcon } from "@/components/RosaryIcon";
import { LiturgyIcon } from "@/components/LiturgyIcon";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { dailyRoutine, trendingPrayers } from "@/data/prayersCatalog";

const HERO_IMG = "/assets/sanctificare-hero.webp";
const LOGO_IMG = "/assets/sanctificare-logo-v2.webp";

const features = [
  {
    icon: PrayingHandsIcon,
    title: "Orações Diárias",
    description: "Rosário guiado, Terço, Angelus, Pai-Nosso, Ave-Maria e dezenas de orações tradicionais para sustentar sua vida de oração.",
    color: "text-[oklch(0.55_0.14_15)]",
    bg: "bg-[oklch(0.55_0.14_15/0.08)]",
  },
  {
    icon: LiturgyIcon,
    title: "Liturgia do Dia",
    description: "Leituras bíblicas, salmo e Evangelho do dia para rezar em sintonia com a Igreja.",
    color: "text-[oklch(0.65_0.14_70)]",
    bg: "bg-[oklch(0.65_0.14_70/0.08)]",
  },
  {
    icon: BookOpen,
    title: "Bíblia Sagrada",
    description: "Acesse a Bíblia completa com navegação por livros, capítulos e versículos. Busca integrada.",
    color: "text-[oklch(0.40_0.10_260)]",
    bg: "bg-[oklch(0.40_0.10_260/0.08)]",
  },
  {
    icon: Users,
    title: "Mural de Intenções",
    description: "Apresente suas intenções e una-se em oração pelas necessidades da comunidade católica.",
    color: "text-[oklch(0.45_0.12_200)]",
    bg: "bg-[oklch(0.45_0.12_200/0.08)]",
  },
  {
    icon: Crown,
    title: "Conteúdo Premium",
    description: "Novenas exclusivas, meditações guiadas, áudios devocionais e novos roteiros de oração.",
    color: "text-[oklch(0.65_0.14_70)]",
    bg: "bg-[oklch(0.65_0.14_70/0.08)]",
  },
  {
    icon: Shield,
    title: "Histórico Pessoal",
    description: "Acompanhe sua constância espiritual com o registro das orações e práticas realizadas.",
    color: "text-[oklch(0.40_0.12_150)]",
    bg: "bg-[oklch(0.40_0.12_150/0.08)]",
  },
];

const paths = [
  {
    id: "rosario",
    label: "Aprender o Rosário",
    icon: RosaryIcon,
    desc: "A oração mariana mais tradicional e contemplativa. O Sanctificare oferece um guia interativo passo a passo com contador virtual de Ave-Marias.",
    ctaText: "Acessar Guia do Rosário",
    url: "/login?tab=cadastrar&path=/rosario",
  },
  {
    id: "dormir",
    label: "Dormir em paz",
    icon: Shield,
    desc: "Áudios devocionais com música sacra, Salmos e leituras bíblicas reconfortantes para acalmar a mente e ter um sono reparador com Deus.",
    ctaText: "Ouvir Orações de Sono",
    url: "/login?tab=cadastrar&path=/musica-sacra",
  },
  {
    id: "liturgia",
    label: "Acompanhar a Liturgia",
    icon: LiturgyIcon,
    desc: "Siga o calendário da Igreja Universal todos os dias: Leituras bíblicas, Salmo, Evangelho do dia e homilia comentada.",
    ctaText: "Ver Liturgia de Hoje",
    url: "/login?tab=cadastrar&path=/liturgia",
  },
  {
    id: "novenas",
    label: "Rezar uma Novena",
    icon: Crown,
    desc: "Una-se à comunidade em novenas tradicionais (como Divino Espírito Santo, N. S. Aparecida) para obter as graças de Deus.",
    ctaText: "Escolher uma Novena",
    url: "/login?tab=cadastrar&path=/novenas",
  }
];

const faqs = [
  {
    q: "O Sanctificare é gratuito?",
    a: "Sim, os recursos fundamentais de oração (Santo Rosário interativo, Liturgia do Dia completa, Bíblia Sagrada completa e o Mural de Intenções comunitárias) são 100% gratuitos para sempre. Oferecemos assinaturas Premium opcionais para quem deseja ter acesso a áudios narrados, novenas adicionais e apoiar financeiramente o desenvolvimento do projeto."
  },
  {
    q: "O conteúdo é fiel à Igreja Católica?",
    a: "Com certeza. Todo o material do Sanctificare — incluindo orações tradicionais, leituras bíblicas, homilias e meditações — é revisado e está em estrita fidelidade com a doutrina, a Sagrada Escritura e o Magistério da Igreja Católica Apostólica Romana."
  },
  {
    q: "Como funciona o teste gratuito de 14 dias do Premium?",
    a: "Ao escolher experimentar o plano Premium, você ganha 14 dias de acesso total gratuito e sem restrições a todos os áudios, meditações e novenas. Você pode cancelar a qualquer momento nas configurações do seu perfil antes do fim do período de testes, e nenhuma cobrança será efetuada."
  },
  {
    q: "Posso acessar pelo celular e pelo computador?",
    a: "Sim! O Sanctificare é um web app moderno e responsivo. Isso significa que você pode acessá-lo pelo navegador de qualquer celular, tablet ou computador sem precisar baixar arquivos pesados. O design se adapta perfeitamente ao tamanho da sua tela."
  },
  {
    q: "Como minhas intenções no mural são tratadas?",
    a: "Você pode publicar suas intenções de oração de forma identificada ou 100% anônima. A comunidade de fiéis poderá ver seu pedido, clicar em 'Rezar Junto' para se unir a você em intercessão, e você verá o contador de pessoas intercedendo aumentar em tempo real."
  }
];

// Utilizando as listas centralizadas dailyRoutine e trendingPrayers do prayersCatalog

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [selectedPath, setSelectedPath] = useState(paths[0]);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  // A navegação de áudio agora redireciona para a página de detalhes correspondente (/oracao/:id)

  useEffect(() => {
    if (loading) return;
    if (isAuthenticated) {
      navigate("/dashboard");
    } else if (isMobileApp()) {
      // Na abertura inicial do app, redireciona para /login.
      // Se o usuário navegar de volta para / (ex: clicando em "Voltar ao início"),
      // o flag no sessionStorage evita o loop de redirecionamento.
      if (!sessionStorage.getItem('__cap_app_started')) {
        sessionStorage.setItem('__cap_app_started', '1');
        navigate("/login");
      }
      // Caso já tenha sido iniciado: exibe a landing normalmente.
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

  // Intersection Observer for scroll reveal animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.05, rootMargin: "0px 0px -40px 0px" }
    );

    const elements = document.querySelectorAll(".reveal, .reveal-left, .reveal-right");
    elements.forEach((el) => observer.observe(el));

    // Fallback: garante que todo elemento fique visível após 500ms evitando blocos ocultos
    const fallbackTimer = setTimeout(() => {
      elements.forEach((el) => el.classList.add("visible"));
    }, 500);

    return () => {
      clearTimeout(fallbackTimer);
      elements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  // Evita flash da landing page enquanto o estado de auth ainda não resolveu (desktop)
  // ou quando o usuário já está autenticado (o useEffect redireciona para /dashboard).
  if (isAuthenticated || (!isMobileApp() && loading)) {
    return null;
  }

  // No app nativo, usamos o splash apenas enquanto o estado de autenticação
  // ainda está sendo carregado ou antes do primeiro redirecionamento inicial.
  // Depois disso, deixamos a navegação acontecer mais rapidamente.
  if (
    isMobileApp() &&
    (loading || (!sessionStorage.getItem('__cap_app_started') && !isAuthenticated))
  ) {
    return <LoadingOverlay message="Inicializando o app..." />;
  }

  return (
    <div className="min-h-screen bg-background selection:bg-[oklch(0.75_0.12_75/0.3)] selection:text-[oklch(0.15_0.02_260)]">
      
      {/* Sticky Blurred Navbar */}
      <nav 
        className={`sticky top-0 z-50 transition-all duration-300 border-b ${
          isScrolled 
            ? "bg-[oklch(0.22_0.07_260/0.88)] backdrop-blur-md border-[oklch(0.75_0.12_75/0.25)] shadow-md py-3" 
            : "bg-[oklch(0.22_0.07_260)] border-[oklch(0.75_0.12_75/0.15)] py-4"
        }`}
      >
        <div className="container">
          <div className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <img src={LOGO_IMG} alt="Sanctificare Logo" className="w-9 h-9 object-contain drop-shadow-[0_0_6px_oklch(0.75_0.12_75/0.6)]" />
              <span className="font-display text-lg font-semibold text-[oklch(0.88_0.08_80)] tracking-wide whitespace-nowrap">
                Sanctificare
              </span>
            </div>
            
            <div className="flex items-center justify-end gap-2 sm:gap-4 flex-wrap sm:flex-nowrap">
              <a href="#explorar-oracoes" className="hidden md:block text-sm text-[oklch(0.80_0.02_260)] hover:text-[oklch(0.88_0.08_80)] transition-colors">
                Orações
              </a>
              <a href="#perguntas" className="hidden md:block text-sm text-[oklch(0.80_0.02_260)] hover:text-[oklch(0.88_0.08_80)] transition-colors">
                Perguntas
              </a>
              <Link href="/login?tab=entrar" className="text-xs sm:text-sm font-semibold text-[oklch(0.80_0.02_260)] hover:text-white transition-colors whitespace-nowrap">
                Entrar
              </Link>
              <a href="/login?tab=cadastrar">
                <Button
                  size="sm"
                  className="bg-[oklch(0.75_0.12_75)] hover:bg-[oklch(0.70_0.13_73)] text-[oklch(0.15_0.02_260)] font-bold px-3 py-2 sm:px-4 hover:scale-[1.03] transition-all"
                >
                  Criar Conta
                </Button>
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[75vh] flex items-center overflow-hidden py-12 bg-[oklch(0.22_0.07_260)]">
        {/* Background image & gradient overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-35"
          style={{ backgroundImage: `url(${HERO_IMG})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[oklch(0.22_0.07_260/0.7)] via-[oklch(0.18_0.05_260/0.92)] to-[oklch(0.12_0.04_260)]" />
        <div className="absolute inset-0 bg-pattern-cross opacity-20" />

        {/* Glow orbs for premium visual effect */}
        <div className="glow-orb w-[400px] h-[400px] bg-[oklch(0.75_0.12_75)] top-1/4 -left-1/4" />
        <div className="glow-orb w-[500px] h-[500px] bg-[oklch(0.35_0.12_15)] bottom-1/4 -right-1/4" />

        <div className="relative container">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Text details column */}
            <div className="lg:col-span-7 space-y-6 animate-fade-in text-left">
              <div className="inline-flex items-center gap-2 bg-[oklch(0.75_0.12_75/0.15)] border border-[oklch(0.75_0.12_75/0.4)] rounded-full px-4 py-1.5 shadow-sm">
                <Cross size={14} className="text-[oklch(0.82_0.10_80)]" />
                <span className="text-[oklch(0.82_0.10_80)] text-xs font-display tracking-wider uppercase font-semibold">
                  Seu Santuário de Recolhimento e Devoção
                </span>
              </div>

              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-5xl font-bold text-white leading-tight">
                Eleve o seu Coração <br className="hidden sm:inline" />
                ao Altíssimo na <span className="text-[oklch(0.82_0.10_80)] drop-shadow-[0_2px_10px_oklch(0.75_0.12_75/0.3)]">Oração</span>
              </h1>

              <div className="border-l-2 border-[oklch(0.75_0.12_75)] pl-4 py-2 bg-[oklch(0.75_0.12_75/0.05)] rounded-r-xl max-w-xl">
                <p className="font-serif italic text-lg sm:text-xl text-[oklch(0.85_0.02_260)] leading-relaxed">
                  "Sede santos, porque eu, o Senhor vosso Deus, sou santo."
                </p>
                <span className="text-xs font-sans font-bold tracking-wider text-[oklch(0.82_0.10_80)] block mt-1 uppercase">Lv 19, 2</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-2 max-w-md">
                <Link href="/login?tab=cadastrar" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="w-full bg-[oklch(0.75_0.12_75)] hover:bg-[oklch(0.70_0.13_73)] text-[oklch(0.15_0.02_260)] font-bold text-base px-8 py-7 shadow-gold rounded-xl hover:scale-[1.03] transition-all"
                  >
                    Iniciar Minha Caminhada Grátis
                    <ChevronRight size={20} className="ml-2" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* App Mockup Column */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end animate-fade-in [animation-delay:0.2s]">
              <div className="relative w-full max-w-[238px]">
                {/* Golden aura background effect */}
                <div className="absolute inset-0 bg-[oklch(0.75_0.12_75/0.25)] rounded-[40px] blur-3xl scale-95" />
                
                {/* Phone Shell mockup using tailwind */}
                <div className="relative bg-[oklch(0.15_0.04_265)] border-4 border-[oklch(0.75_0.12_75/0.4)] rounded-[36px] shadow-2xl p-4 overflow-hidden aspect-[9/19.5]">
                  
                  {/* Phone top notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-4 bg-black rounded-b-xl z-20 flex items-center justify-center">
                    <div className="w-12 h-1 bg-neutral-800 rounded-full" />
                  </div>
                  
                  {/* Phone Screen Content */}
                  <div className="h-full flex flex-col justify-between pt-6 text-white text-left font-sans select-none">
                    {/* Mock Status Bar */}
                    <div className="flex justify-between items-center px-4 text-[10px] text-neutral-400">
                      <span>09:41</span>
                      <div className="flex items-center gap-1">
                        <span>📶</span>
                        <span>🔋</span>
                      </div>
                    </div>

                    {/* Mock App Header */}
                    <div className="mt-4 px-2 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <img src={LOGO_IMG} alt="Logo" className="w-6 h-6 object-contain" />
                        <span className="font-display text-xs text-[oklch(0.88_0.08_80)] font-semibold">Sanctificare</span>
                      </div>
                      <Crown size={12} className="text-[oklch(0.82_0.10_80)]" />
                    </div>

                    {/* Mock Active Content widget */}
                    <div className="mt-6 flex-1 flex flex-col justify-center items-center px-2 text-center">
                      <div className="relative mb-6 flex justify-center items-center">
                        {/* Interactive beads ring SVG */}
                        <svg viewBox="0 0 100 100" className="w-32 h-32 text-[oklch(0.75_0.12_75)]">
                          <circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" strokeWidth="2.5" strokeDasharray="3 7" className="opacity-70" />
                          <circle cx="50" cy="12" r="4.5" fill="oklch(0.82_0.10_80)" />
                        </svg>
                        <div className="absolute flex flex-col items-center">
                          <span className="text-[10px] text-neutral-400 uppercase tracking-widest">Mistério</span>
                          <span className="font-display text-xl font-bold text-[oklch(0.82_0.10_80)]">I</span>
                          <span className="text-[9px] text-[oklch(0.75_0.12_75)] font-semibold mt-1">1ª Ave-Maria</span>
                        </div>
                      </div>

                      <div className="bg-[oklch(0.22_0.07_260/0.6)] border border-[oklch(0.75_0.12_75/0.2)] rounded-xl p-3.5 w-full">
                        <h4 className="text-xs font-bold text-[oklch(0.82_0.10_80)] uppercase tracking-wide">Mistérios Gloriosos</h4>
                        <p className="text-[10px] text-neutral-300 mt-1 italic font-serif">
                          "O mistério da Ressurreição de Nosso Senhor Jesus Cristo, para que cresçamos na virtude da Fé."
                        </p>
                      </div>
                    </div>

                    {/* Mock Audio control bar */}
                    <div className="mb-4 bg-[oklch(0.12_0.04_260)] border border-[oklch(0.75_0.12_75/0.15)] rounded-2xl p-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[9px] font-semibold text-neutral-300">Áudio do Terço</span>
                        <span className="text-[8px] text-[oklch(0.82_0.10_80)]">03:14 / 21:05</span>
                      </div>
                      <div className="h-1 bg-neutral-800 rounded-full w-full mb-3 overflow-hidden">
                        <div className="h-full bg-[oklch(0.75_0.12_75)] w-[18%]" />
                      </div>
                      <div className="flex justify-center items-center gap-4 text-neutral-400">
                        <span className="text-xs">⏮</span>
                        <div className="w-8 h-8 rounded-full bg-[oklch(0.75_0.12_75)] text-[oklch(0.15_0.02_260)] flex items-center justify-center text-xs font-bold shadow-md">
                          ▶
                        </div>
                        <span className="text-xs">⏭</span>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Floating reviews widget */}
                <div className="absolute -bottom-6 -left-3 bg-[oklch(0.22_0.07_260)] text-white rounded-xl p-3 shadow-2xl border border-[oklch(0.75_0.12_75/0.3)] flex items-center gap-2 max-w-[200px] z-20 animate-bounce [animation-duration:4s]">
                  <div className="bg-[oklch(0.75_0.12_75/0.15)] p-1.5 rounded-lg text-[oklch(0.82_0.10_80)]">
                    ✝
                  </div>
                  <div>
                    <div className="flex gap-0.5 text-amber-400">
                      <Star size={10} className="fill-current" />
                      <Star size={10} className="fill-current" />
                      <Star size={10} className="fill-current" />
                      <Star size={10} className="fill-current" />
                      <Star size={10} className="fill-current" />
                    </div>
                    <p className="text-[10px] font-semibold text-left">Constância diária</p>
                    <p className="text-[8px] text-[oklch(0.80_0.02_260)] text-left">"Mudou minhas manhãs."</p>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Trust Bar (Prova Social) */}
      <section className="bg-[oklch(0.12_0.04_260)] border-y border-[oklch(0.75_0.12_75/0.25)] py-6">
        <div className="container">
          <div className="trust-bar text-[oklch(0.80_0.02_260)] font-display uppercase tracking-wider font-semibold text-xs flex justify-around flex-wrap gap-y-4">
            <div className="trust-item">
              <Cross size={14} className="text-[oklch(0.75_0.12_75)]" />
              <span>App 100% Católico</span>
            </div>
            <div className="trust-item">
              <Shield size={14} className="text-[oklch(0.75_0.12_75)]" />
              <span>Seguro & Sem Anúncios</span>
            </div>
            <div className="trust-item">
              <BookOpen size={14} className="text-[oklch(0.75_0.12_75)]" />
              <span>Leituras Bíblicas Oficiais</span>
            </div>
            <div className="trust-item">
              <Users size={14} className="text-[oklch(0.75_0.12_75)]" />
              <span>Comunidade Ativa</span>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Selector: "Não sabe por onde começar?" */}
      <section className="py-24 bg-[oklch(0.18_0.05_260)] relative border-b border-[oklch(0.75_0.12_75/0.15)]">
        <div className="container text-white">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="divider-gold mb-6">
              <span className="font-display text-xs tracking-widest text-[oklch(0.82_0.10_80)] uppercase font-bold px-4">
                Orientação
              </span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4">
              Não sabe por onde começar?
            </h2>
            <p className="font-serif text-lg text-[oklch(0.80_0.02_260)]">
              Escolha o que você mais deseja cultivar na sua caminhada de fé hoje:
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            {/* Grid of Choices */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {paths.map((p) => {
                const IconComponent = p.icon;
                const isSelected = selectedPath.id === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPath(p)}
                    className={`p-4 rounded-xl border flex flex-col items-center gap-3 text-center transition-all duration-300 ${
                      isSelected
                        ? "bg-[oklch(0.75_0.12_75/0.15)] border-[oklch(0.75_0.12_75)] shadow-gold text-[oklch(0.82_0.10_80)]"
                        : "bg-[oklch(0.22_0.07_260/0.4)] border-[oklch(0.75_0.12_75/0.1)] text-[oklch(0.80_0.02_260)] hover:border-[oklch(0.75_0.12_75/0.5)] hover:text-white"
                    }`}
                  >
                    <IconComponent size={24} className={isSelected ? "text-[oklch(0.82_0.10_80)]" : "text-[oklch(0.70_0.03_260)]"} />
                    <span className="font-display text-xs sm:text-sm font-semibold tracking-wide">{p.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Dynamic Card Display */}
            <div className="bg-[oklch(0.22_0.07_260)] border border-[oklch(0.75_0.12_75/0.2)] rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center gap-6 justify-between animate-fade-in relative overflow-hidden">
              <div className="absolute inset-0 bg-pattern-cross opacity-5 pointer-events-none" />
              <div className="space-y-4 max-w-xl text-left z-10">
                <h3 className="font-display text-lg sm:text-xl font-bold text-[oklch(0.82_0.10_80)]">
                  {selectedPath.label}
                </h3>
                <p className="font-serif text-sm sm:text-base text-[oklch(0.85_0.02_260)] leading-relaxed">
                  {selectedPath.desc}
                </p>
              </div>

              <div className="w-full md:w-auto z-10">
                <Link href={selectedPath.url}>
                  <Button className="w-full md:w-auto bg-[oklch(0.75_0.12_75)] hover:bg-[oklch(0.70_0.13_73)] text-[oklch(0.15_0.02_260)] font-bold px-6 py-5 rounded-xl shadow-md transition-all hover:scale-[1.03]">
                    {selectedPath.ctaText}
                    <ArrowRight size={16} className="ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Explore Nossas Orações (Estilo Hallow) */}
      <section id="explorar-oracoes" className="py-24 bg-[oklch(0.12_0.03_260)] text-white relative overflow-hidden border-t border-[oklch(0.75_0.12_75/0.2)]">
        <div className="absolute inset-0 bg-pattern-cross opacity-10 pointer-events-none" />
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-[oklch(0.75_0.12_75/0.05)] rounded-full blur-[100px] pointer-events-none" />
        
        <div className="container relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="divider-gold mb-6">
              <span className="font-display text-xs tracking-widest text-[oklch(0.82_0.10_80)] uppercase font-bold px-4">
                Biblioteca de Áudio
              </span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4">
              Explore Nossas Orações
            </h2>
            <p className="font-serif text-lg text-[oklch(0.80_0.02_260)]">
              Ouça uma prévia de nossas orações guiadas, novenas e meditações. Clique para ouvir gratuitamente.
            </p>
          </div>

          {/* Roteiro do Dia (Daily Routine) - Grid compacto */}
          <div className="max-w-5xl mx-auto mb-16">
            <h3 className="font-display text-xl font-bold text-[oklch(0.82_0.10_80)] mb-6 flex items-center gap-2">
              <LiturgyIcon size={18} />
              Roteiro do Dia
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dailyRoutine.map((p) => (
                <div
                  key={p.id}
                  onClick={() => navigate(getLoginUrl(p.url))}
                  className="bg-[oklch(0.22_0.07_260/0.4)] border border-[oklch(0.75_0.12_75/0.1)] rounded-xl p-4 flex items-center justify-between gap-4 cursor-pointer hover:border-[oklch(0.75_0.12_75/0.4)] hover:bg-[oklch(0.22_0.07_260/0.7)] transition-all duration-300 group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 relative border border-neutral-800">
                      <img src={p.cover} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play size={18} className="text-white fill-white" />
                      </div>
                    </div>
                    <div className="text-left">
                      <h4 className="font-display text-sm sm:text-base font-bold text-white group-hover:text-[oklch(0.82_0.10_80)] transition-colors">{p.title}</h4>
                      <p className="text-xs text-neutral-400 font-serif mt-0.5">{p.desc} • {p.speaker}</p>
                      <span className="text-[10px] text-neutral-500 font-sans block mt-1">{p.duration}</span>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[oklch(0.75_0.12_75/0.155)] text-[oklch(0.75_0.12_75)] flex items-center justify-center flex-shrink-0 group-hover:bg-[oklch(0.75_0.12_75)] group-hover:text-[oklch(0.15_0.02_260)] transition-all">
                    ▶
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Em Destaque (Trending) - Carrossel Horizontal */}
          <div className="max-w-5xl mx-auto">
            <h3 className="font-display text-xl font-bold text-[oklch(0.82_0.10_80)] mb-6 flex items-center gap-2">
              <Star size={18} />
              Orações em Destaque
            </h3>
            {/* Scrollable list */}
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-neutral-800 scrollbar-track-transparent">
              {trendingPrayers.map((p) => (
                <div
                  key={p.id}
                  onClick={() => navigate(getLoginUrl(p.url))}
                  className="bg-[oklch(0.22_0.07_260/0.4)] border border-[oklch(0.75_0.12_75/0.1)] rounded-xl p-3 flex-shrink-0 w-[240px] cursor-pointer hover:border-[oklch(0.75_0.12_75/0.4)] hover:bg-[oklch(0.22_0.07_260/0.7)] transition-all duration-300 group"
                >
                  <div className="w-full aspect-video rounded-lg overflow-hidden relative border border-neutral-800 mb-3">
                    <img src={p.cover} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play size={20} className="text-white fill-white" />
                    </div>
                  </div>
                  <div className="text-left space-y-1">
                    <h4 className="font-display text-sm font-bold text-white group-hover:text-[oklch(0.82_0.10_80)] transition-colors truncate">{p.title}</h4>
                    <p className="text-xs text-neutral-400 font-serif truncate">{p.desc}</p>
                    <p className="text-[10px] text-neutral-500 font-sans truncate">{p.speaker}</p>
                    <span className="text-[9px] bg-[oklch(0.75_0.12_75/0.15)] text-[oklch(0.82_0.10_80)] font-sans px-2 py-0.5 rounded-full inline-block mt-1">{p.duration}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="perguntas" className="py-24 bg-[oklch(0.12_0.03_260)] text-white relative border-t border-[oklch(0.75_0.12_75/0.2)]">
        <div className="absolute inset-0 bg-pattern-cross opacity-10 pointer-events-none" />
        <div className="container relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="divider-gold mb-6">
              <span className="font-display text-xs tracking-widest text-[oklch(0.82_0.10_80)] uppercase font-bold px-4">
                Dúvidas
              </span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4">
              Perguntas Frequentes
            </h2>
            <p className="font-serif text-lg text-[oklch(0.80_0.02_260)]">
              Tudo o que você precisa saber sobre o Sanctificare e nossa caminhada.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="bg-[oklch(0.22_0.07_260/0.6)] backdrop-blur-md rounded-xl border border-[oklch(0.75_0.12_75/0.15)] shadow-md overflow-hidden transition-all duration-300"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left font-display text-base font-semibold text-white hover:text-[oklch(0.82_0.10_80)] hover:bg-[oklch(0.22_0.07_260/0.9)] transition-colors"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp size={18} className="text-[oklch(0.75_0.12_75)] transition-transform duration-300" />
                    ) : (
                      <ChevronDown size={18} className="text-[oklch(0.75_0.12_75/0.7)] transition-transform duration-300" />
                    )}
                  </button>
                  <div
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${
                      isOpen ? "max-h-[300px] border-t border-[oklch(0.75_0.12_75/0.1)]" : "max-h-0"
                    }`}
                  >
                    <p className="px-6 py-5 font-serif text-sm sm:text-base text-[oklch(0.85_0.02_260)] leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-28 bg-[oklch(0.22_0.07_260)] relative overflow-hidden text-center text-white">
        <div className="absolute inset-0 bg-pattern-cross opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[oklch(0.15_0.04_265)]" />
        
        {/* Glow orb */}
        <div className="glow-orb w-[600px] h-[600px] bg-[oklch(0.75_0.12_75)] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

        <div className="container relative z-10">
          <img src={LOGO_IMG} alt="Sanctificare logo" className="w-20 h-20 object-contain mx-auto mb-8 drop-shadow-[0_0_16px_oklch(0.75_0.12_75/0.5)] animate-pulse" />
          
          <h2 className="font-display text-4xl sm:text-5xl font-bold mb-6 leading-tight">
            Edifique Sua Vida <br className="sm:hidden" /> de <span className="text-[oklch(0.82_0.10_80)]">Oração Hoje</span>
          </h2>
          
          <p className="font-serif text-lg sm:text-xl text-[oklch(0.80_0.02_260)] max-w-xl mx-auto mb-10 leading-relaxed">
            Reúna-se a milhares de fiéis católicos dedicados ao Rosário, às Escrituras e à intercessão. Comece sua caminhada espiritual gratuitamente agora.
          </p>

          <a href="/login?tab=cadastrar" className="inline-block w-full sm:w-auto">
            <Button
              size="lg"
              className="bg-[oklch(0.75_0.12_75)] hover:bg-[oklch(0.70_0.13_73)] text-[oklch(0.15_0.02_260)] font-bold text-base px-10 py-7 shadow-gold rounded-xl hover:scale-[1.03] transition-all"
            >
              Criar Minha Conta Gratuita
              <ChevronRight size={20} className="ml-2" />
            </Button>
          </a>
          
          <p className="text-xs text-neutral-400 mt-4">
            Acesso completo gratuito. Sem cartão de crédito.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[oklch(0.15_0.04_265)] border-t border-[oklch(0.75_0.12_75/0.15)] py-16 text-[oklch(0.55_0.02_260)]">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center border-b border-[oklch(0.75_0.12_75/0.1)] pb-12 mb-12">
            
            <div className="md:col-span-4 flex items-center gap-3 justify-center md:justify-start">
              <img src={LOGO_IMG} alt="Sanctificare" className="w-8 h-8 object-contain drop-shadow-[0_0_6px_oklch(0.75_0.12_75/0.6)]" />
              <span className="font-display text-[oklch(0.82_0.10_80)] font-semibold tracking-wide">Sanctificare</span>
            </div>

            <div className="md:col-span-4 text-center">
              <p className="font-serif text-base italic">
                "Tudo posso naquele que me fortalece." <br /> — Filipenses 4:13
              </p>
            </div>

            <div className="md:col-span-4 flex justify-center md:justify-end gap-6 text-sm">
              <a href="#explorar-oracoes" className="hover:text-white transition-colors">Orações</a>
              <a href="#perguntas" className="hover:text-white transition-colors">Perguntas</a>
            </div>

          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
            <p>© 2026 Sanctificare. Todos os direitos reservados.</p>
            <div className="flex gap-4">
              <span className="cursor-pointer hover:text-white transition-colors">Termos de Uso</span>
              <Link href="/privacidade" className="hover:text-white transition-colors cursor-pointer">
                Política de Privacidade
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
