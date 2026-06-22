import type { CarouselApi, Plugin } from '@feather-scroll/core';

export interface AutoHeightOptions {
  /** CSS transition for the height change. Default `height 0.3s ease`. */
  transition?: string;
}

/** Animates the viewport height to match the active slide (owl `autoHeight`). */
export function autoHeight(options: AutoHeightOptions = {}): Plugin {
  const transition = options.transition ?? 'height 0.3s ease';
  let api: CarouselApi | null = null;
  const unbind: Array<() => void> = [];

  const update = (): void => {
    if (!api) return;
    const active = api.slides[api.index];
    if (!active) return;
    const h = active.scrollHeight || active.getBoundingClientRect().height;
    if (h > 0) api.viewport.style.height = `${h}px`;
  };

  return {
    name: 'autoHeight',
    init(carousel) {
      api = carousel;
      carousel.viewport.style.transition = transition;
      update();
      unbind.push(
        carousel.on('change', update),
        carousel.on('init', update),
        carousel.on('resize', update),
      );
    },
    destroy() {
      unbind.forEach((fn) => fn());
      unbind.length = 0;
      if (api) {
        api.viewport.style.height = '';
        api.viewport.style.transition = '';
      }
      api = null;
    },
  };
}
