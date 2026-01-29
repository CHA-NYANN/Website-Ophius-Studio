import { useSyncExternalStore, useMemo } from "react";
import { pointerStore } from "@/galaxy/interactions/pointerStore";

function usePointerState() {
  return useSyncExternalStore(
    (cb) => pointerStore.subscribe(cb),
    () => pointerStore.getState(),
    () => pointerStore.getState()
  );
}

export function usePanelPointer(id: string) {
  const s = usePointerState();
  const isHover = s.hoverId === id;
  const isPressed = s.pressedId === id;

  return useMemo(
    () => ({
      isHover,
      isPressed,
      onEnter: () => pointerStore.setHover(id),
      onLeave: () => {
        if (pointerStore.getState().hoverId === id) pointerStore.setHover(null);
        if (pointerStore.getState().pressedId === id) pointerStore.setPressed(null);
      },
      onDown: () => pointerStore.setPressed(id),
      onUp: () => {
        if (pointerStore.getState().pressedId === id) pointerStore.setPressed(null);
      }
    }),
    [id, isHover, isPressed]
  );
}
