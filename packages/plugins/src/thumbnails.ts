import type { CarouselApi, Plugin } from '@feather-scroll/core';

export interface ThumbnailsOptions {
  /** The thumbnail carousel to keep in sync (a second FeatherScroll instance). */
  thumbs: CarouselApi;
  /** Class toggled on the active thumbnail slide. Default `is-thumb-active`. */
  activeClass?: string;
  /** Click a thumbnail to navigate the main carousel. Default true. */
  clickable?: boolean;
}

/** Links a main carousel to a thumbnail carousel (two-way). */
export function thumbnails(options: ThumbnailsOptions): Plugin {
  const { thumbs } = options;
  const activeClass = options.activeClass ?? 'is-thumb-active';
  const clickable = options.clickable ?? true;
  let api: CarouselApi | null = null;
  const unbind: Array<() => void> = [];
  const clickHandlers: Array<[HTMLElement, () => void]> = [];

  const syncActive = (): void => {
    if (!api) return;
    thumbs.slides.forEach((t, i) => t.classList.toggle(activeClass, i === api!.index));
    thumbs.to(api.index);
  };

  return {
    name: 'thumbnails',
    init(carousel) {
      api = carousel;
      if (clickable) {
        thumbs.slides.forEach((thumb, i) => {
          const handler = (): void => api?.to(i);
          thumb.addEventListener('click', handler);
          thumb.style.cursor = 'pointer';
          clickHandlers.push([thumb, handler]);
        });
      }
      syncActive();
      unbind.push(carousel.on('change', syncActive), carousel.on('init', syncActive));
    },
    destroy() {
      unbind.forEach((fn) => fn());
      unbind.length = 0;
      for (const [el, handler] of clickHandlers) el.removeEventListener('click', handler);
      clickHandlers.length = 0;
      api = null;
    },
  };
}
