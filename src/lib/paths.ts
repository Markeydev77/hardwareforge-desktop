import fs from "node:fs";
import path from "node:path";

/**
 * Vsetky data appky ziju v jednom priecinku na disku pouzivatela.
 *
 * Electron nastavi HF_DATA_DIR na %APPDATA%\HardwareForge. Pri vyvoji
 * (npm run dev bez Electronu) sa pouzije ./.data v projekte.
 */
export function dataDir(): string {
  const dir = process.env.HF_DATA_DIR || path.join(process.cwd(), ".data");
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export const dbPath = () => path.join(dataDir(), "hardwareforge.db");
export const storageRoot = () => path.join(dataDir(), "files");
export const backupsDir = () => path.join(dataDir(), "backups");

/** SQL migracie. V zabalenej appke ich Electron dodava z resources/. */
export const migrationsDir = () =>
  process.env.HF_MIGRATIONS_DIR || path.join(process.cwd(), "prisma", "migrations");
