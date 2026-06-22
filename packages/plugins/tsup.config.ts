import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/lazyload.ts',
    'src/autoHeight.ts',
    'src/hash.ts',
    'src/thumbnails.ts',
    'src/autoScroll.ts',
    'src/mousewheel.ts',
    'src/scrollbar.ts',
    'src/virtual.ts',
  ],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  minify: true,
  treeshake: true,
  target: 'es2020',
  external: ['@feather-scroll/core'],
});
