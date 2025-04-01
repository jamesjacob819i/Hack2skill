import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // Important for GitHub Pages
  server: {
    port: 5173,
  },
  build: {
    outDir: 'dist',
  },
  resolve: {
    alias: {
      three: 'three',
    },
  },
});
