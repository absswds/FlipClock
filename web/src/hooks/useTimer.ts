import { useState, useCallback, useRef, useEffect } from 'react';
import type { TimerState } from '../logic/productivityModels';

interface UseTimerReturn {
  state: TimerState;
  start: (durationMs?: number) => void;
  pause: () => void;
  reset: () => void;
}

export function useTimer(initialDurationMs = 5 * 60 * 1000): UseTimerReturn {
  const [state, setState] = useState<TimerState>(() => ({
    durationMillis: initialDurationMs,
    remainingMillis: initialDurationMs,
    isRunning: false,
    startedAtMillis: null,
    isComplete: false,
  }));
  const rafRef = useRef<number>(0);

  const tick = useCallback(() => {
    setState((prev) => {
      if (!prev.isRunning || prev.startedAtMillis === null) return prev;
      const elapsed = Date.now() - prev.startedAtMillis;
      const remaining = Math.max(0, prev.durationMillis - elapsed);
      if (remaining <= 0) {
        return { ...prev, remainingMillis: 0, isRunning: false, isComplete: true, startedAtMillis: null };
      }
      return { ...prev, remainingMillis: remaining };
    });
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    if (state.isRunning) {
      rafRef.current = requestAnimationFrame(tick);
    }
    return () => cancelAnimationFrame(rafRef.current);
  }, [state.isRunning, tick]);

  const start = useCallback((durationMs?: number) => {
    setState((prev) => ({
      durationMillis: durationMs ?? prev.durationMillis,
      remainingMillis: durationMs ?? prev.durationMillis,
      isRunning: true,
      startedAtMillis: Date.now(),
      isComplete: false,
    }));
  }, []);

  const pause = useCallback(() => {
    setState((prev) => {
      if (!prev.isRunning || prev.startedAtMillis === null) return prev;
      const elapsed = Date.now() - prev.startedAtMillis;
      return {
        ...prev,
        remainingMillis: Math.max(0, prev.durationMillis - elapsed),
        isRunning: false,
        startedAtMillis: null,
        isComplete: false,
      };
    });
  }, []);

  const reset = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    setState({
      durationMillis: initialDurationMs,
      remainingMillis: initialDurationMs,
      isRunning: false,
      startedAtMillis: null,
      isComplete: false,
    });
  }, [initialDurationMs]);

  return { state, start, pause, reset };
}
