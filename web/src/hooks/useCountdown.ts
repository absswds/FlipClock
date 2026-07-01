import { useState, useRef, useEffect, useMemo } from 'react';
import type { CountdownTarget, CountdownRemaining } from '../logic/productivityModels';
import { computeCountdownRemaining } from '../logic/formatDuration';

interface UseCountdownReturn {
  target: CountdownTarget | null;
  remaining: CountdownRemaining;
  setTarget: (t: CountdownTarget) => void;
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

export function useCountdown() {
  const [targetId, setTargetId] = useState('newyear');
  const [now, setNow] = useState(Date.now());
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    intervalRef.current = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const target = useMemo<CountdownTarget>(() => {
    const p = presetKeys.find((k) => k.id === targetId) ?? presetKeys[0];
    return { id: p.id, title: p.id, date: nextDate(p.mmdd), isPreset: true };
  }, [targetId]);

  const remaining = computeCountdownRemaining(target.date, now);

  const presets = useMemo<CountdownTarget[]>(
    () => presetKeys.map((k) => ({
      id: k.id, title: k.id, date: nextDate(k.mmdd), isPreset: true,
    })),
    [],
  );

  const setTarget = (t: CountdownTarget) => {
    setTargetId(t.id);
  };

  return { target, remaining, setTarget, presets };
}
