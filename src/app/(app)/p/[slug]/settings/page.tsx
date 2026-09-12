import { getProject } from "@/server/queries";
import { SettingsPanel } from "./settings-panel";

export default async function SettingsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProject(slug);

  return (
    <SettingsPanel
      project={{
        id: project.id,
        slug: project.slug,
        title: project.title,
        description: project.description,
        category: project.category,
        status: project.status,
        priority: project.priority,
        color: project.color,
        dueDate: project.dueDate ? project.dueDate.toISOString().slice(0, 10) : "",
        archived: Boolean(project.archivedAt),
      }}
    />
  );
}
