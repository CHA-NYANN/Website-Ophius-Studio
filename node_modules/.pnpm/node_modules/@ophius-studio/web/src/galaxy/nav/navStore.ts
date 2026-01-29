export type NavState = {
  open: boolean;
};

class NavStore {
  private state: NavState = { open: false };
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

  setOpen(open: boolean) {
    if (this.state.open === open) return;
    this.state = { open };
    this.emit();
  }

  toggle() {
    this.setOpen(!this.state.open);
  }
}

export const navStore = new NavStore();
