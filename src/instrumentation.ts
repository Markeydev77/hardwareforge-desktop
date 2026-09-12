/**
 * Spusti sa raz pri starte servera, este pred prvym requestom.
 * Node-only logika je v samostatnom subore - Next kompiluje instrumentation
 * aj pre edge runtime a tam node:fs / node:crypto neexistuju.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { startup } = await import("./instrumentation-node");
    await startup();
  }
}
