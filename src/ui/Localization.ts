import type { UIWindowSummary } from '../types';

export type LocaleCode = 'en' | 'de';

export class Localization {
  private dictionaries = new Map<LocaleCode, Record<string, string>>();
  private active: LocaleCode = 'de';

  async load(locale: LocaleCode) {
    if (this.dictionaries.has(locale)) {
      this.active = locale;
      return;
    }
    const response = await fetch(`/data/locales/${locale}.json`);
    if (!response.ok) {
      throw new Error(`Locale ${locale} konnte nicht geladen werden.`);
    }
    const dict = (await response.json()) as Record<string, string>;
    this.dictionaries.set(locale, dict);
    this.active = locale;
  }

  t(key: string, fallback = key) {
    const dict = this.dictionaries.get(this.active);
    return dict?.[key] ?? fallback;
  }

  get current(): LocaleCode {
    return this.active;
  }
}

export function guessWindowTitle(window: UIWindowSummary): string {
  const map: Record<string, string> = {
    teleport: 'ui.teleport.title',
    affiniti_info: 'ui.affinity.title',
  };
  return map[window.id] ?? window.id;
}
