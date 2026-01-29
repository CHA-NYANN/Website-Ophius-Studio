import { ProfileName, TOKENS, profileForPath } from "@/theme/tokens";
import { prefersReducedMotion } from "@/utils/motion";

export type PortalPhase = "idle" | "focusPreview" | "portalOut" | "holdForReady" | "portalFade";

export type PortalTarget =
  | { kind: "internal"; toPath: string; profile: ProfileName }
  | { kind: "external"; url: string; profile: ProfileName };

export type PortalState = {
  phase: PortalPhase;
  t: number;
  origin: DOMRect | null;
  profile: ProfileName;
  target: PortalTarget | null;
  shouldSwap: boolean;
};

type Timings = {
  focusPreviewMs: number;
  outMs: number;
  fadeMs: number;
};

function getPortalTimings(): Timings {
  if (prefersReducedMotion()) {
    return {
      focusPreviewMs: 0,
      outMs: 180,
      fadeMs: 140
    };
  }
  return TOKENS.portal;
}

export class PortalController {
  private _state: PortalState = {
    phase: "idle",
    t: 0,
    origin: null,
    profile: "default",
    target: null,
    shouldSwap: false
  };

  private _listeners = new Set<() => void>();
  private _elapsedMs = 0;
  private _destinationReady = false;

  getState() {
    return this._state;
  }

  subscribe(fn: () => void) {
    this._listeners.add(fn);
    return () => this._listeners.delete(fn);
  }

  private _emit() {
    this._listeners.forEach((l) => l());
  }

  startInternal(toPath: string, origin: DOMRect | null) {
    const profile = profileForPath(toPath);
    const timings = getPortalTimings();

    this._destinationReady = false;
    this._elapsedMs = 0;

    const firstPhase: PortalPhase = timings.focusPreviewMs <= 0 ? "portalOut" : "focusPreview";

    this._state = {
      phase: firstPhase,
      t: 0,
      origin,
      profile,
      target: { kind: "internal", toPath, profile },
      shouldSwap: false
    };
    this._emit();
  }

  startExternal(url: string, origin: DOMRect | null) {
    const timings = getPortalTimings();

    this._destinationReady = false;
    this._elapsedMs = 0;

    const firstPhase: PortalPhase = timings.focusPreviewMs <= 0 ? "portalOut" : "focusPreview";

    this._state = {
      phase: firstPhase,
      t: 0,
      origin,
      profile: "default",
      target: { kind: "external", url, profile: "default" },
      shouldSwap: false
    };
    this._emit();
  }

  markDestinationReady() {
    this._destinationReady = true;
  }

  confirmSwapHandled() {
    if (!this._state.shouldSwap) return;
    this._state = { ...this._state, shouldSwap: false };
    this._emit();
  }

  tick(dt: number) {
    if (this._state.phase === "idle") return;

    const timings = getPortalTimings();

    this._elapsedMs += dt * 1000;

    if (this._state.phase === "focusPreview") {
      if (timings.focusPreviewMs <= 0) {
        this._elapsedMs = 0;
        this._state = { ...this._state, phase: "portalOut", t: 0 };
        this._emit();
        return;
      }

      const p = Math.min(1, this._elapsedMs / timings.focusPreviewMs);
      this._state = { ...this._state, t: p };
      if (p >= 1) {
        this._elapsedMs = 0;
        this._state = { ...this._state, phase: "portalOut", t: 0 };
      }
      this._emit();
      return;
    }

    if (this._state.phase === "portalOut") {
      const denom = Math.max(1, timings.outMs);
      const p = Math.min(1, this._elapsedMs / denom);
      this._state = { ...this._state, t: p };
      if (p >= 1) {
        this._state = { ...this._state, phase: "holdForReady", shouldSwap: true, t: 1 };
        this._elapsedMs = 0;
      }
      this._emit();
      return;
    }

    if (this._state.phase === "holdForReady") {
      this._state = { ...this._state, t: 1 };
      if (this._destinationReady) {
        this._elapsedMs = 0;
        this._state = { ...this._state, phase: "portalFade", t: 0 };
      }
      this._emit();
      return;
    }

    if (this._state.phase === "portalFade") {
      const denom = Math.max(1, timings.fadeMs);
      const p = Math.min(1, this._elapsedMs / denom);
      this._state = { ...this._state, t: p };
      if (p >= 1) {
        this._state = {
          phase: "idle",
          t: 0,
          origin: null,
          profile: "default",
          target: null,
          shouldSwap: false
        };
      }
      this._emit();
    }
  }
}
