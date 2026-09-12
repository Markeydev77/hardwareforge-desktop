// Skopiruje fonty Excalidrawu do public/, aby ich editor map nacital z appky.
// Bez toho by si ich stahoval z CDN (esm.sh / unpkg) - appka ma byt 100 % offline.
// Spusta sa automaticky v `postinstall`.
import fs from "node:fs";
import path from "node:path";

const src = path.join("node_modules", "@excalidraw", "excalidraw", "dist", "prod", "fonts");
const dest = path.join("public", "excalidraw-assets", "fonts");

if (!fs.existsSync(src)) {
  console.error(`[excalidraw] fonty sa nenasli v ${src}`);
  process.exit(1);
}

fs.rmSync(dest, { recursive: true, force: true });
fs.cpSync(src, dest, { recursive: true });

let count = 0;
const walk = (d) =>
  fs.readdirSync(d, { withFileTypes: true }).forEach((e) => {
    if (e.isDirectory()) walk(path.join(d, e.name));
    else count++;
  });
walk(dest);
console.log(`[excalidraw] skopirovanych ${count} fontov do ${dest}`);
