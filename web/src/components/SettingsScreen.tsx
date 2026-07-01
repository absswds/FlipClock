import { allThemes } from '../logic/themes';
import type { ClockTheme } from '../logic/themes';
import type { UserSettings, TimeFormat } from '../logic/buildState';
import { resolveLanguage, resolveTimezone } from '../hooks/useSettings';
import type { Lang } from '../logic/i18n';
import { t, supportedLangs, resolveLang } from '../logic/i18n';

interface SettingsScreenProps {
  settings: UserSettings;
  onClose: () => void;
  onSetTimeFormat: (f: TimeFormat) => void;
  onSetShowSeconds: (v: boolean) => void;
  onSetSignature: (v: string) => void;
  onSetThemeId: (v: string) => void;
  onSetLanguage: (v: string) => void;
}

export default function SettingsScreen({
  settings, onClose, onSetTimeFormat, onSetShowSeconds, onSetSignature, onSetThemeId, onSetLanguage,
}: SettingsScreenProps) {
  const lang: Lang = resolveLang(settings.language);
  const currentTheme = allThemes.find((t) => t.id === settings.themeId) ?? allThemes[0];
  const timezone = resolveTimezone(settings);

  const themeDisplayName = (theme: ClockTheme): string => {
    if (lang === 'en') return theme.displayNameEn;
    if (lang === 'ja') return theme.displayNameJa;
    return theme.displayName;
  };

  return (
    <div style={{
      width: '100vw', height: '100vh', background: currentTheme.background,
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
        <h2 style={{ margin: 0, fontSize: 'clamp(16px, 2vw, 24px)', fontWeight: 600 }}>
          {t(lang, 'settings')}
        </h2>
        <button onClick={onClose} style={{
          background: 'transparent', border: `1px solid ${currentTheme.accent}`,
          color: currentTheme.accent, padding: '6px 16px', borderRadius: 6,
          cursor: 'pointer', fontSize: 'clamp(12px, 1.4vw, 16px)',
        }}>
          {t(lang, 'close')}
        </button>
      </div>

      <div style={{ width: '100%', maxWidth: 500, display: 'flex', flexDirection: 'column', gap: 'clamp(12px, 2.5vh, 24px)' }}>
        {/* Theme */}
        <Sect title={t(lang, 'theme')}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {allThemes.map((theme) => (
              <button key={theme.id} onClick={() => onSetThemeId(theme.id)} style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8,
                border: settings.themeId === theme.id ? `2px solid ${currentTheme.accent}` : `1px solid ${currentTheme.date}`,
                background: theme.background, color: currentTheme.digit, cursor: 'pointer',
                fontSize: 'clamp(11px, 1.2vw, 14px)',
              }}>
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

        {/* Time format */}
        <Sect title={t(lang, 'timeFormat')}>
          <ToggleGroup>
            <TBtn active={settings.timeFormat === 'H24'} onClick={() => onSetTimeFormat('H24')} accent={currentTheme.accent} digit={currentTheme.digit} label={t(lang, 'h24')} />
            <TBtn active={settings.timeFormat === 'H12'} onClick={() => onSetTimeFormat('H12')} accent={currentTheme.accent} digit={currentTheme.digit} label={t(lang, 'h12')} />
          </ToggleGroup>
        </Sect>

        {/* Show seconds */}
        <Sect title={t(lang, 'showSeconds')}>
          <ToggleGroup>
            <TBtn active={settings.showSeconds} onClick={() => onSetShowSeconds(true)} accent={currentTheme.accent} digit={currentTheme.digit} label="ON" />
            <TBtn active={!settings.showSeconds} onClick={() => onSetShowSeconds(false)} accent={currentTheme.accent} digit={currentTheme.digit} label="OFF" />
          </ToggleGroup>
        </Sect>

        {/* Signature */}
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

        {/* Language */}
        <Sect title={t(lang, 'language')}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <button onClick={() => onSetLanguage('auto')} style={langBtnStyle(settings.language === 'auto', currentTheme)}>
              Auto
            </button>
            {supportedLangs.map((l) => (
              <button key={l.id} onClick={() => onSetLanguage(l.id)}
                style={langBtnStyle(settings.language === l.id, currentTheme)}>
                {l.native}
              </button>
            ))}
          </div>
        </Sect>

        {/* Timezone */}
        <Sect title={t(lang, 'timezone')}>
          <div style={{
            padding: '8px 12px', borderRadius: 6,
            border: `1px solid ${currentTheme.date}`,
            fontSize: 'clamp(11px, 1.2vw, 14px)',
            color: currentTheme.signature, display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span style={{ background: currentTheme.accent, color: currentTheme.background, padding: '2px 6px', borderRadius: 3, fontSize: '0.8em', fontWeight: 600 }}>
              {t(lang, 'detected')}
            </span>
            {timezone}
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

function TBtn({ active, onClick, accent, digit, label }: {
  active: boolean; onClick: () => void; accent: string; digit: string; label: string;
}) {
  return (
    <button onClick={onClick} style={{
      padding: '6px 18px', border: active ? `2px solid ${accent}` : `1px solid ${digit}33`,
      borderRadius: 6, background: active ? `${accent}22` : 'transparent',
      color: active ? accent : digit, cursor: 'pointer',
      fontWeight: active ? 600 : 400, fontSize: 'clamp(11px, 1.3vw, 14px)',
    }}>
      {label}
    </button>
  );
}
