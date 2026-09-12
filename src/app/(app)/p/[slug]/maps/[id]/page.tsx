import { getWhiteboard, getWhiteboardLinkData } from "@/server/queries";
import { WhiteboardEditor } from "./whiteboard-editor";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const wb = await getWhiteboard(id);
  return { title: `${wb.title} — ${wb.project.title}` };
}

export default async function MapEditorPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; id: string }>;
  searchParams: Promise<{ template?: string }>;
}) {
  const { slug, id } = await params;
  const { template } = await searchParams;
  const wb = await getWhiteboard(id);
  const linkData = await getWhiteboardLinkData(wb.projectId);

  return (
    <WhiteboardEditor
      slug={slug}
      whiteboard={{
        id: wb.id,
        title: wb.title,
        elements: (wb.elements as unknown[]) ?? [],
        appState: (wb.appState as Record<string, unknown> | null) ?? null,
        files: wb.files.map((f) => ({
          fileId: f.fileId,
          mimeType: f.mimeType,
          url: `/api/files/map-image/${f.id}`,
        })),
      }}
      template={template ?? null}
      linkData={linkData}
    />
  );
}
