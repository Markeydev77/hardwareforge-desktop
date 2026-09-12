import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { getProject, serializeParts } from "@/server/queries";
import { ProjectReport } from "@/components/project-report";
import { PrintTrigger } from "./print-trigger";

/**
 * Export do PDF cez tlac prehliadaca.
 *
 * Zamerne bez @react-pdf/renderer: ten ma vlastny layout systém (nie CSS),
 * co znamena duplicitne vykreslenie celeho reportu. Takto sa pouziva
 * rovnaky komponent ako pre verejny pohlad a @media print v globals.css.
 */
export default async function PrintPage({ params }: { params: Promise<{ slug: string }> }) {
  await requireAuth();
  const { slug } = await params;
  const project = await getProject(slug);

  const [tasks, parts, links, notes] = await Promise.all([
    db.task.findMany({
      where: { projectId: project.id },
      orderBy: [{ status: "asc" }, { order: "asc" }],
      select: { id: true, title: true, status: true },
    }),
    db.part.findMany({
      where: { projectId: project.id },
      orderBy: [{ category: "asc" }, { name: "asc" }],
    }),
    db.link.findMany({
      where: { projectId: project.id },
      select: { id: true, title: true, url: true, type: true },
    }),
    db.note.findMany({
      where: { projectId: project.id },
      orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }],
      select: { id: true, title: true, content: true },
    }),
  ]);

  return (
    <>
      <PrintTrigger name={project.slug} />
      <ProjectReport
        data={{
          title: project.title,
          description: project.description,
          category: project.category,
          status: project.status,
          priority: project.priority,
          createdAt: project.createdAt,
          dueDate: project.dueDate,
          tasks,
          parts: serializeParts(parts),
          links,
          notes,
        }}
      />
    </>
  );
}
