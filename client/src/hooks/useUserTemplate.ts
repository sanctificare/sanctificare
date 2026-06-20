import { useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { applyTemplateTheme, type TemplateType } from "@/data/templates";

/**
 * Hook que carrega e aplica o tema preferido do usuário
 * Executa automaticamente quando o usuário faz login
 */
export function useUserTemplate() {
  const { isAuthenticated } = useAuth();
  const { data: templatePreference } = trpc.templates.getPreference.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  useEffect(() => {
    if (templatePreference) {
      applyTemplateTheme(templatePreference as TemplateType);
    }
  }, [templatePreference]);

  return templatePreference as TemplateType | undefined;
}
