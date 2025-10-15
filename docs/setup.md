# Setup – LCWebGL 1.0.0-alpha

## Voraussetzungen
- Node.js ≥ 18 (lokal installiert – geprüft mit v24.4.1)
- npm (wird mit Node ausgeliefert)
- Optional: Blender (für Asset-Konvertierung)

## Installation
```bash
npm install
```

## Entwicklungsmodus starten
```bash
npm run dev
```
Der Vite-Server öffnet standardmäßig den Browser unter `http://localhost:5173`.  
Vor dem Start wird automatisch `scripts/build-data.mjs` ausgeführt (`predev`) und aktualisiert die JSON-Daten.

## Produktion-Build erzeugen
```bash
npm run build
```
Der optimierte Build landet im Ordner `dist/`. Mit
```bash
npm run preview
```
kann das Ergebnis lokal geprüft werden.

## Linting & Formatierung
```bash
npm run lint
```
Prettier wird über IDE-Integrationen empfohlen (`.prettierrc` liegt bei).

## Daten-Build manuell ausführen
```bash
npm run data
```
Erzeugt/aktualisiert:
- `public/data/ui-windows.json` (Analyse der `../xml/*.xml`)
- `public/data/scenes.json` (Merge aus `data/scenes.config.json` + UI-Katalog)

## Mock-API starten (3.0.0-alpha)
```bash
npm run mock-api
```
Antwortet unter `http://localhost:5174`. `VITE_API_BASE` kann genutzt werden, um andere URLs zu setzen.

## Szenen & Assets erweitern
- Szenen-Definitionen in `data/scenes.config.json` pflegen (siehe `docs/data.md`).
- Assets in `public/assets/<scene-id>/` ablegen (glTF/GLB, siehe `docs/assets.md`).
- Nach Änderungen `npm run data` aufrufen oder Projekt neu starten.

## Troubleshooting
- Bei Paketproblemen `rm -rf node_modules package-lock.json` und anschließend `npm install`.
- Für andere Paketmanager (pnpm/yarn) bitte deren Lockfiles hinzufügen bzw. `.npmrc` anpassen.
