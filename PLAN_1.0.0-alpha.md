# Plan 1.0.0-alpha – LCWebGL Integration mit Legacy-Client

## Status
- [x] Datenpipeline aus Legacy-XML (UI-Fenster → JSON) + Szenen-Merge
- [x] UI-Explorer inkl. Suche, Detailpanel, Szenen-Verknüpfung
- [x] Build/CI-Hooks (`predev`, `prebuild`) und Dokumentation
- [ ] Vollständige Batch-Konvertierung echter 3D-Assets (Platzhalter-Szenen aktiv)

## Zielsetzung
- Browser-Companion soll echte LastChaos-Daten/Assets laden, nicht nur Demo-Szenen.
- Grundlage für spätere Unreal-Portierung, indem Datenstrukturen, Services und UI bereits auf Produktniveau gehoben werden.
- Bereitstellung einer konsistenten Version `1.0.0-alpha`, die Stakeholdern den Mehrwert zeigt.

## Kernanforderungen
1. **Asset-Integration**
   - Konvertierung realer Spielassets (z. B. Hauptstadt, Charaktermodell) aus dem Legacy-Projekt nach glTF/glb.
   - Automatisiertes Skript zur Batch-Konvertierung (FBX/OBJ/Ska → Blender → glTF) mit Konfigurationsdatei.
   - Asset-Kompression (Draco/KTX2) zur Reduktion der Bundle-Größe.

2. **Datenanbindung**
   - Aufbau eines Node/Express-Mock-Servers (oder statischer Generator), der echte XML/CSV aus `Client/xml/` einliest.
   - API-Endpunkte für NPCs, Quests, Items, Map-Metadaten.
   - Caching & Transformationslayer, um Frontend-spezifische JSON-Strukturen zu liefern.

3. **UI/Feature-Set**
   - Scene-Browser mit Such- und Filterfunktion (z. B. nach Region, Asset-Typ).
   - Info-Panels für NPC/Quest/Item-Daten mit Verlinkung zwischen den Entities.
   - Minimale Map-Overlay/Minimap, um Positionen anzuzeigen (2D Canvas über WebGL).
   - Screenshot/Recording-Export weiterhin vorhanden; optional Video-GIF Export (WebM).

4. **Build & Deployment**
   - CI/CD-Workflow (GitHub Actions oder lokales Skript) für Build, Lint, Asset-Konvertierung.
   - Split-Chunks/Code-Splitting, um Bundle-Warnungen zu eliminieren (< 300 kB pro Chunk).
   - Deployment-Skript (z. B. `npm run deploy`) für GitHub Pages oder internen Webserver.

5. **Dokumentation & Governance**
   - Developer Guide zur Anbindung an Legacy-Datenquellen (Pfadkonventionen, Zugriff).
   - Lizenz-/Rechteprüfung für Assets und Musik.
   - Changelog und Versionierung auf `1.0.0-alpha` anheben, semver-konform.

## Umsetzungsetappen
### Phase 1 – Grundlagen (1–2 Wochen)
- Asset-Inventur der Legacy-Daten (Dateiformate, Speicherorte, benötigte Tools).
- Proof-of-Concept für einen Asset-Typ (z. B. Charaktermodell) inkl. automatisiertem Skript.
- Node-basierter Loader, der eine XML-Datei (z. B. `npc.xml`) nach JSON umsetzt.
- Erweiterung der WebGL-App, um die neuen JSON-Daten anzuzeigen (ohne finalen Look).

### Phase 2 – Feature-Complete (2–4 Wochen)
- Batch-Konvertierung + Optimierung für mindestens zwei Szenen (Stadt & Dungeon).
- Implementierung von Filter/Suche & Metadatenanzeige im Frontend.
- Integration zusätzlicher Panels (NPC/Quest/Items) mit Cross-Linking.
- Code-Splitting (dynamisches Laden von Three.js-Subpaketen) und KTX2/Draco-Kompression.

### Phase 3 – Stabilisierung & Release (1–2 Wochen)
- Performance-Profiling, Memory-Leaks prüfen (OrbitControls, Dispose-Logik).
- UI-Polish, Responsive/Accessibility (Keyboard-Navigation, Screenreader-Hints).
- Dokumentation aktualisieren (README, Setup, Asset-/Daten-Guides).
- Version-Bump auf `1.0.0-alpha`, Release-Tag setzen, Demo-Deployment durchführen.

## Abhängigkeiten
- Zugriff auf originale Assets und Tools (Blender, evtl. proprietäre Exporter aus `ToolSrc`).
- Zustimmung bezüglich Lizenzen und Nutzung (Team-intern oder Rechteinhaber).
- Optional: Zusätzliche Bibliotheken (Draco, KTX2 loaders) – installieren & konfigurieren.
- Zeitressourcen für DevOps (CI/CD) und ggf. Testpersonen.

## Risiken & Gegenmaßnahmen
- **Asset-Konvertierung scheitert** → Notfallplan: Externe Tools/Plugin-Recherche, Outsourcing an Technical Artist.
- **Performance im Browser** → LODs, Instancing, selective loading; WebGL Profiler einsetzen.
- **Dateninkonsistenzen** → Validation-Layer im Node-Skript, Tests mit echten Server-Dumps.
- **Scope-Drift** → Feature-Freeze nach Phase 2, Rest in 1.1.0-alpha schieben.

## Erfolgskriterien
- Mindestens zwei reale Szenen + mehrere verlinkte Datensets (NPC/Quest/Item) im Browser navigierbar.
- Build-Prozess automatisiert; Deployment-Artefakt reproduzierbar.
- Dokumentation ermöglicht Onboarding eines neuen Devs < 1 Tag.
- Stakeholder können `1.0.0-alpha` live testen (z. B. via interner URL) und Feedback geben.
