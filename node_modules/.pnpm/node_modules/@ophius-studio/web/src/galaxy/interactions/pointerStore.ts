export type PointerState = {
  hoverId: string | null;
  pressedId: string | null;
};

class PointerStore {
  private state: PointerState = { hoverId: null, pressedId: null };
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

  setHover(id: string | null) {
    if (this.state.hoverId === id) return;
    this.state = { ...this.state, hoverId: id };
    this.emit();
  }

  setPressed(id: string | null) {
    if (this.state.pressedId === id) return;
    this.state = { ...this.state, pressedId: id };
    this.emit();
  }

  clearAll() {
    if (!this.state.hoverId && !this.state.pressedId) return;
    this.state = { hoverId: null, pressedId: null };
    this.emit();
  }
}

export const pointerStore = new PointerStore();
