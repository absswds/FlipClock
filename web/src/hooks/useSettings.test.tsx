import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useSettings } from './useSettings';

describe('useSettings', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('treats the old Chinese default signature as unset', () => {
    localStorage.setItem(
      'flipclock_settings',
      JSON.stringify({
        timeFormat: 'H24',
        showSeconds: true,
        signature: '翻页时钟',
        themeId: 'classic_black',
        language: 'en',
        timezone: 'auto',
      }),
    );

    const { result } = renderHook(() => useSettings());

    expect(result.current.settings.signature).toBe('');
  });

  it('uses paper desk as the default theme for new users', () => {
    const { result } = renderHook(() => useSettings());

    expect(result.current.settings.themeId).toBe('paper_desk');
  });

  it('migrates the legacy default classic black theme to paper desk', () => {
    localStorage.setItem(
      'flipclock_settings',
      JSON.stringify({
        timeFormat: 'H24',
        showSeconds: true,
        signature: '',
        themeId: 'classic_black',
        language: 'en',
        timezone: 'auto',
      }),
    );

    const { result } = renderHook(() => useSettings());

    expect(result.current.settings.themeId).toBe('paper_desk');
  });

  it('keeps a user-selected classic black theme when it was customized', () => {
    localStorage.setItem(
      'flipclock_settings',
      JSON.stringify({
        timeFormat: 'H24',
        showSeconds: true,
        signature: '',
        themeId: 'classic_black',
        themeCustomized: true,
        language: 'en',
        timezone: 'auto',
      }),
    );

    const { result } = renderHook(() => useSettings());

    expect(result.current.settings.themeId).toBe('classic_black');
  });

  it('updates the timezone when a user chooses one', () => {
    const { result } = renderHook(() => useSettings());

    act(() => {
      result.current.setTimezone('Europe/London');
    });

    expect(result.current.settings.timezone).toBe('Europe/London');
  });
});
