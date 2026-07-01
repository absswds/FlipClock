import { useState } from 'react';
import type { ClockTheme } from '../logic/themes';
import type { TimerState } from '../logic/productivityModels';
import { formatDuration } from '../logic/formatDuration';
import FlipDurationDisplay from './FlipDurationDisplay';

interface TimerScreenProps {
  theme: ClockTheme;
  state: TimerState;
  onStart: (durationMs?: number) => void;
  onPause: () => void;
  onReset: () => void;
}

const presets = [
  { label: '1分', ms: 60_000 },
  { label: '3分', ms: 3 * 60_000 },
  { label: '5分', ms: 5 * 60_000 },
  { label: '10分', ms: 10 * 60_000 },
  { label: '15分', ms: 15 * 60_000 },
  { label: '30分', ms: 30 * 60_000 },
];

export default function TimerScreen({ theme, state, onStart, onPause, onReset }: TimerScreenProps) {
  const text = formatDuration(state.remainingMillis, state.durationMillis >= 3600_000);

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'clamp(12px, 2vh, 24px)', padding: '2vw' }}>
      {state.isComplete ? (
        <div style={{ color: theme.accent, fontSize: 'clamp(18px, 3vw, 32px)', fontWeight: 700, animation: 'pulse 1s ease-in-out infinite' }}>
          ⏰ 时间到！
        </div>
      ) : (
        <FlipDurationDisplay text={text} theme={theme} />
      )}

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        {!state.isRunning ? (
          <>
            <Btn theme={theme} onClick={() => onStart()} primary>
              开始
            </Btn>
            <Btn theme={theme} onClick={onReset}>重置</Btn>
          </>
        ) : (
          <Btn theme={theme} onClick={onPause} primary>暂停</Btn>
        )}
      </div>

      {!state.isRunning && !state.isComplete && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
          {presets.map((p) => (
            <button
              key={p.ms}
              onClick={() => onStart(p.ms)}
              style={{
                padding: '4px 12px',
                borderRadius: 6,
                border: `1px solid ${theme.date}`,
                background: state.durationMillis === p.ms ? `${theme.accent}22` : 'transparent',
                color: state.durationMillis === p.ms ? theme.accent : theme.signature,
                cursor: 'pointer',
                fontSize: 'clamp(10px, 1.2vw, 13px)',
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Btn({ theme, onClick, primary, children }: { theme: ClockTheme; onClick: () => void; primary?: boolean; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '10px 28px',
        borderRadius: 8,
        border: primary ? 'none' : `1px solid ${theme.date}`,
        background: primary ? theme.accent : 'transparent',
        color: primary ? theme.background : theme.digit,
        fontWeight: primary ? 700 : 400,
        fontSize: 'clamp(12px, 1.5vw, 16px)',
        cursor: 'pointer',
      }}
    >
      {children}
    </button>
  );
}
