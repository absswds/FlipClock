import { useState, useEffect, useRef, useMemo } from 'react';
import type { ClockTheme } from '../logic/themes';

interface FlipGlyphProps {
  digit: number;
  theme: ClockTheme;
  width: number;
  height: number;
  fontSize: number;
  onClick?: () => void;
}

/**
 * One flipping digit. Uses pure CSS @keyframes for buttery-smooth 60fps 3D animation.
 * Port of FlipGlyph.kt — same keyframe timing, same shadow curves.
 */
export default function FlipGlyph({
  digit,
  theme,
  width,
  height,
  fontSize,
  onClick,
}: FlipGlyphProps) {
  const [shown, setShown] = useState(digit);
  const [previous, setPrevious] = useState(digit);
  const [animKey, setAnimKey] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const halfH = Math.floor(height / 2);

  // Unique animation names per instance to avoid conflicts
  const names = useMemo(() => {
    const id = Math.random().toString(36).slice(2, 8);
    return {
      topFlap: `ft-${id}`,
      topShadow: `fts-${id}`,
      topHighlight: `fth-${id}`,
      bottomFlap: `fb-${id}`,
      bottomShadow: `fbs-${id}`,
    };
  }, []);

  useEffect(() => {
    if (digit === shown) return;
    setPrevious(shown);
    setShown(digit);
    setAnimKey((k) => k + 1);
  }, [digit, shown]);

  const oldDigit = previous;
  const newDigit = shown;

  return (
    <>
      {/* Scoped CSS keyframes — injected once per instance */}
      <style>{`
        @keyframes ${names.topFlap} {
          0%        { transform: rotateX(0deg);   opacity: 1; }
          30.6%     { transform: rotateX(-90deg);  opacity: 1; }
          30.7%     { opacity: 0; }
          100%      { transform: rotateX(-90deg);  opacity: 0; }
        }
        @keyframes ${names.topShadow} {
          0%        { opacity: 0; }
          30.6%     { opacity: 0.68; }
          30.7%     { opacity: 0; }
          100%      { opacity: 0; }
        }
        @keyframes ${names.topHighlight} {
          0%        { opacity: 0.16; }
          30.6%     { opacity: 0; }
          100%      { opacity: 0; }
        }
        @keyframes ${names.bottomFlap} {
          0%, 30.6% { transform: rotateX(-90deg);  opacity: 0; }
          30.7%     { transform: rotateX(-90deg);  opacity: 1; }
          61.3%     { transform: rotateX(-15deg);  opacity: 1; }
          77.4%     { transform: rotateX(-2deg);   opacity: 1; }
          87.9%     { transform: rotateX(2deg);    opacity: 1; }
          100%      { transform: rotateX(0deg);    opacity: 1; }
        }
        @keyframes ${names.bottomShadow} {
          0%, 30.6% { opacity: 0; }
          30.7%     { opacity: 0.68; }
          61.3%     { opacity: 0.113; }
          77.4%     { opacity: 0.015; }
          100%      { opacity: 0; }
        }
      `}</style>

      <div
        ref={containerRef}
        style={{
          width,
          height,
          position: 'relative',
          perspective: '800px',
          perspectiveOrigin: 'center center',
          overflow: 'hidden',
          cursor: onClick ? 'pointer' : undefined,
        }}
        onClick={onClick}
      >
        {animKey === 0 || (animKey > 0 && digit === shown && previous === shown) ? (
          /* ===== Resting: single full-height glyph ===== */
          <DigitFace digit={newDigit} theme={theme} width={width} height={height} fontSize={fontSize} />
        ) : (
          <div key={animKey}>
            {/* ===== Static top half: new digit ===== */}
            <div style={{ width, height: halfH, overflow: 'hidden', position: 'absolute', top: 0, left: 0 }}>
              <DigitFace digit={newDigit} theme={theme} width={width} height={height} fontSize={fontSize} />
            </div>

            {/* ===== Static bottom half: old digit ===== */}
            <div style={{ width, height: halfH, overflow: 'hidden', position: 'absolute', top: halfH, left: 0 }}>
              <div style={{ marginTop: -halfH }}>
                <DigitFace digit={oldDigit} theme={theme} width={width} height={height} fontSize={fontSize} />
              </div>
            </div>

            {/* ===== Top flap: old digit falling 0→-90° ===== */}
            <div
              style={{
                width,
                height: halfH,
                overflow: 'hidden',
                position: 'absolute',
                top: 0, left: 0,
                transformOrigin: '50% 100%',
                transformStyle: 'preserve-3d',
                backfaceVisibility: 'hidden',
                zIndex: 2,
                animation: `${names.topFlap} 620ms forwards`,
              }}
            >
              <DigitFace digit={oldDigit} theme={theme} width={width} height={height} fontSize={fontSize} />
              <div
                style={{
                  position: 'absolute', inset: 0, background: 'white', pointerEvents: 'none',
                  animation: `${names.topHighlight} 620ms forwards`,
                }}
              />
              <div
                style={{
                  position: 'absolute', inset: 0, background: 'black', pointerEvents: 'none',
                  animation: `${names.topShadow} 620ms forwards`,
                }}
              />
            </div>

            {/* ===== Bottom flap: new digit dropping -90→0° ===== */}
            <div
              style={{
                width,
                height: halfH,
                overflow: 'hidden',
                position: 'absolute',
                top: halfH, left: 0,
                transformOrigin: '50% 0%',
                transformStyle: 'preserve-3d',
                backfaceVisibility: 'hidden',
                zIndex: 2,
                animation: `${names.bottomFlap} 620ms forwards`,
              }}
            >
              <div style={{ marginTop: -halfH }}>
                <DigitFace digit={newDigit} theme={theme} width={width} height={height} fontSize={fontSize} />
              </div>
              <div
                style={{
                  position: 'absolute', inset: 0, background: 'black', pointerEvents: 'none',
                  animation: `${names.bottomShadow} 620ms forwards`,
                }}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}

/** A full-card-height face: gradient background + one centered digit glyph. */
function DigitFace({
  digit,
  theme,
  width,
  height,
  fontSize,
}: {
  digit: number;
  theme: ClockTheme;
  width: number;
  height: number;
  fontSize: number;
}) {
  return (
    <div
      style={{
        width,
        height,
        background: `linear-gradient(180deg, ${theme.cardTop} 0%, ${theme.cardTop} 48%, ${theme.cardBottom} 52%, ${theme.cardBottom} 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: theme.digit,
        fontSize: `${fontSize}px`,
        fontWeight: 900,
        fontFamily: '"Inter", "Helvetica Neue", system-ui, sans-serif',
        fontVariantNumeric: 'tabular-nums',
        lineHeight: 1,
        textShadow: '0 2.5px 3px rgba(0,0,0,0.22)',
        position: 'relative',
      }}
    >
      <span
        style={{
          display: 'inline-block',
          transform: `scaleX(1.04) translateY(${-height * 0.08}px)`,
          lineHeight: 1,
          padding: 0,
          margin: 0,
        }}
      >
        {digit}
      </span>
    </div>
  );
}
