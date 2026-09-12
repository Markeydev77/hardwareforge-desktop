import { describe, expect, it } from "vitest";
import { externalUrl, isAllowedRequest, isAppUrl } from "./navigation";

const ORIGIN = "http://127.0.0.1:51234";

describe("isAppUrl", () => {
  it("rozozná vlastný server vrátane blob:", () => {
    expect(isAppUrl(`${ORIGIN}/dashboard`, ORIGIN)).toBe(true);
    expect(isAppUrl(`blob:${ORIGIN}/0b3c`, ORIGIN)).toBe(true);
  });

  it("odmietne iný port, host alebo protokol", () => {
    expect(isAppUrl("http://127.0.0.1:9999/", ORIGIN)).toBe(false);
    expect(isAppUrl("http://localhost:51234/", ORIGIN)).toBe(false);
    expect(isAppUrl("https://127.0.0.1:51234/", ORIGIN)).toBe(false);
    expect(isAppUrl("http://127.0.0.1:51234.evil.com/", ORIGIN)).toBe(false);
    expect(isAppUrl("file:///C:/Windows/win.ini", ORIGIN)).toBe(false);
    expect(isAppUrl("nezmysel", ORIGIN)).toBe(false);
    expect(isAppUrl(`${ORIGIN}/`, "")).toBe(false);
  });
});

describe("externalUrl", () => {
  it("pustí len http(s)", () => {
    expect(externalUrl("https://github.com/Bodmer/TFT_eSPI")).toBe("https://github.com/Bodmer/TFT_eSPI");
    expect(externalUrl("http://example.com")).toBe("http://example.com/");
    expect(externalUrl("file:///C:/Windows/System32/calc.exe")).toBeNull();
    expect(externalUrl("javascript:alert(1)")).toBeNull();
    expect(externalUrl("ms-settings:privacy")).toBeNull();
    expect(externalUrl("\\\\server\\share\\x.exe")).toBeNull();
  });
});

describe("isAllowedRequest", () => {
  it("blokuje internet, púšťa appku a data:", () => {
    expect(isAllowedRequest(`${ORIGIN}/_next/static/chunk.js`, ORIGIN)).toBe(true);
    expect(isAllowedRequest("data:image/png;base64,AAAA", ORIGIN)).toBe(true);
    expect(isAllowedRequest("https://esm.sh/@excalidraw/fonts", ORIGIN)).toBe(false);
    expect(isAllowedRequest("https://fonts.gstatic.com/x.woff2", ORIGIN)).toBe(false);
    expect(isAllowedRequest("ws://127.0.0.1:51234/_next/webpack-hmr", ORIGIN)).toBe(false);
    expect(isAllowedRequest("devtools://devtools/bundled/x", ORIGIN)).toBe(false);
    expect(isAllowedRequest("devtools://devtools/bundled/x", ORIGIN, true)).toBe(true);
  });
});
