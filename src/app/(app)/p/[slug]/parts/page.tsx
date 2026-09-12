import { getProject, getParts, serializeParts } from "@/server/queries";
import { PartsTable } from "./parts-table";

export default async function PartsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProject(slug);
  const parts = await getParts(project.id);

  // Decimal -> string, inak by data neprešli do Client Componentu
  const serialized = serializeParts(parts).map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    imageUrl: p.imageKey ? `/api/files/part-image/${p.id}?v=${p.updatedAt.getTime()}` : null,
    quantity: p.quantity,
    unitPrice: p.unitPrice,
    voltage: p.voltage,
    currentMa: p.currentMa,
    shopUrl: p.shopUrl,
    partNumber: p.partNumber,
    notes: p.notes,
    acquired: p.acquired,
  }));

  return <PartsTable projectId={project.id} parts={serialized} />;
}
