import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Link, useLocation } from "wouter";
import {
  Crown,
  Check,
  ArrowLeft,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";

const LOGO_IMG = "/assets/logo-sanctificare.webp";
const HERO_BG = "/assets/premium-hero-bg.jpg";

export default function Premium() {
  const { isAuthenticated, user, loading, refresh } = useAuth();
  const [, navigate] = useLocation();
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "annual">("annual");
  const [subscribing, setSubscribing] = useState(false);
  const [openingPortal, setOpeningPortal] = useState(false);

  const { data: subscription, isLoading: subLoading } =
    trpc.subscriptions.get.useQuery(undefined, { enabled: isAuthenticated });

  const subscribeMutation = trpc.subscriptions.subscribe.useMutation();
  const portalMutation = trpc.subscriptions.createPortalSession.useMutation();

  const isPremium =
    !!subscription &&
    (subscription.status === "active" ||
      subscription.status === "cancelled" ||
      subscription.status === "past_due");

  const handleSubscribe = async () => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }
    setSubscribing(true);
    try {
      const result = await subscribeMutation.mutateAsync({ plan: selectedPlan });
      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
      } else {
        // fallback dev: subscription created locally
        toast.success("Assinatura ativada com sucesso!");
        await refresh();
        navigate("/premium/sucesso");
      }
    } catch (err: any) {
      toast.error(err?.message ?? "Erro ao iniciar pagamento.");
    } finally {
      setSubscribing(false);
    }
  };

  const handleManage = async () => {
    setOpeningPortal(true);
    try {
      const { portalUrl } = await portalMutation.mutateAsync();
      window.location.href = portalUrl;
    } catch {
      toast.error("Não foi possível abrir o portal de gerenciamento.");
    } finally {
      setOpeningPortal(false);
    }
  };

  if (loading || subLoading) {
    return (
      <div className="min-h-screen bg-[oklch(0.08_0.04_260)] flex items-center justify-center">
        <Loader2 className="text-amber-500 animate-spin" size={36} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[oklch(0.08_0.04_260)] text-slate-100 font-sans">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden">
        {/* Background image */}
        <img
          src={HERO_BG}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[oklch(0.08_0.04_260/0.4)] via-[oklch(0.08_0.04_260/0.7)] to-[oklch(0.08_0.04_260)]" />

        {/* Nav */}
        <div className="relative z-10 flex items-center justify-between px-4 pt-5 max-w-5xl mx-auto">
          <Link href="/dashboard">
            <button className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors cursor-pointer">
              <ArrowLeft size={18} />
              <span className="text-sm">Voltar</span>
            </button>
          </Link>
          <img src={LOGO_IMG} alt="Sanctificare" className="w-8 h-8 rounded-full" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-6 pt-12 pb-20 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-amber-500/15 border border-amber-500/30 rounded-full px-4 py-1.5 mb-6">
            <Crown size={14} className="text-amber-400" />
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
              Sanctificare Premium
            </span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl font-black text-white leading-tight mb-4">
            Aprofunde sua
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200">
              vida espiritual
            </span>
          </h1>

          <p className="font-serif text-slate-300 text-lg leading-relaxed">
            Acesse o retiro completo de A Imitação de Cristo, todas as novenas,
            músicas sacras selecionadas e meditações guiadas exclusivas.
          </p>
        </div>
      </div>

      {/* ── Main Content ─────────────────────────────────────────────────── */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 pb-24 mt-6">

        {/* ── Premium Active State ─────────────────────────────────────── */}
        {isPremium && (
          <div className="mb-10 rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/50 to-emerald-900/20 p-6 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-3">
              <Crown size={24} className="text-emerald-400" />
            </div>
            <h2 className="font-display text-xl font-bold text-white mb-1">
              Você é Premium! 🎉
            </h2>
            <p className="text-slate-300 text-sm mb-1">
              Plano:{" "}
              <span className="font-semibold text-emerald-400 capitalize">
                {subscription?.plan === "annual" ? "Anual" : "Mensal"}
              </span>
            </p>
            <p className="text-slate-400 text-xs mb-5">
              Válido até:{" "}
              {subscription?.expiresAt
                ? new Date(subscription.expiresAt).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })
                : "—"}
            </p>
            <Button
              onClick={handleManage}
              disabled={openingPortal}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl h-10 text-sm cursor-pointer"
            >
              {openingPortal ? (
                <Loader2 size={14} className="animate-spin mr-2" />
              ) : (
                <ExternalLink size={14} className="mr-2" />
              )}
              Gerenciar assinatura
            </Button>
          </div>
        )}

        {/* ── Plan Cards ───────────────────────────────────────────────── */}
        {!isPremium && (
          <div className="mb-10">
            <h2 className="font-display text-2xl font-bold text-white text-center mb-2">
              Escolha seu plano
            </h2>
            <p className="text-slate-400 text-sm text-center mb-8">
              Cancele a qualquer momento
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Mensal */}
              <button
                onClick={() => setSelectedPlan("monthly")}
                className={`relative rounded-2xl border p-6 text-left transition-all cursor-pointer ${
                  selectedPlan === "monthly"
                    ? "border-amber-500/60 bg-amber-500/10 shadow-[0_0_30px_oklch(0.75_0.18_75/0.15)]"
                    : "border-white/10 bg-white/5 hover:border-white/20"
                }`}
              >
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
                  Mensal
                </p>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-3xl font-black text-white">R$&nbsp;14</span>
                  <span className="text-xl font-black text-white">,90</span>
                  <span className="text-slate-400 text-sm">/mês</span>
                </div>
                <p className="text-slate-400 text-xs">Cobrado mensalmente</p>
                {selectedPlan === "monthly" && (
                  <div className="absolute top-4 right-4 w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center">
                    <Check size={11} className="text-slate-950" />
                  </div>
                )}
              </button>

              {/* Anual */}
              <button
                onClick={() => setSelectedPlan("annual")}
                className={`relative rounded-2xl border p-6 text-left transition-all cursor-pointer ${
                  selectedPlan === "annual"
                    ? "border-amber-500/60 bg-amber-500/10 shadow-[0_0_30px_oklch(0.75_0.18_75/0.15)]"
                    : "border-white/10 bg-white/5 hover:border-white/20"
                }`}
              >
                <div className="absolute top-4 right-4 flex items-center gap-1">
                  {selectedPlan === "annual" && (
                    <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center">
                      <Check size={11} className="text-slate-950" />
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    Anual
                  </p>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    Economize 27%
                  </span>
                </div>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-3xl font-black text-white">R$&nbsp;129</span>
                  <span className="text-xl font-black text-white">,00</span>
                  <span className="text-slate-400 text-sm">/ano</span>
                </div>
                <p className="text-slate-400 text-xs">
                  Equivale a R$&nbsp;10,75/mês
                </p>
              </button>
            </div>

            {/* CTA */}
            <div className="mt-6">
              <Button
                onClick={handleSubscribe}
                disabled={subscribing}
                className="w-full h-14 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-600 hover:to-amber-500 text-slate-950 font-black text-base tracking-wide shadow-[0_0_40px_oklch(0.75_0.18_75/0.35)] transition-all cursor-pointer"
              >
                {subscribing ? (
                  <Loader2 size={20} className="animate-spin mr-2" />
                ) : (
                  <Crown size={18} className="mr-2" />
                )}
                {isAuthenticated
                  ? "Iniciar Teste Grátis de 14 Dias"
                  : "Entrar para Iniciar Teste Grátis"}
              </Button>
              <p className="text-center text-xs text-slate-500 mt-3">
                14 dias grátis, depois {selectedPlan === "annual" ? "R$ 129,00/ano" : "R$ 14,90/mês"}. Pagamento seguro via{" "}
                <span className="text-slate-400 font-semibold">Stripe</span>.
                Cancele a qualquer momento sem cobranças.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
