import { useState, useCallback, useRef, useEffect } from 'react';
import type { PomodoroState, PomodoroMode, PomodoroSettings } from '../logic/productivityModels';
import { nextPomodoroMode } from '../logic/formatDuration';

const DEFAULT: PomodoroSettings = { focusMinutes: 25, shortBreakMinutes: 5, longBreakMinutes: 15 };

function modeDuration(mode: PomodoroMode, s: PomodoroSettings): number {
  if (mode === 'FOCUS') return s.focusMinutes * 60 * 1000;
  if (mode === 'SHORT_BREAK') return s.shortBreakMinutes * 60 * 1000;
  return s.longBreakMinutes * 60 * 1000;
}

interface UsePomodoroReturn {
  state: PomodoroState;
  start: () => void;
  pause: () => void;
  reset: () => void;
  dismissAlert: () => void;
  updateSettings: (s: PomodoroSettings) => void;
}

export function usePomodoro(): UsePomodoroReturn {
  const [settings, setSettings] = useState<PomodoroSettings>(DEFAULT);
  const [state, setState] = useState<PomodoroState>(() => ({
    mode: 'FOCUS',
    completedFocusSessions: 0,
    timer: { durationMillis: modeDuration('FOCUS', DEFAULT), remainingMillis: modeDuration('FOCUS', DEFAULT), isRunning: false, startedAtMillis: null, isComplete: false },
    showCompletionAlert: false,
  }));
  const rafRef = useRef<number>(0);
  const stateRef = useRef(state);
  stateRef.current = state;
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  const tick = useCallback(() => {
    setState((prev) => {
      if (!prev.timer.isRunning || prev.timer.startedAtMillis === null) return prev;
      const elapsed = Date.now() - prev.timer.startedAtMillis;
      const remaining = Math.max(0, prev.timer.durationMillis - elapsed);
      if (remaining <= 0) {
        const cur = stateRef.current;
        const s = settingsRef.current;
        const next = nextPomodoroMode(cur.mode, cur.completedFocusSessions);
        return {
          ...cur,
          mode: next.mode,
          completedFocusSessions: next.completedSessions,
          timer: { durationMillis: modeDuration(next.mode, s), remainingMillis: modeDuration(next.mode, s), isRunning: false, startedAtMillis: null, isComplete: true },
          showCompletionAlert: true,
        };
      }
      return { ...prev, timer: { ...prev.timer, remainingMillis: remaining } };
    });
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    if (state.timer.isRunning) {
      rafRef.current = requestAnimationFrame(tick);
    }
    return () => cancelAnimationFrame(rafRef.current);
  }, [state.timer.isRunning, tick]);

  const start = useCallback(() => {
    setState((prev) => ({
      ...prev,
      showCompletionAlert: false,
      timer: {
        ...prev.timer,
        durationMillis: modeDuration(prev.mode, settingsRef.current),
        remainingMillis: prev.timer.remainingMillis > 0 ? prev.timer.remainingMillis : modeDuration(prev.mode, settingsRef.current),
        isRunning: true,
        startedAtMillis: Date.now(),
        isComplete: false,
      },
    }));
  }, []);

  const pause = useCallback(() => {
    setState((prev) => {
      if (!prev.timer.isRunning || prev.timer.startedAtMillis === null) return prev;
      const elapsed = Date.now() - prev.timer.startedAtMillis;
      return {
        ...prev,
        timer: {
          ...prev.timer,
          remainingMillis: Math.max(0, prev.timer.durationMillis - elapsed),
          isRunning: false,
          startedAtMillis: null,
        },
      };
    });
  }, []);

  const reset = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    setState({
      mode: 'FOCUS',
      completedFocusSessions: 0,
      timer: { durationMillis: modeDuration('FOCUS', DEFAULT), remainingMillis: modeDuration('FOCUS', DEFAULT), isRunning: false, startedAtMillis: null, isComplete: false },
      showCompletionAlert: false,
    });
  }, []);

  const dismissAlert = useCallback(() => {
    setState((prev) => ({ ...prev, showCompletionAlert: false }));
  }, []);

  const updateSettings = useCallback((s: PomodoroSettings) => {
    setSettings(s);
  }, []);

  return { state, start, pause, reset, dismissAlert, updateSettings };
}
