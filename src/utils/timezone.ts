/**
 * All interview times arrive from the API as UTC ISO strings. `new Date(iso)`
 * parses that into an absolute instant, and every formatting call below uses
 * the browser's local timezone implicitly (via Intl / toLocale*), which is
 * exactly the contract the assessment asks for: store UTC, render local.
 */

export const localTimeZone: string = Intl.DateTimeFormat().resolvedOptions().timeZone;

export function formatLocalTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatLocalDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatLocalDateLabel(date: Date): string {
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

/** Minutes elapsed since local midnight for the given instant — used to position slots on the grid. */
export function minutesSinceLocalMidnight(iso: string): number {
  const d = new Date(iso);
  return d.getHours() * 60 + d.getMinutes();
}

export function isSameLocalDay(iso: string, day: Date): boolean {
  const d = new Date(iso);
  return (
    d.getFullYear() === day.getFullYear() &&
    d.getMonth() === day.getMonth() &&
    d.getDate() === day.getDate()
  );
}

/**
 * Combines a yyyy-mm-dd date string and HH:mm time string — both taken from
 * plain HTML date/time inputs and therefore implicitly in the browser's
 * local timezone — into a UTC ISO string safe to send to the API.
 */
export function localDateTimeToUtcIso(dateStr: string, timeStr: string): string {
  // "2026-07-20" + "14:30" -> new Date("2026-07-20T14:30") is parsed as LOCAL time by the browser.
  const local = new Date(`${dateStr}T${timeStr}`);
  return local.toISOString();
}

export function toDateInputValue(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function addDays(date: Date, days: number): Date {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}
