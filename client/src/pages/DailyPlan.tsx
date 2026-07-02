import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowRight,
  BarChart2,
  BookOpen,
  Calendar,
  ChevronRight,
  CheckCircle2,
  Circle,
  Flame,
  Heart,
  Settings,
  Sparkles,
  Sun,
} from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { NOVENAS } from "@/data/novenas";
import {
  DashboardActiveNovena,
  NOVENA_PROGRESS_STORAGE_KEY,
  buildDashboardActiveNovena,
  parseNovenaProgress,
} from "@/lib/novenaProgress";
import { RosaryIcon } from "@/components/RosaryIcon";
import { PrayingHandsIcon } from "@/components/PrayingHandsIcon";
import { Switch } from "@/components/ui/switch";

const LOGO_IMG = "/assets/logo-sanctificare.webp";

interface MetasConfig {
  liturgia: boolean;
  rosario: boolean;
  lectio: boolean;
  oracoes: boolean;
  intercessao: boolean;
  novena: boolean;
}

type MetaKey = keyof MetasConfig;

type DailyMeta = {
  key: MetaKey;
  title: string;
  description: string;
  encouragement: string;
  completed: boolean;
  enabled: boolean;
  href?: string;
  icon: React.ReactNode;
  onClick?: () => void;
};

const DEFAULT_METAS: MetasConfig = {
  liturgia: true,
  rosario: true,
  lectio: true,
  oracoes: false,
  intercessao: false,
  novena: true,
};

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

export default function DailyPlan() {
  const { isAuthenticated, loading } = useAuth();
  const { data: logs } = trpc.prayers.getAllLogs.useQuery(undefined, { enabled: isAuthenticated });
  const { data: dailyPlan } = trpc.dailyPlan.getStatus.useQuery(undefined, { enabled: isAuthenticated });

  const utils = trpc.useUtils();
  const [activeNovena, setActiveNovena] = useState<DashboardActiveNovena | null>(null);

  const [metasConfig, setMetasConfig] = useState<MetasConfig>(() => {
    try {
      const saved = localStorage.getItem("sanctificare.daily_plan.metas");
      return saved ? JSON.parse(saved) : DEFAULT_METAS;
    } catch {
      return DEFAULT_METAS;
    }
  });

  const handleToggleMetaSetting = (key: MetaKey) => {
    const updated = { ...metasConfig, [key]: !metasConfig[key] };
    setMetasConfig(updated);
    localStorage.setItem("sanctificare.daily_plan.metas", JSON.stringify(updated));
    toast.success("Rotina diária atualizada!");
  };

  useEffect(() => {
    if (isAuthenticated) {
      try {
        const raw = localStorage.getItem(NOVENA_PROGRESS_STORAGE_KEY);
        const progressMap = parseNovenaProgress(raw);
        setActiveNovena(buildDashboardActiveNovena(progressMap, NOVENAS));
      } catch (err) {
        console.error("Erro ao ler progresso de novenas no plano diário:", err);
        setActiveNovena(null);
      }
    }
  }, [isAuthenticated]);

  const logPrayerMutation = trpc.prayers.logPrayer.useMutation({
    onSuccess: () => {
      toast.success("Liturgia Diária registrada no seu histórico!");
      utils.prayers.getAllLogs.invalidate();
      utils.dailyPlan.getStatus.invalidate();
    },
    onError: err => {
      toast.error(err.message || "Erro ao registrar liturgia.");
    },
  });

  const liturgiaLida = !!dailyPlan?.liturgyCompleted;
  const prayedRosaryToday = !!dailyPlan?.rosaryCompleted;
  const prayedLectioToday = !!dailyPlan?.lectioCompleted;
  const prayedOthersToday = !!dailyPlan?.prayersCompleted;
  const intercessionCompleted = !!dailyPlan?.intercessionCompleted;
  const prayedNovenaToday = !!dailyPlan?.novenaCompleted;

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

  const dailyMetas: DailyMeta[] = [
    {
      key: "liturgia",
      title: "Liturgia Diária",
      description: "Comece pela Palavra e pelas leituras do dia.",
      encouragement: "Abra espaço para Deus falar primeiro.",
      completed: liturgiaLida,
      enabled: metasConfig.liturgia,
      icon: <Sun size={18} />,
      onClick: handleToggleLiturgia,
    },
    {
      key: "rosario",
      title: "Santo Terço",
      description: "Reze com Maria e confie suas intenções.",
      encouragement: "Um mistério por vez, com calma e presença.",
      completed: prayedRosaryToday,
      enabled: metasConfig.rosario,
      href: "/rosario",
      icon: <RosaryIcon size={18} />,
    },
    {
      key: "lectio",
      title: "Lectio Divina",
      description: "Medite, escute e registre o que ficou no coração.",
      encouragement: "Transforme leitura em conversa com Deus.",
      completed: prayedLectioToday,
      enabled: metasConfig.lectio,
      href: "/lectio",
      icon: <BookOpen size={18} />,
    },
    {
      key: "oracoes",
      title: "Orações Tradicionais",
      description: "Escolha uma oração do devocionário.",
      encouragement: "Volte às palavras que sustentam a fé da Igreja.",
      completed: prayedOthersToday,
      enabled: metasConfig.oracoes,
      href: "/oracoes",
      icon: <PrayingHandsIcon size={18} />,
    },
    {
      key: "intercessao",
      title: "Intercessão e Vela",
      description: "Apresente intenções e reze por quem precisa.",
      encouragement: "Sua oração também pode carregar alguém hoje.",
      completed: intercessionCompleted,
      enabled: metasConfig.intercessao,
      href: "/vela-virtual",
      icon: <Flame size={18} />,
    },
    {
      key: "novena",
      title: "Novena Diária",
      description: activeNovena
        ? `Reze o Dia ${activeNovena.nextDay} da sua novena.`
        : "Inicie uma novena para acompanhar aqui.",
      encouragement: activeNovena
        ? "Continue a jornada que você começou."
        : "Escolha uma devoção para caminhar por nove dias.",
      completed: prayedNovenaToday,
      enabled: metasConfig.novena && !!activeNovena,
      href: activeNovena ? `/novenas/${activeNovena.novena.slug}` : "/novenas",
      icon: <Calendar size={18} />,
    },
  ];

  const activeMetas = dailyMetas.filter(meta => meta.enabled);
  const completedMetasCount = activeMetas.filter(meta => meta.completed).length;
  const activeMetasCount = activeMetas.length;
  const progressPercent = activeMetasCount > 0
    ? Math.round((completedMetasCount / activeMetasCount) * 100)
    : 0;
  const nextMeta = activeMetas.find(meta => !meta.completed);
  const allDone = activeMetasCount > 0 && completedMetasCount === activeMetasCount;
  const chartData = useMemo(() => getWeeklyChartData(logs), [logs]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <img src={LOGO_IMG} alt="Sanctificare" className="w-16 h-16 object-contain animate-pulse" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <img src={LOGO_IMG} alt="Sanctificare" className="w-16 h-16 object-contain mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold mb-2">Acesso Restrito</h2>
          <p className="text-muted-foreground mb-6">
            Entre para ver e acompanhar seu Plano Diário.
          </p>
          <a href={getLoginUrl()}><Button>Entrar</Button></a>
        </div>
      </div>
    );
  }

  const progressMessage = allDone
    ? "Seu plano de hoje está completo. Receba este pequeno fechamento com gratidão."
    : nextMeta
      ? `Próximo passo: ${nextMeta.title}.`
      : "Escolha as práticas que deseja cultivar hoje.";

  return (
    <div className="min-h-screen bg-[oklch(0.97_0.01_85)]">
      <main className="container py-6 md:py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <section className="relative overflow-hidden rounded-2xl border border-[oklch(0.75_0.12_75/0.2)] p-6 md:p-8 animate-fade-in flex flex-col justify-between min-h-[220px]">
            <img
              src="/assets/dashboard/plano-diario.png"
              alt="Plano Diário"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[oklch(0.12_0.03_260/0.95)] via-[oklch(0.12_0.03_260/0.80)] to-[oklch(0.12_0.03_260/0.40)]" />
            
            <div className="relative z-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-[oklch(0.75_0.12_75/0.2)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-[oklch(0.88_0.08_80)] mb-4 backdrop-blur-sm border border-[oklch(0.75_0.12_75/0.3)] animate-fade-in">
                  <Sparkles size={13} className="text-[oklch(0.75_0.12_75)]" />
                  Roteiro espiritual de hoje
                </div>
                <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-3 leading-tight tracking-tight">
                  Plano Diário
                </h1>
                <p className="text-sm md:text-base text-[oklch(0.95_0.01_80/0.8)] max-w-2xl leading-relaxed">
                  Um passo concreto por vez: Palavra, oração, meditação e intercessão para sustentar sua comunhão com Deus no cotidiano.
                </p>
              </div>

              <div className="rounded-xl border border-[oklch(0.75_0.12_75/0.25)] bg-[oklch(0.12_0.03_260/0.7)] backdrop-blur-md p-4 shadow-md hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[oklch(0.75_0.12_75)]">
                      Constância
                    </p>
                    <p className="mt-1 text-2xl font-bold text-white">
                      {dailyPlan?.streak || 0} {dailyPlan?.streak === 1 ? "dia" : "dias"}
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-amber-500/20 text-amber-200 border border-amber-500/30 flex items-center justify-center">
                    <Flame size={24} className={dailyPlan?.streak ? "fill-amber-400 animate-pulse text-amber-400" : "text-amber-200"} />
                  </div>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-[oklch(0.90_0.01_260)]">
                  {dailyPlan?.streak
                    ? "Sua fidelidade diária está criando raiz."
                    : "Comece hoje e volte amanhã para manter a chama acesa."}
                </p>
              </div>
            </div>

            <div className="relative z-10 mt-7 pt-6 border-t border-[oklch(0.75_0.12_75/0.2)]">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between mb-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[oklch(0.75_0.12_75)]">
                    Progresso de hoje
                  </p>
                  <p className="text-sm font-medium text-white">
                    {completedMetasCount} de {activeMetasCount} práticas concluídas
                  </p>
                </div>
                <span className="text-sm font-bold text-[oklch(0.75_0.12_75)]">
                  {progressPercent}% concluído
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden border border-white/20 shadow-inner">
                <div
                  className="bg-gradient-to-r from-[oklch(0.75_0.12_75)] to-emerald-500 h-2.5 rounded-full transition-all duration-700"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_22rem] gap-6">
            <div className="space-y-6">
              <div className="prayer-card p-6 md:p-7">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar size={17} className="text-[oklch(0.65_0.14_70)]" />
                    <h2 className="font-display text-lg font-semibold text-[oklch(0.22_0.07_260)]">
                      Metas de Hoje
                    </h2>
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground">
                    {completedMetasCount}/{activeMetasCount}
                  </span>
                </div>
                <div className="divider-gold mb-5" />

                <div className="grid gap-3">
                  {activeMetasCount === 0 && (
                    <div className="text-center py-8">
                      <Sparkles size={26} className="text-muted-foreground mx-auto mb-3 opacity-40" />
                      <p className="text-sm font-medium text-foreground">Nenhuma meta ativa no momento.</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Ative as práticas desejadas em "Ajustar rotina".
                      </p>
                    </div>
                  )}

                  {activeMetas.map(meta => (
                    <DailyMetaRow key={meta.key} meta={meta} />
                  ))}
                </div>
              </div>

              <div className="prayer-card p-6 md:p-7">
                <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Heart size={17} className="text-[oklch(0.62_0.14_35)]" />
                      <h2 className="font-display text-lg font-semibold text-[oklch(0.22_0.07_260)]">
                        {allDone ? "Plano de hoje concluído" : "Seu próximo passo"}
                      </h2>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {progressMessage}
                    </p>
                  </div>

                  {nextMeta ? (
                    nextMeta.href ? (
                      <Link href={nextMeta.href}>
                        <Button className="w-full md:w-auto gap-2 bg-[oklch(0.22_0.07_260)] text-[oklch(0.97_0.01_85)] border border-[oklch(0.75_0.12_75/0.3)] shadow-sm hover:shadow-md hover:border-[oklch(0.75_0.12_75/0.6)] font-bold text-xs uppercase tracking-wider py-2.5 px-4 rounded-lg flex items-center justify-center transition-all">
                          Continuar
                          <ChevronRight size={16} />
                        </Button>
                      </Link>
                    ) : (
                      <Button
                        onClick={nextMeta.onClick}
                        disabled={logPrayerMutation.isPending}
                        className="w-full md:w-auto gap-2 bg-[oklch(0.22_0.07_260)] text-[oklch(0.97_0.01_85)] border border-[oklch(0.75_0.12_75/0.3)] shadow-sm hover:shadow-md hover:border-[oklch(0.75_0.12_75/0.6)] font-bold text-xs uppercase tracking-wider py-2.5 px-4 rounded-lg flex items-center justify-center transition-all"
                      >
                        Marcar agora
                        <CheckCircle2 size={16} />
                      </Button>
                    )
                  ) : allDone ? (
                    <div className="rounded-full bg-emerald-600/10 px-4 py-2 text-sm font-semibold text-emerald-700">
                      Amém
                    </div>
                  ) : (
                    <Link href="/novenas">
                      <Button variant="outline" className="w-full md:w-auto gap-2">
                        Escolher devoção
                        <ChevronRight size={16} />
                      </Button>
                    </Link>
                  )}
                </div>

                {allDone && (
                  <div className="mt-5 rounded-lg border border-emerald-600/20 bg-emerald-600/5 p-4">
                    <p className="font-serif text-base leading-relaxed text-[oklch(0.24_0.05_150)]">
                      Senhor, recebei este dia vivido diante de Vós. Guardai no coração aquilo que foi rezado e ajudai-me a recomeçar amanhã com humildade.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <aside className="space-y-6">
              <details className="prayer-card p-6 group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
                  <span className="flex items-center gap-2">
                    <Settings size={16} className="text-[oklch(0.65_0.14_70)]" />
                    <span className="font-display text-sm font-semibold text-[oklch(0.22_0.07_260)] uppercase tracking-[0.15em]">
                      Ajustar rotina
                    </span>
                  </span>
                  <ChevronRight size={15} className="text-muted-foreground transition-transform group-open:rotate-90" />
                </summary>

                <p className="mt-4 text-xs text-muted-foreground leading-relaxed">
                  Selecione as práticas que deseja incluir. Metas desativadas não entram no progresso do dia.
                </p>

                <div className="mt-5 space-y-4">
                  {dailyMetas.map(meta => (
                    <div key={meta.key} className="flex items-center justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[oklch(0.75_0.12_75/0.1)] text-[oklch(0.65_0.14_70)] flex items-center justify-center flex-shrink-0">
                          {meta.icon}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-foreground truncate">{meta.title}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{meta.encouragement}</p>
                        </div>
                      </div>
                      <Switch
                        checked={metasConfig[meta.key]}
                        onCheckedChange={() => handleToggleMetaSetting(meta.key)}
                      />
                    </div>
                  ))}
                </div>
              </details>

              <Link href="/intencoes" className="block group">
                <div className="prayer-card p-6 cursor-pointer hover:border-[oklch(0.75_0.12_75/0.4)] transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Heart size={16} className="text-[oklch(0.62_0.14_35)] group-hover:scale-110 transition-transform duration-300" />
                      <h3 className="font-display text-sm font-semibold text-[oklch(0.22_0.07_260)] uppercase tracking-[0.15em]">
                        Intenção do dia
                      </h3>
                    </div>
                    <ChevronRight size={15} className="text-muted-foreground group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                  <div className="divider-gold mb-4" />
                  <p className="font-serif text-lg leading-relaxed text-[oklch(0.20_0.04_260)]">
                    Rezar pela perseverança nas pequenas fidelidades.
                  </p>
                  <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                    A santidade costuma amadurecer nos gestos simples que escolhemos repetir com amor.
                  </p>
                  <div className="mt-4 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[oklch(0.55_0.14_35)] group-hover:text-[oklch(0.55_0.14_35/0.8)] transition-colors">
                    Ver mural de intenções
                    <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </Link>

              <div className="prayer-card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart2 size={16} className="text-[oklch(0.65_0.14_70)]" />
                  <h3 className="font-display text-sm font-semibold text-[oklch(0.22_0.07_260)] uppercase tracking-[0.15em]">
                    Semana
                  </h3>
                </div>
                <div className="divider-gold mb-4" />
                <div className="h-[230px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 4, left: -28, bottom: 0 }}>
                      <XAxis dataKey="name" stroke="oklch(0.22 0.07 260 / 0.6)" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="oklch(0.22 0.07 260 / 0.6)" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "oklch(0.22 0.07 260)",
                          border: "1px solid oklch(0.75 0.12 75 / 0.3)",
                          borderRadius: "8px",
                        }}
                        labelStyle={{ color: "#ffffff", fontWeight: "bold" }}
                        itemStyle={{ color: "oklch(0.82 0.10 80)" }}
                      />
                      <Bar dataKey="quantidade" fill="oklch(0.75 0.12 75)" radius={[4, 4, 0, 0]}>
                        {chartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.quantidade > 0 ? "oklch(0.75 0.12 75)" : "oklch(0.75 0.12 75 / 0.3)"}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </aside>
          </section>
        </div>
      </main>
    </div>
  );
}

function DailyMetaRow({ meta }: { meta: DailyMeta }) {
  const content = (
    <div className={`flex items-center justify-between gap-4 rounded-lg border p-4 transition-all duration-300 shadow-sm hover:shadow-md ${
      meta.completed
        ? "border-emerald-600/20 bg-emerald-600/5"
        : "border-[oklch(0.75_0.12_75/0.2)] bg-gradient-to-br from-white/95 to-[oklch(0.99_0.005_85)]/95 hover:border-[oklch(0.75_0.12_75/0.4)]"
    }`}>
      <div className="flex min-w-0 items-start gap-3">
        <div className={`mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border ${
          meta.completed
            ? "bg-emerald-600/10 text-emerald-700 border-emerald-600/20"
            : "bg-[oklch(0.75_0.12_75/0.12)] text-[oklch(0.55_0.12_70)] border-[oklch(0.75_0.12_75/0.2)]"
        }`}>
          {meta.icon}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {meta.completed ? (
              <CheckCircle2 className="text-emerald-600 fill-emerald-500/10 flex-shrink-0" size={18} />
            ) : (
              <Circle className="text-muted-foreground flex-shrink-0" size={18} />
            )}
            <p className={`text-sm font-semibold ${meta.completed ? "text-emerald-800" : "text-foreground"}`}>
              {meta.title}
            </p>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {meta.completed ? meta.encouragement : meta.description}
          </p>
        </div>
      </div>
      {!meta.completed && <ChevronRight size={15} className="flex-shrink-0 text-muted-foreground" />}
    </div>
  );

  if (meta.href) {
    return <Link href={meta.href}>{content}</Link>;
  }

  return (
    <button
      type="button"
      onClick={meta.onClick}
      className="w-full text-left"
    >
      {content}
    </button>
  );
}
