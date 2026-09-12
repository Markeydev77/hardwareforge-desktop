import { describe, expect, it } from "vitest";
import { matchesSearch, normalizeSearch } from "./search";

describe("normalizeSearch", () => {
  it("odstráni diakritiku a veľkosť písmen", () => {
    expect(normalizeSearch("Čerpadlo ŽĽŤ")).toBe("cerpadlo zlt");
  });
});

describe("matchesSearch", () => {
  it("nájde text bez ohľadu na diakritiku", () => {
    expect(matchesSearch("cerpadlo", ["Riadenie čerpadla", null])).toBe(false);
    expect(matchesSearch("cerpadl", ["Riadenie čerpadla", null])).toBe(true);
    expect(matchesSearch("ČERPADL", ["riadenie cerpadla"])).toBe(true);
  });

  it("prázdny dopyt vyhovuje všetkému", () => {
    expect(matchesSearch("   ", [null])).toBe(true);
  });

  it("ignoruje null a undefined polia", () => {
    expect(matchesSearch("esp", [null, undefined, "ESP32"])).toBe(true);
    expect(matchesSearch("esp", [null, undefined])).toBe(false);
  });
});
