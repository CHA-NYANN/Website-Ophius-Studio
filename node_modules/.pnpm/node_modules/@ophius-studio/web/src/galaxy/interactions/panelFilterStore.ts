export type PanelFilterState = {
  query: string;
};

class PanelFilterStore {
  private state: PanelFilterState = { query: "" };
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

  setQuery(query: string) {
    const q = query;
    if (this.state.query === q) return;
    this.state = { query: q };
    this.emit();
  }
}

export const panelFilterStore = new PanelFilterStore();
