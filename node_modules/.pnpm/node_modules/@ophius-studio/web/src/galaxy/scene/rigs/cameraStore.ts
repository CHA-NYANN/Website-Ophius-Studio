export type CameraState = {
  yaw: number;
  pitch: number;
};

class CameraStore {
  private state: CameraState = { yaw: 0, pitch: 0.06 };
  private listeners = new Set<() => void>();

  getState() {
    return this.state;
  }

  subscribe(fn: () => void) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private emit() {
    this.listeners.forEach((l) => l());
  }

  set(yaw: number, pitch: number) {
    if (this.state.yaw === yaw && this.state.pitch === pitch) return;
    this.state = { yaw, pitch };
    this.emit();
  }
}

export const cameraStore = new CameraStore();
