import { useState, useMemo } from "react";
import { Link } from "wouter";
import {
  Calendar as CalendarIcon,
  Crown,
  Search,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Shield,
  BookOpen,
  ArrowRight,
  Flame,
  Award,
  Filter
} from "lucide-react";
import {
  SAINTS_DATABASE,
  MONTH_NAMES_PT,
  Saint,
  getSaintsForMonth,
  getSaintForDate,
  getHolyDaysOfObligation,
  searchSaints,
  getSaintLiturgicalStyle,
  getTodaySaint
} from "@/data/santoral";
import GooglePlayBanner from "@/components/GooglePlayBanner";

type ViewMode = "calendario" | "todos" | "guarda";

export default function Santoral() {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth() + 1); // 1 a 12
  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());
  const [selectedDay, setSelectedDay] = useState<number>(today.getDate());
  const [viewMode, setViewMode] = useState<ViewMode>("calendario");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("todos");

  // Dias do mês atual
  const daysInMonth = useMemo(() => {
    return new Date(currentYear, currentMonth, 0).getDate();
  }, [currentYear, currentMonth]);

  const firstDayWeekIndex = useMemo(() => {
    // 0 = Domingo, 1 = Segunda, etc.
    return new Date(currentYear, currentMonth - 1, 1).getDay();
  }, [currentYear, currentMonth]);

  // Santos do mês
  const saintsInCurrentMonth = useMemo(() => {
    return getSaintsForMonth(currentMonth);
  }, [currentMonth]);

  // Santo do dia selecionado
  const selectedSaint = useMemo(() => {
    return getSaintForDate(currentMonth, selectedDay);
  }, [currentMonth, selectedDay]);

  // Santo de hoje
  const todaySaint = useMemo(() => {
    return getTodaySaint(today);
  }, []);

  // Lista filtrada para a aba "Todos os Santos"
  const filteredSaintsList = useMemo(() => {
    return searchSaints(searchQuery, selectedCategory);
  }, [searchQuery, selectedCategory]);

  const holyDaysList = useMemo(() => {
    return getHolyDaysOfObligation();
  }, []);

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(y => y - 1);
    } else {
      setCurrentMonth(m => m - 1);
    }
    setSelectedDay(1);
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(y => y + 1);
    } else {
      setCurrentMonth(m => m + 1);
    }
    setSelectedDay(1);
  };

  return (
    <div className="min-h-screen bg-[oklch(0.97_0.01_85)] dark:bg-[oklch(0.12_0.03_260)] text-foreground relative overflow-hidden pb-16">
      {/* Background decorativo */}
      <div className="absolute inset-0 bg-pattern-cross opacity-[0.02] dark:opacity-[0.04] pointer-events-none" />

      <main className="container max-w-5xl py-6 sm:py-8 relative z-10 px-4 sm:px-6">
        {/* Banner Google Play (apenas desktop web) */}
        <div className="mb-6">
          <GooglePlayBanner variant="card" showDismiss={true} />
        </div>

        {/* Header Principal */}
        <div className="mb-6 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 mb-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-sm">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-300">
                Tradição & Hagiografia Católica
              </span>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-[oklch(0.22_0.07_260)] dark:text-[oklch(0.95_0.04_80)]">
                Santoral & Calendário dos Santos
              </h1>
            </div>
          </div>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Conheça as vidas santas, histórias de martírio, relíquias sagradas e as celebrações de preceito da Igreja ao longo do ano litúrgico.
          </p>
        </div>

        {/* Card Destaque: Santo de Hoje */}
        <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-amber-100 dark:bg-amber-950/40 border border-amber-400/40 shrink-0 shadow-sm flex items-center justify-center">
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
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                    ⭐ Santo de Hoje • {today.getDate()} de {MONTH_NAMES_PT[today.getMonth()]}
                  </span>
                  {todaySaint.isHolyDayOfObligation && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-yellow-500/25 text-yellow-900 dark:text-yellow-200 border border-yellow-500/40">
                      🏆 Festa de Guarda
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

            <Link href={`/santoral/${todaySaint.slug}`} className="w-full md:w-auto">
              <button className="w-full md:w-auto px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-semibold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2">
                <span>Ver Vida & Relíquias</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>

        {/* Seletor de Modo de Visualização */}
        <div className="flex flex-wrap items-center gap-2 mb-6 border-b border-border/40 pb-3">
          <button
            onClick={() => setViewMode("calendario")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center gap-2 ${
              viewMode === "calendario"
                ? "bg-[oklch(0.22_0.07_260)] text-white dark:bg-amber-500/20 dark:text-amber-300 dark:border dark:border-amber-500/40 shadow-sm"
                : "bg-white/70 dark:bg-neutral-800/60 text-muted-foreground hover:text-foreground"
            }`}
          >
            <CalendarIcon className="w-4 h-4" />
            <span>Calendário Litúrgico</span>
          </button>

          <button
            onClick={() => setViewMode("todos")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center gap-2 ${
              viewMode === "todos"
                ? "bg-[oklch(0.22_0.07_260)] text-white dark:bg-amber-500/20 dark:text-amber-300 dark:border dark:border-amber-500/40 shadow-sm"
                : "bg-white/70 dark:bg-neutral-800/60 text-muted-foreground hover:text-foreground"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Almanaque de Santos ({SAINTS_DATABASE.length})</span>
          </button>

          <button
            onClick={() => setViewMode("guarda")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center gap-2 ${
              viewMode === "guarda"
                ? "bg-amber-600 text-white dark:bg-amber-500/30 dark:text-amber-200 dark:border dark:border-amber-500/50 shadow-sm"
                : "bg-white/70 dark:bg-neutral-800/60 text-amber-700 dark:text-amber-400 hover:bg-amber-500/10"
            }`}
          >
            <Crown className="w-4 h-4 text-amber-400" />
            <span>Festas de Guarda ({holyDaysList.length})</span>
          </button>
        </div>

        {/* 1. MODO: CALENDÁRIO MENSAL */}
        {viewMode === "calendario" && (
          <div className="space-y-6">
            {/* Navegação do Mês */}
            <div className="flex items-center justify-between bg-white dark:bg-[oklch(0.16_0.04_260/0.7)] p-4 rounded-2xl border border-border/50 shadow-sm">
              <button
                onClick={handlePrevMonth}
                className="p-2 rounded-xl hover:bg-muted/70 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Mês anterior"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="text-center">
                <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground">
                  {MONTH_NAMES_PT[currentMonth - 1]} <span className="text-amber-600 dark:text-amber-400 font-sans">{currentYear}</span>
                </h2>
                <p className="text-xs text-muted-foreground">
                  {saintsInCurrentMonth.length} {saintsInCurrentMonth.length === 1 ? "celebração registrada" : "celebrações registradas"}
                </p>
              </div>

              <button
                onClick={handleNextMonth}
                className="p-2 rounded-xl hover:bg-muted/70 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Próximo mês"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Legenda Litúrgica */}
            <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] text-muted-foreground bg-white/50 dark:bg-neutral-900/30 p-2.5 rounded-xl border border-border/30">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-300 border border-amber-500/40" /> Branco (Santos/Virgens)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Vermelho (Mártires)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 ring-2 ring-amber-500/40" /> 🏆 Preceito (Guarda)
              </span>
            </div>

            {/* Grade do Calendário */}
            <div className="bg-white dark:bg-[oklch(0.15_0.03_260/0.8)] rounded-2xl border border-border/60 p-4 sm:p-5 shadow-sm">
              {/* Dias da semana */}
              <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-muted-foreground pb-2 border-b border-border/30 mb-2">
                <div>DOM</div>
                <div>SEG</div>
                <div>TER</div>
                <div>QUA</div>
                <div>QUI</div>
                <div>SEX</div>
                <div>SÁB</div>
              </div>

              {/* Dias */}
              <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                {/* Espaços vazios do início do mês */}
                {Array.from({ length: firstDayWeekIndex }).map((_, index) => (
                  <div key={`empty-${index}`} className="min-h-[3.8rem] sm:min-h-[4.5rem] rounded-xl opacity-20" />
                ))}

                {/* Dias do mês */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dayNum = i + 1;
                  const saintForDay = getSaintForDate(currentMonth, dayNum);
                  const isSelected = selectedDay === dayNum;
                  const isToday = currentMonth === today.getMonth() + 1 && dayNum === today.getDate() && currentYear === today.getFullYear();
                  const style = saintForDay ? getSaintLiturgicalStyle(saintForDay.liturgicalColor) : null;

                  return (
                    <button
                      key={`day-${dayNum}`}
                      onClick={() => setSelectedDay(dayNum)}
                      className={`min-h-[3.8rem] sm:min-h-[4.5rem] p-1.5 sm:p-2 rounded-xl flex flex-col justify-between items-center text-left transition-all relative group ${
                        isSelected
                          ? "bg-[oklch(0.22_0.07_260)] text-white dark:bg-amber-500/25 dark:text-amber-100 ring-2 ring-amber-500 shadow-md"
                          : isToday
                          ? "bg-amber-500/10 border border-amber-500/40 text-foreground font-bold"
                          : saintForDay
                          ? "bg-muted/40 hover:bg-muted/80 text-foreground border border-border/40"
                          : "hover:bg-muted/30 text-muted-foreground"
                      }`}
                    >
                      <div className="w-full flex items-center justify-between">
                        <span className={`text-xs sm:text-sm font-medium ${isToday ? "text-amber-600 dark:text-amber-400 font-bold" : ""}`}>
                          {dayNum}
                        </span>
                        {saintForDay?.isHolyDayOfObligation && (
                          <Crown className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        )}
                      </div>

                      {saintForDay ? (
                        <div className="w-full mt-1">
                          <span className={`block text-[9px] sm:text-[10px] leading-tight truncate font-serif ${isSelected ? "text-amber-200" : style?.text || "text-foreground"}`}>
                            {saintForDay.name.replace(/^(São|Santa|Santos|Santo)\s+/i, "")}
                          </span>
                          <div className="flex items-center gap-1 mt-0.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${style?.dot || "bg-amber-400"}`} />
                            <span className="text-[8px] text-muted-foreground uppercase truncate hidden sm:inline">
                              {saintForDay.rank}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-[9px] text-muted-foreground/40 hidden sm:block">Féria</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Painel do Dia Selecionado */}
            <div className="bg-white dark:bg-[oklch(0.16_0.04_260/0.8)] rounded-2xl border border-amber-500/30 p-5 sm:p-6 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-300 mb-2">
                <CalendarIcon className="w-4 h-4" />
                <span>{selectedDay} de {MONTH_NAMES_PT[currentMonth - 1]}</span>
              </div>

              {selectedSaint ? (
                <div className="flex flex-col md:flex-row items-start gap-5">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-amber-100 dark:bg-amber-950/40 border border-amber-400/40 shrink-0 shadow-sm">
                    <img
                      src={selectedSaint.image}
                      alt={selectedSaint.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getSaintLiturgicalStyle(selectedSaint.liturgicalColor).badge}`}>
                        {selectedSaint.rank} • Cor: {selectedSaint.liturgicalColor}
                      </span>
                      {selectedSaint.isHolyDayOfObligation && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-900 dark:text-amber-200 border border-amber-500/40 flex items-center gap-1">
                          <Crown className="w-3.5 h-3.5" /> Festa de Guarda (Preceito)
                        </span>
                      )}
                    </div>

                    <h3 className="font-display text-xl sm:text-2xl font-bold text-foreground">
                      {selectedSaint.name}
                    </h3>
                    <p className="text-sm text-muted-foreground font-medium">
                      {selectedSaint.title}
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground/90">
                      {selectedSaint.summary}
                    </p>

                    {selectedSaint.patronage.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-xs font-medium text-muted-foreground">Patronato:</span>
                        {selectedSaint.patronage.map((p, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded-md bg-muted text-[11px] text-foreground">
                            {p}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="pt-3 flex flex-wrap gap-2.5">
                      <Link href={`/santoral/${selectedSaint.slug}`}>
                        <button className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-semibold shadow-sm transition-all flex items-center gap-2">
                          <span>Ler Hagiografia & Relíquias</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </Link>

                      <Link href="/liturgia">
                        <button className="px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs sm:text-sm font-medium transition-all flex items-center gap-2">
                          <BookOpen className="w-4 h-4" />
                          <span>Ver Liturgia da Missa</span>
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center text-muted-foreground">
                  <p className="text-sm">
                    Nenhuma solenidade ou memória principal registrada para o dia {selectedDay} de {MONTH_NAMES_PT[currentMonth - 1]} neste catálogo.
                  </p>
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    A Igreja celebra as orações do Tempo Litúrgico ordinário ou a comemoração dos santos locais.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. MODO: ALMANAQUE DE TODOS OS SANTOS */}
        {viewMode === "todos" && (
          <div className="space-y-6">
            {/* Barra de Busca e Filtros */}
            <div className="bg-white dark:bg-[oklch(0.16_0.04_260/0.7)] p-4 rounded-2xl border border-border/50 space-y-3">
              <div className="relative w-full">
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar santo por nome, título, patronato (ex: estudantes, mártir, França)..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-muted/50 border border-border/60 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-foreground placeholder:text-muted-foreground"
                />
              </div>

              {/* Categorias / Filtros Rápidos */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {[
                  { id: "todos", label: "Todos" },
                  { id: "guarda", label: "⭐ Festas de Guarda" },
                  { id: "solenidades", label: "Solenidades" },
                  { id: "martires", label: "Mártires" },
                  { id: "doutores", label: "Doutores da Igreja" },
                  { id: "marianos", label: "Títulos Marianos" },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      selectedCategory === cat.id
                        ? "bg-amber-600 text-white dark:bg-amber-500/25 dark:text-amber-200 dark:border dark:border-amber-500/40 shadow-sm"
                        : "bg-muted/60 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Lista em Grade de Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredSaintsList.map((saint) => {
                const style = getSaintLiturgicalStyle(saint.liturgicalColor);

                return (
                  <Link key={saint.slug} href={`/santoral/${saint.slug}`}>
                    <div className="p-4 rounded-2xl bg-white dark:bg-[oklch(0.16_0.04_260/0.7)] border border-border/50 hover:border-amber-500/50 hover:shadow-md transition-all group flex items-start gap-4 cursor-pointer h-full">
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-amber-100 dark:bg-amber-950/40 border border-amber-400/30 shrink-0 shadow-sm">
                        <img
                          src={saint.image}
                          alt={saint.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                          <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400">
                            {saint.day} de {MONTH_NAMES_PT[saint.month - 1]}
                          </span>
                          <span className={`px-2 py-0.2 rounded-full text-[9px] font-semibold border ${style.badge}`}>
                            {saint.rank}
                          </span>
                          {saint.isHolyDayOfObligation && (
                            <span className="text-[10px] text-amber-500 font-bold flex items-center gap-0.5">
                              <Crown className="w-3 h-3" /> Guarda
                            </span>
                          )}
                        </div>

                        <h3 className="font-display text-base font-bold text-foreground group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors truncate">
                          {saint.name}
                        </h3>

                        <p className="text-xs text-muted-foreground line-clamp-1 mb-1.5">
                          {saint.title}
                        </p>

                        <p className="text-xs text-muted-foreground/80 line-clamp-2">
                          {saint.summary}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {filteredSaintsList.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm font-medium">Nenhum santo encontrado para "{searchQuery}".</p>
                <button
                  onClick={() => { setSearchQuery(""); setSelectedCategory("todos"); }}
                  className="mt-2 text-xs text-amber-600 dark:text-amber-400 underline"
                >
                  Limpar filtros de busca
                </button>
              </div>
            )}
          </div>
        )}

        {/* 3. MODO: FESTAS DE GUARDA (PRECEITO DOMINICAL) */}
        {viewMode === "guarda" && (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <h3 className="font-display text-base sm:text-lg font-bold">
                  O Que São as Festas de Guarda (Dias de Preceito)?
                </h3>
              </div>
              <p className="text-xs sm:text-sm leading-relaxed">
                Segundo o Código de Direito Canônico (Cân. 1246-1248), além de todos os domingos do ano, os fiéis católicos têm a santa obrigação de participar da Santa Missa e abster-se de trabalhos servis nas grandes solenidades e festas de preceito da Igreja universal.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {holyDaysList.map((feast) => (
                <Link key={feast.slug} href={`/santoral/${feast.slug}`}>
                  <div className="p-5 rounded-2xl bg-white dark:bg-[oklch(0.16_0.04_260/0.7)] border-2 border-amber-500/40 hover:border-amber-500 shadow-sm hover:shadow-md transition-all group flex items-start gap-4 cursor-pointer">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-amber-100 dark:bg-amber-950/40 border border-amber-400/40 shrink-0 shadow-sm flex items-center justify-center">
                      <img
                        src={feast.image}
                        alt={feast.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/40">
                          🏆 {feast.day} de {MONTH_NAMES_PT[feast.month - 1]}
                        </span>
                      </div>

                      <h3 className="font-display text-base sm:text-lg font-bold text-foreground group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                        {feast.name}
                      </h3>

                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                        {feast.summary}
                      </p>

                      <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-amber-600 dark:text-amber-400">
                        <span>Ver Detalhes Litúrgicos</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
