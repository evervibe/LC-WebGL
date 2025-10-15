# Asset-Pipeline – LCWebGL MVP

## Ziel
Legacy-Assets (Modelle, Texturen) für den Einsatz im Browser vorbereiten. Ergebnisformat ist glTF/GLB, weil es von Three.js nativ unterstützt wird und Materials/Animations effizient speichert.

## Ausgangsdaten
- Originale: FBX, Collada oder proprietäre Formate aus dem LastChaos-Client.
- Texturen: DDS/TGA → vor Export nach PNG/JPG konvertieren (Farbraum prüfen).

## Konvertierungs-Workflow (FBX → glTF)
1. **Vorbereitung**
   - In Blender (`File → Import → FBX`) Modell importieren.
   - Skalierung prüfen (`Scene → Units → Metric`, ggf. Faktor anpassen).
   - Materialien/Texturen zuweisen; bei DDS-Dateien vorher nach PNG konvertieren.
2. **Säuberung**
   - Unnötige Meshes/Lights/Kameras entfernen.
   - Apply Transform (`Ctrl+A → Rotation & Scale`).
3. **Export**
   - `File → Export → glTF 2.0`.
   - Format: `glTF Binary (.glb)` für ein einzelnes File oder `glTF Embedded (.gltf)` plus eingebettete Texturen.
   - Optionen: `+Y Up`, `Apply Modifiers`, `UVs` aktiv lassen.
4. **Ablage**
   - Exportdatei unter `public/assets/<name>/scene.glb` (oder `.gltf`) ablegen.
   - Texturen bei Embedded-Export entfallen; ansonsten unter gleichem Ordner speichern.
   - Metadaten in `public/data/scenes.json` eintragen (siehe `docs/data.md`).

## Beispiel
- `public/assets/sample-triangle/scene.gltf` → Minimalmesh (Triangle).
- `public/assets/sample-quad/scene.gltf` → Platzhalter-Quad (Terrain-Dummy).

## Naming-Conventions
- Ordner: `sceneXX_<beschreibung>` (z. B. `scene01_birchwoods`).
- Dateien: `scene.glb` bzw. `scene.gltf`, Texturen `tex_<name>_<auflösung>.png`.
- Versionierung: Änderungen am Asset werden via Git nachvollzogen; größere Updates in CHANGELOG dokumentieren.
- `scenes.json`: `id` sollte Ordnernamen widerspiegeln (z. B. `sample-triangle`).

## Automatisierter Ablauf (2.0.0-alpha Stub)
- Werkzeuge in `data/convert-config.json` eintragen (Blender, gltf-transform, toktx).
- Legacy-Assets unter `legacy-assets/` ablegen.
- Script starten:
  ```bash
  npm run convert
  ```
- Ergebnis landet unter `public/assets/<targetId>/scene.glb` (und ggf. `scene.optimized.glb`).
- Nachbearbeitung/Qualitätskontrolle weiterhin notwendig.

## Weitere Hinweise
- Für Animationen `Bake Animation` beim Export aktivieren.
- PBR-Materialien (Metalness/Roughness) werden von Three.js unterstützt; Legacy-Shader ggf. migrieren.
- Große Assets in Segmente splitten (Streaming im Browser).
- Für finale Unreal-Portierung können die glTF-Dateien ebenfalls als Zwischenformat genutzt werden.

## Streaming & Decoder
- Draco Decoder-Dateien unter `public/3rdparty/draco/` ablegen (z. B. `draco_decoder.wasm`, `draco_wasm_wrapper.js`).
- BasisU (KTX2) Transcoder nach `public/3rdparty/basis/` legen (z. B. aus Three.js Release).
- Pfade werden in `SceneLoader` konfiguriert und in `src/main.ts` registriert.
