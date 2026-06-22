import type { CarouselApi, Plugin } from '@feather-scroll/core';

export interface MousewheelOptions {
  /** `'free'` scrolls by the wheel delta; `'snap'` steps one slide per gesture. Default `'free'`. */
  mode?: 'free' | 'snap';
  /** Pixels-to-index sensitivity for free mode. Default 1. */
  sensitivity?: number;
  /** Let the page scroll normally when at the first/last slide. Default true. */
  releaseOnEdges?: boolean;
  /** Minimum delta (px) to trigger a step in `'snap'` mode. Default 8. */
  threshold?: number;
}

/**
 * Wheel / trackpad scrolling for product rows (Swiper `mousewheel`, Embla
 * `WheelGestures`). Maps the dominant wheel axis onto the carousel's axis.
 */
export function mousewheel(options: MousewheelOptions = {}): Plugin {
  const mode = options.mode ?? 'free';
  const sensitivity = options.sensitivity ?? 1;
  const releaseOnEdges = options.releaseOnEdges ?? true;
  const threshold = options.threshold ?? 8;

  let api: CarouselApi | null = null;
  let cooldown = false;

  const atEdge = (delta: number): boolean => {
    if (!api) return true;
    const p = api.progress;
    return (p <= 0.001 && delta < 0) || (p >= 0.999 && delta > 0);
  };

  const onWheel = (e: WheelEvent): void => {
    if (!api) return;
    // Dominant axis: use whichever of deltaX/deltaY moved more (so a vertical
    // wheel still drives a horizontal shelf).
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (delta === 0) return;
    if (releaseOnEdges && atEdge(delta) && !api.settings.loop) return; // let page scroll

    e.preventDefault();
    if (mode === 'free') {
      const itemSize = api.itemSize || 1;
      api.scrollBy((delta * sensitivity) / itemSize, false);
      return;
    }
    if (cooldown || Math.abs(delta) < threshold) return;
    cooldown = true;
    if (delta > 0) api.next();
    else api.prev();
    setTimeout(() => {
      cooldown = false;
    }, 220);
  };

  return {
    name: 'mousewheel',
    init(carousel) {
      api = carousel;
      carousel.viewport.addEventListener('wheel', onWheel, { passive: false });
    },
    destroy() {
      api?.viewport.removeEventListener('wheel', onWheel);
      api = null;
    },
  };
}
