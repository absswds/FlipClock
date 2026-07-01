import { useState, useCallback, useRef, useEffect } from 'react';
import type { ClockTheme } from '../logic/themes';
import type { TimerState } from '../logic/productivityModels';
import { formatDuration } from '../logic/formatDuration';
import UnitFlipCard from './UnitFlipCard';

interface TimerScreenProps {
  theme: ClockTheme;
  state: TimerState;
  onStart: (durationMs?: number) => void;
  onPause: () => void;
  onReset: () => void;
}

function msToHMS(ms: number): [number, number, number] {
  const totalSec = Math.floor(ms / 1000);
  return [
    Math.floor(totalSec / 3600),
    Math.floor((totalSec % 3600) / 60),
    totalSec % 60,
  ];
}

const presets = [
  { label: '1分钟', ms: 60_000 },
  { label: '3分钟', ms: 3 * 60_000 },
  { label: '5分钟', ms: 5 * 60_000 },
  { label: '10分钟', ms: 10 * 60_000 },
  { label: '30分钟', ms: 30 * 60_000 },
];

/**
 * Timer screen with click-to-flip time picker.
 * When idle, each time unit card (HH/MM/SS) is clickable — tapping increments the value
 * and the flip animation plays on the changing digits. Clean and intuitive.
 */
export default function TimerScreen({ theme, state, onStart, onPause, onReset }: TimerScreenProps) {
  const [h, setH] = useState(0);
  const [m, setM] = useState(5);
  const [s, setS] = useState(0);

  const isIdle = !state.isRunning && !state.isComplete;
  const text = formatDuration(state.remainingMillis, state.durationMillis >= 3600_000);

  // Sync local time to what was last started
  useEffect(() => {
    if (!state.isRunning && !state.isComplete && state.remainingMillis === state.durationMillis) {
      const [hh, mm, ss] = msToHMS(state.durationMillis);
      setH(hh);
      setM(mm);
      setS(ss);
    }
  }, [state.durationMillis, state.isRunning, state.isComplete, state.remainingMillis]);

  const startCustom = useCallback(() => {
    onStart((h * 3600 + m * 60 + s) * 1000);
  }, [h, m, s, onStart]);

  const pad2 = (n: number) => String(n).padStart(2, '0');
  const [hTens, hOnes] = pad2(h % 100).split('').map(Number);
  const [mTens, mOnes] = pad2(m % 60).split('').map(Number);
  const [sTens, sOnes] = pad2(s % 60).split('').map(Number);

  if (!isIdle || state.isComplete) {
    // Running or complete — show countdown
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'clamp(8px, 2vh, 20px)', padding: '2vw 2vw max(80px, 10vh) 2vw' }}>
        <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {state.isComplete ? (
            <div style={{ color: theme.accent, fontSize: 'clamp(24px, 5vw, 48px)', fontWeight: 700, animation: 'pulse 1s ease-in-out infinite' }}>
              ⏰ 时间到！
            </div>
          ) : (
            <FlipTextDisplay text={text} theme={theme} />
          )}
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          {state.isRunning ? (
            <Btn theme={theme} onClick={onPause} primary>暂停</Btn>
          ) : (
            <>
              <Btn theme={theme} onClick={startCustom} primary>重新开始</Btn>
              <Btn theme={theme} onClick={onReset}>重置</Btn>
            </>
          )}
        </div>
      </div>
    );
  }

  // Idle — click-to-flip time picker
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'clamp(8px, 2vh, 20px)', padding: '2vw 2vw max(80px, 10vh) 2vw' }}>
      {/* Clickable flip card time picker — fills available space */}
      <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <ClickableTimePicker
          theme={theme}
          hTens={hTens} hOnes={hOnes}
          mTens={mTens} mOnes={mOnes}
          sTens={sTens} sOnes={sOnes}
          onIncHour={() => setH((v) => (v + 1) % 100)}
          onIncMin={() => setM((v) => (v + 1) % 60)}
          onIncSec={() => setS((v) => (v + 1) % 60)}
        />
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Btn theme={theme} onClick={startCustom} primary>开始</Btn>
      </div>

      {/* Quick presets */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
        {presets.map((p) => (
          <button
            key={p.ms}
            onClick={() => {
              const [hh, mm, ss] = msToHMS(p.ms);
              setH(hh); setM(mm); setS(ss);
            }}
            style={{
              padding: '3px 10px', borderRadius: 5,
              border: `1px solid ${theme.date}`,
              background: 'transparent', color: theme.signature,
              cursor: 'pointer', fontSize: 'clamp(9px, 1.1vw, 12px)',
            }}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Three clickable unit cards (HH : MM : SS) sized to fill the parent container.
 * Each card flips its digits when clicked.
 */
function ClickableTimePicker({
  theme,
  hTens, hOnes, mTens, mOnes, sTens, sOnes,
  onIncHour, onIncMin, onIncSec,
}: {
  theme: ClockTheme;
  hTens: number; hOnes: number; mTens: number; mOnes: number; sTens: number; sOnes: number;
  onIncHour: () => void; onIncMin: () => void; onIncSec: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setDims({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Layout: same as FlipDurationDisplay but with 6 digits + 2 colons
  const digitCount = 6;
  const separatorCount = 2;
  const separatorWeight = 0.18;
  const weightedGlyphs = digitCount + separatorCount * separatorWeight;
  const targetWidth = dims.w * 0.96;
  let glyphWidth = targetWidth / weightedGlyphs;
  let cardHeight = glyphWidth * 1.78;
  const maxCardHeight = dims.h * 0.88;
  if (cardHeight > maxCardHeight) {
    cardHeight = maxCardHeight;
    glyphWidth = cardHeight / 1.78;
  }
  const fontSize = glyphWidth * 1.52;
  const sepW = glyphWidth * separatorWeight;
  const sepFS = cardHeight * 0.42;

  const sepStyle: React.CSSProperties = {
    color: theme.digit, fontSize: `${sepFS}px`, fontWeight: 900,
    width: `${sepW}px`, textAlign: 'center', lineHeight: 1,
  };

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {dims.w > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
          {/* HH — clickable */}
          <div onClick={onIncHour} style={{ cursor: 'pointer' }} title="点击调小时">
            <UnitFlipCard digits={[hTens, hOnes]} theme={theme} glyphWidth={glyphWidth} cardHeight={cardHeight} fontSize={fontSize} />
          </div>
          <span style={sepStyle}>:</span>
          {/* MM — clickable */}
          <div onClick={onIncMin} style={{ cursor: 'pointer' }} title="点击调分钟">
            <UnitFlipCard digits={[mTens, mOnes]} theme={theme} glyphWidth={glyphWidth} cardHeight={cardHeight} fontSize={fontSize} />
          </div>
          <span style={sepStyle}>:</span>
          {/* SS — clickable */}
          <div onClick={onIncSec} style={{ cursor: 'pointer' }} title="点击调秒">
            <UnitFlipCard digits={[sTens, sOnes]} theme={theme} glyphWidth={glyphWidth} cardHeight={cardHeight} fontSize={fontSize} />
          </div>
        </div>
      )}
    </div>
  );
}

/** Simple flip text display for the running countdown (not clickable). */
function FlipTextDisplay({ text, theme }: { text: string; theme: ClockTheme }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setDims({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Parse text into segments: digits and colons
  const segments = parseTimeText(text);
  const digitCount = segments.filter((s) => s.type === 'digits').reduce((s, seg) => s + (seg as {type:'digits', digits:number[]}).digits.length, 0);
  const sepCount = segments.filter((s) => s.type === 'separator').length;
  const sw = 0.18;
  const tw = dims.w * 0.96;
  let gw = digitCount > 0 ? tw / (digitCount + sepCount * sw) : 0;
  let ch = gw * 1.78;
  if (ch > dims.h * 0.88) { ch = dims.h * 0.88; gw = ch / 1.78; }
  const fs = gw * 1.52;
  const sepW = gw * sw;
  const sepFs = ch * 0.42;

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {dims.w > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
          {segments.map((seg, i) =>
            seg.type === 'digits' ? (
              <UnitFlipCard key={i} digits={seg.digits} theme={theme} glyphWidth={gw} cardHeight={ch} fontSize={fs} />
            ) : (
              <span key={i} style={{ color: theme.digit, fontSize: `${sepFs}px`, fontWeight: 900, width: `${sepW}px`, textAlign: 'center', lineHeight: 1 }}>
                {seg.text}
              </span>
            )
          )}
        </div>
      )}
    </div>
  );
}

function parseTimeText(text: string): ({ type: 'digits'; digits: number[] } | { type: 'separator'; text: string })[] {
  const result: ReturnType<typeof parseTimeText> = [];
  let i = 0;
  while (i < text.length) {
    if (/\d/.test(text[i])) {
      const start = i;
      while (i < text.length && /\d/.test(text[i])) i++;
      result.push({ type: 'digits', digits: text.slice(start, i).split('').map(Number) });
    } else {
      const start = i;
      while (i < text.length && !/\d/.test(text[i])) i++;
      result.push({ type: 'separator', text: text.slice(start, i) });
    }
  }
  return result;
}

function Btn({ theme, onClick, primary, children }: { theme: ClockTheme; onClick: () => void; primary?: boolean; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '10px 28px', borderRadius: 8,
        border: primary ? 'none' : `1px solid ${theme.date}`,
        background: primary ? theme.accent : 'transparent',
        color: primary ? theme.background : theme.digit,
        fontWeight: primary ? 700 : 400,
        fontSize: 'clamp(12px, 1.5vw, 16px)', cursor: 'pointer',
      }}
    >
      {children}
    </button>
  );
}
