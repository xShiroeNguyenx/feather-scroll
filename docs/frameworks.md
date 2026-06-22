# Framework wrappers

Lõi là vanilla; mỗi wrapper là lớp mỏng. SSR-safe (khởi tạo khi mounted).

## Web Component (mọi nơi, kể cả Angular)

```html
<script type="module" src="@feather-scroll/web-component"></script>
<!-- hoặc bản IIFE tự đăng ký: @feather-scroll/web-component/dist/global.global.js -->

<feather-scroll effect="coverflow" items="3" loop nav dots autoplay="3000">
  <div>1</div><div>2</div><div>3</div>
</feather-scroll>
```

Hoặc tự đăng ký với JS:

```ts
import { defineFeatherScroll } from '@feather-scroll/web-component';
defineFeatherScroll(); // <feather-scroll>
```

## React

```tsx
import { useRef } from 'react';
import { FeatherScroll } from '@feather-scroll/react';
import { coverflow } from '@feather-scroll/effects';
import type { CarouselApi } from '@feather-scroll/core';

function Gallery() {
  const ref = useRef<CarouselApi>(null);
  return (
    <FeatherScroll ref={ref} effect={coverflow} loop nav dots onChange={(i) => console.log(i)}>
      <div>1</div><div>2</div><div>3</div>
    </FeatherScroll>
  );
}
```

## Vue 3

```vue
<script setup>
import { ref } from 'vue';
import { FeatherScroll } from '@feather-scroll/vue';
import { cubeHorizontal } from '@feather-scroll/effects';
const index = ref(0);
</script>

<template>
  <FeatherScroll v-model="index" :options="{ effect: cubeHorizontal, loop: true, nav: true }">
    <div>1</div><div>2</div><div>3</div>
  </FeatherScroll>
</template>
```

## Svelte (action)

```svelte
<script>
  import { carousel } from '@feather-scroll/svelte';
  import { flipCard } from '@feather-scroll/effects';
</script>

<div use:carousel={{ effect: flipCard, loop: true, nav: true, dots: true }}>
  <div>1</div><div>2</div><div>3</div>
</div>
```
