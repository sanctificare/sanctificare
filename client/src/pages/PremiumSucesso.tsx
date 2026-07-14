import { useEffect } from "react";
import { Link } from "wouter";
import { Crown, CheckCircle, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

const LOGO_IMG = "/assets/sanctificare-logo-v2.webp";

export default function PremiumSucesso() {
  const { refresh } = useAuth();
  const utils = trpc.useUtils();

  // Ao chegar nesta página, invalida o cache da assinatura para forçar refetch
  useEffect(() => {
    const revalidate = async () => {
      await refresh();
      await utils.subscriptions.get.invalidate();
    };
    void revalidate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-[oklch(0.08_0.04_260)] flex items-center justify-center px-4">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute w-[500px] h-[500px] rounded-full bg-amber-500/5 blur-3xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      </div>

      <div className="relative z-10 text-center max-w-md w-full">
        {/* Logo */}
        <img
          src={LOGO_IMG}
          alt="Sanctificare"
          className="w-14 h-14 rounded-full mx-auto mb-8 shadow-[0_0_30px_rgba(0,0,0,0.4)]"
        />

        {/* Success Icon */}
        <div className="relative inline-flex mb-6">
          <div className="w-20 h-20 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
            <Crown size={36} className="text-amber-400" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-500 border-2 border-[oklch(0.08_0.04_260)] flex items-center justify-center">
            <CheckCircle size={16} className="text-white" fill="white" />
          </div>
        </div>

        {/* Heading */}
        <h1 className="font-display text-3xl font-black text-white mb-3">
          Seja bem-vindo ao{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200">
            Premium!
          </span>
        </h1>

        <p className="font-serif text-slate-300 text-base leading-relaxed mb-8">
          Sua assinatura foi ativada com sucesso. Agora você tem acesso completo
          ao retiro de{" "}
          <em>A Imitação de Cristo</em>, a todas as novenas, músicas sacras
          selecionadas e meditações guiadas.
        </p>

        {/* Feature highlights */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-8 text-left space-y-3">
          {[
            "Retiro completo – A Imitação de Cristo (9 dias)",
            "Todas as novenas desbloqueadas",
            "Músicas sacras de Bach, Vivaldi e Gounod",
            "Meditações guiadas exclusivas",
          ].map((item) => (
            <div key={item} className="flex items-start gap-3">
              <Sparkles size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-slate-200 text-sm">{item}</p>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Link href="/degraus-de-perfeicao/imitacao-de-cristo">
            <Button className="w-full h-12 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-600 hover:to-amber-500 text-slate-950 font-black cursor-pointer">
              <ArrowRight size={16} className="mr-2" />
              Iniciar a Imitação de Cristo
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button
              variant="ghost"
              className="w-full h-11 rounded-2xl text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
            >
              Ir para o Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
