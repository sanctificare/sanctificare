import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Heart, BookOpen, Sun, Crown, ChevronRight, Clock, Flame, CheckCircle2, Circle, Calendar, BarChart2, Users, Check, Play, BookMarked, Cross, Volume2, ArrowRight } from "lucide-react";
import { RosaryIcon } from "@/components/RosaryIcon";
import { PrayingHandsIcon } from "@/components/PrayingHandsIcon";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";
import { NOVENAS } from "@/data/novenas";
import { toast } from "sonner";
import { DashboardActiveNovena, NOVENA_PROGRESS_STORAGE_KEY, buildDashboardActiveNovena, parseNovenaProgress } from "@/lib/novenaProgress";

const LOGO_IMG = "/assets/logo-sanctificare.webp";

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
  { href: "/biblia", label: "Bíblia Sagrada", desc: "Os 73 livros das Escrituras", image: "/assets/dashboard/biblia.png", overlay: "oklch(0.35 0.10 40 / 0.60)" },
];

const secondaryLinks = [
  { href: "/oracoes", label: "Orações", desc: "Devocionário tradicional", icon: Heart, color: "text-[oklch(0.70_0.15_15)] bg-[oklch(0.70_0.15_15/0.12)] border-[oklch(0.70_0.15_15/0.25)]" },
  { href: "/lectio", label: "Lectio Divina", desc: "Leitura orante", icon: BookOpen, color: "text-[oklch(0.65_0.15_240)] bg-[oklch(0.65_0.15_240/0.12)] border-[oklch(0.65_0.15_240/0.25)]" },
  { href: "/via-sacra", label: "Via-Sacra", desc: "14 estações meditadas", icon: Cross, color: "text-[oklch(0.65_0.15_20)] bg-[oklch(0.65_0.15_20/0.12)] border-[oklch(0.65_0.15_20/0.25)]" },
  { href: "/vela-virtual", label: "Vela Virtual", desc: "Silêncio e oração", icon: Flame, color: "text-[oklch(0.75_0.15_85)] bg-[oklch(0.75_0.15_85/0.12)] border-[oklch(0.75_0.15_85/0.25)]" },
  { href: "/musica-sacra", label: "Música Sacra", desc: "Cantos para contemplação", icon: Volume2, color: "text-[oklch(0.65_0.15_300)] bg-[oklch(0.65_0.15_300/0.12)] border-[oklch(0.65_0.15_300/0.25)]" },
  { href: "/videos", label: "Vídeos", desc: "Passagens ilustradas", icon: Play, color: "text-[oklch(0.65_0.15_15)] bg-[oklch(0.65_0.15_15/0.12)] border-[oklch(0.65_0.15_15/0.25)]" },
  { href: "/intencoes", label: "Intenções", desc: "Mural da comunidade", icon: Users, color: "text-[oklch(0.65_0.15_190)] bg-[oklch(0.65_0.15_190/0.12)] border-[oklch(0.65_0.15_190/0.25)]" },
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

  const [metasConfig] = useState<any>(() => {
    try {
      const saved = localStorage.getItem("sanctificare.daily_plan.metas");
      return saved ? JSON.parse(saved) : {
        liturgia: true,
        rosario: true,
        lectio: true,
        oracoes: false,
        intercessao: false,
        novena: true,
      };
    } catch {
      return {
        liturgia: true,
        rosario: true,
        lectio: true,
        oracoes: false,
        intercessao: false,
        novena: true,
      };
    }
  });

  const dailyMetas = [
    { key: "liturgia", enabled: metasConfig.liturgia, completed: !!dailyPlan?.liturgyCompleted },
    { key: "rosario", enabled: metasConfig.rosario, completed: !!dailyPlan?.rosaryCompleted },
    { key: "lectio", enabled: metasConfig.lectio, completed: !!dailyPlan?.lectioCompleted },
    { key: "oracoes", enabled: metasConfig.oracoes, completed: !!dailyPlan?.prayersCompleted },
    { key: "intercessao", enabled: metasConfig.intercessao, completed: !!dailyPlan?.intercessionCompleted },
    { key: "novena", enabled: metasConfig.novena && !!activeNovena, completed: !!dailyPlan?.novenaCompleted },
  ];

  const activeMetas = dailyMetas.filter(meta => meta.enabled);
  const completedMetasCount = activeMetas.filter(meta => meta.completed).length;
  const activeMetasCount = activeMetas.length;
  const dailyPlanProgressPercent = activeMetasCount > 0
    ? Math.round((completedMetasCount / activeMetasCount) * 100)
    : 0;

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
    <div className="min-h-screen bg-[oklch(0.09_0.02_260)] text-white relative overflow-hidden pb-12">
      {/* Golden pattern background */}
      <div className="absolute inset-0 bg-pattern-cross opacity-[0.02] pointer-events-none" />
      
      <main className="container py-8 relative z-10">
        {/* Saudação */}
        <div className="mb-8 animate-fade-in">
          <div className="bg-[oklch(0.22_0.07_260)] rounded-2xl p-8 relative overflow-hidden shadow-lg border border-[oklch(0.75_0.12_75/0.25)]">
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
                      <span>{streak.currentStreak} {streak.currentStreak === 1 ? "dia" : "dias"} de perseverança</span>
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

        {/* Destaques Principais - Layout Editorial Assimétrico */}
        <div className="mb-8 animate-fade-in">
          <h2 className="font-display text-xl font-bold text-white/95 mb-4">Destaques</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Coluna da Esquerda (Col 1) */}
            <div className="lg:col-span-1 flex flex-col gap-6">
              {/* Card 1: Santo Rosário */}
              <Link href="/rosario">
                <div className="relative overflow-hidden rounded-2xl flex-1 min-h-[340px] group cursor-pointer border border-[oklch(0.75_0.12_75/0.2)] shadow-md hover:shadow-xl hover:border-[oklch(0.75_0.12_75/0.4)] transition-all duration-300 flex flex-col justify-between p-6">
                  <img
                    src="/assets/dashboard/rosario.png"
                    alt="Santo Rosário"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-[oklch(0.12_0.03_260/0.95)] via-[oklch(0.12_0.03_260/0.60)] to-[oklch(0.12_0.03_260/0.20)]"
                  />
                  <div className="relative z-10 flex justify-between items-start">
                    <span className="bg-[oklch(0.75_0.12_75/0.2)] text-[oklch(0.88_0.08_80)] border border-[oklch(0.75_0.12_75/0.3)] rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-sm">
                      Devocional
                    </span>
                    <RosaryIcon size={24} className="text-[oklch(0.75_0.12_75)]" />
                  </div>
                  <div className="relative z-10 mt-auto">
                    <p className="text-[oklch(0.75_0.12_75)] text-[10px] font-bold uppercase tracking-widest mb-1">{getMystery()}</p>
                    <h3 className="font-display text-2xl font-bold text-white mb-2">Santo Rosário</h3>
                    <p className="text-sm text-[oklch(0.95_0.01_80/0.8)] mb-4">Reze o Terço completo com meditações contemplativas.</p>
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[oklch(0.75_0.12_75)] group-hover:text-[oklch(0.88_0.08_80)] transition-colors">
                      Rezar agora <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </div>
              </Link>

              {/* Card 2: Bíblia Sagrada */}
              <Link href="/biblia">
                <div className="relative overflow-hidden rounded-2xl min-h-[220px] group cursor-pointer border border-[oklch(0.75_0.12_75/0.3)] shadow-md hover:shadow-xl hover:border-[oklch(0.75_0.12_75/0.5)] transition-all duration-300 flex flex-col justify-between p-6 bg-gradient-to-b from-[oklch(0.18_0.04_260)] to-[oklch(0.12_0.03_260)]">
                  <div className="absolute inset-0 bg-pattern-cross opacity-[0.03] pointer-events-none" />
                  <div className="absolute inset-2 border border-[oklch(0.75_0.12_75/0.25)] rounded-xl pointer-events-none" />
                  <div className="absolute left-4 top-2 bottom-2 w-[1px] bg-[oklch(0.75_0.12_75/0.15)] pointer-events-none" />
                  
                  <div className="relative z-10 flex justify-between items-start">
                    <span className="bg-[oklch(0.75_0.12_75/0.1)] text-[oklch(0.75_0.12_75)] border border-[oklch(0.75_0.12_75/0.2)] rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase">
                      Escrituras
                    </span>
                    <BookOpen size={18} className="text-[oklch(0.75_0.12_75)]" />
                  </div>
                  
                  <div className="relative z-10 flex flex-col items-center justify-center my-auto py-2 text-center">
                    <Cross className="w-8 h-8 text-[oklch(0.75_0.12_75)] stroke-[1.5] mb-2 opacity-80" />
                    <h3 className="font-display text-xl font-bold text-[oklch(0.88_0.08_80)] tracking-wide mb-0.5">BÍBLIA</h3>
                    <p className="font-display text-[10px] text-[oklch(0.75_0.12_75)] uppercase tracking-[0.2em] font-medium">Sagrada</p>
                  </div>
                  
                  <div className="relative z-10 mt-auto">
                    <span className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-[oklch(0.75_0.12_75/0.1)] border border-[oklch(0.75_0.12_75/0.2)] text-xs font-bold text-[oklch(0.75_0.12_75)] group-hover:bg-[oklch(0.75_0.12_75/0.2)] transition-all">
                      Abrir Palavra
                    </span>
                  </div>
                </div>
              </Link>
            </div>

            {/* Coluna da Direita (Col 2 & 3) */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              {/* Card 3: Liturgia Diária */}
              <Link href="/liturgia">
                <div className="relative overflow-hidden rounded-2xl min-h-[180px] group cursor-pointer border border-[oklch(0.75_0.12_75/0.2)] shadow-md hover:shadow-xl hover:border-[oklch(0.75_0.12_75/0.4)] transition-all duration-300 flex flex-col justify-between p-6">
                  <img
                    src="/assets/dashboard/liturgia.png"
                    alt="Liturgia Diária"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div
                    className="absolute inset-0 bg-gradient-to-r from-[oklch(0.12_0.03_260/0.95)] via-[oklch(0.12_0.03_260/0.70)] to-[oklch(0.12_0.03_260/0.30)]"
                  />
                  <div className="relative z-10 flex justify-between items-start">
                    <span className="bg-[oklch(0.75_0.12_75/0.2)] text-[oklch(0.88_0.08_80)] border border-[oklch(0.75_0.12_75/0.3)] rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-sm">
                      Palavra
                    </span>
                    <Sun size={20} className="text-[oklch(0.75_0.12_75)]" />
                  </div>
                  <div className="relative z-10 mt-auto">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getLiturgicalColorStyle(liturgy?.color)}`}>
                        {liturgy?.color ? capitalize(liturgy.color) : "Tempo Litúrgico"}
                      </span>
                      <span className="text-xs text-[oklch(0.90_0.01_260)] font-medium truncate max-w-[240px]">
                        {liturgy?.celebration || "Missa de Hoje"}
                      </span>
                    </div>
                    <h3 className="font-display text-xl font-bold text-white mb-1">Liturgia Diária</h3>
                    <p className="text-xs text-[oklch(0.95_0.01_80/0.8)] line-clamp-1 italic max-w-xl">
                      {dynamicVerse.text ? `"${dynamicVerse.text}"` : "Leituras e Salmo do dia para acompanhar a Igreja."}
                    </p>
                  </div>
                </div>
              </Link>

              {/* Card 4: Plano Diário - Neon & Dark Mode */}
              <Link href="/plano-diario">
                <div className="relative overflow-hidden rounded-2xl min-h-[160px] group cursor-pointer border border-[oklch(0.75_0.12_75/0.25)] bg-[oklch(0.12_0.03_260/0.75)] hover:bg-[oklch(0.12_0.03_260/0.90)] backdrop-blur-xl shadow-lg shadow-black/20 text-white transition-all duration-300 flex flex-col justify-between p-6">
                  <div className="absolute inset-0 bg-pattern-cross opacity-[0.05] pointer-events-none" />
                  <div className="relative z-10 flex justify-between items-start">
                    <span className="bg-[oklch(0.75_0.12_75/0.15)] text-[oklch(0.88_0.08_80)] border border-[oklch(0.75_0.12_75/0.35)] rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-sm">
                      Progresso Espiritual
                    </span>
                    <Flame size={18} className={dailyPlanProgressPercent > 0 ? "text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_oklch(0.75_0.12_75/0.8)]" : "text-white/40"} />
                  </div>
                  
                  <div className="relative z-10 my-4 flex-1 flex flex-col justify-center">
                    <div className="flex items-baseline justify-between mb-2">
                      <h3 className="font-display text-lg font-bold text-white tracking-wide">Plano Diário</h3>
                      <span className="text-sm font-bold text-[oklch(0.88_0.08_80)]">{dailyPlanProgressPercent}%</span>
                    </div>
                    
                    <div className="w-full bg-black/35 rounded-full h-2 overflow-hidden shadow-inner">
                      <div 
                        className="bg-[oklch(0.75_0.12_75)] h-2 rounded-full transition-all duration-500 shadow-[0_0_12px_oklch(0.75_0.12_75/0.8)]" 
                        style={{ width: `${dailyPlanProgressPercent}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="relative z-10 mt-auto">
                    <p className="text-xs text-white/60 line-clamp-1">
                      {dailyPlanProgressPercent === 100 
                        ? "Parabéns! Todas as suas metas de hoje foram alcançadas." 
                        : "Retome suas metas espirituais configuradas para hoje."}
                    </p>
                  </div>
                </div>
              </Link>

              {/* Card 5: Novenas */}
              <Link href={activeNovena ? `/novenas/${activeNovena.novena.slug}` : "/novenas"}>
                <div className="relative overflow-hidden rounded-2xl min-h-[160px] group cursor-pointer border border-border/30 shadow-md hover:shadow-xl hover:border-[oklch(0.75_0.12_75/0.4)] transition-all duration-300 flex flex-col justify-between p-6">
                  <img
                    src={activeNovena
                      ? (activeNovena.novena.slug === 'novena-do-sagrado-coracao-de-jesus'
                        ? '/assets/novenas/sagrado-coracao-jesus.png'
                        : activeNovena.novena.slug === 'novena-do-divino-espirito-santo'
                        ? '/assets/novenas/divino-espirito-santo.png'
                        : activeNovena.novena.slug === 'novena-nossa-senhora-do-perpetuo-socorro'
                        ? '/assets/novenas/nossa-senhora-perpetuo-socorro.png'
                        : '/assets/novenas/sao-jose.png')
                      : '/assets/novenas/sao-jose.png'
                    }
                    alt="Novena"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-[oklch(0.12_0.03_260/0.95)] via-[oklch(0.12_0.03_260/0.60)] to-[oklch(0.12_0.03_260/0.20)]"
                  />
                  <div className="relative z-10 flex justify-between items-start">
                    <span className="bg-[oklch(0.75_0.12_75/0.2)] text-[oklch(0.88_0.08_80)] border border-[oklch(0.75_0.12_75/0.3)] rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-sm">
                      Devoção de 9 Dias
                    </span>
                    <BookMarked size={18} className="text-[oklch(0.75_0.12_75)]" />
                  </div>
                  
                  <div className="relative z-10 my-3 flex-1 flex flex-col justify-end mt-8">
                    {activeNovena ? (
                      <>
                        <h4 className="font-display text-lg font-bold text-white mb-1 line-clamp-1">{activeNovena.novena.name}</h4>
                        <p className="text-xs text-[oklch(0.95_0.01_80/0.8)] mb-2">Dia {activeNovena.completedCount} de {activeNovenaTotalDays} concluído</p>
                        <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className="bg-[oklch(0.75_0.12_75)] h-1.5 rounded-full transition-all duration-500" 
                            style={{ width: `${activeNovenaProgressPercent}%` }}
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <h4 className="font-display text-lg font-bold text-white mb-1">Novena de São José</h4>
                        <p className="text-xs text-[oklch(0.95_0.01_80/0.8)] line-clamp-2">Inicie uma jornada de fé com o Patrono da Igreja Universal.</p>
                      </>
                    )}
                  </div>
                  
                  <div className="relative z-10 mt-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[oklch(0.75_0.12_75)] group-hover:text-[oklch(0.88_0.08_80)] transition-colors">
                      {activeNovena ? `Rezar Dia ${activeNovena.nextDay}` : "Começar Novena"} 
                      <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Outras Práticas - Grid Compacto Glassmorphic */}
        <div className="mb-8">
          <h2 className="font-display text-xl font-bold text-white/90 mb-4">Outras Práticas</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {secondaryLinks.map(({ href, label, desc, icon: Icon, color }) => (
              <Link key={href} href={href}>
                <div className="p-4 rounded-xl border border-[oklch(0.75_0.12_75/0.15)] bg-[oklch(0.12_0.03_260/0.50)] hover:bg-[oklch(0.12_0.03_260/0.75)] backdrop-blur-xl shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer flex flex-col items-center text-center justify-center gap-2 group h-full">
                  <div className={`p-2.5 rounded-full ${color} shadow-inner group-hover:scale-110 transition-transform`}>
                    <Icon size={20} className="stroke-[1.5]" />
                  </div>
                  <span className="text-xs font-semibold text-white/95 group-hover:text-[oklch(0.75_0.12_75)] transition-colors">
                    {label}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Versículo do Dia - Banner Litúrgico Vitral */}
        <div className="mb-8 animate-fade-in">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[oklch(0.16_0.03_260)] via-[oklch(0.12_0.03_260)] to-[oklch(0.09_0.02_260)] border border-[oklch(0.75_0.12_75/0.3)] p-8 shadow-lg text-center">
            <div className="absolute inset-0 bg-pattern-cross opacity-[0.03] pointer-events-none" />
            <BookOpen size={24} className="text-[oklch(0.75_0.12_75)] mx-auto mb-4 stroke-[1.5] drop-shadow-[0_0_6px_oklch(0.75_0.12_75/0.5)]" />
            <blockquote className="font-serif text-xl md:text-2xl italic text-white/95 leading-relaxed max-w-4xl mx-auto mb-4 tracking-tight">
              "{dynamicVerse.text}"
            </blockquote>
            <p className="text-xs md:text-sm font-semibold uppercase tracking-wider text-[oklch(0.75_0.12_75)]">
              {dynamicVerse.ref}
            </p>
          </div>
        </div>

        {/* Intenções da Comunidade + Histórico Recente - Glassmorphic Dark Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 animate-fade-in">
          {/* Intenções da Comunidade */}
          <div className="lg:col-span-2 bg-[oklch(0.12_0.03_260/0.75)] border border-[oklch(0.75_0.12_75/0.25)] backdrop-blur-xl shadow-lg rounded-2xl p-6 flex flex-col justify-between text-white hover:border-[oklch(0.75_0.12_75/0.45)] transition-all duration-300">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Users size={16} className="text-[oklch(0.75_0.12_75)]" />
                <h3 className="font-display text-sm font-semibold text-white uppercase tracking-[0.15em]">
                  Intenções da Comunidade
                </h3>
              </div>
              <div className="divider-gold mb-4" />
              
              <div className="space-y-3">
                {intentions && intentions.length > 0 ? (
                  intentions.slice(0, 3).map((intention) => {
                    const alreadyPrayed = myPrayedIntentions?.includes(intention.id);
                    return (
                      <div key={intention.id} className="flex items-center justify-between p-3 rounded-lg border border-[oklch(0.75_0.12_75/0.15)] bg-[oklch(0.12_0.03_260/0.4)] hover:bg-[oklch(0.12_0.03_260/0.7)] hover:border-[oklch(0.75_0.12_75/0.35)] transition-all duration-300">
                        <div className="flex-1 min-w-0 pr-4">
                          <div className="flex items-center gap-2">
                            <Flame size={14} className="text-amber-500 fill-amber-400 animate-pulse drop-shadow-[0_0_6px_rgba(245,158,11,0.8)]" />
                            <p className="text-sm font-semibold text-white truncate">{intention.title}</p>
                          </div>
                          <p className="text-xs text-white/60 mt-0.5 truncate">
                            Por: {intention.isAnonymous ? "Anônimo" : intention.authorName} • {intention.prayerCount} {intention.prayerCount === 1 ? "oração" : "orações"}
                          </p>
                        </div>
                        <Button 
                          size="sm"
                          variant={alreadyPrayed ? "outline" : "default"}
                          disabled={prayMutation.isPending}
                          onClick={() => handlePrayForIntention(intention.id)}
                          className={alreadyPrayed 
                            ? "border border-emerald-600/30 text-emerald-400 hover:bg-emerald-500/10 bg-emerald-500/5 rounded-md text-xs font-semibold px-3 h-8 flex items-center gap-1 shadow-sm transition-all"
                            : "bg-[oklch(0.75_0.12_75)] hover:bg-[oklch(0.70_0.13_73)] text-[oklch(0.15_0.02_260)] rounded-md border border-[oklch(0.75_0.12_75/0.3)] shadow-sm hover:shadow-md text-xs font-semibold px-3 h-8 flex items-center gap-1 transition-all"
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
                  <p className="text-sm text-white/50 text-center py-4">Nenhuma intenção ativa no momento.</p>
                )}
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-white/10 text-right">
              <Link href="/intencoes" className="text-xs font-semibold text-[oklch(0.75_0.12_75)] hover:underline flex items-center justify-end gap-1">
                Ver todas as intenções <ChevronRight size={12} />
              </Link>
            </div>
          </div>

          {/* Histórico recente */}
          <div className="bg-[oklch(0.12_0.03_260/0.75)] border border-[oklch(0.75_0.12_75/0.25)] backdrop-blur-xl shadow-lg rounded-2xl p-6 flex flex-col justify-between text-white hover:border-[oklch(0.75_0.12_75/0.45)] transition-all duration-300">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Clock size={16} className="text-[oklch(0.75_0.12_75)]" />
                <h3 className="font-display text-sm font-semibold text-white uppercase tracking-[0.15em]">
                  Orações Recentes
                </h3>
              </div>
              <div className="divider-gold mb-4" />
              {logs && logs.length > 0 ? (
                <div className="space-y-3">
                  {logs.slice(0, 4).map((log: any) => (
                    <div key={log.id} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[oklch(0.75_0.12_75/0.1)] flex items-center justify-center flex-shrink-0 border border-[oklch(0.75_0.12_75/0.2)]">
                        <Heart size={13} className="text-[oklch(0.75_0.12_75)]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{log.prayerName}</p>
                        <p className="text-xs text-white/60">
                          {new Date(log.completedAt).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Heart size={28} className="text-white/40 mx-auto mb-2 opacity-40 animate-pulse" />
                  <p className="text-sm text-white/50">Nenhuma oração foi registrada ainda.</p>
                  <Link href="/oracoes">
                    <Button size="sm" variant="outline" className="mt-3 text-xs border-white/20 text-white hover:bg-white/10">
                      Começar a rezar
                    </Button>
                  </Link>
                </div>
              )}
            </div>
            {logs && logs.length > 0 && (
              <Link href="/perfil">
                <Button variant="outline" size="sm" className="w-full mt-4 text-xs border-white/20 text-white hover:bg-white/10">
                  Ver histórico completo
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Banner Premium */}
        <div className="mt-6 rounded-2xl bg-gradient-to-r from-[oklch(0.22_0.07_260)] to-[oklch(0.30_0.09_255)] p-6 flex flex-col md:flex-row items-center justify-between gap-4 border border-[oklch(0.75_0.12_75/0.25)]">
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
