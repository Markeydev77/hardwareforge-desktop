// electron-builder v extraResources potichu vynecha priecinky node_modules.
// Next.js standalone server ich vsak potrebuje (next, react, prisma, libsql),
// preto ich sem skopirujeme po zabaleni a overime, ze zabalena appka nabehne.
/* eslint-disable @typescript-eslint/no-require-imports -- electron-builder nacitava CommonJS hook */
const fs = require("node:fs");
const path = require("node:path");

exports.default = async function afterPack(context) {
  const src = path.join(context.packager.projectDir, ".next", "standalone", "node_modules");
  const dest = path.join(context.appOutDir, "resources", "server", "node_modules");

  fs.rmSync(dest, { recursive: true, force: true });
  fs.cpSync(src, dest, { recursive: true });

  const required = [
    "next/package.json",
    "react/package.json",
    "@prisma/client/package.json",
    "libsql/index.js",
    "@libsql/win32-x64-msvc/index.node",
  ];
  const missing = required.filter((rel) => !fs.existsSync(path.join(dest, rel)));
  if (missing.length) {
    throw new Error(`V zabalenom serveri chybaju moduly: ${missing.join(", ")}`);
  }
  console.log(`  • server node_modules skopirovane (${required.length} kontrol OK)`);
};
