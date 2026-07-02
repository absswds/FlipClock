let audioCtx: AudioContext | null = null;
const activeOscillators = new Set<OscillatorNode>();

function getAudioCtx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext();
  return audioCtx;
}

export function stopChime(): void {
  if (!audioCtx) return;

  activeOscillators.forEach((oscillator) => {
    try {
      oscillator.stop(audioCtx!.currentTime);
    } catch {
      // Ignore already-stopped oscillators.
    }
  });
  activeOscillators.clear();
  audioCtx = null;
}

/** Play a longer completion chime that can be heard from across a room. */
export function playChime(): void {
  try {
    stopChime();
    const ctx = getAudioCtx();
    const now = ctx.currentTime;

    const playTone = (freq: number, start: number, duration: number, vol: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(vol, start + 0.02);
      gain.gain.linearRampToValueAtTime(0, start + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      activeOscillators.add(osc);
      osc.onended = () => {
        activeOscillators.delete(osc);
      };
      osc.start(start);
      osc.stop(start + duration);
    };

    const phrase = [
      [880, 0, 0.42, 0.34],
      [1100, 0.46, 0.42, 0.34],
      [1320, 0.92, 0.56, 0.3],
      [988, 1.62, 0.42, 0.32],
      [1244, 2.08, 0.42, 0.32],
      [1480, 2.54, 0.68, 0.28],
      [1320, 3.28, 0.64, 0.24],
    ] as const;

    phrase.forEach(([freq, offset, duration, vol]) => {
      playTone(freq, now + offset, duration, vol);
    });
  } catch {
    // Audio may be unavailable until the browser allows playback.
  }
}

/** Play the completion sound. Title/body are kept for call-site readability. */
export function alertComplete(_title: string, _body: string): void {
  playChime();
}
