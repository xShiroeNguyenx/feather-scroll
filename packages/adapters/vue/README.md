# @feather-scroll/vue

[![npm](https://img.shields.io/npm/v/@feather-scroll/vue.svg)](https://www.npmjs.com/package/@feather-scroll/vue)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/xShiroeNguyenx/feather-scroll/blob/main/LICENSE)

Official Vue 3 wrapper for [FeatherScroll](https://github.com/xShiroeNguyenx/feather-scroll) — a thin, SSR-safe component around the zero-dependency core.

## Install

```bash
npm i @feather-scroll/vue @feather-scroll/core @feather-scroll/effects
```

## Usage

```vue
<script setup>
import { ref } from 'vue';
import { FeatherScroll } from '@feather-scroll/vue';
import { cubeHorizontal } from '@feather-scroll/effects';
import '@feather-scroll/core/styles/core.css';

const index = ref(0);
</script>

<template>
  <FeatherScroll v-model="index" :options="{ effect: cubeHorizontal, loop: true, nav: true }">
    <div>1</div>
    <div>2</div>
    <div>3</div>
  </FeatherScroll>
</template>
```

Pass any [core option](https://github.com/xShiroeNguyenx/feather-scroll/blob/main/docs/api.md) via `:options`; `v-model` binds the active index.

## Links

- 📖 [Framework wrappers](https://github.com/xShiroeNguyenx/feather-scroll/blob/main/docs/frameworks.md)
- ▶ [Live demo](https://xshiroenguyenx.github.io/feather-scroll/)

## License

[MIT](https://github.com/xShiroeNguyenx/feather-scroll/blob/main/LICENSE)
