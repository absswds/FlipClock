let audioCtx: AudioContext | null = null;

function getAudioCtx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext();
  return audioCtx;
}

/** Play a short pleasant chime — two ascending tones to grab attention without being annoying. */
export function playChime(): void {
  try {
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
      osc.start(start);
      osc.stop(start + duration);
    };

    playTone(880, now, 0.15, 0.3);       // A5
    playTone(1100, now + 0.12, 0.15, 0.3); // C#6
    playTone(1320, now + 0.24, 0.3, 0.25); // E6
  } catch {
    // Audio not available — silently ignore
  }
}

/** Show a browser notification if permission is granted. Falls back gracefully. */
export function showNotification(title: string, body: string): void {
  if (!('Notification' in window)) return;

  if (Notification.permission === 'granted') {
    new Notification(title, { body, icon: '/favicon.svg' });
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then((perm) => {
      if (perm === 'granted') {
        new Notification(title, { body, icon: '/favicon.svg' });
      }
    });
  }
}

/** Both chime + notification — call this when a timer/countdown/pomodoro completes. */
export function alertComplete(title: string, body: string): void {
  playChime();
  showNotification(title, body);
}
