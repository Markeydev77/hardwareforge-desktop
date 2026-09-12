import { getProject, getNotes } from "@/server/queries";
import { NotesPanel } from "./notes-panel";

export default async function NotesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProject(slug);
  const notes = await getNotes(project.id);

  return (
    <NotesPanel
      projectId={project.id}
      notes={notes.map((n) => ({
        id: n.id,
        title: n.title,
        content: n.content,
        pinned: n.pinned,
        updatedAt: n.updatedAt.toISOString(),
      }))}
    />
  );
}
