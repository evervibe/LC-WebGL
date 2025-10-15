# LCWebGL

## Vision
- Browserbasierter Companion-Client für LastChaos, liefert WebGL-Vorschau, UI-Experimente und Datenvisualisierung.
- Dient als Vorstufe für zukünftige Unreal-Portierung: Asset-Konvertierung, UX-Ideen und Service-Schnittstellen werden hier validiert.
- Aktuelle Entwicklungszweig: `1.0.0-alpha` (Legacy-Datenpipeline, UI-Katalog, Szenen-Navigation, Screenshot-Tool).

## Features (1.0.0-alpha)
- Automatischer Daten-Build (`scripts/build-data.mjs`) liest UI-XMLs aus dem Legacy-Client und erzeugt `public/data/ui-windows.json`.
- Szenenkatalog (`public/data/scenes.json`) verbindet WebGL-Viewer mit echten Fensterdefinitionen (Teleport, Affinity …).
- Legacy UI Explorer: Suche/Filter, Detailansicht mit Control-Typen, Verknüpfung zu passenden Szenen.
- Screenshot-Export, Wireframe-Toggle, FPS/Resolution-Monitoring.
- Responsive Overlay-Oberfläche mit Tags/Badges für verknüpfte Daten.
- Streaming-Kapazität über `SceneLoader` (Draco/KTX2 optional, Assets unter `public/3rdparty/` bereitstellen).

## Schnellstart
```bash
cd LCWebGL
npm install        # installiert Abhängigkeiten
npm run mock-api   # optional: Mock-Backend (Port 5174)
npm run dev        # startet Vite; predev baut automatisch die Datenbasis
```

Build & Preview:
```bash
npm run build      # führt build-data.mjs + tsc + vite build aus
npm run preview    # Auslieferung des dist-Builds prüfen
```

Linter:
```bash
npm run lint
```

## Datenpipeline
- `npm run data` (oder automatisch via `predev`, `prebuild`) erzeugt:
  - `public/data/ui-windows.json`: aggregierte UI-Fenster inkl. Control-Typen, Positionen, Beispiele.
  - `public/data/scenes.json`: Kombination aus `data/scenes.config.json` + UI-Analyse.
- Konfiguration: `data/scenes.config.json`.
- Details & Formatbeschreibung: `docs/data.md`, `docs/assets.md`.

## Technologiestapel
- Build-Tool: Vite + TypeScript (schnelles HMR, ESM).
- Rendering: Three.js (WebGL2, glTF/GLB).
- Styling: maßgeschneiderte CSS-Komponenten (Glassmorphism/Overlay).
- Datenzugriff: Statische JSONs (Legacy-XML -> JSON), vorbereitet für REST/WebSocket-Anbindung.

## Projektstruktur (geplant)
- `src/` – TypeScript-Quellcode (Renderer, UI, Services).
- `public/` – statische Assets (Shader, glTF-Dateien, Texturen).
- `scripts/` – Hilfsskripte (Asset-Konvertierung, Build).
- `docs/` – technische Notizen, Spezifikationen.

## Release-Phasen
- `0.x` – Prototyping & Experimente (keine Stabilitätsgarantie).
- `1.x` – Feature-kompletter Companion-Client (nach Unreal-Integration).
- `2.x` – potenzielle Erweiterungen (z. B. Interaktion mit Web3-Services).

## Nützliche Links
- [Three.js Dokumentation](https://threejs.org/docs/)
- [glTF 2.0 Spezifikation](https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html)
- [Vite Guide](https://vitejs.dev/guide/)

- Detailplanung / Roadmaps:
  - `PLAN_0.0.1-alpha.md` – Projekt-Bootstrap
  - `PLAN_0.0.2-alpha.md` – Viewer & Tools
  - `PLAN_1.0.0-alpha.md` – Legacy-Datenintegration (umgesetzt)
