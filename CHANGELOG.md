# Changelog – LCWebGL

Alle nennenswerten Änderungen werden hier dokumentiert.

## [1.0.0-alpha] – Legacy-Datenintegration
- Daten-Build (`scripts/build-data.mjs`) liest Legacy-XMLs und generiert `ui-windows.json` + `scenes.json`.
- Szenen-Konfiguration (`data/scenes.config.json`) mit UI-Verknüpfungen (Teleport, Affinity).
- Legacy UI Explorer: Filter/Suche, Detailpanel mit Control-Typen, Szenen-Linking.
- Überarbeitete Overlay-Oberfläche, Badges/Tags, Responsive Layout, Statistik-Bereich erweitert.
- Docs aktualisiert (`README`, `docs/setup.md`, `docs/data.md`), Version auf `1.0.0-alpha` gehoben.

## [0.0.2-alpha] – WebGL Szenen-Viewer Update
- Mehrere Szenen auswählbar (`public/data/scenes.json` als Mock-API).
- Metadatenpanel mit Tags, Polygonanzahl, FPS und Auflösungsanzeige.
- Wireframe-Toggle bleibt erhalten und gilt pro Szene.
- Screenshot-Export über UI-Button (`canvas.toDataURL`).
- Ladeoverlay mit Fehlerfeedback, Reload-Funktion für Szenen.
- Beispiel-Assets (`sample-triangle`, `sample-quad`) als Platzhalter.

## [0.0.1-alpha] – Initiales Scaffold
- Vite + Three.js + TypeScript Grundgerüst.
- Erste Szene mit einfachem glTF-Triangle.
- FPS-Anzeige und Wireframe-Schalter.
- Basisdokumentation für Setup und Asset-Konvertierung.

[1.0.0-alpha]: ./CHANGELOG.md
[0.0.2-alpha]: ./CHANGELOG.md
[0.0.1-alpha]: ./CHANGELOG.md
