import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    clean: true,
    minify: true,
    target: 'es2020',
    external: ['@feather-scroll/core', '@feather-scroll/effects'],
  },
  {
    // Self-registering bundle for <script> usage (bundles core + effects).
    entry: { global: 'src/global.ts' },
    format: ['iife'],
    globalName: 'FeatherScrollWC',
    minify: true,
    sourcemap: true,
    target: 'es2020',
    noExternal: ['@feather-scroll/core', '@feather-scroll/effects'],
  },
]);
