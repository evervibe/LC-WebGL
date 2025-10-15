import './style.css';

import {
  AmbientLight,
  Color,
  DirectionalLight,
  Material,
  Mesh,
  Object3D,
  PerspectiveCamera,
  Scene,
  SRGBColorSpace,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import { AnimationManager } from './animation/AnimationManager';
import { sampleTimeline } from './animation/timeline';
import { FXManager } from './fx/FXManager';
import { SceneLoader } from './loader/sceneLoader';
import { Api } from './services/api';
import type { ItemDTO, NpcDTO, QuestDTO } from './services/api';
import { fetchSceneCatalog, fetchUiCatalog } from './services/sceneService';
import { Store } from './state/store';
import type { SceneMetadata, UIWindowCatalog, UIWindowSummary } from './types';
import { LegacyUIRuntime } from './ui/LegacyUIRuntime';
import { Localization, guessWindowTitle } from './ui/Localization';

const APP_VERSION = '1.0.0-alpha';

const rootElement = document.querySelector<HTMLDivElement>('#app');

if (!rootElement) {
  throw new Error('Root container "#app" nicht gefunden.');
}

const root = rootElement;

// --------------------------------------------------------------------------
// UI SETUP
// --------------------------------------------------------------------------

const canvas = document.createElement('canvas');
canvas.className = 'render-surface';

const uiOverlay = document.createElement('div');
uiOverlay.className = 'overlay';
uiOverlay.innerHTML = `
  <header class="overlay__header">
    <div>
      <h1>LCWebGL</h1>
      <span class="overlay__badge">${APP_VERSION}</span>
    </div>
    <div class="overlay__controls overlay__controls--inline">
      <label class="overlay__select">
        <span>Szene</span>
        <select data-scene></select>
      </label>
      <button type="button" class="overlay__btn" data-scene-reload>Reload</button>
    </div>
  </header>

  <section class="overlay__section">
    <h2 data-scene-title class="overlay__title">–</h2>
    <p data-scene-description class="overlay__description">Szene lädt...</p>
    <div class="overlay__tags" data-scene-tags></div>
    <dl class="overlay__stats">
      <div><dt>Version</dt><dd data-scene-version>–</dd></div>
      <div><dt>Polygone</dt><dd data-scene-polygons>–</dd></div>
      <div><dt>Auflösung</dt><dd data-resolution>–</dd></div>
      <div><dt>FPS</dt><dd data-fps>0</dd></div>
    </dl>
  </section>

  <section class="overlay__section overlay__section--tools">
    <label class="overlay__toggle">
      <input type="checkbox" data-wireframe />
      Wireframe
    </label>
    <button type="button" class="overlay__btn overlay__btn--primary" data-screenshot>
      Screenshot
    </button>
  </section>

  <section class="overlay__section overlay__section--catalog">
    <div class="overlay__section-header">
      <h3 class="overlay__subtitle">Legacy UI Explorer</h3>
      <span class="overlay__pill" data-ui-count>0 Fenster</span>
    </div>
    <label class="overlay__input">
      <span class="overlay__input-label">Filter</span>
      <input type="search" placeholder="z. B. teleport, auction..." data-ui-search />
    </label>
    <div class="overlay__list" data-ui-list></div>
    <div class="overlay__detail" data-ui-detail>
      <p class="overlay__hint">UI auswählen, um Details zu sehen.</p>
    </div>
  </section>

  <section class="overlay__section overlay__section--data">
    <div class="overlay__section-header">
      <h3 class="overlay__subtitle">Gameplay-Daten</h3>
      <span class="overlay__pill" data-data-state>lädt ...</span>
    </div>
    <div class="overlay__data-grid">
      <div>
        <h4>Items</h4>
        <ul data-data-items class="overlay__data-list"></ul>
      </div>
      <div>
        <h4>NPCs</h4>
        <ul data-data-npcs class="overlay__data-list"></ul>
      </div>
      <div>
        <h4>Quests</h4>
        <ul data-data-quests class="overlay__data-list"></ul>
      </div>
    </div>
  </section>

  <section class="overlay__section overlay__section--runtime">
    <div class="overlay__section-header">
      <h3 class="overlay__subtitle">UI Runtime</h3>
      <div class="overlay__controls overlay__controls--inline">
        <label class="overlay__select">
          <span>Fenster</span>
          <select data-runtime-window></select>
        </label>
        <label class="overlay__select">
          <span>Sprache</span>
          <select data-runtime-locale>
            <option value="de">Deutsch</option>
            <option value="en">English</option>
          </select>
        </label>
      </div>
    </div>
    <div class="overlay__runtime-surface" data-runtime-host>
      <p class="overlay__hint">Fenster wählen, um Rendering-Vorschau zu sehen.</p>
    </div>
  </section>

  <footer class="overlay__footer">
    <small>Steuerung: Linksklick/Drag zum Rotieren · Rechtsklick zum Verschieben · Mausrad = Zoom</small>
  </footer>
`;

const loadingIndicator = document.createElement('div');
loadingIndicator.className = 'loading-overlay';
loadingIndicator.innerHTML = `
  <div class="loading-overlay__panel">
    <div class="loading-overlay__spinner" role="status"></div>
    <p class="loading-overlay__text" data-loading-text>Lade...</p>
  </div>
`;

// --------------------------------------------------------------------------
// DOM REFERENCES
// --------------------------------------------------------------------------

const sceneSelector = uiOverlay.querySelector<HTMLSelectElement>('[data-scene]');
const sceneReloadButton = uiOverlay.querySelector<HTMLButtonElement>('[data-scene-reload]');
const sceneScreenshotButton = uiOverlay.querySelector<HTMLButtonElement>('[data-screenshot]');
const wireframeToggle = uiOverlay.querySelector<HTMLInputElement>('[data-wireframe]');
const sceneTitleEl = uiOverlay.querySelector<HTMLElement>('[data-scene-title]');
const sceneDescriptionEl = uiOverlay.querySelector<HTMLElement>('[data-scene-description]');
const sceneTagsEl = uiOverlay.querySelector<HTMLDivElement>('[data-scene-tags]');
const sceneVersionEl = uiOverlay.querySelector<HTMLElement>('[data-scene-version]');
const scenePolycountEl = uiOverlay.querySelector<HTMLElement>('[data-scene-polygons]');
const fpsLabel = uiOverlay.querySelector<HTMLSpanElement>('[data-fps]');
const resolutionLabel = uiOverlay.querySelector<HTMLSpanElement>('[data-resolution]');
const loadingMessageEl = loadingIndicator.querySelector<HTMLParagraphElement>('[data-loading-text]');
const uiCountLabel = uiOverlay.querySelector<HTMLSpanElement>('[data-ui-count]');
const uiSearchInput = uiOverlay.querySelector<HTMLInputElement>('[data-ui-search]');
const uiListContainer = uiOverlay.querySelector<HTMLDivElement>('[data-ui-list]');
const uiDetailContainer = uiOverlay.querySelector<HTMLDivElement>('[data-ui-detail]');
const dataStateLabel = uiOverlay.querySelector<HTMLSpanElement>('[data-data-state]');
const dataItemsList = uiOverlay.querySelector<HTMLUListElement>('[data-data-items]');
const dataNpcsList = uiOverlay.querySelector<HTMLUListElement>('[data-data-npcs]');
const dataQuestsList = uiOverlay.querySelector<HTMLUListElement>('[data-data-quests]');
const runtimeWindowSelect = uiOverlay.querySelector<HTMLSelectElement>('[data-runtime-window]');
const runtimeLocaleSelect = uiOverlay.querySelector<HTMLSelectElement>('[data-runtime-locale]');
const runtimeHost = uiOverlay.querySelector<HTMLDivElement>('[data-runtime-host]');

// --------------------------------------------------------------------------
// THREE.JS SETUP
// --------------------------------------------------------------------------

const renderer = new WebGLRenderer({
  canvas,
  antialias: true,
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = SRGBColorSpace;
renderer.setClearColor(new Color('#0f172a'));

const scene = new Scene();
scene.add(new AmbientLight('#d4d4d8', 0.6));
const light = new DirectionalLight('#ffffff', 1.2);
light.position.set(4, 6, 3);
scene.add(light);

const animationManager = new AnimationManager();
const fxManager = new FXManager(scene);
const localization = new Localization();
const legacyRuntime = new LegacyUIRuntime();

const camera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(1.5, 1.5, 2.5);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0.4, 0.4, 0);

// --------------------------------------------------------------------------
// STATE
// --------------------------------------------------------------------------

let sceneCatalog: SceneMetadata[] = [];
let currentSceneId: string | null = null;
let currentSceneNode: Object3D | undefined;
let polygonCount = 0;
const materials: Material[] = [];

let uiCatalogData: UIWindowCatalog | null = null;
const uiIndex = new Map<string, UIWindowSummary>();
let uiEntries: UIWindowSummary[] = [];
let filteredUiEntries: UIWindowSummary[] = [];
let activeUiWindowId: string | null = null;
const uiListButtons = new Map<string, HTMLButtonElement>();
const sceneLoader = new SceneLoader({
  dracoPath: '/3rdparty/draco/',
  ktx2Path: '/3rdparty/basis/',
  onProgress: (progress) => {
    if (loadingMessageEl) {
      const percentage = (progress.ratio * 100).toFixed(0);
      loadingMessageEl.textContent = `Lade Assets... ${percentage}%`;
    }
  },
});

type GameplayState = {
  items: ItemDTO[];
  npcs: NpcDTO[];
  quests: QuestDTO[];
  status: 'idle' | 'loading' | 'ready' | 'error';
};

const gameplayStore = new Store<GameplayState>({
  items: [],
  npcs: [],
  quests: [],
  status: 'idle',
});

gameplayStore.subscribe(renderGameplayData);

// Stats
let lastFrame = performance.now();
let frameCount = 0;
let fps = 0;
let lastTick = performance.now();

// --------------------------------------------------------------------------
// HELPERS
// --------------------------------------------------------------------------

function collectMaterials(object: Object3D) {
  object.traverse((child) => {
    if ((child as Mesh).isMesh) {
      const mesh = child as Mesh;
      const { material } = mesh;
      if (Array.isArray(material)) {
        material.forEach((mat) => {
          if (mat && !materials.includes(mat)) {
            materials.push(mat);
          }
        });
      } else if (material && !materials.includes(material)) {
        materials.push(material);
      }
    }
  });
}

function disposeCurrentScene() {
  if (currentSceneNode) {
    currentSceneNode.traverse((child) => {
      const mesh = child as Mesh;
      if (mesh.isMesh) {
        const { geometry, material } = mesh;
        if (geometry) geometry.dispose();
        if (Array.isArray(material)) material.forEach((mat) => mat.dispose());
        else if (material) material.dispose();
      }
    });
    scene.remove(currentSceneNode);
    currentSceneNode = undefined;
  }
  materials.length = 0;
  polygonCount = 0;
}

function isWireframeCapable(material: Material): material is Material & { wireframe: boolean } {
  return Object.prototype.hasOwnProperty.call(material, 'wireframe');
}

function applyWireframe(enabled: boolean) {
  materials.forEach((mat) => {
    if (isWireframeCapable(mat)) {
      mat.wireframe = enabled;
    }
  });
}

function calculatePolygons(root: Object3D) {
  let total = 0;
  root.traverse((child) => {
    const mesh = child as Mesh;
    if (mesh.isMesh) {
      const geometry = mesh.geometry;
      if (geometry.index) {
        total += geometry.index.count / 3;
      } else if (geometry.attributes.position) {
        total += geometry.attributes.position.count / 3;
      }
    }
  });
  polygonCount = Math.floor(total);
}

function updateMetadataDisplay(metadata: SceneMetadata) {
  if (sceneTitleEl) sceneTitleEl.textContent = metadata.title;
  if (sceneDescriptionEl) sceneDescriptionEl.textContent = metadata.description ?? 'Keine Beschreibung vorhanden.';
  if (sceneVersionEl) sceneVersionEl.textContent = metadata.version ?? '–';
  if (scenePolycountEl) {
    const hasGeometry = typeof metadata.assetPath === 'string';
    scenePolycountEl.textContent = polygonCount
      ? polygonCount.toLocaleString()
      : hasGeometry
        ? '–'
        : 'n/a';
  }

  if (sceneTagsEl) {
    sceneTagsEl.textContent = '';
    (metadata.tags ?? []).forEach((tag) => {
      const badge = document.createElement('span');
      badge.className = 'overlay__tag';
      badge.textContent = tag;
      sceneTagsEl.appendChild(badge);
    });

    (metadata.relatedWindows ?? []).forEach((link) => {
      const badge = document.createElement('span');
      badge.className = 'overlay__tag overlay__tag--secondary';
      badge.textContent = `UI:${link.id}`;
      sceneTagsEl.appendChild(badge);
    });
  }
}

function updateStats() {
  const now = performance.now();
  frameCount += 1;
  const elapsed = now - lastFrame;

  if (elapsed >= 500) {
    fps = Math.round((frameCount * 1000) / elapsed);
    if (fpsLabel) fpsLabel.textContent = String(fps);
    frameCount = 0;
    lastFrame = now;
  }

  if (resolutionLabel) {
    const size = renderer.getSize(new Vector2());
    resolutionLabel.textContent = `${Math.round(size.x)} × ${Math.round(size.y)}`;
  }
}

function setLoading(active: boolean, message = 'Lade...') {
  loadingIndicator.hidden = !active;
  if (loadingMessageEl) loadingMessageEl.textContent = message;
}

function resetCamera(metadata: SceneMetadata) {
  const [x, y, z] = metadata.center ?? [0.4, 0.4, 0];
  const target = new Vector3(x, y, z);
  const distance = metadata.orbitDistance ?? 2.5;
  const offset = new Vector3(distance, distance, distance);
  controls.target.copy(target);
  camera.position.copy(target.clone().add(offset));
  controls.update();
}

function takeScreenshot() {
  const dataUrl = renderer.domElement.toDataURL('image/png');
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = `LCWebGL_${currentSceneId ?? 'scene'}_${Date.now()}.png`;
  link.click();
}

function populateSceneDropdown(catalog: SceneMetadata[]) {
  if (!sceneSelector) return;
  sceneSelector.innerHTML = '';

  catalog.forEach((entry) => {
    const option = document.createElement('option');
    option.value = entry.id;
    option.textContent = entry.title;
    sceneSelector.appendChild(option);
  });
}

function updateUiCountLabel(count: number) {
  if (uiCountLabel) {
    uiCountLabel.textContent = `${count} Fenster`;
  }
}

function clearUiDetail() {
  if (!uiDetailContainer) return;
  uiDetailContainer.innerHTML = '<p class="overlay__hint">UI auswählen, um Details zu sehen.</p>';
}

function renderGameplayData(state: GameplayState) {
  if (dataStateLabel) {
    const labelMap = {
      idle: 'idle',
      loading: 'lädt ...',
      ready: 'bereit',
      error: 'Fehler',
    } satisfies Record<GameplayState['status'], string>;
    dataStateLabel.textContent = labelMap[state.status];
  }

  const mapList = (
    list: HTMLUListElement | null,
    entries: { label: string; sub?: string; info?: string }[],
  ) => {
    if (!list) return;
    list.innerHTML = '';
    if (!entries.length) {
      list.innerHTML = '<li><span>Keine Daten</span></li>';
      return;
    }
    entries.forEach((entry) => {
      const li = document.createElement('li');
      const title = document.createElement('strong');
      title.textContent = entry.label;
      li.appendChild(title);
      if (entry.sub) {
        const sub = document.createElement('span');
        sub.textContent = entry.sub;
        li.appendChild(sub);
      }
      if (entry.info) {
        const info = document.createElement('span');
        info.textContent = entry.info;
        li.appendChild(info);
      }
      list.appendChild(li);
    });
  };

  mapList(
    dataItemsList,
    state.items.slice(0, 3).map((item) => ({
      label: item.name,
      sub: `Level ${item.level} · ${item.rarity}`,
      info: item.attack ? `ATK ${item.attack}` : undefined,
    })),
  );

  mapList(
    dataNpcsList,
    state.npcs.slice(0, 3).map((npc) => ({
      label: npc.name,
      sub: npc.region,
      info: `(${npc.position.x.toFixed(1)}, ${npc.position.y.toFixed(1)})`,
    })),
  );

  mapList(
    dataQuestsList,
    state.quests.slice(0, 3).map((quest) => ({
      label: quest.title,
      sub: `${quest.steps.length} Schritte`,
    })),
  );
}

function setActiveUiWindow(windowId: string | null) {
  activeUiWindowId = windowId;
  uiListButtons.forEach((button, id) => {
    const isActive = id === windowId;
    button.classList.toggle('is-active', Boolean(isActive));
    button.setAttribute('aria-pressed', String(isActive));
  });
}

function markSceneLinks(scene: SceneMetadata) {
  const linked = new Set((scene.relatedWindows ?? []).map((link) => link.id));
  uiListButtons.forEach((button, id) => {
    button.classList.toggle('is-linked', linked.has(id));
  });
}

function highlightSceneRelatedWindow(windowId?: string) {
  if (!windowId || activeUiWindowId === windowId || !uiIndex.has(windowId)) {
    return;
  }
  selectUiWindow(windowId);
}

function renderUiWindowDetail(entry: UIWindowSummary) {
  if (!uiDetailContainer) return;
  uiDetailContainer.innerHTML = '';

  const header = document.createElement('div');
  header.className = 'overlay__detail-header';
  header.innerHTML = `<h4>${entry.id}</h4><span>${entry.file}</span>`;
  uiDetailContainer.appendChild(header);

  const grid = document.createElement('div');
  grid.className = 'overlay__detail-grid';
  grid.innerHTML = `
    <div><span>Größe</span><strong>${entry.size.w ?? '—'} × ${entry.size.h ?? '—'}</strong></div>
    <div><span>Position</span><strong>${entry.position.x ?? '—'}, ${entry.position.y ?? '—'}</strong></div>
    <div><span>Controls</span><strong>${entry.controlTotal}</strong></div>
  `;
  uiDetailContainer.appendChild(grid);

  if (entry.controlTypes.length) {
    const groupsWrapper = document.createElement('div');
    groupsWrapper.className = 'overlay__control-groups';

    entry.controlTypes.forEach((group) => {
      const groupEl = document.createElement('div');
      groupEl.className = 'overlay__control-group';
      groupEl.innerHTML = `<h5>${group.type}<span>${group.count}</span></h5>`;

      if (group.samples && group.samples.length) {
        const sampleList = document.createElement('ul');
        sampleList.className = 'overlay__sample-list';
        group.samples.forEach((sample) => {
          const item = document.createElement('li');
          const sizeLabel = `${sample.size.w ?? '—'}×${sample.size.h ?? '—'}`;
          item.innerHTML = `
            <code>${sample.id || '(ohne id)'}</code>
            <span>${sample.desc || '—'}</span>
            <span class="overlay__sample-size">${sizeLabel}</span>
          `;
          sampleList.appendChild(item);
        });
        groupEl.appendChild(sampleList);
      }

      groupsWrapper.appendChild(groupEl);
    });

    uiDetailContainer.appendChild(groupsWrapper);
  }

  const scenesForWindow = sceneCatalog.filter((scene) =>
    (scene.relatedWindows ?? []).some((link) => link.id === entry.id),
  );

  if (scenesForWindow.length) {
    const sceneLinks = document.createElement('div');
    sceneLinks.className = 'overlay__scene-links';
    sceneLinks.innerHTML = '<span>Verknüpfte Szenen:</span>';
    scenesForWindow.forEach((scene) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'overlay__pill overlay__pill--action';
      chip.textContent = scene.title;
      chip.addEventListener('click', async () => {
        if (sceneSelector) {
          sceneSelector.value = scene.id;
        }
        await loadScene(scene);
      });
      sceneLinks.appendChild(chip);
    });
    uiDetailContainer.appendChild(sceneLinks);
  }
}

function renderUiList(entries: UIWindowSummary[]) {
  if (!uiListContainer) return;
  uiListButtons.clear();
  uiListContainer.innerHTML = '';

  entries.forEach((entry) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'overlay__list-item';
    button.dataset.uiId = entry.id;
    button.innerHTML = `
      <span class="overlay__list-title">${entry.id}</span>
      <span class="overlay__list-meta">${entry.file}</span>
      <span class="overlay__list-count">${entry.controlTotal}</span>
    `;
    button.addEventListener('click', () => selectUiWindow(entry.id));
    uiListContainer.appendChild(button);
    uiListButtons.set(entry.id, button);
  });

  updateUiCountLabel(entries.length);
  setActiveUiWindow(activeUiWindowId);
}

function populateRuntimeWindows(entries: UIWindowSummary[]) {
  if (!runtimeWindowSelect) return;
  runtimeWindowSelect.innerHTML = '';
  entries.forEach((entry) => {
    const option = document.createElement('option');
    option.value = entry.id;
    option.textContent = entry.id;
    runtimeWindowSelect.appendChild(option);
  });
  if (entries.length) {
    runtimeWindowSelect.value = entries[0].id;
  }
}

function selectUiWindow(windowId: string) {
  const entry = uiIndex.get(windowId);
  if (!entry) return;
  setActiveUiWindow(windowId);
  renderUiWindowDetail(entry);
}

function filterUiEntries(query: string) {
  const term = query.trim().toLowerCase();
  if (!term) {
    filteredUiEntries = [...uiEntries];
  } else {
    filteredUiEntries = uiEntries.filter((entry) => {
      const base = `${entry.id} ${entry.file}`.toLowerCase();
      if (base.includes(term)) return true;
      return entry.controlTypes.some((group) => group.type.toLowerCase().includes(term));
    });
  }

  renderUiList(filteredUiEntries);

  if (activeUiWindowId && !filteredUiEntries.some((entry) => entry.id === activeUiWindowId)) {
    setActiveUiWindow(null);
    clearUiDetail();
  }
}

async function loadScene(metadata: SceneMetadata) {
  setLoading(true, `Lade Szene „${metadata.title}“…`);
  currentSceneId = metadata.id;
  polygonCount = 0;
  updateMetadataDisplay(metadata);
  markSceneLinks(metadata);

  try {
    if (!metadata.assetPath) {
      disposeCurrentScene();
      setLoading(false);
      if (metadata.relatedWindows?.length) {
        highlightSceneRelatedWindow(metadata.relatedWindows[0].id);
      }
      return;
    }

    const gltf = await sceneLoader.loadScene(metadata.assetPath);
    disposeCurrentScene();
    currentSceneNode = gltf.scene;
    currentSceneNode.name = metadata.title;
    scene.add(currentSceneNode);
    collectMaterials(currentSceneNode);
    calculatePolygons(currentSceneNode);
    animationManager.attach(gltf, sampleTimeline.events
      .filter((event) => event.action === 'play' && event.clip)
      .map((event) => ({ name: event.clip as string, autoPlay: true })));
    fxManager.spawn({ id: `scene-${metadata.id}`, position: { x: 0, y: 0, z: 0 }, type: 'spark', duration: 0.5 });
    updateMetadataDisplay(metadata);
    applyWireframe(wireframeToggle?.checked ?? false);
    resetCamera(metadata);
    markSceneLinks(metadata);
    if (metadata.relatedWindows?.length) {
      highlightSceneRelatedWindow(metadata.relatedWindows[0].id);
    }
    setLoading(false);
  } catch (error) {
    console.error('Fehler beim Laden der Szene:', error);
    updateMetadataDisplay(metadata);
    if (sceneDescriptionEl) sceneDescriptionEl.textContent = 'Fehler beim Laden des Assets.';
    setLoading(false, 'Asset-Load fehlgeschlagen.');
  }
}

// --------------------------------------------------------------------------
// EVENT HANDLERS
// --------------------------------------------------------------------------

wireframeToggle?.addEventListener('change', (event) => {
  const target = event.currentTarget as HTMLInputElement;
  applyWireframe(target.checked);
});

sceneSelector?.addEventListener('change', async (event) => {
  const target = event.currentTarget as HTMLSelectElement;
  const metadata = sceneCatalog.find((entry) => entry.id === target.value);
  if (metadata) {
    await loadScene(metadata);
  }
});

sceneReloadButton?.addEventListener('click', async () => {
  if (!currentSceneId) return;
  const metadata = sceneCatalog.find((entry) => entry.id === currentSceneId);
  if (metadata) {
    await loadScene(metadata);
  }
});

sceneScreenshotButton?.addEventListener('click', () => {
  takeScreenshot();
});

runtimeLocaleSelect?.addEventListener('change', async (event) => {
  const select = event.currentTarget as HTMLSelectElement;
  if (runtimeWindowSelect?.value) {
    await renderRuntime(runtimeWindowSelect.value);
  }
  console.info('Locale switched to', select.value);
});

runtimeWindowSelect?.addEventListener('change', async (event) => {
  const select = event.currentTarget as HTMLSelectElement;
  if (select.value) {
    await renderRuntime(select.value);
  }
});

uiSearchInput?.addEventListener('input', (event) => {
  const target = event.currentTarget as HTMLInputElement;
  filterUiEntries(target.value);
});

window.addEventListener('resize', () => {
  const { innerWidth, innerHeight } = window;
  renderer.setSize(innerWidth, innerHeight);
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
});

// --------------------------------------------------------------------------
// INIT
// --------------------------------------------------------------------------

async function bootstrap() {
  root.appendChild(canvas);
  root.appendChild(uiOverlay);
  root.appendChild(loadingIndicator);

  try {
    setLoading(true, 'Daten werden geladen...');
    const [sceneData, uiData] = await Promise.all([fetchSceneCatalog(), fetchUiCatalog()]);

    sceneCatalog = sceneData;
    populateSceneDropdown(sceneCatalog);

    uiCatalogData = uiData;
    uiEntries = [...uiCatalogData.windows];
    filteredUiEntries = [...uiEntries];
    uiIndex.clear();
    uiEntries.forEach((entry) => {
      uiIndex.set(entry.id, entry);
    });
    renderUiList(filteredUiEntries);
    clearUiDetail();
    populateRuntimeWindows(uiEntries);
    if (runtimeWindowSelect?.value) {
      await renderRuntime(runtimeWindowSelect.value);
    }

    if (sceneCatalog.length > 0 && sceneSelector) {
      sceneSelector.value = sceneCatalog[0].id;
      await loadScene(sceneCatalog[0]);
    } else {
      setLoading(false, 'Keine Szenen verfügbar.');
    }

    gameplayStore.setState({ status: 'loading' });
    loadGameplayData();
  } catch (error) {
    console.error('Fehler beim Laden der Datenbasis:', error);
    setLoading(false, 'Daten konnten nicht geladen werden.');
    if (sceneDescriptionEl) {
      sceneDescriptionEl.textContent = 'Keine Daten verfügbar.';
    }
    clearUiDetail();
    gameplayStore.setState({ status: 'error' });
  }
}

async function loadGameplayData() {
  try {
    const [items, npcs, quests] = await Promise.all([Api.items(), Api.npcs(), Api.quests()]);
    gameplayStore.setState({ items, npcs, quests, status: 'ready' });
  } catch (error) {
    console.error('Gameplay-Daten konnten nicht geladen werden:', error);
    gameplayStore.setState({ status: 'error' });
  }
}

async function renderRuntime(windowId: string) {
  if (!runtimeHost) return;
  const entry = uiIndex.get(windowId);
  if (!entry) {
    runtimeHost.innerHTML = '<p class="overlay__hint">Fenster nicht gefunden.</p>';
    return;
  }

  const locale = (runtimeLocaleSelect?.value as 'de' | 'en') ?? 'de';
  try {
    await localization.load(locale);
  } catch (error) {
    console.error('Locale konnte nicht geladen werden:', error);
  }

  const titleKey = guessWindowTitle(entry);
  const heading = document.createElement('h4');
  heading.textContent = localization.t(titleKey, entry.id);
  runtimeHost.innerHTML = '';
  runtimeHost.appendChild(heading);

  const container = document.createElement('div');
  runtimeHost.appendChild(container);
  legacyRuntime.render(container, entry, {
    width: entry.size.w ?? 400,
    height: entry.size.h ?? 320,
  });
}

function animate() {
  requestAnimationFrame(animate);
  const now = performance.now();
  const deltaSeconds = (now - lastTick) / 1000;
  lastTick = now;
  animationManager.update();
  fxManager.update(deltaSeconds);
  controls.update();
  renderer.render(scene, camera);
  updateStats();
}

bootstrap();
animate();
