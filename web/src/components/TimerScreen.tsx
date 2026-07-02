import { useState, useCallback, useRef, useEffect } from 'react';
import type { ClockTheme } from '../logic/themes';
import type { TimerState } from '../logic/productivityModels';
import type { Lang } from '../logic/i18n';
import { t } from '../logic/i18n';
import { formatDuration } from '../logic/formatDuration';
import { alertComplete, stopChime } from '../logic/notify';
import UnitFlipCard from './UnitFlipCard';

interface TimerScreenProps {
  theme: ClockTheme;
  state: TimerState;
  onStart: (durationMs?: number) => void;
  onPause: () => void;
  onReset: () => void;
  lang: Lang;
}

function msToHMS(ms: number): [number, number, number] {
  const totalSec = Math.floor(ms / 1000);
  return [Math.floor(totalSec / 3600), Math.floor((totalSec % 3600) / 60), totalSec % 60];
}

const presets = [
  { label: '1分', ms: 60_000 },
  { label: '3分', ms: 3 * 60_000 },
  { label: '5分', ms: 5 * 60_000 },
  { label: '10分', ms: 10 * 60_000 },
  { label: '30分', ms: 30 * 60_000 },
];

const GUIDE_KEY = 'flipclock_timer_guide_seen';

export default function TimerScreen({ theme, state, onStart, onPause, onReset, lang }: TimerScreenProps) {
  const [h, setH] = useState(0);
  const [m, setM] = useState(5);
  const [s, setS] = useState(0);
  const [showGuide, setShowGuide] = useState(false);

  const isIdle = !state.isRunning && !state.isComplete;
  const text = formatDuration(state.remainingMillis, state.durationMillis >= 3600_000);

  // Alert on completion
  const wasComplete = useRef(false);
  useEffect(() => {
    if (state.isComplete && !wasComplete.current) {
      wasComplete.current = true;
      alertComplete(t(lang, 'timeUp'), '');
    }
    if (!state.isComplete) wasComplete.current = false;
  }, [state.isComplete, lang]);

  // Sync local time
  useEffect(() => {
    if (!state.isRunning && !state.isComplete && state.remainingMillis === state.durationMillis) {
      const [hh, mm, ss] = msToHMS(state.durationMillis);
      setH(hh); setM(mm); setS(ss);
    }
  }, [state.durationMillis, state.isRunning, state.isComplete, state.remainingMillis]);

  // Show guide on first visit to timer page (when idle)
  useEffect(() => {
    if (isIdle && !localStorage.getItem(GUIDE_KEY)) {
      setShowGuide(true);
    }
  }, [isIdle]);

  const dismissGuide = useCallback(() => {
    setShowGuide(false);
    localStorage.setItem(GUIDE_KEY, '1');
  }, []);

  const startCustom = useCallback(() => {
    stopChime();
    onStart((h * 3600 + m * 60 + s) * 1000);
  }, [h, m, s, onStart]);

  const resetCustom = useCallback(() => {
    stopChime();
    onReset();
  }, [onReset]);

  const pad2 = (n: number) => String(n).padStart(2, '0');
  const [hTens, hOnes] = pad2(h % 100).split('').map(Number);
  const [mTens, mOnes] = pad2(m % 60).split('').map(Number);
  const [sTens, sOnes] = pad2(s % 60).split('').map(Number);

  // Shared gesture handler: scroll or swipe to adjust time
  const makeHandlers = (
    inc: () => void,
    dec: () => void,
  ) => {
    let touchY = 0;
    return {
      onWheel: (e: React.WheelEvent) => {
        e.preventDefault();
        if (e.deltaY < 0) inc();
        else dec();
      },
      onTouchStart: (e: React.TouchEvent) => {
        touchY = e.touches[0].clientY;
      },
      onTouchEnd: (e: React.TouchEvent) => {
        const dy = e.changedTouches[0].clientY - touchY;
        if (Math.abs(dy) > 20) {
          if (dy < 0) inc(); // swipe up = +1
          else dec(); // swipe down = -1
        }
      },
    };
  };

  const hInc = () => setH((v) => (v + 1) % 100);
  const hDec = () => setH((v) => (v - 1 + 100) % 100);
  const mInc = () => setM((v) => (v + 1) % 60);
  const mDec = () => setM((v) => (v - 1 + 60) % 60);
  const sInc = () => setS((v) => (v + 1) % 60);
  const sDec = () => setS((v) => (v - 1 + 60) % 60);

  if (!isIdle || state.isComplete) {
    return (
      <div className="page-panel" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'clamp(8px, 2vh, 20px)', padding: '2vw 2vw max(80px, 10vh) 2vw' }}>
        <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {state.isComplete ? (
            <div style={{ color: theme.accent, fontSize: 'clamp(24px, 5vw, 48px)', fontWeight: 700, animation: 'pulse 1s ease-in-out infinite' }}>
              {t(lang, 'timeUp')}
            </div>
          ) : (
            <FlipTextDisplay text={text} theme={theme} />
          )}
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          {state.isRunning ? (
            <Btn theme={theme} onClick={onPause} primary>{t(lang, 'pause')}</Btn>
          ) : (
            <>
              <Btn theme={theme} onClick={startCustom} primary>{t(lang, 'restart')}</Btn>
              <Btn theme={theme} onClick={resetCustom}>{t(lang, 'reset')}</Btn>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="page-panel" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'clamp(8px, 2vh, 20px)', padding: '2vw 2vw max(80px, 10vh) 2vw', position: 'relative' }}>
      {/* === Onboarding guide overlay === */}
      {showGuide && (
        <div
          onClick={dismissGuide}
          style={{
            position: 'absolute', inset: 0, zIndex: 200,
            background: 'rgba(0,0,0,0.72)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            padding: '24px',
          }}
        >
          <div
            style={{
              width: 'min(92vw, 420px)',
              maxWidth: 'min(92vw, 420px)',
              background: 'rgba(19, 19, 22, 0.92)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 18,
              boxShadow: '0 24px 80px rgba(0,0,0,0.42)',
              padding: '24px 24px 22px',
              textAlign: 'center',
              backdropFilter: 'blur(10px)',
            }}
          >
            <div style={{ color: 'rgb(255, 250, 242)', fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 800, lineHeight: 1.15, marginBottom: 14 }}>
              {t(lang, 'timerGuide')}
            </div>
            <div style={{ color: 'rgba(255, 248, 235, 0.92)', fontSize: 'clamp(15px, 2vw, 20px)', fontWeight: 600, lineHeight: 1.45, marginBottom: 8 }}>
              &#9650; {t(lang, 'timerGuideTop')}
            </div>
            <div style={{ color: 'rgba(255, 248, 235, 0.92)', fontSize: 'clamp(15px, 2vw, 20px)', fontWeight: 600, lineHeight: 1.45, marginBottom: 12 }}>
              &#9660; {t(lang, 'timerGuideBot')}
            </div>
            <div style={{ color: 'rgba(255, 248, 235, 0.78)', fontSize: 'clamp(13px, 1.6vw, 16px)', lineHeight: 1.5 }}>
              {t(lang, 'scrollUp')} / {t(lang, 'scrollDown')}
            </div>
            <div style={{ color: 'rgba(255, 248, 235, 0.62)', fontSize: 'clamp(12px, 1.4vw, 14px)', marginTop: 16, lineHeight: 1.4 }}>
              {t(lang, 'tapHint')}
            </div>
          </div>
        </div>
      )}

      {/* Flip card time picker */}
      <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <ClickableTimePicker
          theme={theme}
          hTens={hTens} hOnes={hOnes}
          mTens={mTens} mOnes={mOnes}
          sTens={sTens} sOnes={sOnes}
          hInc={hInc} hDec={hDec}
          mInc={mInc} mDec={mDec}
          sInc={sInc} sDec={sDec}
          makeHandlers={makeHandlers}
        />
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Btn theme={theme} onClick={startCustom} primary>{t(lang, 'start')}</Btn>
      </div>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
        {presets.map((p) => (
          <button
            key={p.ms}
            className="soft-button"
            onClick={() => { const [hh, mm, ss] = msToHMS(p.ms); setH(hh); setM(mm); setS(ss); }}
            style={{
              padding: '3px 10px', borderRadius: 5,
              border: `1px solid ${theme.date}`, background: 'transparent',
              color: theme.signature, cursor: 'pointer',
              fontSize: 'clamp(9px, 1.1vw, 12px)',
            }}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function ClickableTimePicker({
  theme, hTens, hOnes, mTens, mOnes, sTens, sOnes,
  hInc, hDec, mInc, mDec, sInc, sDec,
  makeHandlers,
}: {
  theme: ClockTheme;
  hTens: number; hOnes: number; mTens: number; mOnes: number; sTens: number; sOnes: number;
  hInc: () => void; hDec: () => void;
  mInc: () => void; mDec: () => void;
  sInc: () => void; sDec: () => void;
  makeHandlers: (inc: () => void, dec: () => void) => {
    onWheel: (e: React.WheelEvent) => void;
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchEnd: (e: React.TouchEvent) => void;
  };
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

  const digitCount = 6;
  const separatorCount = 2;
  const sw = 0.18;
  const tw = dims.w * 0.96;
  let gw = tw / (digitCount + separatorCount * sw);
  let ch = gw * 1.78;
  if (ch > dims.h * 0.88) { ch = dims.h * 0.88; gw = ch / 1.78; }
  const fs = gw * 1.52;
  const sepW = gw * sw;
  const sepFs = ch * 0.42;

  const hourHandlers = makeHandlers(hInc, hDec);
  const minHandlers = makeHandlers(mInc, mDec);
  const secHandlers = makeHandlers(sInc, sDec);

  const sepStyle: React.CSSProperties = {
    color: theme.digit, fontSize: `${sepFs}px`, fontWeight: 900,
    width: `${sepW}px`, textAlign: 'center', lineHeight: 1,
  };

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {dims.w > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
          <div
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              if (e.clientY - rect.top < rect.height / 2) hInc();
              else hDec();
            }}
            {...hourHandlers}
            style={{ cursor: 'pointer' }}
          >
            <UnitFlipCard digits={[hTens, hOnes]} theme={theme} glyphWidth={gw} cardHeight={ch} fontSize={fs} />
          </div>
          <span style={sepStyle}>:</span>
          <div
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              if (e.clientY - rect.top < rect.height / 2) mInc();
              else mDec();
            }}
            {...minHandlers}
            style={{ cursor: 'pointer' }}
          >
            <UnitFlipCard digits={[mTens, mOnes]} theme={theme} glyphWidth={gw} cardHeight={ch} fontSize={fs} />
          </div>
          <span style={sepStyle}>:</span>
          <div
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              if (e.clientY - rect.top < rect.height / 2) sInc();
              else sDec();
            }}
            {...secHandlers}
            style={{ cursor: 'pointer' }}
          >
            <UnitFlipCard digits={[sTens, sOnes]} theme={theme} glyphWidth={gw} cardHeight={ch} fontSize={fs} />
          </div>
        </div>
      )}
    </div>
  );
}

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

  const segments = parseTimeText(text);
  const dc = segments.filter((s) => s.type === 'digits').reduce((sum, seg) => sum + seg.digits.length, 0);
  const sc = segments.filter((s) => s.type === 'separator').length;
  const sw = 0.18;
  const tw = dims.w * 0.96;
  let gw = dc > 0 ? tw / (dc + sc * sw) : 0;
  let ch = gw * 1.78;
  if (ch > dims.h * 0.88) { ch = dims.h * 0.88; gw = ch / 1.78; }
  const fs = gw * 1.52;

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {dims.w > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
          {segments.map((seg, i) =>
            seg.type === 'digits' ? (
              <UnitFlipCard key={i} digits={seg.digits} theme={theme} glyphWidth={gw} cardHeight={ch} fontSize={fs} />
            ) : (
              <span key={i} style={{ color: theme.digit, fontSize: `${ch * 0.42}px`, fontWeight: 900, width: `${gw * sw}px`, textAlign: 'center', lineHeight: 1 }}>
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
      className="soft-button"
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
