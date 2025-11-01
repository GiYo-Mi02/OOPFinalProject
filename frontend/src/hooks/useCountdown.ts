import { useCallback, useEffect, useRef, useState } from "react";

export function useCountdown(durationSeconds: number, deps: unknown[] = []) {
  const [remaining, setRemaining] = useState(durationSeconds);
  const timerRef = useRef<number | null>(null);

  const stop = useCallback(() => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    stop();
    setRemaining(durationSeconds);
  timerRef.current = window.setInterval(() => {
      setRemaining((current) => {
        if (current <= 1) {
          stop();
          return 0;
        }
        return current - 1;
      });
    }, 1000);
  }, [durationSeconds, stop]);

  useEffect(() => {
    start();
    return stop;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return {
    remaining,
    isRunning: timerRef.current !== null,
    restart: start,
    stop,
  };
}
