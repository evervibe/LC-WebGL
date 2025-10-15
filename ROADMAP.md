# LCWebGL Roadmap (Alpha-Serie)

> Ziel: Schrittweise Annäherung an einen voll funktionsfähigen, webbasierten Companion/Client für den Legacy-LastChaos-Code.  
> Status Ausgangspunkt: `1.0.0-alpha` (Datenpipeline + UI-Explorer aktiv).

## 2.0.0-alpha – Legacy-Assets & Materials
- **3D-Assets:** Automatisierte Konvertierung echter Spielgeometrie (Maps, Charaktere) nach glTF/GLB inkl. KTX2/Draco-Kompression.
- **Materialsystem:** PBR-Übersetzung vorhandener Shader (Diffuse/Spec/Normal) nach WebGL-Materialien.
- **Scene Streaming:** Lazy Loading/Code-Splitting für große Assets, Progress-Anzeige.
- **Validierung:** Vergleich mit Legacy-Client (Screenshot Diff) zur Sicherstellung geometrischer Treue.

## 3.0.0-alpha – Datenservices & Gameplay-Stubs
- **Backend-Mock:** Node/Express-Service, der reale Serverdaten (Items, Mobs, Quests) vorhält.
- **API-Integration:** Frontend konsumiert REST/GraphQL-Endpunkte statt statischer Dateien.
- **State-Management:** Einführung eines Stores (z. B. Zustand verwalten für Daten-Caching, Filter).
- **Gameplay-Stubs:** Erste Visualisierung von NPC-Positionen/Questketten auf Minimap/Overlay.

## 4.0.0-alpha – Animations- und Effektpipeline
- **Skelettanimationen:** Import von Bone/Animation-Daten, Playback im Viewer.
- **Blendshape/Morphs:** Unterstützung für Gesichts-/Equipment-Varianten.
- **FX-System:** Partikel-/Shader-Effekte (Skills) als WebGL-Approximation.
- **Timeline-Recorder:** Sequencer zum Abspielen und Exportieren von Animationen.

## 5.0.0-alpha – UI-Framework Portierung
- **UI Runtime:** Rendern der XML-basierten UI-Definitionen direkt im Browser (Parser + Renderer).
- **Interaktion:** Buttons, Listen, Dialoge mit Live-Datenbindung.
- **Localization Layer:** Anbindung der Original-String-Tables, Umschalten von Sprachen.
- **Theming:** Unterstützung für mehrere UI-Skins (klassisch vs. modern).

## 6.0.0-alpha – Netzwerk & Session-Simulation
- **Login/Session-Flow:** Mock-Anmeldung mit Token-Handling, Benutzerprofile.
- **Realtime-Sync:** WebSocket-Streams für Positionen, Chat, Party-Info (simuliert).
- **Replay-System:** Aufzeichnen/Wiedergeben von Bewegungsdaten.
- **Security-Checks:** Basis-Maßnahmen gegen Manipulation (Integritätsprüfungen der Daten).

## 7.0.0-alpha – Gameplay-Companion Funktionen
- **Build/Skill Planner:** Interaktive Talent-/Stat-Planung mit Live-Berechnung.
- **Item-Datenbank:** Vergleichstools, Filter, Drop-Locations (aus Serverdaten).
- **Quest Tracker:** Schritt-für-Schritt-Ansicht, Integration mit Map.
- **Social Features:** Gildenübersicht, Rankings, Messaging (Mock).

## 8.0.0-alpha – Performance & Mobile
- **Responsive Rework:** Mobile/Tablet-optimierte Layouts, Touch-Controls (Orbit/Drag).
- **Performance Profiling:** WebGL-Optimierung (Instancing, LOD).
- **Offline-Modus:** Progressive Web App (PWA) mit Cache für Referenzdaten.
- **Gestensteuerung:** Unterstützung für Pen/Touch-Geräte.

## 9.0.0-alpha – Integration mit Legacy-Client
- **Shared Assets:** Automatischer Export von Ressourcen aus dem Windows-Build (Pakete, Texturen).
- **Build Hooks:** CI-Job triggert Web-Build nach erfolgreichem Legacy-Build.
- **Diff-Viewer:** Vergleich zwischen Web-UI und Original-Client (Visual Regression).
- **Documentation Sync:** Einheitliche Doku für beiden Clients (Tech + Gameplay).

## 10.0.0-alpha – Feature-Freeze Richtung Beta
- **Stabilisierung:** Bugfix-Sprint, automatisierte Tests (Unit + Visual + e2e).
- **Bundling:** Optimierung von Bundle-Größe, CDN-Strategie, Cache-Busting.
- **Security Review:** CSP, Header, Auth-Flows überprüfen.
- **Beta-Kriterien:** Definition der Features, die für eine offene Beta benötigt werden.

---

## Weiterführende Releases (Ausblick)
- **11.0.0-alpha**: WebAssembly-Optimierungen, C++-Cross-Compilation einzelner Engine-Module.
- **12.0.0-alpha**: Cloud-Streaming-Integration (WebRTC) als Fallback für vollständigen Client.
- **20.0.0-alpha**: Hybrid-Modell – Web-Frontend + Remote-Logic aus Legacy-Servern.
- **30.0.0-alpha**: Unreal-Client teilt Asset-/Datenpipeline mit LCWebGL (gemeinsame Toolchain).
- **40.0.0-alpha**: Extensive Mod-Support/API für Community (Editoren, Map-Upload).
- **50.0.0-alpha**: Cross-Platform Companion (Mobile App mit nativer Rendering-Bridge).
- **75.0.0-alpha**: AI-gestützte Content-Erstellung (Quest-Skripte, NPC-Barks).
- **100.0.0-alpha**: Vollständiger Web-Client mit Echtzeit-Gameplay (WebAssembly + Cloud-Beschleunigung).

> Hinweis: Ab 10.x sollten Roadmap-Items regelmäßig verifiziert und an Team-/Budget-Ressourcen angepasst werden. Hohe Versionssprünge (20+, 50+, 100+) sind als Vision Statements gedacht – sie setzen signifikante Investitionen, Personal und Zeit voraus.
