import { allThemes } from '../logic/themes';
import type { ClockTheme } from '../logic/themes';
import type { UserSettings, TimeFormat } from '../logic/buildState';
import { resolveLanguage, resolveTimezone } from '../hooks/useSettings';

interface SettingsScreenProps {
  settings: UserSettings;
  onClose: () => void;
  onSetTimeFormat: (f: TimeFormat) => void;
  onSetShowSeconds: (v: boolean) => void;
  onSetSignature: (v: string) => void;
  onSetThemeId: (v: string) => void;
  onSetLanguage: (v: string) => void;
}

const languages = [
  { id: 'auto', label: '自动 / Auto' },
  { id: 'zh', label: '中文' },
  { id: 'en', label: 'English' },
  { id: 'ja', label: '日本語' },
];

const uiText: Record<string, {
  title: string;
  theme: string;
  timeFormat: string;
  h24: string;
  h12: string;
  showSeconds: string;
  signature: string;
  signaturePlaceholder: string;
  language: string;
  timezone: string;
  detected: string;
  close: string;
}> = {
  zh: {
    title: '设置',
    theme: '主题',
    timeFormat: '时间格式',
    h24: '24 小时',
    h12: '12 小时',
    showSeconds: '显示秒',
    signature: '签名',
    signaturePlaceholder: '输入自定义签名...',
    language: '语言',
    timezone: '时区',
    detected: '检测到',
    close: '返回',
  },
  en: {
    title: 'Settings',
    theme: 'Theme',
    timeFormat: 'Time Format',
    h24: '24-Hour',
    h12: '12-Hour',
    showSeconds: 'Show Seconds',
    signature: 'Signature',
    signaturePlaceholder: 'Enter custom signature...',
    language: 'Language',
    timezone: 'Timezone',
    detected: 'Detected',
    close: 'Back',
  },
  ja: {
    title: '設定',
    theme: 'テーマ',
    timeFormat: '時刻形式',
    h24: '24時間',
    h12: '12時間',
    showSeconds: '秒を表示',
    signature: '署名',
    signaturePlaceholder: '署名を入力...',
    language: '言語',
    timezone: 'タイムゾーン',
    detected: '検出',
    close: '戻る',
  },
};

function t(settings: UserSettings): typeof uiText.zh {
  const lang = resolveLanguage(settings);
  return uiText[lang] ?? uiText.zh;
}

export default function SettingsScreen({
  settings,
  onClose,
  onSetTimeFormat,
  onSetShowSeconds,
  onSetSignature,
  onSetThemeId,
  onSetLanguage,
}: SettingsScreenProps) {
  const texts = t(settings);
  const currentTheme = allThemes.find((t) => t.id === settings.themeId) ?? allThemes[0];
  const timezone = resolveTimezone(settings);

  const themeDisplayName = (theme: ClockTheme): string => {
    const lang = resolveLanguage(settings);
    if (lang === 'en') return theme.displayNameEn;
    if (lang === 'ja') return theme.displayNameJa;
    return theme.displayName;
  };

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        background: currentTheme.background,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 'clamp(20px, 4vh, 40px) clamp(12px, 3vw, 24px)',
        color: currentTheme.digit,
        fontFamily: 'system-ui, sans-serif',
        overflow: 'auto',
        transition: 'background 0.4s',
      }}
    >
      {/* Header */}
      <div
        style={{
          width: '100%',
          maxWidth: 500,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 'clamp(16px, 3vh, 32px)',
        }}
      >
        <h2 style={{ margin: 0, fontSize: 'clamp(16px, 2vw, 24px)', fontWeight: 600 }}>
          {texts.title}
        </h2>
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: `1px solid ${currentTheme.accent}`,
            color: currentTheme.accent,
            padding: '6px 16px',
            borderRadius: 6,
            cursor: 'pointer',
            fontSize: 'clamp(12px, 1.4vw, 16px)',
          }}
        >
          {texts.close}
        </button>
      </div>

      <div style={{ width: '100%', maxWidth: 500, display: 'flex', flexDirection: 'column', gap: 'clamp(12px, 2.5vh, 24px)' }}>
        {/* Theme picker */}
        <SettingSection title={texts.theme}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {allThemes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => onSetThemeId(theme.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 14px',
                  borderRadius: 8,
                  border: settings.themeId === theme.id
                    ? `2px solid ${currentTheme.accent}`
                    : `1px solid ${currentTheme.date}`,
                  background: theme.background,
                  color: currentTheme.digit,
                  cursor: 'pointer',
                  fontSize: 'clamp(11px, 1.2vw, 14px)',
                }}
              >
                <span
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: 4,
                    background: `linear-gradient(180deg, ${theme.cardTop}, ${theme.cardBottom})`,
                    border: `1px solid ${theme.digit}`,
                    display: 'inline-block',
                  }}
                />
                {themeDisplayName(theme)}
              </button>
            ))}
          </div>
        </SettingSection>

        {/* Time format */}
        <SettingSection title={texts.timeFormat}>
          <ToggleGroup>
            <ToggleBtn
              active={settings.timeFormat === 'H24'}
              onClick={() => onSetTimeFormat('H24')}
              accent={currentTheme.accent}
              digit={currentTheme.digit}
              label={texts.h24}
            />
            <ToggleBtn
              active={settings.timeFormat === 'H12'}
              onClick={() => onSetTimeFormat('H12')}
              accent={currentTheme.accent}
              digit={currentTheme.digit}
              label={texts.h12}
            />
          </ToggleGroup>
        </SettingSection>

        {/* Show seconds */}
        <SettingSection title={texts.showSeconds}>
          <ToggleGroup>
            <ToggleBtn
              active={settings.showSeconds}
              onClick={() => onSetShowSeconds(true)}
              accent={currentTheme.accent}
              digit={currentTheme.digit}
              label="ON"
            />
            <ToggleBtn
              active={!settings.showSeconds}
              onClick={() => onSetShowSeconds(false)}
              accent={currentTheme.accent}
              digit={currentTheme.digit}
              label="OFF"
            />
          </ToggleGroup>
        </SettingSection>

        {/* Signature */}
        <SettingSection title={texts.signature}>
          <input
            type="text"
            value={settings.signature}
            onChange={(e) => onSetSignature(e.target.value)}
            placeholder={texts.signaturePlaceholder}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: 6,
              border: `1px solid ${currentTheme.date}`,
              background: currentTheme.background,
              color: currentTheme.digit,
              fontSize: 'clamp(12px, 1.4vw, 16px)',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </SettingSection>

        {/* Language */}
        <SettingSection title={texts.language}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {languages.map((lang) => (
              <button
                key={lang.id}
                onClick={() => onSetLanguage(lang.id)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 6,
                  border: settings.language === lang.id
                    ? `2px solid ${currentTheme.accent}`
                    : `1px solid ${currentTheme.date}`,
                  background: 'transparent',
                  color: currentTheme.digit,
                  cursor: 'pointer',
                  fontSize: 'clamp(11px, 1.2vw, 14px)',
                }}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </SettingSection>

        {/* Timezone display */}
        <SettingSection title={texts.timezone}>
          <div
            style={{
              padding: '8px 12px',
              borderRadius: 6,
              border: `1px solid ${currentTheme.date}`,
              fontSize: 'clamp(11px, 1.2vw, 14px)',
              color: currentTheme.signature,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span style={{ background: currentTheme.accent, color: currentTheme.background, padding: '2px 6px', borderRadius: 3, fontSize: '0.8em', fontWeight: 600 }}>
              {texts.detected}
            </span>
            {timezone}
          </div>
        </SettingSection>
      </div>
    </div>
  );
}

function SettingSection({ title, children }: { title: string; children: React.ReactNode }) {
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

function ToggleBtn({
  active,
  onClick,
  accent,
  digit,
  label,
}: {
  active: boolean;
  onClick: () => void;
  accent: string;
  digit: string;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '6px 18px',
        border: active ? `2px solid ${accent}` : `1px solid ${digit}33`,
        borderRadius: 6,
        background: active ? `${accent}22` : 'transparent',
        color: active ? accent : digit,
        cursor: 'pointer',
        fontWeight: active ? 600 : 400,
        fontSize: 'clamp(11px, 1.3vw, 14px)',
        marginRight: 0,
      }}
    >
      {label}
    </button>
  );
}
