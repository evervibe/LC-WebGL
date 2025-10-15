# Daten-Build – Legacy XML → JSON

`npm run data` (alias `scripts/build-data.mjs`) erzeugt zwei zentrale Dateien:

1. `public/data/ui-windows.json`
2. `public/data/scenes.json`

Beide Dateien werden aus den XML-Dateien im Ordner `../xml` (Legacy-Client) sowie aus `data/scenes.config.json` generiert.

## 1. `ui-windows.json`
Aggregierte UI-Fenster inkl. Control-Typen.

```jsonc
{
  "generatedAt": "2025-..",
  "source": "Legacy Client XML",
  "totalWindows": 27,
  "windows": [
    {
      "id": "teleport",
      "file": "Teleport.xml",
      "size": { "w": 472, "h": 160 },
      "position": { "x": 0, "y": 0 },
      "controlTotal": 21,
      "controlTypes": [
        {
          "type": "UIImage",
          "count": 17,
          "samples": [
            { "id": "", "desc": "BG", "size": { "x": 0, "y": 0, "w": 472, "h": 160 } }
          ]
        }
      ]
    }
  ]
}
```

- `controlTypes.samples` enthält maximal 4 Beispiele pro Gruppe.
- `size`/`position` Werte sind numerisch oder `null`, wenn im XML nicht gesetzt.

## 2. `scenes.json`
Zusammenführung aus `data/scenes.config.json` und den analysierten UI-Fenstern.

```jsonc
[
  {
    "id": "teleport-ui",
    "title": "Teleport Interface Layout",
    "description": "...",
    "assetPath": "/assets/sample-quad/scene.gltf",
    "tags": ["ui", "teleport", "legacy"],
    "center": [0, 0, 0],
    "orbitDistance": 3.2,
    "relatedWindows": [
      {
        "id": "teleport",
        "file": "Teleport.xml",
        "size": { "w": 472, "h": 160 },
        "controlTotal": 21,
        "controlTypes": [
          { "type": "UIImage", "count": 17 },
          { "type": "UIButton", "count": 4 }
        ]
      }
    ]
  }
]
```

`relatedWindows` wird automatisch aus `ui-windows.json` gespeist (IDs aus `relatedWindows` in `scenes.config.json`).

## Anpassung / Erweiterung
1. **Eigene Szenen hinzufügen:** `data/scenes.config.json` bearbeiten, anschließend `npm run data`.
2. **Weitere XML-Quellen nutzen:** `build-data.mjs` anpassen (z. B. zusätzliche Attribute, weitere Ordner).
3. **Backend anbinden:** `fetchSceneCatalog()` / `fetchUiCatalog()` in `src/services/sceneService.ts` auf REST-Endpunkte umstellen.

## Debugging & Tipps
- `npm run data` erneut ausführen, falls neue XMLs/Szenen nicht erscheinen.
- Browser-Cache deaktivieren (Daten werden ohne Cache ausgeliefert, `cache: 'no-store'`).
- Bei Fehlern in JSONs: Konsole prüfen; Skript wirft Exceptions mit Dateinamen.

## UI-Runtime (5.0.0-alpha Stub)
- Lokalisierungsdateien in `data/locales/` pflegen (ISO-Kürzel als Dateiname).
- `npm run data` kopiert diese nach `public/data/locales/`.
- `src/ui/Localization.ts` lädt die Dictionaries und liefert einfache Übersetzungen.
- `LegacyUIRuntime` rendert Platzhalter-Strukturen basierend auf `ui-windows.json`.
- Für echtes Rendering müssen Texturen & Layout-Regeln aus den XML-Dateien ergänzt werden (noch offen).
