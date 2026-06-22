# @feather-scroll/react

[![npm](https://img.shields.io/npm/v/@feather-scroll/react.svg)](https://www.npmjs.com/package/@feather-scroll/react)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/xShiroeNguyenx/feather-scroll/blob/main/LICENSE)

Official React wrapper for [FeatherScroll](https://github.com/xShiroeNguyenx/feather-scroll) — a thin, SSR-safe component around the zero-dependency core.

## Install

```bash
npm i @feather-scroll/react @feather-scroll/core @feather-scroll/effects
```

## Usage

```tsx
import { useRef } from 'react';
import { FeatherScroll } from '@feather-scroll/react';
import { coverflow } from '@feather-scroll/effects';
import type { CarouselApi } from '@feather-scroll/core';
import '@feather-scroll/core/styles/core.css';

function Gallery() {
  const ref = useRef<CarouselApi>(null);
  return (
    <FeatherScroll ref={ref} effect={coverflow} loop nav dots onChange={(i) => console.log(i)}>
      <div>1</div>
      <div>2</div>
      <div>3</div>
    </FeatherScroll>
  );
}
```

All [core options](https://github.com/xShiroeNguyenx/feather-scroll/blob/main/docs/api.md) are accepted as props; the imperative API is exposed via `ref`.

## Links

- 📖 [Framework wrappers](https://github.com/xShiroeNguyenx/feather-scroll/blob/main/docs/frameworks.md)
- ▶ [Live demo](https://xshiroenguyenx.github.io/feather-scroll/)

## License

[MIT](https://github.com/xShiroeNguyenx/feather-scroll/blob/main/LICENSE)
