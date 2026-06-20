import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import AppNav from "@/components/AppNav";
import TemplateSelector from "@/components/TemplateSelector";
import { trpc } from "@/lib/trpc";
import { type TemplateType, applyTemplateTheme } from "@/data/templates";
import { toast } from "sonner";
import { useEffect } from "react";

const LOGO_IMG = "/assets/sanctificare-logo.webp";

export default function TemplateSettings() {
  const { isAuthenticated, loading } = useAuth();
  const utils = trpc.useUtils();

  const { data: currentTemplate, isLoading: templateLoading } = trpc.templates.getPreference.useQuery(
    undefined, { enabled: isAuthenticated }
  );

  const setTemplateMutation = trpc.templates.setPreference.useMutation({
    onSuccess: () => {
      utils.templates.getPreference.invalidate();
      toast.success("Tema atualizado com sucesso!", {
        description: "Seu novo estilo foi aplicado ao app.",
      });
    },
    onError: () => toast.error("Erro ao atualizar tema. Tente novamente."),
  });

  useEffect(() => {
    if (currentTemplate) {
      applyTemplateTheme(currentTemplate as TemplateType);
    }
  }, [currentTemplate]);

  if (loading || templateLoading) {
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
          <a href={getLoginUrl()}><Button>Entrar</Button></a>
        </div>
      </div>
    );
  }

  const handleTemplateChange = (template: TemplateType) => {
    setTemplateMutation.mutate({ template });
  };

  return (
    <div className="min-h-screen bg-background">
      <AppNav />

      <main className="container py-12">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-10">
            <h1 className="font-display text-4xl font-bold text-[oklch(0.22_0.07_260)] mb-3">
              Personalize seu App
            </h1>
            <p className="font-serif text-lg text-muted-foreground">
              Escolha o estilo visual que melhor representa sua espiritualidade. Você pode mudar a qualquer momento.
            </p>
          </div>

          {/* Template Selector */}
          <TemplateSelector
            currentTemplate={(currentTemplate || "classico") as TemplateType}
            onTemplateChange={handleTemplateChange}
            showDialog={false}
          />

          {/* Info */}
          <div className="mt-12 p-6 rounded-xl bg-[oklch(0.75_0.12_75/0.08)] border border-[oklch(0.75_0.12_75/0.2)]">
            <h3 className="font-display text-lg font-bold text-[oklch(0.22_0.07_260)] mb-2">
              💡 Dica
            </h3>
            <p className="text-sm text-muted-foreground">
              Cada tema foi cuidadosamente desenvolvido para oferecer uma experiência visual única enquanto mantém a elegância e a reverência da identidade católica. Escolha o que mais ressoa com você!
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
