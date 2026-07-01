import { useState, useCallback, useRef, useEffect } from 'react';
import type { CountdownTarget, CountdownRemaining } from '../logic/productivityModels';
import { computeCountdownRemaining } from '../logic/formatDuration';

interface UseCountdownReturn {
  target: CountdownTarget | null;
  remaining: CountdownRemaining;
  setTarget: (t: CountdownTarget) => void;
}

const defaultTarget: CountdownTarget = {
  id: 'newyear',
  title: '元旦',
  date: '2027-01-01',
  isPreset: true,
};

export const countdownPresets: CountdownTarget[] = [
  { id: 'newyear', title: '元旦', date: '2027-01-01', isPreset: true },
  { id: 'spring', title: '春节', date: '2027-01-29', isPreset: true },
  { id: 'valentine', title: '情人节', date: '2027-02-14', isPreset: true },
  { id: 'national', title: '国庆节', date: '2026-10-01', isPreset: true },
];

export function useCountdown(): UseCountdownReturn {
  const [target, setTarget] = useState<CountdownTarget>(defaultTarget);
  const [now, setNow] = useState(Date.now());
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    intervalRef.current = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const remaining = computeCountdownRemaining(target.date, now);

  return { target, remaining, setTarget };
}
