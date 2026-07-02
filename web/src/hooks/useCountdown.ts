import { useState, useRef, useEffect, useMemo } from 'react';
import type { CountdownTarget, CountdownRemaining } from '../logic/productivityModels';
import { computeCountdownRemaining } from '../logic/formatDuration';

const STORAGE_KEY = 'flipclock_countdown';

interface StoredCountdownState {
  selectedId: string;
  customTargets: CountdownTarget[];
  hiddenPresets: string[];
}

/** Universal global dates — always resolved to the next occurrence. */
function nextDate(mmdd: string): string {
  const now = new Date();
  const y = now.getFullYear();
  const candidate = `${y}-${mmdd}`;
  if (new Date(candidate + 'T00:00:00').getTime() >= now.getTime()) return candidate;
  return `${y + 1}-${mmdd}`;
}

// Preset keys (not user-visible titles — titles come from i18n)
const presetKeys = [
  { id: 'newyear', mmdd: '01-01' },
  { id: 'valentine', mmdd: '02-14' },
  { id: 'christmas', mmdd: '12-25' },
  { id: 'nye', mmdd: '12-31' },
];

function readStoredState(): StoredCountdownState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { selectedId: 'newyear', customTargets: [], hiddenPresets: [] };
    const parsed = JSON.parse(raw) as Partial<StoredCountdownState>;
    return {
      selectedId: typeof parsed.selectedId === 'string' ? parsed.selectedId : 'newyear',
      customTargets: Array.isArray(parsed.customTargets)
        ? parsed.customTargets.filter((target): target is CountdownTarget =>
            typeof target?.id === 'string'
            && typeof target.title === 'string'
            && typeof target.date === 'string'
            && target.isPreset === false,
          )
        : [],
      hiddenPresets: Array.isArray(parsed.hiddenPresets) ? parsed.hiddenPresets : [],
    };
  } catch {
    return { selectedId: 'newyear', customTargets: [], hiddenPresets: [] };
  }
}

function writeStoredState(state: StoredCountdownState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function useCountdown() {
  const [storedState, setStoredState] = useState<StoredCountdownState>(readStoredState);
  const [now, setNow] = useState(Date.now());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const presets = useMemo<CountdownTarget[]>(
    () => presetKeys
      .filter((k) => !storedState.hiddenPresets.includes(k.id))
      .map((k) => ({
        id: k.id, title: k.id, date: nextDate(k.mmdd), isPreset: true,
      })),
    [storedState.hiddenPresets],
  );

  const targets = useMemo(
    () => [...presets, ...storedState.customTargets],
    [presets, storedState.customTargets],
  );

  const target = useMemo<CountdownTarget>(() => {
    return targets.find((item) => item.id === storedState.selectedId) ?? presets[0];
  }, [presets, storedState.selectedId, targets]);

  const remaining: CountdownRemaining = computeCountdownRemaining(target.date, now);

  const setTarget = (t: CountdownTarget) => {
    setStoredState((prev) => {
      const customTargets = t.isPreset
        ? prev.customTargets
        : [...prev.customTargets.filter((item) => item.id !== t.id), t];
      const next = { selectedId: t.id, customTargets, hiddenPresets: prev.hiddenPresets };
      writeStoredState(next);
      return next;
    });
  };

  const deleteTarget = (id: string) => {
    setStoredState((prev) => {
      const customTargets = prev.customTargets.filter((item) => item.id !== id);
      let hiddenPresets = prev.hiddenPresets;
      if (presetKeys.some((k) => k.id === id)) {
        hiddenPresets = [...new Set([...prev.hiddenPresets, id])];
      }
      const next = {
        selectedId: prev.selectedId === id ? 'newyear' : prev.selectedId,
        customTargets,
        hiddenPresets,
      };
      writeStoredState(next);
      return next;
    });
  };

  return { target, remaining, setTarget, deleteTarget, presets };
}
