import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { MathUtils, Vector2 } from "three";
import { TOKENS } from "@/theme/tokens";
import { cameraStore } from "./cameraStore";
import { pointerStore } from "@/galaxy/interactions/pointerStore";

/**
 * CameraRig: POV berada di center.
 *
 * Ini mengikuti desain kamu: kamera tidak mengorbit "dari luar".
 * Kamera tetap di pusat (0, targetY, 0) lalu user hanya mengubah arah pandang (yaw/pitch)
 * dengan drag (klik kanan selalu, klik kiri hanya kalau area kosong), dan scroll untuk zoom.
 */
export function CameraRig({ interactive = true }: { interactive?: boolean }) {
  const { camera, gl, scene } = useThree();

  const lookAtY = TOKENS.camera.targetY;

  // Internal euler yaw/pitch (radians) yang dipakai untuk putar kamera.
  // Kita start menghadap +Z (biar komposisi panel awal mirip versi orbit sebelumnya).
  const yawTarget = useRef(Math.PI);
  const pitchTarget = useRef(-0.12);
  const yawCur = useRef(yawTarget.current);
  const pitchCur = useRef(pitchTarget.current);

  // Zoom via FOV (lebih aman untuk POV-center daripada dolly/translate).
  const fovTarget = useRef(58);

  const drag = useRef({ active: false, pointerId: -1, button: -1, moved: 0 });
  const last = useRef(new Vector2());

  // Raycast UI layer untuk menghindari drag kamera saat klik panel/nav planet.
  const UI_LAYER = 31;
  const raycaster = useMemo(() => {
    const r = new THREE.Raycaster();
    r.layers.set(UI_LAYER);
    return r;
  }, []);
  const ndc = useMemo(() => new Vector2(), []);

  const euler = useMemo(() => new THREE.Euler(0, 0, 0, "YXZ"), []);

  // three@0.165.0 tidak menyediakan MathUtils.dampAngle.
  // Kalau dipanggil, render loop akan crash dan canvas jadi hitam.
  // Jadi kita bikin versi sendiri yang selalu ambil delta sudut terpendek.
  const dampAngle = (current: number, target: number, lambda: number, dt: number) => {
    const TWO_PI = Math.PI * 2;
    let delta = (target - current) % TWO_PI;
    if (delta > Math.PI) delta -= TWO_PI;
    if (delta < -Math.PI) delta += TWO_PI;
    return MathUtils.damp(current, current + delta, lambda, dt);
  };

  const wrapPi = (a: number) => {
    const TWO_PI = Math.PI * 2;
    a = (a + Math.PI) % TWO_PI;
    if (a < 0) a += TWO_PI;
    return a - Math.PI;
  };

  useEffect(() => {
    const el = gl.domElement;
    el.style.touchAction = "none";

    // init camera at center
    camera.position.set(0, lookAtY, 0);
    camera.near = 0.1;
    camera.far = 250;
    camera.fov = fovTarget.current;
    camera.updateProjectionMatrix();

    const clampPitch = (p: number) => MathUtils.clamp(p, TOKENS.camera.pitchMin, TOKENS.camera.pitchMax);

    const onContextMenu = (e: MouseEvent) => {
      // klik kanan untuk rotate; jangan munculkan menu browser.
      e.preventDefault();
    };

    const isUIHit = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return false;
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      ndc.set(x, y);
      raycaster.setFromCamera(ndc, camera as any);
      const hits = raycaster.intersectObjects(scene.children, true);

      // IMPORTANT:
      // three.js Raycaster TIDAK otomatis menghormati `visible=false`.
      // PanelRing saat closed diset `visible=false`, tapi mesh-nya masih bisa kena raycast
      // → camera jadi selalu mengira "kena UI" dan drag tidak pernah mulai.
      const isVisibleInHierarchy = (obj: any) => {
        let o: any = obj;
        while (o) {
          if (o.visible === false) return false;
          o = o.parent;
        }
        return true;
      };

      return hits.some((h) => isVisibleInHierarchy(h.object));
    };

    const shouldStartDrag = (e: PointerEvent) => {
      if (!interactive) return false;

      // IMPORTANT:
      // CameraRig pakai DOM listener + pointer capture.
      // Jadi stopPropagation dari R3F tidak menghentikan drag kamera.
      // Yang benar: block hanya saat UI sedang ditekan, bukan cuma hover.
      const ps = pointerStore.getState();
      if (ps.pressedId != null) return false;

      const isMouse = e.pointerType === "mouse";

      // Mouse right-drag: selalu boleh (sesuai instruksi "klik kanan + tarik").
      if (isMouse && e.button === 2) return true;

      // Touch/pen: kalau ngetap UI, jangan mulai drag kamera.
      if (!isMouse) {
        if (isUIHit(e)) return false;
        // Beberapa browser kirim button=-1 untuk touch.
        return e.buttons === 1 || e.button === 0 || e.button === -1;
      }

      // Mouse left-drag hanya dari area kosong.
      // hoverId kadang bisa nyangkut (terutama di mobile emulation), jadi validasi pakai raycast.
      if (e.button === 0) {
        if (ps.hoverId != null) {
          if (isUIHit(e)) return false;
          // stale hover → bersihkan biar kamera tidak terkunci.
          pointerStore.setHover(null);
        }
        if (isUIHit(e)) return false;
        return true;
      }

      return false;
    };

    const onPointerDown = (e: PointerEvent) => {
      if (!shouldStartDrag(e)) return;

      drag.current.active = true;
      drag.current.pointerId = e.pointerId;
      drag.current.button = e.button;
      drag.current.moved = 0;
      last.current.set(e.clientX, e.clientY);

      try {
        el.setPointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!drag.current.active || e.pointerId !== drag.current.pointerId) return;

      const dx = e.clientX - last.current.x;
      const dy = e.clientY - last.current.y;
      last.current.set(e.clientX, e.clientY);

      drag.current.moved += Math.abs(dx) + Math.abs(dy);

      // Drag kanan/kiri mengubah yaw, atas/bawah mengubah pitch.
      // Kita pakai sense yang terasa natural: drag ke kanan = view ke kanan.
      yawTarget.current -= dx * TOKENS.camera.sensitivity;
      pitchTarget.current = clampPitch(pitchTarget.current - dy * TOKENS.camera.sensitivity);

      // keep yaw in a reasonable range
      if (yawTarget.current > Math.PI) yawTarget.current -= Math.PI * 2;
      if (yawTarget.current < -Math.PI) yawTarget.current += Math.PI * 2;
    };

    const endDrag = (e: PointerEvent) => {
      if (e.pointerId !== drag.current.pointerId) return;
      drag.current.active = false;
      drag.current.pointerId = -1;
      drag.current.button = -1;
      drag.current.moved = 0;
      try {
        el.releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    };

    const onWheel = (e: WheelEvent) => {
      if (!interactive) return;
      // Kalau lagi hover/pressed UI, jangan zoom biar scroll nggak ganggu.
      const ps = pointerStore.getState();
      if (ps.hoverId != null || ps.pressedId != null) return;
      // scroll up = zoom in (fov smaller)
      const delta = Math.sign(e.deltaY);
      fovTarget.current = MathUtils.clamp(fovTarget.current + delta * 2.6, 34, 78);
      e.preventDefault();
    };

    el.addEventListener("contextmenu", onContextMenu);
    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", endDrag);
    el.addEventListener("pointercancel", endDrag);
    el.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      el.removeEventListener("contextmenu", onContextMenu);
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", endDrag);
      el.removeEventListener("pointercancel", endDrag);
      el.removeEventListener("wheel", onWheel as any);
    };
  }, [camera, gl, interactive, lookAtY]);

  useFrame((_, dt) => {
    // center-lock
    camera.position.set(0, lookAtY, 0);

    // damp yaw/pitch
    // yaw dibungkus di [-PI, PI] dan smoothing-nya harus pakai delta sudut terpendek,
    // kalau nggak, pas melewati batas PI/-PI nilai akan loncat ~2PI dan terasa "mental".
    yawCur.current = dampAngle(yawCur.current, yawTarget.current, TOKENS.camera.inertia, dt);
    yawCur.current = wrapPi(yawCur.current);
    pitchCur.current = MathUtils.damp(pitchCur.current, pitchTarget.current, TOKENS.camera.inertia, dt);

    euler.set(pitchCur.current, yawCur.current, 0);
    camera.quaternion.setFromEuler(euler);

    // damp fov
    camera.fov = MathUtils.damp(camera.fov, fovTarget.current, 8.5, dt);
    camera.updateProjectionMatrix();

    // store yaw/pitch for other rigs.
    // Kita konversi supaya yaw=0 artinya menghadap +Z (lebih enak untuk safe-cone black hole).
    let yawStore = yawCur.current - Math.PI;
    if (yawStore > Math.PI) yawStore -= Math.PI * 2;
    if (yawStore < -Math.PI) yawStore += Math.PI * 2;

    cameraStore.set(yawStore, pitchCur.current);
  });

  return null;
}
