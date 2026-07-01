import { useRef, useState, useCallback } from 'react';
import type { ClockUiState } from '../logic/buildState';
import FlipClock from './FlipClock';

interface ClockScreenProps {
  state: ClockUiState;
  onLongPress: () => void;
}

/**
 * Full-screen clock display: date at top, FlipClock centered, signature at bottom.
 * Long-press anywhere to enter settings.
 */
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

  return (
    <div
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
        justifyContent: 'center',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        cursor: 'pointer',
        transition: 'background 0.4s',
        position: 'relative',
      }}
    >
      {/* Date — top */}
      <div
        style={{
          color: theme.date,
          fontSize: 'clamp(10px, 1.4vw, 18px)',
          fontWeight: 400,
          letterSpacing: '0.05em',
          marginBottom: 'clamp(0.8rem, 3vh, 3rem)',
          opacity: pressing ? 0.6 : 1,
          transition: 'opacity 0.2s',
        }}
      >
        {dateText}
      </div>

      {/* Clock — center, takes most of the screen */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          maxHeight: '70vh',
          padding: '0 2vw',
        }}
      >
        <FlipClock state={state} />
      </div>

      {/* Signature — bottom */}
      <div
        style={{
          color: theme.signature,
          fontSize: 'clamp(9px, 1.1vw, 14px)',
          fontWeight: 400,
          letterSpacing: '0.08em',
          marginTop: 'clamp(0.8rem, 3vh, 3rem)',
          opacity: pressing ? 0.6 : 1,
          transition: 'opacity 0.2s',
        }}
      >
        {signature || ' '}
      </div>

    </div>
  );
}
