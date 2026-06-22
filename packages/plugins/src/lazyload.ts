import type { CarouselApi, Plugin } from '@feather-scroll/core';

export interface LazyloadOptions {
  /** Attribute holding the real source. Default `data-fs-src`. */
  attr?: string;
  /** Also pre-load N slides on each side of the active one. Default 1. */
  preload?: number;
  /** Class added to an element once loaded. Default `fs-lazy-loaded`. */
  loadedClass?: string;
}

/**
 * Lazy-loads `<img data-fs-src>` / `<source data-fs-srcset>` inside slides as
 * they approach the viewport. Works with both bounded and looping carousels.
 */
export function lazyload(options: LazyloadOptions = {}): Plugin {
  const attr = options.attr ?? 'data-fs-src';
  const srcsetAttr = `${attr}set`;
  const preload = options.preload ?? 1;
  const loadedClass = options.loadedClass ?? 'fs-lazy-loaded';
  let api: CarouselApi | null = null;
  const unbind: Array<() => void> = [];

  const loadIn = (slide: HTMLElement): void => {
    const targets = slide.matches(`[${attr}],[${srcsetAttr}]`)
      ? [slide]
      : Array.from(slide.querySelectorAll<HTMLElement>(`[${attr}],[${srcsetAttr}]`));
    for (const el of targets) {
      const src = el.getAttribute(attr);
      const srcset = el.getAttribute(srcsetAttr);
      if (src) {
        el.setAttribute('src', src);
        el.removeAttribute(attr);
      }
      if (srcset) {
        el.setAttribute('srcset', srcset);
        el.removeAttribute(srcsetAttr);
      }
      el.classList.add(loadedClass);
    }
  };

  const update = (): void => {
    if (!api) return;
    const n = api.length;
    for (let d = -preload; d <= preload; d++) {
      const i = ((api.index + d) % n + n) % n;
      const slide = api.slides[i];
      if (slide) loadIn(slide);
    }
  };

  return {
    name: 'lazyload',
    init(carousel) {
      api = carousel;
      update();
      unbind.push(carousel.on('change', update), carousel.on('init', update));
    },
    destroy() {
      unbind.forEach((fn) => fn());
      unbind.length = 0;
      api = null;
    },
  };
}
