import { useSyncExternalStore } from "react";
import { authStore } from "@/admin/auth/authStore";

export function useAuth() {
  authStore.ensureInit();

  const { status, user } = useSyncExternalStore(
    (cb) => authStore.subscribe(cb),
    () => authStore.getSnapshot(),
    () => authStore.getSnapshot()
  );

  return {
    status,
    user,
    refresh: authStore.refresh,
    login: authStore.login,
    logout: authStore.logout
  };
}
