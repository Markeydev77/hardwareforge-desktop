import { timingSafeEqual } from "node:crypto";

/**
 * Ochrana lokalneho servera.
 *
 * Server bezi na 127.0.0.1, takze sa k nemu vie pripojit aj akykolvek iny
 * program na pocitaci - a hlavne akakolvek webstranka otvorena v Chrome
 * (fetch na http://127.0.0.1:port, DNS rebinding). Preto kazdy request musi:
 *   1. mat Host presne 127.0.0.1:<port>  -> DNS rebinding neprejde
 *   2. ak ma Origin, musi to byt nas      -> CSRF z cudzej stranky neprejde
 *   3. niest tajny token v cookie          -> iny program ho nepozna
 *
 * Token vygeneruje Electron pri kazdom spusteni (32 nahodnych bajtov),
 * posle ho serveru cez env a oknu cez httpOnly cookie. Na disk sa nezapisuje.
 */

export const TOKEN_COOKIE = "hf_token";

type Env = Record<string, string | undefined>;

export type GuardInput = {
  host: string | null;
  origin: string | null;
  token: string | undefined;
};

export type GuardResult = { ok: true } | { ok: false; reason: string };

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

export function checkRequest(input: GuardInput, env: Env = process.env): GuardResult {
  const expected = env.HF_APP_TOKEN;

  if (!expected) {
    // Bez Electronu (npm run dev) token neexistuje. Povolene len pri vyvoji -
    // produkcny build spusteny bez Electronu odmietne vsetko (fail-closed).
    return env.NODE_ENV === "production"
      ? { ok: false, reason: "missing-token-config" }
      : { ok: true };
  }

  const host = `127.0.0.1:${env.PORT ?? ""}`;
  if (input.host !== host) return { ok: false, reason: "host" };
  if (input.origin !== null && input.origin !== `http://${host}`) {
    return { ok: false, reason: "origin" };
  }
  if (!input.token || !safeEqual(input.token, expected)) return { ok: false, reason: "token" };
  return { ok: true };
}
