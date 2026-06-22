import type { CarouselApi, Plugin } from '@feather-scroll/core';

export interface ScrollbarOptions {
  /** Where to mount the scrollbar. Default: appended to the carousel root. */
  container?: HTMLElement;
  /** Allow dragging the thumb to scroll. Default true. */
  draggable?: boolean;
  /** Hide the bar automatically when all content fits. Default true. */
  autoHide?: boolean;
}

/**
 * A draggable scrollbar that mirrors scroll progress (Swiper `scrollbar`).
 * Great for free-scroll product shelves where there are no dots.
 */
export function scrollbar(options: ScrollbarOptions = {}): Plugin {
  const draggable = options.draggable ?? true;
  const autoHide = options.autoHide ?? true;

  let api: CarouselApi | null = null;
  let bar: HTMLElement | null = null;
  let thumb: HTMLElement | null = null;
  let dragging = false;
  let horizontal = true;
  const unbind: Array<() => void> = [];

  const update = (): void => {
    if (!api || !bar || !thumb) return;
    const viewportLen = horizontal ? api.viewport.clientWidth : api.viewport.clientHeight;
    const content = api.contentSize || viewportLen;
    const ratio = content > 0 ? Math.min(1, viewportLen / content) : 1;
    if (autoHide && ratio >= 1) {
      bar.style.display = 'none';
      return;
    }
    bar.style.display = '';
    const barLen = horizontal ? bar.clientWidth : bar.clientHeight;
    const thumbLen = Math.max(24, ratio * barLen);
    const travel = barLen - thumbLen;
    const pos = api.progress * travel;
    if (horizontal) {
      thumb.style.width = `${thumbLen}px`;
      thumb.style.transform = `translateX(${pos}px)`;
    } else {
      thumb.style.height = `${thumbLen}px`;
      thumb.style.transform = `translateY(${pos}px)`;
    }
  };

  const progressFromEvent = (clientX: number, clientY: number): number => {
    if (!bar) return 0;
    const rect = bar.getBoundingClientRect();
    const frac = horizontal
      ? (clientX - rect.left) / (rect.width || 1)
      : (clientY - rect.top) / (rect.height || 1);
    return Math.min(1, Math.max(0, frac));
  };

  const onMove = (e: PointerEvent): void => {
    if (!dragging || !api) return;
    api.scrollToProgress(progressFromEvent(e.clientX, e.clientY), false);
  };
  const onUp = (): void => {
    dragging = false;
    bar?.classList.remove('is-dragging');
    document.removeEventListener('pointermove', onMove);
    document.removeEventListener('pointerup', onUp);
  };
  const onDown = (e: PointerEvent): void => {
    if (!api || !bar) return;
    dragging = true;
    bar.classList.add('is-dragging');
    api.scrollToProgress(progressFromEvent(e.clientX, e.clientY), false);
    document.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerup', onUp, { passive: true });
  };

  return {
    name: 'scrollbar',
    init(carousel) {
      api = carousel;
      horizontal = carousel.settings.axis === 'horizontal';
      bar = document.createElement('div');
      bar.className = 'fs__scrollbar';
      thumb = document.createElement('div');
      thumb.className = 'fs__scrollbar-thumb';
      bar.appendChild(thumb);
      (options.container ?? carousel.root).appendChild(bar);
      if (draggable) bar.addEventListener('pointerdown', onDown, { passive: true });
      unbind.push(
        carousel.on('scroll', update),
        carousel.on('change', update),
        carousel.on('update', update),
        carousel.on('resize', update),
        carousel.on('init', update),
      );
      update();
    },
    destroy() {
      onUp();
      bar?.remove();
      bar = null;
      thumb = null;
      unbind.forEach((fn) => fn());
      unbind.length = 0;
      api = null;
    },
  };
}
