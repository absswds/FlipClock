import { useState, useRef, useCallback, useEffect } from 'react';
import type { PomodoroState, PomodoroMode, PomodoroSettings } from '../logic/productivityModels';
import { nextPomodoroMode } from '../logic/formatDuration';

const DEFAULT: PomodoroSettings = { focusMinutes: 25, shortBreakMinutes: 5, longBreakMinutes: 15 };

function modeDuration(mode: PomodoroMode, s: PomodoroSettings): number {
  if (mode === 'FOCUS') return s.focusMinutes * 60 * 1000;
  if (mode === 'SHORT_BREAK') return s.shortBreakMinutes * 60 * 1000;
  return s.longBreakMinutes * 60 * 1000;
}

export function usePomodoro() {
  const [settings, setSettings] = useState<PomodoroSettings>(DEFAULT);
  const [mode, setMode] = useState<PomodoroMode>('FOCUS');
  const [completed, setCompleted] = useState(0);
  const [remaining, setRemaining] = useState(modeDuration('FOCUS', DEFAULT));
  const [isRunning, setIsRunning] = useState(false);
  const [alert, setAlert] = useState(false);

  const startTimeRef = useRef(0);
  const startedRemainingRef = useRef(modeDuration('FOCUS', DEFAULT));
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => clearTimer, [clearTimer]);

  const start = useCallback(() => {
    setAlert(false);
    startTimeRef.current = performance.now();
    startedRemainingRef.current = remaining > 0 ? remaining : modeDuration(mode, settingsRef.current);
    setIsRunning(true);
    clearTimer();
    intervalRef.current = setInterval(() => {
      const elapsed = performance.now() - startTimeRef.current;
      const rem = Math.max(0, startedRemainingRef.current - elapsed);
      setRemaining(rem);
      if (rem <= 0) {
        // Auto-advance
        setMode((prevMode) => {
          setCompleted((c) => {
            const next = nextPomodoroMode(prevMode, c);
            setMode(next.mode);
            setRemaining(modeDuration(next.mode, settingsRef.current));
            return next.completedSessions;
          });
          return prevMode;
        });
        setIsRunning(false);
        setAlert(true);
        clearTimer();
      }
    }, 34);
  }, [remaining, mode, clearTimer]);

  const pause = useCallback(() => {
    clearTimer();
    const elapsed = performance.now() - startTimeRef.current;
    setRemaining(Math.max(0, startedRemainingRef.current - elapsed));
    setIsRunning(false);
  }, [clearTimer]);

  const reset = useCallback(() => {
    clearTimer();
    setMode('FOCUS');
    setCompleted(0);
    setRemaining(modeDuration('FOCUS', settingsRef.current));
    setIsRunning(false);
    setAlert(false);
  }, [clearTimer]);

  const dismissAlert = useCallback(() => setAlert(false), []);
  const updateSettings = useCallback((s: PomodoroSettings) => {
    setSettings(s);
    if (!isRunning) {
      setRemaining(modeDuration(mode, s));
    }
  }, [isRunning, mode]);

  return {
    state: {
      mode,
      completedFocusSessions: completed,
      timer: {
        durationMillis: modeDuration(mode, settings),
        remainingMillis: remaining,
        isRunning,
        startedAtMillis: isRunning ? startTimeRef.current : null,
        isComplete: alert && mode === 'FOCUS',
      },
      showCompletionAlert: alert,
    } as PomodoroState,
    start, pause, reset, dismissAlert, updateSettings,
  };
}
