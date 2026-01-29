import { useEffect } from "react";
import { pointerStore } from "@/galaxy/interactions/pointerStore";

export function InteractionRig() {
  useEffect(() => {
    const up = () => {
      if (pointerStore.getState().pressedId) pointerStore.setPressed(null);
    };
    const blur = () => pointerStore.clearAll();

    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    window.addEventListener("blur", blur);

    return () => {
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      window.removeEventListener("blur", blur);
    };
  }, []);

  return null;
}
