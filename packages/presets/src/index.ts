import type { Options } from '@feather-scroll/core';
import { autoScroll } from '@feather-scroll/plugins';

/**
 * Ready-made *product scroll* configurations — one-liner `Options` objects you
 * spread into `new Carousel(el, productShelf({ ... }))`. Each accepts overrides
 * that win over the preset defaults, so you keep full control.
 *
 * These describe *layout/behaviour* (shelf, grid, marquee…), not visual
 * transitions — for banner transitions use `@feather-scroll/effects`.
 */

/** Base type: any preset takes plain `Options` overrides. */
export type PresetOverrides = Partial<Options>;

/**
 * Paged multi-item product shelf with prev/next — the classic "row of products"
 * that advances one full screen of items per click. Responsive 1→2→3→4.
 */
export function productShelf(o: PresetOverrides = {}): Options {
  return {
    items: 2,
    gap: 16,
    slideBy: 'page',
    nav: true,
    dots: false,
    drag: true,
    speed: 450,
    easing: 'easeOut',
    responsive: { 520: { items: 2 }, 860: { items: 3 }, 1100: { items: 4 } },
    ...o,
  };
}

/**
 * Peek shelf — reveals a sliver of the next/previous item via `stagePadding` so
 * users immediately see the row is scrollable. Advances one item at a time.
 */
export function peekShelf(o: PresetOverrides = {}): Options {
  return {
    items: 1,
    gap: 14,
    stagePadding: 40,
    slideBy: 1,
    nav: true,
    drag: true,
    speed: 400,
    responsive: {
      520: { items: 2, stagePadding: 48 },
      900: { items: 3, stagePadding: 56 },
    },
    ...o,
  };
}

/**
 * Free-scroll shelf — momentum dragging with no hard snap (Amazon-style
 * "you may also like"). Pair with the `scrollbar` plugin and/or
 * `fs--fade-edges` for the full feel.
 */
export function freeShelf(o: PresetOverrides = {}): Options {
  return {
    items: 2,
    gap: 14,
    drag: true,
    dragFree: true,
    nav: false,
    dots: false,
    responsive: { 520: { items: 3 }, 900: { items: 4 }, 1200: { items: 5 } },
    ...o,
  };
}

/** Multi-row product grid that pages horizontally (default 2 rows). */
export function gridShelf(o: PresetOverrides & { rows?: number } = {}): Options {
  const { rows = 2, ...rest } = o;
  return {
    items: 2,
    gap: 16,
    grid: { rows },
    slideBy: 'page',
    nav: true,
    drag: true,
    responsive: { 520: { items: 2 }, 860: { items: 3 }, 1100: { items: 4 } },
    ...rest,
  };
}

export interface LogoMarqueeOptions extends PresetOverrides {
  /** Marquee speed in px/s. Default 40. */
  speed?: number;
  /** Reverse direction. Default false. */
  reverse?: boolean;
  /** Pause on hover. Default true. */
  pauseOnHover?: boolean;
}

/**
 * Endless, constant-speed marquee for logo/brand strips — `loop` + `autoScroll`.
 * Uniform cells (fixed `items`) keep the loop seamless.
 */
export function logoMarquee(o: LogoMarqueeOptions = {}): Options {
  const { speed, reverse, pauseOnHover, ...rest } = o;
  return {
    items: 5,
    gap: 24,
    loop: true,
    drag: true,
    dragFree: true,
    nav: false,
    dots: false,
    a11y: false,
    responsive: { 0: { items: 3 }, 600: { items: 4 }, 900: { items: 6 } },
    plugins: [autoScroll({ speed: speed ?? 40, reverse, pauseOnHover: pauseOnHover ?? true })],
    ...rest,
  };
}

/**
 * Flash-deal row — autoplaying, looping shelf with nav + dots, perfect for a
 * "deals of the day" carousel (drop a countdown inside each card).
 */
export function dealRow(o: PresetOverrides = {}): Options {
  return {
    items: 1,
    gap: 12,
    slideBy: 'page',
    loop: true,
    nav: true,
    dots: true,
    drag: true,
    autoplay: { delay: 3500, pauseOnHover: true },
    responsive: { 520: { items: 2 }, 860: { items: 3 }, 1200: { items: 4 } },
    ...o,
  };
}

/**
 * Category pills / filter chips — a compact, content-sized (`autoWidth`),
 * free-scrolling horizontal strip. Add the `fs--fade-edges` root class for the
 * faded overflow hint.
 */
export function categoryPills(o: PresetOverrides = {}): Options {
  return {
    autoWidth: true,
    gap: 10,
    drag: true,
    dragFree: true,
    nav: false,
    dots: false,
    ...o,
  };
}

export interface ThumbGalleryConfig {
  /** Options for the main (large image) carousel. */
  main: Options;
  /** Options for the thumbnail strip carousel. */
  thumbs: Options;
}

/**
 * Product-detail gallery: a 1-up main viewer + a thumbnail strip. Returns the
 * two `Options` objects; wire them with the `thumbnails` plugin:
 *
 * ```ts
 * const { main, thumbs } = thumbGallery();
 * const strip = new Carousel('#thumbs', thumbs);
 * new Carousel('#main', { ...main, plugins: [thumbnails({ thumbs: strip })] });
 * ```
 */
export function thumbGallery(o: { main?: PresetOverrides; thumbs?: PresetOverrides } = {}): ThumbGalleryConfig {
  return {
    main: {
      items: 1,
      gap: 0,
      nav: true,
      drag: true,
      speed: 350,
      ...o.main,
    },
    thumbs: {
      items: 5,
      gap: 8,
      slideBy: 1,
      drag: true,
      nav: false,
      a11y: false,
      responsive: { 600: { items: 6 }, 900: { items: 8 } },
      ...o.thumbs,
    },
  };
}
