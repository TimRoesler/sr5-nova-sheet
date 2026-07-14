# AGENTS.md — Onboarding für AI-Agents

Foundry-v14-Modul (compatibility minimum 13): Neon-/Cyberpunk-Theming für alle Actor- und
Item-Sheets des `shadowrun5e`-Systems. **Ships raw** — kein Build-Schritt, `scripts/main.mjs`
wird direkt ausgeliefert.

## Architektur-Kurzüberblick

- `scripts/main.mjs` — Hook-Registrierung; seit v1.3.0 skinnt ein `renderDocumentSheetV2`-Hook
  alle Sheets (nicht nur bekannte Sheet-Klassen).
- `styles/` — seit v1.3.0 getrennt in Theme-CSS und Konsolen-CSS (Split beibehalten).
- `templates/`, `lang/`, `fonts/` — Handlebars-Partials, i18n (de/en), Schriftarten.

## Arbeitsworkflow (verbindlich)

1. Implementieren nur hier (`/home/foundryvtt/20_DEVELOPMENT/sr5-nova-sheet`)
2. Kein Build nötig; JS-Syntax prüfen: `node --check scripts/main.mjs`
3. Committen und pushen (`main`)
4. **Kein Self-Testing in Foundry, kein Deploy** — Tim testet selbst.
   Nach dem Push Bescheid geben, welche Sheets/Zustände zu prüfen sind.

## Release-Konventionen

- Version in `module.json` erhöhen, Tag **MIT `v`-Präfix** (`v1.3.0`).
- ZIP per Python bauen (kein `zip`-Binary auf dem Server), Ziel `release/sr5-nova-sheet.zip`;
  `release/` bleibt untracked.
- GitHub-Release mit Assets `module.json` + `sr5-nova-sheet.zip`
  (Download-URLs zeigen auf `releases/latest/download/…`).

## Leitplanken

- Entwicklung ausschließlich unter `/home/foundryvtt/20_DEVELOPMENT/`;
  `/home/foundryvtt/10_FOUNDRYVTT/` strikt read-only.
- Nur Optik/CSS/Sheet-Verhalten — keine Spieldaten-Mutationen aus diesem Modul.
