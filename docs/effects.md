# Catalog 105 hiệu ứng

Mỗi hiệu ứng là một export tree-shakeable từ `@feather-scroll/effects`. Import theo tên (camelCase), truyền qua option `effect`.

```ts
import Carousel from '@feather-scroll/core';
import { coverflow } from '@feather-scroll/effects';
new Carousel('#c', { effect: coverflow });
```

Hoặc đăng ký tất cả để dùng theo string name:

```ts
import { registerAllEffects } from '@feather-scroll/effects';
registerAllEffects();
new Carousel('#c', { effect: 'cube-horizontal' });
```

> Tên export camelCase tương ứng tên hiệu ứng kebab-case, vd `slide-horizontal` → `slideHorizontal`, `cube-horizontal` → `cubeHorizontal`.

## A. Slide / Linear (12)
`marquee-ticker`, `slide-back`, `slide-bounce`, `slide-diagonal-tlbr`, `slide-diagonal-trbl`, `slide-horizontal`, `slide-momentum`, `slide-rubber`, `slide-spring`, `slide-stagger`, `slide-step`, `slide-vertical`

## B. Fade (8)
`cross-fade`, `fade`, `fade-blur`, `fade-rotate`, `fade-scale-down`, `fade-scale-up`, `fade-slide`, `fade-zoom-blur`

## C. Zoom (8)
`ken-burns`, `zoom-blur-spin`, `zoom-in`, `zoom-iris`, `zoom-out`, `zoom-perspective`, `zoom-punch`, `zoom-rotate`

## D. Flip 3D (10)
`book-flip`, `door-open`, `flip-card`, `flip-corner`, `flip-diagonal`, `flip-stack`, `flip-x`, `flip-y`, `fold`, `fold-vertical`

## E. Cube / Box (8)
`box-rotate`, `cube-horizontal`, `cube-inside`, `cube-outside`, `cube-vertical`, `cylinder`, `ring-3d`, `sphere-wrap`

## F. Wipe / Clip-path (12) — *nhẹ nhất, CSS-driven*
`curtain`, `diamond-wipe`, `iris-close`, `iris-open`, `shutter-h`, `shutter-v`, `split-wipe`, `wedge-radial`, `wipe-down`, `wipe-left`, `wipe-right`, `wipe-up`

## G. Coverflow / Perspective (10)
`coverflow`, `coverflow-depth`, `coverflow-shadow`, `coverflow-tilt`, `fan`, `fan-deck`, `helix`, `perspective-corridor`, `perspective-wall`, `wheel-rotary`

## H. Cards / Stack (10)
`cards-flip-through`, `cards-peek`, `cards-pile`, `cards-shuffle`, `cards-spread`, `stack-deck`, `stack-fan`, `stack-rotate`, `stack-tinder`, `stack-vertical`

## I. Parallax (8)
`parallax-cover`, `parallax-fade`, `parallax-horizontal`, `parallax-layers`, `parallax-reveal`, `parallax-tilt`, `parallax-vertical`, `parallax-zoom`

## J. Tiles / Mosaic (10) — *chia slide thành lưới ô thật*
`blinds-h`, `blinds-v`, `checkerboard`, `mosaic-shatter`, `tiles-fade`, `tiles-flip`, `tiles-ripple`, `tiles-rotate`, `tiles-scale`, `tiles-wave`

## K. Creative / Special (9)
`cover`, `glitch`, `liquid-displace`, `morph-clip`, `page-peel`, `pull`, `push`, `swirl`, `uncover`

**Tổng: 105 hiệu ứng.**

## Tự viết hiệu ứng

Dùng `stackEffect(name, (d, ctx, i) => style)` — `d` là khoảng cách có dấu của slide tới vị trí hiện tại (0 = đang active):

```ts
import { stackEffect } from '@feather-scroll/effects';

export const myEffect = stackEffect('my-effect', (d) => ({
  transform: `translateX(${d * 100}%) rotate(${d * 15}deg)`,
  opacity: 1 - Math.min(Math.abs(d), 1),
}), { perspective: 1200 });
```

## Hiệu ứng tham số hoá (builder)

`createCreativeEffect` cho phép dựng hiệu ứng bằng cấu hình (đúng cái Playground dùng để chỉnh slider live):

```ts
import { createCreativeEffect } from '@feather-scroll/effects';

const custom = createCreativeEffect({
  perspective: 1200,
  next: { translate: [60, 0, -100], rotate: [0, -45, 0], scale: 0.8, opacity: 0.7 },
  prev: { translate: [-60, 0, -100], rotate: [0, 45, 0], scale: 0.8, opacity: 0.7 },
});
new Carousel('#c', { effect: custom, loop: true });
```

- `translate: [x%, y%, zPx]`, `rotate: [xDeg, yDeg, zDeg]`, `scale`, `opacity`.
- `next` = trạng thái slide bên phải (d>0), `prev` = bên trái (d<0); slide active là identity, nội suy theo khoảng cách.
