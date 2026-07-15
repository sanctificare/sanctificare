import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { trpc } from "../lib/trpc";
import { 
  Users, 
  Sparkles, 
  Flame, 
  Activity, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  Mail, 
  Shield, 
  Award, 
  Clock,
  LogOut,
  LayoutDashboard
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from "recharts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "logs">("overview");
  
  // User search & pagination states
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const usersPerPage = 12;

  // Selected user details dialog state
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const trpcContext = trpc.useUtils();

  // ── Queries ──
  const statsQuery = trpc.admin.getStats.useQuery(undefined, {
    refetchInterval: 60000,
  });

  const growthQuery = trpc.admin.getRegistrationGrowth.useQuery(undefined, {
    refetchInterval: 300000,
  });

  const usersQuery = trpc.admin.getUsersList.useQuery(
    { search, limit: usersPerPage, offset: page * usersPerPage },
    { placeholderData: (prev) => prev }
  );

  const userDetailQuery = trpc.admin.getUserDetail.useQuery(
    { userId: selectedUserId ?? 0 },
    { enabled: selectedUserId !== null }
  );

  // ── Mutations ──
  const togglePremiumMutation = trpc.admin.togglePremium.useMutation({
    onSuccess: (data, variables) => {
      toast.success(
        variables.grant 
          ? "Assinatura Premium concedida com sucesso!" 
          : "Assinatura Premium revogada."
      );
      // Invalidate stats and user lists/details
      trpcContext.admin.getStats.invalidate();
      trpcContext.admin.getUsersList.invalidate();
      if (selectedUserId) {
        trpcContext.admin.getUserDetail.invalidate({ userId: selectedUserId });
      }
    },
    onError: (err) => {
      toast.error(err.message || "Erro ao alterar assinatura.");
    }
  });

  // Calculate totals and format chart data
  const chartData = growthQuery.data?.map(item => {
    try {
      const dateParsed = new Date(item.date);
      // Adjust timezone offset to get correct date representation
      const userTimezoneOffset = dateParsed.getTimezoneOffset() * 60000;
      const localDate = new Date(dateParsed.getTime() + userTimezoneOffset);
      return {
        date: format(localDate, "dd MMM", { locale: ptBR }),
        "Novos Cadastros": item.count
      };
    } catch {
      return { date: item.date, "Novos Cadastros": item.count };
    }
  }) || [];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(0); // Reset to first page
  };

  const handleTogglePremium = (userId: number, isCurrentlyPremium: boolean) => {
    togglePremiumMutation.mutate({ userId, grant: !isCurrentlyPremium });
  };

  // Loading indicator for page
  const isLoading = statsQuery.isLoading || growthQuery.isLoading;

  return (
    <div className="flex min-h-screen bg-[#0B0D13] text-slate-100 font-sans">
      {/* ── Sidebar Navigation ── */}
      <aside className="hidden md:flex flex-col w-64 bg-[#0F121C] border-r border-amber-500/10">
        <div className="p-6 border-b border-amber-500/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-amber-500/40 flex items-center justify-center bg-amber-500/10 shadow-lg shadow-amber-500/20">
            <span className="text-amber-500 font-serif font-bold text-lg">✝</span>
          </div>
          <div>
            <h1 className="text-base font-serif font-bold tracking-wide text-amber-500">Sanctificare</h1>
            <p className="text-[10px] text-amber-500/60 uppercase tracking-widest font-sans font-semibold">Painel Administrativo</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          <button
            onClick={() => setActiveTab("overview")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
              activeTab === "overview"
                ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent"
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Visão Geral
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
              activeTab === "users"
                ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent"
            }`}
          >
            <Users className="w-4 h-4" />
            Gestão de Usuários
          </button>
          <button
            onClick={() => setLocation("/")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-950/20 border border-transparent transition-all duration-300"
          >
            <LogOut className="w-4 h-4" />
            Voltar para o App
          </button>
        </nav>

        <div className="p-4 border-t border-amber-500/10 text-center text-xs text-slate-500">
          Versão 1.0.0
        </div>
      </aside>

      {/* ── Main Content Area ── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Header mobile/tablet */}
        <header className="md:hidden flex items-center justify-between px-6 py-4 bg-[#0F121C] border-b border-amber-500/10">
          <div className="flex items-center gap-2">
            <span className="text-amber-500 font-serif font-bold text-xl">✝</span>
            <span className="font-serif font-semibold text-amber-500">Sanctificare Admin</span>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={activeTab === "overview" ? "default" : "outline"}
              onClick={() => setActiveTab("overview")}
              className={activeTab === "overview" ? "bg-amber-500 text-slate-900 hover:bg-amber-600" : "border-amber-500/30 text-amber-500"}
            >
              Geral
            </Button>
            <Button
              size="sm"
              variant={activeTab === "users" ? "default" : "outline"}
              onClick={() => setActiveTab("users")}
              className={activeTab === "users" ? "bg-amber-500 text-slate-900 hover:bg-amber-600" : "border-amber-500/30 text-amber-500"}
            >
              Usuários
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setLocation("/")} className="text-slate-400">
              Sair
            </Button>
          </div>
        </header>

        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-amber-500/20 border-t-amber-500 animate-spin" />
            <span className="text-sm text-slate-400 animate-pulse font-medium">Carregando painel de administração...</span>
          </div>
        ) : (
          <div className="flex-1 p-6 md:p-8 space-y-8 max-w-7xl w-full mx-auto">
            {/* ── Welcome Heading ── */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-amber-500">Salve Maria, Administrador</h2>
                <p className="text-sm text-slate-400 mt-1">Acompanhe aqui o crescimento das almas e o uso das ferramentas de oração.</p>
              </div>
              <div className="text-xs bg-amber-500/10 border border-amber-500/30 text-amber-400 px-4 py-2 rounded-full self-start md:self-auto flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                Sincronizado com a base de dados
              </div>
            </div>

            {/* ── Active Tab Content ── */}
            {activeTab === "overview" && (
              <>
                {/* ── STATS CARDS ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  <Card className="bg-[#121622] border-amber-500/10 shadow-lg hover:border-amber-500/20 transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                      <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total de Fiéis</CardTitle>
                      <Users className="w-4 h-4 text-amber-500/80" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold font-serif text-slate-100">{statsQuery.data?.totalUsers}</div>
                      <p className="text-[10px] text-slate-500 mt-1">Usuários cadastrados</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-[#121622] border-amber-500/10 shadow-lg hover:border-amber-500/20 transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                      <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Novos Hoje</CardTitle>
                      <Sparkles className="w-4 h-4 text-emerald-500/80" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold font-serif text-emerald-400">+{statsQuery.data?.newUsersToday}</div>
                      <p className="text-[10px] text-slate-500 mt-1">Registrados nas últimas 24h</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-[#121622] border-amber-500/10 shadow-lg hover:border-amber-500/20 transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                      <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Ativos Hoje</CardTitle>
                      <Flame className="w-4 h-4 text-orange-500/80" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold font-serif text-orange-400">{statsQuery.data?.activeUsersToday}</div>
                      <p className="text-[10px] text-slate-500 mt-1">Acessaram o app hoje</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-[#121622] border-amber-500/10 shadow-lg hover:border-amber-500/20 transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                      <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Assinantes Premium</CardTitle>
                      <Award className="w-4 h-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold font-serif text-amber-400">{statsQuery.data?.activeSubscriptions}</div>
                      <p className="text-[10px] text-slate-500 mt-1">Assinaturas Stripe ativas</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-[#121622] border-amber-500/10 shadow-lg hover:border-amber-500/20 transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                      <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Orações Concluídas</CardTitle>
                      <Activity className="w-4 h-4 text-sky-500/80" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold font-serif text-sky-400">{statsQuery.data?.totalPrayers}</div>
                      <p className="text-[10px] text-slate-500 mt-1">Terços, novenas e orações</p>
                    </CardContent>
                  </Card>
                </div>

                {/* ── CHART SECTION ── */}
                <Card className="bg-[#121622] border-amber-500/10 shadow-xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-serif font-bold text-amber-500">Crescimento de Cadastros</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Estatísticas diárias de novos usuários nos últimos 30 dias</p>
                    </div>
                  </div>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorCadastros" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#d97706" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#d97706" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                        <XAxis 
                          dataKey="date" 
                          stroke="#6b7280" 
                          fontSize={11}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis 
                          stroke="#6b7280" 
                          fontSize={11}
                          tickLine={false}
                          axisLine={false}
                          allowDecimals={false}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: "#1c1f2e", 
                            borderColor: "rgba(245, 158, 11, 0.2)",
                            borderRadius: "8px",
                            color: "#fff"
                          }} 
                        />
                        <Area 
                          type="monotone" 
                          dataKey="Novos Cadastros" 
                          stroke="#f59e0b" 
                          strokeWidth={2}
                          fillOpacity={1} 
                          fill="url(#colorCadastros)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                {/* ── TWO COLUMN RECENT LOGS ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Recent Signups */}
                  <Card className="bg-[#121622] border-amber-500/10 shadow-lg">
                    <CardHeader className="border-b border-slate-800 pb-4">
                      <CardTitle className="text-base font-serif font-bold text-amber-500">Novos Cadastros Recentes</CardTitle>
                      <CardDescription className="text-xs text-slate-400">Últimos 10 fiéis que se juntaram ao Sanctificare</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="divide-y divide-slate-800/80">
                        {statsQuery.data?.recentUsers.map((user) => (
                          <div key={user.id} className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-800/20 transition-colors">
                            <div>
                              <p className="text-sm font-semibold text-slate-200">{user.name || "Sem Nome"}</p>
                              <p className="text-xs text-slate-500 font-mono mt-0.5">{user.email || "Sem e-mail"}</p>
                            </div>
                            <div className="text-xs text-slate-400 flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-slate-500" />
                              {new Date(user.createdAt).toLocaleDateString("pt-BR", { day: "numeric", month: "short" })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recent Community Activity */}
                  <Card className="bg-[#121622] border-amber-500/10 shadow-lg">
                    <CardHeader className="border-b border-slate-800 pb-4">
                      <CardTitle className="text-base font-serif font-bold text-amber-500">Atividades de Oração Recentes</CardTitle>
                      <CardDescription className="text-xs text-slate-400">Últimos terços, liturgias e novenas concluídas</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="divide-y divide-slate-800/80">
                        {statsQuery.data?.recentActivities.map((log) => (
                          <div key={log.id} className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-800/20 transition-colors">
                            <div className="flex-1 min-w-0 pr-4">
                              <p className="text-sm font-semibold text-slate-200 truncate">{log.prayerName}</p>
                              <p className="text-xs text-slate-500 truncate mt-0.5">
                                por <span className="text-slate-400 font-medium">{log.userName || "Fiel Anônimo"}</span> ({log.userEmail || "Sem e-mail"})
                              </p>
                            </div>
                            <div className="flex flex-col items-end shrink-0 gap-1">
                              <Badge variant="outline" className="border-amber-500/20 text-amber-400 bg-amber-500/5 text-[10px] scale-90">
                                {log.prayerType}
                              </Badge>
                              <div className="text-[10px] text-slate-500 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(log.completedAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}

            {activeTab === "users" && (
              <Card className="bg-[#121622] border-amber-500/10 shadow-xl">
                <CardHeader className="border-b border-slate-800 pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle className="text-xl font-serif font-bold text-amber-500">Lista Geral de Fiéis</CardTitle>
                    <CardDescription className="text-xs text-slate-400">Pesquise, visualize perfis detalhados e controle privilégios Premium.</CardDescription>
                  </div>
                  {/* Search Bar */}
                  <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                    <Input
                      placeholder="Pesquisar por nome ou e-mail..."
                      value={search}
                      onChange={handleSearchChange}
                      className="pl-9 bg-[#1c2132] border-amber-500/15 focus-visible:ring-amber-500 text-slate-200"
                    />
                  </div>
                </CardHeader>

                <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-slate-800/30">
                      <TableRow className="border-b border-slate-800">
                        <TableHead className="text-slate-400 font-semibold w-[60px]">ID</TableHead>
                        <TableHead className="text-slate-400 font-semibold">Nome</TableHead>
                        <TableHead className="text-slate-400 font-semibold">E-mail</TableHead>
                        <TableHead className="text-slate-400 font-semibold">Método de Login</TableHead>
                        <TableHead className="text-slate-400 font-semibold">Tipo de Conta</TableHead>
                        <TableHead className="text-slate-400 font-semibold">Último Acesso</TableHead>
                        <TableHead className="text-slate-400 font-semibold text-right">Ação</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {usersQuery.data?.users.map((user) => (
                        <TableRow key={user.id} className="border-b border-slate-800/60 hover:bg-slate-800/10">
                          <TableCell className="font-mono text-slate-500 text-xs">{user.id}</TableCell>
                          <TableCell className="font-semibold text-slate-200">{user.name || "Sem Nome"}</TableCell>
                          <TableCell className="text-slate-300 font-mono text-xs">{user.email || "Sem e-mail"}</TableCell>
                          <TableCell className="text-slate-400 capitalize text-xs">{user.loginMethod || "Não definido"}</TableCell>
                          <TableCell>
                            <Badge className={
                              user.role === "admin" 
                                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" 
                                : "bg-slate-800 text-slate-400"
                            }>
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-slate-400 text-xs">
                            {new Date(user.lastSignedIn).toLocaleDateString("pt-BR")} às{" "}
                            {new Date(user.lastSignedIn).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => setSelectedUserId(user.id)}
                              className="border-amber-500/20 text-amber-500 hover:bg-amber-500/10 text-xs px-3"
                            >
                              Ver Detalhes
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {usersQuery.data?.users.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} className="h-32 text-center text-slate-500">
                            Nenhum fiel encontrado com o termo informado.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>

                {/* Pagination Controls */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800">
                  <span className="text-xs text-slate-500">
                    Total de <b>{usersQuery.data?.total || 0}</b> fiéis
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={page === 0}
                      onClick={() => setPage(p => Math.max(0, p - 1))}
                      className="border-slate-800 hover:bg-slate-800 text-slate-400"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" /> Anterior
                    </Button>
                    <span className="text-xs text-slate-400 px-2">
                      Página <b>{page + 1}</b> de <b>{Math.ceil((usersQuery.data?.total || 1) / usersPerPage)}</b>
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={page >= Math.ceil((usersQuery.data?.total || 1) / usersPerPage) - 1}
                      onClick={() => setPage(p => p + 1)}
                      className="border-slate-800 hover:bg-slate-800 text-slate-400"
                    >
                      Próxima <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}
      </main>

      {/* ── User Detail Dialog/Modal ── */}
      <Dialog open={selectedUserId !== null} onOpenChange={(open) => { if (!open) setSelectedUserId(null); }}>
        <DialogContent className="bg-[#121622] border-amber-500/20 text-slate-100 max-w-2xl">
          {userDetailQuery.isLoading ? (
            <div className="h-60 flex flex-col items-center justify-center gap-2">
              <div className="w-8 h-8 rounded-full border-2 border-amber-500/20 border-t-amber-500 animate-spin" />
              <span className="text-xs text-slate-400">Carregando detalhes do fiel...</span>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="font-serif text-xl text-amber-500 flex items-center gap-2">
                  <span>✝ Ficha de Acompanhamento</span>
                  <Badge variant="outline" className="border-amber-500/20 text-amber-400 ml-2">
                    ID {userDetailQuery.data?.user.id}
                  </Badge>
                </DialogTitle>
                <DialogDescription className="text-slate-400 text-xs">
                  Acompanhe o engajamento espiritual e controle as permissões.
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-4">
                {/* General Info */}
                <div className="space-y-3.5 bg-slate-900/40 p-4 rounded-xl border border-slate-800">
                  <h4 className="text-sm font-semibold text-slate-300 border-b border-slate-800 pb-1.5 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-amber-500/80" /> Dados Pessoais
                  </h4>
                  <div className="space-y-2.5 text-xs text-slate-400">
                    <div className="flex justify-between">
                      <span>Nome:</span>
                      <strong className="text-slate-200">{userDetailQuery.data?.user.name || "Sem Nome"}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>E-mail:</span>
                      <strong className="text-slate-200 font-mono">{userDetailQuery.data?.user.email || "Sem e-mail"}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Autenticação:</span>
                      <strong className="text-slate-200 capitalize">{userDetailQuery.data?.user.loginMethod}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Função:</span>
                      <strong className="text-slate-200 capitalize">{userDetailQuery.data?.user.role}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Registrado em:</span>
                      <strong className="text-slate-200">
                        {userDetailQuery.data?.user.createdAt && new Date(userDetailQuery.data.user.createdAt).toLocaleDateString("pt-BR")}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Plan Info */}
                <div className="space-y-3.5 bg-slate-900/40 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
                  <div className="space-y-3.5">
                    <h4 className="text-sm font-semibold text-slate-300 border-b border-slate-800 pb-1.5 flex items-center gap-2">
                      <Award className="w-4 h-4 text-amber-500" /> Assinatura / Plano
                    </h4>
                    <div className="text-xs text-slate-400 space-y-2">
                      <div className="flex justify-between items-center">
                        <span>Status Premium:</span>
                        {userDetailQuery.data?.subscription?.status === "active" && 
                        new Date(userDetailQuery.data.subscription.expiresAt) > new Date() ? (
                          <Badge className="bg-amber-500/20 text-amber-400 border border-amber-500/30">ATIVO (Premium)</Badge>
                        ) : (
                          <Badge className="bg-slate-800 text-slate-500">Padrão (Gratuito)</Badge>
                        )}
                      </div>
                      {userDetailQuery.data?.subscription && (
                        <>
                          <div className="flex justify-between">
                            <span>Plano:</span>
                            <strong className="text-slate-200 capitalize">{userDetailQuery.data.subscription.plan}</strong>
                          </div>
                          <div className="flex justify-between">
                            <span>Expira em:</span>
                            <strong className="text-slate-200">
                              {new Date(userDetailQuery.data.subscription.expiresAt).toLocaleDateString("pt-BR")}
                            </strong>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant={userDetailQuery.data?.subscription?.status === "active" ? "destructive" : "default"}
                    onClick={() => {
                      if (userDetailQuery.data) {
                        const isPremium = userDetailQuery.data.subscription?.status === "active";
                        handleTogglePremium(userDetailQuery.data.user.id, isPremium);
                      }
                    }}
                    disabled={togglePremiumMutation.isPending}
                    className={`mt-4 w-full text-xs font-semibold ${
                      userDetailQuery.data?.subscription?.status === "active"
                        ? "bg-red-500/10 text-red-500 border border-red-500/30 hover:bg-red-500/20 hover:text-red-400"
                        : "bg-amber-500 text-slate-900 hover:bg-amber-600 font-bold"
                    }`}
                  >
                    {togglePremiumMutation.isPending ? "Alterando..." : (
                      userDetailQuery.data?.subscription?.status === "active"
                        ? "Revogar Acesso Premium" 
                        : "Conceder Acesso Premium"
                    )}
                  </Button>
                </div>
              </div>

              {/* Recent User Logs */}
              <div className="space-y-3 mt-6">
                <h4 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-sky-500" /> Histórico Recente de Orações
                </h4>
                <div className="max-h-[160px] overflow-y-auto border border-slate-800 rounded-lg divide-y divide-slate-800/70 bg-slate-900/20">
                  {userDetailQuery.data?.recentLogs.map((log) => (
                    <div key={log.id} className="flex justify-between items-center p-3 text-xs">
                      <div>
                        <span className="font-semibold text-slate-200">{log.prayerName}</span>
                        <span className="text-[10px] text-slate-500 block capitalize mt-0.5">{log.prayerType}</span>
                      </div>
                      <span className="text-slate-500 font-mono text-[10px]">
                        {new Date(log.completedAt).toLocaleDateString("pt-BR")} às{" "}
                        {new Date(log.completedAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  ))}
                  {userDetailQuery.data?.recentLogs.length === 0 && (
                    <div className="p-4 text-center text-xs text-slate-500">
                      Nenhuma oração concluída registrada para este fiel.
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter className="mt-6 border-t border-slate-800 pt-4">
                <Button variant="outline" onClick={() => setSelectedUserId(null)} className="border-slate-800 text-slate-300 hover:bg-slate-800">
                  Fechar Ficha
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
