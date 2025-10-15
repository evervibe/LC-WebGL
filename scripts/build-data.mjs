#!/usr/bin/env node

/**
 * Erstellt aus den Legacy-XML-Dateien aggregierte JSON-Daten für den WebGL-Companion.
 * - Liest UI-Definitionen unter ../xml
 * - Fügt Metadaten in public/data/ui-windows.json zusammen
 * - Kombiniert diese mit Szenen-Konfiguration (data/scenes.config.json)
 */

import { fileURLToPath } from 'node:url';
import path from 'node:path';
import process from 'node:process';

import { XMLParser } from 'fast-xml-parser';
import fs from 'fs-extra';
import { globby } from 'globby';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const clientRoot = path.resolve(projectRoot, '..');

const xmlDir = path.join(clientRoot, 'xml');
const dataDir = path.join(projectRoot, 'data');
const outputDir = path.join(projectRoot, 'public', 'data');

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '',
  allowBooleanAttributes: true,
});

const log = (...args) => console.log('[build-data]', ...args);

async function ensurePrerequisites() {
  await fs.ensureDir(outputDir);
  await fs.ensureDir(dataDir);
  
  const xmlExists = await fs.pathExists(xmlDir);
  if (!xmlExists) {
    // Check if we already have generated data
    const uiWindowsExists = await fs.pathExists(path.join(outputDir, 'ui-windows.json'));
    const scenesExists = await fs.pathExists(path.join(outputDir, 'scenes.json'));
    
    if (uiWindowsExists && scenesExists) {
      log('⚠️  XML-Verzeichnis nicht gefunden, aber generierte Dateien existieren bereits.');
      log('   Überspringe Daten-Generierung. Verwende vorhandene Dateien.');
      return false; // Signal to skip regeneration
    }
    
    throw new Error(`XML-Verzeichnis wurde nicht gefunden: ${xmlDir}\nBitte stelle sicher, dass das Legacy-Client XML-Verzeichnis verfügbar ist.`);
  }
  return true; // Continue with regeneration
}

function sanitiseNumber(value) {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function extractControls(windowNode) {
  const controlsByType = [];
  let total = 0;

  for (const [key, rawValue] of Object.entries(windowNode)) {
    if (rawValue === null || typeof rawValue !== 'object' || key === 'Window') continue;

    const values = Array.isArray(rawValue) ? rawValue : [rawValue];
    const filtered = values.filter((item) => item && typeof item === 'object');
    if (!filtered.length) continue;

    total += filtered.length;
    const samples = filtered.slice(0, 4).map((item) => ({
      id: item.id ?? item.name ?? '',
      desc: item.desc ?? item.str_desc ?? item.tooltip ?? '',
      size: {
        x: sanitiseNumber(item.x),
        y: sanitiseNumber(item.y),
        w: sanitiseNumber(item.w),
        h: sanitiseNumber(item.h),
      },
    }));

    controlsByType.push({
      type: key,
      count: filtered.length,
      samples,
    });
  }

  controlsByType.sort((a, b) => b.count - a.count);

  return { total, controlsByType };
}

async function buildUiCatalog(xmlFiles) {
  const windows = [];
  for (const file of xmlFiles) {
    const absolutePath = path.join(xmlDir, file);
    const raw = await fs.readFile(absolutePath, 'utf-8');
    const parsed = parser.parse(raw);
    const windowNode = parsed.Window ?? parsed.window;

    if (!windowNode || !windowNode.id) {
      continue;
    }

    const { total, controlsByType } = extractControls(windowNode);

    windows.push({
      id: String(windowNode.id),
      file,
      size: {
        w: sanitiseNumber(windowNode.w),
        h: sanitiseNumber(windowNode.h),
      },
      position: {
        x: sanitiseNumber(windowNode.x),
        y: sanitiseNumber(windowNode.y),
      },
      controlTotal: total,
      controlTypes: controlsByType,
    });
  }

  windows.sort((a, b) => a.id.localeCompare(b.id));

  return {
    generatedAt: new Date().toISOString(),
    source: 'Legacy Client XML',
    totalWindows: windows.length,
    windows,
  };
}

async function buildSceneCatalog(uiCatalog) {
  const configPath = path.join(dataDir, 'scenes.config.json');
  const configExists = await fs.pathExists(configPath);
  if (!configExists) {
    log('Warnung: scenes.config.json fehlt. Es wird eine leere Liste erzeugt.');
    return [];
  }

  const config = await fs.readJSON(configPath);
  const windowIndex = new Map(uiCatalog.windows.map((entry) => [entry.id, entry]));

  return config.map((scene) => {
    const relatedWindows = (scene.relatedWindows ?? []).map((windowId) => {
      const ref = windowIndex.get(windowId);
      if (!ref) {
        log(`⚠️  Referenziertes Fenster "${windowId}" nicht gefunden (Szene: ${scene.id})`);
        return null;
      }

      return {
        id: ref.id,
        file: ref.file,
        size: ref.size,
        controlTotal: ref.controlTotal,
        controlTypes: ref.controlTypes.map(({ type, count }) => ({ type, count })),
      };
    }).filter(Boolean);

    return {
      ...scene,
      relatedWindows,
    };
  });
}

async function main() {
  try {
    const shouldRegenerate = await ensurePrerequisites();
    
    if (!shouldRegenerate) {
      log('✓ Verwende vorhandene Daten-Dateien.');
      
      // Still copy locales if they exist
      const localeDir = path.join(dataDir, 'locales');
      const targetLocaleDir = path.join(outputDir, 'locales');
      if (await fs.pathExists(localeDir)) {
        await fs.ensureDir(targetLocaleDir);
        const localeFiles = await globby('*.json', { cwd: localeDir });
        if (localeFiles.length > 0) {
          await Promise.all(
            localeFiles.map((file) =>
              fs.copyFile(path.join(localeDir, file), path.join(targetLocaleDir, file)),
            ),
          );
          log(`✓ ${localeFiles.length} Lokalisierungsdateien kopiert.`);
        }
      }
      return;
    }
    
    const xmlFiles = await globby('*.xml', { cwd: xmlDir });
    if (!xmlFiles.length) {
      log('Keine XML-Dateien gefunden. Abbruch.');
      return;
    }

    log(`Analysiere ${xmlFiles.length} XML-Dateien…`);
    const uiCatalog = await buildUiCatalog(xmlFiles);

    log(`Schreibe ui-windows.json (${uiCatalog.totalWindows} Fenster)…`);
    await fs.writeJSON(path.join(outputDir, 'ui-windows.json'), uiCatalog, { spaces: 2 });

    log('Kombiniere Szenen-Konfiguration…');
    const sceneCatalog = await buildSceneCatalog(uiCatalog);
    await fs.writeJSON(path.join(outputDir, 'scenes.json'), sceneCatalog, { spaces: 2 });

    log('Kopiere Lokalisierungen…');
    const localeDir = path.join(dataDir, 'locales');
    const targetLocaleDir = path.join(outputDir, 'locales');
    if (await fs.pathExists(localeDir)) {
      await fs.ensureDir(targetLocaleDir);
      const localeFiles = await globby('*.json', { cwd: localeDir });
      await Promise.all(
        localeFiles.map((file) =>
          fs.copyFile(path.join(localeDir, file), path.join(targetLocaleDir, file)),
        ),
      );
    } else {
      log('Keine Lokalisierungen gefunden.');
    }

    log('Datenaufbereitung abgeschlossen.');
  } catch (error) {
    console.error('[build-data] Fehler:', error);
    process.exitCode = 1;
  }
}

main();
