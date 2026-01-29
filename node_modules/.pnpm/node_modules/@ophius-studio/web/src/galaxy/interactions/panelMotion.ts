import { TOKENS } from "@/theme/tokens";

export type PanelMotionInput = {
  hover: boolean;
  pressed: boolean;
  preview: boolean;
  dimmed: boolean;
  /**
   * Soft dim (0..1). Useful for “safe cone” behavior where we want panels to
   * yield to the black hole without fully disappearing.
   */
  dimAmount?: number;
};

export type PanelMotionOutput = {
  scale: number;
  lift: number;
  depth: number;
  glow: number;
  opacity: number;
};

export function computePanelMotion(input: PanelMotionInput): PanelMotionOutput {
  const t = TOKENS.panel;
  let scale = 1;
  let lift = 0;
  let depth = 0;
  let glow = t.baseGlow;
  let opacity = 0.86;

  const dim = input.dimmed ? 1 : Math.max(0, Math.min(1, input.dimAmount ?? 0));
  if (dim > 0) {
    opacity = opacity + (0.28 - opacity) * dim;
    glow = glow + (0.18 - glow) * dim;
  }

  if (input.preview) {
    scale = Math.max(scale, t.previewScale);
    lift = Math.max(lift, t.previewLift);
    depth = Math.max(depth, t.previewDepth ?? 0);
    glow = Math.max(glow, t.previewGlow);
    opacity = Math.max(opacity, 0.9);
  }

  if (input.hover) {
    scale = Math.max(scale, t.hoverScale);
    lift = Math.max(lift, t.hoverLift);
    depth = Math.max(depth, t.hoverDepth ?? 0);
    glow = Math.max(glow, t.hoverGlow);
  }

  if (input.pressed) {
    scale = Math.min(scale, t.pressedScale);
    lift = Math.min(lift, t.pressedLift);
    depth = Math.min(depth, t.pressedDepth ?? 0);
    glow = Math.max(0.2, Math.min(glow, t.pressedGlow));
  }

  return { scale, lift, depth, glow, opacity };
}
