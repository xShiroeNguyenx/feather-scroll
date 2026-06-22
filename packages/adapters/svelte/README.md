# @feather-scroll/svelte

[![npm](https://img.shields.io/npm/v/@feather-scroll/svelte.svg)](https://www.npmjs.com/package/@feather-scroll/svelte)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/xShiroeNguyenx/feather-scroll/blob/main/LICENSE)

Official Svelte wrapper for [FeatherScroll](https://github.com/xShiroeNguyenx/feather-scroll), exposed as a lightweight [action](https://svelte.dev/docs/svelte-action) around the zero-dependency core.

## Install

```bash
npm i @feather-scroll/svelte @feather-scroll/core @feather-scroll/effects
```

## Usage

```svelte
<script>
  import { carousel } from '@feather-scroll/svelte';
  import { flipCard } from '@feather-scroll/effects';
  import '@feather-scroll/core/styles/core.css';
</script>

<div use:carousel={{ effect: flipCard, loop: true, nav: true, dots: true }}>
  <div>1</div>
  <div>2</div>
  <div>3</div>
</div>
```

The action accepts all [core options](https://github.com/xShiroeNguyenx/feather-scroll/blob/main/docs/api.md) and returns the carousel API for imperative control.

## Links

- 📖 [Framework wrappers](https://github.com/xShiroeNguyenx/feather-scroll/blob/main/docs/frameworks.md)
- ▶ [Live demo](https://xshiroenguyenx.github.io/feather-scroll/)

## License

[MIT](https://github.com/xShiroeNguyenx/feather-scroll/blob/main/LICENSE)
