import { db } from "./db";
import { listStoredKeys, removeKeys } from "./storage";

/**
 * Upratanie osirelych suborov - su na disku, ale ziadny zaznam v DB na ne
 * neukazuje (zlyhane mazanie, pad pocas nahravania, nedokoncene .part).
 *
 * Subory mladsie ako hodina sa nechavaju: mohli sa prave nahravat a zaznam
 * v DB este len vznika.
 */
const GRACE_MS = 60 * 60 * 1000;

export async function cleanupOrphans(now = Date.now()): Promise<number> {
  const [files, boardFiles, boards, parts] = await Promise.all([
    db.fileAsset.findMany({ select: { storageKey: true } }),
    db.whiteboardFile.findMany({ select: { storageKey: true } }),
    db.whiteboard.findMany({ select: { thumbnailKey: true } }),
    db.part.findMany({ select: { imageKey: true } }),
  ]);

  const known = new Set<string>(
    [
      ...files.map((f) => f.storageKey),
      ...boardFiles.map((f) => f.storageKey),
      ...boards.map((b) => b.thumbnailKey),
      ...parts.map((p) => p.imageKey),
    ].filter((k): k is string => Boolean(k)),
  );

  const orphans = (await listStoredKeys())
    .filter((s) => !known.has(s.key) && now - s.mtimeMs > GRACE_MS)
    .map((s) => s.key);

  if (orphans.length) await removeKeys(orphans);
  return orphans.length;
}
