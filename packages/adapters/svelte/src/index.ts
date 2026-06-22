import { Carousel, type CarouselApi, type Options } from '@feather-scroll/core';

export interface CarouselActionReturn {
  update(options: Options): void;
  destroy(): void;
}

/**
 * Svelte action. Matches Svelte's `use:` contract with no Svelte runtime dependency.
 *
 *   <div use:carousel={{ effect, loop: true, nav: true }}>
 *     {#each slides as s}<div>{s}</div>{/each}
 *   </div>
 */
export function carousel(node: HTMLElement, options: Options = {}): CarouselActionReturn {
  let instance: Carousel = new Carousel(node, options);
  return {
    update(next: Options) {
      instance.destroy();
      instance = new Carousel(node, next);
    },
    destroy() {
      instance.destroy();
    },
  };
}

export type { CarouselApi, Options };
