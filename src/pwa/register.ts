// Installs the service worker (src/pwa/sw.js) so the app works offline.
// Only in the built app: during development the dev server must always
// serve fresh files, and there is no sw.js there anyway.

export function registerServiceWorker() {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch((err) => console.warn('Service worker not installed:', err));
  });
}

/**
 * Asks the browser not to delete our saved data (the flavours) when the disk
 * is nearly full. Chrome grants it to installed apps; elsewhere it may say no,
 * which is fine: it's a safety net, the backup file is the real one.
 */
export function keepDataSafe() {
  void navigator.storage?.persist?.().catch(() => false);
}
