/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Two pages, two bundles: the editor (index.html) and the board shown on the
// monitor (display.html). The display bundle never contains editor code.
export default defineConfig({
  plugins: [react()],
  base: './',
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
