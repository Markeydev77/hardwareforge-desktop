import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { _electron as electron, expect, test, type ElectronApplication, type Page } from "@playwright/test";

/**
 * E2E: skutocna appka v Electrone s docasnym priecinkom dat.
 * Overuje funkcnost aj bezpecnostne slub "nic nejde von, nic nepride zvnutra".
 */

let app: ElectronApplication;
let page: Page;
let userData: string;

test.beforeAll(async () => {
  userData = fs.mkdtempSync(path.join(os.tmpdir(), "hf-e2e-"));
  app = await electron.launch({
    args: ["."],
    cwd: process.cwd(),
    env: { ...process.env, HF_USER_DATA_DIR: userData },
  });
  page = await app.firstWindow();
  await page.waitForURL(/\/dashboard/, { timeout: 90_000 });
});

test.afterAll(async () => {
  await app?.close();
  fs.rmSync(userData, { recursive: true, force: true, maxRetries: 5 });
});

test("appka sa spustí s ukážkovým projektom", async () => {
  await expect(page.getByRole("heading", { name: "Projekty" })).toBeVisible();
  await expect(page.getByText("Spotify displej s ESP32")).toBeVisible();
  expect(fs.existsSync(path.join(userData, "data", "hardwareforge.db"))).toBe(true);
});

test("okno sa nedostane na internet", async () => {
  const result = await page.evaluate(async () => {
    try {
      await fetch("https://example.com/", { mode: "no-cors" });
      return "prešlo";
    } catch {
      return "zablokované";
    }
  });
  expect(result).toBe("zablokované");
});

test("server odmietne request bez tokenu (iný program / webstránka)", async () => {
  const origin = new URL(page.url()).origin;
  const noToken = await fetch(`${origin}/dashboard`);
  expect(noToken.status).toBe(403);

  const wrongToken = await fetch(`${origin}/api/health`, { headers: { cookie: "hf_token=zly" } });
  expect(wrongToken.status).toBe(403);

  const upload = await fetch(`${origin}/api/upload?target=project&projectId=x&name=a.txt`, {
    method: "POST",
    body: "x",
  });
  expect(upload.status).toBe(403);
});

test("externý odkaz neotvorí nové okno appky, ale systémový prehliadač", async () => {
  // Zachytit volanie namiesto skutocneho otvorenia prehliadaca pocas testu
  await app.evaluate(({ shell }) => {
    const opened: string[] = [];
    (globalThis as unknown as { __opened: string[] }).__opened = opened;
    shell.openExternal = async (url: string) => {
      opened.push(url);
    };
  });
  await page.evaluate(() => window.open("https://example.com/", "_blank"));
  await page.evaluate(() => window.open("file:///C:/Windows/System32/calc.exe", "_blank"));
  await page.waitForTimeout(500);

  const opened = await app.evaluate(() => (globalThis as unknown as { __opened: string[] }).__opened);
  expect(opened).toEqual(["https://example.com/"]);
  expect(app.windows()).toHaveLength(1);
  expect(new URL(page.url()).hostname).toBe("127.0.0.1");
});

test("preload vystaví len povolené funkcie, žiadny Node", async () => {
  const exposed = await page.evaluate(() => ({
    hf: Object.keys((window as unknown as { hf: object }).hf).sort(),
    require: typeof (window as unknown as { require?: unknown }).require,
    process: typeof (window as unknown as { process?: unknown }).process,
  }));
  expect(exposed.hf).toEqual(
    ["backup", "imageToPdf", "isDesktop", "openDataFolder", "openExternal", "restore", "savePdf"].sort(),
  );
  expect(exposed.require).toBe("undefined");
  expect(exposed.process).toBe("undefined");
});

test("Kanban, súčiastky a mapa sa načítajú", async () => {
  await page.getByText("Spotify displej s ESP32").click();
  await page.waitForURL(/\/p\/spotify-displej-s-esp32/);

  await page.goto(page.url().replace(/\/p\/.*/, "/p/spotify-displej-s-esp32/board"));
  await expect(page.getByText("Zapojiť displej na ESP32")).toBeVisible();

  await page.goto(page.url().replace(/\/board$/, "/parts"));
  await expect(page.getByText("ESP32-WROOM-32").first()).toBeVisible();
});
