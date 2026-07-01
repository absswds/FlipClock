import type { ClockTheme } from '../logic/themes';
import type { CountdownTarget, CountdownRemaining } from '../logic/productivityModels';
import { countdownPresets } from '../hooks/useCountdown';
import FlipDurationDisplay from './FlipDurationDisplay';

interface CountdownScreenProps {
  theme: ClockTheme;
  target: CountdownTarget;
  remaining: CountdownRemaining;
  onSetTarget: (t: CountdownTarget) => void;
}

export default function CountdownScreen({ theme, target, remaining, onSetTarget }: CountdownScreenProps) {
  const dayDigits = remaining.days.toString().split('').map(Number);
  const timeText = `${String(remaining.hours).padStart(2, '0')}:${String(remaining.minutes).padStart(2, '0')}:${String(remaining.seconds).padStart(2, '0')}`;

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'clamp(8px, 2vh, 18px)', padding: '2vw 2vw max(80px, 10vh) 2vw' }}>
      {/* Target title */}
      <div style={{ color: theme.date, fontSize: 'clamp(12px, 1.6vw, 18px)', fontWeight: 500 }}>
        {target.title}
      </div>

      {/* Day count + HH:MM:SS — fills available space */}
      <div style={{ flex: 1, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        {/* Days */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{
            color: theme.digit,
            fontSize: 'clamp(28px, 6vw, 64px)',
            fontWeight: 900,
            fontVariantNumeric: 'tabular-nums',
            lineHeight: 1,
            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
          }}>
            {remaining.days}
          </span>
          <span style={{ color: theme.signature, fontSize: 'clamp(14px, 2.5vw, 24px)', marginLeft: 4 }}>
            天
          </span>
        </div>

        {/* HH:MM:SS */}
        <div style={{ width: '100%', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <FlipDurationDisplay text={timeText} theme={theme} />
        </div>
      </div>

      {/* Preset targets */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
        {countdownPresets.map((p) => (
          <button
            key={p.id}
            onClick={() => onSetTarget(p)}
            style={{
              padding: '6px 14px',
              borderRadius: 6,
              border: target.id === p.id ? `2px solid ${theme.accent}` : `1px solid ${theme.date}`,
              background: target.id === p.id ? `${theme.accent}22` : 'transparent',
              color: target.id === p.id ? theme.accent : theme.signature,
              cursor: 'pointer',
              fontSize: 'clamp(10px, 1.2vw, 13px)',
            }}
          >
            {p.title}
          </button>
        ))}
      </div>
    </div>
  );
}
