# @feather-scroll/effects

[![npm](https://img.shields.io/npm/v/@feather-scroll/effects.svg)](https://www.npmjs.com/package/@feather-scroll/effects)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/xShiroeNguyenx/feather-scroll/blob/main/LICENSE)

**105+ tree-shakeable layout effects** for [FeatherScroll](https://github.com/xShiroeNguyenx/feather-scroll) — coverflow, cube, flip, cards, parallax, ken-burns, creative transforms and more. The whole library is ~6 KB gzipped, and you only bundle the effects you import.

## Install

```bash
npm i @feather-scroll/core @feather-scroll/effects
```

## Usage

```ts
import Carousel from '@feather-scroll/core';
import { coverflow } from '@feather-scroll/effects';
import '@feather-scroll/core/styles/core.css';

new Carousel('#gallery', { effect: coverflow, loop: true, nav: true });
```

Need to pick effects dynamically? Use the `effects` map and `effectNames` list:

```ts
import { effects, effectNames } from '@feather-scroll/effects';
new Carousel('#gallery', { effect: effects['cube-horizontal'] });
```

Or build your own with `createCreativeEffect`.

## Links

- ▶ [Browse all 105 effects (Showcase)](https://xshiroenguyenx.github.io/feather-scroll/examples/showcase/)
- 📖 [Effect catalog](https://github.com/xShiroeNguyenx/feather-scroll/blob/main/docs/effects.md)
- 🪶 Engine → [`@feather-scroll/core`](https://www.npmjs.com/package/@feather-scroll/core)

## License

[MIT](https://github.com/xShiroeNguyenx/feather-scroll/blob/main/LICENSE)
