import type { CarouselApi, Plugin } from '@feather-scroll/core';

export interface AutoScrollOptions {
  /** Scroll speed in pixels per second. Default 40. */
  speed?: number;
  /** Reverse the scroll direction. Default false. */
  reverse?: boolean;
  /** Pause while the pointer is over the carousel. Default true. */
  pauseOnHover?: boolean;
  /** Respect `prefers-reduced-motion` and stay still. Default true. */
  respectReducedMotion?: boolean;
}

const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Continuous, constant-speed marquee scroll (Splide `AutoScroll`, Embla
 * `AutoScroll`). Best paired with `loop: true` so it wraps seamlessly — ideal
 * for logo/brand strips and "trending now" product rows.
 */
export function autoScroll(options: AutoScrollOptions = {}): Plugin {
  const speed = options.speed ?? 40;
  const dir = options.reverse ? -1 : 1;
  const pauseOnHover = options.pauseOnHover ?? true;
  const respectRM = options.respectReducedMotion ?? true;

  let api: CarouselApi | null = null;
  let rafId: number | null = null;
  let last = 0;
  let hovering = false;
  let interacting = false;
  const unbind: Array<() => void> = [];

  const onEnter = (): void => {
    hovering = true;
  };
  const onLeave = (): void => {
    hovering = false;
  };

  const frame = (t: number): void => {
    if (!api) return;
    if (last === 0) last = t;
    const dt = t - last;
    last = t;
    if (!(pauseOnHover && hovering) && !interacting && dt > 0) {
      const itemSize = api.itemSize || 1;
      api.scrollBy((dir * speed * dt) / 1000 / itemSize, false);
    }
    rafId = requestAnimationFrame(frame);
  };

  return {
    name: 'autoScroll',
    init(carousel) {
      api = carousel;
      if (respectRM && prefersReducedMotion()) return;
      if (pauseOnHover) {
        carousel.root.addEventListener('mouseenter', onEnter);
        carousel.root.addEventListener('mouseleave', onLeave);
      }
      unbind.push(
        carousel.on('dragStart', () => {
          interacting = true;
        }),
        carousel.on('dragEnd', () => {
          interacting = false;
          last = 0;
        }),
      );
      if (typeof requestAnimationFrame === 'function') rafId = requestAnimationFrame(frame);
    },
    destroy() {
      if (rafId !== null && typeof cancelAnimationFrame === 'function') cancelAnimationFrame(rafId);
      rafId = null;
      if (api) {
        api.root.removeEventListener('mouseenter', onEnter);
        api.root.removeEventListener('mouseleave', onLeave);
      }
      unbind.forEach((fn) => fn());
      unbind.length = 0;
      api = null;
    },
  };
}
