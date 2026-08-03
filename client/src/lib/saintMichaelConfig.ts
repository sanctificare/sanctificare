/**
 * Quaresma de São Miguel - Configuração de Acesso e Bloqueio Conteúdo
 * 
 * Regra do projeto:
 * 1. O recurso da Quaresma de São Miguel fica ativado no app para todos os usuários.
 * 2. Áudios e textos de meditação permanecem bloqueados para usuários comuns até 15/08/2026.
 * 3. Administradores (role === "admin") mantêm áudios e textos desbloqueados a qualquer momento.
 */

export const SAINT_MICHAEL_ACTIVATION_DATE = new Date("2026-08-15T00:00:00-03:00");

/**
 * Retorna se o recurso da Quaresma está habilitado no aplicativo (sempre true)
 */
export function isSaintMichaelLentActive(
  user?: { role?: string | null } | null,
  nowDate: Date = new Date()
): boolean {
  return true;
}

/**
 * Retorna se o conteúdo completo (áudios e meditações diárias) está desbloqueado.
 * Administradores têm acesso ilimitado; usuários comuns desbloqueiam em 15/08/2026.
 */
export function isSaintMichaelContentUnlocked(
  user?: { role?: string | null } | null,
  nowDate: Date = new Date()
): boolean {
  if (user?.role === "admin") {
    return true;
  }
  return nowDate >= SAINT_MICHAEL_ACTIVATION_DATE;
}
