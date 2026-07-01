import { useState, useCallback } from 'react';
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

/** Convert total ms to [h, m, s] tuple */
function msToHMS(ms: number): [number, number, number] {
  const totalSec = Math.floor(ms / 1000);
  return [
    Math.floor(totalSec / 3600),
    Math.floor((totalSec % 3600) / 60),
    totalSec % 60,
  ];
}

function hmsToMs(h: number, m: number, s: number): number {
  return Math.max(0, (h * 3600 + m * 60 + s) * 1000);
}

const presets = [
  { label: '1分钟', ms: 60_000 },
  { label: '3分钟', ms: 3 * 60_000 },
  { label: '5分钟', ms: 5 * 60_000 },
  { label: '10分钟', ms: 10 * 60_000 },
  { label: '30分钟', ms: 30 * 60_000 },
];

export default function TimerScreen({ theme, state, onStart, onPause, onReset }: TimerScreenProps) {
  const [initialH, initialM, initialS] = msToHMS(state.durationMillis);
  const [h, setH] = useState(initialH);
  const [m, setM] = useState(initialM);
  const [s, setS] = useState(initialS);

  const isIdle = !state.isRunning && !state.isComplete;
  const text = formatDuration(state.remainingMillis, state.durationMillis >= 3600_000);

  const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, Math.round(v)));

  const startCustom = useCallback(() => {
    onStart(hmsToMs(h, m, s));
  }, [h, m, s, onStart]);

  // When reset, sync local state to the new duration
  const handleReset = useCallback(() => {
    onReset();
    const [nh, nm, ns] = msToHMS(state.durationMillis);
    setH(nh);
    setM(nm);
    setS(ns);
  }, [onReset, state.durationMillis]);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'clamp(8px, 2vh, 20px)',
        padding: '2vw 2vw max(80px, 10vh) 2vw',
      }}
    >
      {/* Flip display — fills available space */}
      <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {state.isComplete ? (
          <div
            style={{
              color: theme.accent,
              fontSize: 'clamp(24px, 5vw, 48px)',
              fontWeight: 700,
              animation: 'pulse 1s ease-in-out infinite',
            }}
          >
            ⏰ 时间到！
          </div>
        ) : (
          <FlipDurationDisplay text={text} theme={theme} />
        )}
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        {!state.isRunning ? (
          <>
            <Btn theme={theme} onClick={startCustom} primary>
              开始
            </Btn>
            <Btn theme={theme} onClick={handleReset}>重置</Btn>
          </>
        ) : (
          <Btn theme={theme} onClick={onPause} primary>暂停</Btn>
        )}
      </div>

      {/* Custom time picker — only when idle */}
      {isIdle && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(4px, 1vw, 12px)' }}>
            {/* Hours */}
            <TimeField
              value={h}
              onChange={(v) => setH(clamp(v, 0, 99))}
              label="时"
              theme={theme}
            />
            <span style={{ color: theme.digit, fontSize: 'clamp(14px, 2.5vw, 24px)', fontWeight: 300 }}>:</span>
            {/* Minutes */}
            <TimeField
              value={m}
              onChange={(v) => setM(clamp(v, 0, 59))}
              label="分"
              theme={theme}
            />
            <span style={{ color: theme.digit, fontSize: 'clamp(14px, 2.5vw, 24px)', fontWeight: 300 }}>:</span>
            {/* Seconds */}
            <TimeField
              value={s}
              onChange={(v) => setS(clamp(v, 0, 59))}
              label="秒"
              theme={theme}
            />
          </div>

          {/* Quick presets */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
            {presets.map((p) => (
              <button
                key={p.ms}
                onClick={() => {
                  const [ph, pm, ps] = msToHMS(p.ms);
                  setH(ph);
                  setM(pm);
                  setS(ps);
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
                {p.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/** A single time unit field with +/- buttons and a number display */
function TimeField({
  value,
  onChange,
  label,
  theme,
}: {
  value: number;
  onChange: (v: number) => void;
  label: string;
  theme: ClockTheme;
}) {
  const btnStyle: React.CSSProperties = {
    width: 'clamp(28px, 5vw, 40px)',
    height: 'clamp(28px, 5vw, 40px)',
    borderRadius: 8,
    border: `1px solid ${theme.date}`,
    background: 'transparent',
    color: theme.digit,
    fontSize: 'clamp(14px, 2vw, 20px)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <button style={btnStyle} onClick={() => onChange(value + 1)}>
        +
      </button>
      <div
        style={{
          color: theme.digit,
          fontSize: 'clamp(18px, 3.5vw, 36px)',
          fontWeight: 700,
          fontVariantNumeric: 'tabular-nums',
          minWidth: 'clamp(36px, 7vw, 60px)',
          textAlign: 'center',
          lineHeight: 1.1,
        }}
      >
        {String(value).padStart(2, '0')}
      </div>
      <button style={btnStyle} onClick={() => onChange(value - 1)}>
        −
      </button>
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
