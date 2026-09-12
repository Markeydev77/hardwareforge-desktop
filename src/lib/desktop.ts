/**
 * Most do Electronu (electron/preload.ts). V prehliadaci (npm run dev) chyba -
 * vsetky volania preto idu cez desktop(), ktore vrati null a UI pouzije
 * webovu nahradu.
 */
export type DesktopBridge = {
  isDesktop: true;
  openExternal(url: string): Promise<boolean>;
  savePdf(name: string): Promise<boolean>;
  imageToPdf(dataUrl: string, name: string): Promise<boolean>;
  backup(): Promise<void>;
  restore(): Promise<void>;
  openDataFolder(): Promise<void>;
};

declare global {
  interface Window {
    hf?: DesktopBridge;
  }
}

export function desktop(): DesktopBridge | null {
  return typeof window !== "undefined" && window.hf?.isDesktop ? window.hf : null;
}

const noop = () => () => {};

/** Pre useSyncExternalStore - bez hydration mismatch (server = false). */
export const desktopStore = {
  subscribe: noop,
  getSnapshot: () => desktop() !== null,
  getServerSnapshot: () => false,
};
