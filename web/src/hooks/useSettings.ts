import { useState, useCallback, useEffect } from 'react';
import type { UserSettings, TimeFormat } from '../logic/buildState';

const STORAGE_KEY = 'flipclock_settings';

function defaultSettings(): UserSettings {
  return {
    timeFormat: 'H24',
    showSeconds: true,
    signature: '翻页时钟',
    themeId: 'classic_black',
    language: 'auto',
    timezone: 'auto',
  };
}

function loadSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultSettings();
    const parsed = JSON.parse(raw);
    return { ...defaultSettings(), ...parsed };
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
    (v: string) => update({ themeId: v }),
    [update],
  );
  const setLanguage = useCallback(
    (v: string) => update({ language: v }),
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
  };
}
