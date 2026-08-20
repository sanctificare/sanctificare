import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { applyImageFallback, getLoginUrl, resolveMediaUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { BookOpen, ChevronRight, Flame, Users, Check, Play, BookMarked, Volume2, ArrowRight, Share2, ShieldCheck, Crown } from "lucide-react";
import { RosaryIcon } from "@/components/RosaryIcon";
import { Cross } from "@/components/CrossIcon";
import { Heart } from "@/components/HeartIcon";
import { LiturgyIcon } from "@/components/LiturgyIcon";
import { NOVENAS } from "@/data/novenas";
import { BIBLE_VIDEOS } from "@/data/bible-videos";
import { toast } from "sonner";
import { shareText } from "@/lib/share";
import { DashboardActiveNovena, NOVENA_PROGRESS_STORAGE_KEY, buildDashboardActiveNovena, parseNovenaProgress } from "@/lib/novenaProgress";
import GooglePlayBanner from "@/components/GooglePlayBanner";
import { getTodaySaint, getSaintLiturgicalStyle, MONTH_NAMES_PT } from "@/data/santoral";

const LOGO_IMG = "/assets/sanctificare-logo-v2.webp";
const SANCTIFICARE_SHARE_URL = "https://sanctificare.app";
const SANCTIFICARE_SHARE_TEXT = `Conheça o Sanctificare: um app para rezar, acompanhar a liturgia e fortalecer sua vida espiritual. ${SANCTIFICARE_SHARE_URL}`;

const secondaryLinks = [
  { href: "/santoral", label: "Santoral & Festas", desc: "Santos e festas de guarda", icon: Crown, color: "text-amber-600 bg-amber-500/10 border-amber-500/30" },
  { href: "/quaresma-sao-miguel", label: "Quaresma de São Miguel", desc: "40 dias de oração", icon: ShieldCheck, color: "text-amber-600 bg-amber-500/10 border-amber-500/30" },
  { href: "/oracoes", label: "Orações", desc: "Devocionário tradicional", icon: Heart, color: "text-[oklch(0.55_0.14_15)] bg-[oklch(0.55_0.14_15/0.06)] border-[oklch(0.55_0.14_15/0.15)]" },
  { href: "/lectio", label: "Lectio Divina", desc: "Leitura orante", icon: BookOpen, color: "text-[oklch(0.32_0.11_240)] bg-[oklch(0.32_0.11_240/0.06)] border-[oklch(0.32_0.11_240/0.15)]" },
  { href: "/via-sacra", label: "Via-Sacra", desc: "14 estações meditadas", icon: Cross, color: "text-[oklch(0.36_0.15_20)] bg-[oklch(0.36_0.15_20/0.06)] border-[oklch(0.36_0.15_20/0.15)]" },
  { href: "/vela-virtual", label: "Vela Virtual", desc: "Silêncio e oração", icon: Flame, color: "text-[oklch(0.50_0.10_85)] bg-[oklch(0.50_0.10_85/0.06)] border-[oklch(0.50_0.10_85/0.15)]" },
  { href: "/musica-sacra", label: "Música Sacra", desc: "Cantos para contemplação", icon: Volume2, color: "text-[oklch(0.34_0.10_300)] bg-[oklch(0.34_0.10_300/0.06)] border-[oklch(0.34_0.10_300/0.15)]" },
  { href: "/videos", label: "Vídeos", desc: "Passagens ilustradas", icon: Play, color: "text-[oklch(0.40_0.12_15)] bg-[oklch(0.40_0.12_15/0.06)] border-[oklch(0.40_0.12_15/0.15)]" },
  { href: "/intencoes", label: "Intenções", desc: "Mural da comunidade", icon: Users, color: "text-[oklch(0.30_0.10_190)] bg-[oklch(0.30_0.10_190/0.06)] border-[oklch(0.30_0.10_190/0.15)]" },
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

export default function Dashboard() {
  const { user, isAuthenticated, loading } = useAuth();

  const formatDateStr = (dateInput: string | Date) => {
    const d = new Date(dateInput);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const todayStr = formatDateStr(new Date());

  const { data: allLogsFromServer, isLoading: isLogsLoading } = trpc.prayers.getAllLogs.useQuery(undefined, { enabled: isAuthenticated });
  const { data: liturgyFromServer, isLoading: isLiturgyLoading } = trpc.liturgy.getByDate.useQuery(undefined, { enabled: isAuthenticated });
  const { data: dailyPlanFromServer, isLoading: isDailyPlanLoading } = trpc.dailyPlan.getStatus.useQuery(undefined, { enabled: isAuthenticated });

  const [allLogs, setAllLogs] = useState<any[]>([]);
  const [liturgy, setLiturgy] = useState<any>(null);
  const [dailyPlan, setDailyPlan] = useState<any>(null);
  const [prayingId, setPrayingId] = useState<number | null>(null);
  const [isOffline, setIsOffline] = useState(typeof window !== "undefined" ? !navigator.onLine : false);

  // Cache e carregamento offline dos logs/streak
  useEffect(() => {
    if (allLogsFromServer) {
      setAllLogs(allLogsFromServer);
      localStorage.setItem("sanctificare_offline_all_logs", JSON.stringify(allLogsFromServer));
    }
  }, [allLogsFromServer]);

  useEffect(() => {
    if (!allLogsFromServer) {
      try {
        const saved = localStorage.getItem("sanctificare_offline_all_logs");
        if (saved) {
          setAllLogs(JSON.parse(saved));
        }
      } catch (err) {
        console.error("Erro ao ler logs offline no dashboard:", err);
      }
    }
  }, [allLogsFromServer]);

  // Cache e carregamento offline da liturgia diária
  useEffect(() => {
    if (liturgyFromServer) {
      setLiturgy(liturgyFromServer);
      localStorage.setItem(`sanctificare_liturgy_cache_${todayStr}`, JSON.stringify(liturgyFromServer));
    }
  }, [liturgyFromServer, todayStr]);

  useEffect(() => {
    if (!liturgyFromServer) {
      try {
        const saved = localStorage.getItem(`sanctificare_liturgy_cache_${todayStr}`);
        if (saved) {
          setLiturgy(JSON.parse(saved));
        }
      } catch (err) {
        console.error("Erro ao ler liturgia offline no dashboard:", err);
      }
    }
  }, [liturgyFromServer, todayStr]);

  // Cache e carregamento offline do plano diário
  useEffect(() => {
    if (dailyPlanFromServer) {
      setDailyPlan(dailyPlanFromServer);
      localStorage.setItem("sanctificare_offline_daily_plan", JSON.stringify(dailyPlanFromServer));
    }
  }, [dailyPlanFromServer]);

  useEffect(() => {
    if (!dailyPlanFromServer) {
      try {
        const saved = localStorage.getItem("sanctificare_offline_daily_plan");
        if (saved) {
          setDailyPlan(JSON.parse(saved));
        }
      } catch (err) {
        console.error("Erro ao ler plano diário offline:", err);
      }
    }
  }, [dailyPlanFromServer]);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const utils = trpc.useUtils();
  const { data: intentionsFromServer, isLoading: isIntentionsLoading } = trpc.intentions.list.useQuery(undefined, { enabled: isAuthenticated });
  const { data: myPrayedIntentions } = trpc.intentions.myPrayed.useQuery(undefined, { enabled: isAuthenticated });

  const [intentions, setIntentions] = useState<any[]>([]);

  // Cache e carregamento offline de intenções
  useEffect(() => {
    if (intentionsFromServer) {
      setIntentions(intentionsFromServer);
      localStorage.setItem("sanctificare_offline_intentions", JSON.stringify(intentionsFromServer));
    }
  }, [intentionsFromServer]);

  useEffect(() => {
    if (!intentionsFromServer) {
      try {
        const saved = localStorage.getItem("sanctificare_offline_intentions");
        if (saved) {
          setIntentions(JSON.parse(saved));
        }
      } catch (err) {
        console.error("Erro ao ler intenções offline no dashboard:", err);
      }
    }
  }, [intentionsFromServer]);

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

  const handlePrayForIntention = async (intentionId: number) => {
    setPrayingId(intentionId);
    try {
      await prayMutation.mutateAsync({ intentionId });
    } catch {
      // Já tratado
    } finally {
      setPrayingId(null);
    }
  };

  const handleShareSanctificare = async () => {
    const result = await shareText({
      title: "Compartilhar o Sanctificare",
      text: SANCTIFICARE_SHARE_TEXT,
    });

    if (result.status === "copied") {
      toast.success("Link do Sanctificare copiado para compartilhar.");
    } else if (result.status === "failed") {
      toast.error("Não foi possível abrir o compartilhamento.");
    }
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

  const streak = calculateStreak(allLogs);

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



  const firstName = user?.name?.split(" ")[0] || "Fiel";
  const todaySaint = getTodaySaint();

  return (
    <div className="min-h-screen bg-cream dark:bg-[oklch(0.14_0.03_260)] relative overflow-hidden">
      {/* Golden pattern background */}
      <div className="absolute inset-0 bg-pattern-cross opacity-[0.02] pointer-events-none" />
      
      <main className="container py-6 sm:py-8 relative z-10">
        {/* Saudação */}
        <div className="section-block animate-fade-in">
          <div className="bg-navy rounded-2xl p-5 sm:p-8 relative overflow-hidden shadow-lg">
            <div className="absolute inset-0 bg-pattern-cross opacity-20" />
            <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <p className="text-[oklch(0.70_0.03_260)] text-sm font-medium mb-1">{getDayOfWeek()}, {getFormattedDate()}</p>
                <div className="flex items-center gap-3 flex-wrap mb-2">
                  <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">
                    Bem-vindo, {firstName}
                  </h1>
                  {isLogsLoading && allLogs.length === 0 ? (
                    <Skeleton className="h-6 w-32 rounded-full" />
                  ) : streak.currentStreak > 0 ? (
                    <div className="bg-amber-500/20 text-amber-200 border border-amber-500/30 rounded-full px-3 py-1 flex items-center gap-1.5 text-xs font-semibold animate-pulse">
                      <Flame size={14} className={streak.prayedToday ? "text-amber-400 fill-amber-400" : "text-amber-200"} />
                      <span>{streak.currentStreak} {streak.currentStreak === 1 ? "dia" : "dias"} de perseverança</span>
                    </div>
                  ) : null}
                  {isOffline && (
                    <div className="bg-stone-500/20 text-stone-300 border border-stone-500/30 rounded-full px-3 py-1 flex items-center gap-1.5 text-xs font-semibold select-none">
                      <span className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-ping" />
                      <span>Modo Offline</span>
                    </div>
                  )}
                </div>
                <p className="font-serif text-[oklch(0.80_0.02_260)] text-base lead-copy">
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
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <Link href="/rosario" aria-label="Abrir Santo Rosário">
                  <Button className="w-full sm:w-auto bg-[oklch(0.75_0.12_75)] hover:bg-[oklch(0.70_0.13_73)] text-[oklch(0.15_0.02_260)] font-semibold">
                    <RosaryIcon size={15} className="mr-2" />
                    Rezar o Rosário
                  </Button>
                </Link>
                <Link href="/liturgia" aria-label="Abrir Liturgia Diária">
                  <Button variant="outline" className="w-full sm:w-auto border-[oklch(0.75_0.12_75/0.4)] text-white hover:bg-[oklch(0.75_0.12_75/0.1)] bg-transparent">
                    <LiturgyIcon size={15} className="mr-2" />
                    Liturgia
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Google Play Store banner (apenas na web desktop) */}
          <div className="mt-4">
            <GooglePlayBanner variant="card" showDismiss={true} />
          </div>
        </div>

        {/* Banner Destaque Especial: Quaresma de São Miguel Arcanjo */}
        <div className="section-block animate-fade-in my-6">
          <Link href="/quaresma-sao-miguel" aria-label="Acessar Quaresma de São Miguel Arcanjo" className="block rounded-2xl focus-gold-ring">
            <div className="relative overflow-hidden rounded-2xl border border-amber-500/40 bg-gradient-to-r from-[#181410] via-[#241a12] to-[#120f0c] p-5 sm:p-7 shadow-xl group cursor-pointer hover:border-amber-500/60 transition-all duration-300">
              <img
                src="/assets/quaresma-sao-miguel/hero-sao-miguel-classico.webp"
                alt="São Miguel Arcanjo"
                loading="lazy"
                decoding="async"
                onError={(event) => applyImageFallback(event.currentTarget)}
                className="absolute inset-0 h-full w-full object-cover opacity-35 group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#12100e]/95 via-[#12100e]/80 to-transparent" />
              <div className="absolute inset-0 bg-pattern-cross opacity-10" />

              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
                <div className="max-w-2xl space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full px-3 py-0.5 text-[11px] font-bold uppercase tracking-widest font-serif flex items-center gap-1.5 backdrop-blur-xs">
                      <span>⚔️</span> Devocional • Início 15 de Agosto
                    </span>
                  </div>
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-amber-100 group-hover:text-amber-300 transition-colors">
                    Quaresma de São Miguel Arcanjo
                  </h2>
                  <p className="font-serif text-xs sm:text-sm text-amber-200/80 leading-relaxed max-w-xl">
                    40 dias de oração, penitência e combate espiritual. Garanta sua presença para vivenciarmos juntos esta santa caminhada a partir de 15 de Agosto!
                  </p>
                </div>

                <div className="shrink-0">
                  <Button className="w-full sm:w-auto bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-amber-950 font-serif font-bold text-xs sm:text-sm px-5 py-2.5 shadow-lg group-hover:shadow-amber-500/20 transition-all">
                    <span>Garantir Presença / Acessar</span>
                    <ChevronRight size={16} className="ml-1 transition-transform group-hover:translate-x-1" />
                  </Button>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Card Nobre: Santo do Dia & Santoral */}
        <div className="section-block animate-fade-in my-6">
          <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-br from-white via-white to-amber-50/20 dark:from-[oklch(0.16_0.04_260)] dark:via-[oklch(0.14_0.03_260)] dark:to-[oklch(0.12_0.03_260)] p-5 sm:p-6 shadow-md">
            {todaySaint ? (
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden bg-amber-100 dark:bg-amber-950/40 border border-amber-400/40 shrink-0 shadow-sm flex items-center justify-center">
                    <img
                      src={todaySaint.image}
                      alt={todaySaint.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-900 dark:text-amber-300 border border-amber-500/30">
                        Santo do Dia • {new Date().getDate()} de {MONTH_NAMES_PT[new Date().getMonth()]}
                      </span>
                      {todaySaint.isHolyDayOfObligation && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-yellow-500/25 text-yellow-900 dark:text-yellow-200 border border-yellow-500/40 flex items-center gap-1">
                          <Crown size={12} /> Festa de Guarda
                        </span>
                      )}
                    </div>
                    <h3 className="font-display text-lg sm:text-xl font-bold text-foreground">
                      {todaySaint.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1">
                      {todaySaint.title}
                    </p>
                    {todaySaint.quote && (
                      <p className="text-xs italic text-amber-700/90 dark:text-amber-300/90 mt-1 font-serif">
                        "{todaySaint.quote}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2.5 w-full md:w-auto">
                  <Link href={`/santoral/${todaySaint.slug}`} className="flex-1 md:flex-initial">
                    <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-semibold shadow-sm">
                      <span>Hagiografia & Relíquias</span>
                      <ArrowRight size={14} className="ml-1.5" />
                    </Button>
                  </Link>
                  <Link href="/santoral">
                    <Button variant="outline" className="border-amber-500/30 text-amber-700 dark:text-amber-300 hover:bg-amber-500/10 text-xs sm:text-sm">
                      <Crown size={14} className="mr-1.5" />
                      <span>Santoral</span>
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden bg-amber-100 dark:bg-amber-950/40 border border-amber-400/40 shrink-0 shadow-sm flex items-center justify-center text-amber-600 dark:text-amber-400">
                    <Crown size={24} />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-900 dark:text-amber-300 border border-amber-500/30">
                        Santoral & Calendário • {new Date().getDate()} de {MONTH_NAMES_PT[new Date().getMonth()]}
                      </span>
                    </div>
                    <h3 className="font-display text-lg sm:text-xl font-bold text-foreground">
                      Santoral & Hagiografia Católica
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1">
                      Conheça as vidas dos santos, histórias de fé, relíquias sagradas e dias de preceito da Igreja.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 w-full md:w-auto">
                  <Link href="/santoral" className="w-full md:w-auto">
                    <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-semibold shadow-sm">
                      <Crown size={14} className="mr-1.5" />
                      <span>Explorar Santoral</span>
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Destaques Principais - Layout Editorial Assimétrico */}
        <div className="section-block animate-fade-in">
          <h2 className="section-title mb-4">Destaques</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Coluna da Esquerda (Col 1) */}
            <div className="lg:col-span-1 flex flex-col gap-6">
              {/* Card 1: Santo Rosário */}
              <Link href="/rosario" aria-label="Abrir card Santo Rosário" className="block rounded-2xl focus-gold-ring">
                <div className="relative overflow-hidden rounded-2xl flex-1 min-h-[280px] sm:min-h-[340px] group cursor-pointer border border-[oklch(0.75_0.12_75/0.2)] card-interactive hover:border-[oklch(0.75_0.12_75/0.4)] flex flex-col justify-between p-5 sm:p-6">
                  <img
                    src="/assets/dashboard/rosario.png"
                    alt="Santo Rosário"
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-[oklch(0.12_0.03_260/0.95)] via-[oklch(0.12_0.03_260/0.60)] to-[oklch(0.12_0.03_260/0.20)]"
                  />
                  <div className="relative z-10 flex justify-between items-start">
                    <span className="bg-[oklch(0.75_0.12_75/0.2)] text-[oklch(0.88_0.08_80)] border border-[oklch(0.75_0.12_75/0.3)] rounded-full px-2.5 sm:px-3 py-0.5 sm:py-1 text-[11px] sm:text-xs font-semibold backdrop-blur-sm">
                      Devocional
                    </span>
                    <RosaryIcon size={20} className="sm:w-6 sm:h-6 text-[oklch(0.75_0.12_75)]" />
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
              <Link href="/biblia" aria-label="Abrir card Bíblia Sagrada" className="block rounded-2xl focus-gold-ring">
                <div className="relative overflow-hidden rounded-2xl min-h-[200px] sm:min-h-[220px] group cursor-pointer border border-[oklch(0.75_0.12_75/0.3)] card-interactive hover:border-[oklch(0.75_0.12_75/0.5)] flex flex-col justify-between p-5 sm:p-6 bg-gradient-to-b from-[oklch(0.18_0.04_260)] to-[oklch(0.12_0.03_260)]">
                  <div className="absolute inset-0 bg-pattern-cross opacity-[0.03] pointer-events-none" />
                  <div className="absolute inset-2 border border-[oklch(0.75_0.12_75/0.25)] rounded-xl pointer-events-none" />
                  <div className="absolute left-4 top-2 bottom-2 w-[1px] bg-[oklch(0.75_0.12_75/0.15)] pointer-events-none" />
                  
                  <div className="relative z-10 flex justify-between items-start">
                    <span className="bg-[oklch(0.75_0.12_75/0.1)] text-[oklch(0.75_0.12_75)] border border-[oklch(0.75_0.12_75/0.2)] rounded-full px-2 py-0.5 text-[9px] sm:text-[10px] font-semibold tracking-wider uppercase">
                      Escrituras
                    </span>
                    <BookOpen size={16} className="sm:w-[18px] sm:h-[18px] text-[oklch(0.75_0.12_75)]" />
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

              {/* Card 3: Vela Virtual */}
              <Link href="/vela-virtual" aria-label="Abrir card Vela Virtual" className="block rounded-2xl focus-gold-ring">
                <div className="relative overflow-hidden rounded-2xl min-h-[200px] sm:min-h-[220px] group cursor-pointer border border-border/30 card-interactive hover:border-[oklch(0.75_0.12_75/0.4)] flex flex-col justify-between p-5 sm:p-6">
                  <img
                    src="/assets/dashboard/vela-virtual.png"
                    alt="Vela Virtual"
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-[oklch(0.12_0.03_260/0.95)] via-[oklch(0.12_0.03_260/0.60)] to-[oklch(0.12_0.03_260/0.20)]"
                  />
                  <div className="relative z-10 flex justify-between items-start">
                    <span className="bg-[oklch(0.75_0.12_75/0.2)] text-[oklch(0.88_0.08_80)] border border-[oklch(0.75_0.12_75/0.3)] rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-sm">
                      Silêncio e Oração
                    </span>
                    <Flame size={18} className="text-[oklch(0.75_0.12_75)]" />
                  </div>
                  
                  <div className="relative z-10 my-3 flex-1 flex flex-col justify-end mt-8">
                    <h4 className="font-display text-lg font-bold text-white mb-1">Vela Virtual</h4>
                    <p className="text-xs text-[oklch(0.95_0.01_80/0.8)] line-clamp-2">Acenda uma vela virtual, silencie o seu coração e registre suas intenções.</p>
                  </div>
                  
                  <div className="relative z-10 mt-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[oklch(0.75_0.12_75)] group-hover:text-[oklch(0.88_0.08_80)] transition-colors">
                      Acender vela <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </div>
              </Link>
            </div>

            {/* Coluna da Direita (Col 2 & 3) */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              {/* Card 4: Liturgia Diária */}
              <Link href="/liturgia" aria-label="Abrir card Liturgia Diária" className="block rounded-2xl focus-gold-ring">
                <div className="relative overflow-hidden rounded-2xl min-h-[170px] sm:min-h-[180px] group cursor-pointer border border-[oklch(0.75_0.12_75/0.2)] card-interactive hover:border-[oklch(0.75_0.12_75/0.4)] flex flex-col justify-between p-5 sm:p-6">
                  <img
                    src="/assets/dashboard/liturgia.png"
                    alt="Liturgia Diária"
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div
                    className="absolute inset-0 bg-gradient-to-r from-[oklch(0.12_0.03_260/0.95)] via-[oklch(0.12_0.03_260/0.70)] to-[oklch(0.12_0.03_260/0.30)]"
                  />
                  <div className="relative z-10 flex justify-between items-start">
                    <span className="bg-[oklch(0.75_0.12_75/0.2)] text-[oklch(0.88_0.08_80)] border border-[oklch(0.75_0.12_75/0.3)] rounded-full px-2.5 sm:px-3 py-0.5 sm:py-1 text-[11px] sm:text-xs font-semibold backdrop-blur-sm">
                      Palavra
                    </span>
                    <LiturgyIcon size={18} className="sm:w-5 sm:h-5 text-[oklch(0.75_0.12_75)]" />
                  </div>
                  <div className="relative z-10 mt-auto">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {isLiturgyLoading && !liturgy ? (
                        <>
                          <Skeleton className="h-5 w-28 rounded" />
                          <Skeleton className="h-4 w-44 rounded" />
                        </>
                      ) : (
                        <>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getLiturgicalColorStyle(liturgy?.color)}`}>
                            {liturgy?.color ? capitalize(liturgy.color) : "Tempo Litúrgico"}
                          </span>
                          <span className="text-xs text-[oklch(0.90_0.01_260)] font-medium truncate max-w-[240px]">
                            {liturgy?.celebration || "Missa de Hoje"}
                          </span>
                        </>
                      )}
                    </div>
                    <h3 className="font-display text-xl font-bold text-white mb-1">Liturgia Diária</h3>
                    {isLiturgyLoading && !liturgy ? (
                      <Skeleton className="h-4 w-4/5 rounded" />
                    ) : (
                      <p className="text-xs text-[oklch(0.95_0.01_80/0.8)] line-clamp-1 italic max-w-xl">
                        {dynamicVerse.text ? `"${dynamicVerse.text}"` : "Leituras e Salmo do dia para acompanhar a Igreja."}
                      </p>
                    )}
                  </div>
                </div>
              </Link>

              {/* Grid 1: Plano Diário & Novenas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Card 5: Plano Diário */}
                <Link href="/plano-diario" aria-label="Abrir card Plano Diário" className="block rounded-2xl focus-gold-ring">
                  <div className="relative overflow-hidden rounded-2xl min-h-[150px] sm:min-h-[160px] group cursor-pointer border border-[oklch(0.75_0.12_75/0.2)] card-interactive hover:border-[oklch(0.75_0.12_75/0.4)] flex flex-col justify-between p-5 sm:p-6 h-full">
                    <img
                      src="/assets/dashboard/plano-diario.png"
                      alt="Plano Diário"
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div
                      className="absolute inset-0 bg-gradient-to-t from-[oklch(0.12_0.03_260/0.95)] via-[oklch(0.12_0.03_260/0.70)] to-[oklch(0.12_0.03_260/0.30)]"
                    />
                    <div className="relative z-10 flex justify-between items-start">
                      <span className="bg-[oklch(0.75_0.12_75/0.2)] text-[oklch(0.88_0.08_80)] border border-[oklch(0.75_0.12_75/0.3)] rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-sm">
                        Progresso Espiritual
                      </span>
                      <Flame size={18} className={dailyPlanProgressPercent > 0 ? "text-amber-400 fill-amber-400" : "text-white/60"} />
                    </div>
                    
                    <div className="relative z-10 my-4 flex-1 flex flex-col justify-center">
                      {isDailyPlanLoading && !dailyPlan ? (
                        <>
                          <div className="flex items-baseline justify-between mb-2">
                            <h3 className="font-display text-lg font-bold text-white">Plano Diário</h3>
                            <Skeleton className="h-4 w-10 rounded bg-white/20" />
                          </div>
                          <Skeleton className="h-2 w-full rounded-full bg-white/20" />
                        </>
                      ) : (
                        <>
                          <div className="flex items-baseline justify-between mb-2">
                            <h3 className="font-display text-lg font-bold text-white">Plano Diário</h3>
                            <span className="text-sm font-bold text-[oklch(0.75_0.12_75)]">{dailyPlanProgressPercent}%</span>
                          </div>
                          
                          <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                            <div 
                              className="bg-[oklch(0.75_0.12_75)] h-2 rounded-full transition-all duration-500" 
                              style={{ width: `${dailyPlanProgressPercent}%` }}
                            />
                          </div>
                        </>
                      )}
                    </div>
                    
                    <div className="relative z-10 mt-auto">
                      {isDailyPlanLoading && !dailyPlan ? (
                        <Skeleton className="h-4 w-5/6 rounded bg-white/20" />
                      ) : (
                        <p className="text-xs text-[oklch(0.95_0.01_80/0.8)] line-clamp-1">
                          {dailyPlanProgressPercent === 100 
                            ? "Parabéns! Todas as metas de hoje foram alcançadas." 
                            : "Retome suas metas espirituais configuradas para hoje."}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>

                {/* Card 6: Novenas */}
                <Link href={activeNovena ? `/novenas/${activeNovena.novena.slug}` : "/novenas"} aria-label="Abrir card Novenas" className="block rounded-2xl focus-gold-ring">
                  <div className="relative overflow-hidden rounded-2xl min-h-[150px] sm:min-h-[160px] group cursor-pointer border border-border/30 card-interactive hover:border-[oklch(0.75_0.12_75/0.4)] flex flex-col justify-between p-5 sm:p-6 h-full">
                    <img
                      src={resolveMediaUrl(activeNovena
                        ? '/assets/novenas/sagrado-coracao-jesus.png'
                        : '/assets/novenas/sagrado-coracao-jesus.png'
                      )}
                      alt="Novena"
                      loading="lazy"
                      decoding="async"
                      onError={(event) => applyImageFallback(event.currentTarget)}
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
                          <h4 className="font-display text-lg font-bold text-white mb-1">Novena ao Sagrado Coração de Jesus</h4>
                          <p className="text-xs text-[oklch(0.95_0.01_80/0.8)] line-clamp-2">Nove dias de meditação e súplica diante do Sagrado Coração de Jesus.</p>
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

              {/* Grid 2: Orações & Lectio Divina */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Card 7: Orações */}
                <Link href="/oracoes" aria-label="Abrir card Orações" className="block rounded-2xl focus-gold-ring">
                  <div className="relative overflow-hidden rounded-2xl min-h-[150px] sm:min-h-[160px] group cursor-pointer border border-border/30 card-interactive hover:border-[oklch(0.75_0.12_75/0.4)] flex flex-col justify-between p-5 sm:p-6 h-full">
                    <img
                      src="/assets/dashboard/oracoes.png"
                      alt="Orações"
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div
                      className="absolute inset-0 bg-gradient-to-t from-[oklch(0.12_0.03_260/0.95)] via-[oklch(0.12_0.03_260/0.60)] to-[oklch(0.12_0.03_260/0.20)]"
                    />
                    <div className="relative z-10 flex justify-between items-start">
                      <span className="bg-[oklch(0.75_0.12_75/0.2)] text-[oklch(0.88_0.08_80)] border border-[oklch(0.75_0.12_75/0.3)] rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-sm">
                        Devocionário
                      </span>
                      <Heart size={18} className="text-[oklch(0.75_0.12_75)]" />
                    </div>
                    
                    <div className="relative z-10 my-3 flex-1 flex flex-col justify-end mt-8">
                      <h4 className="font-display text-lg font-bold text-white mb-1">Orações</h4>
                      <p className="text-xs text-[oklch(0.95_0.01_80/0.8)] line-clamp-2">Preces tradicionais e jaculatórias para fortalecer sua comunhão diária.</p>
                    </div>
                    
                    <div className="relative z-10 mt-2">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[oklch(0.75_0.12_75)] group-hover:text-[oklch(0.88_0.08_80)] transition-colors">
                        Ver orações <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </div>
                </Link>

                {/* Card 8: Lectio Divina */}
                <Link href="/lectio" aria-label="Abrir card Lectio Divina" className="block rounded-2xl focus-gold-ring">
                  <div className="relative overflow-hidden rounded-2xl min-h-[150px] sm:min-h-[160px] group cursor-pointer border border-border/30 card-interactive hover:border-[oklch(0.75_0.12_75/0.4)] flex flex-col justify-between p-5 sm:p-6 h-full">
                    <img
                      src="/assets/dashboard/lectio.png"
                      alt="Lectio Divina"
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div
                      className="absolute inset-0 bg-gradient-to-t from-[oklch(0.12_0.03_260/0.95)] via-[oklch(0.12_0.03_260/0.60)] to-[oklch(0.12_0.03_260/0.20)]"
                    />
                    <div className="relative z-10 flex justify-between items-start">
                      <span className="bg-[oklch(0.75_0.12_75/0.2)] text-[oklch(0.88_0.08_80)] border border-[oklch(0.75_0.12_75/0.3)] rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-sm">
                        Leitura Orante
                      </span>
                      <BookOpen size={18} className="text-[oklch(0.75_0.12_75)]" />
                    </div>
                    
                    <div className="relative z-10 my-3 flex-1 flex flex-col justify-end mt-8">
                      <h4 className="font-display text-lg font-bold text-white mb-1">Lectio Divina</h4>
                      <p className="text-xs text-[oklch(0.95_0.01_80/0.8)] line-clamp-2">Medite nas Sagradas Escrituras seguindo os quatro passos tradicionais.</p>
                    </div>
                    
                    <div className="relative z-10 mt-2">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[oklch(0.75_0.12_75)] group-hover:text-[oklch(0.88_0.08_80)] transition-colors">
                        Meditar agora <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Outras Práticas - Grid Compacto */}
        <div className="section-block">
          <h2 className="section-title mb-4">Outras Práticas</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {secondaryLinks.map(({ href, label, icon: Icon, color }) => (
              <Link key={href} href={href} aria-label={`Abrir ${label}`} className="block rounded-xl focus-gold-ring">
                <div className="p-3 sm:p-4 rounded-xl border border-border/40 bg-white/60 dark:bg-[oklch(0.17_0.04_260/0.4)] backdrop-blur-md hover:bg-white/80 dark:hover:bg-[oklch(0.17_0.04_260/0.6)] card-soft hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer flex flex-col items-center text-center justify-center gap-1.5 sm:gap-2 group h-full">
                  <div className={`p-2 sm:p-2.5 rounded-full ${color} shadow-inner group-hover:scale-110 transition-transform`}>
                    <Icon size={18} className="sm:w-5 sm:h-5 stroke-[1.5]" />
                  </div>
                  <span className="text-[11px] sm:text-xs leading-tight line-clamp-2 font-semibold text-navy dark:text-white group-hover:text-[oklch(0.75_0.12_75)] transition-colors">
                    {label}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Compartilhar o Sanctificare */}
        <div className="section-block animate-fade-in">
          <div className="relative overflow-hidden rounded-2xl border border-[oklch(0.75_0.12_75/0.22)] bg-[oklch(0.18_0.04_260)] p-5 sm:p-6 shadow-lg">
            <img
              src="/assets/sanctificare-hero.webp"
              alt="Sanctificare"
              loading="lazy"
              decoding="async"
              onError={(event) => applyImageFallback(event.currentTarget)}
              className="absolute inset-0 h-full w-full object-cover opacity-55"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[oklch(0.12_0.03_260/0.96)] via-[oklch(0.12_0.03_260/0.78)] to-[oklch(0.12_0.03_260/0.28)]" />
            <div className="absolute inset-0 bg-pattern-cross opacity-10" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div className="max-w-2xl">
                <span className="inline-flex items-center gap-2 rounded-full border border-[oklch(0.75_0.12_75/0.30)] bg-[oklch(0.75_0.12_75/0.16)] px-3 py-1 text-xs font-semibold text-[oklch(0.88_0.08_80)] backdrop-blur-sm">
                  <Share2 size={13} />
                  Indique o app
                </span>
                <h2 className="mt-3 font-display text-2xl sm:text-3xl font-bold text-white">Compartilhar o Sanctificare</h2>
                <p className="mt-2 font-serif text-sm sm:text-base leading-relaxed text-[oklch(0.88_0.02_260)]">
                  Envie um convite simples para amigos que desejam rezar, acompanhar a liturgia e cultivar uma rotina espiritual.
                </p>
              </div>

              <Button
                type="button"
                onClick={handleShareSanctificare}
                className="w-full md:w-auto shrink-0 bg-[oklch(0.75_0.12_75)] hover:bg-[oklch(0.70_0.13_73)] text-[oklch(0.15_0.02_260)] font-semibold"
              >
                <Share2 size={15} className="mr-2" />
                Compartilhar
              </Button>
            </div>
          </div>
        </div>

        {/* Versículo do Dia - Banner Editorial */}
        <div className="section-block animate-fade-in">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[oklch(0.95_0.02_80)] to-[oklch(0.97_0.01_85)] border border-[oklch(0.75_0.12_75/0.25)] p-5 sm:p-8 card-soft text-center">
            <div className="absolute inset-0 bg-pattern-cross opacity-[0.01]" />
            <BookOpen size={24} className="text-[oklch(0.75_0.12_75)] mx-auto mb-4 stroke-[1.5]" />
            <blockquote className="font-serif text-lg sm:text-xl md:text-2xl italic text-[oklch(0.25_0.03_260)] leading-relaxed max-w-4xl mx-auto mb-4 tracking-tight">
              "{dynamicVerse.text}"
            </blockquote>
            {isLiturgyLoading && !liturgy ? (
              <Skeleton className="h-4 w-32 mx-auto rounded" />
            ) : (
              <p className="text-xs md:text-sm font-semibold uppercase tracking-wider text-[oklch(0.45_0.12_70)] dark:text-[oklch(0.78_0.09_78)]">
                {dynamicVerse.ref}
              </p>
            )}
          </div>
        </div>

        {/* Intenções da Comunidade + Histórico Recente */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 section-block animate-fade-in">
          {/* Intenções da Comunidade */}
          <div className="lg:col-span-2 prayer-card p-5 sm:p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Users size={16} className="text-[oklch(0.65_0.14_70)]" />
                <h3 className="section-title-sm">
                  Intenções da Comunidade
                </h3>
              </div>
              <div className="divider-gold mb-4" />
              
              <div className="space-y-3">
                 {isIntentionsLoading && intentions.length === 0 ? (
                  Array.from({ length: 3 }).map((_, idx) => (
                    <div key={`intentions-skeleton-${idx}`} className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-white/10 dark:bg-black/5">
                      <div className="flex-1 min-w-0 pr-4 space-y-2">
                        <Skeleton className="h-4 w-3/4 rounded" />
                        <Skeleton className="h-3 w-1/2 rounded" />
                      </div>
                      <Skeleton className="h-8 w-20 rounded-md" />
                    </div>
                  ))
                ) : intentions && intentions.length > 0 ? (
                  intentions.slice(0, 3).map((intention) => {
                    const alreadyPrayed = myPrayedIntentions?.includes(intention.id);
                    return (
                      <div key={intention.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 p-3 rounded-lg border border-border/40 bg-white/10 dark:bg-black/5 hover:bg-white/20 transition-all duration-300">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground line-clamp-2 sm:line-clamp-1">{intention.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 sm:line-clamp-1">
                            Por: {intention.isAnonymous ? "Anônimo" : intention.authorName} • {intention.prayerCount} {intention.prayerCount === 1 ? "oração" : "orações"}
                          </p>
                        </div>
                        <Button 
                          size="sm"
                          variant={alreadyPrayed ? "outline" : "default"}
                          disabled={prayingId === intention.id}
                          onClick={() => handlePrayForIntention(intention.id)}
                          className={alreadyPrayed 
                            ? "w-full sm:w-auto border border-emerald-600/30 text-emerald-600 hover:bg-emerald-50/50 bg-emerald-500/5 rounded-md text-xs font-semibold px-3 h-8 flex items-center gap-1 shadow-sm transition-all"
                            : "w-full sm:w-auto bg-navy text-[oklch(0.97_0.01_85)] rounded-md border border-[oklch(0.75_0.12_75/0.3)] shadow-sm hover:shadow-md hover:border-[oklch(0.75_0.12_75/0.6)] text-xs font-semibold px-3 h-8 flex items-center gap-1 transition-all"
                          }
                        >
                          {prayingId === intention.id ? (
                            <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin mr-1" />
                          ) : alreadyPrayed ? (
                            <Check size={12} />
                          ) : (
                            <Heart size={12} className="fill-current" />
                          )}
                          <span>{prayingId === intention.id ? "Registrando..." : alreadyPrayed ? "Rezado" : "Rezar"}</span>
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
              <Link href="/intencoes" className="text-xs font-semibold text-navy hover:underline flex items-center justify-end gap-1">
                Ver todas as intenções <ChevronRight size={12} />
              </Link>
            </div>
          </div>

          {/* Vídeos Bíblicos */}
          <div className="prayer-card p-5 sm:p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Play size={16} className="text-[oklch(0.75_0.12_75)]" />
                <h3 className="section-title-sm">
                  Vídeos Bíblicos
                </h3>
              </div>
              <div className="divider-gold mb-4" />
              
              <div className="space-y-3">
                {BIBLE_VIDEOS.slice(0, 3).map((video) => (
                  <Link key={video.id} href={`/videos?play=${video.id}`} aria-label={`Abrir vídeo ${video.title}`} className="block rounded-lg focus-gold-ring">
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer group">
                      <div className="relative w-16 h-10 rounded overflow-hidden flex-shrink-0 bg-black/10">
                        <img 
                          src={video.thumbnail} 
                          alt={video.title} 
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                          <Play size={12} className="text-white fill-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] sm:text-xs font-semibold text-foreground line-clamp-2 group-hover:text-[oklch(0.75_0.12_75)] transition-colors">
                          {video.title}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                          {video.category} • {video.duration}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
            
            <Link href="/videos">
              <Button variant="outline" size="sm" className="w-full mt-4 text-xs">
                Ver todos os vídeos
              </Button>
            </Link>
          </div>
        </div>

      </main>
    </div>
  );
}
