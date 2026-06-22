# @feather-scroll/plugins

[![npm](https://img.shields.io/npm/v/@feather-scroll/plugins.svg)](https://www.npmjs.com/package/@feather-scroll/plugins)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/xShiroeNguyenx/feather-scroll/blob/main/LICENSE)

Optional, tree-shakeable plugins for [FeatherScroll](https://github.com/xShiroeNguyenx/feather-scroll). Each is well under 1 KB gzipped — import only what you need.

| Plugin | What it does |
|---|---|
| `lazyload` | Load slide images only when near the viewport |
| `autoHeight` | Animate viewport height to the active slide |
| `hash` | Sync the active slide with the URL hash |
| `thumbnails` | Wire a thumbnail strip to the main carousel |
| `autoScroll` | Continuous marquee-style scrolling |
| `mousewheel` | Navigate with the mouse wheel |
| `scrollbar` | Draggable scrollbar |
| `virtual` | Virtualized rendering for long catalogs |

## Install

```bash
npm i @feather-scroll/core @feather-scroll/plugins
```

## Usage

```ts
import Carousel from '@feather-scroll/core';
import { lazyload, thumbnails } from '@feather-scroll/plugins';

new Carousel('#gallery', {
  plugins: [lazyload(), thumbnails({ el: '#thumbs' })],
});
```

## Links

- 📖 [Plugins documentation](https://github.com/xShiroeNguyenx/feather-scroll/blob/main/docs/plugins.md)
- ▶ [Live demo](https://xshiroenguyenx.github.io/feather-scroll/)

## License

[MIT](https://github.com/xShiroeNguyenx/feather-scroll/blob/main/LICENSE)
