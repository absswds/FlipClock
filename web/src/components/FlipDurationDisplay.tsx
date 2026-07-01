import { useRef, useState, useEffect, useMemo } from 'react';
import type { ClockTheme } from '../logic/themes';
import { splitFlipText, calculateFlipDurationLayout } from '../logic/formatDuration';
import UnitFlipCard from './UnitFlipCard';

interface FlipDurationDisplayProps {
  text: string;
  theme: ClockTheme;
}

/**
 * Renders a formatted duration string (e.g. "00:05:30") with flip cards for digit groups
 * and plain text for separators. Fills its parent container — no fixed height.
 * Port of FlipDurationDisplay.kt.
 */
export default function FlipDurationDisplay({ text, theme }: FlipDurationDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setDims({ w: entry.contentRect.width, h: entry.contentRect.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const parts = useMemo(() => splitFlipText(text), [text]);
  const digitCount = parts.reduce((s, p) => s + (p.type === 'digits' ? p.digits.length : 0), 0) || 1;
  const separatorCount = parts.filter((p) => p.type === 'separator').length;

  const layout =
    dims.w > 0 && dims.h > 0
      ? calculateFlipDurationLayout(digitCount, separatorCount, dims.w, dims.h)
      : null;

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {layout && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
          {parts.map((part, i) =>
            part.type === 'digits' ? (
              <UnitFlipCard
                key={`d-${i}`}
                digits={part.digits}
                theme={theme}
                glyphWidth={layout.glyphWidth}
                cardHeight={layout.cardHeight}
                fontSize={layout.fontSize}
              />
            ) : (
              <span
                key={`s-${i}`}
                style={{
                  color: theme.digit,
                  fontSize: `${layout.separatorFontSize}px`,
                  fontWeight: 900,
                  width: `${layout.separatorWidth}px`,
                  textAlign: 'center',
                  lineHeight: 1,
                }}
              >
                {part.text}
              </span>
            ),
          )}
        </div>
      )}
    </div>
  );
}
