/**
 * Vyhladavanie bez ohladu na velkost pismen a diakritiku:
 * "cerpadlo" najde "Čerpadlo", "ESP" najde "esp32".
 *
 * SQLite LIKE pozna len ASCII velkost pismen, "č" a "Č" su pre neho rozne
 * znaky. Filtruje sa preto v JS - pri jednom pouzivatelovi a stovkach
 * projektov je to okamzite.
 */
export function normalizeSearch(s: string): string {
  return s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().trim();
}

export function matchesSearch(query: string, fields: (string | null | undefined)[]): boolean {
  const q = normalizeSearch(query);
  if (!q) return true;
  return fields.some((f) => f != null && normalizeSearch(f).includes(q));
}
