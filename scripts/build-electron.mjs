// Zbali hlavny proces a preload Electronu do dist-electron/.
// yazl/yauzl sa zbalia dnu (Electron ziadne node_modules nebali),
// libsql sa nacita za behu z priecinka servera (natívny modul).
import { build } from "esbuild";

const common = {
  bundle: true,
  platform: "node",
  target: "node22",
  format: "cjs",
  external: ["electron"],
  logLevel: "info",
  legalComments: "none",
};

await build({ ...common, entryPoints: ["electron/main.ts"], outfile: "dist-electron/main.js" });
// Sandboxovany preload smie importovat len "electron" - musi byt jeden subor
await build({ ...common, entryPoints: ["electron/preload.ts"], outfile: "dist-electron/preload.js" });
