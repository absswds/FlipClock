import type { ClockTheme } from '../logic/themes';
import type { StopwatchState } from '../logic/productivityModels';
import { formatDuration } from '../logic/formatDuration';
import FlipDurationDisplay from './FlipDurationDisplay';

interface StopwatchScreenProps {
  theme: ClockTheme;
  state: StopwatchState;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onLap: () => void;
}

export default function StopwatchScreen({ theme, state, onStart, onPause, onReset, onLap }: StopwatchScreenProps) {
  const text = formatDuration(state.elapsedMillis, state.elapsedMillis >= 3600_000);

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'clamp(8px, 2vh, 20px)', padding: '2vw' }}>
      <FlipDurationDisplay text={text} theme={theme} />

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        {!state.isRunning ? (
          <>
            <Btn theme={theme} onClick={onStart} primary>开始</Btn>
            {state.elapsedMillis > 0 && <Btn theme={theme} onClick={onReset}>重置</Btn>}
          </>
        ) : (
          <>
            <Btn theme={theme} onClick={onPause} primary>暂停</Btn>
            <Btn theme={theme} onClick={onLap}>计圈</Btn>
          </>
        )}
      </div>

      {state.lapsMillis.length > 0 && (
        <div style={{ maxHeight: '25vh', overflow: 'auto', width: '100%', maxWidth: 300 }}>
          {[...state.lapsMillis].reverse().slice(0, 20).map((lap, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '4px 12px',
                color: i === 0 ? theme.accent : theme.signature,
                fontSize: 'clamp(10px, 1.2vw, 14px)',
                borderBottom: `1px solid ${theme.date}33`,
              }}
            >
              <span>#{state.lapsMillis.length - i}</span>
              <span style={{ fontVariantNumeric: 'tabular-nums' }}>{formatDuration(lap, lap >= 3600_000)}</span>
            </div>
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
