// Vytvori novu SQL migraciu z rozdielu medzi existujucimi migraciami a schema.prisma.
//
//   npm run db:migration -- nazov_zmeny
//
// Bezaca appka ju aplikuje sama pri dalsom starte (src/lib/migrate.ts),
// pred tym si urobi zalohu databazy.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const name = (process.argv[2] ?? "").replace(/[^a-z0-9_]/gi, "_").toLowerCase();
if (!name) {
  console.error("Pouzitie: npm run db:migration -- nazov_zmeny");
  process.exit(1);
}

const dir = path.join("prisma", "migrations");
fs.mkdirSync(dir, { recursive: true });
const hasMigrations = fs
  .readdirSync(dir, { withFileTypes: true })
  .some((d) => d.isDirectory());

// Prisma CLI priamo cez node - bez shellu (ziadne skladanie prikazu z retazcov)
const prismaCli = path.join("node_modules", "prisma", "build", "index.js");
const args = [
  prismaCli,
  "migrate",
  "diff",
  ...(hasMigrations ? ["--from-migrations", dir] : ["--from-empty"]),
  "--to-schema",
  path.join("prisma", "schema.prisma"),
  "--script",
];
const sql = execFileSync(process.execPath, args, { encoding: "utf8" });

if (!sql.trim() || /^-- This is an empty migration/m.test(sql)) {
  console.log("Ziadne zmeny v schema.prisma - migracia nevznikla.");
  process.exit(0);
}

const stamp = new Date().toISOString().replace(/\D/g, "").slice(0, 14);
const target = path.join(dir, `${stamp}_${name}`);
fs.mkdirSync(target);
fs.writeFileSync(path.join(target, "migration.sql"), sql);
console.log(`Vytvorena migracia ${target}`);
