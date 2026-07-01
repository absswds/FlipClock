import type { ClockTheme } from './themes';
import { byId } from './themes';
import { resolveLang, t, weekdays, type Lang } from './i18n';

export type TimeFormat = 'H24' | 'H12';

export interface UserSettings {
  timeFormat: TimeFormat;
  showSeconds: boolean;
  signature: string;
  themeId: string;
  themeCustomized?: boolean;
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

function resolveClockTimezone(timezone: string): string {
  if (timezone !== 'auto') return timezone;
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

function safeFormatter(
  locale: string,
  timezone: string,
  options: Intl.DateTimeFormatOptions,
): Intl.DateTimeFormat {
  try {
    return new Intl.DateTimeFormat(locale, { ...options, timeZone: timezone });
  } catch {
    return new Intl.DateTimeFormat(locale, options);
  }
}

function getDatePart(
  parts: Intl.DateTimeFormatPart[],
  type: Intl.DateTimeFormatPartTypes,
): string {
  return parts.find((part) => part.type === type)?.value ?? '';
}

export function buildState(
  now: Date,
  settings: UserSettings,
): ClockUiState {
  const lang: Lang = resolveLang(settings.language);
  const localeMap: Record<Lang, string> = {
    zh: 'zh-CN', en: 'en-US', ja: 'ja-JP', ko: 'ko-KR',
    fr: 'fr-FR', de: 'de-DE', es: 'es-ES', pt: 'pt-BR',
    ru: 'ru-RU', ar: 'ar-SA',
  };
  const locale = localeMap[lang] ?? localeMap.zh;
  const timezone = resolveClockTimezone(settings.timezone);

  const timeParts = safeFormatter(locale, timezone, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now);
  const dateParts = safeFormatter(locale, timezone, {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    weekday: 'long',
  }).formatToParts(now);

  const hour24 = Number(getDatePart(timeParts, 'hour'));
  const minute = Number(getDatePart(timeParts, 'minute'));
  const second = Number(getDatePart(timeParts, 'second'));

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

  const year = Number(getDatePart(dateParts, 'year'));
  const month = Number(getDatePart(dateParts, 'month'));
  const day = Number(getDatePart(dateParts, 'day'));
  const wd = getDatePart(dateParts, 'weekday') || (weekdays[lang] ?? weekdays.zh)[now.getDay()];

  const isCJK = lang === 'zh' || lang === 'ja' || lang === 'ko';
  const dateText = isCJK
    ? `${year}年${month}月${day}日 ${wd}`
    : `${wd}, ${safeFormatter(locale, timezone, { year: 'numeric', month: 'long', day: 'numeric' }).format(now)}`;

  return {
    hourDigits,
    minuteDigits: [Math.floor(minute / 10), minute % 10],
    secondDigits: [Math.floor(second / 10), second % 10],
    showSeconds: settings.showSeconds,
    amPm,
    dateText,
    signature: settings.signature.trim() ? settings.signature : t(lang, 'defaultSignature'),
    theme: byId(settings.themeId),
  };
}
