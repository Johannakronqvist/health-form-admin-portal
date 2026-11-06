const dateFormatter = new Intl.DateTimeFormat('sv-SE', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'Europe/Stockholm',
});

/** Formats an ISO timestamp as a short Swedish date, e.g. "28 okt 2026". */
export function formatDate(iso: string): string {
  const parts = dateFormatter.formatToParts(new Date(iso));
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value.replace('.', '') ?? '';

  return `${get('day')} ${get('month')} ${get('year')}`;
}

const timeFormatter = new Intl.DateTimeFormat('sv-SE', {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Europe/Stockholm',
});

/** "Idag 15:36" for today, "21 okt" earlier this year, otherwise "21 okt 2025". */
export function formatRecentDate(iso: string, now = new Date()): string {
  const date = new Date(iso);
  const sameDay = formatDate(iso) === formatDate(now.toISOString());
  if (sameDay) return `Idag ${timeFormatter.format(date)}`;
  const full = formatDate(iso);
  return full.endsWith(String(now.getFullYear())) ? full.slice(0, -5) : full;
}
