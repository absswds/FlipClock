import { renderHook } from '@testing-library/react';
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
});
