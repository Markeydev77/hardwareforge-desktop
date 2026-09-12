import type { Prisma, ActivityType } from "@/generated/prisma/client";

/**
 * Zapis do casovej osi.
 *
 * Vzdy sa vola s transakcnym klientom z tej istej mutacie - ked mutacia
 * zlyha, zaznam nevznikne a naopak. Casova os sa tak nemoze rozist s realitou.
 *
 * Zaroven posunie project.updatedAt, takze projekt "vyskoci" na dashboarde hore.
 */
export async function logActivity(
  tx: Prisma.TransactionClient,
  projectId: string,
  type: ActivityType,
  message: string,
) {
  await tx.activityLog.create({ data: { projectId, type, message } });
  await tx.project.update({
    where: { id: projectId },
    data: { updatedAt: new Date() },
  });
}
