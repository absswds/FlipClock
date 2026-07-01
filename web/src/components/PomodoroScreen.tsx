import type { ClockTheme } from '../logic/themes';
import type { PomodoroState, PomodoroSettings } from '../logic/productivityModels';
import { formatDuration } from '../logic/formatDuration';
import FlipDurationDisplay from './FlipDurationDisplay';

interface PomodoroScreenProps {
  theme: ClockTheme;
  state: PomodoroState;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onDismissAlert: () => void;
  onUpdateSettings: (s: PomodoroSettings) => void;
}

const modeLabels: Record<string, string> = {
  FOCUS: '专注',
  SHORT_BREAK: '短休息',
  LONG_BREAK: '长休息',
};

export default function PomodoroScreen({
  theme,
  state,
  onStart,
  onPause,
  onReset,
  onDismissAlert,
  onUpdateSettings,
}: PomodoroScreenProps) {
  const text = formatDuration(state.timer.remainingMillis);
  const isFocus = state.mode === 'FOCUS';

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'clamp(8px, 2vh, 18px)', padding: '2vw 2vw max(80px, 10vh) 2vw' }}>
      {/* Mode indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span
          style={{
            padding: '3px 12px',
            borderRadius: 12,
            background: isFocus ? `${theme.accent}33` : `${theme.signature}22`,
            color: isFocus ? theme.accent : theme.signature,
            fontSize: 'clamp(10px, 1.3vw, 14px)',
            fontWeight: 600,
          }}
        >
          {modeLabels[state.mode]}
        </span>
        <span style={{ color: theme.signature, fontSize: 'clamp(10px, 1.1vw, 12px)' }}>
          #{state.completedFocusSessions} 完成
        </span>
      </div>

      {/* Alert */}
      {state.showCompletionAlert && (
        <div
          onClick={state.mode === 'FOCUS' ? onDismissAlert : () => { onDismissAlert(); onStart(); }}
          style={{
            padding: '10px 24px',
            borderRadius: 8,
            background: theme.accent,
            color: theme.background,
            fontWeight: 700,
            fontSize: 'clamp(14px, 2vw, 20px)',
            cursor: 'pointer',
            animation: 'pulse 1s ease-in-out infinite',
          }}
        >
          {state.mode === 'FOCUS' ? '🎉 专注完成！休息一下' : '⏰ 休息结束，继续专注！'}
        </div>
      )}

      {/* Timer display — fills available space */}
      {!state.showCompletionAlert && (
        <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <FlipDurationDisplay text={text} theme={theme} />
        </div>
      )}

      {/* Controls */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        {!state.timer.isRunning ? (
          <>
            <Btn theme={theme} onClick={onStart} primary>开始</Btn>
            <Btn theme={theme} onClick={onReset}>重置</Btn>
          </>
        ) : (
          <Btn theme={theme} onClick={onPause} primary>暂停</Btn>
        )}
      </div>

      {/* Quick duration settings (only when paused) */}
      {!state.timer.isRunning && state.mode === 'FOCUS' && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
          {[15, 25, 30, 45, 60].map((m) => (
            <button
              key={m}
              onClick={() => {
                onUpdateSettings({ focusMinutes: m, shortBreakMinutes: 5, longBreakMinutes: 15 });
                onReset();
              }}
              style={{
                padding: '3px 10px',
                borderRadius: 5,
                border: `1px solid ${theme.date}`,
                background: 'transparent',
                color: theme.signature,
                cursor: 'pointer',
                fontSize: 'clamp(9px, 1.1vw, 12px)',
              }}
            >
              {m}分
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
