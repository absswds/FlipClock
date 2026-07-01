import { useState, useCallback, useRef, useEffect } from 'react';
import type { StopwatchState } from '../logic/productivityModels';

interface UseStopwatchReturn {
  state: StopwatchState;
  start: () => void;
  pause: () => void;
  reset: () => void;
  lap: () => void;
}

export function useStopwatch(): UseStopwatchReturn {
  const [state, setState] = useState<StopwatchState>({
    elapsedMillis: 0,
    isRunning: false,
    startedAtMillis: null,
    lapsMillis: [],
  });
  const rafRef = useRef<number>(0);

  const tick = useCallback(() => {
    setState((prev) => {
      if (!prev.isRunning || prev.startedAtMillis === null) return prev;
      const elapsed = Date.now() - prev.startedAtMillis + prev.elapsedMillis;
      return { ...prev, elapsedMillis: elapsed };
    });
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    if (state.isRunning) {
      rafRef.current = requestAnimationFrame(tick);
    }
    return () => cancelAnimationFrame(rafRef.current);
  }, [state.isRunning, tick]);

  const start = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isRunning: true,
      startedAtMillis: Date.now(),
      // elapsedMillis keeps its accumulated value — timer ticks from here add to it
    }));
  }, []);

  const pause = useCallback(() => {
    setState((prev) => {
      if (!prev.isRunning || prev.startedAtMillis === null) return prev;
      return {
        ...prev,
        elapsedMillis: Date.now() - prev.startedAtMillis + prev.elapsedMillis,
        isRunning: false,
        startedAtMillis: null,
      };
    });
  }, []);

  const reset = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    setState({ elapsedMillis: 0, isRunning: false, startedAtMillis: null, lapsMillis: [] });
  }, []);

  const lap = useCallback(() => {
    setState((prev) => ({
      ...prev,
      lapsMillis: [...prev.lapsMillis, prev.elapsedMillis],
    }));
  }, []);

  return { state, start, pause, reset, lap };
}
