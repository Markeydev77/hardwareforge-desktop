import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  listStoredKeys,
  mimeForKey,
  newKey,
  openRead,
  removeKeys,
  resolveKey,
  safeExt,
  saveBuffer,
  saveStream,
  TooLargeError,
} from "./storage";

let tmp: string;

beforeAll(() => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), "hf-storage-"));
  process.env.HF_DATA_DIR = tmp;
});
afterAll(() => {
  fs.rmSync(tmp, { recursive: true, force: true });
  delete process.env.HF_DATA_DIR;
});

function streamOf(bytes: number): ReadableStream<Uint8Array> {
  const chunk = new Uint8Array(64 * 1024);
  let left = bytes;
  return new ReadableStream({
    pull(controller) {
      if (left <= 0) return controller.close();
      const n = Math.min(left, chunk.length);
      controller.enqueue(chunk.subarray(0, n));
      left -= n;
    },
  });
}

describe("safeExt", () => {
  it("vráti bezpečnú príponu alebo bin", () => {
    expect(safeExt("krabicka_v3.STL")).toBe("stl");
    expect(safeExt("model.f3d")).toBe("f3d");
    expect(safeExt("bez-pripony")).toBe("bin");
    expect(safeExt(".bashrc")).toBe("bin");
    expect(safeExt("zle.p<h>p")).toBe("bin");
    expect(safeExt("dlha.abcdefghijk")).toBe("bin");
  });
});

describe("newKey", () => {
  it("vytvorí náhodný kľúč v priečinku", () => {
    const key = newKey(["projects", "abc123"], "stl");
    expect(key).toMatch(/^projects\/abc123\/[0-9a-f-]{36}\.stl$/);
    expect(newKey(["parts"], "png")).not.toBe(newKey(["parts"], "png"));
  });

  it("odmietne podvrhnutý priečinok alebo príponu", () => {
    expect(() => newKey(["..", "x"], "stl")).toThrow();
    expect(() => newKey(["projects/../x"], "stl")).toThrow();
    expect(() => newKey([], "stl")).toThrow();
    expect(() => newKey(["parts"], "../exe")).toThrow();
  });
});

describe("resolveKey", () => {
  it("nepustí cestu mimo úložiska (path traversal)", () => {
    const root = path.join(tmp, "files");
    expect(() => resolveKey("../hardwareforge.db", root)).toThrow();
    expect(() => resolveKey("parts/../../x", root)).toThrow();
    expect(() => resolveKey("C:\\Windows\\win.ini", root)).toThrow();
    expect(() => resolveKey("", root)).toThrow();
    expect(resolveKey("parts/a.png", root)).toBe(path.join(root, "parts", "a.png"));
  });
});

describe("mimeForKey", () => {
  it("povolí inline len obrázky a PDF", () => {
    expect(mimeForKey("x/a.png")).toBe("image/png");
    expect(mimeForKey("x/a.pdf")).toBe("application/pdf");
    expect(mimeForKey("x/a.html")).toBeNull();
    expect(mimeForKey("x/a.stl")).toBeNull();
  });
});

describe("saveStream / openRead / removeKeys", () => {
  it("uloží, prečíta a zmaže súbor", async () => {
    const key = newKey(["projects", "p1"], "bin");
    const size = await saveStream(key, streamOf(200_000));
    expect(size).toBe(200_000);

    const file = await openRead(key);
    expect(file?.size).toBe(200_000);
    await file?.stream.cancel();

    await removeKeys([key]);
    expect(await openRead(key)).toBeNull();
  });

  it("preruší zápis nad limit a nenechá po sebe súbor", async () => {
    const key = newKey(["projects", "p2"], "bin");
    await expect(saveStream(key, streamOf(300_000), 100_000)).rejects.toBeInstanceOf(TooLargeError);
    expect(await openRead(key)).toBeNull();
    const leftovers = (await listStoredKeys()).filter((k) => k.key.startsWith("projects/p2/"));
    expect(leftovers).toEqual([]);
  });

  it("zápis je atomický (tmp + premenovanie)", async () => {
    const key = newKey(["parts"], "png");
    await saveBuffer(key, new Uint8Array([1, 2, 3]));
    await expect(saveBuffer(key, new Uint8Array([4]))).resolves.toBeUndefined();
    // druhy zapis prepise az rename - obsah musi byt novy a kompletny
    const file = await openRead(key);
    expect(file?.size).toBe(1);
    await file?.stream.cancel();
  });

  it("openRead odmietne podvrhnutý kľúč", async () => {
    expect(await openRead("../hardwareforge.db")).toBeNull();
  });
});
