import type { PropsWithChildren } from "react";

export function Surface({ children }: PropsWithChildren) {
  return (
    <div
      style={{
        width: "min(980px, 100%)",
        margin: "0 auto",
        borderRadius: 22,
        border: "1px solid var(--glass-border)",
        background: "var(--glass)",
        backdropFilter: "blur(12px)",
        padding: 22,
        minHeight: 320
      }}
    >
      {children}
    </div>
  );
}
