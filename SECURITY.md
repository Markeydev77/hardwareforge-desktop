# Bezpečnosť / Security

## Nahlásenie zraniteľnosti

Ak nájdeš bezpečnostnú chybu, **nezakladaj verejné issue**. Použi
[súkromné nahlásenie zraniteľnosti](../../security/advisories/new) na GitHube.
Odpoveď do 7 dní.

If you find a security issue, please **do not open a public issue** — use
GitHub's [private vulnerability reporting](../../security/advisories/new).

## Ako je appka chránená

| Oblasť | Opatrenie |
|---|---|
| Sieť | Okno appky zruší každý request mimo lokálneho servera — appka sa nepripája na internet (ani kvôli aktualizáciám). |
| Lokálny server | Počúva len na `127.0.0.1` na náhodnom porte. Každý request musí mať tajný token (nový pri každom spustení, len v pamäti), správny `Host` (ochrana proti DNS rebinding) a `Origin` (ochrana proti CSRF z webstránok). |
| Okno | `contextIsolation`, `sandbox`, bez `nodeIntegration`, prísna CSP, zakázaná navigácia mimo appky, žiadne oprávnenia okrem celej obrazovky a kopírovania. |
| Súbory | Na disku sa ukladajú pod náhodným názvom — meno od používateľa sa do cesty nedostane. Servujú sa podľa ID z databázy s `nosniff`; SVG v sandboxe (bez skriptov). |
| Zálohy | Obnova overí každú cestu v ZIP-e (zip slip), limit veľkosti, integritu databázy; staré dáta sa presunú, nemažú. |
| Binárka | Electron Fuses: vypnuté `RunAsNode`, `NODE_OPTIONS`, `--inspect`; overovanie integrity ASAR. |
| Závislosti | Dependabot, CodeQL, `npm audit` v CI; inštalačné skripty balíkov povolené len pre schválený zoznam (`allowScripts`). |

## Podporované verzie

Opravy dostáva vždy len najnovšia verzia.
