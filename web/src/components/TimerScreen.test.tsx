import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { alertComplete, stopChime } from '../logic/notify';
import TimerScreen from './TimerScreen';
import type { TimerState } from '../logic/productivityModels';
import { ClassicBlack } from '../logic/themes';

vi.mock('../logic/notify', async () => {
  const actual = await vi.importActual<typeof import('../logic/notify')>('../logic/notify');
  return {
    ...actual,
    alertComplete: vi.fn(),
    stopChime: vi.fn(),
  };
});

class ResizeObserverStub {
  observe() {}
  disconnect() {}
  unobserve() {}
}

globalThis.ResizeObserver = ResizeObserverStub as typeof ResizeObserver;

function makeState(overrides: Partial<TimerState> = {}): TimerState {
  return {
    durationMillis: 5 * 60_000,
    remainingMillis: 5 * 60_000,
    isRunning: false,
    startedAtMillis: null,
    isComplete: false,
    ...overrides,
  };
}

describe('TimerScreen', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('shows the first-visit timer guide inside a high-contrast help card', () => {
    render(
      <TimerScreen
        theme={ClassicBlack}
        state={makeState()}
        onStart={vi.fn()}
        onPause={vi.fn()}
        onReset={vi.fn()}
        lang="zh"
      />,
    );

    const title = screen.getByText('计时器操作指引');
    const card = title.parentElement;
    const firstRule = screen.getByText(/点击上半区/);

    expect(card?.getAttribute('style')).toContain('background: rgba(19, 19, 22, 0.92)');
    expect(card?.getAttribute('style')).toContain('max-width: min(92vw, 420px)');
    expect(title.getAttribute('style')).toContain('color: rgb(255, 250, 242)');
    expect(firstRule.getAttribute('style')).toContain('color: rgba(255, 248, 235, 0.92)');
  });

  it('stops any active completion chime when resetting a completed timer', () => {
    const onReset = vi.fn();

    render(
      <TimerScreen
        theme={ClassicBlack}
        state={makeState({ remainingMillis: 0, isComplete: true })}
        onStart={vi.fn()}
        onPause={vi.fn()}
        onReset={onReset}
        lang="zh"
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '重置' }));

    expect(stopChime).toHaveBeenCalledTimes(1);
    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it('does not replay the completion chime when the completed timer screen remounts', () => {
    const props = {
      theme: ClassicBlack,
      state: makeState({ remainingMillis: 0, isComplete: true }),
      onStart: vi.fn(),
      onPause: vi.fn(),
      onReset: vi.fn(),
      lang: 'zh' as const,
    };

    const firstMount = render(<TimerScreen {...props} />);
    expect(alertComplete).toHaveBeenCalledTimes(0);

    firstMount.unmount();

    render(<TimerScreen {...props} />);
    expect(alertComplete).toHaveBeenCalledTimes(0);
  });
});
