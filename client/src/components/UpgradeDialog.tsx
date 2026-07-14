import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { Crown, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { getLoginUrl } from "@/const";

interface UpgradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  description?: string;
}

export function UpgradeDialog({ open, onOpenChange, description }: UpgradeDialogProps) {
  const { isAuthenticated, refresh } = useAuth();
  const [, navigate] = useLocation();
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "annual">("annual");
  const [subscribing, setSubscribing] = useState(false);

  const subscribeMutation = trpc.subscriptions.subscribe.useMutation();

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
        toast.success("Assinatura de teste ativada!");
        await refresh();
        onOpenChange(false);
        navigate("/premium/sucesso");
      }
    } catch (err: any) {
      toast.error(err?.message ?? "Erro ao iniciar pagamento.");
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-[#0b1329] text-slate-100 border-amber-500/20 rounded-3xl p-6 sm:p-8 max-h-[92vh] overflow-y-auto">
        <div className="absolute w-48 h-48 rounded-full bg-amber-500/5 blur-3xl -top-10 -left-10 pointer-events-none" />

        <DialogHeader className="text-center relative z-10 flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-3">
            <Crown size={22} className="text-amber-500" />
          </div>
          <DialogTitle className="font-display text-2xl font-black text-white">
            Acesso Premium
          </DialogTitle>
          <DialogDescription className="font-serif text-slate-300 text-sm mt-2 text-center">
            {description ?? "Aproveite recursos exclusivos para aprofundar sua vida espiritual."}
          </DialogDescription>
        </DialogHeader>

        {/* Plan Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-5 relative z-10">
          {/* Mensal */}
          <button
            onClick={() => setSelectedPlan("monthly")}
            className={`relative rounded-xl border p-4 text-left transition-all cursor-pointer ${
              selectedPlan === "monthly"
                ? "border-amber-500/60 bg-amber-500/10"
                : "border-white/10 bg-white/5 hover:border-white/20"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Mensal
              </span>
              {selectedPlan === "monthly" && (
                <div className="w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center">
                  <Check size={10} className="text-slate-950" />
                </div>
              )}
            </div>
            <div className="flex items-baseline gap-0.5">
              <span className="text-xl font-black text-white">R$&nbsp;14</span>
              <span className="text-sm font-black text-white">,90</span>
              <span className="text-slate-400 text-xs">/mês</span>
            </div>
            <p className="text-[9px] text-slate-500 mt-1">14 dias grátis</p>
          </button>

          {/* Anual */}
          <button
            onClick={() => setSelectedPlan("annual")}
            className={`relative rounded-xl border p-4 text-left transition-all cursor-pointer ${
              selectedPlan === "annual"
                ? "border-amber-500/60 bg-amber-500/10"
                : "border-white/10 bg-white/5 hover:border-white/20"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Anual
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/20">
                  -27%
                </span>
                {selectedPlan === "annual" && (
                  <div className="w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center">
                    <Check size={10} className="text-slate-950" />
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-baseline gap-0.5">
              <span className="text-xl font-black text-white">R$&nbsp;129</span>
              <span className="text-sm font-black text-white">,00</span>
              <span className="text-slate-400 text-xs">/ano</span>
            </div>
            <p className="text-[9px] text-slate-500 mt-1">Equivale a R$ 10,75/mês</p>
          </button>
        </div>

        {/* Checklist */}
        <div className="border-t border-b border-white/10 py-4 mb-5 space-y-2.5 text-xs text-slate-300 relative z-10">
          <div className="flex items-center gap-3">
            <span className="text-amber-400 font-bold">✓</span>
            <p>Músicas sacras selecionadas para oração e contemplação</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-amber-400 font-bold">✓</span>
            <p>Retiro completo "A Imitação de Cristo" e Novenas exclusivas</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-amber-400 font-bold">✓</span>
            <p>Áudios guiados do Rosário e Terço Mariano</p>
          </div>
        </div>

        {/* CTA */}
        <div className="space-y-3 relative z-10">
          <Button
            onClick={handleSubscribe}
            disabled={subscribing}
            className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm uppercase tracking-wider h-12 transition-all rounded-xl cursor-pointer"
          >
            {subscribing ? (
              <Loader2 size={16} className="animate-spin mr-2" />
            ) : (
              <Crown size={14} className="mr-2" />
            )}
            {isAuthenticated
              ? "Iniciar Teste Grátis de 14 Dias"
              : "Entrar e Testar Grátis"}
          </Button>
          <p className="text-[10px] text-center text-slate-400 mt-2">
            14 dias grátis, depois {selectedPlan === "annual" ? "R$ 129,00/ano" : "R$ 14,90/mês"}. Cancele quando quiser.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
