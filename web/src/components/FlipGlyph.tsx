import { useState, useEffect, useRef, useCallback } from 'react';
import type { ClockTheme } from '../logic/themes';
import {
  computeTopFlapShadowAlpha,
  computeBottomFlapShadowAlpha,
  computeFlapHighlightAlpha,
} from '../logic/flipShadow';

interface FlipGlyphProps {
  digit: number;
  theme: ClockTheme;
  width: number;
  height: number;
  fontSize: number;
}

/**
 * One flipping digit. Port of FlipGlyph.kt:
 * - At rest: single full-height glyph (impossible to duplicate)
 * - During flip (r ∈ [0, 180)):
 *     Static top = new digit, static bottom = old digit
 *     r < 90: top flap (old digit) falls 0→-90°, hinged at bottom
 *     r ≥ 90: bottom flap (new digit) drops -90°→0°, hinged at top
 * - Shadows/highlights updated per-frame
 */
export default function FlipGlyph({
  digit,
  theme,
  width,
  height,
  fontSize,
}: FlipGlyphProps) {
  const [shown, setShown] = useState(digit);
  const [previous, setPrevious] = useState(digit);
  const [isAnimating, setIsAnimating] = useState(false);

  // Refs for direct DOM manipulation during animation (avoid React re-renders at 60fps)
  const startRef = useRef(0);
  const topFlapRef = useRef<HTMLDivElement>(null);
  const bottomFlapRef = useRef<HTMLDivElement>(null);
  const topShadowRef = useRef<HTMLDivElement>(null);
  const topHighlightRef = useRef<HTMLDivElement>(null);
  const bottomShadowRef = useRef<HTMLDivElement>(null);

  /**
   * Maps elapsed ms → rotation angle (0..180) exactly per FlipAnimationSpec.flip keyframes:
   *   0° at 0ms, 90° at 190ms, 165° at 380ms, 178° at 480ms, 182° at 545ms, 180° at 620ms.
   */
  const animate = useCallback(() => {
    const DURATION = 620;
    // keyframe table: [elapsedMs, rotationDeg]
    const table: [number, number][] = [
      [0, 0],
      [190, 90],
      [380, 165],
      [480, 178],
      [545, 182],
      [620, 180],
    ];

    function rotationAt(elapsed: number): number {
      if (elapsed <= 0) return 0;
      if (elapsed >= DURATION) return 180;
      // find segment
      for (let i = 0; i < table.length - 1; i++) {
        const [t0, r0] = table[i];
        const [t1, r1] = table[i + 1];
        if (elapsed >= t0 && elapsed <= t1) {
          const frac = (elapsed - t0) / (t1 - t0);
          return r0 + (r1 - r0) * frac;
        }
      }
      return 180;
    }

    const topFlap = topFlapRef.current;
    const bottomFlap = bottomFlapRef.current;
    const topShadow = topShadowRef.current;
    const topHighlight = topHighlightRef.current;
    const bottomShadow = bottomShadowRef.current;
    startRef.current = performance.now();

    function tick() {
      const elapsed = performance.now() - startRef.current;
      const r = rotationAt(elapsed);

      if (r < 90) {
        // --- Top flap phase: old digit falling toward viewer ---
        if (topFlap) {
          topFlap.style.display = '';
          topFlap.style.transform = `rotateX(${-r}deg)`;
        }
        if (bottomFlap) bottomFlap.style.display = 'none';
        if (topShadow) topShadow.style.opacity = String(computeTopFlapShadowAlpha(r));
        if (topHighlight) topHighlight.style.opacity = String(computeFlapHighlightAlpha(r));
      } else if (elapsed < DURATION) {
        // --- Bottom flap phase: new digit dropping into place ---
        if (topFlap) topFlap.style.display = 'none';
        if (bottomFlap) {
          bottomFlap.style.display = '';
          bottomFlap.style.transform = `rotateX(${-(180 - r)}deg)`;
        }
        if (bottomShadow) bottomShadow.style.opacity = String(computeBottomFlapShadowAlpha(r));
      }

      if (elapsed < DURATION) {
        requestAnimationFrame(tick);
      } else {
        // Settled — ensure final state
        if (topFlap) topFlap.style.display = 'none';
        if (bottomFlap) bottomFlap.style.display = 'none';
        setIsAnimating(false);
      }
    }

    requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    if (digit === shown) return;

    setPrevious(shown);
    setShown(digit);
    setIsAnimating(true);

    // Wait one frame for React to render the structural changes,
    // then kick off the animation.
    const frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [digit, shown, animate]);

  const halfH = Math.floor(height / 2);
  const oldDigit = previous;
  const newDigit = shown;

  return (
    <div
      style={{
        width,
        height,
        position: 'relative',
        perspective: '800px',
        perspectiveOrigin: 'center center',
        overflow: 'hidden',
      }}
    >
      {!isAnimating ? (
        /* ===== Resting: single full-height glyph ===== */
        <DigitFace digit={newDigit} theme={theme} width={width} height={height} fontSize={fontSize} />
      ) : (
        <>
          {/* ===== Static top half: new digit (always visible during flip) ===== */}
          <div style={{ width, height: halfH, overflow: 'hidden', position: 'absolute', top: 0, left: 0 }}>
            <DigitFace digit={newDigit} theme={theme} width={width} height={height} fontSize={fontSize} />
          </div>

          {/* ===== Static bottom half: old digit (stays until flip completes) ===== */}
          <div style={{ width, height: halfH, overflow: 'hidden', position: 'absolute', top: halfH, left: 0 }}>
            <div style={{ marginTop: -halfH }}>
              <DigitFace digit={oldDigit} theme={theme} width={width} height={height} fontSize={fontSize} />
            </div>
          </div>

          {/* ===== Top flap (r < 90): old digit, hinged at bottom, falling toward viewer ===== */}
          <div
            ref={topFlapRef}
            style={{
              width,
              height: halfH,
              overflow: 'hidden',
              position: 'absolute',
              top: 0,
              left: 0,
              transformOrigin: '50% 100%',
              transformStyle: 'preserve-3d',
              backfaceVisibility: 'hidden',
              zIndex: 2,
            }}
          >
            <DigitFace digit={oldDigit} theme={theme} width={width} height={height} fontSize={fontSize} />
            {/* Specular sheen while flat, fading to edge-on */}
            <div
              ref={topHighlightRef}
              style={{
                position: 'absolute',
                inset: 0,
                background: 'white',
                opacity: 0,
                pointerEvents: 'none',
              }}
            />
            {/* Shadow darkens as it turns edge-on */}
            <div
              ref={topShadowRef}
              style={{
                position: 'absolute',
                inset: 0,
                background: 'black',
                opacity: 0,
                pointerEvents: 'none',
              }}
            />
          </div>

          {/* ===== Bottom flap (r >= 90): new digit, hinged at top, dropping into place ===== */}
          <div
            ref={bottomFlapRef}
            style={{
              width,
              height: halfH,
              overflow: 'hidden',
              position: 'absolute',
              top: halfH,
              left: 0,
              transformOrigin: '50% 0%',
              transformStyle: 'preserve-3d',
              backfaceVisibility: 'hidden',
              zIndex: 2,
              display: 'none',
            }}
          >
            <div style={{ marginTop: -halfH }}>
              <DigitFace digit={newDigit} theme={theme} width={width} height={height} fontSize={fontSize} />
            </div>
            {/* Shadow lightens as it lands flat */}
            <div
              ref={bottomShadowRef}
              style={{
                position: 'absolute',
                inset: 0,
                background: 'black',
                opacity: 0,
                pointerEvents: 'none',
              }}
            />
          </div>
        </>
      )}
    </div>
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
