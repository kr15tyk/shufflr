import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const rootModules = path.resolve(__dirname, '../../node_modules');

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Dedupe React so that any subpath import (e.g. react/jsx-runtime,
    // react-dom/client) resolves to a single copy across the whole monorepo.
    dedupe: ['react', 'react-dom'],
    // Additionally alias the main entry points to the root node_modules so
    // the workspace's local react copy (different semver) is never used.
    alias: {
      react: path.join(rootModules, 'react'),
      'react-dom': path.join(rootModules, 'react-dom'),
      'react/jsx-runtime': path.join(rootModules, 'react/jsx-runtime'),
      'react/jsx-dev-runtime': path.join(rootModules, 'react/jsx-dev-runtime'),
      'react-dom/client': path.join(rootModules, 'react-dom/client'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
});
