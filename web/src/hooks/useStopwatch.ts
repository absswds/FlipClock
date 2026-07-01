import { useState, useRef, useCallback, useEffect } from 'react';
import type { StopwatchState } from '../logic/productivityModels';

export function useStopwatch() {
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);

  const startTimeRef = useRef(0);
  const accumulatedRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }
  }, []);

  useEffect(() => clearTimer, [clearTimer]);

  const tick = useCallback(() => {
    setElapsed(accumulatedRef.current + (performance.now() - startTimeRef.current));
  }, []);

  const start = useCallback(() => {
    accumulatedRef.current = elapsed;
    startTimeRef.current = performance.now();
    setIsRunning(true);
    clearTimer();
    intervalRef.current = setInterval(tick, 34); // ~30fps
  }, [elapsed, tick, clearTimer]);

  const pause = useCallback(() => {
    accumulatedRef.current += performance.now() - startTimeRef.current;
    setElapsed(accumulatedRef.current);
    setIsRunning(false);
    clearTimer();
  }, [clearTimer]);

  const reset = useCallback(() => {
    clearTimer();
    accumulatedRef.current = 0;
    startTimeRef.current = 0;
    setElapsed(0);
    setIsRunning(false);
    setLaps([]);
  }, [clearTimer]);

  const lap = useCallback(() => {
    setLaps((prev) => [...prev, elapsed]);
  }, [elapsed]);

  const state: StopwatchState = {
    elapsedMillis: elapsed,
    isRunning,
    startedAtMillis: isRunning ? startTimeRef.current : null,
    lapsMillis: laps,
  };

  return { state, start, pause, reset, lap };
}
