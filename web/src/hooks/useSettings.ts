import { useState, useCallback, useEffect } from 'react';
import type { UserSettings, TimeFormat } from '../logic/buildState';

const STORAGE_KEY = 'flipclock_settings';
const LEGACY_DEFAULT_SIGNATURES = new Set(['翻页时钟']);

function defaultSettings(): UserSettings {
  return {
    timeFormat: 'H24',
    showSeconds: true,
    signature: '',
    themeId: 'paper_desk',
    themeCustomized: false,
    language: 'auto',
    timezone: 'auto',
    dateFontSize: 28,
    signatureFontSize: 16,
  };
}

function loadSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultSettings();
    const parsed = JSON.parse(raw);
    const settings = { ...defaultSettings(), ...parsed };
    if (LEGACY_DEFAULT_SIGNATURES.has(settings.signature)) {
      settings.signature = '';
    }
    if (settings.themeId === 'classic_black' && settings.themeCustomized !== true) {
      settings.themeId = 'paper_desk';
      settings.themeCustomized = false;
    }
    return settings;
  } catch {
    return defaultSettings();
  }
}

function saveSettings(settings: UserSettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

/**
 * Returns the resolved language code for Intl APIs.
 * 'auto' resolves from navigator.language; otherwise returns the stored value.
 */
export function resolveLanguage(settings: UserSettings): string {
  if (settings.language !== 'auto') return settings.language;
  const nav = navigator.language;
  if (nav.startsWith('zh')) return 'zh';
  if (nav.startsWith('ja')) return 'ja';
  return 'zh'; // default fallback
}

/**
 * Returns the resolved timezone IANA string.
 * 'auto' resolves from Intl; otherwise returns the stored value.
 */
export function resolveTimezone(settings: UserSettings): string {
  if (settings.timezone !== 'auto') return settings.timezone;
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

export function useSettings() {
  const [settings, setSettings] = useState<UserSettings>(loadSettings);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  const update = useCallback((patch: Partial<UserSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      saveSettings(next);
      return next;
    });
  }, []);

  const setTimeFormat = useCallback(
    (f: TimeFormat) => update({ timeFormat: f }),
    [update],
  );
  const setShowSeconds = useCallback(
    (v: boolean) => update({ showSeconds: v }),
    [update],
  );
  const setSignature = useCallback(
    (v: string) => update({ signature: v }),
    [update],
  );
  const setThemeId = useCallback(
    (v: string) => update({ themeId: v, themeCustomized: true }),
    [update],
  );
  const setLanguage = useCallback(
    (v: string) => update({ language: v }),
    [update],
  );
  const setTimezone = useCallback(
    (v: string) => update({ timezone: v || 'auto' }),
    [update],
  );
  const setDateFontSize = useCallback(
    (v: number) => update({ dateFontSize: v }),
    [update],
  );
  const setSignatureFontSize = useCallback(
    (v: number) => update({ signatureFontSize: v }),
    [update],
  );

  return {
    settings,
    update,
    setTimeFormat,
    setShowSeconds,
    setSignature,
    setThemeId,
    setLanguage,
    setTimezone,
    setDateFontSize,
    setSignatureFontSize,
  };
}
