export type ProfileName = "default" | "docs" | "projects" | "news" | "contact" | "admin";

export const TOKENS = {
  camera: {
    // Kamera dibuat lebih dekat agar komposisi sesuai desain: panel terasa “mengelilingi” POV.
    radius: 7.9,
    // Fokus sedikit lebih tinggi supaya panel tidak tenggelam ke bawah frame.
    targetY: 0.0,
    yawClamp: 1.55,
    pitchMin: -0.28,
    pitchMax: 0.62,
    sensitivity: 0.0048,
    inertia: 10.5,
    friction: 9.5
  },
  panel: {
    baseGlow: 0.55,
    hoverGlow: 1.05,
    pressedGlow: 0.35,
    previewGlow: 1.35,
    // Hover harus terasa seperti "zoom" (sesuai sketsa): scale lebih besar + dorong ke kamera.
    hoverScale: 1.18,
    pressedScale: 0.965,
    previewScale: 1.06,
    hoverLift: 0.06,
    pressedLift: -0.02,
    previewLift: 0.02,
    // Dorong panel sedikit ke arah kamera ketika hover/focus.
    hoverDepth: 0.22,
    pressedDepth: -0.08,
    previewDepth: 0.12
  },
  search: {
    pitchStart: 0.18,
    pitchFull: 0.5
  },
  portal: {
    focusPreviewMs: 280,
    outMs: 680,
    fadeMs: 260
  },
  blackHole: {
    safeConeStartYaw: -0.35,
    safeConeFullYaw: -1.25,
    safeConeDim: 0.55,
    safeConePush: 0.72
  },
  profiles: {
    default: { tint: "rgba(120, 190, 255, 0.18)", core: "120 190 255" },
    docs: { tint: "rgba(120, 255, 230, 0.18)", core: "120 255 230" },
    projects: { tint: "rgba(180, 120, 255, 0.18)", core: "180 120 255" },
    news: { tint: "rgba(255, 170, 120, 0.18)", core: "255 170 120" },
    contact: { tint: "rgba(140, 255, 160, 0.18)", core: "140 255 160" },
    admin: { tint: "rgba(255, 110, 140, 0.18)", core: "255 110 140" }
  } satisfies Record<ProfileName, { tint: string; core: string }>
};

export function profileForPath(path: string): ProfileName {
  if (path.startsWith("/docs")) return "docs";
  if (path.startsWith("/projects")) return "projects";
  if (path.startsWith("/news")) return "news";
  if (path.startsWith("/contact")) return "contact";
  if (path.startsWith("/admin")) return "admin";
  return "default";
}
