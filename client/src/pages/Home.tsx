import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import {
  Heart, BookOpen, Sun, Users, Crown, Star,
  ChevronRight, Cross, Sparkles, Shield,
  Calendar, ArrowRight, Compass, Check,
  Volume2, MessageSquare, Search, Lock,
  ChevronDown, ChevronUp, Play, Pause
} from "lucide-react";
import { PrayingHandsIcon } from "@/components/PrayingHandsIcon";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { dailyRoutine, trendingPrayers } from "@/data/prayersCatalog";

const HERO_IMG = "/assets/sanctificare-hero.webp";
const LOGO_IMG = "/assets/sanctificare-logo.webp";
const ROSARY_IMG = "/assets/sanctificare-rosary.webp";

const features = [
  {
    icon: PrayingHandsIcon,
    title: "Orações Diárias",
    description: "Rosário guiado, Terço, Angelus, Pai-Nosso, Ave-Maria e dezenas de orações tradicionais para sustentar sua vida de oração.",
    color: "text-[oklch(0.55_0.14_15)]",
    bg: "bg-[oklch(0.55_0.14_15/0.08)]",
  },
  {
    icon: Sun,
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

const plans = [
  {
    name: "Gratuito",
    price: "R$ 0",
    period: "para sempre",
    features: [
      "Orações básicas (Pai Nosso, Ave Maria, Glória)",
      "Liturgia do Dia completa",
      "Bíblia Sagrada completa (73 livros)",
      "Mural de intenções da comunidade",
      "Histórico de orações (últimos 7 dias)",
    ],
    cta: "Começar Gratuitamente",
    highlight: false,
    badge: "Acesso Completo",
    url: "/login?tab=cadastrar",
  },
  {
    name: "Premium Mensal",
    price: "R$ 14,90",
    period: "por mês",
    features: [
      "Tudo do caminho gratuito",
      "Rosário e Terço guiados por áudio",
      "Novenas e Meditações exclusivas",
      "Histórico espiritual ilimitado",
      "Sem anúncios ou interrupções",
      "Suporte prioritário",
    ],
    cta: "Experimentar 7 Dias Grátis",
    highlight: false,
    url: "/login?tab=cadastrar&plan=monthly",
  },
  {
    name: "Premium Anual",
    price: "R$ 9,99",
    period: "por mês*",
    badge: "Economize 33%",
    note: "*Cobrado anualmente (R$ 119,90/ano)",
    features: [
      "Tudo do acesso mensal",
      "Equivalente a 2 meses sem custo adicional",
      "Acesso antecipado a novos áudios",
      "Meditações exclusivas para tempos fortes (Quaresma/Advento)",
      "Histórico espiritual completo vitalício",
    ],
    cta: "Escolher Plano Anual",
    highlight: true,
    url: "/login?tab=cadastrar&plan=annual",
  },
];



const paths = [
  {
    id: "rosario",
    label: "Aprender o Rosário",
    icon: Sparkles,
    desc: "A oração mariana mais tradicional e contemplativa. O Sanctificare oferece um guia interativo passo a passo com contador virtual de Ave-Marias.",
    ctaText: "Acessar Guia do Rosário",
    url: "/login?tab=cadastrar&path=rosario",
  },
  {
    id: "dormir",
    label: "Dormir em paz",
    icon: Shield,
    desc: "Áudios devocionais com música sacra, Salmos e leituras bíblicas reconfortantes para acalmar a mente e ter um sono reparador com Deus.",
    ctaText: "Ouvir Orações de Sono",
    url: "/login?tab=cadastrar&path=dormir",
  },
  {
    id: "liturgia",
    label: "Acompanhar a Liturgia",
    icon: Sun,
    desc: "Siga o calendário da Igreja Universal todos os dias: Leituras bíblicas, Salmo, Evangelho do dia e homilia comentada.",
    ctaText: "Ver Liturgia de Hoje",
    url: "/login?tab=cadastrar&path=liturgia",
  },
  {
    id: "novenas",
    label: "Rezar uma Novena",
    icon: Crown,
    desc: "Una-se à comunidade em novenas tradicionais (como Divino Espírito Santo, N. S. Aparecida) para obter as graças de Deus.",
    ctaText: "Escolher uma Novena",
    url: "/login?tab=cadastrar&path=novena",
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
    q: "Como funciona o teste gratuito de 7 dias do Premium?",
    a: "Ao escolher experimentar o plano Premium, você ganha 7 dias de acesso total gratuito e sem restrições a todos os áudios, meditações e novenas. Você pode cancelar a qualquer momento nas configurações do seu perfil antes do fim do período de testes, e nenhuma cobrança será efetuada."
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

function AnimatedCounter({ value, duration = 2000, suffix = "" }: { value: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const elementRef = useRef<HTMLSpanElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) observer.unobserve(elementRef.current);
    };
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    let start = 0;
    const end = value;
    const totalSteps = 50;
    const stepTime = duration / totalSteps;
    const increment = end / totalSteps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [isVisible, value, duration]);

  return (
    <span ref={elementRef} className="stat-counter font-display font-bold">
      {count.toLocaleString()}{suffix}
    </span>
  );
}

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [selectedPath, setSelectedPath] = useState(paths[0]);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  // A navegação de áudio agora redireciona para a página de detalhes correspondente (/oracao/:id)

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate("/dashboard");
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

    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, []);

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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={LOGO_IMG} alt="Sanctificare Logo" className="w-9 h-9 rounded-full object-cover shadow-gold" />
              <span className="font-display text-lg font-semibold text-[oklch(0.88_0.08_80)] tracking-wide">
                Sanctificare
              </span>
            </div>
            
            <div className="flex items-center gap-4 sm:gap-6">
              <a href="#recursos" className="hidden md:block text-sm text-[oklch(0.80_0.02_260)] hover:text-[oklch(0.88_0.08_80)] transition-colors">
                Recursos
              </a>
              <a href="#como-funciona" className="hidden md:block text-sm text-[oklch(0.80_0.02_260)] hover:text-[oklch(0.88_0.08_80)] transition-colors">
                Como Funciona
              </a>
              <a href="#planos" className="hidden md:block text-sm text-[oklch(0.80_0.02_260)] hover:text-[oklch(0.88_0.08_80)] transition-colors">
                Planos
              </a>
              <a href="/login?tab=entrar" className="text-sm font-semibold text-[oklch(0.80_0.02_260)] hover:text-white transition-colors mr-2">
                Entrar
              </a>
              <a href="/login?tab=cadastrar">
                <Button
                  size="sm"
                  className="bg-[oklch(0.75_0.12_75)] hover:bg-[oklch(0.70_0.13_73)] text-[oklch(0.15_0.02_260)] font-bold px-4 py-2 hover:scale-[1.03] transition-all"
                >
                  Criar Conta
                </Button>
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden py-16 bg-[oklch(0.22_0.07_260)]">
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
            <div className="lg:col-span-7 space-y-8 animate-fade-in text-left">
              <div className="inline-flex items-center gap-2 bg-[oklch(0.75_0.12_75/0.15)] border border-[oklch(0.75_0.12_75/0.4)] rounded-full px-4 py-1.5 shadow-sm">
                <Sparkles size={14} className="text-[oklch(0.82_0.10_80)] animate-pulse" />
                <span className="text-[oklch(0.82_0.10_80)] text-xs font-display tracking-wider uppercase font-semibold">
                  Sua caminhada diária de recolhimento e fé
                </span>
              </div>

              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
                Encontre a Paz <br className="hidden sm:inline" />
                de Deus na <span className="text-[oklch(0.82_0.10_80)] drop-shadow-[0_2px_10px_oklch(0.75_0.12_75/0.3)]">Oração</span>
              </h1>

              <p className="font-serif text-lg sm:text-xl text-[oklch(0.85_0.02_260)] leading-relaxed max-w-xl">
                O Sanctificare acompanha sua rotina de recolhimento de forma sóbria e reverente. Reze o Rosário interativo, acompanhe a Liturgia diária e crie constância espiritual.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-2 max-w-md">
                <a href="/login?tab=cadastrar" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="w-full bg-[oklch(0.75_0.12_75)] hover:bg-[oklch(0.70_0.13_73)] text-[oklch(0.15_0.02_260)] font-bold text-base px-8 py-7 shadow-gold rounded-xl hover:scale-[1.03] transition-all"
                  >
                    Experimentar Sanctificare Grátis
                    <ChevronRight size={20} className="ml-2" />
                  </Button>
                </a>
              </div>
            </div>

            {/* App Mockup Column */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end animate-fade-in [animation-delay:0.2s]">
              <div className="relative w-full max-w-[340px]">
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
                        <img src={LOGO_IMG} alt="Logo" className="w-6 h-6 rounded-full" />
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
                          <circle cx="50" cy="12" r="4.5" fill="oklch(0.82_0.10_80)" className="animate-pulse" />
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
                <div className="absolute -bottom-6 -left-10 bg-white text-[oklch(0.12_0.04_260)] rounded-xl p-3 shadow-xl border border-neutral-100 flex items-center gap-2 max-w-[200px] z-20 animate-bounce [animation-duration:4s]">
                  <div className="bg-[oklch(0.75_0.12_75/0.1)] p-1.5 rounded-lg text-[oklch(0.75_0.12_75)]">
                    ✝
                  </div>
                  <div>
                    <div className="flex gap-0.5 text-amber-500">
                      <Star size={10} className="fill-current" />
                      <Star size={10} className="fill-current" />
                      <Star size={10} className="fill-current" />
                      <Star size={10} className="fill-current" />
                      <Star size={10} className="fill-current" />
                    </div>
                    <p className="text-[10px] font-semibold text-left">Constância diária</p>
                    <p className="text-[8px] text-neutral-500 text-left">"Mudou minhas manhãs."</p>
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
                <a href={selectedPath.url}>
                  <Button className="w-full md:w-auto bg-[oklch(0.75_0.12_75)] hover:bg-[oklch(0.70_0.13_73)] text-[oklch(0.15_0.02_260)] font-bold px-6 py-5 rounded-xl shadow-md transition-all hover:scale-[1.03]">
                    {selectedPath.ctaText}
                    <ArrowRight size={16} className="ml-2" />
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works (Como Funciona) */}
      <section id="como-funciona" className="py-24 bg-[oklch(0.98_0.005_85)] relative">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-16 reveal">
            <div className="divider-gold mb-6">
              <span className="font-display text-xs tracking-widest text-[oklch(0.65_0.12_70)] uppercase font-bold px-4">
                Simplicidade
              </span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-[oklch(0.22_0.07_260)] mb-4">
              Sua Jornada em 3 Passos Simples
            </h2>
            <p className="font-serif text-lg text-muted-foreground">
              Desenhado para ser livre de distrações, ajudando você a focar inteiramente no essencial: sua oração e relacionamento com Deus.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto relative">
            
            {/* Step 1 */}
            <div className="relative flex flex-col items-center text-center px-4 reveal [animation-delay:0.1s]">
              {/* Connector line for desktop */}
              <div className="hidden md:block step-connector" />
              <div className="step-number bg-[oklch(0.22_0.07_260)] text-[oklch(0.82_0.10_80)] border border-[oklch(0.75_0.12_75/0.4)] shadow-md mb-6">
                I
              </div>
              <h3 className="font-display text-lg font-bold text-[oklch(0.22_0.07_260)] mb-3">
                Crie Sua Conta Gratuita
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Entre instantaneamente sem precisar de cartão ou dados financeiros. Acesso imediato às ferramentas de oração.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative flex flex-col items-center text-center px-4 reveal [animation-delay:0.2s]">
              {/* Connector line for desktop */}
              <div className="hidden md:block step-connector" />
              <div className="step-number bg-[oklch(0.22_0.07_260)] text-[oklch(0.82_0.10_80)] border border-[oklch(0.75_0.12_75/0.4)] shadow-md mb-6">
                II
              </div>
              <h3 className="font-display text-lg font-bold text-[oklch(0.22_0.07_260)] mb-3">
                Escolha Sua Prática do Dia
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Reze o Rosário interativo, acompanhe as leituras da Liturgia do Dia ou medite nos Salmos e Escrituras.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative flex flex-col items-center text-center px-4 reveal [animation-delay:0.3s]">
              <div className="step-number bg-[oklch(0.22_0.07_260)] text-[oklch(0.82_0.10_80)] border border-[oklch(0.75_0.12_75/0.4)] shadow-md mb-6">
                III
              </div>
              <h3 className="font-display text-lg font-bold text-[oklch(0.22_0.07_260)] mb-3">
                Crie Constância Espiritual
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Registre suas orações diárias automaticamente, construindo um hábito de oração e recolhimento sustentável.
              </p>
            </div>

          </div>

          <div className="text-center mt-12 reveal">
            <a href={getLoginUrl()}>
              <Button
                size="lg"
                className="bg-[oklch(0.22_0.07_260)] hover:bg-[oklch(0.28_0.08_260)] text-white hover:scale-[1.03] transition-all px-8 py-6 rounded-xl font-bold font-display tracking-wide"
              >
                Começar Minha Devoção Agora
              </Button>
            </a>
          </div>

        </div>
      </section>

      {/* Showcases of functionalities (Alternating Sections) */}
      <section id="recursos" className="py-24 bg-white border-t border-[oklch(0.88_0.01_260)]">
        <div className="container space-y-32">

          {/* Showcase 1: Rosário */}
          <div className="showcase-row items-center">
            <div className="reveal-left space-y-6 text-left">
              <div className="inline-flex items-center gap-2 bg-[oklch(0.55_0.14_15/0.08)] rounded-lg px-3 py-1 text-[oklch(0.55_0.14_15)] text-xs font-bold uppercase tracking-wider">
                Rosário Interativo
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-[oklch(0.22_0.07_260)] leading-tight">
                Silencie Sua Mente e Reze o Santo Rosário
              </h2>
              <p className="font-serif text-lg text-muted-foreground leading-relaxed">
                Desenvolvemos uma experiência de terço digital interativo que favorece a concentração e o recolhimento profundo. Acompanhe meditações contemplativas e teológicas para cada mistério de forma fluida.
              </p>
              <ul className="space-y-3 pt-2">
                {["Mistérios Gozosos, Dolorosos, Gloriosos e Luminosos", "Contador de Ave-Marias vibratório e visual de fácil uso", "Textos completos baseados nas Sagradas Escrituras", "Disponível a qualquer momento do dia para sua devoção"].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-foreground">
                    <Check size={16} className="text-[oklch(0.75_0.12_75)] flex-shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <div className="pt-4">
                <a href="/login?tab=cadastrar" className="inline-flex items-center text-sm font-bold text-[oklch(0.70_0.12_75)] hover:text-[oklch(0.55_0.12_70)] group">
                  Experimentar Santo Rosário Grátis
                  <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>
            
            <div className="reveal-right flex justify-center">
              <div className="relative w-full max-w-md">
                <div className="absolute inset-0 bg-[oklch(0.75_0.12_75/0.15)] rounded-2xl blur-xl scale-95" />
                <img
                  src={ROSARY_IMG}
                  alt="Santo Rosário Guiado"
                  className="relative rounded-2xl shadow-xl border border-[oklch(0.88_0.01_260)] w-full object-cover aspect-video hover:scale-[1.02] transition-transform duration-300"
                />
              </div>
            </div>
          </div>

          {/* Showcase 2: Liturgia */}
          <div className="showcase-row showcase-row--reverse items-center">
            <div className="reveal-left flex justify-center">
              {/* Mockup screen structure */}
              <div className="relative w-full max-w-sm bg-[oklch(0.97_0.01_85)] border border-[oklch(0.75_0.12_75/0.25)] rounded-2xl shadow-lg p-5 text-left text-[oklch(0.12_0.04_260)]">
                <div className="flex justify-between items-center border-b border-neutral-200 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-[oklch(0.75_0.12_75)]" />
                    <span className="font-display text-xs font-bold uppercase text-neutral-600">Liturgia Diária</span>
                  </div>
                  <span className="text-[10px] text-neutral-500 bg-neutral-200/50 rounded-full px-2.5 py-0.5">Hoje</span>
                </div>

                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Primeira Leitura</span>
                    <h4 className="text-xs font-bold text-neutral-800 mt-0.5">Atos dos Apóstolos (At 12, 1-11)</h4>
                  </div>

                  <div className="border-l-2 border-[oklch(0.75_0.12_75/0.5)] pl-3">
                    <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Evangelho do Dia</span>
                    <h4 className="text-xs font-bold text-neutral-800 mt-0.5">Segundo São Mateus (Mt 16, 13-19)</h4>
                    <p className="text-[11px] text-neutral-600 font-serif italic mt-1.5 leading-relaxed">
                      "Tu és o Cristo, o Filho do Deus vivo. E Jesus lhe disse: Bem-aventurado és tu, Simão Barjonas..."
                    </p>
                  </div>

                  <div className="flex items-center justify-between bg-white border border-neutral-100 rounded-xl p-2.5 shadow-sm">
                    <div className="flex items-center gap-2">
                      <Volume2 size={14} className="text-[oklch(0.75_0.12_75)]" />
                      <span className="text-[10px] font-semibold text-neutral-700">Reflexão em Áudio</span>
                    </div>
                    <span className="text-[9px] bg-[oklch(0.75_0.12_75/0.1)] text-[oklch(0.70_0.12_75)] font-bold px-2 py-0.5 rounded">4 min</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="reveal-right space-y-6 text-left">
              <div className="inline-flex items-center gap-2 bg-[oklch(0.65_0.14_70/0.08)] rounded-lg px-3 py-1 text-[oklch(0.65_0.14_70)] text-xs font-bold uppercase tracking-wider">
                Liturgia do Dia
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-[oklch(0.22_0.07_260)] leading-tight">
                Edifique Sua Rotina com a Liturgia do Dia
              </h2>
              <p className="font-serif text-lg text-muted-foreground leading-relaxed">
                Acompanhe as leituras litúrgicas oficiais da Igreja em união com a liturgia universal. Tenha acesso à primeira leitura, salmo, Evangelho do dia e reflexões espirituais escritas para nutrir sua alma todos os dias.
              </p>
              <ul className="space-y-3 pt-2">
                {["Calendário litúrgico oficial da Igreja Católica", "Reflexões espirituais exclusivas para meditar o Evangelho", "Leitura focada e sóbria que favorece o recolhimento", "Acesso diário 100% gratuito"].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-foreground">
                    <Check size={16} className="text-[oklch(0.75_0.12_75)] flex-shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <div className="pt-4">
                <a href="/login?tab=cadastrar" className="inline-flex items-center text-sm font-bold text-[oklch(0.70_0.12_75)] hover:text-[oklch(0.55_0.12_70)] group">
                  Acessar Liturgia Diária Grátis
                  <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>
          </div>

          {/* Showcase 3: Bíblia */}
          <div className="showcase-row items-center">
            <div className="reveal-left space-y-6 text-left">
              <div className="inline-flex items-center gap-2 bg-[oklch(0.40_0.10_260/0.08)] rounded-lg px-3 py-1 text-[oklch(0.40_0.10_260)] text-xs font-bold uppercase tracking-wider">
                Bíblia Sagrada
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-[oklch(0.22_0.07_260)] leading-tight">
                Sua Leitura Bíblica Sem Distrações ou Anúncios
              </h2>
              <p className="font-serif text-lg text-muted-foreground leading-relaxed">
                Explore todos os 73 livros das Sagradas Escrituras Católicas em uma interface perfeitamente limpa e minimalista. Encontre versículos e capítulos instantaneamente com nossa ferramenta de busca rápida.
              </p>
              <ul className="space-y-3 pt-2">
                {["Traduzido conforme os textos litúrgicos oficiais", "Busca rápida e integrada de termos e passagens", "Tipografia e design pensados para leitura noturna confortável", "Inclui todos os livros deuterocanônicos"].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-foreground">
                    <Check size={16} className="text-[oklch(0.75_0.12_75)] flex-shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <div className="pt-4">
                <a href="/login?tab=cadastrar" className="inline-flex items-center text-sm font-bold text-[oklch(0.70_0.12_75)] hover:text-[oklch(0.55_0.12_70)] group">
                  Abrir a Bíblia Sagrada Grátis
                  <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>

            <div className="reveal-right flex justify-center">
              <div className="relative w-full max-w-sm bg-white border border-neutral-200 rounded-2xl shadow-lg p-5 text-left text-[oklch(0.12_0.04_260)]">
                <div className="flex justify-between items-center pb-3 border-b border-neutral-100 mb-4">
                  <div className="flex items-center gap-1 bg-neutral-100 rounded-md px-2 py-1">
                    <span className="text-[10px] font-bold">Salmos 23</span>
                  </div>
                  <div className="relative flex-1 max-w-[150px] ml-4">
                    <Search size={10} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input 
                      type="text" 
                      placeholder="Buscar..." 
                      disabled 
                      className="w-full text-[9px] bg-neutral-50 border border-neutral-200 rounded-md pl-6 pr-2 py-1 text-neutral-400" 
                    />
                  </div>
                </div>

                <div className="font-serif text-xs leading-relaxed text-neutral-700 max-h-[160px] overflow-y-hidden space-y-3">
                  <p>
                    <span className="font-sans text-[8px] font-bold text-[oklch(0.75_0.12_75)] mr-1">1</span>
                    O Senhor é o meu pastor, nada me faltará.
                  </p>
                  <p>
                    <span className="font-sans text-[8px] font-bold text-[oklch(0.75_0.12_75)] mr-1">2</span>
                    Deitar-me faz em verdes pastos, guia-me mansamente a águas tranquilas.
                  </p>
                  <p>
                    <span className="font-sans text-[8px] font-bold text-[oklch(0.75_0.12_75)] mr-1">3</span>
                    Refrigera a minha alma; guia-me pelas veredas da justiça, por amor do seu nome.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Showcase 4: Mural de Intenções */}
          <div className="showcase-row showcase-row--reverse items-center">
            <div className="reveal-left flex justify-center">
              <div className="relative w-full max-w-sm space-y-3">
                
                {/* Mock Intentions Cards */}
                <div className="bg-[oklch(0.98_0.005_85)] border border-[oklch(0.75_0.12_75/0.2)] rounded-xl p-4 text-left shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider">Antônio R.</span>
                    <span className="text-[9px] bg-amber-50 text-amber-700 border border-amber-200/50 rounded-full px-2 py-0.5 font-bold">Urgente</span>
                  </div>
                  <p className="text-xs text-neutral-700 font-serif leading-relaxed">
                    "Peço orações pela cirurgia de coração do meu pai, Sr. Antônio. Que Deus guie as mãos dos médicos."
                  </p>
                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-neutral-200/50">
                    <div className="flex items-center gap-1 text-[10px] text-neutral-500 font-bold">
                      <Heart size={12} className="fill-[oklch(0.75_0.12_75)] text-[oklch(0.75_0.12_75)]" />
                      <span>28 pessoas rezando</span>
                    </div>
                    <span className="text-[9px] bg-[oklch(0.75_0.12_75)] text-[oklch(0.15_0.02_260)] font-bold px-2.5 py-1 rounded-md">Rezar Junto</span>
                  </div>
                </div>

                <div className="bg-white border border-neutral-100 rounded-xl p-4 text-left shadow-sm opacity-85">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[9px] text-neutral-500 font-bold">Juliana M.</span>
                  </div>
                  <p className="text-xs text-neutral-600 font-serif leading-relaxed">
                    "Agradeço pela graça alcançada da aprovação no concurso. Deus seja louvado!"
                  </p>
                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-neutral-100">
                    <div className="flex items-center gap-1 text-[10px] text-neutral-400">
                      <Heart size={12} className="fill-neutral-300 text-neutral-300" />
                      <span>42 pessoas rezando</span>
                    </div>
                    <span className="text-[9px] bg-neutral-200 text-neutral-700 font-bold px-2.5 py-1 rounded-md">Rezar Junto</span>
                  </div>
                </div>

              </div>
            </div>

            <div className="reveal-right space-y-6 text-left">
              <div className="inline-flex items-center gap-2 bg-[oklch(0.45_0.12_200/0.08)] rounded-lg px-3 py-1 text-[oklch(0.45_0.12_200)] text-xs font-bold uppercase tracking-wider">
                Mural de Intenções
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-[oklch(0.22_0.07_260)] leading-tight">
                Nunca Reze Sozinho: Intercessão e Comunidade
              </h2>
              <p className="font-serif text-lg text-muted-foreground leading-relaxed">
                Apresente suas dores, preces e agradecimentos ao Senhor no mural de intenções. Reze pelas necessidades dos seus irmãos e sinta o consolo espiritual de saber que existem pessoas orando por você em tempo real.
              </p>
              <ul className="space-y-3 pt-2">
                {["Publique intenções de forma pública ou anônima", "Acompanhe o contador de fiéis intercedendo por você", "Seja notificado quando um irmão rezar pela sua causa", "Crie correntes de novenas comunitárias focadas"].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-foreground">
                    <Check size={16} className="text-[oklch(0.75_0.12_75)] flex-shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <div className="pt-4">
                <a href="/login?tab=cadastrar" className="inline-flex items-center text-sm font-bold text-[oklch(0.70_0.12_75)] hover:text-[oklch(0.55_0.12_70)] group">
                  Pedir Oração à Comunidade
                  <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Counters / Stats Section (Full Width Dark Navy) */}
      <section className="py-20 bg-[oklch(0.22_0.07_260)] border-y border-[oklch(0.75_0.12_75/0.25)] relative overflow-hidden text-white">
        <div className="absolute inset-0 bg-pattern-cross opacity-10" />
        
        <div className="container relative">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 text-center">
            
            <div className="reveal">
              <div className="flex justify-center items-baseline">
                <AnimatedCounter value={50} suffix="+" />
              </div>
              <p className="text-xs md:text-sm text-[oklch(0.80_0.02_260)] font-display uppercase tracking-wider font-semibold mt-2">
                Orações Guiadas
              </p>
            </div>

            <div className="reveal [animation-delay:0.1s]">
              <div className="flex justify-center items-baseline">
                <AnimatedCounter value={73} />
              </div>
              <p className="text-xs md:text-sm text-[oklch(0.80_0.02_260)] font-display uppercase tracking-wider font-semibold mt-2">
                Livros Bíblicos
              </p>
            </div>

            <div className="reveal [animation-delay:0.2s]">
              <div className="flex justify-center items-baseline">
                <AnimatedCounter value={10} suffix="k+" />
              </div>
              <p className="text-xs md:text-sm text-[oklch(0.80_0.02_260)] font-display uppercase tracking-wider font-semibold mt-2">
                Intenções Partilhadas
              </p>
            </div>

            <div className="reveal [animation-delay:0.3s]">
              <div className="flex justify-center items-baseline">
                <AnimatedCounter value={365} />
              </div>
              <p className="text-xs md:text-sm text-[oklch(0.80_0.02_260)] font-display uppercase tracking-wider font-semibold mt-2">
                Liturgias Diárias
              </p>
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
              <Sun size={18} />
              Roteiro do Dia
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dailyRoutine.map((p) => (
                <div
                  key={p.id}
                  onClick={() => navigate("/oracao/" + p.id)}
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
                  <div className="w-8 h-8 rounded-full bg-[oklch(0.75_0.12_75/0.1)] text-[oklch(0.75_0.12_75)] flex items-center justify-center flex-shrink-0 group-hover:bg-[oklch(0.75_0.12_75)] group-hover:text-[oklch(0.15_0.02_260)] transition-all">
                    ▶
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Em Destaque (Trending) - Carrossel Horizontal */}
          <div className="max-w-5xl mx-auto">
            <h3 className="font-display text-xl font-bold text-[oklch(0.82_0.10_80)] mb-6 flex items-center gap-2">
              <Sparkles size={18} />
              Orações em Destaque
            </h3>
            {/* Scrollable list */}
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-neutral-800 scrollbar-track-transparent">
              {trendingPrayers.map((p) => (
                <div
                  key={p.id}
                  onClick={() => navigate("/oracao/" + p.id)}
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

      {/* Planos Section */}
      <section id="planos" className="py-24 bg-white border-t border-[oklch(0.88_0.01_260)]">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-16 reveal">
            <div className="divider-gold mb-6">
              <span className="font-display text-xs tracking-widest text-[oklch(0.65_0.12_70)] uppercase font-bold px-4">
                Devoção
              </span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-[oklch(0.22_0.07_260)] mb-4">
              Escolha Sua Caminhada
            </h2>
            <p className="font-serif text-lg text-muted-foreground">
              Acesso gratuito completo para sempre. Caso sinta o chamado para se aprofundar na fé, assine o plano Premium.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch">
            {plans.map((plan, idx) => (
              <div
                key={plan.name}
                className={`relative rounded-3xl p-8 border transition-all duration-300 flex flex-col justify-between reveal ${
                  plan.highlight
                    ? "bg-[oklch(0.22_0.07_260)] border-[oklch(0.75_0.12_75)] shadow-xl scale-105 z-10 text-white"
                    : "bg-[oklch(0.98_0.005_85)] border-neutral-200 hover:shadow-lg text-[oklch(0.22_0.07_260)]"
                }`}
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="badge-premium shadow-md">{plan.badge}</span>
                  </div>
                )}

                <div>
                  <div className="mb-6">
                    <h3 className={`font-display text-lg font-bold mb-2 ${plan.highlight ? "text-[oklch(0.88_0.08_80)]" : "text-[oklch(0.22_0.07_260)]"}`}>
                      {plan.name}
                    </h3>
                    <div className="flex items-baseline gap-1">
                      <span className={`font-display text-4xl font-bold ${plan.highlight ? "text-white" : "text-[oklch(0.22_0.07_260)]"}`}>
                        {plan.price}
                      </span>
                      <span className={`text-sm ${plan.highlight ? "text-[oklch(0.80_0.02_260)]" : "text-neutral-500"}`}>
                        /{plan.period}
                      </span>
                    </div>
                    {plan.note && (
                      <p className="text-[10px] text-neutral-400 mt-1 italic">{plan.note}</p>
                    )}
                  </div>

                  <ul className="space-y-4 mb-8">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-3 text-left">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${plan.highlight ? "bg-[oklch(0.75_0.12_75/0.2)]" : "bg-[oklch(0.75_0.12_75/0.1)]"}`}>
                          <Check size={12} className="text-[oklch(0.75_0.12_75)]" />
                        </div>
                        <span className={`text-sm ${plan.highlight ? "text-[oklch(0.85_0.02_260)]" : "text-neutral-700"}`}>
                          {f}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <a href={plan.url} className="mt-auto block w-full">
                  <Button
                    className={`w-full py-6 font-bold font-display rounded-xl text-sm transition-transform hover:scale-[1.02] ${
                      plan.highlight
                        ? "bg-[oklch(0.75_0.12_75)] hover:bg-[oklch(0.70_0.13_73)] text-[oklch(0.15_0.02_260)] shadow-md"
                        : "bg-[oklch(0.22_0.07_260)] hover:bg-[oklch(0.28_0.08_260)] text-white"
                    }`}
                  >
                    {plan.cta}
                  </Button>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-[oklch(0.98_0.005_85)] border-t border-[oklch(0.88_0.01_260)]">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="divider-gold mb-6">
              <span className="font-display text-xs tracking-widest text-[oklch(0.65_0.12_70)] uppercase font-bold px-4">
                Dúvidas
              </span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-[oklch(0.22_0.07_260)] mb-4">
              Perguntas Frequentes
            </h2>
            <p className="font-serif text-lg text-muted-foreground">
              Tudo o que você precisa saber sobre o Sanctificare e nossa caminhada.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-xl border border-neutral-200/60 shadow-sm overflow-hidden transition-all duration-300"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left font-display text-base font-semibold text-[oklch(0.22_0.07_260)] hover:bg-neutral-50 transition-colors"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp size={18} className="text-[oklch(0.75_0.12_75)] transition-transform duration-300" />
                    ) : (
                      <ChevronDown size={18} className="text-[oklch(0.70_0.03_260)] transition-transform duration-300" />
                    )}
                  </button>
                  <div
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${
                      isOpen ? "max-h-[300px] border-t border-neutral-100" : "max-h-0"
                    }`}
                  >
                    <p className="px-6 py-5 font-serif text-sm sm:text-base text-muted-foreground leading-relaxed">
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
          <img src={LOGO_IMG} alt="Sanctificare logo" className="w-20 h-20 rounded-full mx-auto mb-8 shadow-gold animate-pulse" />
          
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
              <img src={LOGO_IMG} alt="Sanctificare" className="w-8 h-8 rounded-full" />
              <span className="font-display text-[oklch(0.82_0.10_80)] font-semibold tracking-wide">Sanctificare</span>
            </div>

            <div className="md:col-span-4 text-center">
              <p className="font-serif text-base italic">
                "Tudo posso naquele que me fortalece." <br /> — Filipenses 4:13
              </p>
            </div>

            <div className="md:col-span-4 flex justify-center md:justify-end gap-6 text-sm">
              <a href="#recursos" className="hover:text-white transition-colors">Recursos</a>
              <a href="#como-funciona" className="hover:text-white transition-colors">Como funciona</a>
              <a href="#planos" className="hover:text-white transition-colors">Planos</a>
            </div>

          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
            <p>© 2026 Sanctificare. Todos os direitos reservados.</p>
            <div className="flex gap-4">
              <span className="cursor-pointer hover:text-white transition-colors">Termos de Uso</span>
              <span className="cursor-pointer hover:text-white transition-colors">Política de Privacidade</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
