import { useRef, useState, useEffect } from 'react';
import type { ClockUiState } from '../logic/buildState';
import UnitFlipCard from './UnitFlipCard';

/**
 * Lays out HH:MM(:SS) as one flip card per unit, with AM/PM to the left.
 * Width-driven sizing: glyph width = usableWidth / maxGlyphs, card height = glyphWidth × 1.78.
 * Port of FlipClock.kt.
 */
export default function FlipClock({ state }: { state: ClockUiState }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setDims({ w: width, h: height });
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { theme, showSeconds, hourDigits, minuteDigits, secondDigits, amPm } = state;
  const groupCount = showSeconds ? 3 : 2;
  const maxGlyphs = showSeconds ? 6 : 4;

  if (dims.w === 0 || dims.h === 0) {
    // Not measured yet — render hidden placeholder to trigger ResizeObserver
    return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
  }

  const targetClockWidth = dims.w * 0.98;
  const groupGapPixel = targetClockWidth * 0.02;
  const amPmReserve = amPm ? targetClockWidth * 0.07 : 0;
  const amPmGap = amPm ? dims.w * 0.012 : 0;

  const betweenGroups = groupGapPixel * (groupCount - 1);
  const usableWidth = targetClockWidth - amPmReserve - amPmGap - betweenGroups;

  let glyphWidth = usableWidth / maxGlyphs;
  let cardHeight = glyphWidth * 1.78;
  const maxCardHeight = dims.h * 0.92;
  if (cardHeight > maxCardHeight) {
    cardHeight = maxCardHeight;
    glyphWidth = cardHeight / 1.78;
  }

  const fontSize = glyphWidth * 1.52;
  const amPmFontSize = cardHeight * 0.14;

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
      <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
        {/* AM/PM indicator */}
        {amPm && (
          <>
            <div
              style={{
                width: amPmReserve,
                height: cardHeight,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: theme.accent,
                fontSize: amPmFontSize,
                fontWeight: 700,
              }}
            >
              {amPm}
            </div>
            <div style={{ width: amPmGap }} />
          </>
        )}

        {/* Hour card */}
        <UnitFlipCard
          digits={hourDigits}
          theme={theme}
          glyphWidth={glyphWidth}
          cardHeight={cardHeight}
          fontSize={fontSize}
        />

        <div style={{ width: groupGapPixel }} />

        {/* Minute card */}
        <UnitFlipCard
          digits={minuteDigits}
          theme={theme}
          glyphWidth={glyphWidth}
          cardHeight={cardHeight}
          fontSize={fontSize}
        />

        {showSeconds && (
          <>
            <div style={{ width: groupGapPixel }} />
            {/* Second card */}
            <UnitFlipCard
              digits={secondDigits}
              theme={theme}
              glyphWidth={glyphWidth}
              cardHeight={cardHeight}
              fontSize={fontSize}
            />
          </>
        )}
      </div>
    </div>
  );
}
