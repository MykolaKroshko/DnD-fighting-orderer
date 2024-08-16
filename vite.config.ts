/// <reference types="vite/client" />

import legacy from '@vitejs/plugin-legacy';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';
import viteTsconfigPaths from 'vite-tsconfig-paths';
import stylelint from 'vite-plugin-stylelint';

// eslint-disable-next-line import/no-default-export
export default defineConfig(() => ({
  plugins: [
    react(),
    viteTsconfigPaths(),
    svgr({
      include: '**/*.svg?react',
    }),
    stylelint({
      fix: true,
    }),
    legacy({
      targets: ['last 2 versions'],
    }),
  ],
  esbuild: {
    target: 'esnext',
    supported: {
      'top-level-await': true,
    },
  },
  base: '/DnD-fighting-orderer/',
  build: {
    outDir: './build',
    chunkSizeWarningLimit: 1800,
    minify: 'terser',
    manifest: true,
    sourcemap: false,
    reportCompressedSize: true,
    rollupOptions: {
      onwarn(warning, defaultHandler) {
        if (warning.code === 'SOURCEMAP_ERROR') {
          return;
        }

        defaultHandler(warning);
      },
    },
  },
  css: {
    devSourcemap: true,
  },
  server: {
    open: true,
    port: 3000,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    sequence: {
      setupFiles: 'list',
    },
    setupFiles: './src/setupTests.ts',
    // you might want to disable it, if you don't have tests that rely on CSS
    // since parsing CSS is slow
    css: {
      modules: {
        classNameStrategy: 'non-scoped',
      },
    },
  },
}));
