import type { ClockTheme } from '../logic/themes';
import FlipGlyph from './FlipGlyph';

interface UnitFlipCardProps {
  digits: number[];
  theme: ClockTheme;
  glyphWidth: number;
  cardHeight: number;
  fontSize: number;
}

/**
 * One time unit (hour, minute, or second) as a single rounded card.
 * Digits sit flush so their shared gradient reads as one continuous face,
 * with one hinge seam drawn straight across the whole card.
 * Port of UnitFlipCard.kt.
 */
export default function UnitFlipCard({
  digits,
  theme,
  glyphWidth,
  cardHeight,
  fontSize,
}: UnitFlipCardProps) {
  const borderRadius = cardHeight * 0.075;

  return (
    <div
      className="flip-card-shell"
      style={{
        borderRadius,
        border: `1px solid ${theme.cardEdge}`,
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        flexDirection: 'row',
      }}
    >
      {/* Digits row — each glyph flips independently when its digit changes */}
      {digits.map((d, i) => (
        <FlipGlyph
          key={`pos${i}`}
          digit={d}
          theme={theme}
          width={glyphWidth}
          height={cardHeight}
          fontSize={fontSize}
        />
      ))}

      {/* Hinge shadow (dark gradient above seam) */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: '50%',
          height: 5,
          marginTop: -2,
          background: `linear-gradient(180deg, transparent, ${theme.hingeShadow})`,
          pointerEvents: 'none',
        }}
      />

      {/* Hinge line (dark seam) */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: '50%',
          height: 2,
          marginTop: -1,
          background: theme.hinge,
          pointerEvents: 'none',
        }}
      />

      {/* Bevel highlight (thin line just below seam) */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: '50%',
          height: 1,
          marginTop: 1.5,
          background: theme.bevel,
          pointerEvents: 'none',
        }}
      />

      {/* Top highlight gradient (soft glow at top edge) */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          height: cardHeight * 0.14,
          background: `linear-gradient(180deg, ${theme.topHighlight}, transparent)`,
          pointerEvents: 'none',
        }}
      />

      {/* Side shadow overlay — horizontal gradient */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(90deg, ${theme.cardEdgeShadow} 0%, transparent 12%, transparent 88%, ${theme.cardEdgeShadow} 100%)`,
          pointerEvents: 'none',
        }}
      />

      {/* Vertical shadow overlay — top & bottom soft shadow */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(180deg, ${theme.cardEdgeShadow} 0%, transparent 16%, transparent 84%, ${theme.cardEdgeShadow} 100%)`,
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}
