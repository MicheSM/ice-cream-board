/// <reference types="vitest/config" />
/// <reference types="node" />
import { createHash } from 'node:crypto';
import { execSync } from 'node:child_process';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import pkg from './package.json' with { type: 'json' };

// The version shown in the editor's help ("v0.3.0 · 1a2b3c4"), so you can tell
// which build a device is running.
function appVersion() {
  try {
    return `v${pkg.version} · ${execSync('git rev-parse --short HEAD').toString().trim()}`;
  } catch {
    return `v${pkg.version}`;
  }
}

// After the build is written, turns src/pwa/sw.js into dist/sw.js with the
// list of files to save for offline use. The version is a hash of all their
// contents: any change to the app gives a new sw.js, which is how the browser
// knows there's an update.
function serviceWorker(): Plugin {
  let outDir = 'dist';
  return {
    name: 'ice-cream-board:service-worker',
    apply: 'build',
    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir);
    },
    closeBundle() {
      const files = readdirSync(outDir, { recursive: true, withFileTypes: true })
        .filter((e) => e.isFile())
        .map((e) => relative(outDir, join(e.parentPath, e.name)).split('\\').join('/'))
        // .woff is the fallback for browsers without .woff2: Chrome never needs it.
        .filter((f) => f !== 'sw.js' && !f.endsWith('.woff'))
        .sort();
      const hash = createHash('sha256');
      for (const f of files) hash.update(f).update(readFileSync(join(outDir, f)));
      const sw = readFileSync('src/pwa/sw.js', 'utf8')
        .replace('__VERSION__', hash.digest('hex').slice(0, 12))
        .replace('__FILES__', JSON.stringify(files));
      writeFileSync(join(outDir, 'sw.js'), sw);
    },
  };
}

// Two pages, two bundles: the editor (index.html) and the board shown on the
// monitor (display.html). The display bundle never contains editor code.
export default defineConfig({
  plugins: [react(), serviceWorker()],
  base: './',
  define: {
    __APP_VERSION__: JSON.stringify(appVersion()),
  },
  build: {
    rolldownOptions: {
      input: {
        editor: 'index.html',
        display: 'display.html',
      },
    },
  },
  test: {
    environment: 'node',
  },
});
