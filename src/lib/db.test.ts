import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { PrismaClient } from "@/generated/prisma/client";
import { createClient } from "./db";
import { runMigrations } from "./migrate";

/**
 * Integracny test skutocnej databazy (Prisma + libSQL + nase migracie).
 * Overuje veci, ktore by sa inak prejavili az ako tiche poskodenie dat.
 */

let tmp: string;
let db: PrismaClient;

beforeAll(() => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), "hf-db-"));
  const file = path.join(tmp, "hf.db");
  runMigrations(file, path.join(process.cwd(), "prisma", "migrations"));
  db = createClient(file);
});

afterAll(async () => {
  await db.$disconnect();
  // libSQL (Prisma) uvolni subor az pri garbage collection - v bezaciej appke
  // to nevadi (DB sa pocas behu nemaze), v teste staci best-effort upratanie.
  try {
    fs.rmSync(tmp, { recursive: true, force: true, maxRetries: 3 });
  } catch {
    /* docasny priecinok zmaze system */
  }
});

async function projectWithChildren(slug: string) {
  return db.project.create({
    data: {
      slug,
      title: slug,
      tasks: { create: { title: "úloha", order: 1024 } },
      parts: { create: { name: "ESP32", unitPrice: "4.20" } },
      whiteboards: { create: { title: "mapa" } },
    },
  });
}

describe("databáza", () => {
  it("zmazanie projektu zmaže aj úlohy, súčiastky a mapy (cascade)", async () => {
    const p = await projectWithChildren("cascade");
    await db.project.delete({ where: { id: p.id } });

    expect(await db.task.count({ where: { projectId: p.id } })).toBe(0);
    expect(await db.part.count({ where: { projectId: p.id } })).toBe(0);
    expect(await db.whiteboard.count({ where: { projectId: p.id } })).toBe(0);
  });

  it("cascade funguje aj v interaktívnej transakcii", async () => {
    const p = await projectWithChildren("cascade-tx");
    await db.$transaction(async (tx) => {
      await tx.project.delete({ where: { id: p.id } });
    });
    expect(await db.task.count({ where: { projectId: p.id } })).toBe(0);
  });

  it("nedovolí úlohu k neexistujúcemu projektu", async () => {
    await expect(
      db.task.create({ data: { title: "sirota", order: 1, projectId: "neexistuje" } }),
    ).rejects.toThrow();
  });

  it("Decimal drží presnú cenu", async () => {
    const p = await db.project.create({ data: { slug: "cena", title: "cena" } });
    await db.part.createMany({
      data: [
        { projectId: p.id, name: "a", unitPrice: "0.10" },
        { projectId: p.id, name: "b", unitPrice: "0.20" },
      ],
    });
    const parts = await db.part.findMany({ where: { projectId: p.id }, orderBy: { name: "asc" } });
    const sum = parts.reduce((s, x) => s.plus(x.unitPrice!), parts[0].unitPrice!.minus(parts[0].unitPrice!));
    expect(sum.toString()).toBe("0.3");
  });

  it("mapa má predvolene prázdne elementy a JSON sa uloží 1:1", async () => {
    const p = await db.project.create({ data: { slug: "json", title: "json" } });
    const wb = await db.whiteboard.create({ data: { projectId: p.id } });
    expect(wb.elements).toEqual([]);

    const scene = [{ id: "x", type: "rectangle", text: "Čerpadlo ✓" }];
    await db.whiteboard.update({ where: { id: wb.id }, data: { elements: scene } });
    const back = await db.whiteboard.findUniqueOrThrow({ where: { id: wb.id } });
    expect(back.elements).toEqual(scene);
  });

  it("dátumy sa vracajú ako Date", async () => {
    const p = await db.project.create({ data: { slug: "datum", title: "d", dueDate: new Date("2026-12-24T00:00:00Z") } });
    const back = await db.project.findUniqueOrThrow({ where: { id: p.id } });
    expect(back.dueDate?.toISOString()).toBe("2026-12-24T00:00:00.000Z");
    expect(back.createdAt).toBeInstanceOf(Date);
  });
});
