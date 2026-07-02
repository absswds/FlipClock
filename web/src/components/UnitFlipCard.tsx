import type { ClockTheme } from '../logic/themes';
import FlipGlyph from './FlipGlyph';

interface UnitFlipCardProps {
  digits: number[];
  theme: ClockTheme;
  glyphWidth: number;
  cardHeight: number;
  fontSize: number;
}

export default function UnitFlipCard({
  digits,
  theme,
  glyphWidth,
  cardHeight,
  fontSize,
}: UnitFlipCardProps) {
  const isPaperDesk = theme.id === 'paper_desk';
  const borderRadius = isPaperDesk
    ? Math.min(cardHeight * 0.038, 18)
    : cardHeight * 0.075;

  return (
    <div
      className={`flip-card-shell${isPaperDesk ? ' paper-card-shell' : ''}`}
      style={{
        borderRadius,
        border: `1px solid ${theme.cardEdge}`,
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        flexDirection: 'row',
      }}
    >
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

      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: '50%',
          height: isPaperDesk ? 3 : 5,
          marginTop: isPaperDesk ? -1 : -2,
          background: `linear-gradient(180deg, transparent, ${theme.hingeShadow})`,
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: '50%',
          height: isPaperDesk ? 1 : 2,
          marginTop: isPaperDesk ? 0 : -1,
          background: theme.hinge,
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: '50%',
          height: 1,
          marginTop: isPaperDesk ? 1 : 1.5,
          background: theme.bevel,
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          height: cardHeight * (isPaperDesk ? 0.1 : 0.14),
          background: `linear-gradient(180deg, ${theme.topHighlight}, transparent)`,
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(90deg, ${theme.cardEdgeShadow} 0%, transparent 12%, transparent 88%, ${theme.cardEdgeShadow} 100%)`,
          pointerEvents: 'none',
        }}
      />

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
