import { getProject, getTasks } from "@/server/queries";
import { KanbanBoard } from "./kanban-board";

export default async function BoardPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProject(slug);
  const tasks = await getTasks(project.id);

  // Date -> string, aby data presli do Client Componentu
  const serialized = tasks.map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    status: t.status,
    priority: t.priority,
    order: t.order,
    dueDate: t.dueDate ? t.dueDate.toISOString() : null,
  }));

  return <KanbanBoard projectId={project.id} tasks={serialized} />;
}
