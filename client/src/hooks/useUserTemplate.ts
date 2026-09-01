import { useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { applyTemplateTheme, type TemplateType } from "@/data/templates";

const LOCAL_TEMPLATE_KEY = "sanctificare_user_template";

export function applyCachedUserTemplate() {
  try {
    const cached = localStorage.getItem(LOCAL_TEMPLATE_KEY);
    if (cached) applyTemplateTheme(cached as TemplateType);
  } catch {
    // Storage can be unavailable in private or hardened browser contexts.
  }
}

/**
 * Hook que carrega e aplica o tema preferido do usuário
 * Executa automaticamente quando o usuário faz login
 */
export function useUserTemplate() {
  const { isAuthenticated } = useAuth();
  
  // Aplica tema salvo em cache imediatamente no primeiro render
  const { data: templatePreference } = trpc.templates.getPreference.useQuery(
    undefined,
    {
      enabled: isAuthenticated,
      staleTime: 1000 * 60 * 60, // 1 hora de cache
      refetchOnWindowFocus: false,
    }
  );

  useEffect(() => {
    if (templatePreference) {
      const current = localStorage.getItem(LOCAL_TEMPLATE_KEY);
      if (current !== templatePreference) {
        localStorage.setItem(LOCAL_TEMPLATE_KEY, templatePreference);
        applyTemplateTheme(templatePreference as TemplateType);
      }
    }
  }, [templatePreference]);

  return templatePreference as TemplateType | undefined;
}
