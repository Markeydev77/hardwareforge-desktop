/**
 * Ciste funkcie rozhodujuce, kam sa okno appky smie dostat.
 * Bez importu `electron`, aby sa dali testovat Vitestom.
 */

/** Patri URL (vratane blob:) k lokalnemu serveru appky? */
export function isAppUrl(url: string, origin: string): boolean {
  if (!origin) return false;
  try {
    return new URL(url).origin === origin;
  } catch {
    return false;
  }
}

/**
 * URL, ktoru mozno otvorit v systemovom prehliadaci. Len http(s) -
 * file:, javascript:, ms-settings:, smb: a pod. by mohli spustit program
 * alebo otvorit subor na disku.
 */
export function externalUrl(url: string): string | null {
  try {
    const u = new URL(url);
    return u.protocol === "https:" || u.protocol === "http:" ? u.toString() : null;
  } catch {
    return null;
  }
}

/**
 * Smie okno appky poslat tento request? Vsetko mimo lokalneho servera sa
 * zrusi - appka fyzicky nemoze komunikovat s internetom.
 */
export function isAllowedRequest(url: string, origin: string, allowDevtools = false): boolean {
  if (url.startsWith("data:")) return true;
  if (allowDevtools && url.startsWith("devtools://")) return true;
  return isAppUrl(url, origin);
}
