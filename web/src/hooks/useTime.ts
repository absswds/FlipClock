import { useState, useEffect } from 'react';

/**
 * Returns the current Date, refreshed exactly on each second boundary.
 * Port of ClockTimeProvider — recalculates delay to next second boundary
 * to prevent drift, same as the Android version.
 */
export function useTime(): Date {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    function tick() {
      setNow(new Date());

      // Calculate delay to next full-second boundary
      const ms = new Date().getMilliseconds();
      const remaining = 1000 - ms;

      // Align to the NEXT second boundary, not this one
      timeoutId = setTimeout(tick, remaining);
    }

    // Start aligned to next boundary
    const ms = new Date().getMilliseconds();
    timeoutId = setTimeout(tick, 1000 - ms);

    return () => clearTimeout(timeoutId);
  }, []);

  return now;
}
