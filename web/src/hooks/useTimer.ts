import { useState, useRef, useCallback, useEffect } from 'react';
import type { TimerState } from '../logic/productivityModels';

export function useTimer(initialDurationMs = 5 * 60 * 1000) {
  const [remaining, setRemaining] = useState(initialDurationMs);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [duration, setDuration] = useState(initialDurationMs);

  const startTimeRef = useRef(0);
  const startedRemainingRef = useRef(initialDurationMs);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }
  }, []);

  useEffect(() => clearTimer, [clearTimer]);

  const start = useCallback((durationMs?: number) => {
    const dur = durationMs ?? duration;
    startedRemainingRef.current = dur;
    setDuration(dur);
    startTimeRef.current = performance.now();
    setIsRunning(true);
    setIsComplete(false);
    clearTimer();
    intervalRef.current = setInterval(() => {
      const elapsed = performance.now() - startTimeRef.current;
      const rem = Math.max(0, startedRemainingRef.current - elapsed);
      setRemaining(rem);
      if (rem <= 0) {
        setIsRunning(false);
        setIsComplete(true);
        clearTimer();
      }
    }, 34);
  }, [duration, clearTimer]);

  const pause = useCallback(() => {
    clearTimer();
    const elapsed = performance.now() - startTimeRef.current;
    const rem = Math.max(0, startedRemainingRef.current - elapsed);
    setRemaining(rem);
    setIsRunning(false);
  }, [clearTimer]);

  const reset = useCallback(() => {
    clearTimer();
    setRemaining(duration);
    setIsRunning(false);
    setIsComplete(false);
  }, [duration, clearTimer]);

  const state: TimerState = {
    durationMillis: duration,
    remainingMillis: remaining,
    isRunning,
    startedAtMillis: isRunning ? startTimeRef.current : null,
    isComplete,
  };

  return { state, start, pause, reset };
}
