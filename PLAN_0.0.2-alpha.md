# Plan 0.0.2-alpha – LCWebGL Erweiterung

## Zielzustand
- Mehrere Szenen/Assets wählbar; Metadaten zu jeder Szene werden angezeigt.
- Mock-API (statisches JSON) liefert Szeneninformationen, um später echte Services anzubinden.
- Werkzeugfunktionen: Screenshot-Export und erweiterte Performance-Anzeige (FPS + Canvas-Auflösung).
- UI-Optimierung für Panel/Controls, inklusive Ladezustand und Fehlerfeedback.

## Featureumfang
1. **Szenauswahl & Loader**
   - Dropdown für verfügbare Szenen.
   - Dynamisches Nachladen der GLTF-Dateien; Anzeige eines Lade-Overlays.
   - Fehlerhandling mit Hinweis im UI.
2. **Metadaten-Panel**
   - Anzeige von Titel, Version, Beschreibung, Tags, Polygon-Anzahl (falls vorhanden).
   - Datenquelle: `public/data/scenes.json` (Mock-API).
3. **Tools**
   - Screenshot-Button (`canvas.toDataURL`) als Download.
   - Anzeige der aktuellen Auflösung (Rendergröße) und FPS.
4. **Struktur**
   - `src/services/sceneService.ts` für Datenfetch + Typen.
   - `src/state/sceneStore.ts` (oder einfache Hooks) zur Organisation.
5. **Dokumentation**
   - CHANGELOG-Eintrag, README Update, Docs zu Mock-API und Screenshot.

## Arbeitspakete
| Nr. | Paket | Beschreibung | Aufwand |
| --- | --- | --- | --- |
| 1 | Datenstruktur | `scenes.json`, Typdefinitionen, Service-Layer | 0.5 Tag |
| 2 | UI/Controls | Dropdown, Panels, Loading/Error-State | 1 Tag |
| 3 | Loader-Logik | Szene wechseln, Cleanup, Materialverwaltung | 1 Tag |
| 4 | Tools | Screenshot-Funktion, Auflösung/FPS-Labels | 0.5 Tag |
| 5 | Dokumentation | README, CHANGELOG, Docs-Layer | 0.5 Tag |
| **Summe** |  | **~3 Tage** |  |

## Risiken & Mitigation
- **Asset-Mangel**: Falls keine echten Assets vorliegen, werden Demo-Modelle verwendet. → Dokumentieren, wie echte Assets einzubinden sind.
- **Performance**: Große Assets können Ladezeiten erhöhen. → Warnhinweise + Lazy-Loading optional.
- **Browser-Sicherheit**: Screenshot-Funktion benötigt Benutzerinteraktion. → Button mit klarer Beschriftung.

## Erfolgskriterien
- Szenenwechsel funktioniert flüssig, UI zeigt passende Infos.
- Screenshot landet lokal als PNG.
- Mock-API-Setup erlaubt späteren Austausch gegen echte Services (nur Fetch-Aufruf anpassbar).
- Dokumentation erklärt Workflow für neue Szenen (Assets + Metadaten).
