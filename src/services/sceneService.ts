import type { SceneCatalogResponse, UIWindowCatalog } from '../types';

export async function fetchSceneCatalog(): Promise<SceneCatalogResponse> {
  const response = await fetch('/data/scenes.json', {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Szenenliste konnte nicht geladen werden (${response.status})`);
  }

  const data = (await response.json()) as SceneCatalogResponse;
  return data;
}

export async function fetchUiCatalog(): Promise<UIWindowCatalog> {
  const response = await fetch('/data/ui-windows.json', {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`UI-Katalog konnte nicht geladen werden (${response.status})`);
  }

  const data = (await response.json()) as UIWindowCatalog;
  return data;
}
