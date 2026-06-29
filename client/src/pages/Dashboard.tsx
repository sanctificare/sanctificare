import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import AppNav from "@/components/AppNav";
import { trpc } from "@/lib/trpc";
import { Heart, BookOpen, Sun, Crown, ChevronRight, Clock, Flame, CheckCircle2, Circle, Calendar, BarChart2, Users, Check, Play, BookMarked } from "lucide-react";
import { RosaryIcon } from "@/components/RosaryIcon";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";
import { NOVENAS } from "@/data/novenas";
import { toast } from "sonner";
import { DashboardActiveNovena, NOVENA_PROGRESS_STORAGE_KEY, buildDashboardActiveNovena, parseNovenaProgress } from "@/lib/novenaProgress";

const LOGO_IMG = "/assets/sanctificare-logo-v2.webp";

const quickLinks = [
  { href: "/plano-diario", label: "Plano Diário", desc: "Suas metas espirituais", image: "/assets/dashboard/plano-diario.png", overlay: "oklch(0.25 0.09 75 / 0.60)" },
  { href: "/rosario", label: "Rosário", desc: "Reze o Terço completo", image: "/assets/dashboard/rosario.png", overlay: "oklch(0.22 0.08 260 / 0.60)" },
  { href: "/oracoes", label: "Orações", desc: "Orações da tradição", image: "/assets/dashboard/oracoes.png", overlay: "oklch(0.28 0.08 145 / 0.60)" },
  { href: "/lectio", label: "Lectio Divina", desc: "Leitura orante", image: "/assets/dashboard/lectio.png", overlay: "oklch(0.32 0.11 240 / 0.60)" },
  { href: "/via-sacra", label: "Via-Sacra", desc: "14 estações com guia", image: "/assets/dashboard/via-sacra.png", overlay: "oklch(0.36 0.15 20 / 0.60)" },
  { href: "/vela-virtual", label: "Vela Virtual", desc: "Silêncio e oração", image: "/assets/dashboard/vela-virtual.png", overlay: "oklch(0.50 0.10 85 / 0.56)" },
  { href: "/musica-sacra", label: "Música Sacra", desc: "Meditação e contemplação", image: "/assets/dashboard/musica-sacra.png", overlay: "oklch(0.34 0.10 300 / 0.58)" },
  { href: "/novenas", label: "Novenas", desc: "Jornadas de 9 dias de devoção", image: "/assets/dashboard/novenas.png", overlay: "oklch(0.28 0.08 260 / 0.60)" },
  { href: "/videos", label: "Vídeos", desc: "Histórias e passagens com IA", image: "/assets/dashboard/videos.png", overlay: "oklch(0.40 0.12 15 / 0.60)" },
  { href: "/intencoes", label: "Intenções", desc: "Ore com a comunidade", image: "/assets/dashboard/intencoes.png", overlay: "oklch(0.30 0.10 190 / 0.60)" },
  { href: "/liturgia", label: "Liturgia", desc: "Leituras e salmo do dia", image: "/assets/dashboard/liturgia.png", overlay: "oklch(0.40 0.15 80 / 0.60)" },
];

function getDayOfWeek() {
  const days = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
  return days[new Date().getDay()];
}

function getFormattedDate() {
  return new Date().toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" });
}

function getMystery() {
  const day = new Date().getDay();
  const mysteries: Record<number, string> = {
    0: "Mistérios Gloriosos",
    1: "Mistérios Gozosos",
    2: "Mistérios Dolorosos",
    3: "Mistérios Gloriosos",
    4: "Mistérios Luminosos",
    5: "Mistérios Dolorosos",
    6: "Mistérios Gozosos",
  };
  return mysteries[day] || "Mistérios Gozosos";
}

const fallbackVerses = [
  { text: "Tudo posso naquele que me fortalece.", ref: "Filipenses 4:13" },
  { text: "O Senhor é o meu pastor, nada me faltará.", ref: "Salmo 23:1" },
  { text: "Guarda-me como a pupila dos olhos, esconde-me à sombra das tuas asas.", ref: "Salmo 17:8" },
  { text: "O Senhor é minha luz e minha salvação, a quem temerei?", ref: "Salmo 27:1" },
  { text: "Confia no Senhor de todo o teu coração e não te apoies no teu próprio entendimento.", ref: "Provérbios 3:5" },
  { text: "Buscai primeiro o Reino de Deus e a sua justiça, e tudo o mais vos será acrescentado.", ref: "Mateus 6:33" },
  { text: "Eu sou o caminho, a verdade e a vida; ninguém vem ao Pai senão por mim.", ref: "João 14:6" },
  { text: "Acheguemo-nos, portanto, confiadamente, junto ao trono da graça, a fim de alcançarmos misericórdia e acharmos graça.", ref: "Hebreus 4:16" },
  { text: "O amor é paciente, o amor é bondoso. Não inveja, não se vangloria, não se orgulha.", ref: "1 Coríntios 13:4" },
  { text: "Não andeis ansiosos por coisa alguma; antes em tudo apresentai as vossas petições a Deus.", ref: "Filipenses 4:6" }
];

function getLiturgicalColorStyle(color?: string | null) {
  const c = color?.toLowerCase() || "";
  if (c.includes("verde")) {
    return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
  }
  if (c.includes("roxo") || c.includes("violeta")) {
    return "bg-purple-500/20 text-purple-300 border-purple-500/30";
  }
  if (c.includes("vermelho")) {
    return "bg-rose-500/20 text-rose-300 border-rose-500/30";
  }
  if (c.includes("branco") || c.includes("dourado")) {
    return "bg-amber-100/10 text-amber-200 border-amber-300/30";
  }
  if (c.includes("rosa")) {
    return "bg-pink-500/20 text-pink-300 border-pink-500/30";
  }
  if (c.includes("preto")) {
    return "bg-neutral-800/50 text-neutral-300 border-neutral-700/50";
  }
  return "bg-white/10 text-white/80 border-white/20";
}

function capitalize(str: string) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function calculateStreak(logs: any[] | undefined) {
  if (!logs || logs.length === 0) {
    return { currentStreak: 0, prayedToday: false };
  }

  const formatDateStr = (dateInput: string | Date) => {
    const d = new Date(dateInput);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const todayStr = formatDateStr(new Date());
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = formatDateStr(yesterday);

  const prayerDates = new Set<string>();
  logs.forEach(log => {
    if (log.completedAt) {
      prayerDates.add(formatDateStr(log.completedAt));
    }
  });

  const prayedToday = prayerDates.has(todayStr);
  const prayedYesterday = prayerDates.has(yesterdayStr);

  if (!prayedToday && !prayedYesterday) {
    return { currentStreak: 0, prayedToday: false };
  }

  let streak = 0;
  let checkDate = new Date();
  
  if (!prayedToday) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  while (true) {
    const dateStr = formatDateStr(checkDate);
    if (prayerDates.has(dateStr)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return { currentStreak: streak, prayedToday };
}

function getWeeklyChartData(logs: any[] | undefined) {
  const daysOfWeek = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const data = [];
  
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    
    const dayName = daysOfWeek[d.getDay()];
    const dateStr = d.toLocaleDateString("pt-BR", { day: "numeric", month: "numeric" });
    
    const count = logs?.filter(log => {
      if (!log.completedAt) return false;
      const logDate = new Date(log.completedAt);
      return logDate.getDate() === d.getDate() &&
             logDate.getMonth() === d.getMonth() &&
             logDate.getFullYear() === d.getFullYear();
    }).length || 0;
    
    data.push({
      name: dayName,
      date: dateStr,
      quantidade: count,
    });
  }
  
  return data;
}

export default function Dashboard() {
  const { user, isAuthenticated, loading } = useAuth();
  const { data: logs } = trpc.prayers.getRecentLogs.useQuery(undefined, { enabled: isAuthenticated });
  const { data: allLogs } = trpc.prayers.getAllLogs.useQuery(undefined, { enabled: isAuthenticated });
  const { data: liturgy } = trpc.liturgy.getByDate.useQuery(undefined, { enabled: isAuthenticated });
  const { data: dailyPlan } = trpc.dailyPlan.getStatus.useQuery(undefined, { enabled: isAuthenticated });

  const utils = trpc.useUtils();
  const { data: intentions } = trpc.intentions.list.useQuery(undefined, { enabled: isAuthenticated });
  const { data: myPrayedIntentions } = trpc.intentions.myPrayed.useQuery(undefined, { enabled: isAuthenticated });

  const prayMutation = trpc.intentions.pray.useMutation({
    onSuccess: async (res) => {
      if (res.alreadyPrayed) {
        toast.info("Você já se uniu a esta intenção.");
      } else {
        toast.success("Oração registrada. Que Deus ouça as nossas preces.");
      }
      await utils.intentions.list.invalidate();
      await utils.intentions.myPrayed.invalidate();
      await utils.dailyPlan.getStatus.invalidate();
    },
    onError: (err) => {
      toast.error(err.message || "Erro ao registrar oração.");
    }
  });

  const handlePrayForIntention = (intentionId: number) => {
    prayMutation.mutate({ intentionId });
  };

  const [activeNovena, setActiveNovena] = useState<DashboardActiveNovena | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      try {
        const raw = localStorage.getItem(NOVENA_PROGRESS_STORAGE_KEY);
        const progressMap = parseNovenaProgress(raw);
        setActiveNovena(buildDashboardActiveNovena(progressMap, NOVENAS));
      } catch (err) {
        console.error("Erro ao ler progresso de novenas no dashboard:", err);
        setActiveNovena(null);
      }
    }
  }, [isAuthenticated]);

  const logPrayerMutation = trpc.prayers.logPrayer.useMutation({
    onSuccess: () => {
      toast.success("Liturgia Diária registrada no seu histórico!");
      utils.prayers.getRecentLogs.invalidate();
      utils.prayers.getAllLogs.invalidate();
      utils.dailyPlan.getStatus.invalidate();
    },
    onError: (err) => {
      toast.error(err.message || "Erro ao registrar liturgia.");
    }
  });

  const liturgiaLida = !!allLogs?.some(log => {
    if (!log.completedAt) return false;
    const logDate = new Date(log.completedAt);
    const isToday = logDate.getDate() === new Date().getDate() &&
                    logDate.getMonth() === new Date().getMonth() &&
                    logDate.getFullYear() === new Date().getFullYear();
    if (!isToday) return false;
    return log.prayerType === "liturgia";
  });

  const handleToggleLiturgia = () => {
    if (liturgiaLida) {
      toast.info("Você já concluiu a Liturgia de hoje!");
      return;
    }
    logPrayerMutation.mutate({
      prayerType: "liturgia",
      prayerName: "Liturgia Diária",
    });
  };

  const streak = calculateStreak(allLogs);
  const chartData = getWeeklyChartData(allLogs);

  const prayedRosaryToday = !!allLogs?.some(log => {
    if (!log.completedAt) return false;
    const logDate = new Date(log.completedAt);
    const isToday = logDate.getDate() === new Date().getDate() &&
                    logDate.getMonth() === new Date().getMonth() &&
                    logDate.getFullYear() === new Date().getFullYear();
    if (!isToday) return false;
    const name = log.prayerName?.toLowerCase() || "";
    const type = log.prayerType?.toLowerCase() || "";
    return name.includes("terço") || name.includes("rosário") || type.includes("rosario") || type.includes("terco");
  });

  const prayedLectioToday = !!allLogs?.some(log => {
    if (!log.completedAt) return false;
    const logDate = new Date(log.completedAt);
    const isToday = logDate.getDate() === new Date().getDate() &&
                    logDate.getMonth() === new Date().getMonth() &&
                    logDate.getFullYear() === new Date().getFullYear();
    if (!isToday) return false;
    const name = log.prayerName?.toLowerCase() || "";
    const type = log.prayerType?.toLowerCase() || "";
    return name.includes("lectio") || type.includes("lectio");
  });

  const prayedNovenaToday = !!allLogs?.some(log => {
    if (!log.completedAt) return false;
    const logDate = new Date(log.completedAt);
    const isToday = logDate.getDate() === new Date().getDate() &&
                    logDate.getMonth() === new Date().getMonth() &&
                    logDate.getFullYear() === new Date().getFullYear();
    if (!isToday) return false;
    return log.prayerType === "novena";
  });

  const activeNovenaTotalDays = activeNovena
    ? Math.max(1, activeNovena.novena.days.length)
    : 9;
  const activeNovenaProgressPercent = activeNovena
    ? Math.round((activeNovena.completedCount / activeNovenaTotalDays) * 100)
    : 0;

  // Determina o versículo dinâmico do dia baseado no Salmo Responsorial ou na lista de fallback
  const dynamicVerse = (() => {
    if (liturgy?.psalm?.refrao) {
      const cleanRefrao = liturgy.psalm.refrao.replace(/^["'«“]|["'»”]$/g, "").trim();
      return {
        text: cleanRefrao,
        ref: liturgy.psalm.referencia || "Salmo Responsorial"
      };
    }
    const day = new Date().getDate();
    return fallbackVerses[day % fallbackVerses.length];
  })();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <img src={LOGO_IMG} alt="Sanctificare" className="w-16 h-16 rounded-full animate-pulse" />
          <p className="font-serif text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <img src={LOGO_IMG} alt="Sanctificare" className="w-16 h-16 rounded-full mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold mb-2">Acesso Restrito</h2>
          <p className="text-muted-foreground mb-6">Entre para retomar sua jornada de oração no app.</p>
          <a href={getLoginUrl()}>
            <Button className="bg-[oklch(0.22_0.07_260)] text-white">Entrar</Button>
          </a>
        </div>
      </div>
    );
  }

  const firstName = user?.name?.split(" ")[0] || "Fiel";

  return (
    <div className="min-h-screen bg-[oklch(0.97_0.01_85)] relative overflow-hidden">
      {/* Golden pattern background */}
      <div className="absolute inset-0 bg-pattern-cross opacity-[0.02] pointer-events-none" />
      
      <AppNav />

      <main className="container py-8 relative z-10">
        {/* Saudação */}
        <div className="mb-8 animate-fade-in">
          <div className="bg-[oklch(0.22_0.07_260)] rounded-2xl p-8 relative overflow-hidden shadow-lg">
            <div className="absolute inset-0 bg-pattern-cross opacity-20" />
            <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <p className="text-[oklch(0.70_0.03_260)] text-sm font-medium mb-1">{getDayOfWeek()}, {getFormattedDate()}</p>
                <div className="flex items-center gap-3 flex-wrap mb-2">
                  <h1 className="font-display text-3xl font-bold text-white">
                    Bem-vindo, {firstName}
                  </h1>
                  {streak.currentStreak > 0 && (
                    <div className="bg-amber-500/20 text-amber-200 border border-amber-500/30 rounded-full px-3 py-1 flex items-center gap-1.5 text-xs font-semibold animate-pulse">
                      <Flame size={14} className={streak.prayedToday ? "text-amber-400 fill-amber-400" : "text-amber-200"} />
                      <span>{streak.currentStreak} {streak.currentStreak === 1 ? "dia" : "dias"} de ofensiva</span>
                    </div>
                  )}
                </div>
                <p className="font-serif text-[oklch(0.80_0.02_260)] text-base">
                  Hoje a Igreja contempla os <span className="text-[oklch(0.82_0.10_80)] font-semibold">{getMystery()}</span>
                </p>
                {liturgy?.celebration && (
                  <div className="mt-3 flex flex-wrap items-center gap-2 animate-fade-in">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getLiturgicalColorStyle(liturgy.color)}`}>
                      {liturgy.color ? capitalize(liturgy.color) : "Tempo Litúrgico"}
                    </span>
                    <span className="text-[oklch(0.90_0.01_260)] text-sm font-medium">
                      {liturgy.celebration}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <Link href="/rosario">
                  <Button className="bg-[oklch(0.75_0.12_75)] hover:bg-[oklch(0.70_0.13_73)] text-[oklch(0.15_0.02_260)] font-semibold">
                    <RosaryIcon size={15} className="mr-2" />
                    Rezar o Rosário
                  </Button>
                </Link>
                <Link href="/liturgia">
                  <Button variant="outline" className="border-[oklch(0.75_0.12_75/0.4)] text-white hover:bg-[oklch(0.75_0.12_75/0.1)] bg-transparent">
                    <Sun size={15} className="mr-2" />
                    Liturgia
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>



        {/* Acesso Rápido */}
        <div className="mb-8">
          <h2 className="font-display text-xl font-bold text-[oklch(0.22_0.07_260)] mb-4">Acesso Rápido</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3 md:gap-4">
            {quickLinks.map(({ href, label, desc, image, overlay }) => (
              <Link key={href} href={href}>
                <div className="cover-card aspect-square group cursor-pointer">
                  <img
                    src={image}
                    alt={label}
                    className="cover-card-image"
                    loading="lazy"
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(to top, oklch(0.10 0.03 260 / 0.86) 0%, ${overlay} 56%, oklch(0.10 0.02 260 / 0.12) 100%)`,
                    }}
                  />
                  <div className="cover-card-content">
                    <p className="cover-card-title">{label}</p>
                    <p className="cover-card-desc hidden md:block">{desc}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Intenções da Comunidade + Novena Ativa */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 animate-fade-in">
          {/* Intenções da Comunidade */}
          <div className="lg:col-span-2 prayer-card p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Users size={16} className="text-[oklch(0.65_0.14_70)]" />
                <h3 className="font-display text-sm font-semibold text-[oklch(0.22_0.07_260)] uppercase tracking-[0.15em]">
                  Intenções da Comunidade
                </h3>
              </div>
              <div className="divider-gold mb-4" />
              
              <div className="space-y-3">
                {intentions && intentions.length > 0 ? (
                  intentions.slice(0, 3).map((intention) => {
                    const alreadyPrayed = myPrayedIntentions?.includes(intention.id);
                    return (
                      <div key={intention.id} className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-white/10 dark:bg-black/5 hover:bg-white/20 transition-all duration-300">
                        <div className="flex-1 min-w-0 pr-4">
                          <p className="text-sm font-semibold text-foreground truncate">{intention.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">
                            Por: {intention.isAnonymous ? "Anônimo" : intention.authorName} • {intention.prayerCount} {intention.prayerCount === 1 ? "oração" : "orações"}
                          </p>
                        </div>
                        <Button 
                          size="sm"
                          variant={alreadyPrayed ? "outline" : "default"}
                          disabled={prayMutation.isPending}
                          onClick={() => handlePrayForIntention(intention.id)}
                          className={alreadyPrayed 
                            ? "border border-emerald-600/30 text-emerald-600 hover:bg-emerald-50/50 bg-emerald-500/5 rounded-md text-xs font-semibold px-3 h-8 flex items-center gap-1 shadow-sm transition-all"
                            : "bg-[oklch(0.22_0.07_260)] text-[oklch(0.97_0.01_85)] rounded-md border border-[oklch(0.75_0.12_75/0.3)] shadow-sm hover:shadow-md hover:border-[oklch(0.75_0.12_75/0.6)] text-xs font-semibold px-3 h-8 flex items-center gap-1 transition-all"
                          }
                        >
                          {alreadyPrayed ? (
                            <>
                              <Check size={12} />
                              <span>Rezado</span>
                            </>
                          ) : (
                            <>
                              <Heart size={12} className="fill-current" />
                              <span>Rezar</span>
                            </>
                          )}
                        </Button>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">Nenhuma intenção ativa no momento.</p>
                )}
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-border/30 text-right">
              <Link href="/intencoes" className="text-xs font-semibold text-[oklch(0.22_0.07_260)] hover:underline flex items-center justify-end gap-1">
                Ver todas as intenções <ChevronRight size={12} />
              </Link>
            </div>
          </div>

          {/* Novena Ativa ou Recomendada */}
          <div className="prayer-card p-6 flex flex-col justify-between">
            {activeNovena ? (
              <>
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <BookMarked size={16} className="text-[oklch(0.65_0.14_70)]" />
                    <h3 className="font-display text-sm font-semibold text-[oklch(0.22_0.07_260)] uppercase tracking-[0.15em]">
                      Sua Novena Ativa
                    </h3>
                  </div>
                  <div className="divider-gold mb-4" />
                  
                  <div className="mb-4">
                    <h4 className="text-sm font-bold text-foreground mb-1">{activeNovena.novena.name}</h4>
                    <p className="text-xs text-muted-foreground">Dia {activeNovena.completedCount} de {activeNovenaTotalDays} concluído</p>
                  </div>

                  <div className="w-full bg-black/5 rounded-full h-2 overflow-hidden mb-4">
                    <div 
                      className="bg-[oklch(0.75_0.12_75)] h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${activeNovenaProgressPercent}%` }}
                    />
                  </div>
                </div>

                <Link href={`/novenas/${activeNovena.novena.slug}`}>
                  <Button className="w-full bg-[oklch(0.75_0.12_75)] hover:bg-[oklch(0.70_0.13_73)] text-[oklch(0.15_0.02_260)] font-bold text-xs uppercase tracking-wider py-2.5 rounded-lg flex items-center justify-center gap-1.5 shadow-sm hover:shadow-md transition-all">
                    <Play size={12} className="fill-current" />
                    Rezar o Dia {activeNovena.nextDay}
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <BookMarked size={16} className="text-[oklch(0.65_0.14_70)]" />
                    <h3 className="font-display text-sm font-semibold text-[oklch(0.22_0.07_260)] uppercase tracking-[0.15em]">
                      Novenas
                    </h3>
                  </div>
                  <div className="divider-gold mb-4" />
                  
                  <div className="mb-4">
                    <h4 className="text-sm font-bold text-foreground mb-1">Novena de São José</h4>
                    <p className="text-xs text-muted-foreground">Que tal iniciar uma caminhada de fé com o padroeiro da Igreja universal?</p>
                  </div>
                </div>

                <Link href="/novenas/novena-de-sao-jose">
                  <Button className="w-full bg-[oklch(0.22_0.07_260)] text-[oklch(0.97_0.01_85)] border border-[oklch(0.75_0.12_75/0.3)] shadow-sm hover:shadow-md hover:border-[oklch(0.75_0.12_75/0.6)] font-bold text-xs uppercase tracking-wider py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-all">
                    Começar Novena
                    <ChevronRight size={14} />
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>



        {/* Versículo do Dia + Histórico */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Versículo */}
          <div className="lg:col-span-2 prayer-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen size={16} className="text-[oklch(0.65_0.14_70)]" />
              <h3 className="font-display text-sm font-semibold text-[oklch(0.22_0.07_260)] uppercase tracking-[0.15em]">
                Versículo do Dia
              </h3>
            </div>
            <div className="divider-gold mb-4" />
            <blockquote className="font-serif text-xl italic text-[oklch(0.25_0.03_260)] leading-relaxed mb-3 tracking-tight">
              "{dynamicVerse.text}"
            </blockquote>
            <p className="text-sm font-semibold text-[oklch(0.65_0.14_70)]">{dynamicVerse.ref}</p>
            <div className="mt-6">
              <Link href="/liturgia">
                <Button variant="outline" size="sm" className="text-[oklch(0.22_0.07_260)] border-[oklch(0.22_0.07_260/0.3)]">
                  Ver Liturgia do Dia
                  <ChevronRight size={14} className="ml-1" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Histórico recente */}
          <div className="prayer-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock size={16} className="text-[oklch(0.40_0.10_260)]" />
              <h3 className="font-display text-sm font-semibold text-[oklch(0.22_0.07_260)] uppercase tracking-[0.15em]">
                Orações Recentes
              </h3>
            </div>
            <div className="divider-gold mb-4" />
            {logs && logs.length > 0 ? (
              <div className="space-y-3">
                {logs.slice(0, 5).map((log: any) => (
                  <div key={log.id} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[oklch(0.22_0.07_260/0.08)] flex items-center justify-center flex-shrink-0">
                      <Heart size={13} className="text-[oklch(0.55_0.14_15)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{log.prayerName}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(log.completedAt).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <Heart size={28} className="text-muted-foreground mx-auto mb-2 opacity-40" />
                <p className="text-sm text-muted-foreground">Nenhuma oração foi registrada ainda.</p>
                <Link href="/oracoes">
                  <Button size="sm" variant="outline" className="mt-3 text-xs">
                    Começar a rezar
                  </Button>
                </Link>
              </div>
            )}
            {logs && logs.length > 0 && (
              <Link href="/perfil">
                <Button variant="outline" size="sm" className="w-full mt-4 text-xs">
                  Ver histórico completo
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Banner Premium */}
        <div className="mt-6 rounded-2xl bg-gradient-to-r from-[oklch(0.22_0.07_260)] to-[oklch(0.30_0.09_255)] p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[oklch(0.75_0.12_75/0.2)] border border-[oklch(0.75_0.12_75/0.4)] flex items-center justify-center">
              <Crown size={22} className="text-[oklch(0.82_0.10_80)]" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-white">Aprofunde sua vida de oração</h3>
              <p className="text-sm text-[oklch(0.75_0.03_260)]">Novenas, meditações e áudios para acompanhar com mais constância a sua caminhada espiritual</p>
            </div>
          </div>
          <Link href="/premium">
            <Button className="bg-[oklch(0.75_0.12_75)] hover:bg-[oklch(0.70_0.13_73)] text-[oklch(0.15_0.02_260)] font-semibold whitespace-nowrap">
              Conhecer planos
              <ChevronRight size={15} className="ml-1" />
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
