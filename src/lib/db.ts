import { PrismaClient } from "@/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { dbPath } from "./paths";

/**
 * Prisma + lokalna SQLite databaza cez libSQL.
 *
 * Preco libSQL a nie better-sqlite3: jeho nativny modul pouziva N-API,
 * takze ten isty subor funguje v Node aj v Electrone bez prekompilovania
 * (a bez Visual Studio Build Tools na pocitaci pouzivatela aj vyvojara).
 */

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

/** Windows cesta -> libSQL URL ("file:C:/Users/.../hardwareforge.db"). */
export function fileUrl(file: string): string {
  return `file:${file.replaceAll("\\", "/")}`;
}

export function createClient(file = dbPath()): PrismaClient {
  return new PrismaClient({
    adapter: new PrismaLibSql({ url: fileUrl(file) }),
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

function getClient(): PrismaClient {
  // Bez singletonu vytvori kazdy hot-reload nove spojenie
  if (!globalForPrisma.prisma) globalForPrisma.prisma = createClient();
  return globalForPrisma.prisma;
}

/**
 * Lenivy klient: instancia vznikne az pri prvom pouziti, nie pri importe.
 * Next.js pri builde nacita vsetky moduly - databaza vtedy nesmie vzniknut.
 */
export const db = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = getClient();
    const value = Reflect.get(client, prop, receiver);
    return typeof value === "function" ? value.bind(client) : value;
  },
});
