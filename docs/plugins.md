# Plugins

Tách riêng để core nhẹ. Import lẻ → tree-shake.

```ts
import Carousel from '@feather-scroll/core';
import { lazyload, autoHeight, hash, thumbnails } from '@feather-scroll/plugins';
// product-scroll:
import { autoScroll, mousewheel, scrollbar, virtual } from '@feather-scroll/plugins';
```

## lazyload

```ts
new Carousel('#c', { plugins: [lazyload({ preload: 1 })] });
```
```html
<img data-fs-src="big.jpg" />
```
- `attr` (default `data-fs-src`), `preload` (số slide tải trước mỗi bên, default 1), `loadedClass`.

## autoHeight

```ts
new Carousel('#c', { plugins: [autoHeight({ transition: 'height .3s ease' })] });
```

## hash (URL deep-link)

```ts
new Carousel('#c', { plugins: [hash()] });
```
```html
<div data-fs-hash="intro">…</div>
```

## thumbnails (đồng bộ 2 carousel)

```ts
const thumbs = new Carousel('#thumbs', { items: 5, gap: 8 });
new Carousel('#main', { plugins: [thumbnails({ thumbs })] });
```

## autoScroll (marquee chạy liên tục)

Cuộn đều `speed` px/giây — dùng cho dải logo/brand, “trending”. Nên đi với `loop: true`.

```ts
new Carousel('#logos', {
  items: 5, loop: true, dragFree: true,
  plugins: [autoScroll({ speed: 40, reverse: false, pauseOnHover: true })],
});
```
- `speed` (px/s, default 40), `reverse`, `pauseOnHover` (default true), `respectReducedMotion` (default true).

## mousewheel (lăn chuột / trackpad)

```ts
new Carousel('#shelf', { dragFree: true, plugins: [mousewheel({ mode: 'free' })] });
```
- `mode`: `'free'` (cuộn theo delta) | `'snap'` (mỗi cử chỉ một slide). `sensitivity`, `releaseOnEdges` (default true — nhả cho trang cuộn khi ở đầu/cuối), `threshold`.

## scrollbar (thanh cuộn kéo được)

```ts
new Carousel('#shelf', { dragFree: true, plugins: [scrollbar()] });
```
- `container` (mặc định gắn vào root), `draggable` (default true), `autoHide` (ẩn khi nội dung vừa khít, default true). Style sẵn trong `core.css` (`.fs__scrollbar`).

## virtual (content windowing — catalog dài)

Chỉ giữ nội dung các slide quanh khung nhìn; slide ngoài cửa sổ bị gỡ tạm nội dung (giữ kích thước wrapper) để giảm paint/layout.

```ts
new Carousel('#catalog', { dragFree: true, plugins: [virtual({ overscan: 3 })] });
```
- `overscan` (số slide đệm mỗi bên, default 2). Lưu ý: gỡ DOM con sẽ mất listener gắn trực tiếp — dùng event delegation hoặc adapter framework render lại khi mount.

## Tự viết plugin

```ts
import type { Plugin } from '@feather-scroll/core';

export function logger(): Plugin {
  let off: (() => void) | undefined;
  return {
    name: 'logger',
    init(c) { off = c.on('change', ({ index }) => console.log('slide', index)); },
    destroy() { off?.(); },
  };
}
```
