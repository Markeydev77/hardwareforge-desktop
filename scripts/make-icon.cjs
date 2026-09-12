// Vyrenderuje ikonu appky (SVG -> PNG 512x512) do build/icon.png.
// electron-builder z nej vyrobi .ico pre Windows.
//
//   npx electron scripts/make-icon.cjs
/* eslint-disable @typescript-eslint/no-require-imports -- Electron spusta CommonJS subor priamo */
const { app, BrowserWindow } = require("electron");
const fs = require("node:fs");
const path = require("node:path");

const SIZE = 512;
// Motiv: doska plosneho spoja (cipsak) na tmavom zaoblenom stvorci, akcent #7c8cff
const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="${SIZE}" height="${SIZE}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#1a1f2b"/>
      <stop offset="1" stop-color="#0e1116"/>
    </linearGradient>
  </defs>
  <rect x="16" y="16" width="480" height="480" rx="108" fill="url(#bg)"/>
  <rect x="16" y="16" width="480" height="480" rx="108" fill="none" stroke="#2a3142" stroke-width="4"/>
  <g stroke="#7c8cff" stroke-width="22" stroke-linecap="round" fill="none">
    <path d="M176 120v56M256 120v56M336 120v56"/>
    <path d="M176 336v56M256 336v56M336 336v56"/>
    <path d="M120 176h56M120 256h56M120 336h56"/>
    <path d="M336 176h56M336 256h56M336 336h56"/>
  </g>
  <rect x="160" y="160" width="192" height="192" rx="28" fill="#7c8cff"/>
  <path d="M214 214h84v84h-84z" fill="none" stroke="#0e1116" stroke-width="20" stroke-linejoin="round"/>
</svg>`;

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    width: SIZE,
    height: SIZE,
    show: false,
    frame: false,
    transparent: true,
    webPreferences: { offscreen: true, javascript: false, sandbox: true },
  });
  const html = `<html><body style="margin:0;background:transparent">${svg}</body></html>`;
  await win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
  await new Promise((r) => setTimeout(r, 300));
  const image = await win.webContents.capturePage({ x: 0, y: 0, width: SIZE, height: SIZE });
  const out = path.join(__dirname, "..", "build", "icon.png");
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, image.resize({ width: SIZE, height: SIZE }).toPNG());
  console.log(`Ikona ulozena: ${out}`);
  app.quit();
});
