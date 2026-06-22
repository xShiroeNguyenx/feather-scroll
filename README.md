<div align="center">

# 🪶 FeatherScroll

**Lightweight, zero-dependency carousel & scroll library with 105+ layout effects.**
A modern, tree-shakeable replacement for owl-carousel — no jQuery, framework-agnostic.

[![CI](https://github.com/xShiroeNguyenx/feather-scroll/actions/workflows/ci.yml/badge.svg)](https://github.com/xShiroeNguyenx/feather-scroll/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Bundle](https://img.shields.io/badge/core-7.9KB%20gzip-brightgreen.svg)](#bundle-size)
[![Effects](https://img.shields.io/badge/effects-105%2B-blue.svg)](./docs/effects.md)

### [▶ Live Demo](https://xshiroenguyenx.github.io/feather-scroll/)

[Playground](https://xshiroenguyenx.github.io/feather-scroll/examples/playground/) ·
[105-Effect Showcase](https://xshiroenguyenx.github.io/feather-scroll/examples/showcase/) ·
[Recipes](https://xshiroenguyenx.github.io/feather-scroll/examples/recipes/)

</div>

---

## Why FeatherScroll?

| | owl-carousel 2 | **FeatherScroll** |
|---|---|---|
| Dependencies | jQuery required (~30 KB gz) | **0** |
| `slide + nav + dots` bundle | ~43 KB gz | **7.9 KB gz** |
| Whole effect library | — | **105 effects = 6.3 KB gz** |
| Layout effects | a few (needs animate.css) | **105 presets** built in |
| Tree-shaking | ❌ | ✅ import only what you use |
| Frameworks | jQuery only | Vanilla · React · Vue · Svelte · Web Component |
| Accessibility | limited | WCAG 2.1 — keyboard, ARIA, `prefers-reduced-motion` |
| Language | JavaScript | **TypeScript** (fully typed) |

## Features

- **Zero dependencies** — pure vanilla TypeScript, ships ESM + CJS + IIFE builds.
- **105+ layout effects** — slide, fade, coverflow, cube, flip, cards, parallax, creative builder, and more — each tree-shakeable.
- **Rich UX** — drag/swipe, momentum, loop, autoplay, responsive breakpoints, native scroll-snap.
- **Plugins** — lazyload, hash routing, thumbnails, marquee autoScroll, mousewheel, scrollbar, virtual catalog.
- **Product-scroll presets** — one-line e-commerce shelves (free-shelf, grid, logo marquee, infinite catalog).
- **Framework adapters** — thin, SSR-safe wrappers for React, Vue, Svelte, and a standalone Web Component.
- **Accessible by default** — full keyboard navigation, ARIA roles, and reduced-motion support.

## Installation

```bash
pnpm add @feather-scroll/core @feather-scroll/effects
# or: npm install / yarn add
```

## Quick start

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

Only the effects you import are bundled — `coverflow` above adds a few hundred bytes, not the whole library.

## Framework adapters

Thin, SSR-safe wrappers around the vanilla core:

```tsx
// React — <FeatherScroll> component
import { FeatherScroll } from '@feather-scroll/react';
<FeatherScroll effect={coverflow} loop nav dots>…</FeatherScroll>
```

```vue
<!-- Vue 3 — <FeatherScroll> component -->
import { FeatherScroll } from '@feather-scroll/vue';
<FeatherScroll :options="{ effect: cubeHorizontal, loop: true }">…</FeatherScroll>
```

```svelte
<!-- Svelte — use:carousel action -->
import { carousel } from '@feather-scroll/svelte';
<div use:carousel={{ effect: flipCard, loop: true, nav: true }}>…</div>
```

```html
<!-- Web Component — works anywhere, no build step -->
<script type="module" src="@feather-scroll/web-component"></script>
<feather-scroll effect="coverflow" items="3" loop nav dots autoplay="3000">
  <div>1</div><div>2</div><div>3</div>
</feather-scroll>
```

See [docs/frameworks.md](./docs/frameworks.md) for the full adapter API.

## Product scroll (e-commerce shelves)

Beyond banner effects, FeatherScroll ships e-commerce shelf UX — free-drag with momentum
(`dragFree`), `autoWidth`, multi-row `grid`, marquee (`autoScroll`), mousewheel, scrollbar,
and virtual catalogs — packaged as one-line presets in **`@feather-scroll/presets`**:

```ts
import Carousel from '@feather-scroll/core';
import { freeShelf, gridShelf, logoMarquee } from '@feather-scroll/presets';

new Carousel('#shelf', freeShelf());          // momentum drag
new Carousel('#grid', gridShelf({ rows: 2 }));
new Carousel('#logos', logoMarquee({ speed: 50 }));
```

See [docs/product-scroll.md](./docs/product-scroll.md) and the [Recipes](https://xshiroenguyenx.github.io/feather-scroll/examples/recipes/) gallery.

## Bundle size

Measured with [size-limit](https://github.com/ai/size-limit) (minified + gzipped):

| Bundle | Size |
|---|---|
| Core engine (`slide` + `fade`) | **7.9 KB** |
| Full 105-effect library | **6.3 KB** |
| Each plugin | **< 1 KB** (lazyload 0.4 KB, autoScroll 0.5 KB, scrollbar 0.7 KB…) |
| Product presets | **0.6 KB** |
| Web Component all-in-one (core + effects, IIFE) | **13.7 KB** |

## Monorepo

```
packages/
  core/       # @feather-scroll/core      — zero-dependency engine
  effects/    # @feather-scroll/effects    — 105 tree-shakeable layout effects
  plugins/    # @feather-scroll/plugins    — lazyload · hash · thumbnails · autoScroll · mousewheel · scrollbar · virtual
  presets/    # @feather-scroll/presets    — one-line product-scroll configs
  adapters/
    react/    # @feather-scroll/react
    vue/      # @feather-scroll/vue
    svelte/   # @feather-scroll/svelte
    web-component/  # @feather-scroll/web-component
examples/     # live demos (Playground · Showcase · Recipes)
docs/         # usage documentation
```

## Documentation

- [Getting started](./docs/getting-started.md)
- [API reference](./docs/api.md)
- [Effect catalog (105+)](./docs/effects.md)
- [Plugins](./docs/plugins.md)
- [Product scroll](./docs/product-scroll.md)
- [Framework wrappers](./docs/frameworks.md)
- [Migrating from owl-carousel](./docs/migration-from-owl.md)

## Development

```bash
pnpm install
pnpm build       # build every package
pnpm lint        # eslint
pnpm typecheck   # tsc
pnpm test        # vitest
pnpm size        # size-limit budget check
```

See [PLAN.md](./PLAN.md) for architecture and roadmap.

## Publishing

All packages are configured with `publishConfig.access = "public"`. To release manually:

```bash
pnpm build
pnpm -r --filter "./packages/**" publish --access public --no-git-checks
# git tag v0.1.0 && git push origin v0.1.0
```

## License

[MIT](./LICENSE)
