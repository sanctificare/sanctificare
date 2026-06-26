import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import AppNav from "@/components/AppNav";
import { trpc } from "@/lib/trpc";
import { Calendar, ChevronRight, Flame, BarChart2, CheckCircle2, Circle, Sun, BookOpen, Heart, Sparkles, Settings } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";
import { NOVENAS } from "@/data/novenas";
import { DashboardActiveNovena, NOVENA_PROGRESS_STORAGE_KEY, buildDashboardActiveNovena, parseNovenaProgress } from "@/lib/novenaProgress";
import { RosaryIcon } from "@/components/RosaryIcon";
import { PrayingHandsIcon } from "@/components/PrayingHandsIcon";
import { Switch } from "@/components/ui/switch";

const LOGO_IMG = "/assets/sanctificare-logo-v2.webp";

interface MetasConfig {
  liturgia: boolean;
  rosario: boolean;
  lectio: boolean;
  oracoes: boolean;
  intercessao: boolean;
  novena: boolean;
}

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

  // Configuração das metas ativas salvas no localStorage
  const [metasConfig, setMetasConfig] = useState<MetasConfig>(() => {
    try {
      const saved = localStorage.getItem("sanctificare.daily_plan.metas");
      return saved ? JSON.parse(saved) : DEFAULT_METAS;
    } catch {
      return DEFAULT_METAS;
    }
  });

  const handleToggleMetaSetting = (key: keyof MetasConfig) => {
    const updated = { ...metasConfig, [key]: !metasConfig[key] };
    setMetasConfig(updated);
    localStorage.setItem("sanctificare.daily_plan.metas", JSON.stringify(updated));
    toast.success("Configuração de metas atualizada!");
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
    onError: (err) => {
      toast.error(err.message || "Erro ao registrar liturgia.");
    }
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

  // Status de conclusão obtidos dinamicamente da query dailyPlan do backend
  const liturgiaLida = !!dailyPlan?.liturgyCompleted;
  const prayedRosaryToday = !!dailyPlan?.rosaryCompleted;
  const prayedLectioToday = !!dailyPlan?.lectioCompleted;
  const prayedOthersToday = !!dailyPlan?.prayersCompleted;
  const intercessionCompleted = !!dailyPlan?.intercessionCompleted;
  const prayedNovenaToday = !!dailyPlan?.novenaCompleted;

  const chartData = getWeeklyChartData(logs);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <img src={LOGO_IMG} alt="Sanctificare" className="w-16 h-16 rounded-full animate-pulse" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <img src={LOGO_IMG} alt="Sanctificare" className="w-16 h-16 rounded-full mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold mb-2">Acesso Restrito</h2>
          <p className="text-muted-foreground mb-6">Entre para ver e acompanhar seu Plano Diário de Santificação.</p>
          <a href={getLoginUrl()}><Button>Entrar</Button></a>
        </div>
      </div>
    );
  }

  // Cálculo de Metas Ativas e Completadas
  const activeMetasCount = 
    (metasConfig.liturgia ? 1 : 0) +
    (metasConfig.rosario ? 1 : 0) +
    (metasConfig.lectio ? 1 : 0) +
    (metasConfig.oracoes ? 1 : 0) +
    (metasConfig.intercessao ? 1 : 0) +
    (metasConfig.novena && activeNovena ? 1 : 0);

  const completedMetasCount = 
    (metasConfig.liturgia && liturgiaLida ? 1 : 0) +
    (metasConfig.rosario && prayedRosaryToday ? 1 : 0) +
    (metasConfig.lectio && prayedLectioToday ? 1 : 0) +
    (metasConfig.oracoes && prayedOthersToday ? 1 : 0) +
    (metasConfig.intercessao && intercessionCompleted ? 1 : 0) +
    (metasConfig.novena && activeNovena && prayedNovenaToday ? 1 : 0);

  const progressPercent = activeMetasCount > 0 
    ? Math.round((completedMetasCount / activeMetasCount) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-[oklch(0.97_0.01_85)]">
      <AppNav />

      <main className="container py-8">
        <div className="max-w-5xl mx-auto">
          {/* Cabeçalho da Página */}
          <div className="prayer-card p-8 mb-6 animate-fade-in relative overflow-hidden">
            <div className="absolute inset-0 bg-pattern-cross opacity-[0.01] pointer-events-none" />
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div>
                <h1 className="font-display text-3xl font-bold text-[oklch(0.22_0.07_260)] mb-2">
                  Plano Diário de Santificação
                </h1>
                <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
                  A constância é a chave para o crescimento espiritual. Cultive sua comunhão com Deus no cotidiano através das leituras diárias, do Santo Rosário, da meditação e da oração pessoal.
                </p>
              </div>

              {dailyPlan && dailyPlan.streak > 0 && (
                <div className="bg-amber-500/10 text-[oklch(0.55_0.14_35)] border border-amber-500/20 rounded-2xl px-4 py-2 flex items-center gap-2 text-sm font-semibold shadow-sm flex-shrink-0 self-start md:self-center">
                  <Flame size={18} className="text-amber-500 fill-amber-500 animate-pulse" />
                  <span>{dailyPlan.streak} {dailyPlan.streak === 1 ? "dia" : "dias"} de Ofensiva</span>
                </div>
              )}
            </div>

            {/* Barra de Progresso Geral de Hoje */}
            <div className="mt-8 pt-6 border-t border-border/30">
              <div className="flex justify-between text-xs font-semibold text-muted-foreground mb-2">
                <span className="text-[oklch(0.22_0.07_260)]">Progresso espiritual hoje ({completedMetasCount}/{activeMetasCount})</span>
                <span className="text-[oklch(0.55_0.14_35)]">{progressPercent}% Concluído</span>
              </div>
              <div className="w-full bg-black/5 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-emerald-600 h-3 rounded-full transition-all duration-500" 
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Conteúdo: Gráfico, Checklist e Configuração */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Esquerda: Gráfico de Frequência */}
            <div className="lg:col-span-2 space-y-6">
              <div className="prayer-card p-6 flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <BarChart2 size={16} className="text-[oklch(0.65_0.14_70)]" />
                    <h3 className="font-display text-sm font-semibold text-[oklch(0.22_0.07_260)] uppercase tracking-wide">
                      Frequência de Orações Semanais
                    </h3>
                  </div>
                  <div className="divider-gold mb-4" />
                  <div className="h-[280px] w-full mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                        <XAxis dataKey="name" stroke="oklch(0.22 0.07 260 / 0.6)" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="oklch(0.22 0.07 260 / 0.6)" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: "oklch(0.22 0.07 260)", border: "1px solid oklch(0.75 0.12 75 / 0.3)", borderRadius: "8px" }}
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
              </div>
            </div>

            {/* Direita: Metas e Configurações */}
            <div className="space-y-6">
              
              {/* Card 1: Checklist de Metas Diárias */}
              <div className="prayer-card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar size={16} className="text-[oklch(0.65_0.14_70)]" />
                  <h3 className="font-display text-sm font-semibold text-[oklch(0.22_0.07_260)] uppercase tracking-wide">
                    Metas de Hoje
                  </h3>
                </div>
                <div className="divider-gold mb-4" />
                
                <div className="space-y-3.5">
                  {activeMetasCount === 0 && (
                    <div className="text-center py-6">
                      <Sparkles size={24} className="text-muted-foreground mx-auto mb-2 opacity-40" />
                      <p className="text-xs text-muted-foreground">Nenhuma meta ativa no momento.</p>
                      <p className="text-[10px] text-muted-foreground/80 mt-1">Ative as práticas desejadas no painel abaixo.</p>
                    </div>
                  )}

                  {/* Meta 1: Liturgia */}
                  {metasConfig.liturgia && (
                    <div 
                      onClick={handleToggleLiturgia}
                      className="flex items-center justify-between p-3 rounded-lg border border-border/40 hover:bg-white/40 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {liturgiaLida ? (
                          <CheckCircle2 className="text-emerald-600 fill-emerald-500/10" size={20} />
                        ) : (
                          <Circle className="text-muted-foreground" size={20} />
                        )}
                        <div>
                          <p className={`text-sm font-medium ${liturgiaLida ? "line-through text-muted-foreground" : "text-foreground"}`}>
                            Leitura da Liturgia
                          </p>
                          <p className="text-xs text-muted-foreground">Leia as leituras do dia</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Meta 2: Terço */}
                  {metasConfig.rosario && (
                    <Link href="/rosario">
                      <div className="flex items-center justify-between p-3 rounded-lg border border-border/40 hover:bg-white/40 cursor-pointer transition-colors">
                        <div className="flex items-center gap-3">
                          {prayedRosaryToday ? (
                            <CheckCircle2 className="text-emerald-600 fill-emerald-500/10" size={20} />
                          ) : (
                            <Circle className="text-muted-foreground" size={20} />
                          )}
                          <div>
                            <p className={`text-sm font-medium ${prayedRosaryToday ? "line-through text-muted-foreground" : "text-foreground"}`}>
                              Santo Terço
                            </p>
                            <p className="text-xs text-muted-foreground">Reze o Rosário hoje</p>
                          </div>
                        </div>
                        {!prayedRosaryToday && <ChevronRight size={14} className="text-muted-foreground" />}
                      </div>
                    </Link>
                  )}

                  {/* Meta 3: Lectio Divina */}
                  {metasConfig.lectio && (
                    <Link href="/lectio">
                      <div className="flex items-center justify-between p-3 rounded-lg border border-border/40 hover:bg-white/40 cursor-pointer transition-colors">
                        <div className="flex items-center gap-3">
                          {prayedLectioToday ? (
                            <CheckCircle2 className="text-emerald-600 fill-emerald-500/10" size={20} />
                          ) : (
                            <Circle className="text-muted-foreground" size={20} />
                          )}
                          <div>
                            <p className={`text-sm font-medium ${prayedLectioToday ? "line-through text-muted-foreground" : "text-foreground"}`}>
                              Lectio Divina
                            </p>
                            <p className="text-xs text-muted-foreground">Escreva no seu diário espiritual</p>
                          </div>
                        </div>
                        {!prayedLectioToday && <ChevronRight size={14} className="text-muted-foreground" />}
                      </div>
                    </Link>
                  )}

                  {/* Meta 4: Orações Tradicionais */}
                  {metasConfig.oracoes && (
                    <Link href="/oracoes">
                      <div className="flex items-center justify-between p-3 rounded-lg border border-border/40 hover:bg-white/40 cursor-pointer transition-colors">
                        <div className="flex items-center gap-3">
                          {prayedOthersToday ? (
                            <CheckCircle2 className="text-emerald-600 fill-emerald-500/10" size={20} />
                          ) : (
                            <Circle className="text-muted-foreground" size={20} />
                          )}
                          <div>
                            <p className={`text-sm font-medium ${prayedOthersToday ? "line-through text-muted-foreground" : "text-foreground"}`}>
                              Orações Tradicionais
                            </p>
                            <p className="text-xs text-muted-foreground">Reze orações do devocionário</p>
                          </div>
                        </div>
                        {!prayedOthersToday && <ChevronRight size={14} className="text-muted-foreground" />}
                      </div>
                    </Link>
                  )}

                  {/* Meta 5: Vela e Intercessão */}
                  {metasConfig.intercessao && (
                    <Link href="/vela-virtual">
                      <div className="flex items-center justify-between p-3 rounded-lg border border-border/40 hover:bg-white/40 cursor-pointer transition-colors">
                        <div className="flex items-center gap-3">
                          {intercessionCompleted ? (
                            <CheckCircle2 className="text-emerald-600 fill-emerald-500/10" size={20} />
                          ) : (
                            <Circle className="text-muted-foreground" size={20} />
                          )}
                          <div>
                            <p className={`text-sm font-medium ${intercessionCompleted ? "line-through text-muted-foreground" : "text-foreground"}`}>
                              Intercessão e Vela
                            </p>
                            <p className="text-xs text-muted-foreground">Reze pelas intenções ou acenda vela</p>
                          </div>
                        </div>
                        {!intercessionCompleted && <ChevronRight size={14} className="text-muted-foreground" />}
                      </div>
                    </Link>
                  )}

                  {/* Meta 6: Novena Diária (Dinâmico) */}
                  {metasConfig.novena && activeNovena && (
                    <Link href={`/novenas/${activeNovena.novena.slug}`}>
                      <div className="flex items-center justify-between p-3 rounded-lg border border-border/40 hover:bg-white/40 cursor-pointer transition-colors">
                        <div className="flex items-center gap-3">
                          {prayedNovenaToday ? (
                            <CheckCircle2 className="text-emerald-600 fill-emerald-500/10" size={20} />
                          ) : (
                            <Circle className="text-muted-foreground" size={20} />
                          )}
                          <div>
                            <p className={`text-sm font-medium ${prayedNovenaToday ? "line-through text-muted-foreground" : "text-foreground"}`}>
                              Novena Diária
                            </p>
                            <p className="text-xs text-muted-foreground">Reze o Dia {activeNovena.nextDay} da novena</p>
                          </div>
                        </div>
                        {!prayedNovenaToday && <ChevronRight size={14} className="text-muted-foreground" />}
                      </div>
                    </Link>
                  )}
                </div>
              </div>

              {/* Card 2: Painel de Personalização de Metas */}
              <div className="prayer-card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Settings size={16} className="text-[oklch(0.65_0.14_70)]" />
                  <h3 className="font-display text-sm font-semibold text-[oklch(0.22_0.07_260)] uppercase tracking-wide">
                    Personalizar Metas
                  </h3>
                </div>
                <div className="divider-gold mb-4" />
                
                <p className="text-[11px] text-muted-foreground mb-4 leading-relaxed">
                  Selecione os exercícios espirituais que deseja incluir na sua rotina. As metas desativadas não afetarão o cálculo do seu progresso diário.
                </p>

                <div className="space-y-4">
                  {/* Toggle Liturgia */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[oklch(0.75_0.12_75/0.1)] text-[oklch(0.75_0.12_75)] flex items-center justify-center flex-shrink-0">
                        <Sun size={15} />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-foreground">Liturgia Diária</p>
                        <p className="text-[10px] text-muted-foreground">Leituras litúrgicas do dia</p>
                      </div>
                    </div>
                    <Switch 
                      checked={metasConfig.liturgia} 
                      onCheckedChange={() => handleToggleMetaSetting("liturgia")}
                    />
                  </div>

                  {/* Toggle Terço */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[oklch(0.75_0.12_75/0.1)] text-[oklch(0.75_0.12_75)] flex items-center justify-center flex-shrink-0">
                        <RosaryIcon size={15} />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-foreground">Santo Terço</p>
                        <p className="text-[10px] text-muted-foreground">Santo Rosário cotidiano</p>
                      </div>
                    </div>
                    <Switch 
                      checked={metasConfig.rosario} 
                      onCheckedChange={() => handleToggleMetaSetting("rosario")}
                    />
                  </div>

                  {/* Toggle Lectio */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[oklch(0.75_0.12_75/0.1)] text-[oklch(0.75_0.12_75)] flex items-center justify-center flex-shrink-0">
                        <BookOpen size={15} />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-foreground">Lectio Divina</p>
                        <p className="text-[10px] text-muted-foreground">Diário e meditação orante</p>
                      </div>
                    </div>
                    <Switch 
                      checked={metasConfig.lectio} 
                      onCheckedChange={() => handleToggleMetaSetting("lectio")}
                    />
                  </div>

                  {/* Toggle Orações */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[oklch(0.75_0.12_75/0.1)] text-[oklch(0.75_0.12_75)] flex items-center justify-center flex-shrink-0">
                        <PrayingHandsIcon size={15} />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-foreground">Orações Tradicionais</p>
                        <p className="text-[10px] text-muted-foreground">Devocionário geral da Igreja</p>
                      </div>
                    </div>
                    <Switch 
                      checked={metasConfig.oracoes} 
                      onCheckedChange={() => handleToggleMetaSetting("oracoes")}
                    />
                  </div>

                  {/* Toggle Intercessão */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[oklch(0.75_0.12_75/0.1)] text-[oklch(0.75_0.12_75)] flex items-center justify-center flex-shrink-0">
                        <Flame size={15} />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-foreground">Intercessão e Vela</p>
                        <p className="text-[10px] text-muted-foreground">Pedir ou interceder por irmãos</p>
                      </div>
                    </div>
                    <Switch 
                      checked={metasConfig.intercessao} 
                      onCheckedChange={() => handleToggleMetaSetting("intercessao")}
                    />
                  </div>

                  {/* Toggle Novenas */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[oklch(0.75_0.12_75/0.1)] text-[oklch(0.75_0.12_75)] flex items-center justify-center flex-shrink-0">
                        <Calendar size={15} />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-foreground">Novenas e Devoção</p>
                        <p className="text-[10px] text-muted-foreground">Jornadas ativas de oração</p>
                      </div>
                    </div>
                    <Switch 
                      checked={metasConfig.novena} 
                      onCheckedChange={() => handleToggleMetaSetting("novena")}
                    />
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
