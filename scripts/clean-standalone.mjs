// Po `next build`: odstrani zo standalone servera veci, ktore tam nepatria,
// a OVERI to - build zlyha, ak by v nom zostali data vyvojara.
// (outputFileTracingExcludes nestaci: .data tam ťahá trace samotneho servera.)
import fs from "node:fs";
import path from "node:path";

const root = path.join(".next", "standalone");
if (!fs.existsSync(root)) {
  console.error("[clean] .next/standalone neexistuje - spusti najprv next build");
  process.exit(1);
}

const remove = [".data", ".env", ".env.local", "node_modules/sharp", "node_modules/@img"];
for (const rel of remove) fs.rmSync(path.join(root, rel), { recursive: true, force: true });

// Standalone server neobsahuje JS/CSS stranok ani public/ (Next ich necha na CDN).
// Bez nich by sa stranky len vykreslili na serveri a nic by nebolo interaktivne.
for (const [src, dest] of [
  [path.join(".next", "static"), path.join(root, ".next", "static")],
  ["public", path.join(root, "public")],
]) {
  fs.rmSync(dest, { recursive: true, force: true });
  fs.cpSync(src, dest, { recursive: true });
}

// Poistka: ziadna databaza ani env subor kdekolvek v baliku
const bad = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full);
    else if (/\.(db|db-wal|db-shm)$/i.test(e.name) || /^\.env/.test(e.name)) bad.push(full);
  }
})(root);
if (bad.length) {
  console.error("[clean] V baliku zostali zakazane subory:\n" + bad.join("\n"));
  process.exit(1);
}

const binary = path.join(root, "node_modules", "@libsql", "win32-x64-msvc", "index.node");
if (!fs.existsSync(binary)) {
  console.error("[clean] Chyba natívna binarka libsql - zabalena appka by nenabehla");
  process.exit(1);
}
if (!fs.existsSync(path.join(root, ".next", "static", "chunks"))) {
  console.error("[clean] Chyba JS stranok (.next/static) - appka by nebola interaktivna");
  process.exit(1);
}
console.log("[clean] standalone je cisty (bez dat vyvojara, s binarkou libsql, s JS/CSS)");
