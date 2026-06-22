# 🪶 FeatherScroll

> Lightweight, **zero-dependency** carousel/scroll library with **100+ layout effects** — a modern, tree-shakeable replacement for owl-carousel (no jQuery).

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

## Tại sao FeatherScroll?

| | owl-carousel 2 | **FeatherScroll** |
|---|---|---|
| Dependency | jQuery bắt buộc (~30KB gz) | **0** |
| Bundle "slide + nav + dots" | ~43KB gz | **6.56KB gz** (đo bằng size-limit) |
| Cả thư viện hiệu ứng | — | **105 hiệu ứng = 5.88KB gz** |
| Hiệu ứng layout | vài (cần animate.css) | **105 preset** sẵn |
| Tree-shaking | ❌ | ✅ |
| Framework | jQuery | Vanilla + React/Vue/Svelte/Web Component |
| A11y / reduced-motion | hạn chế | WCAG 2.1, keyboard, ARIA, `prefers-reduced-motion` |

**Trạng thái:** lint ✅ · typecheck ✅ · 19 test ✅ · build 6 package ✅ · size budget ✅. Hỗ trợ trình duyệt evergreen (Chrome/Edge/Firefox/Safari); không cần polyfill cho baseline ES2020.

## Cài đặt (khi publish)

```bash
pnpm add @feather-scroll/core @feather-scroll/effects
```

## Dùng nhanh

```ts
import Carousel from '@feather-scroll/core';
import { coverflow } from '@feather-scroll/effects';
import '@feather-scroll/core/styles/core.css';

new Carousel('#gallery', {
  effect: coverflow,
  items: 3,
  loop: true,
  autoplay: { delay: 3000 },
  nav: true,
  dots: true,
});
```

## Monorepo

```
packages/
  core/       # @feather-scroll/core — engine (zero-dep)
  effects/    # @feather-scroll/effects — 105 hiệu ứng tree-shakeable
  plugins/    # @feather-scroll/plugins — lazyload, hash, thumbnails, autoScroll, mousewheel, scrollbar, virtual
  presets/    # @feather-scroll/presets — cấu hình product scroll dùng-1-dòng
  adapters/   # wrapper React/Vue/Svelte/Web Component
examples/     # demo chạy thật
```

## Product scroll (kệ sản phẩm)

Ngoài hiệu ứng banner, FeatherScroll có sẵn UX kệ hàng e-commerce: kéo trớn (`dragFree`),
`autoWidth`, lưới `grid`, marquee (`autoScroll`), lăn chuột, thanh cuộn, virtual catalog —
và package **`@feather-scroll/presets`** đóng gói sẵn:

```ts
import Carousel from '@feather-scroll/core';
import { freeShelf, gridShelf, logoMarquee } from '@feather-scroll/presets';

new Carousel('#shelf', freeShelf());        // kéo trớn momentum
new Carousel('#grid', gridShelf({ rows: 2 }));
new Carousel('#logos', logoMarquee({ speed: 50 }));
```

Xem [docs/product-scroll.md](./docs/product-scroll.md) và `examples/recipes/` (free-shelf, marquee-logos, grid-shelf, product-gallery, infinite-catalog).

## Phát triển

```bash
pnpm install
pnpm build       # build tất cả package
pnpm test        # vitest
pnpm size        # kiểm tra bundle size
pnpm typecheck   # tsc -b
```

Xem [PLAN.md](./PLAN.md) cho kiến trúc & roadmap chi tiết, và [docs/](./docs/) cho tài liệu sử dụng.

## Phát hành (publish npm)

Các package đã `publishConfig.access = "public"`. Khi muốn phát hành (chạy thủ công):

```bash
pnpm build
pnpm -r --filter "./packages/**" publish --access public --no-git-checks
# tag version:
# git tag v0.1.0 && git push origin v0.1.0
```

## License

[MIT](./LICENSE)
