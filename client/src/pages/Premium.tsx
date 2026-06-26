import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import AppNav from "@/components/AppNav";
import { trpc } from "@/lib/trpc";
import { Crown, Check, Star, Shield, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { getAudioCollectionArt, getLiturgySectionArt, getNovenaArt } from "@/lib/cardArt";

const LOGO_IMG = "/assets/sanctificare-logo-v2.webp";

const plans = [
  {
    key: "monthly" as const,
    name: "Premium Mensal",
    price: "R$ 14,90",
    period: "por mês",
    priceValue: 14.9,
    features: [
      "Rosário e Terço guiados completos",
      "Novenas completas (N. S. Aparecida, Divino Espírito Santo e mais)",
      "Meditações diárias guiadas",
      "Áudios de orações",
      "Histórico ilimitado de orações",
      "Sem anúncios",
      "Acesso a todo conteúdo premium",
    ],
    highlight: false,
    badge: null,
  },
  {
    key: "annual" as const,
    name: "Premium Anual",
    price: "R$ 119,90",
    period: "por ano",
    priceValue: 119.9,
    monthlyEquiv: "R$ 9,99/mês",
    features: [
      "Tudo do plano mensal",
      "Equivalente a 2 meses grátis",
      "Acesso antecipado a novidades",
      "Suporte prioritário",
      "Certificado de oração anual",
      "Conteúdo exclusivo de datas especiais",
    ],
    highlight: true,
    badge: "Melhor Oferta — Economize 33%",
  },
];

const premiumContent = [
  {
    title: "Rosário Guiado",
    desc: "Todos os mistérios com meditações aprofundadas",
    image: "/assets/sanctificare-rosary.webp",
    overlay: "oklch(0.22 0.08 260 / 0.6)",
  },
  {
    title: "Novenas Completas",
    desc: "N. S. Aparecida, Divino Espírito Santo, São José e mais",
    image: getNovenaArt("novena-divino-espirito-santo").image,
    overlay: "oklch(0.35 0.1 215 / 0.58)",
  },
  {
    title: "Meditações Guiadas",
    desc: "Lectio Divina, Exame de Consciência, Adoração",
    image: getAudioCollectionArt("meditacoes-contemplativas"),
    overlay: "oklch(0.35 0.1 225 / 0.58)",
  },
  {
    title: "Áudios de Orações",
    desc: "Ouça orações narradas com música sacra de fundo",
    image: getAudioCollectionArt("historias-da-biblia"),
    overlay: "oklch(0.45 0.12 22 / 0.56)",
  },
  {
    title: "Via Sacra Completa",
    desc: "As 14 estações com textos e meditações",
    image: "/assets/via-sacra/estacao-02.webp",
    overlay: "oklch(0.3 0.09 260 / 0.62)",
  },
  {
    title: "Bíblia Completa",
    desc: "Acesso a todos os capítulos e versículos",
    image: getLiturgySectionArt("first_reading"),
    overlay: "oklch(0.34 0.08 210 / 0.6)",
  },
];

export default function Premium() {
  const { isAuthenticated, loading } = useAuth();
  const [confirmCancel, setConfirmCancel] = useState(false);
  const utils = trpc.useUtils();

  const { data: subscription, isLoading: subLoading } = trpc.subscriptions.getActive.useQuery(
    undefined, { enabled: isAuthenticated }
  );

  const subscribeMutation = trpc.subscriptions.subscribe.useMutation({
    onSuccess: () => {
      utils.subscriptions.getActive.invalidate();
      toast.success("Assinatura ativada!", {
        description: "Seu acesso foi ampliado. Que Deus abençoe sua jornada de oração.",
      });
    },
    onError: () => toast.error("Não foi possível processar sua assinatura agora. Tente novamente."),
  });

  const cancelMutation = trpc.subscriptions.cancel.useMutation({
    onSuccess: () => {
      utils.subscriptions.getActive.invalidate();
      setConfirmCancel(false);
      toast.success("Assinatura cancelada.", { description: "Você poderá reativar o acesso quando desejar." });
    },
    onError: () => toast.error("Não foi possível cancelar sua assinatura agora."),
  });

  if (loading || subLoading) {
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
          <p className="text-muted-foreground mb-6">Entre para conhecer as formas de ampliar seu acesso no app.</p>
          <a href={getLoginUrl()}><Button>Entrar</Button></a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[oklch(0.97_0.01_85)]">
      <AppNav />

      <main className="container py-8">
        {/* Header */}
        <div className="text-center mb-10 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[oklch(0.75_0.12_75/0.15)] border border-[oklch(0.75_0.12_75/0.4)] mb-4">
            <Crown size={28} className="text-[oklch(0.65_0.12_70)]" />
          </div>
          <h1 className="font-display text-4xl font-bold text-[oklch(0.22_0.07_260)] mb-3">
            Sanctificare Premium
          </h1>
          <p className="font-serif text-lg text-muted-foreground max-w-xl mx-auto">
            Aprofunde sua vida espiritual com novos roteiros de oração, novenas, meditações e conteúdos de devoção.
          </p>
        </div>

        {/* Assinatura ativa */}
        {subscription && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="rounded-2xl bg-gradient-to-r from-[oklch(0.22_0.07_260)] to-[oklch(0.30_0.09_255)] p-6 border border-[oklch(0.75_0.12_75/0.3)]">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[oklch(0.75_0.12_75/0.2)] border border-[oklch(0.75_0.12_75/0.4)] flex items-center justify-center">
                    <Crown size={22} className="text-[oklch(0.82_0.10_80)]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-display text-base font-bold text-white">
                        Premium {subscription.plan === "annual" ? "Anual" : "Mensal"} Ativo
                      </p>
                      <span className="badge-premium">Ativo</span>
                    </div>
                    <p className="text-sm text-[oklch(0.75_0.03_260)]">
                      Válido até {new Date(subscription.expiresAt).toLocaleDateString("pt-BR", {
                        day: "numeric", month: "long", year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[oklch(0.75_0.12_75/0.3)] text-[oklch(0.80_0.02_260)] hover:bg-[oklch(0.75_0.12_75/0.1)] bg-transparent text-xs"
                  onClick={() => setConfirmCancel(true)}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Conteúdo premium */}
        <div className="max-w-4xl mx-auto mb-10">
          <h2 className="font-display text-xl font-bold text-[oklch(0.22_0.07_260)] text-center mb-6">
            O que você recebe com o Premium
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {premiumContent.map((item) => (
              <div key={item.title} className="cover-card aspect-square">
                <img
                  src={item.image}
                  alt={item.title}
                  className="cover-card-image"
                  loading="lazy"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(to top, oklch(0.10 0.03 260 / 0.84) 0%, ${item.overlay} 56%, oklch(0.10 0.02 260 / 0.08) 100%)`,
                  }}
                />
                <div className="cover-card-content">
                  <h3 className="cover-card-title">{item.title}</h3>
                  <p className="cover-card-desc hidden md:block">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Planos */}
        {!subscription && (
          <div className="max-w-3xl mx-auto">
            <h2 className="font-display text-xl font-bold text-[oklch(0.22_0.07_260)] text-center mb-6">
              Escolha sua forma de acesso
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {plans.map((plan) => (
                <div
                  key={plan.key}
                  className={`relative rounded-2xl p-7 border transition-all ${
                    plan.highlight
                      ? "bg-[oklch(0.22_0.07_260)] border-[oklch(0.75_0.12_75/0.5)] shadow-2xl"
                      : "bg-white border-border hover:shadow-lg"
                  }`}
                >
                  {plan.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap">
                      <span className="badge-premium">{plan.badge}</span>
                    </div>
                  )}

                  <div className="mb-5">
                    <div className="flex items-center gap-2 mb-2">
                      <Crown size={16} className={plan.highlight ? "text-[oklch(0.82_0.10_80)]" : "text-[oklch(0.65_0.12_70)]"} />
                      <h3 className={`font-display text-base font-bold ${plan.highlight ? "text-[oklch(0.88_0.08_80)]" : "text-[oklch(0.22_0.07_260)]"}`}>
                        {plan.name}
                      </h3>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className={`font-display text-4xl font-bold ${plan.highlight ? "text-white" : "text-[oklch(0.22_0.07_260)]"}`}>
                        {plan.price}
                      </span>
                      <span className={`text-sm ${plan.highlight ? "text-[oklch(0.70_0.03_260)]" : "text-muted-foreground"}`}>
                        /{plan.period}
                      </span>
                    </div>
                    {plan.monthlyEquiv && (
                      <p className="text-xs text-[oklch(0.65_0.12_70)] mt-1 font-semibold">{plan.monthlyEquiv}</p>
                    )}
                  </div>

                  <ul className="space-y-2.5 mb-6">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <Check size={14} className={`flex-shrink-0 mt-0.5 ${plan.highlight ? "text-[oklch(0.75_0.12_75)]" : "text-[oklch(0.40_0.12_150)]"}`} />
                        <span className={`text-sm ${plan.highlight ? "text-[oklch(0.85_0.02_260)]" : "text-foreground"}`}>
                          {f}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className={`w-full font-semibold ${
                      plan.highlight
                        ? "bg-[oklch(0.75_0.12_75)] hover:bg-[oklch(0.70_0.13_73)] text-[oklch(0.15_0.02_260)]"
                        : "bg-[oklch(0.22_0.07_260)] hover:bg-[oklch(0.28_0.08_260)] text-white"
                    }`}
                    onClick={() => subscribeMutation.mutate({ plan: plan.key })}
                    disabled={subscribeMutation.isPending}
                  >
                    {subscribeMutation.isPending ? "Processando..." : `Assinar ${plan.name}`}
                  </Button>
                </div>
              ))}
            </div>

            {/* Garantia */}
            <div className="mt-8 text-center">
              <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <Shield size={14} className="text-[oklch(0.40_0.12_150)]" />
                <span>Cancele quando desejar, sem fidelidade obrigatória.</span>
              </div>
            </div>
          </div>
        )}

        {/* Já tem premium — upgrade */}
        {subscription && subscription.plan === "monthly" && (
          <div className="max-w-2xl mx-auto">
            <div className="prayer-card p-6 text-center">
              <Sparkles size={24} className="text-[oklch(0.65_0.12_70)] mx-auto mb-3" />
              <h3 className="font-display text-lg font-bold text-[oklch(0.22_0.07_260)] mb-2">
                Migre para o Plano Anual
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Economize 33% e mantenha por mais tempo seu acesso aos conteúdos de oração do app.
              </p>
              <Button
                className="bg-[oklch(0.75_0.12_75)] hover:bg-[oklch(0.70_0.13_73)] text-[oklch(0.15_0.02_260)] font-semibold"
                onClick={() => subscribeMutation.mutate({ plan: "annual" })}
                disabled={subscribeMutation.isPending}
              >
                <Crown size={14} className="mr-2" />
                {subscribeMutation.isPending ? "Processando..." : "Migrar para Anual — R$ 119,90/ano"}
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Modal de cancelamento */}
      <Dialog open={confirmCancel} onOpenChange={setConfirmCancel}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display text-lg text-[oklch(0.22_0.07_260)]">
              Cancelar assinatura?
            </DialogTitle>
            <DialogDescription className="font-serif text-sm">
              Você continuará com acesso até o fim do período vigente e, depois disso, perderá os conteúdos premium. Tem certeza?
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-4">
            <Button
              variant="destructive"
              className="flex-1"
              onClick={() => cancelMutation.mutate()}
              disabled={cancelMutation.isPending}
            >
              {cancelMutation.isPending ? "Cancelando..." : "Sim, Cancelar"}
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => setConfirmCancel(false)}>
              Manter Premium
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
