import { cache } from "react";
import { notFound } from "next/navigation";
import type { Prisma, ProjectStatus } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { matchesSearch } from "@/lib/search";
import type { PartCalcInput } from "@/lib/calc";

/**
 * Prisma Decimal neprejde cez hranicu Server -> Client Component
 * (Next.js ho nevie serializovat). Vsade sa preto konvertuje na string
 * a formatuje az v UI.
 */
export function partToCalcInput(p: {
  quantity: number;
  unitPrice: Prisma.Decimal | null;
  voltage: Prisma.Decimal | null;
  currentMa: Prisma.Decimal | null;
  acquired: boolean;
}): PartCalcInput {
  return {
    quantity: p.quantity,
    unitPrice: p.unitPrice?.toString() ?? null,
    voltage: p.voltage?.toString() ?? null,
    currentMa: p.currentMa?.toString() ?? null,
    acquired: p.acquired,
  };
}

export type DashboardFilters = {
  q?: string;
  category?: string;
  status?: string;
  sort?: string;
  archived?: boolean;
};

/** Slug projektu podla id - pre revalidatePath/redirect po mutaciach v server actions. */
export async function projectSlug(projectId: string): Promise<string> {
  const p = await db.project.findUniqueOrThrow({
    where: { id: projectId },
    select: { slug: true },
  });
  return p.slug;
}

export const getProjects = cache(async (f: DashboardFilters) => {
  const where: Prisma.ProjectWhereInput = {
    archivedAt: f.archived ? { not: null } : null,
    ...(f.category && { category: f.category }),
    ...(f.status && { status: f.status as ProjectStatus }),
  };

  const orderBy: Prisma.ProjectOrderByWithRelationInput =
    f.sort === "created"
      ? { createdAt: "desc" }
      : f.sort === "title"
        ? { title: "asc" }
        : { updatedAt: "desc" };

  const all = await db.project.findMany({
    where,
    orderBy,
    include: {
      _count: { select: { tasks: true, parts: true, files: true, links: true } },
      tasks: { select: { status: true } },
      parts: {
        select: { quantity: true, unitPrice: true, voltage: true, currentMa: true, acquired: true },
      },
    },
  });
  // Fulltext bez diakritiky - viz src/lib/search.ts, preco nie SQL LIKE.
  const projects = f.q
    ? all.filter((p) => matchesSearch(f.q!, [p.title, p.description, p.category]))
    : all;

  return projects.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    description: p.description,
    category: p.category,
    status: p.status,
    priority: p.priority,
    color: p.color,
    dueDate: p.dueDate,
    updatedAt: p.updatedAt,
    archivedAt: p.archivedAt,
    counts: p._count,
    doneTasks: p.tasks.filter((t) => t.status === "DONE").length,
    totalTasks: p.tasks.length,
    parts: p.parts.map(partToCalcInput),
  }));
});

/** Kategorie s poctami - pre bocny panel a filter. */
export const getCategories = cache(async () => {
  const rows = await db.project.groupBy({
    by: ["category"],
    where: { archivedAt: null },
    _count: { category: true },
    orderBy: { _count: { category: "desc" } },
  });
  return rows.map((r) => ({ name: r.category, count: r._count.category }));
});

/** Zaklad hlavicky projektu - vola sa v layoute aj v strankach, preto cache(). */
export const getProject = cache(async (slug: string) => {
  const project = await db.project.findUnique({ where: { slug } });
  if (!project) notFound();
  return project;
});

export const getProjectStats = cache(async (projectId: string) => {
  const [tasks, parts, counts] = await Promise.all([
    db.task.findMany({
      where: { projectId },
      select: { status: true, dueDate: true, title: true, completedAt: true },
    }),
    db.part.findMany({
      where: { projectId },
      select: { quantity: true, unitPrice: true, voltage: true, currentMa: true, acquired: true },
    }),
    db.project.findUniqueOrThrow({
      where: { id: projectId },
      select: { _count: { select: { files: true, links: true, notes: true, parts: true } } },
    }),
  ]);

  return {
    totalTasks: tasks.length,
    doneTasks: tasks.filter((t) => t.status === "DONE").length,
    nextDue: tasks
      .filter((t) => t.dueDate && t.status !== "DONE")
      .sort((a, b) => a.dueDate!.getTime() - b.dueDate!.getTime())[0],
    parts: parts.map(partToCalcInput),
    counts: counts._count,
  };
});

export const getTasks = cache(async (projectId: string) =>
  db.task.findMany({
    where: { projectId },
    orderBy: [{ status: "asc" }, { order: "asc" }],
  }),
);

export const getParts = cache(async (projectId: string) =>
  db.part.findMany({ where: { projectId }, orderBy: [{ category: "asc" }, { name: "asc" }] }),
);

export const getFiles = cache(async (projectId: string) =>
  db.fileAsset.findMany({ where: { projectId }, orderBy: { createdAt: "desc" } }),
);

export const getLinks = cache(async (projectId: string) =>
  db.link.findMany({ where: { projectId }, orderBy: { createdAt: "desc" } }),
);

export const getNotes = cache(async (projectId: string) =>
  db.note.findMany({
    where: { projectId },
    orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }],
  }),
);

export const getActivity = cache(async (projectId: string, take = 100) =>
  db.activityLog.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
    take,
  }),
);

// ---------------------------------------------------------------- mapy

export const getWhiteboards = cache(async (projectId: string) =>
  db.whiteboard.findMany({
    where: { projectId },
    orderBy: { order: "asc" },
    select: {
      id: true,
      title: true,
      thumbnailKey: true,
      updatedAt: true,
      _count: { select: { files: true } },
    },
  }),
);

export const getWhiteboard = cache(async (id: string) => {
  const wb = await db.whiteboard.findUnique({
    where: { id },
    include: {
      files: { select: { id: true, fileId: true, mimeType: true } },
      project: { select: { slug: true, title: true } },
    },
  });
  if (!wb) notFound();
  return wb;
});

/**
 * Ulohy a sucastky pre bocny panel "Prepojit" a pre farebnu synchronizaciu
 * kariet na mape. Decimal ceny -> string kvoli hranici Server/Client.
 */
export const getWhiteboardLinkData = cache(async (projectId: string) => {
  const [tasks, parts] = await Promise.all([
    db.task.findMany({
      where: { projectId },
      orderBy: [{ status: "asc" }, { order: "asc" }],
      select: { id: true, title: true, status: true, priority: true, dueDate: true },
    }),
    db.part.findMany({
      where: { projectId },
      orderBy: [{ category: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        category: true,
        quantity: true,
        unitPrice: true,
        acquired: true,
      },
    }),
  ]);

  return {
    tasks: tasks.map((t) => ({
      ...t,
      dueDate: t.dueDate ? t.dueDate.toISOString() : null,
    })),
    parts: parts.map((p) => ({
      ...p,
      unitPrice: p.unitPrice?.toString() ?? null,
    })),
  };
});

export type WhiteboardLinkData = Awaited<ReturnType<typeof getWhiteboardLinkData>>;

/** Serializacia sucastok pre Client Components (Decimal -> string). */
export function serializeParts<
  T extends {
    unitPrice: Prisma.Decimal | null;
    voltage: Prisma.Decimal | null;
    currentMa: Prisma.Decimal | null;
  },
>(parts: T[]) {
  return parts.map((p) => ({
    ...p,
    unitPrice: p.unitPrice?.toString() ?? null,
    voltage: p.voltage?.toString() ?? null,
    currentMa: p.currentMa?.toString() ?? null,
  }));
}
