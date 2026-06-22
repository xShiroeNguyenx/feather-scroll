# Bắt đầu nhanh

## Cài đặt

```bash
pnpm add @feather-scroll/core
# tuỳ chọn:
pnpm add @feather-scroll/effects @feather-scroll/plugins
```

## HTML

```html
<link rel="stylesheet" href="@feather-scroll/core/styles/core.css" />
<div id="c">
  <div>Slide 1</div>
  <div>Slide 2</div>
  <div>Slide 3</div>
</div>
```

## JS

```ts
import Carousel from '@feather-scroll/core';

const c = new Carousel('#c', {
  items: 1,
  loop: true,
  nav: true,
  dots: true,
  autoplay: { delay: 3000, pauseOnHover: true },
});
```

## Thêm hiệu ứng

```ts
import { coverflow } from '@feather-scroll/effects';
new Carousel('#c', { effect: coverflow, items: 3, loop: true });
```

## Native scroll-snap (siêu nhẹ)

```ts
new Carousel('#c', { renderMode: 'native', items: 3, gap: 12 });
```

## Responsive

```ts
new Carousel('#c', {
  items: 1,
  responsive: {
    640: { items: 2 },
    1024: { items: 3, gap: 16 },
  },
});
```
