/**
 * Fractional indexing pre poradie kariet v Kanbane.
 *
 * `order` je Float. Vlozenie karty medzi dve ine = priemer ich hodnot,
 * teda jeden UPDATE bez ohladu na pocet kariet v stlpci. Alternativa
 * (order: Int + precislovanie stlpca) znamena N UPDATE dotazov a pri
 * subeznych presunoch konflikty.
 */

export const ORDER_STEP = 1024;

/** Vypocita `order` pre kartu vlozenu medzi `prev` a `next`. */
export function computeOrder(prev?: number, next?: number): number {
  if (prev === undefined && next === undefined) return ORDER_STEP;
  if (prev === undefined) return next! - ORDER_STEP;
  if (next === undefined) return prev + ORDER_STEP;
  return (prev + next) / 2;
}

/**
 * Po ~50 vlozeniach na to iste miesto klesne rozdiel pod hranicu presnosti
 * Float64 a dve karty by dostali rovnaky `order`. Vtedy sa stlpec precisluje.
 */
export function needsRebalance(prev?: number, next?: number): boolean {
  if (prev === undefined || next === undefined) return false;
  return Math.abs(next - prev) < 0.0001;
}
