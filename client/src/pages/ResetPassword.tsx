import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock, Eye, EyeOff, ChevronLeft, CheckCircle2, XCircle, Loader2 } from "lucide-react";

const LOGO_IMG = "/assets/sanctificare-logo.webp";

async function fetchValidateToken({ queryKey }: any) {
  const [_, token] = queryKey;
  const res = await fetch(`/api/auth/validate-reset-token?token=${encodeURIComponent(token)}`);
  if (!res.ok) {
    throw new Error("Failed to validate token");
  }
  return res.json();
}

async function performResetPassword(input: any) {
  const res = await fetch("/api/auth/reset-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Erro ao redefinir senha.");
  }
  return res.json();
}

export default function ResetPassword() {
  const [, setLocation] = useLocation();

  // Lê o token da URL
  const token = new URLSearchParams(window.location.search).get("token") ?? "";

  // Estados
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({});

  // Valida o token ao montar a página
  const tokenQuery = useQuery({
    queryKey: ["auth", "validateToken", token],
    queryFn: fetchValidateToken,
    enabled: !!token,
    retry: false,
  });

  const resetMutation = useMutation({
    mutationFn: performResetPassword,
    onSuccess: () => {
      toast.success("Senha redefinida com sucesso! Faça login com sua nova senha.");
      setTimeout(() => setLocation("/login"), 2000);
    },
    onError: (err: any) => {
      toast.error(err.message || "Erro ao redefinir a senha. Tente novamente.");
    },
  });

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!password || password.length < 6) {
      newErrors.password = "A senha deve ter pelo menos 6 caracteres.";
    }
    if (password !== confirm) {
      newErrors.confirm = "As senhas não coincidem.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    resetMutation.mutate({ token, password });
  };

  // ── Sem token na URL ──
  if (!token) {
    return (
      <ErrorScreen
        title="Link inválido"
        message="Este link de recuperação não é válido. Solicite um novo através da tela de login."
      />
    );
  }

  // ── Carregando validação ──
  if (tokenQuery.isLoading) {
    return (
      <PageShell>
        <div className="flex flex-col items-center gap-4 py-10">
          <Loader2 size={32} className="text-[oklch(0.75_0.12_75)] animate-spin" />
          <p className="font-serif text-[oklch(0.75_0.02_260)] text-sm">Verificando o link...</p>
        </div>
      </PageShell>
    );
  }

  // ── Token inválido ou expirado ──
  if (!tokenQuery.data?.valid) {
    return (
      <ErrorScreen
        title="Link expirado ou inválido"
        message="Este link de recuperação expirou ou já foi utilizado. Solicite um novo através da tela de login."
      />
    );
  }

  // ── Senha redefinida com sucesso ──
  if (resetMutation.isSuccess) {
    return (
      <PageShell>
        <div className="flex flex-col items-center gap-4 py-8 text-center">
          <div className="w-16 h-16 rounded-full bg-[oklch(0.75_0.12_75/0.1)] border border-[oklch(0.75_0.12_75/0.3)] flex items-center justify-center">
            <CheckCircle2 size={32} className="text-[oklch(0.75_0.12_75)]" />
          </div>
          <h2 className="font-display text-xl font-bold tracking-wide text-white">Senha Redefinida!</h2>
          <p className="font-serif text-[oklch(0.80_0.02_260)] text-sm leading-relaxed">
            Sua senha foi atualizada com sucesso. Redirecionando para o login...
          </p>
          <Link href="/login" className="text-xs text-[oklch(0.75_0.12_75)] hover:underline">
            Ir para o login agora
          </Link>
        </div>
      </PageShell>
    );
  }

  // ── Formulário principal ──
  return (
    <PageShell>
      <CardHeader className="pb-2 text-center">
        <CardTitle className="font-display text-xl font-medium tracking-wide">
          Nova Senha
        </CardTitle>
        <CardDescription className="text-[oklch(0.65_0.02_260)] font-serif text-sm mt-1">
          Escolha uma nova senha segura para a sua conta.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-4">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Nova senha */}
          <div className="space-y-2">
            <Label htmlFor="new-password" className="text-xs text-[oklch(0.75_0.02_260)] font-display tracking-wide uppercase">
              Nova Senha
            </Label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-[oklch(0.65_0.02_260)]">
                <Lock size={16} />
              </span>
              <Input
                id="new-password"
                type={showPassword ? "text" : "password"}
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={resetMutation.isPending}
                className="pl-10 pr-10 bg-[oklch(0.22_0.04_260/0.4)] border-[oklch(0.28_0.04_260)] focus-visible:border-[oklch(0.75_0.12_75)] focus-visible:ring-[oklch(0.75_0.12_75/0.2)] text-white placeholder:text-[oklch(0.55_0.02_260)] rounded-lg"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-[oklch(0.65_0.02_260)] hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-400 font-serif">{errors.password}</p>}
          </div>

          {/* Confirmar senha */}
          <div className="space-y-2">
            <Label htmlFor="confirm-password" className="text-xs text-[oklch(0.75_0.02_260)] font-display tracking-wide uppercase">
              Confirmar Senha
            </Label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-[oklch(0.65_0.02_260)]">
                <Lock size={16} />
              </span>
              <Input
                id="confirm-password"
                type={showConfirm ? "text" : "password"}
                placeholder="Repita a nova senha"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                disabled={resetMutation.isPending}
                className="pl-10 pr-10 bg-[oklch(0.22_0.04_260/0.4)] border-[oklch(0.28_0.04_260)] focus-visible:border-[oklch(0.75_0.12_75)] focus-visible:ring-[oklch(0.75_0.12_75/0.2)] text-white placeholder:text-[oklch(0.55_0.02_260)] rounded-lg"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute inset-y-0 right-3 flex items-center text-[oklch(0.65_0.02_260)] hover:text-white transition-colors"
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.confirm && <p className="text-xs text-red-400 font-serif">{errors.confirm}</p>}
          </div>

          <Button
            type="submit"
            disabled={resetMutation.isPending}
            className="w-full mt-2 bg-[oklch(0.75_0.12_75)] hover:bg-[oklch(0.70_0.13_73)] text-[oklch(0.15_0.02_260)] font-bold tracking-wide uppercase py-3 rounded-lg flex justify-center items-center gap-2 transition-all active:scale-[0.98]"
          >
            {resetMutation.isPending ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              "Salvar Nova Senha"
            )}
          </Button>
        </form>
      </CardContent>
    </PageShell>
  );
}

// ─── Sub-componentes ─────────────────────────────────────────────────────────

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[oklch(0.12_0.03_260)] text-white flex flex-col justify-center items-center relative px-4 overflow-hidden">
      <div className="absolute inset-0 bg-pattern-cross opacity-10 pointer-events-none" />
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[oklch(0.75_0.12_75/0.04)] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[oklch(0.28_0.08_260/0.15)] rounded-full blur-[120px] pointer-events-none" />

      <Link href="/login" className="absolute top-6 left-6 inline-flex items-center gap-2 text-sm text-[oklch(0.75_0.02_260)] hover:text-white transition-colors">
        <ChevronLeft size={16} />
        Voltar ao login
      </Link>

      <div className="w-full max-w-md z-10">
        <div className="text-center mb-8">
          <Link href="/">
            <img
              src={LOGO_IMG}
              alt="Sanctificare Logo"
              className="w-20 h-20 rounded-full mx-auto mb-4 border border-[oklch(0.75_0.12_75/0.3)] shadow-lg hover:scale-105 transition-transform cursor-pointer"
            />
          </Link>
          <h1 className="font-display text-3xl font-bold tracking-wide text-white mb-2">SANCTIFICARE</h1>
          <p className="font-serif text-[oklch(0.75_0.02_260)] text-sm italic">
            "Para maior glória de Deus e santificação das almas"
          </p>
        </div>

        <Card className="bg-[oklch(0.17_0.04_260)] border-[oklch(0.28_0.04_260)] text-white shadow-2xl backdrop-blur-md rounded-2xl overflow-hidden">
          {children}
        </Card>
      </div>
    </div>
  );
}

function ErrorScreen({ title, message }: { title: string; message: string }) {
  return (
    <PageShell>
      <div className="flex flex-col items-center gap-4 py-8 px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
          <XCircle size={32} className="text-red-400" />
        </div>
        <h2 className="font-display text-xl font-bold tracking-wide text-white">{title}</h2>
        <p className="font-serif text-[oklch(0.80_0.02_260)] text-sm leading-relaxed">{message}</p>
        <Link
          href="/login"
          className="mt-2 inline-block bg-[oklch(0.75_0.12_75)] hover:bg-[oklch(0.70_0.13_73)] text-[oklch(0.15_0.02_260)] font-bold text-sm px-6 py-3 rounded-xl transition-all"
        >
          Ir para o Login
        </Link>
      </div>
    </PageShell>
  );
}
