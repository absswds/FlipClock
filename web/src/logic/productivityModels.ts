// Port of ProductivityModels.kt

export interface TimerState {
  durationMillis: number;
  remainingMillis: number;
  isRunning: boolean;
  startedAtMillis: number | null;
  isComplete: boolean;
}

export interface StopwatchState {
  elapsedMillis: number;
  isRunning: boolean;
  startedAtMillis: number | null;
  lapsMillis: number[];
}

export interface CountdownTarget {
  id: string;
  title: string;
  date: string; // ISO date string
  isPreset: boolean;
}

export interface CountdownRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isFuture: boolean;
}

export interface PomodoroSettings {
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
}

export type PomodoroMode = 'FOCUS' | 'SHORT_BREAK' | 'LONG_BREAK';

export interface PomodoroState {
  mode: PomodoroMode;
  completedFocusSessions: number;
  timer: TimerState;
  showCompletionAlert: boolean;
}

export interface ProductivitySettings {
  timerDefaultMillis: number;
  countdownTargets: CountdownTarget[];
  selectedCountdownId: string | null;
  pomodoroSettings: PomodoroSettings;
}
