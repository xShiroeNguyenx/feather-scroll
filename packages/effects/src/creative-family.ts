import type { Effect } from '@feather-scroll/core';
import { clamp, shift, stackEffect, type SlideStyle } from './_helpers';

/** Creative / special family (9). */

const vis = (d: number): number => 1 - clamp(Math.abs(d), 0, 1);

/** Both slides translate together (the classic "push"). */
export const push: Effect = stackEffect('push', (d, ctx) => ({ transform: shift(d, ctx) }), {
  cull: 1.2,
});

/** Vertical counterpart of push. */
export const pull: Effect = stackEffect('pull', (d) => ({ transform: `translateY(${d * 100}%)` }), {
  cull: 1.2,
});

/** Incoming slides over a fixed outgoing slide. */
export const cover: Effect = stackEffect(
  'cover',
  (d, ctx): SlideStyle =>
    d >= 0
      ? { transform: shift(d, ctx), zIndex: 100, opacity: 1 }
      : { transform: 'translateZ(0)', zIndex: 10, opacity: 1 },
  { cull: 1.2 },
);

/** Outgoing slides off a fixed incoming slide. */
export const uncover: Effect = stackEffect(
  'uncover',
  (d, ctx): SlideStyle =>
    d < 0
      ? { transform: shift(d, ctx), zIndex: 100, opacity: 1 }
      : { transform: 'translateZ(0)', zIndex: 10, opacity: 1 },
  { cull: 1.2 },
);

/** Page-peel: the outgoing slide curls away around its left edge. */
export const pagePeel: Effect = stackEffect(
  'page-peel',
  (d): SlideStyle => {
    if (d < 0) {
      return {
        transform: `rotateY(${d * 100}deg)`,
        transformOrigin: 'left center',
        zIndex: 100,
        opacity: 1,
        filter: `brightness(${1 + d * 0.4})`,
      };
    }
    return { transform: 'translateZ(0)', zIndex: 10, opacity: 1 };
  },
  { perspective: 1600, cull: 1.2 },
);

/** Glitch: RGB-style slice offset + chromatic filter driven by distance. */
export const glitch: Effect = stackEffect(
  'glitch',
  (d, ctx): SlideStyle => {
    const j = (1 - Math.abs(d)) < 0.85 ? Math.abs(d) * 12 : 0;
    return {
      transform: `${shift(d, ctx)} translateX(${j}px)`,
      opacity: vis(d),
      filter: `contrast(${1 + Math.abs(d)}) hue-rotate(${d * 40}deg) drop-shadow(${j}px 0 0 rgba(255,0,80,0.6)) drop-shadow(${-j}px 0 0 rgba(0,200,255,0.6))`,
    };
  },
  { cull: 1.2 },
);

/** Liquid: wobble scale + blur to fake a displacement map. */
export const liquidDisplace: Effect = stackEffect('liquid-displace', (d) => ({
  opacity: vis(d),
  transform: `scale(${1 + Math.sin(Math.abs(d) * Math.PI) * 0.06})`,
  filter: `blur(${Math.sin(Math.abs(d) * Math.PI) * 6}px)`,
}));

/** Morph: clip-path blob morph between slides. */
export const morphClip: Effect = stackEffect('morph-clip', (d) => ({
  opacity: vis(d),
  transform: `scale(${1 - Math.abs(d) * 0.1})`,
  clipPath: `inset(${Math.abs(d) * 18}% round ${Math.abs(d) * 50}%)`,
}));

/** Swirl: rotate + scale spiral. */
export const swirl: Effect = stackEffect('swirl', (d) => ({
  opacity: vis(d),
  transform: `rotate(${d * 200}deg) scale(${Math.max(0.1, 1 - Math.abs(d))}) translateX(${d * 30}%)`,
}));
