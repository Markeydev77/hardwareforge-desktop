import { getProject, getLinks } from "@/server/queries";
import { LinksPanel } from "./links-panel";

export default async function LinksPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProject(slug);
  const links = await getLinks(project.id);

  return (
    <LinksPanel
      projectId={project.id}
      links={links.map((l) => ({
        id: l.id,
        url: l.url,
        title: l.title,
        type: l.type,
        notes: l.notes,
      }))}
    />
  );
}
