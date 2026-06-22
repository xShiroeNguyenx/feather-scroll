# @feather-scroll/core

[![npm](https://img.shields.io/npm/v/@feather-scroll/core.svg)](https://www.npmjs.com/package/@feather-scroll/core)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/xShiroeNguyenx/feather-scroll/blob/main/LICENSE)

The **zero-dependency engine** of [FeatherScroll](https://github.com/xShiroeNguyenx/feather-scroll) — a lightweight, tree-shakeable carousel/scroll library and a modern replacement for owl-carousel (no jQuery).

Ships drag/swipe, loop, autoplay, responsive breakpoints, keyboard + ARIA accessibility, and `prefers-reduced-motion` support. Includes the `slide` and `fade` effects built in; import more from [`@feather-scroll/effects`](https://www.npmjs.com/package/@feather-scroll/effects).

## Install

```bash
npm i @feather-scroll/core
```

## Usage

```ts
import Carousel, { fade } from '@feather-scroll/core';
import '@feather-scroll/core/styles/core.css';

new Carousel('#gallery', {
  effect: fade,
  items: 1,
  loop: true,
  autoplay: { delay: 3000 },
  nav: true,
  dots: true,
});
```

## Links

- 📖 [Documentation](https://github.com/xShiroeNguyenx/feather-scroll#readme) · [API reference](https://github.com/xShiroeNguyenx/feather-scroll/blob/main/docs/api.md)
- ▶ [Live demo & playground](https://xshiroenguyenx.github.io/feather-scroll/)
- 🎨 105+ effects → [`@feather-scroll/effects`](https://www.npmjs.com/package/@feather-scroll/effects)

## License

[MIT](https://github.com/xShiroeNguyenx/feather-scroll/blob/main/LICENSE)
