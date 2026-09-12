import { contextBridge, ipcRenderer } from "electron";

/**
 * Jedine, co stranka appky vidi z Electronu. Ziadny pristup k Node, suborom
 * ani IPC vseobecne - len tieto funkcie. Hlavny proces kazde volanie este
 * overuje (odkial prislo, typy argumentov).
 */
contextBridge.exposeInMainWorld("hf", {
  isDesktop: true,
  openExternal: (url: string) => ipcRenderer.invoke("hf:open-external", String(url)),
  savePdf: (name: string) => ipcRenderer.invoke("hf:save-pdf", String(name)),
  imageToPdf: (dataUrl: string, name: string) =>
    ipcRenderer.invoke("hf:image-to-pdf", String(dataUrl), String(name)),
  backup: () => ipcRenderer.invoke("hf:backup"),
  restore: () => ipcRenderer.invoke("hf:restore"),
  openDataFolder: () => ipcRenderer.invoke("hf:open-data-folder"),
});
