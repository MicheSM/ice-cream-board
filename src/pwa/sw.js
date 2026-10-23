// Service worker: a small script the browser keeps between visits and runs
// in the background, in front of every request the app makes. We use it so
// the app opens even without internet.
//
// This file is a template: at build time vite.config.ts fills in VERSION and
// FILES (every file of the build) and writes the result to dist/sw.js.
//
// Strategy:
//  - pages (index.html, display.html): network first, so a reload always
//    gets the latest version; if the network is down or slow, the saved copy;
//  - everything else (scripts, styles, fonts, images): from the saved copy.
//    Their names contain a hash of their content, so a saved copy is never
//    outdated: a new version of a file is a new file.
//
// When a new build is deployed, this file changes (new VERSION), the browser
// notices on the next page load, installs the new worker, which saves the new
// files and deletes the old ones.

const VERSION = '__VERSION__';
const FILES = __FILES__;
const CACHE = `ice-cream-board-${VERSION}`;
const NETWORK_TIMEOUT_MS = 4000;
// Some servers answer "Vary: Origin", and the browser fetches scripts with an
// Origin header: without this, the saved copy wouldn't count as a match.
const MATCH = { ignoreVary: true };

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(FILES))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('ice-cream-board-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== location.origin) return;
  event.respondWith(request.mode === 'navigate' ? networkFirst(request) : cacheFirst(request));
});

async function networkFirst(request) {
  try {
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), NETWORK_TIMEOUT_MS));
    return await Promise.race([fetch(request), timeout]);
  } catch {
    const cache = await caches.open(CACHE);
    // The app's root ("…/ice-cream-board/") is the editor.
    return (
      (await cache.match(request, { ...MATCH, ignoreSearch: true })) ??
      (await cache.match(new URL('index.html', self.registration.scope).href, MATCH)) ??
      Response.error()
    );
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request, MATCH);
  return cached ?? fetch(request);
}
