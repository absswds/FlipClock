import { describe, it, expect } from 'vitest';
import { buildState, type UserSettings } from './buildState';

function makeSettings(overrides: Partial<UserSettings> = {}): UserSettings {
  return {
    timeFormat: 'H24',
    showSeconds: true,
    signature: '',
    themeId: 'classic_black',
    language: 'zh',
    timezone: 'Asia/Shanghai',
    ...overrides,
  };
}

function makeShanghaiDate(localIso: string): Date {
  return new Date(`${localIso}+08:00`);
}

describe('buildState', () => {
  it('extracts digits for 24h format with seconds', () => {
    // 14:08:35 = 14:08:35
    const d = makeShanghaiDate('2026-07-01T14:08:35');
    const state = buildState(d, makeSettings({ timeFormat: 'H24' }));

    expect(state.hourDigits).toEqual([1, 4]);
    expect(state.minuteDigits).toEqual([0, 8]);
    expect(state.secondDigits).toEqual([3, 5]);
    expect(state.amPm).toBeNull();
  });

  it('handles 12h AM (0->12)', () => {
    // 0:05:30 = 12:05:30 AM
    const d = makeShanghaiDate('2026-07-01T00:05:30');
    const state = buildState(d, makeSettings({ timeFormat: 'H12' }));

    expect(state.hourDigits).toEqual([1, 2]);
    expect(state.amPm).toBe('AM');
  });

  it('handles 12h PM (13->1)', () => {
    // 13:05:30 = 1:05:30 PM
    const d = makeShanghaiDate('2026-07-01T13:05:30');
    const state = buildState(d, makeSettings({ timeFormat: 'H12' }));

    expect(state.hourDigits).toEqual([1]);
    expect(state.amPm).toBe('PM');
  });

  it('handles 12h noon (12->12 PM)', () => {
    const d = makeShanghaiDate('2026-07-01T12:00:00');
    const state = buildState(d, makeSettings({ timeFormat: 'H12' }));

    expect(state.hourDigits).toEqual([1, 2]);
    expect(state.amPm).toBe('PM');
  });

  it('no leading zero for single-digit hour in 12h', () => {
    const d = makeShanghaiDate('2026-07-01T09:30:00');
    const state = buildState(d, makeSettings({ timeFormat: 'H12' }));

    expect(state.hourDigits).toEqual([9]);
  });

  it('leading zero for 10+ in 12h', () => {
    const d = makeShanghaiDate('2026-07-01T10:30:00');
    const state = buildState(d, makeSettings({ timeFormat: 'H12' }));

    expect(state.hourDigits).toEqual([1, 0]);
  });

  it('hides seconds when showSeconds is false', () => {
    const d = makeShanghaiDate('2026-07-01T14:08:35');
    const state = buildState(d, makeSettings({ showSeconds: false }));

    expect(state.showSeconds).toBe(false);
    // seconds digits still computed, just not shown
  });

  it('formats date text in Chinese', () => {
    const d = makeShanghaiDate('2026-07-01T14:08:35'); // July 1, 2026 is a Wednesday
    const state = buildState(d, makeSettings({ language: 'zh' }));

    expect(state.dateText).toContain('2026年');
    expect(state.dateText).toContain('7月');
    expect(state.dateText).toContain('1日');
  });

  it('picks the correct theme by id', () => {
    const d = new Date();
    const state = buildState(d, makeSettings({ themeId: 'pure_black' }));

    expect(state.theme.id).toBe('pure_black');
  });

  it('falls back to classic black for unknown theme id', () => {
    const d = new Date();
    const state = buildState(d, makeSettings({ themeId: 'nonexistent' }));

    expect(state.theme.id).toBe('paper_desk');
  });

  it('passes signature through', () => {
    const d = new Date();
    const state = buildState(d, makeSettings({ signature: 'Hello World' }));

    expect(state.signature).toBe('Hello World');
  });

  it('uses a localized default signature when signature is empty', () => {
    const d = new Date();
    const state = buildState(d, makeSettings({ language: 'en', signature: '' }));

    expect(state.signature).toBe('Flip Clock');
  });

  it('keeps the user signature when one is set', () => {
    const d = new Date();
    const state = buildState(d, makeSettings({ language: 'en', signature: 'My desk clock' }));

    expect(state.signature).toBe('My desk clock');
  });

  it('renders time and date using the selected timezone', () => {
    const d = new Date('2026-07-01T16:08:35Z');
    const state = buildState(d, makeSettings({
      language: 'en',
      timezone: 'Asia/Tokyo',
      timeFormat: 'H24',
    }));

    expect(state.hourDigits).toEqual([0, 1]);
    expect(state.minuteDigits).toEqual([0, 8]);
    expect(state.secondDigits).toEqual([3, 5]);
    expect(state.dateText).toContain('July 2, 2026');
  });
});
