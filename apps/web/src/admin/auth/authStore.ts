import { authClient } from "@/admin/auth/authClient";
import type { AuthStatus, AuthUser } from "@/admin/auth/authTypes";

type AuthState = {
  status: AuthStatus;
  user: AuthUser | null;
};

let state: AuthState = { status: "loading", user: null };
const listeners = new Set<() => void>();

function setState(next: AuthState) {
  state = next;
  listeners.forEach((l) => l());
}

let initStarted = false;

export const authStore = {
  subscribe(cb: () => void) {
    listeners.add(cb);
    return () => listeners.delete(cb);
  },

  getSnapshot() {
    return state;
  },

  ensureInit() {
    if (initStarted) return;
    initStarted = true;
    void authStore.refresh();
  },

  async refresh() {
    setState({ status: "loading", user: state.user });
    try {
      const { user } = await authClient.me();
      if (!user) {
        setState({ status: "guest", user: null });
        return;
      }
      setState({ status: "authed", user });
    } catch {
      setState({ status: "guest", user: null });
    }
  },

  async login(password: string) {
    await authClient.login(password);
    await authStore.refresh();
    if (state.status !== "authed") throw new Error("Invalid credentials");
  },

  async logout() {
    try {
      await authClient.logout();
    } finally {
      setState({ status: "guest", user: null });
    }
  }
};
