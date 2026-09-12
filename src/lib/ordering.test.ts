import { describe, expect, it } from "vitest";
import { computeOrder, needsRebalance, ORDER_STEP } from "./ordering";

describe("computeOrder", () => {
  it("prázdny stĺpec", () => {
    expect(computeOrder()).toBe(ORDER_STEP);
  });

  it("na začiatok a na koniec", () => {
    expect(computeOrder(undefined, 1024)).toBe(0);
    expect(computeOrder(2048)).toBe(2048 + ORDER_STEP);
  });

  it("medzi dve karty = priemer", () => {
    expect(computeOrder(1024, 2048)).toBe(1536);
  });

  it("opakované vkladanie na to isté miesto zostane zoradené", () => {
    const prev = 1024;
    let next = 2048;
    for (let i = 0; i < 20; i++) {
      const mid = computeOrder(prev, next);
      expect(mid).toBeGreaterThan(prev);
      expect(mid).toBeLessThan(next);
      next = mid;
    }
  });
});

describe("needsRebalance", () => {
  it("hlási stratu presnosti", () => {
    expect(needsRebalance(1, 1.00001)).toBe(true);
    expect(needsRebalance(1, 2)).toBe(false);
    expect(needsRebalance(undefined, 2)).toBe(false);
  });
});
