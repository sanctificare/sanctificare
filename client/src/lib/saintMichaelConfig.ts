/**
 * Quaresma de São Miguel - Configuração e Regra de Ativação
 * 
 * Regra do projeto:
 * A Quaresma de São Miguel deve permanecer desativada para usuários comuns/visitantes até 15/08/2026.
 * Para administradores (role === "admin"), ela deve permanecer sempre ativada.
 */

export const SAINT_MICHAEL_ACTIVATION_DATE = new Date("2026-08-15T00:00:00-03:00");

export function isSaintMichaelLentActive(
  user?: { role?: string | null } | null,
  nowDate: Date = new Date()
): boolean {
  if (user?.role === "admin") {
    return true;
  }
  return nowDate >= SAINT_MICHAEL_ACTIVATION_DATE;
}
