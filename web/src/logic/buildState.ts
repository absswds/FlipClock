import type { ClockTheme } from './themes';
import { byId } from './themes';
import { resolveLang, weekdays, type Lang } from './i18n';

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

  // Format: "2026年7月1日 星期三" (zh) — month/day labels vary by locale
  const dateText = lang === 'en'
    ? `${wd}, ${now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`
    : lang === 'ja' || lang === 'ko'
    ? `${year}年${month}月${day}日 ${wd}`
    : lang === 'ar'
    ? `${wd}، ${day}/${month}/${year}`
    : `${year}年${month}月${day}日 ${wd}`;

  return {
    hourDigits,
    minuteDigits: [Math.floor(now.getMinutes() / 10), now.getMinutes() % 10],
    secondDigits: [Math.floor(now.getSeconds() / 10), now.getSeconds() % 10],
    showSeconds: settings.showSeconds,
    amPm,
    dateText,
    signature: settings.signature,
    theme: byId(settings.themeId),
  };
}
