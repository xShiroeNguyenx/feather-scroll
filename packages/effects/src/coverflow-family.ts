import type { Effect } from '@feather-scroll/core';
import { clamp, stackEffect } from './_helpers';

/** Coverflow / perspective family (10). Neighbours peek, scaled and rotated. */

const P = { perspective: 1200, cull: 3.2 } as const;
const near = (d: number): number => clamp(1.4 - Math.abs(d), 0, 1);

export const coverflow: Effect = stackEffect(
  'coverflow',
  (d) => ({
    transform: `translateX(${d * 55}%) rotateY(${d * -45}deg) scale(${1 - Math.min(Math.abs(d), 2) * 0.2})`,
    opacity: near(d),
  }),
  P,
);

export const coverflowShadow: Effect = stackEffect(
  'coverflow-shadow',
  (d) => ({
    transform: `translateX(${d * 55}%) rotateY(${d * -45}deg) scale(${1 - Math.min(Math.abs(d), 2) * 0.2})`,
    opacity: near(d),
    filter: `brightness(${1 - Math.min(Math.abs(d), 1) * 0.45})`,
  }),
  P,
);

export const coverflowTilt: Effect = stackEffect(
  'coverflow-tilt',
  (d) => ({
    transform: `translateX(${d * 50}%) rotateY(${d * -40}deg) rotateX(8deg) scale(${1 - Math.min(Math.abs(d), 2) * 0.2})`,
    opacity: near(d),
  }),
  P,
);

export const coverflowDepth: Effect = stackEffect(
  'coverflow-depth',
  (d) => ({
    transform: `translateX(${d * 40}%) translateZ(${-Math.abs(d) * 260}px) rotateY(${d * -35}deg)`,
    opacity: near(d),
  }),
  P,
);

export const perspectiveWall: Effect = stackEffect(
  'perspective-wall',
  (d) => ({
    transform: `translateX(${d * 62}%) rotateY(${d * -62}deg)`,
    opacity: near(d),
  }),
  P,
);

export const perspectiveCorridor: Effect = stackEffect(
  'perspective-corridor',
  (d) => ({
    transform: `translateZ(${-Math.abs(d) * 600}px) translateX(${d * 18}%) rotateY(${d * -10}deg)`,
    opacity: near(d),
  }),
  { perspective: 900, cull: 3.5 },
);

export const fan: Effect = stackEffect(
  'fan',
  (d) => ({
    transform: `rotate(${d * 16}deg) translateX(${d * 30}%)`,
    opacity: near(d),
    transformOrigin: 'bottom center',
  }),
  { cull: 3 },
);

export const fanDeck: Effect = stackEffect(
  'fan-deck',
  (d) => ({
    transform: `rotate(${d * 12}deg) translateY(${Math.abs(d) * 6}%)`,
    opacity: near(d),
    transformOrigin: 'bottom center',
  }),
  { cull: 3.5 },
);

export const wheelRotary: Effect = stackEffect(
  'wheel-rotary',
  (d) => ({
    transform: `rotate(${d * 22}deg)`,
    opacity: near(d),
    transformOrigin: '50% 320%',
  }),
  { cull: 3.5 },
);

export const helix: Effect = stackEffect(
  'helix',
  (d) => ({
    transform: `rotateY(${d * 42}deg) translateY(${d * 26}%) translateZ(${-Math.abs(d) * 120}px)`,
    opacity: near(d),
  }),
  { perspective: 1400, cull: 3.5 },
);
