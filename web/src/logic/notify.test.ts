import { afterEach, describe, expect, it, vi } from 'vitest';
import { alertComplete, playChime, stopChime } from './notify';

class FakeGain {
  gain = {
    setValueAtTime: vi.fn(),
    linearRampToValueAtTime: vi.fn(),
  };

  connect = vi.fn();
}

class FakeOscillator {
  type = '';
  frequency = { value: 0 };
  connect = vi.fn();
  start = vi.fn();
  stop = vi.fn();
}

class FakeAudioContext {
  currentTime = 10;
  destination = {};
  oscillators: FakeOscillator[] = [];

  createOscillator() {
    const oscillator = new FakeOscillator();
    this.oscillators.push(oscillator);
    return oscillator;
  }

  createGain() {
    return new FakeGain();
  }
}

describe('completion alerts', () => {
  afterEach(() => {
    stopChime();
    vi.unstubAllGlobals();
  });

  it('plays a clearly audible chime lasting between 3 and 5 seconds', () => {
    const context = new FakeAudioContext();
    vi.stubGlobal('AudioContext', function AudioContext() {
      return context;
    });

    playChime();

    const finalStop = Math.max(...context.oscillators.map((oscillator) => oscillator.stop.mock.calls[0][0]));
    const duration = finalStop - context.currentTime;
    expect(duration).toBeGreaterThanOrEqual(3);
    expect(duration).toBeLessThanOrEqual(5);
  });

  it('does not request or show browser notifications on completion', () => {
    const requestPermission = vi.fn();
    const Notification = vi.fn() as unknown as typeof window.Notification;
    Object.assign(Notification, { permission: 'default', requestPermission });
    vi.stubGlobal('Notification', Notification);

    alertComplete('Timer complete', 'Time is up');

    expect(requestPermission).not.toHaveBeenCalled();
    expect(Notification).not.toHaveBeenCalled();
  });

  it('can stop an active chime immediately', () => {
    const context = new FakeAudioContext();
    vi.stubGlobal('AudioContext', function AudioContext() {
      return context;
    });

    playChime();
    stopChime();

    expect(context.oscillators.length).toBeGreaterThan(0);
    expect(context.oscillators.every((oscillator) => oscillator.stop.mock.calls.length >= 2)).toBe(true);
    expect(context.oscillators.every((oscillator) => oscillator.stop.mock.calls.at(-1)?.[0] === context.currentTime)).toBe(true);
  });
});
