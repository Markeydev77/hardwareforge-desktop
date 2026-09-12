import { getProject, getWhiteboards } from "@/server/queries";
import { MapsList } from "./maps-list";

export default async function MapsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProject(slug);
  const boards = await getWhiteboards(project.id);

  return (
    <MapsList
      projectId={project.id}
      slug={slug}
      boards={boards.map((b) => ({
        id: b.id,
        title: b.title,
        // ?v= - nahlad sa prepisuje pod rovnakou URL, verzia obide cache okna
        thumbnailUrl: b.thumbnailKey
          ? `/api/files/map-thumb/${b.id}?v=${b.updatedAt.getTime()}`
          : null,
        updatedAt: b.updatedAt.toISOString(),
        fileCount: b._count.files,
      }))}
    />
  );
}
