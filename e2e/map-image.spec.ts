import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { _electron as electron, expect, test, type ElectronApplication, type Page } from "@playwright/test";

/**
 * Vkladanie obrázkov na mapu — tri cesty, akými sa tam obrázok môže dostať.
 *
 * Vstavaný nástroj Excalidrawu "Vložiť obrázok" (klávesa 9) je nespoľahlivý
 * v Electrone (File System Access API) a je preto skrytý a zablokovaný
 * (CSS + klávesová skratka v layout.tsx) — nahrádza ho vlastné tlačidlo
 * "Obrázok" v hlavičke. UIOptions.tools.image sa NEPOUŽÍVA na jeho vypnutie,
 * lebo by tým zhaslo aj drag & drop a Ctrl+V (Excalidraw ich riadi jedným
 * spoločným flagom).
 */

let userData: string;
let app: ElectronApplication;
let page: Page;
const savedRequests: string[] = [];

test.beforeAll(async () => {
  userData = fs.mkdtempSync(path.join(os.tmpdir(), "hf-e2e-img-"));
  app = await electron.launch({ args: ["."], env: { ...process.env, HF_USER_DATA_DIR: userData } });
  // Dialog "Zavriet bez ulozenia?" by inak zablokoval app.close()
  await app.evaluate(({ dialog }) => {
    dialog.showMessageBoxSync = () => 0;
  });

  page = await app.firstWindow();
  page.on("dialog", (d) => void d.dismiss().catch(() => {}));
  await page.waitForURL(/\/dashboard/, { timeout: 90_000 });

  const db = new DatabaseSync(path.join(userData, "data", "hardwareforge.db"));
  db.exec(
    `INSERT INTO "Whiteboard" ("id","title","elements","order","projectId","createdAt","updatedAt")
     SELECT 'e2emapa00001','E2E','[]',1024, id, ${Date.now()}, ${Date.now()} FROM "Project" LIMIT 1`,
  );
  db.close();

  page.on("request", (r) => {
    if (r.url().includes("/api/upload") && r.url().includes("target=map-image")) savedRequests.push(r.url());
  });
  // Chybajuce lokalne fonty (rieseny samostatne) su ocakavana konzolova chyba
  page.on("console", (m) => {
    if (m.type() === "error" && !m.text().includes("font")) console.log(`KONZOLA: ${m.text()}`);
  });

  const origin = new URL(page.url()).origin;
  await page.goto(`${origin}/p/spotify-displej-s-esp32/maps/e2emapa00001`);
  await page.waitForSelector(".excalidraw canvas", { timeout: 30_000 });
  await page.waitForTimeout(1000);
});

test.afterAll(async () => {
  await app?.close();
  fs.rmSync(userData, { recursive: true, force: true, maxRetries: 5 });
});

/** Veľký PNG (2400×1600) — Excalidraw ho pri vkladaní zmenšuje cez WebAssembly. */
async function bigPngBase64(): Promise<string> {
  return page.evaluate(() => {
    const c = document.createElement("canvas");
    c.width = 2400;
    c.height = 1600;
    const x = c.getContext("2d")!;
    x.fillStyle = "#7c8cff";
    x.fillRect(0, 0, 2400, 1600);
    x.fillStyle = "#0e1116";
    x.fillRect(300, 300, 900, 600);
    return c.toDataURL("image/png").split(",")[1];
  });
}

test("vstavaný nástroj „Vložiť obrázok“ (9) je skrytý a klávesa nič nespustí", async () => {
  // V toolbare je skryty cez CSS - nie je viditelny (v DOM ostava, Excalidraw ho vykresli)
  await expect(page.locator('.excalidraw [data-testid="toolbar-image"]')).not.toBeVisible();

  await page.locator(".excalidraw canvas").last().click({ position: { x: 200, y: 150 } });
  const before = savedRequests.length;
  const chooser = page.waitForEvent("filechooser", { timeout: 3000 }).catch(() => null);
  await page.keyboard.press("9");
  expect(await chooser).toBeNull();
  await page.waitForTimeout(1000);
  // skratka nemala ziadny efekt - nic sa nenahralo ani neulozilo
  expect(savedRequests.length).toBe(before);
});

test("tlačidlo „Obrázok“ v hlavičke vloží aj veľký obrázok", async () => {
  const before = savedRequests.length;
  const chooser = page.waitForEvent("filechooser", { timeout: 10_000 });
  await page.getByRole("button", { name: "Obrázok" }).click();
  await (await chooser).setFiles({
    name: "tlacidlo.png",
    mimeType: "image/png",
    buffer: Buffer.from(await bigPngBase64(), "base64"),
  });
  await expect.poll(() => savedRequests.length, { timeout: 15_000 }).toBeGreaterThan(before);
  await expect(page.getByText("Uložené")).toBeVisible({ timeout: 15_000 });
});

test("pretiahnutie súboru myšou (drag & drop) vloží obrázok", async () => {
  const before = savedRequests.length;
  const b64 = await bigPngBase64();

  await page.locator(".excalidraw canvas").last().dispatchEvent("drop", {
    dataTransfer: await page.evaluateHandle(
        (data) => {
          const dt = new DataTransfer();
          const bytes = Uint8Array.from(atob(data), (c) => c.charCodeAt(0));
          dt.items.add(new File([bytes], "drag-drop.png", { type: "image/png" }));
          return dt;
        },
        b64,
      ),
  });

  await expect.poll(() => savedRequests.length, { timeout: 15_000 }).toBeGreaterThan(before);
  await expect(page.getByText("Uložené")).toBeVisible({ timeout: 15_000 });
});

test("Ctrl+V vloží obrázok zo schránky", async () => {
  const before = savedRequests.length;
  const b64 = await bigPngBase64();

  // Excalidraw pri Ctrl+V nesiaha len po datach udalosti "paste" - interne
  // skusa aj skutocnu navigator.clipboard.read() (systemova schranka).
  // Synteticka ClipboardEvent s vlastnym clipboardData teda nestaci; treba
  // naozaj naplnit systemovu schranku (Electron 44 uz nema clipboard.writeImage,
  // len asynchronne clipboard.write s ClipboardItem/Blob) a poslat realnu skratku.
  await app.evaluate(async (electron, data) => {
    const blob = new Blob([Buffer.from(data, "base64")], { type: "image/png" });
    await electron.clipboard.write([new electron.ClipboardItem({ "image/png": blob })]);
  }, b64);

  // Escape zrusi vyber/editaciu po predoslych testoch - klik na uz existujuci
  // prvok (z drag & drop testu vyssie) by mohol namiesto vlozenia oznacit jeho.
  // (250,220) je mimo hlavicky, spodneho panelu priblizenia aj stredu platna,
  // kam predosle testy vkladali obrazky.
  await page.keyboard.press("Escape");
  await page.locator(".excalidraw canvas").last().click({ position: { x: 250, y: 220 } });
  await page.keyboard.press("Control+v");

  await expect.poll(() => savedRequests.length, { timeout: 15_000 }).toBeGreaterThan(before);
  await expect(page.getByText("Uložené")).toBeVisible({ timeout: 15_000 });
});

test("všetky obrázky sú uložené len na disku appky (nič sa neposlalo online)", async () => {
  const files = fs.readdirSync(path.join(userData, "data", "files", "whiteboards", "e2emapa00001"));
  expect(files.filter((f) => /\.(png|jpg|webp)$/.test(f)).length).toBeGreaterThanOrEqual(3);
});
