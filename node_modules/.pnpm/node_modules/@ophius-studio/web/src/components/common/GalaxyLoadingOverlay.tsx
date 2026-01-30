import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { useProgress } from "@react-three/drei";
import { useEffect, useMemo, useState } from "react";

type Props = {
  /**
   * Optional: show the overlay only on the galaxy route ("/").
   * Default: true.
   */
  onlyOnGalaxyRoute?: boolean;
  /**
   * The current route path (inject from AppShell).
   */
  pathname?: string;
};

/**
 * GalaxyLoadingOverlay
 *
 * Goal:
 * - Remove the "black screen" feeling during initial GLB + shader compilation.
 * - Show a lightweight HTML overlay + Lottie animation + progress.
 *
 * Notes:
 * - This does NOT make the 3D assets load faster, but makes the wait feel intentional.
 * - Works on Vercel because the animation is served from /public.
 */
export function GalaxyLoadingOverlay({ onlyOnGalaxyRoute = true, pathname }: Props) {
  const { active, progress } = useProgress();

  // Ensure we show something immediately (even before the loading manager becomes active).
  const [forceVisible, setForceVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setForceVisible(false), 350);
    return () => clearTimeout(t);
  }, []);

  const shouldShowByRoute = useMemo(() => {
    if (!onlyOnGalaxyRoute) return true;
    if (!pathname) return true; // safe default
    return pathname === "/";
  }, [onlyOnGalaxyRoute, pathname]);

  const visible = shouldShowByRoute && (forceVisible || active || (progress > 0 && progress < 100));

  // Simple fade-out on completion.
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    if (!visible) {
      setFadeOut(false);
      return;
    }
    if (!active && progress >= 100) {
      setFadeOut(true);
    } else {
      setFadeOut(false);
    }
  }, [active, progress, visible]);

  if (!visible) return null;

  return (
    <div
      aria-label="Loading"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "grid",
        placeItems: "center",
        pointerEvents: "auto",
        background: "radial-gradient(circle at 50% 40%, rgba(10, 32, 70, 0.95) 0%, rgba(0,0,0,0.98) 70%)",
        transition: "opacity 600ms ease",
        opacity: fadeOut ? 0 : 1,
      }}
    >
      <div style={{ width: 380, padding: 16, textAlign: "center", color: "white" }}>
        <div style={{ letterSpacing: 6, fontSize: 12, opacity: 0.8, marginBottom: 6 }}>OPHIUS</div>

        <div style={{ width: "100%", height: 260, margin: "0 auto" }}>
          <DotLottieReact
            src="/lottie/sci-fi-machine.lottie"
            loop
            autoplay
            style={{ width: "100%", height: "100%" }}
          />
        </div>

        <div style={{ opacity: 0.85, marginTop: 8, fontSize: 14 }}>
          Entering Galaxy…
        </div>

        <div
          style={{
            height: 6,
            background: "rgba(255,255,255,0.15)",
            borderRadius: 999,
            marginTop: 12,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: 6,
              width: `${Math.min(100, progress)}%`,
              background: "rgba(255,255,255,0.85)",
              borderRadius: 999,
              transition: "width 120ms linear",
            }}
          />
        </div>

        <div style={{ fontSize: 12, opacity: 0.65, marginTop: 8 }}>
          {Math.round(progress)}%
        </div>

        <div style={{ fontSize: 11, opacity: 0.45, marginTop: 10 }}>
          First load may take a few seconds (GLB + GPU warm-up).
        </div>
      </div>
    </div>
  );
}
