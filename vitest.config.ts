import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig({
  plugins: [solidPlugin()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./test-setup.ts'],
    transformMode: {
      web: [/\.[jt]sx?$/],
    },
    deps: {
      registerNodeLoader: true,
    },
  },
  resolve: {
    conditions: ['development', 'browser'],
  },
});