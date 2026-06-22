# Migration: owl-carousel → FeatherScroll

Mục tiêu: chuyển từ owl-carousel (jQuery) sang FeatherScroll (vanilla) trong < 10 phút.

## 1. Bỏ jQuery + owl, thêm FeatherScroll

```diff
- <script src="jquery.min.js"></script>
- <script src="owl.carousel.min.js"></script>
- <link rel="stylesheet" href="owl.carousel.min.css" />
+ <link rel="stylesheet" href="@feather-scroll/core/styles/core.css" />
```

```bash
pnpm remove jquery owl.carousel
pnpm add @feather-scroll/core @feather-scroll/effects
```

## 2. Markup

owl yêu cầu class `.owl-carousel`; FeatherScroll nhận **bất kỳ container nào**, các con trực tiếp trở thành slide.

```diff
- <div class="owl-carousel owl-theme" id="c">
+ <div id="c">
    <div>slide 1</div>
    <div>slide 2</div>
  </div>
```

## 3. Khởi tạo

```diff
- $('#c').owlCarousel({
-   items: 3, margin: 10, loop: true, nav: true, dots: true,
-   autoplay: true, autoplayTimeout: 3000, autoplayHoverPause: true,
-   responsive: { 0: { items: 1 }, 768: { items: 2 }, 1200: { items: 3 } }
- });
+ import Carousel from '@feather-scroll/core';
+ new Carousel('#c', {
+   items: 3, gap: 10, loop: true, nav: true, dots: true,
+   autoplay: { delay: 3000, pauseOnHover: true },
+   responsive: { 0: { items: 1 }, 768: { items: 2 }, 1200: { items: 3 } },
+ });
```

## 4. Bảng ánh xạ options

| owl-carousel | FeatherScroll | Ghi chú |
|---|---|---|
| `items` | `items` | giống |
| `margin` | `gap` | đổi tên |
| `loop` | `loop` | ring-based, không cần clone DOM |
| `nav` / `navText` | `nav` / `navText` | giống |
| `dots` / `dotsEach` | `dots` | |
| `autoplay` + `autoplayTimeout` | `autoplay: { delay }` | gộp |
| `autoplayHoverPause` | `autoplay: { pauseOnHover: true }` | |
| `center` | `center` | giống |
| `stagePadding` | `stagePadding` | giống |
| `responsive` | `responsive` | cùng dạng key = min-width |
| `rtl` | `rtl` | giống |
| `mouseDrag` / `touchDrag` | `drag` | gộp 1 cờ |
| `smartSpeed` | `speed` | ms |
| `startPosition` | `startIndex` | |
| `lazyLoad` | plugin `lazyload()` | `data-src` → `data-fs-src` |
| `autoHeight` | plugin `autoHeight()` | |
| `URLhashListener` | plugin `hash()` | `data-hash` → `data-fs-hash` |
| `animateIn`/`animateOut` | `effect` | chọn 1 trong 105 hiệu ứng |
| `video` | (đang phát triển) | |

## 5. Plugins (tính năng owl tách riêng để nhẹ)

```ts
import { lazyload, autoHeight, hash } from '@feather-scroll/plugins';
new Carousel('#c', {
  plugins: [lazyload(), autoHeight(), hash()],
});
```

```diff
- <img class="owl-lazy" data-src="big.jpg">
+ <img data-fs-src="big.jpg">
```

## 6. Methods

| owl | FeatherScroll |
|---|---|
| `$c.trigger('next.owl.carousel')` | `c.next()` |
| `$c.trigger('prev.owl.carousel')` | `c.prev()` |
| `$c.trigger('to.owl.carousel', [i])` | `c.to(i)` |
| `$c.trigger('play.owl.autoplay')` | `c.play()` |
| `$c.trigger('stop.owl.autoplay')` | `c.stop()` |
| `$c.trigger('refresh.owl.carousel')` | `c.refresh()` |
| `$c.trigger('destroy.owl.carousel')` | `c.destroy()` |

## 7. Events

| owl | FeatherScroll |
|---|---|
| `initialized.owl.carousel` | `c.on('init', …)` |
| `changed.owl.carousel` | `c.on('change', …)` (trước) / `c.on('changed', …)` (sau) |
| `translated.owl.carousel` | `c.on('transitionEnd', …)` |
| `dragged.owl.carousel` | `c.on('dragEnd', …)` |
| `resized.owl.carousel` | `c.on('resize', …)` |

```diff
- $c.on('changed.owl.carousel', e => console.log(e.item.index));
+ c.on('change', ({ index }) => console.log(index));
```

## 8. Nâng cấp miễn phí khi chuyển

- **Nhẹ hơn nhiều**: bỏ jQuery (~30KB) + owl (~13KB) → core ~6.3KB gzip.
- **105 hiệu ứng layout** thay vì phải kéo animate.css.
- **Tree-shaking**: chỉ bundle hiệu ứng/plugin bạn dùng.
- **A11y + keyboard + reduced-motion** mặc định.
