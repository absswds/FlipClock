import { allThemes } from '../logic/themes';
import type { ClockTheme } from '../logic/themes';
import type { UserSettings, TimeFormat } from '../logic/buildState';
import { resolveTimezone } from '../hooks/useSettings';
import type { Lang } from '../logic/i18n';
import { t, supportedLangs, resolveLang } from '../logic/i18n';

interface SettingsScreenProps {
  settings: UserSettings;
  onClose: () => void;
  onSetTimeFormat: (f: TimeFormat) => void;
  onSetShowSeconds: (v: boolean) => void;
  onSetShowSignature: (v: boolean) => void;
  onSetSignature: (v: string) => void;
  onSetThemeId: (v: string) => void;
  onSetLanguage: (v: string) => void;
  onSetTimezone: (v: string) => void;
  onSetDateFontSize: (v: number) => void;
  onSetSignatureFontSize: (v: number) => void;
}

export default function SettingsScreen({
  settings,
  onClose,
  onSetTimeFormat,
  onSetShowSeconds,
  onSetShowSignature,
  onSetSignature,
  onSetThemeId,
  onSetLanguage,
  onSetTimezone,
  onSetDateFontSize,
  onSetSignatureFontSize,
}: SettingsScreenProps) {
  const lang: Lang = resolveLang(settings.language);
  const currentTheme = allThemes.find((t) => t.id === settings.themeId) ?? allThemes[0];
  const timezone = resolveTimezone(settings);
  const timezoneInputId = 'settings-timezone';

  const themeDisplayName = (theme: ClockTheme): string => {
    if (lang === 'en') return theme.displayNameEn;
    if (lang === 'ja') return theme.displayNameJa;
    return theme.displayName;
  };

  const themeButtonStyle = (theme: ClockTheme): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 14px',
    borderRadius: 8,
    border: settings.themeId === theme.id
      ? `2px solid ${currentTheme.accent}`
      : `1px solid ${theme.cardEdge}`,
    background: theme.background,
    color: theme.digit,
    cursor: 'pointer',
    fontSize: 'clamp(11px, 1.2vw, 14px)',
    boxShadow: theme.id === 'paper_desk'
      ? '0 6px 16px rgba(90, 68, 40, 0.08)'
      : 'inset 0 1px 0 rgba(255,255,255,0.08)',
  });

  return (
    <div className="page-panel" style={{
      width: '100%', height: '100%', background: currentTheme.background,
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: 'clamp(20px, 4vh, 40px) clamp(12px, 3vw, 24px)',
      color: currentTheme.digit, fontFamily: 'system-ui, sans-serif',
      overflow: 'auto', transition: 'background 0.4s',
    }}>
      <div style={{
        width: '100%', maxWidth: 500, display: 'flex',
        justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 'clamp(16px, 3vh, 32px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <h2 style={{ margin: 0, fontSize: 'clamp(16px, 2vw, 24px)', fontWeight: 600 }}>
            {t(lang, 'settings')}
          </h2>
          <a
            href="https://github.com/absswds/FlipClock"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            title="GitHub"
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 28, height: 28, borderRadius: 6, color: currentTheme.signature,
              transition: 'color 0.2s, background 0.2s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.color = currentTheme.accent;
              (e.currentTarget as HTMLAnchorElement).style.background = `${currentTheme.accent}18`;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.color = currentTheme.signature;
              (e.currentTarget as HTMLAnchorElement).style.background = 'transparent';
            }}
          >
            <svg width="18" height="18" viewBox="0 0 19 19" fill="currentColor">
              <path fillRule="evenodd" d="M9.356 1.85C5.05 1.85 1.57 5.356 1.57 9.694a7.84 7.84 0 0 0 5.324 7.44c.387.079.528-.168.528-.376 0-.182-.013-.805-.013-1.454-2.165.467-2.616-.935-2.616-.935-.349-.91-.864-1.143-.864-1.143-.71-.48.051-.48.051-.48.787.051 1.2.805 1.2.805.695 1.194 1.817.857 2.268.649.064-.507.27-.857.49-1.052-1.728-.182-3.545-.857-3.545-3.87 0-.857.31-1.558.8-2.104-.078-.195-.349-1 .077-2.078 0 0 .657-.208 2.14.805a7.5 7.5 0 0 1 1.946-.26c.657 0 1.328.092 1.946.26 1.483-1.013 2.14-.805 2.14-.805.426 1.078.155 1.883.078 2.078.502.546.799 1.247.799 2.104 0 3.013-1.818 3.675-3.558 3.87.284.247.528.714.528 1.454 0 1.052-.012 1.896-.012 2.156 0 .208.142.455.528.377a7.84 7.84 0 0 0 5.324-7.441c.013-4.338-3.48-7.844-7.773-7.844" clipRule="evenodd" />
            </svg>
          </a>
        </div>
        <button className="soft-button" onClick={onClose} style={{
          background: 'transparent', border: `1px solid ${currentTheme.accent}`,
          color: currentTheme.accent, padding: '6px 16px', borderRadius: 6,
          cursor: 'pointer', fontSize: 'clamp(12px, 1.4vw, 16px)',
        }}>
          {t(lang, 'close')}
        </button>
      </div>

      <div style={{ width: '100%', maxWidth: 500, display: 'flex', flexDirection: 'column', gap: 'clamp(12px, 2.5vh, 24px)' }}>
        <Sect title={t(lang, 'theme')}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {allThemes.map((theme) => (
              <button
                className="soft-button"
                key={theme.id}
                onClick={() => onSetThemeId(theme.id)}
                style={themeButtonStyle(theme)}
              >
                <span style={{
                  width: 16, height: 16, borderRadius: 4,
                  background: `linear-gradient(180deg, ${theme.cardTop}, ${theme.cardBottom})`,
                  border: `1px solid ${theme.digit}`, display: 'inline-block',
                }} />
                {themeDisplayName(theme)}
              </button>
            ))}
          </div>
        </Sect>

        <Sect title={t(lang, 'timeFormat')}>
          <ToggleGroup>
            <TBtn active={settings.timeFormat === 'H24'} onClick={() => onSetTimeFormat('H24')} accent={currentTheme.accent} digit={currentTheme.digit} label={t(lang, 'h24')} />
            <TBtn active={settings.timeFormat === 'H12'} onClick={() => onSetTimeFormat('H12')} accent={currentTheme.accent} digit={currentTheme.digit} label={t(lang, 'h12')} />
          </ToggleGroup>
        </Sect>

        <Sect title={t(lang, 'showSeconds')}>
          <ToggleGroup>
            <TBtn active={settings.showSeconds} onClick={() => onSetShowSeconds(true)} accent={currentTheme.accent} digit={currentTheme.digit} label="ON" />
            <TBtn active={!settings.showSeconds} onClick={() => onSetShowSeconds(false)} accent={currentTheme.accent} digit={currentTheme.digit} label="OFF" />
          </ToggleGroup>
        </Sect>

        <Sect title={t(lang, 'showSignature')}>
          <ToggleGroup>
            <TBtn active={settings.showSignature} onClick={() => onSetShowSignature(true)} accent={currentTheme.accent} digit={currentTheme.digit} label="ON" />
            <TBtn active={!settings.showSignature} onClick={() => onSetShowSignature(false)} accent={currentTheme.accent} digit={currentTheme.digit} label="OFF" />
          </ToggleGroup>
        </Sect>

        <Sect title={t(lang, 'signature')}>
          <input type="text" value={settings.signature} onChange={(e) => onSetSignature(e.target.value)}
            placeholder={t(lang, 'signaturePlaceholder')}
            style={{
              width: '100%', padding: '8px 12px', borderRadius: 6,
              border: `1px solid ${currentTheme.date}`, background: currentTheme.background,
              color: currentTheme.digit, fontSize: 'clamp(12px, 1.4vw, 16px)',
              outline: 'none', boxSizing: 'border-box',
            }}
          />
        </Sect>

        <Sect title={t(lang, 'fontSize')}>
          <RangeField
            label={t(lang, 'dateFontSize')}
            value={settings.dateFontSize}
            min={14}
            max={40}
            onChange={onSetDateFontSize}
            theme={currentTheme}
          />
          <RangeField
            label={t(lang, 'signatureFontSize')}
            value={settings.signatureFontSize}
            min={10}
            max={28}
            onChange={onSetSignatureFontSize}
            theme={currentTheme}
          />
        </Sect>

        <Sect title={t(lang, 'language')}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <button className="soft-button" onClick={() => onSetLanguage('auto')} style={langBtnStyle(settings.language === 'auto', currentTheme)}>
              Auto
            </button>
            {supportedLangs.map((l) => (
              <button className="soft-button" key={l.id} onClick={() => onSetLanguage(l.id)}
                style={langBtnStyle(settings.language === l.id, currentTheme)}>
                {l.native}
              </button>
            ))}
          </div>
        </Sect>

        <Sect title={t(lang, 'timezone')}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <button className="soft-button" onClick={() => onSetTimezone('auto')} style={langBtnStyle(settings.timezone === 'auto', currentTheme)}>
                Auto
              </button>
              <span style={{ color: currentTheme.signature, fontSize: 'clamp(11px, 1.2vw, 14px)' }}>
                {t(lang, 'detected')}: {timezone}
              </span>
            </div>
            <label htmlFor={timezoneInputId} style={{ display: 'none' }}>
              Timezone
            </label>
            <input
              id={timezoneInputId}
              aria-label="Timezone"
              list="timezone-options"
              type="text"
              value={settings.timezone === 'auto' ? '' : settings.timezone}
              onChange={(e) => onSetTimezone(e.target.value)}
              placeholder={timezone}
              style={{
                width: '100%', padding: '8px 12px', borderRadius: 6,
                border: `1px solid ${currentTheme.date}`, background: currentTheme.background,
                color: currentTheme.digit, fontSize: 'clamp(12px, 1.4vw, 16px)',
                outline: 'none', boxSizing: 'border-box',
              }}
            />
            <datalist id="timezone-options">
              {getTimezoneOptions().map((zone) => (
                <option key={zone} value={zone} />
              ))}
            </datalist>
          </div>
        </Sect>
      </div>
    </div>
  );
}

function langBtnStyle(active: boolean, t: ClockTheme): React.CSSProperties {
  return {
    padding: '6px 14px', borderRadius: 6,
    border: active ? `2px solid ${t.accent}` : `1px solid ${t.date}`,
    background: 'transparent', color: t.digit, cursor: 'pointer',
    fontSize: 'clamp(11px, 1.2vw, 14px)',
  };
}

function Sect({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 'clamp(10px, 1.1vw, 13px)', color: '#888', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function ToggleGroup({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'flex', gap: 0 }}>{children}</div>;
}

function RangeField({
  label,
  value,
  min,
  max,
  onChange,
  theme,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  theme: ClockTheme;
}) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
      <span style={{
        display: 'flex',
        justifyContent: 'space-between',
        color: theme.signature,
        fontSize: 'clamp(11px, 1.2vw, 14px)',
      }}>
        <span>{label}</span>
        <span>{value}px</span>
      </span>
      <input
        aria-label={label}
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ accentColor: theme.accent }}
      />
    </label>
  );
}

function TBtn({ active, onClick, accent, digit, label }: {
  active: boolean; onClick: () => void; accent: string; digit: string; label: string;
}) {
  return (
    <button className="soft-button" onClick={onClick} style={{
      padding: '6px 18px', border: active ? `2px solid ${accent}` : `1px solid ${digit}33`,
      borderRadius: 6, background: active ? `${accent}22` : 'transparent',
      color: active ? accent : digit, cursor: 'pointer',
      fontWeight: active ? 600 : 400, fontSize: 'clamp(11px, 1.3vw, 14px)',
    }}>
      {label}
    </button>
  );
}

const fallbackTimezones = [
  'UTC',
  'Asia/Hong_Kong',
  'Asia/Shanghai',
  'Asia/Tokyo',
  'Asia/Seoul',
  'Asia/Singapore',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Toronto',
  'Australia/Sydney',
];

function getTimezoneOptions(): string[] {
  const intl = Intl as typeof Intl & {
    supportedValuesOf?: (key: string) => string[];
  };
  const supported = typeof intl.supportedValuesOf === 'function'
    ? intl.supportedValuesOf('timeZone')
    : [];
  return supported.length > 0 ? supported : fallbackTimezones;
}
