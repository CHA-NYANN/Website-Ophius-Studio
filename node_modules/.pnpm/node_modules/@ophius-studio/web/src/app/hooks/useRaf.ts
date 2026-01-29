import { useEffect, useRef } from "react";

export function useRaf(onFrame: (dt: number) => void) {
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number>(performance.now());

  useEffect(() => {
    const loop = (t: number) => {
      const dt = Math.min(0.05, (t - lastRef.current) / 1000);
      lastRef.current = t;
      onFrame(dt);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [onFrame]);
}
