import type { ClockTheme } from './themes';
import { byId } from './themes';
import { resolveLang, t, weekdays, type Lang } from './i18n';

export type TimeFormat = 'H24' | 'H12';

export interface UserSettings {
  timeFormat: TimeFormat;
  showSeconds: boolean;
  signature: string;
  themeId: string;
  language: string;
  timezone: string;
}

export interface ClockUiState {
  hourDigits: number[];
  minuteDigits: number[];
  secondDigits: number[];
  showSeconds: boolean;
  amPm: string | null;
  dateText: string;
  signature: string;
  theme: ClockTheme;
}

/**
 * Pure mapping from a moment + settings to render state.
 * Port of ClockViewModel.buildState().
 */
export function buildState(
  now: Date,
  settings: UserSettings,
): ClockUiState {
  const lang: Lang = resolveLang(settings.language);
  const hour24 = now.getHours();
  let displayHour: number;
  let amPm: string | null;

  if (settings.timeFormat === 'H24') {
    displayHour = hour24;
    amPm = null;
  } else {
    displayHour = ((hour24 + 11) % 12) + 1;
    amPm = hour24 < 12 ? 'AM' : 'PM';
  }

  const hourDigits =
    settings.timeFormat === 'H12' && displayHour < 10
      ? [displayHour]
      : [Math.floor(displayHour / 10), displayHour % 10];

  const wd = (weekdays[lang] ?? weekdays.zh)[now.getDay()];
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();

  // Locale-appropriate date format for all languages
  const localeMap: Record<Lang, string> = {
    zh: 'zh-CN', en: 'en-US', ja: 'ja-JP', ko: 'ko-KR',
    fr: 'fr-FR', de: 'de-DE', es: 'es-ES', pt: 'pt-BR',
    ru: 'ru-RU', ar: 'ar-SA',
  };
  const locale = localeMap[lang] ?? localeMap.zh;

  const isCJK = lang === 'zh' || lang === 'ja' || lang === 'ko';
  const dateText = isCJK
    ? `${year}年${month}月${day}日 ${wd}`
    : `${wd}, ${now.toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' })}`;

  return {
    hourDigits,
    minuteDigits: [Math.floor(now.getMinutes() / 10), now.getMinutes() % 10],
    secondDigits: [Math.floor(now.getSeconds() / 10), now.getSeconds() % 10],
    showSeconds: settings.showSeconds,
    amPm,
    dateText,
    signature: settings.signature.trim() ? settings.signature : t(lang, 'defaultSignature'),
    theme: byId(settings.themeId),
  };
}
