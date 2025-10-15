# Plan 0.0.1-alpha – LCWebGL MVP

## Zielzustand
- Rendering einer einzelnen Szene (z. B. Ausgangsstadt) im Browser mit Three.js.
- Steuerbarer Kameraorbit (Maus/Toucheingabe) sowie minimales UI-Overlay.
- Anzeige eines spielrelevanten Objekts (Charakter- oder Gebäudemodell) aus dem Legacy-Asset-Bestand.
- Bereitstellung eines einfachen Deployments (lokal via `npm run dev`, Build via `npm run build`).
- Bereitstellung eines Demo-Links (lokaler Dev-Server oder GitHub Pages) für Stakeholder.

## Featureumfang
1. **Scene Viewer**
   - Laden eines GLB/glTF-Modells mit Materialien/Texturen.
   - OrbitControls (Rotation, Zoom, Pan) mit Device-Kompatibilität (Desktop/Mobile).
   - Basic Lighting (Umgebungs- + Richtungslicht).
2. **UI Framework**
   - HUD mit Versionsinfo (`0.0.1-alpha`), Scene-Titel, FPS-Anzeige.
   - Toggle für Wireframe/Lighting zur Asset-Inspektion.
3. **Asset Pipeline**
   - Dokumentierter Export-Flow: FBX → Blender → glTF.
   - Verzeichnisstruktur für Assets (`public/assets/scene00`).
4. **Tooling & Scripts**
   - `package.json` mit Vite + Three.js + TypeScript.
   - Lint/Formatting (ESLint + Prettier, Basiskonfiguration).
   - `npm run convert` Placeholder (verweist auf Asset-Konvertierungsanleitung).
5. **Dokumentation**
   - `docs/setup.md` – Setup-Anleitung (Node-Version, Befehle).
   - `docs/assets.md` – Konvertierungsprozess + Naming Conventions.

## Arbeitspakete
| Nr. | Paket | Beschreibung | Aufwand (Schätzung) |
| --- | --- | --- | --- |
| 1 | Projekt-Bootstrap | Vite + TS + Three.js, ESLint/Prettier konfigurieren | 1 Tag |
| 2 | Scene Loader | Basis-Renderer, Kamera, OrbitControls | 2–3 Tage |
| 3 | Asset-Konvertierung | Erstes Modell (Teststadt) konvertieren & testen | 2 Tage |
| 4 | UI-Overlay | HUD, Controls, Responsive Layout | 1–2 Tage |
| 5 | Doku & Deploy | Setup/Assets-Doku, Build/Deploy-Guide | 1 Tag |
| **Summe** |  | **~1,5 Wochen fokussierte Arbeit** |  |

## Abhängigkeiten
- Zugriff auf Legacy-Assets (FBX, Texturen). Falls nicht vorhanden, Platzhaltermodell verwenden.
- Node.js LTS (≥18) installiert.
- Blender (oder anderer Konverter) für FBX→glTF.
- Zeit/Unterstützung Technical Artist für Asset-Aufbereitung.

## Risiken & Mitigation
- **Asset-Rechte unklar** → Vorab klären, ggf. Platzhalter-Assets nutzen.
- **Performance** (große Szenen) → Level of Detail definieren, Szene beschneiden.
- **Browser-Kompatibilität** → Früh auf Chrome/Firefox/Safari testen.
- **Ressourcenengpässe** → Bei hoher Auslastung Scope reduzieren (z. B. nur Charakterviewer). 

## Erfolgskriterien
- Szene lädt im Browser innerhalb <5 Sekunden (lokaler Dev-Modus).
- Kamera/Controls fühlen sich flüssig an (>=30 FPS auf MacBook Pro 2020).
- Dokumentation erlaubt einem zweiten Entwickler, Projekt in <30 Minuten aufzusetzen.
- Demo wird intern akzeptiert als Proof-of-Concept für Unreal-Vorarbeiten.

## Weiterführende Ideen (Post-0.0.1)
- Multiple Szenen/Assets via Dropdown laden.
- REST-Anbindung für Live-Daten (z. B. NPC-Infos, Items).
- UI-Experimente (Inventar, Questlog) als Canvas/HTML-Overlay.
- Export Pipeline automatisieren (Skripte, CI/CD).

