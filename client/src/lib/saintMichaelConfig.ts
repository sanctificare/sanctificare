/**
 * Quaresma de São Miguel - Configuração de Acesso e Regras Devocionais
 * 
 * Regra da Tradição Católica:
 * - A Quaresma de São Miguel vai de 15 de Agosto (Assunção) a 29 de Setembro (Arcanjos).
 * - Abrange 46 dias corridos, dos quais os 6 DOMINGOS são excluídos da penitência,
 *   pois o domingo é o Dia do Senhor e dia de celebração da Ressurreição.
 * - Isso resulta exatamente em 40 dias penitenciais (segunda a sábado).
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
 * Conteúdo liberado para todos os usuários (áudios e textos).
 */
export function isSaintMichaelContentUnlocked(
  _user?: { role?: string | null } | null,
  _nowDate: Date = new Date()
): boolean {
  return true;
}

/**
 * Calcula a data de término dos 40 dias penitenciais excluindo os domingos,
 * respeitando a tradição católica em que o domingo é o Dia do Senhor (sem jejum/penitência).
 */
export function calculateSaintMichaelEndDateIso(startDateIso: string, durationDays: number = 40): string {
  if (!startDateIso) return "";
  try {
    const parts = startDateIso.split("-").map(Number);
    const date = new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0);
    let count = 0;
    while (count < durationDays) {
      // Domingo é dia 0 — os domingos são dias do Senhor e não contam na penitência
      if (date.getDay() !== 0) {
        count++;
      }
      if (count < durationDays) {
        date.setDate(date.getDate() + 1);
      }
    }
    return date.toISOString().slice(0, 10);
  } catch {
    return "";
  }
}
