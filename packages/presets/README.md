# @feather-scroll/presets

[![npm](https://img.shields.io/npm/v/@feather-scroll/presets.svg)](https://www.npmjs.com/package/@feather-scroll/presets)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/xShiroeNguyenx/feather-scroll/blob/main/LICENSE)

One-line, e-commerce-ready configurations for [FeatherScroll](https://github.com/xShiroeNguyenx/feather-scroll). Each preset returns a ready-made options object for common product-shelf patterns — momentum drag, multi-row grids, logo marquees, infinite catalogs, thumbnail galleries and more.

Available presets: `productShelf`, `peekShelf`, `freeShelf`, `gridShelf`, `logoMarquee`, `dealRow`, `categoryPills`, `thumbGallery`.

## Install

```bash
npm i @feather-scroll/core @feather-scroll/presets
```

## Usage

```ts
import Carousel from '@feather-scroll/core';
import { freeShelf, gridShelf, logoMarquee } from '@feather-scroll/presets';

new Carousel('#shelf', freeShelf());            // free-drag with momentum
new Carousel('#grid', gridShelf({ rows: 2 }));  // multi-row grid
new Carousel('#logos', logoMarquee({ speed: 50 }));
```

Presets are plain option objects, so you can spread and override anything:

```ts
new Carousel('#shelf', { ...freeShelf(), gap: 24, nav: true });
```

## Links

- 📖 [Product scroll guide](https://github.com/xShiroeNguyenx/feather-scroll/blob/main/docs/product-scroll.md)
- ▶ [Recipes (live)](https://xshiroenguyenx.github.io/feather-scroll/examples/recipes/)

## License

[MIT](https://github.com/xShiroeNguyenx/feather-scroll/blob/main/LICENSE)
