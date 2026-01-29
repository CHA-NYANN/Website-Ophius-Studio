import { PANELS, type PanelItem } from "@/galaxy/data/panels";

export type PanelNode = PanelItem & {
  radius: number;
  y: number;
};

export function buildPanelRing(): PanelNode[] {
  // Lebih rapat ke pusat agar panel terasa mengelilingi POV (sesuai sketsa).
  const baseRadius = 5.2;
  return PANELS.map((p, i) => {
    // Naikkan sedikit supaya panel tidak “tenggelam” di atas ring bawah.
    const y = (p.featured ? 0.58 : 0.36) + (i % 3) * (p.featured ? 0.0 : 0.14);
    const radius = p.featured ? 4.7 : baseRadius;
    return { ...p, radius, y };
  });
}
