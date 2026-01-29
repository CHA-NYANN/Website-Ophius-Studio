import type { ProfileName } from "@/theme/tokens";

export type PanelItem = {
  id: string;
  label: string;
  to: string;
  profile: ProfileName;
  featured?: boolean;
};

export const PANELS: PanelItem[] = [
  { id: "games", label: "Games", to: "/games", profile: "default", featured: true },
  { id: "projects", label: "Projects", to: "/projects", profile: "projects" },
  { id: "team", label: "Team", to: "/team", profile: "default" },
  { id: "docs", label: "Docs", to: "/docs", profile: "docs" },
  { id: "gallery", label: "Gallery", to: "/gallery", profile: "default" },
  { id: "media", label: "Media", to: "/media", profile: "default" },
  { id: "news", label: "News", to: "/news", profile: "news" },
  { id: "contact", label: "Contact", to: "/contact", profile: "contact" },
  { id: "admin", label: "Admin", to: "/admin", profile: "admin" }
];
