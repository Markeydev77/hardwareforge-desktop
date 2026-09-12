import { describe, expect, it } from "vitest";
import { checkRequest } from "./guard";

const TOKEN = "a".repeat(64);
const env = { HF_APP_TOKEN: TOKEN, PORT: "51234", NODE_ENV: "production" };
const ok = { host: "127.0.0.1:51234", origin: null, token: TOKEN };

describe("checkRequest", () => {
  it("pustí request z okna appky", () => {
    expect(checkRequest(ok, env)).toEqual({ ok: true });
    expect(checkRequest({ ...ok, origin: "http://127.0.0.1:51234" }, env).ok).toBe(true);
  });

  it("odmietne chýbajúci alebo nesprávny token", () => {
    expect(checkRequest({ ...ok, token: undefined }, env).ok).toBe(false);
    expect(checkRequest({ ...ok, token: "b".repeat(64) }, env).ok).toBe(false);
    expect(checkRequest({ ...ok, token: TOKEN.slice(1) }, env).ok).toBe(false);
  });

  it("odmietne cudzí Host (DNS rebinding)", () => {
    expect(checkRequest({ ...ok, host: "evil.example:51234" }, env).ok).toBe(false);
    expect(checkRequest({ ...ok, host: "localhost:51234" }, env).ok).toBe(false);
    expect(checkRequest({ ...ok, host: "127.0.0.1:9999" }, env).ok).toBe(false);
    expect(checkRequest({ ...ok, host: null }, env).ok).toBe(false);
  });

  it("odmietne request z cudzej stránky (CSRF)", () => {
    expect(checkRequest({ ...ok, origin: "https://evil.example" }, env).ok).toBe(false);
    expect(checkRequest({ ...ok, origin: "null" }, env).ok).toBe(false);
  });

  it("produkčný build bez tokenu odmietne všetko (fail-closed)", () => {
    expect(checkRequest(ok, { NODE_ENV: "production" }).ok).toBe(false);
  });

  it("vývojový režim bez Electronu púšťa", () => {
    expect(checkRequest({ host: "127.0.0.1:3000", origin: null, token: undefined }, { NODE_ENV: "development" }).ok).toBe(true);
  });
});
