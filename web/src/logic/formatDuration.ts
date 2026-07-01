// Port of ProductivityFormat.kt

import type { PomodoroMode } from './productivityModels';

export function formatDuration(millis: number, showHours = true): string {
  const totalSeconds = Math.max(0, Math.floor(millis / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (showHours || hours > 0) {
    return `${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)}`;
  }
  return `${pad2(minutes)}:${pad2(seconds)}`;
}

function pad2(n: number): string {
  return n.toString().padStart(2, '0');
}

// Port of splitFlipText from FlipDurationDisplay.kt
export type FlipTextPart =
  | { type: 'digits'; digits: number[] }
  | { type: 'separator'; text: string };

export function splitFlipText(text: string): FlipTextPart[] {
  if (!text) return [];

  const parts: FlipTextPart[] = [];
  let i = 0;
  while (i < text.length) {
    const start = i;
    const digitRun = /\d/.test(text[i]);
    while (i < text.length && /\d/.test(text[i]) === digitRun) {
      i++;
    }
    const chunk = text.slice(start, i);
    if (digitRun) {
      parts.push({ type: 'digits', digits: chunk.split('').map(Number) });
    } else {
      parts.push({ type: 'separator', text: chunk });
    }
  }
  return parts;
}

export interface FlipDurationLayout {
  glyphWidth: number;
  cardHeight: number;
  fontSize: number;
  separatorWidth: number;
  separatorFontSize: number;
}

export function calculateFlipDurationLayout(
  digitCount: number,
  separatorCount: number,
  maxWidth: number,
  maxHeight: number,
): FlipDurationLayout {
  const safeDigitCount = Math.max(1, digitCount);
  const separatorWeight = 0.18;
  const weightedGlyphs = safeDigitCount + separatorCount * separatorWeight;
  const targetWidth = maxWidth * 0.96;
  let glyphWidth = targetWidth / weightedGlyphs;
  let cardHeight = glyphWidth * 1.78;
  const maxCardHeight = maxHeight * 0.88;
  if (cardHeight > maxCardHeight) {
    cardHeight = maxCardHeight;
    glyphWidth = cardHeight / 1.78;
  }

  return {
    glyphWidth,
    cardHeight,
    fontSize: glyphWidth * 1.52,
    separatorWidth: glyphWidth * separatorWeight,
    separatorFontSize: cardHeight * 0.42,
  };
}

// Port of TimerCalculator: compute remaining from wall-clock
export function computeTimerRemaining(
  durationMillis: number,
  startedAtMillis: number | null,
  isRunning: boolean,
  nowMillis: number,
): number {
  if (!isRunning || startedAtMillis === null) return durationMillis;
  const elapsed = nowMillis - startedAtMillis;
  return Math.max(0, durationMillis - elapsed);
}

// Port of StopwatchCalculator: compute elapsed from wall-clock
export function computeStopwatchElapsed(
  currentElapsed: number,
  startedAtMillis: number | null,
  isRunning: boolean,
  nowMillis: number,
): number {
  if (!isRunning || startedAtMillis === null) return currentElapsed;
  return currentElapsed + (nowMillis - startedAtMillis);
}

// Port of CountdownCalculator: compute remaining time from target date
export function computeCountdownRemaining(targetDateStr: string, nowMillis: number): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isFuture: boolean;
} {
  const target = new Date(targetDateStr + 'T00:00:00').getTime();
  const diff = target - nowMillis;
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isFuture: false };
  }
  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds, isFuture: true };
}

// Pomodoro engine: determine next mode after timer completes
export function nextPomodoroMode(
  currentMode: PomodoroMode,
  completedSessions: number,
): { mode: PomodoroMode; completedSessions: number } {
  if (currentMode === 'FOCUS') {
    const newCount = completedSessions + 1;
    if (newCount % 4 === 0) {
      return { mode: 'LONG_BREAK', completedSessions: newCount };
    }
    return { mode: 'SHORT_BREAK', completedSessions: newCount };
  }
  // After any break, go back to focus
  return { mode: 'FOCUS', completedSessions };
}

