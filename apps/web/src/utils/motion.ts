import { useEffect, useState } from "react";

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
}

export function onReducedMotionChange(cb: (reduced: boolean) => void) {
  if (typeof window === "undefined") return () => {};
  const mql = window.matchMedia?.("(prefers-reduced-motion: reduce)");
  if (!mql) return () => {};

  const handler = () => cb(mql.matches);

  // Safari legacy
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anyMql: any = mql;
  if (anyMql.addEventListener) {
    anyMql.addEventListener("change", handler);
    return () => anyMql.removeEventListener("change", handler);
  }
  if (anyMql.addListener) {
    anyMql.addListener(handler);
    return () => anyMql.removeListener(handler);
  }
  return () => {};
}

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(prefersReducedMotion());
  useEffect(() => onReducedMotionChange(setReduced), []);
  return reduced;
}
