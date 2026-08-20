import { Saint, MONTH_NAMES_PT } from "@/data/santoral";

const FAVORITES_STORAGE_KEY = "sanctificare_favorite_saints";

/**
 * Retorna os slugs dos santos favoritados pelo usuário.
 */
export function getFavoriteSaintSlugs(): string[] {
  try {
    const raw = localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Verifica se um santo está favoritado.
 */
export function isSaintFavorite(slug: string): boolean {
  const favorites = getFavoriteSaintSlugs();
  return favorites.includes(slug);
}

/**
 * Alterna o estado de favorito de um santo. Retorna true se agora é favorito, false se removido.
 */
export function toggleFavoriteSaint(slug: string): boolean {
  const favorites = getFavoriteSaintSlugs();
  const exists = favorites.includes(slug);
  let updated: string[];

  if (exists) {
    updated = favorites.filter(s => s !== slug);
  } else {
    updated = [...favorites, slug];
  }

  try {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(updated));
    // Dispara evento para sincronizar componentes na mesma aba
    window.dispatchEvent(new Event("sanctificare_favorites_changed"));
  } catch (e) {
    console.error("Erro ao salvar santos favoritos:", e);
  }

  return !exists;
}

/**
 * Gera e realiza o download de um arquivo .ics (iCalendar) para adicionar a festa e a novena ao calendário.
 */
export function downloadSaintCalendarEvent(saint: Saint, includeNovenaReminder: boolean = true): void {
  const currentYear = new Date().getFullYear();
  // Se a festa já passou este ano, agenda para o próximo ano
  const now = new Date();
  let eventYear = currentYear;
  const feastDateThisYear = new Date(currentYear, saint.month - 1, saint.day);
  if (feastDateThisYear < new Date(now.getFullYear(), now.getMonth(), now.getDate())) {
    eventYear += 1;
  }

  const formatICSDate = (d: Date): string => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}${m}${day}`;
  };

  const feastDate = new Date(eventYear, saint.month - 1, saint.day);
  const feastStr = formatICSDate(feastDate);

  let icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Sanctificare//Santoral Católico//PT",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    // Evento da Festa
    "BEGIN:VEVENT",
    `UID:sanctificare-saint-${saint.slug}-${eventYear}@sanctificare.app`,
    `DTSTAMP:${formatICSDate(new Date())}T080000Z`,
    `DTSTART;VALUE=DATE:${feastStr}`,
    `DTEND;VALUE=DATE:${feastStr}`,
    `SUMMARY:Festa de ${saint.name} (${saint.rank})`,
    `DESCRIPTION:${saint.title}\\n\\n"${saint.quote || saint.summary}"\\n\\nOração: ${saint.prayer.replace(/\n/g, " ")}\\n\\nAcesse: https://sanctificare.app/santoral/${saint.slug}`,
    "STATUS:CONFIRMED",
    "TRANSP:TRANSPARENT",
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    `DESCRIPTION:Hoje a Igreja celebra a Festa de ${saint.name}`,
    "TRIGGER:-PT1H",
    "END:VALARM",
    "END:VEVENT"
  ];

  // Se solicitado, adiciona evento para o início da Novena (9 dias antes)
  if (includeNovenaReminder) {
    const novenaStartDate = new Date(eventYear, saint.month - 1, saint.day - 9);
    const novenaStr = formatICSDate(novenaStartDate);

    icsContent.push(
      "BEGIN:VEVENT",
      `UID:sanctificare-novena-${saint.slug}-${eventYear}@sanctificare.app`,
      `DTSTAMP:${formatICSDate(new Date())}T080000Z`,
      `DTSTART;VALUE=DATE:${novenaStr}`,
      `DTEND;VALUE=DATE:${novenaStr}`,
      `SUMMARY:Início da Novena a ${saint.name}`,
      `DESCRIPTION:Início do 1º Dia da Novena preparatória para a Festa de ${saint.name} (${saint.day} de ${MONTH_NAMES_PT[saint.month - 1]}).\\n\\nReze via Sanctificare: https://sanctificare.app/santoral/${saint.slug}`,
      "STATUS:CONFIRMED",
      "TRANSP:TRANSPARENT",
      "BEGIN:VALARM",
      "ACTION:DISPLAY",
      `DESCRIPTION:Hoje inicia a Novena de ${saint.name}!`,
      "TRIGGER:-PT1H",
      "END:VALARM",
      "END:VEVENT"
    );
  }

  icsContent.push("END:VCALENDAR");

  const blob = new Blob([icsContent.join("\r\n")], { type: "text/calendar;charset=utf-8" });
  const link = document.createElement("a");
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute("download", `Festa_${saint.slug}_Sanctificare.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Retorna o texto formatado para compartilhamento em redes sociais.
 */
export function getSaintFormattedShareText(saint: Saint): string {
  const monthName = MONTH_NAMES_PT[saint.month - 1];
  const url = `https://sanctificare.app/santoral/${saint.slug}`;

  return `✨ *${saint.name}* (${saint.day} de ${monthName})\n` +
    `_${saint.title}_\n\n` +
    (saint.quote ? `📜 *Frase:* "${saint.quote}"\n\n` : "") +
    `📖 *Sobre:* ${saint.summary}\n\n` +
    `🙏 *Oração de Intercessão:*\n"${saint.prayer}"\n\n` +
    `✝️ Conheça a história completa e reze no Sanctificare:\n${url}`;
}

/**
 * Retorna link direto para compartilhamento via WhatsApp.
 */
export function getSaintWhatsAppShareUrl(saint: Saint): string {
  const text = getSaintFormattedShareText(saint);
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
}
