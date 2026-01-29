import { portal } from "@/portal/portalSingleton";

export function originRectFromPointerEvent(e: { clientX: number; clientY: number }) {
  const s = 28;
  return new DOMRect(e.clientX - s / 2, e.clientY - s / 2, s, s);
}

export function originRectFromElement(el: Element | null) {
  if (!el || !(el instanceof HTMLElement)) return null;
  const r = el.getBoundingClientRect();
  return new DOMRect(r.x, r.y, r.width, r.height);
}

export function navigateWithPortal(toPath: string, origin: DOMRect | null) {
  if (portal.getState().phase !== "idle") return;
  portal.startInternal(toPath, origin);
}
