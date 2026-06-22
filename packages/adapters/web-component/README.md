# @feather-scroll/web-component

[![npm](https://img.shields.io/npm/v/@feather-scroll/web-component.svg)](https://www.npmjs.com/package/@feather-scroll/web-component)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/xShiroeNguyenx/feather-scroll/blob/main/LICENSE)

A `<feather-scroll>` custom element for [FeatherScroll](https://github.com/xShiroeNguyenx/feather-scroll) — works in any framework (or none), including Angular. Ships an all-in-one IIFE bundle (core + effects) so it can run with no build step.

## Install

```bash
npm i @feather-scroll/web-component
```

## Usage

Import the module to register `<feather-scroll>` automatically:

```html
<script type="module" src="@feather-scroll/web-component"></script>

<feather-scroll effect="coverflow" items="3" loop nav dots autoplay="3000">
  <div>1</div>
  <div>2</div>
  <div>3</div>
</feather-scroll>
```

Or register it manually:

```ts
import { defineFeatherScroll } from '@feather-scroll/web-component';
defineFeatherScroll(); // registers <feather-scroll>
```

For a zero-build drop-in, use the self-registering IIFE build at `dist/global.global.js`.

## Links

- 📖 [Framework wrappers](https://github.com/xShiroeNguyenx/feather-scroll/blob/main/docs/frameworks.md)
- ▶ [Live demo](https://xshiroenguyenx.github.io/feather-scroll/)

## License

[MIT](https://github.com/xShiroeNguyenx/feather-scroll/blob/main/LICENSE)
