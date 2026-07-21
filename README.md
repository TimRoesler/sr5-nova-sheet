# SR5 Nova Sheet

Ein alternativer, aufgeräumter Neon-Charakterbogen (AR-Overlay-Look) für das
Shadowrun-5e-System in Foundry VTT — voller Funktionsumfang des Systembogens in neuem Gewand.

## Funktionen

- Alternativer Charakterbogen im Neon-/AR-Overlay-Look (Cyberdeck-Konsole)
- Voller Funktionsumfang des System-Charakterbogens
- Wählbarer Nova-**Cyberdeck-Bogen** für **alle** Actor-Typen: Character,
  Vehicle/Drohne, Spirit, Sprite und IC — jeweils mit typgerechtem Konsolen-Header
  (Drohne: Handling/Speed/Pilot/Body/Panzerung, Geist: Force, Sprite: Level,
  IC: Rating). Der System-Bogen bleibt unangetastet und weiterhin wählbar.
- Neon-Look zusätzlich automatisch auf **allen** Sheets (auch Item-Sheets) über
  den `renderDocumentSheetV2`-Hook
- Nahtlos für das Shadowrun-5e-System

## Installation

Manifest-URL in Foundry unter *Add-on-Module → Modul installieren* eintragen:

```text
https://github.com/TimRoesler/sr5-nova-sheet/releases/latest/download/module.json
```

Voraussetzungen: das System **Shadowrun 5th Edition** (ab 0.36.0).

## Kompatibilität

| Komponente | Anforderung |
|---|---|
| Foundry VTT | v13–v14 (verifiziert: 14.364) |
| Spielsystem | shadowrun5e (ab 0.36.0) |
| Modulversion | 1.4.0 |

## Entwicklung

Reines CSS-/JavaScript-Modul ohne Build-Schritt. Zum Mitwirken das Repository klonen und den
Ordner nach `Data/modules/sr5-nova-sheet` verlinken oder kopieren.

## Herkunft & Credits

Entwickelt von TRO für den Eigenbetrieb.

## Lizenz & Markenhinweis

MIT-Lizenz, siehe [LICENSE](LICENSE). **Shadowrun** ist eine eingetragene Marke von
The Topps Company, Inc. Dieses nichtkommerzielle Fanprojekt steht in keiner Verbindung zu
The Topps Company, Inc. oder Catalyst Game Labs.
