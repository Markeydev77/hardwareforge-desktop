/**
 * Predlohy novej mapy. Kazda vracia pole skeletonov pre
 * `convertToExcalidrawElements`. Cisto vizualne - ziadne prepojene karty.
 */

export type TemplateId = "blank" | "plan" | "wiring" | "enclosure" | "ideas";

export const TEMPLATES: { id: TemplateId; label: string; hint: string }[] = [
  { id: "blank", label: "Prázdna", hint: "Čistá tabuľa" },
  { id: "plan", label: "Plán projektu", hint: "Stĺpce Treba spraviť / Doladiť / Hotové" },
  { id: "wiring", label: "Schéma zapojenia", hint: "Napájanie · MCU · Periférie + legenda" },
  { id: "enclosure", label: "Mechanika / krabička", hint: "Nákres · Rozmery · Fotky z tlače" },
  { id: "ideas", label: "Nápady", hint: "Farebné lepíky na brainstorming" },
];

const FONT = 2; // FONT_FAMILY.Nunito

function frame(x: number, y: number, w: number, h: number, name: string) {
  return { type: "frame" as const, x, y, width: w, height: h, name, children: [] };
}

function heading(x: number, y: number, text: string, color = "#e8eaf0") {
  return {
    type: "text" as const,
    x,
    y,
    text,
    fontSize: 28,
    fontFamily: FONT,
    strokeColor: color,
  };
}

function note(x: number, y: number, text: string, bg: string) {
  return {
    type: "rectangle" as const,
    x,
    y,
    width: 200,
    height: 120,
    backgroundColor: bg,
    fillStyle: "solid" as const,
    strokeColor: "transparent",
    roughness: 0,
    roundness: { type: 3 as const },
    label: { text, fontSize: 16, fontFamily: FONT },
  };
}

export function templateElements(id: TemplateId): unknown[] {
  switch (id) {
    case "plan":
      return [
        heading(40, 20, "Plán projektu"),
        frame(40, 80, 320, 640, "Treba spraviť"),
        frame(400, 80, 320, 640, "Doladiť"),
        frame(760, 80, 320, 640, "Hotové"),
      ];

    case "wiring":
      return [
        heading(40, 20, "Schéma zapojenia"),
        frame(40, 80, 300, 300, "Napájanie"),
        frame(380, 80, 340, 420, "MCU"),
        frame(760, 80, 360, 560, "Periférie"),
        heading(40, 420, "Legenda vodičov", "#8b91a3"),
        { type: "text" as const, x: 40, y: 460, text: "🔴 +V   ⚫ GND   🟡 dáta   🔵 hodiny", fontSize: 16, fontFamily: FONT, strokeColor: "#8b91a3" },
      ];

    case "enclosure":
      return [
        heading(40, 20, "Mechanika / krabička"),
        frame(40, 80, 520, 520, "Nákres"),
        frame(600, 80, 300, 240, "Rozmery"),
        frame(600, 360, 300, 240, "Fotky z tlače"),
      ];

    case "ideas":
      return [
        heading(40, 20, "Nápady"),
        note(40, 90, "Nápad 1", "#fde68a"),
        note(280, 90, "Nápad 2", "#bbf7d0"),
        note(520, 90, "Nápad 3", "#bfdbfe"),
        note(160, 250, "Inšpirácia", "#fbcfe8"),
        note(400, 250, "Otázka?", "#fed7aa"),
      ];

    case "blank":
    default:
      return [];
  }
}
