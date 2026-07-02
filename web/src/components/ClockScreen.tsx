import { useRef, useState, useCallback } from 'react';
import type { ClockUiState } from '../logic/buildState';
import FlipClock from './FlipClock';

interface ClockScreenProps {
  state: ClockUiState;
  onLongPress: () => void;
}

export default function ClockScreen({ state, onLongPress }: ClockScreenProps) {
  const [pressing, setPressing] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onPointerDown = useCallback(() => {
    setPressing(true);
    timerRef.current = setTimeout(() => {
      onLongPress();
      setPressing(false);
    }, 500);
  }, [onLongPress]);

  const onPointerUp = useCallback(() => {
    setPressing(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const { theme, dateText, signature } = state;
  const isPaperDesk = theme.id === 'paper_desk';

  return (
    <div
      className={`clock-screen${isPaperDesk ? ' paper-clock-screen' : ''}`}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
      style={{
        width: '100vw',
        height: '100vh',
        background: theme.background,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        cursor: 'pointer',
        transition: 'background 0.4s',
        position: 'relative',
        padding: isPaperDesk
          ? 'clamp(24px, 4vw, 48px) clamp(20px, 4vw, 56px) clamp(72px, 10vh, 112px)'
          : 'clamp(8px, 2vh, 24px) 0 0',
      }}
    >
      <div className="clock-breathe" aria-hidden="true" />
      <div
        className={isPaperDesk ? 'paper-date-rail' : undefined}
        style={{
          color: theme.date,
          fontSize: isPaperDesk ? 'clamp(15px, 1.5vw, 20px)' : 'clamp(14px, 2vw, 28px)',
          fontWeight: isPaperDesk ? 500 : 400,
          letterSpacing: isPaperDesk ? '0.02em' : '0.05em',
          marginBottom: isPaperDesk ? 0 : 'clamp(1rem, 4vh, 3rem)',
          opacity: pressing ? 0.6 : 1,
          transition: 'opacity 0.2s',
          position: 'relative',
          zIndex: 1,
          alignSelf: isPaperDesk ? 'flex-start' : 'center',
          maxWidth: isPaperDesk ? 'min(42ch, 38vw)' : 'none',
          textAlign: isPaperDesk ? 'left' : 'center',
          textTransform: isPaperDesk ? 'uppercase' : 'none',
        }}
      >
        {dateText}
      </div>

      <div
        className={isPaperDesk ? 'paper-clock-frame' : undefined}
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          padding: isPaperDesk ? 'clamp(20px, 3vw, 40px) 0' : '0 2vw',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <FlipClock state={state} />
      </div>

      <div
        className={isPaperDesk ? 'paper-signature-chip' : undefined}
        style={{
          color: theme.signature,
          fontSize: isPaperDesk ? 'clamp(11px, 1vw, 14px)' : 'clamp(9px, 1.1vw, 14px)',
          fontWeight: isPaperDesk ? 500 : 400,
          letterSpacing: isPaperDesk ? '0.01em' : '0.08em',
          marginTop: isPaperDesk ? 0 : 'clamp(0.5rem, 2vh, 2rem)',
          marginBottom: isPaperDesk ? 0 : 'clamp(1rem, 4vh, 3rem)',
          opacity: pressing ? 0.6 : 1,
          transition: 'opacity 0.2s',
          position: 'relative',
          zIndex: 1,
          alignSelf: isPaperDesk ? 'flex-end' : 'center',
          maxWidth: isPaperDesk ? 'min(34ch, 34vw)' : 'none',
          textAlign: isPaperDesk ? 'left' : 'center',
        }}
      >
        {signature || ' '}
      </div>
    </div>
  );
}
