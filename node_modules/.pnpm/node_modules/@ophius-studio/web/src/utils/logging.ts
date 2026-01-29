export function installGlobalErrorHandlers() {
  if (typeof window === "undefined") return;

  window.addEventListener("error", (ev) => {
    // eslint-disable-next-line no-console
    console.error("[window.error]", ev.error || ev.message);
  });

  window.addEventListener("unhandledrejection", (ev) => {
    // eslint-disable-next-line no-console
    console.error("[unhandledrejection]", ev.reason);
  });
}
