import type { ClockTheme } from './themes';
import { byId } from './themes';

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

const weekdayKeys: Record<string, string[]> = {
  zh: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
  ja: ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'],
};

function getWeekday(date: Date, lang: string): string {
  const day = date.getDay();
  const keys = weekdayKeys[lang] ?? weekdayKeys['zh'];
  if (keys) return keys[day];

  return date.toLocaleDateString(lang, { weekday: 'long' });
}

/**
 * Pure mapping from a moment + settings to render state.
 * Port of ClockViewModel.buildState().
 */
export function buildState(
  now: Date,
  settings: UserSettings,
): ClockUiState {
  const lang = settings.language === 'ja' ? 'ja' : 'zh';
  const hour24 = now.getHours();
  let displayHour: number;
  let amPm: string | null;

  if (settings.timeFormat === 'H24') {
    displayHour = hour24;
    amPm = null;
  } else {
    displayHour = ((hour24 + 11) % 12) + 1; // 0->12, 13->1, 23->11
    amPm = hour24 < 12 ? 'AM' : 'PM';
  }

  const hourDigits =
    settings.timeFormat === 'H12' && displayHour < 10
      ? [displayHour]
      : [Math.floor(displayHour / 10), displayHour % 10];

  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const weekday = getWeekday(now, lang);

  // Format: "2026年7月1日 星期三" (zh) / "2026年7月1日 水曜日" (ja)
  const dateText = `${year}年${month}月${day}日 ${weekday}`;

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
