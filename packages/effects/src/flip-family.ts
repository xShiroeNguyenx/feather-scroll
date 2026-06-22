import type { Effect } from '@feather-scroll/core';
import { clamp, stackEffect } from './_helpers';

/** Flip / fold 3D family (10). All use a shared perspective + hidden backface. */

const P = { perspective: 1400 } as const;
const vis = (d: number): number => 1 - clamp(Math.abs(d), 0, 1);
/** Hide the slide once it has rotated past edge-on. */
const facing = (d: number): number => (Math.abs(d) < 0.5 ? 1 : 0);

export const flipX: Effect = stackEffect(
  'flip-x',
  (d) => ({ transform: `rotateX(${d * -90}deg)`, opacity: vis(d) }),
  P,
);

export const flipY: Effect = stackEffect(
  'flip-y',
  (d) => ({ transform: `rotateY(${d * 90}deg)`, opacity: vis(d) }),
  P,
);

export const flipDiagonal: Effect = stackEffect(
  'flip-diagonal',
  (d) => ({ transform: `rotate3d(1, 1, 0, ${d * -90}deg)`, opacity: vis(d) }),
  P,
);

export const flipCard: Effect = stackEffect(
  'flip-card',
  (d) => ({ transform: `rotateY(${d * -180}deg)`, opacity: facing(d) }),
  P,
);

export const fold: Effect = stackEffect(
  'fold',
  (d) => ({ transform: `rotateX(${d * -90}deg)`, opacity: vis(d), transformOrigin: 'top center' }),
  P,
);

export const foldVertical: Effect = stackEffect(
  'fold-vertical',
  (d) => ({ transform: `rotateY(${d * 90}deg)`, opacity: vis(d), transformOrigin: 'left center' }),
  P,
);

export const doorOpen: Effect = stackEffect(
  'door-open',
  (d) => ({
    transform: `rotateY(${d * -110}deg)`,
    opacity: vis(d),
    transformOrigin: d >= 0 ? 'left center' : 'right center',
  }),
  P,
);

export const bookFlip: Effect = stackEffect(
  'book-flip',
  (d) => ({
    transform: `rotateY(${d * -180}deg)`,
    opacity: facing(d),
    transformOrigin: 'left center',
  }),
  P,
);

export const flipStack: Effect = stackEffect(
  'flip-stack',
  (d) => ({
    transform: `translateZ(${-Math.abs(d) * 220}px) rotateX(${d * 35}deg)`,
    opacity: vis(d),
  }),
  P,
);

export const flipCorner: Effect = stackEffect(
  'flip-corner',
  (d) => ({
    transform: `rotate3d(1, 1, 0, ${d * 120}deg)`,
    opacity: vis(d),
    transformOrigin: 'top left',
  }),
  P,
);
