export type FocusState = {
  open: boolean;
  panelId: string | null;
  origin: { x: number; y: number; w: number; h: number } | null;
};

class FocusStore {
  private state: FocusState = { open: false, panelId: null, origin: null };
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

  open(panelId: string, origin: FocusState["origin"]) {
    this.state = { open: true, panelId, origin };
    this.emit();
  }

  close() {
    if (!this.state.open) return;
    this.state = { open: false, panelId: null, origin: null };
    this.emit();
  }
}

export const focusStore = new FocusStore();
