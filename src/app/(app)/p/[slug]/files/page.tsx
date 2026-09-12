import { getProject, getFiles } from "@/server/queries";
import { FilesPanel } from "./files-panel";

export default async function FilesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProject(slug);
  const files = await getFiles(project.id);

  return (
    <FilesPanel
      projectId={project.id}
      files={files.map((f) => ({
        id: f.id,
        name: f.name,
        url: `/api/files/file/${f.id}`,
        kind: f.kind,
        sizeBytes: f.sizeBytes,
        createdAt: f.createdAt.toISOString(),
      }))}
    />
  );
}
