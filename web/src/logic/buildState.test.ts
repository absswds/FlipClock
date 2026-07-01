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

describe('buildState', () => {
  it('extracts digits for 24h format with seconds', () => {
    // 14:08:35 = 14:08:35
    const d = new Date(2026, 6, 1, 14, 8, 35);
    const state = buildState(d, makeSettings({ timeFormat: 'H24' }));

    expect(state.hourDigits).toEqual([1, 4]);
    expect(state.minuteDigits).toEqual([0, 8]);
    expect(state.secondDigits).toEqual([3, 5]);
    expect(state.amPm).toBeNull();
  });

  it('handles 12h AM (0->12)', () => {
    // 0:05:30 = 12:05:30 AM
    const d = new Date(2026, 6, 1, 0, 5, 30);
    const state = buildState(d, makeSettings({ timeFormat: 'H12' }));

    expect(state.hourDigits).toEqual([1, 2]);
    expect(state.amPm).toBe('AM');
  });

  it('handles 12h PM (13->1)', () => {
    // 13:05:30 = 1:05:30 PM
    const d = new Date(2026, 6, 1, 13, 5, 30);
    const state = buildState(d, makeSettings({ timeFormat: 'H12' }));

    expect(state.hourDigits).toEqual([1]);
    expect(state.amPm).toBe('PM');
  });

  it('handles 12h noon (12->12 PM)', () => {
    const d = new Date(2026, 6, 1, 12, 0, 0);
    const state = buildState(d, makeSettings({ timeFormat: 'H12' }));

    expect(state.hourDigits).toEqual([1, 2]);
    expect(state.amPm).toBe('PM');
  });

  it('no leading zero for single-digit hour in 12h', () => {
    const d = new Date(2026, 6, 1, 9, 30, 0);
    const state = buildState(d, makeSettings({ timeFormat: 'H12' }));

    expect(state.hourDigits).toEqual([9]);
  });

  it('leading zero for 10+ in 12h', () => {
    const d = new Date(2026, 6, 1, 10, 30, 0);
    const state = buildState(d, makeSettings({ timeFormat: 'H12' }));

    expect(state.hourDigits).toEqual([1, 0]);
  });

  it('hides seconds when showSeconds is false', () => {
    const d = new Date(2026, 6, 1, 14, 8, 35);
    const state = buildState(d, makeSettings({ showSeconds: false }));

    expect(state.showSeconds).toBe(false);
    // seconds digits still computed, just not shown
  });

  it('formats date text in Chinese', () => {
    const d = new Date(2026, 6, 1, 14, 8, 35); // July 1, 2026 is a Wednesday
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

    expect(state.theme.id).toBe('classic_black');
  });

  it('passes signature through', () => {
    const d = new Date();
    const state = buildState(d, makeSettings({ signature: 'Hello World' }));

    expect(state.signature).toBe('Hello World');
  });
});
