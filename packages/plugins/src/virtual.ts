import type { CarouselApi, Plugin } from '@feather-scroll/core';

export interface VirtualOptions {
  /** Slides to keep mounted on each side of the visible window. Default 2. */
  overscan?: number;
}

/**
 * Content windowing for very long product catalogs. Slide *wrappers* keep their
 * size (so scroll length and measurements stay correct), but the heavy inner
 * markup of off-window slides is detached and re-attached as you scroll — cutting
 * paint/layout cost for thousands of cards.
 *
 * Note: detaching inner DOM drops listeners bound to those nodes; pair with
 * event delegation or framework adapters that re-render on mount.
 */
export function virtual(options: VirtualOptions = {}): Plugin {
  const overscan = options.overscan ?? 2;
  let api: CarouselApi | null = null;
  const stash = new Map<number, DocumentFragment>();
  const unbind: Array<() => void> = [];
  let per = 1;
  let lastStart = NaN;
  let lastEnd = NaN;

  const recompute = (): void => {
    if (!api) return;
    const horizontal = api.settings.axis === 'horizontal';
    const vp = horizontal ? api.viewport.clientWidth : api.viewport.clientHeight;
    per = Math.max(1, Math.round(vp / (api.itemSize || vp || 1)));
  };

  const stashSlide = (i: number): void => {
    const slide = api?.slides[i];
    if (!slide || stash.has(i)) return;
    const frag = document.createDocumentFragment();
    while (slide.firstChild) frag.appendChild(slide.firstChild);
    stash.set(i, frag);
    slide.setAttribute('data-fs-virtual', 'off');
  };
  const restoreSlide = (i: number): void => {
    const slide = api?.slides[i];
    const frag = stash.get(i);
    if (!slide || !frag) return;
    slide.appendChild(frag);
    stash.delete(i);
    slide.removeAttribute('data-fs-virtual');
  };

  const update = (): void => {
    if (!api) return;
    const n = api.length;
    const start = Math.max(0, api.index - overscan);
    const end = Math.min(n - 1, api.index + per - 1 + overscan);
    if (start === lastStart && end === lastEnd) return; // window unchanged
    lastStart = start;
    lastEnd = end;
    for (let i = 0; i < n; i++) {
      if (i >= start && i <= end) restoreSlide(i);
      else stashSlide(i);
    }
  };

  const onResize = (): void => {
    recompute();
    lastStart = NaN;
    update();
  };

  return {
    name: 'virtual',
    init(carousel) {
      api = carousel;
      recompute();
      update();
      unbind.push(
        carousel.on('change', update),
        carousel.on('scroll', update),
        carousel.on('update', onResize),
        carousel.on('resize', onResize),
      );
    },
    destroy() {
      unbind.forEach((fn) => fn());
      unbind.length = 0;
      if (api) for (let i = 0; i < api.length; i++) restoreSlide(i);
      stash.clear();
      api = null;
    },
  };
}
