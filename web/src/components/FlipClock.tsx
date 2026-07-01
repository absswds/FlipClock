import { useRef, useState, useEffect } from 'react';
import type { ClockUiState } from '../logic/buildState';
import UnitFlipCard from './UnitFlipCard';

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
  const isPaperDesk = theme.id === 'paper_desk';

  if (dims.w === 0 || dims.h === 0) {
    return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
  }

  const targetClockWidth = dims.w * (isPaperDesk ? 0.9 : 0.98);
  const groupGapPixel = targetClockWidth * (isPaperDesk ? 0.032 : 0.02);
  const amPmReserve = amPm ? targetClockWidth * (isPaperDesk ? 0.06 : 0.07) : 0;
  const amPmGap = amPm ? dims.w * (isPaperDesk ? 0.018 : 0.012) : 0;
  const betweenGroups = groupGapPixel * (groupCount - 1);
  const usableWidth = targetClockWidth - amPmReserve - amPmGap - betweenGroups;

  let glyphWidth = usableWidth / maxGlyphs;
  let cardHeight = glyphWidth * (isPaperDesk ? 1.58 : 1.78);
  const maxCardHeight = dims.h * (isPaperDesk ? 0.8 : 0.92);
  if (cardHeight > maxCardHeight) {
    cardHeight = maxCardHeight;
    glyphWidth = cardHeight / (isPaperDesk ? 1.58 : 1.78);
  }

  const fontSize = glyphWidth * (isPaperDesk ? 1.42 : 1.52);
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
        paddingInline: isPaperDesk ? 'clamp(10px, 2vw, 20px)' : 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
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

        <UnitFlipCard
          digits={hourDigits}
          theme={theme}
          glyphWidth={glyphWidth}
          cardHeight={cardHeight}
          fontSize={fontSize}
        />

        <div style={{ width: groupGapPixel }} />

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
