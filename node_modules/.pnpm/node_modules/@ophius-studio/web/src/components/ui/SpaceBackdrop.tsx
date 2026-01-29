import React from "react";

type Variant = "public" | "admin";

export function SpaceBackdrop({ variant = "public" }: { variant?: Variant }) {
  const starOpacity = variant === "admin" ? 0.75 : 1;
  const bhOpacity = variant === "admin" ? 0.55 : 0.75;

  return (
    <div className="oph-space-backdrop" aria-hidden="true">
      <div className="oph-space-stars" style={{ opacity: starOpacity }} />
      <div className="oph-bh-sliver" style={{ opacity: bhOpacity }} />
      <div className="oph-space-vignette" />
    </div>
  );
}
