import { useState, useEffect, useRef } from 'react';
import type { ClockTheme } from '../logic/themes';
import type { CountdownTarget, CountdownRemaining } from '../logic/productivityModels';
import type { Lang } from '../logic/i18n';
import { t } from '../logic/i18n';
import { alertComplete } from '../logic/notify';
import FlipDurationDisplay from './FlipDurationDisplay';

interface CountdownScreenProps {
  theme: ClockTheme;
  target: CountdownTarget;
  remaining: CountdownRemaining;
  presets: CountdownTarget[];
  onSetTarget: (t: CountdownTarget) => void;
  lang: Lang;
}

export default function CountdownScreen({ theme, target, remaining, presets, onSetTarget, lang }: CountdownScreenProps) {
  const [showCustom, setShowCustom] = useState(false);
  const [customDate, setCustomDate] = useState('');
  const [customTitle, setCustomTitle] = useState('');

  const timeText = `${String(remaining.hours).padStart(2, '0')}:${String(remaining.minutes).padStart(2, '0')}:${String(remaining.seconds).padStart(2, '0')}`;

  // Alert when countdown hits zero
  const wasDone = useRef(false);
  const isDone = remaining.days === 0 && remaining.hours === 0 && remaining.minutes === 0 && remaining.seconds === 0;
  useEffect(() => {
    if (isDone && !wasDone.current) {
      wasDone.current = true;
      alertComplete(target.isPreset ? t(lang, target.id as keyof Parameters<typeof t>[1]) : target.title, '');
    }
    if (!isDone) wasDone.current = false;
  }, [isDone, target, lang]);

  const addCustom = () => {
    if (!customDate || !customTitle.trim()) return;
    onSetTarget({
      id: `custom-${Date.now()}`,
      title: customTitle.trim(),
      date: customDate,
      isPreset: false,
    });
    setShowCustom(false);
    setCustomDate('');
    setCustomTitle('');
  };

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'clamp(8px, 2vh, 18px)', padding: '2vw 2vw max(80px, 10vh) 2vw' }}>
      <div style={{ color: theme.date, fontSize: 'clamp(12px, 1.6vw, 18px)', fontWeight: 500 }}>
        {target.isPreset ? t(lang, target.id as keyof Parameters<typeof t>[1]) : target.title}
      </div>

      <div style={{ flex: 1, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{
            color: theme.digit, fontSize: 'clamp(28px, 6vw, 64px)', fontWeight: 900,
            fontVariantNumeric: 'tabular-nums', lineHeight: 1,
            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
          }}>
            {remaining.days}
          </span>
          <span style={{ color: theme.signature, fontSize: 'clamp(14px, 2.5vw, 24px)', marginLeft: 4 }}>
            {t(lang, 'day')}
          </span>
        </div>

        <div style={{ width: '100%', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <FlipDurationDisplay text={timeText} theme={theme} />
        </div>
      </div>

      {/* Presets + Custom */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
        {presets.map((p) => (
          <button
            key={p.id}
            onClick={() => onSetTarget(p)}
            style={{
              padding: '6px 14px', borderRadius: 6,
              border: target.id === p.id ? `2px solid ${theme.accent}` : `1px solid ${theme.date}`,
              background: target.id === p.id ? `${theme.accent}22` : 'transparent',
              color: target.id === p.id ? theme.accent : theme.signature,
              cursor: 'pointer', fontSize: 'clamp(10px, 1.2vw, 13px)',
            }}
          >
            {t(lang, p.id as keyof Parameters<typeof t>[1])}
          </button>
        ))}
        <button
          onClick={() => setShowCustom(!showCustom)}
          style={{
            padding: '6px 14px', borderRadius: 6,
            border: `1px dashed ${theme.date}`,
            background: 'transparent', color: theme.accent,
            cursor: 'pointer', fontSize: 'clamp(10px, 1.2vw, 13px)',
          }}
        >
          ＋ {t(lang, 'customDate')}
        </button>
      </div>

      {/* Custom date input */}
      {showCustom && (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
          <input
            type="text"
            value={customTitle}
            onChange={(e) => setCustomTitle(e.target.value)}
            placeholder={t(lang, 'signaturePlaceholder')}
            style={{
              width: 120, padding: '4px 8px', borderRadius: 4,
              border: `1px solid ${theme.date}`, background: 'transparent',
              color: theme.digit, fontSize: 13, outline: 'none',
            }}
          />
          <input
            type="date"
            value={customDate}
            onChange={(e) => setCustomDate(e.target.value)}
            style={{
              padding: '4px 8px', borderRadius: 4,
              border: `1px solid ${theme.date}`, background: 'transparent',
              color: theme.digit, fontSize: 13, outline: 'none',
              colorScheme: 'dark',
            }}
          />
          <button
            onClick={addCustom}
            style={{
              padding: '4px 14px', borderRadius: 4,
              border: 'none', background: theme.accent,
              color: theme.background, fontWeight: 600,
              cursor: 'pointer', fontSize: 13,
            }}
          >
            OK
          </button>
        </div>
      )}
    </div>
  );
}
