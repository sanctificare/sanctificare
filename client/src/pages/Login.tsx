import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Cross, Mail, Lock, User, Eye, EyeOff, ChevronLeft, ArrowLeft, CheckCircle2 } from "lucide-react";
import { getApiBaseUrl, sanitizeAppPath } from "@/const";

const LOGO_IMG = "/assets/sanctificare-logo-v2.webp";

async function performLogin(input: any) {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Erro ao realizar login.");
  }
  return res.json();
}

async function performRegister(input: any) {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Erro ao realizar cadastro.");
  }
  return res.json();
}

async function performForgotPassword(input: any) {
  const res = await fetch("/api/auth/forgot-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Erro ao enviar solicitação.");
  }
  return res.json();
}

export default function Login() {
  const { isAuthenticated, loading } = useAuth();
  const [_, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const getPostAuthPath = () => {
    const params = new URLSearchParams(window.location.search);
    return sanitizeAppPath(params.get("path"));
  };

  // Tab state: "entrar" | "cadastrar"
  const [activeTab, setActiveTab] = useState<string>("entrar");

  // View: "main" | "forgot" | "forgot-sent"
  const [view, setView] = useState<"main" | "forgot" | "forgot-sent">("main");

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Forgot password email
  const [forgotEmail, setForgotEmail] = useState("");

  const forgotMutation = useMutation({
    mutationFn: performForgotPassword,
    onSuccess: () => setView("forgot-sent"),
    onError: (err: any) => toast.error(err.message || "Erro ao enviar. Tente novamente."),
  });

  // Validation / Error states
  const [errors, setErrors] = useState<{ email?: string; password?: string; name?: string }>({});

  // Mutations
  const loginMutation = useMutation({
    mutationFn: performLogin,
    onSuccess: async () => {
      toast.success("Bem-vindo ao Sanctificare!");
      await queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      setLocation(getPostAuthPath());
    },
    onError: (err: any) => {
      toast.error(err.message || "Erro ao realizar login. Verifique suas credenciais.");
    },
  });

  const registerMutation = useMutation({
    mutationFn: performRegister,
    onSuccess: async () => {
      toast.success("Conta criada com sucesso! Bem-vindo.");
      await queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      setLocation(getPostAuthPath());
    },
    onError: (err: any) => {
      toast.error(err.message || "Erro ao realizar cadastro.");
    },
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && isAuthenticated) {
      setLocation(getPostAuthPath());
    }
  }, [isAuthenticated, loading, setLocation]);

  // Show error toast if redirecting back from OAuth fail
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const errorParam = params.get("error");
    if (errorParam) {
      toast.error(errorParam);
      // Clean up the URL by removing the error param
      params.delete("error");
      const newSearch = params.toString();
      const newUrl = `${window.location.pathname}${newSearch ? `?${newSearch}` : ""}`;
      window.history.replaceState(null, "", newUrl);
    }
  }, []);

  // Set active tab based on query params (e.g. ?tab=cadastrar)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get("tab");
    if (tabParam === "cadastrar" || tabParam === "cadastro" || tabParam === "register") {
      setActiveTab("cadastrar");
    }
  }, []);

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!email) {
      newErrors.email = "O e-mail é obrigatório.";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "E-mail inválido.";
    }

    if (!password) {
      newErrors.password = "A senha é obrigatória.";
    } else if (password.length < 6) {
      newErrors.password = "A senha deve ter pelo menos 6 caracteres.";
    }

    if (activeTab === "cadastrar" && !name) {
      newErrors.name = "O nome é obrigatório.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (activeTab === "entrar") {
      loginMutation.mutate({ email, password });
    } else {
      registerMutation.mutate({ name, email, password });
    }
  };

  const handleGoogleLogin = () => {
    const path = getPostAuthPath();
    window.location.href = `${getApiBaseUrl()}/api/oauth/login?path=${encodeURIComponent(path)}`;
  };

  // Simula envio do e-mail de recuperação via endpoint real
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail || !/\S+@\S+\.\S+/.test(forgotEmail)) {
      toast.error("Informe um e-mail válido.");
      return;
    }
    forgotMutation.mutate({ email: forgotEmail });
  };

  const isPending = loginMutation.isPending || registerMutation.isPending;

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

  return (
    <div className="min-h-screen bg-[oklch(0.12_0.03_260)] text-white flex flex-col justify-center items-center relative px-4 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-pattern-cross opacity-10 pointer-events-none" />
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[oklch(0.75_0.12_75/0.04)] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[oklch(0.28_0.08_260/0.15)] rounded-full blur-[120px] pointer-events-none" />

      {/* Back to Home Button */}
      <Link href="/" className="absolute top-6 left-6 inline-flex items-center gap-2 text-sm text-[oklch(0.75_0.02_260)] hover:text-white transition-colors duration-200">
        <ChevronLeft size={16} />
        Voltar ao início
      </Link>

      <div className="w-full max-w-md z-10">
        <div className="text-center mb-8">
          <Link href="/">
            <img
              src={LOGO_IMG}
              alt="Sanctificare Logo"
              className="w-20 h-20 rounded-full mx-auto mb-4 border border-[oklch(0.75_0.12_75/0.3)] shadow-lg hover:scale-105 transition-transform duration-300 cursor-pointer"
            />
          </Link>
          <h1 className="font-display text-3xl font-bold tracking-wide text-white mb-2">
            SANCTIFICARE
          </h1>
          <p className="font-serif text-[oklch(0.75_0.02_260)] text-sm italic">
            "Para maior glória de Deus e santificação das almas"
          </p>
        </div>

        <Card className="bg-[oklch(0.17_0.04_260)] border-[oklch(0.28_0.04_260)] text-white shadow-2xl backdrop-blur-md rounded-2xl overflow-hidden">

          {/* ── VIEW: ESQUECI A SENHA ── */}
          {view === "forgot" && (
            <>
              <CardHeader className="pb-2">
                <button
                  onClick={() => setView("main")}
                  className="inline-flex items-center gap-1.5 text-xs text-[oklch(0.65_0.02_260)] hover:text-white transition-colors mb-3"
                >
                  <ArrowLeft size={14} />
                  Voltar ao login
                </button>
                <CardTitle className="font-display text-xl font-medium tracking-wide">
                  Recuperar Senha
                </CardTitle>
                <CardDescription className="text-[oklch(0.65_0.02_260)] font-serif text-sm mt-1">
                  Informe seu e-mail cadastrado e enviaremos as instruções para redefinir sua senha.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="forgot-email" className="text-xs text-[oklch(0.75_0.02_260)] font-display tracking-wide uppercase">
                      E-mail cadastrado
                    </Label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-3 flex items-center text-[oklch(0.65_0.02_260)]">
                        <Mail size={16} />
                      </span>
                      <Input
                        id="forgot-email"
                        type="email"
                        placeholder="seu.email@exemplo.com"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        disabled={forgotMutation.isPending}
                        className="pl-10 bg-[oklch(0.22_0.04_260/0.4)] border-[oklch(0.28_0.04_260)] focus-visible:border-[oklch(0.75_0.12_75)] focus-visible:ring-[oklch(0.75_0.12_75/0.2)] text-white placeholder:text-[oklch(0.55_0.02_260)] rounded-lg"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={forgotMutation.isPending}
                    className="w-full mt-2 bg-[oklch(0.75_0.12_75)] hover:bg-[oklch(0.70_0.13_73)] text-[oklch(0.15_0.02_260)] font-bold tracking-wide uppercase py-3 rounded-lg flex justify-center items-center gap-2 transition-all duration-300 active:scale-[0.98]"
                  >
                    {forgotMutation.isPending ? (
                      <span className="w-5 h-5 border-2 border-[oklch(0.15_0.02_260)] border-t-transparent rounded-full animate-spin" />
                    ) : (
                      "Enviar Instruções"
                    )}
                  </Button>
                </form>
              </CardContent>
            </>
          )}

          {/* ── VIEW: E-MAIL ENVIADO ── */}
          {view === "forgot-sent" && (
            <>
              <CardHeader className="pb-2 text-center">
                <div className="mx-auto w-14 h-14 rounded-full bg-[oklch(0.75_0.12_75/0.1)] border border-[oklch(0.75_0.12_75/0.3)] flex items-center justify-center mb-4 mt-2">
                  <CheckCircle2 size={28} className="text-[oklch(0.75_0.12_75)]" />
                </div>
                <CardTitle className="font-display text-xl font-medium tracking-wide">
                  E-mail Enviado!
                </CardTitle>
                <CardDescription className="text-[oklch(0.65_0.02_260)] font-serif text-sm mt-1 leading-relaxed">
                  Se o endereço <span className="text-white font-semibold">{forgotEmail}</span> estiver cadastrado, você receberá um e-mail com as instruções para redefinir sua senha em breve.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 pb-6 flex flex-col gap-3">
                <Button
                  onClick={() => { setView("main"); setForgotEmail(""); }}
                  className="w-full bg-[oklch(0.75_0.12_75)] hover:bg-[oklch(0.70_0.13_73)] text-[oklch(0.15_0.02_260)] font-bold tracking-wide uppercase py-3 rounded-lg transition-all duration-300 active:scale-[0.98]"
                >
                  Voltar ao Login
                </Button>
              </CardContent>
            </>
          )}

          {/* ── VIEW: PRINCIPAL (LOGIN / CADASTRO) ── */}
          {view === "main" && (
            <>
              <CardHeader className="pb-2 text-center">
                <CardTitle className="font-display text-xl font-medium tracking-wide">
                  {activeTab === "entrar" ? "Iniciar Sessão" : "Criar Nova Conta"}
                </CardTitle>
                <CardDescription className="text-[oklch(0.65_0.02_260)] font-serif text-sm mt-1">
                  {activeTab === "entrar"
                    ? "Entre para acessar suas orações diárias, novenas e histórico."
                    : "Cadastre-se para iniciar seu diário espiritual e receber lembretes."}
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-4">
                <Button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="w-full bg-[oklch(0.22_0.04_260)] hover:bg-[oklch(0.28_0.04_260)] border border-[oklch(0.28_0.04_260)] text-white hover:text-white font-medium py-3 rounded-lg flex justify-center items-center gap-3 transition-all duration-300 active:scale-[0.98] cursor-pointer"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                  </svg>
                  Entrar com o Google
                </Button>

                <div className="relative my-6 flex items-center justify-center">
                  <hr className="w-full border-[oklch(0.28_0.04_260)]" />
                  <span className="absolute bg-[oklch(0.17_0.04_260)] px-3 text-xs text-[oklch(0.55_0.02_260)] font-serif uppercase tracking-wider">
                    ou continue com e-mail
                  </span>
                </div>

                <Tabs value={activeTab} onValueChange={(val) => {
                  setActiveTab(val);
                  setErrors({});
                }} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-[oklch(0.22_0.04_260)] border border-[oklch(0.28_0.04_260)] p-1 rounded-xl mb-6">
                    <TabsTrigger
                      value="entrar"
                      className="font-display text-xs tracking-wider uppercase text-[oklch(0.75_0.02_260)] data-[state=active]:text-[oklch(0.12_0.03_260)] data-[state=active]:bg-white hover:text-white transition-colors cursor-pointer"
                    >
                      Entrar
                    </TabsTrigger>
                    <TabsTrigger
                      value="cadastrar"
                      className="font-display text-xs tracking-wider uppercase text-[oklch(0.75_0.02_260)] data-[state=active]:text-[oklch(0.12_0.03_260)] data-[state=active]:bg-white hover:text-white transition-colors cursor-pointer"
                    >
                      Cadastro
                    </TabsTrigger>
                  </TabsList>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {activeTab === "cadastrar" && (
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-xs text-[oklch(0.75_0.02_260)] font-display tracking-wide uppercase">
                          Nome Completo
                        </Label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-3 flex items-center text-[oklch(0.65_0.02_260)]">
                            <User size={16} />
                          </span>
                          <Input
                            id="name"
                            type="text"
                            placeholder="Seu nome"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={isPending}
                            className="pl-10 bg-[oklch(0.22_0.04_260/0.4)] border-[oklch(0.28_0.04_260)] focus-visible:border-[oklch(0.75_0.12_75)] focus-visible:ring-[oklch(0.75_0.12_75/0.2)] text-white placeholder:text-[oklch(0.55_0.02_260)] rounded-lg"
                          />
                        </div>
                        {errors.name && <p className="text-xs text-red-400 mt-1 font-serif">{errors.name}</p>}
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-xs text-[oklch(0.75_0.02_260)] font-display tracking-wide uppercase">
                        E-mail
                      </Label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-3 flex items-center text-[oklch(0.65_0.02_260)]">
                          <Mail size={16} />
                        </span>
                        <Input
                          id="email"
                          type="email"
                          placeholder="seu.email@exemplo.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          disabled={isPending}
                          className="pl-10 bg-[oklch(0.22_0.04_260/0.4)] border-[oklch(0.28_0.04_260)] focus-visible:border-[oklch(0.75_0.12_75)] focus-visible:ring-[oklch(0.75_0.12_75/0.2)] text-white placeholder:text-[oklch(0.55_0.02_260)] rounded-lg"
                        />
                      </div>
                      {errors.email && <p className="text-xs text-red-400 mt-1 font-serif">{errors.email}</p>}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password" className="text-xs text-[oklch(0.75_0.02_260)] font-display tracking-wide uppercase">
                          Senha
                        </Label>
                        {activeTab === "entrar" && (
                          <button
                            type="button"
                            onClick={() => { setView("forgot"); setForgotEmail(email); }}
                            className="text-xs text-[oklch(0.75_0.12_75)] hover:text-[oklch(0.85_0.12_75)] transition-colors duration-200 underline underline-offset-2"
                          >
                            Esqueci minha senha
                          </button>
                        )}
                      </div>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-3 flex items-center text-[oklch(0.65_0.02_260)]">
                          <Lock size={16} />
                        </span>
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="******"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          disabled={isPending}
                          className="pl-10 pr-10 bg-[oklch(0.22_0.04_260/0.4)] border-[oklch(0.28_0.04_260)] focus-visible:border-[oklch(0.75_0.12_75)] focus-visible:ring-[oklch(0.75_0.12_75/0.2)] text-white placeholder:text-[oklch(0.55_0.02_260)] rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={isPending}
                          className="absolute inset-y-0 right-3 flex items-center text-[oklch(0.65_0.02_260)] hover:text-white transition-colors duration-200"
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      {errors.password && <p className="text-xs text-red-400 mt-1 font-serif">{errors.password}</p>}
                    </div>

                    <Button
                      type="submit"
                      disabled={isPending}
                      className="w-full mt-6 bg-[oklch(0.75_0.12_75)] hover:bg-[oklch(0.70_0.13_73)] text-[oklch(0.15_0.02_260)] font-bold tracking-wide uppercase py-3 rounded-lg flex justify-center items-center gap-2 transition-all duration-300 shadow-md shadow-[oklch(0.75_0.12_75/0.1)] active:scale-[0.98]"
                    >
                      {isPending ? (
                        <span className="w-5 h-5 border-2 border-[oklch(0.15_0.02_260)] border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Cross size={16} />
                          {activeTab === "entrar" ? "Entrar na Capela" : "Criar Minha Conta"}
                        </>
                      )}
                    </Button>
                  </form>
                </Tabs>
              </CardContent>
            </>
          )}
        </Card>

        {/* Footer info / bible quote */}
        <div className="text-center mt-8 text-[oklch(0.55_0.02_260)] font-serif text-xs px-6">
          <p className="italic">
            "Buscai em primeiro lugar o Reino de Deus e a sua justiça, e todas estas coisas vos serão dadas por acréscimo."
          </p>
          <span className="block mt-1 font-semibold text-[oklch(0.65_0.02_260)]">São Mateus 6:33</span>
        </div>
      </div>
    </div>
  );
}
