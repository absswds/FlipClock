import { useEffect, useRef } from 'react';
import type { ClockTheme } from '../logic/themes';
import type { PomodoroState, PomodoroSettings } from '../logic/productivityModels';
import type { Lang } from '../logic/i18n';
import { t } from '../logic/i18n';
import { formatDuration } from '../logic/formatDuration';
import { alertComplete } from '../logic/notify';
import FlipDurationDisplay from './FlipDurationDisplay';

interface PomodoroScreenProps {
  theme: ClockTheme;
  state: PomodoroState;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onDismissAlert: () => void;
  onUpdateSettings: (s: PomodoroSettings) => void;
  lang: Lang;
}


export default function PomodoroScreen({
  theme, state, onStart, onPause, onReset, onDismissAlert, onUpdateSettings, lang,
}: PomodoroScreenProps) {
  const text = formatDuration(state.timer.remainingMillis);
  const isFocus = state.mode === 'FOCUS';

  const wasAlert = useRef(false);
  useEffect(() => {
    if (state.showCompletionAlert && !wasAlert.current) {
      wasAlert.current = true;
      const title = state.mode === 'FOCUS' ? t(lang, 'focusDone') : t(lang, 'breakDone');
      alertComplete(title, '');
    }
    if (!state.showCompletionAlert) wasAlert.current = false;
  }, [state.showCompletionAlert, state.mode, lang]);
  const modeLabel = isFocus ? t(lang, 'focusMode') : state.mode === 'SHORT_BREAK' ? t(lang, 'shortBreak') : t(lang, 'longBreak');

  return (
    <div className="page-panel" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'clamp(8px, 2vh, 18px)', padding: '2vw 2vw max(80px, 10vh) 2vw' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{
          padding: '3px 12px', borderRadius: 12,
          background: isFocus ? `${theme.accent}33` : `${theme.signature}22`,
          color: isFocus ? theme.accent : theme.signature,
          fontSize: 'clamp(10px, 1.3vw, 14px)', fontWeight: 600,
        }}>
          {modeLabel}
        </span>
        <span style={{ color: theme.signature, fontSize: 'clamp(10px, 1.1vw, 12px)' }}>
          #{state.completedFocusSessions} {t(lang, 'completed')}
        </span>
      </div>

      {state.showCompletionAlert && (
        <div
          onClick={state.mode === 'FOCUS' ? onDismissAlert : () => { onDismissAlert(); onStart(); }}
          style={{
            padding: '10px 24px', borderRadius: 8, background: theme.accent,
            color: theme.background, fontWeight: 700,
            fontSize: 'clamp(14px, 2vw, 20px)', cursor: 'pointer',
            animation: 'pulse 1s ease-in-out infinite',
          }}
        >
          {state.mode === 'FOCUS' ? t(lang, 'focusDone') : t(lang, 'breakDone')}
        </div>
      )}

      {!state.showCompletionAlert && (
        <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <FlipDurationDisplay text={text} theme={theme} />
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        {!state.timer.isRunning ? (
          <>
            <Btn theme={theme} onClick={onStart} primary>{t(lang, 'start')}</Btn>
            <Btn theme={theme} onClick={onReset}>{t(lang, 'reset')}</Btn>
          </>
        ) : (
          <Btn theme={theme} onClick={onPause} primary>{t(lang, 'pause')}</Btn>
        )}
      </div>

      {!state.timer.isRunning && state.mode === 'FOCUS' && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
          {[15, 25, 30, 45, 60].map((m) => (
            <button
              key={m}
              className="soft-button"
              onClick={() => {
                onUpdateSettings({ focusMinutes: m, shortBreakMinutes: 5, longBreakMinutes: 15 });
                onReset();
              }}
              style={{
                padding: '3px 10px', borderRadius: 5,
                border: `1px solid ${theme.date}`, background: 'transparent',
                color: theme.signature, cursor: 'pointer',
                fontSize: 'clamp(9px, 1.1vw, 12px)',
              }}
            >
              {m}{t(lang, 'day') === 'd' ? 'm' : '分'}
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
      className="soft-button"
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
