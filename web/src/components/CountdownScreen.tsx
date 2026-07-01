import type { ClockTheme } from '../logic/themes';
import type { CountdownTarget, CountdownRemaining } from '../logic/productivityModels';
import { countdownPresets } from '../hooks/useCountdown';
import UnitFlipCard from './UnitFlipCard';
import FlipDurationDisplay from './FlipDurationDisplay';

interface CountdownScreenProps {
  theme: ClockTheme;
  target: CountdownTarget;
  remaining: CountdownRemaining;
  onSetTarget: (t: CountdownTarget) => void;
}

export default function CountdownScreen({ theme, target, remaining, onSetTarget }: CountdownScreenProps) {
  const timeText = `${String(remaining.hours).padStart(2, '0')}:${String(remaining.minutes).padStart(2, '0')}:${String(remaining.seconds).padStart(2, '0')}`;

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'clamp(8px, 2vh, 20px)', padding: '2vw' }}>
      {/* Target title */}
      <div style={{ color: theme.date, fontSize: 'clamp(12px, 1.6vw, 18px)', fontWeight: 500 }}>
        {target.title}
      </div>

      {/* Day count as large flip number */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
        {/* Single card for days */}
        {remaining.days.toString().split('').map((d, i) => (
          <UnitFlipCard
            key={`day-${i}`}
            digits={[Number(d)]}
            theme={theme}
            glyphWidth={40}
            cardHeight={71}
            fontSize={61}
          />
        ))}
        <span style={{ color: theme.signature, fontSize: 'clamp(12px, 2vw, 20px)', marginLeft: 4 }}>
          天
        </span>
      </div>

      {/* HH:MM:SS as flip display */}
      <FlipDurationDisplay text={timeText} theme={theme} height={160} />

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
