import { useThree } from "@react-three/fiber";
import { useCallback } from "react";
import { Object3D, Raycaster, Vector2 } from "three";

const raycaster = new Raycaster();
const ndc = new Vector2();

export function usePanelRaycast() {
  const { camera } = useThree();

  return useCallback(
    (clientX: number, clientY: number, viewportW: number, viewportH: number, objects: Object3D[]) => {
      ndc.set((clientX / viewportW) * 2 - 1, -(clientY / viewportH) * 2 + 1);
      raycaster.setFromCamera(ndc, camera);
      const hits = raycaster.intersectObjects(objects, true);
      return hits[0] ?? null;
    },
    [camera]
  );
}
