import type { CarouselApi, Plugin } from '@feather-scroll/core';

export interface HashOptions {
  /** Attribute on each slide holding its hash tag. Default `data-fs-hash`. */
  attr?: string;
}

/**
 * Two-way URL-hash sync (owl `URLhashListener`). Slides opt in via
 * `data-fs-hash="my-slide"`. Deep-links and back/forward navigation work.
 */
export function hash(options: HashOptions = {}): Plugin {
  const attr = options.attr ?? 'data-fs-hash';
  let api: CarouselApi | null = null;
  const unbind: Array<() => void> = [];

  const tagOf = (i: number): string | null => api?.slides[i]?.getAttribute(attr) ?? null;

  const indexOfTag = (tag: string): number => {
    if (!api) return -1;
    return api.slides.findIndex((s) => s.getAttribute(attr) === tag);
  };

  const onChange = (): void => {
    if (!api) return;
    const tag = tagOf(api.index);
    if (tag && typeof history !== 'undefined') {
      history.replaceState(null, '', `#${tag}`);
    }
  };

  const onHashChange = (): void => {
    if (!api) return;
    const tag = location.hash.slice(1);
    const i = indexOfTag(tag);
    if (i >= 0 && i !== api.index) api.to(i);
  };

  return {
    name: 'hash',
    init(carousel) {
      api = carousel;
      const initial = location.hash.slice(1);
      if (initial) {
        const i = indexOfTag(initial);
        if (i >= 0) carousel.to(i, { animate: false });
      }
      window.addEventListener('hashchange', onHashChange);
      unbind.push(carousel.on('change', onChange), () =>
        window.removeEventListener('hashchange', onHashChange),
      );
    },
    destroy() {
      unbind.forEach((fn) => fn());
      unbind.length = 0;
      api = null;
    },
  };
}
