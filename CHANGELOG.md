# Changelog

Tuân theo [Semantic Versioning](https://semver.org/lang/vi/).

## [0.1.0] — chưa phát hành (1.0 candidate)

Bản dựng đầu tiên của FeatherScroll — carousel/scroll vanilla, zero-dependency, thay thế owl-carousel.

### Added — Core (`@feather-scroll/core`)
- Engine dựa trên fractional-position + rAF (effect là hàm thuần của vị trí).
- Drag/swipe (Pointer Events, edge resistance, flick velocity), nav, dots, autoplay (pause hover/focus/offscreen), responsive (ResizeObserver), event bus, `destroy()` khôi phục DOM.
- **Loop vô hạn dạng ring** — không clone DOM, dùng được cho mọi hiệu ứng.
- `center`, `stagePadding`, `gap`, `rtl`, `rewind`, vertical axis.
- **Native scroll-snap mode** (`renderMode: 'native'`).
- A11y: ARIA roles, keyboard (mũi tên/Home/End), `aria-live` tự tắt khi autoplay, tôn trọng `prefers-reduced-motion`.
- 2 effect tích hợp: `slide`, `fade`.

### Added — Effects (`@feather-scroll/effects`)
- **105 hiệu ứng** chia 11 family (slide, fade, zoom, flip, cube, wipe, coverflow, cards, parallax, tiles, creative).
- Factory `stackEffect` + helper `shift`/`distanceOf`/`ringDelta` để tự viết hiệu ứng.
- Tiles family chia slide thành lưới ô thật (cắt từ ảnh/nền).
- Tree-shakeable: import lẻ từng hiệu ứng; `registerAllEffects()` cho lookup theo string.

### Added — Plugins (`@feather-scroll/plugins`)
- `lazyload`, `autoHeight`, `hash` (deep-link), `thumbnails` (sync 2 carousel).

### Added — Adapters
- `@feather-scroll/web-component` — `<feather-scroll>` (zero-dep, kèm bản IIFE all-in-one).
- `@feather-scroll/react`, `@feather-scroll/vue`, `@feather-scroll/svelte`.

### Docs & demo
- Gallery live 105 hiệu ứng, demo vanilla, tài liệu API/effects/plugins/frameworks, migration guide từ owl-carousel.

### Bundle (gzip, đo bằng size-limit)
- core (slide+fade) **6.56KB** · cả 105 hiệu ứng **5.88KB** · plugin lazyload **0.38KB** · web-component all-in-one (core+effects) **12.36KB**.
- So với owl-carousel ~43KB (kèm jQuery) → "slide + nav + dots" của FeatherScroll ≈ **6.5KB**.
