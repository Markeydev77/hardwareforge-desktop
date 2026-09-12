# HardwareForge

Plánovanie hardvérových projektov — ESP32, Arduino, 3D tlač, elektronika.
**Zadarmo, open-source a úplne offline:** všetky projekty, súbory a mapy zostávajú
len na tvojom počítači. Appka sa nepripája na internet.

*Hardware project planner (ESP32, Arduino, 3D printing). Free, open-source and fully
offline — your data never leaves your computer. English summary below.*

## Čo vie

| Sekcia | Obsah |
|---|---|
| **Projekty** | Zoznam, vyhľadávanie (aj bez diakritiky), filtre, archív |
| **Doska** | Kanban s 5 stĺpcami, drag & drop |
| **Mapy** | Voľná tabuľa — kreslenie, obrázky, predlohy, prepojené úlohy a súčiastky. Export PNG/SVG/PDF |
| **Súčiastky** | Cena, počet, obchod, obrázok. Celková cena a odhad spotreby po napäťových vetvách |
| **Súbory** | PDF, STL, STEP, SVG, obrázky, ZIP, Fusion 360 — do 100 MB |
| **Odkazy, Poznámky** | Datasheety, GitHub, e-shopy; Markdown s checklistami a kódom |
| **Časová os** | História všetkých zmien |

Navyše export projektu do PDF, nákupný zoznam (CSV pre Excel), tmavý/svetlý režim.

## Inštalácia (Windows)

1. Stiahni `HardwareForge-Setup-x.y.z.exe` zo stránky [Releases](../../releases/latest).
2. Spusti ho. Inštalácia nepotrebuje administrátorské práva.
3. **Windows môže zobraziť „Windows chránil váš počítač“.** Je to preto, že inštalátor
   zatiaľ nie je podpísaný plateným certifikátom. Klikni na **Ďalšie informácie →
   Spustiť aj tak.**

Chceš si overiť, že súbor nikto nezmenil? Porovnaj jeho SHA-256 so súborom
`SHA256SUMS.txt` pri vydaní:

```powershell
Get-FileHash .\HardwareForge-Setup-0.1.0.exe -Algorithm SHA256
```

## Kde sú moje dáta

`%APPDATA%\HardwareForge\data\` — databáza (`hardwareforge.db`) a nahraté súbory (`files\`).
V appke: **Súbor → Otvoriť priečinok s dátami.**

- **Záloha:** Súbor → Zálohovať dáta… (jeden ZIP súbor). Odlož ho mimo počítača.
- **Obnova:** Súbor → Obnoviť zo zálohy… Súčasné dáta sa nemažú, presunú sa vedľa.
- **Pred každou aktualizáciou** si appka sama zálohuje databázu do `data\backups\`.
- **Odinštalovanie dáta nemaže.** Ak ich chceš zmazať, vymaž priečinok ručne.

## Aktualizácie

Appka sa nikdy sama nepripája na internet, preto ani nekontroluje nové verzie.
Novú verziu stiahni zo stránky Releases a nainštaluj cez starú — dáta zostanú.

## Súkromie a bezpečnosť

Žiadne účty, žiadna analytika, žiadne sledovanie. Podrobnosti v [SECURITY.md](SECURITY.md).

---

## English

- Download the installer from [Releases](../../releases/latest). If SmartScreen warns,
  click **More info → Run anyway** (the installer is not code-signed yet).
- Data lives in `%APPDATA%\HardwareForge\data\`. Use **File → Back up data…** regularly.
- The app never connects to the internet. Updates are manual.

## Vývoj / Development

```bash
npm install          # závislosti + Prisma klient + fonty editora
npm run dev          # appka v prehliadači na http://127.0.0.1:3000 (dáta v ./.data)
npm test             # unit + integračné testy
npm run electron     # appka v okne Electronu
npm run dist         # inštalátor do release/
```

Zmena databázy: uprav `prisma/schema.prisma`, potom `npm run db:migration -- nazov_zmeny`.
Appka novú migráciu aplikuje pri ďalšom štarte (predtým zálohuje databázu).

Licencia: [MIT](LICENSE).
