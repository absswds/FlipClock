import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useCountdown } from './useCountdown';
import type { CountdownTarget } from '../logic/productivityModels';

describe('useCountdown', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.setSystemTime(new Date('2026-07-01T12:00:00'));
  });

  it('keeps a custom countdown selected after the hook is recreated', () => {
    const custom: CountdownTarget = {
      id: 'custom-launch',
      title: 'Launch Day',
      date: '2026-08-15',
      isPreset: false,
    };

    const first = renderHook(() => useCountdown());

    act(() => {
      first.result.current.setTarget(custom);
    });

    expect(first.result.current.target).toEqual(custom);
    first.unmount();

    const second = renderHook(() => useCountdown());

    expect(second.result.current.target).toEqual(custom);
  });
});
