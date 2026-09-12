import { db } from "./db";

/**
 * Ukazkovy projekt pri prvom spusteni, aby appka nebola prazdna.
 * Vola sa len pre uplne novu databazu (instrumentation.ts) - ked si ho
 * pouzivatel zmaze, uz sa nevrati.
 */
export async function seedDemoProject() {
  const slug = "spotify-displej-s-esp32";
  if (await db.project.findUnique({ where: { slug } })) return;

  const project = await db.project.create({
    data: {
      slug,
      title: "Spotify displej s ESP32",
      description:
        "Ukážkový projekt — pokojne ho zmaž. Displej ukazujúci aktuálne prehrávanú skladbu zo Spotify: ESP32 sa pripája na Wi-Fi, ťahá dáta z Web API a vykresľuje ich na TFT displej v 3D tlačenej krabičke.",
      category: "ESP32",
      status: "DEVELOPMENT",
      priority: "HIGH",
      color: "#34d399",
    },
  });

  await db.task.createMany({
    data: [
      { projectId: project.id, title: "Naštudovať Spotify Web API", status: "DONE", priority: "MEDIUM", order: 1024, completedAt: new Date() },
      { projectId: project.id, title: "Objednať displej ILI9341", status: "DONE", priority: "HIGH", order: 2048, completedAt: new Date() },
      { projectId: project.id, title: "Zapojiť displej na ESP32", status: "IN_PROGRESS", priority: "HIGH", order: 1024 },
      { projectId: project.id, title: "Spájkovanie konektorov", status: "IN_PROGRESS", priority: "CRITICAL", order: 2048 },
      { projectId: project.id, title: "Čakám na zásielku z AliExpressu", status: "WAITING", priority: "LOW", order: 1024 },
      { projectId: project.id, title: "Otestovať obnovovanie tokenu", status: "TESTING", priority: "MEDIUM", order: 1024 },
      { projectId: project.id, title: "Navrhnúť krabičku vo Fusione", status: "TODO", priority: "MEDIUM", order: 1024 },
      { projectId: project.id, title: "Vytlačiť krabičku", status: "TODO", priority: "LOW", order: 2048 },
    ],
  });

  await db.part.createMany({
    data: [
      { projectId: project.id, name: "ESP32-WROOM-32", category: "MCU", partNumber: "ESP32-WROOM-32E", quantity: 1, unitPrice: "4.20", voltage: "5", currentMa: "240", acquired: true, shopUrl: "https://www.aliexpress.com/" },
      { projectId: project.id, name: "TFT displej 2,8\" ILI9341", category: "DISPLAY", partNumber: "ILI9341", quantity: 1, unitPrice: "8.90", voltage: "3.3", currentMa: "90", acquired: true },
      { projectId: project.id, name: "WS2812B pásik 1 m / 60 LED", category: "LED", quantity: 2, unitPrice: "6.50", voltage: "5", currentMa: "900" },
      { projectId: project.id, name: "Napájací zdroj 5 V / 3 A", category: "POWER", quantity: 1, unitPrice: "7.90" },
      { projectId: project.id, name: "Filament PETG čierny 1 kg", category: "MECHANICAL", quantity: 1, unitPrice: "19.90" },
      { projectId: project.id, name: "Dupont káble 20 cm", category: "CABLE", quantity: 1, unitPrice: "2.40", acquired: true },
    ],
  });

  await db.link.createMany({
    data: [
      { projectId: project.id, title: "Spotify Web API — dokumentácia", url: "https://developer.spotify.com/documentation/web-api", type: "DOCS" },
      { projectId: project.id, title: "TFT_eSPI knižnica", url: "https://github.com/Bodmer/TFT_eSPI", type: "GITHUB" },
      { projectId: project.id, title: "ILI9341 datasheet", url: "https://cdn-shop.adafruit.com/datasheets/ILI9341.pdf", type: "DATASHEET" },
    ],
  });

  await db.note.create({
    data: {
      projectId: project.id,
      title: "Zapojenie pinov",
      pinned: true,
      content: `# Zapojenie ILI9341 -> ESP32

| Displej | ESP32   |
|---------|---------|
| VCC     | 3V3     |
| GND     | GND     |
| CS      | GPIO 15 |
| RESET   | GPIO 4  |
| DC      | GPIO 2  |
| MOSI    | GPIO 23 |
| SCK     | GPIO 18 |
| LED     | 3V3     |

## Checklist pred spájkovaním

- [x] Skontrolovať polaritu napájania
- [ ] Otestovať na nepájivom poli
- [ ] Skrátiť káble na mieru

\`\`\`cpp
#include <TFT_eSPI.h>

TFT_eSPI tft = TFT_eSPI();

void setup() {
  tft.init();
  tft.setRotation(1);
  tft.fillScreen(TFT_BLACK);
}
\`\`\`

> Pozor: LED pásiky ťahajú pri plnom jase výrazne viac, než hovorí odhad —
> počítaj s ~60 mA na LED pri bielej.
`,
    },
  });

  await db.activityLog.create({
    data: {
      projectId: project.id,
      type: "PROJECT_CREATED",
      message: "Vytvorený projekt „Spotify displej s ESP32“",
    },
  });
}
