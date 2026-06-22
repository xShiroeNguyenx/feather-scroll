import type { Effect } from '@feather-scroll/core';
import { clamp, stackEffect } from './_helpers';

/** Cube / box 3D family (8). Slides act as faces around a rotating solid. */

const P = { perspective: 1200, cull: 2.5 } as const;
const faceOpacity = (d: number): number => clamp(1.4 - Math.abs(d), 0, 1);

export const cubeHorizontal: Effect = stackEffect(
  'cube-horizontal',
  (d, ctx) => {
    const half = ctx.size.main / 2;
    return {
      transform: `translateZ(${-half}px) rotateY(${d * 90}deg) translateZ(${half}px)`,
      opacity: faceOpacity(d),
    };
  },
  P,
);

export const cubeVertical: Effect = stackEffect(
  'cube-vertical',
  (d, ctx) => {
    const half = ctx.size.main / 2;
    return {
      transform: `translateZ(${-half}px) rotateX(${d * -90}deg) translateZ(${half}px)`,
      opacity: faceOpacity(d),
    };
  },
  P,
);

export const cubeInside: Effect = stackEffect(
  'cube-inside',
  (d, ctx) => {
    const half = ctx.size.main / 2;
    return {
      transform: `translateZ(${half}px) rotateY(${d * -90}deg) translateZ(${-half}px)`,
      opacity: faceOpacity(d),
    };
  },
  P,
);

export const cubeOutside: Effect = stackEffect(
  'cube-outside',
  (d, ctx) => {
    const half = ctx.size.main / 2;
    return {
      transform: `translateZ(${-half}px) rotateY(${d * 90}deg) translateZ(${half}px) scale(${1 - Math.abs(d) * 0.1})`,
      opacity: faceOpacity(d),
    };
  },
  P,
);

export const boxRotate: Effect = stackEffect(
  'box-rotate',
  (d, ctx) => {
    const half = ctx.size.main / 2;
    return {
      transform: `translateZ(${-half}px) rotate3d(1, 1, 0, ${d * 90}deg) translateZ(${half}px)`,
      opacity: faceOpacity(d),
    };
  },
  P,
);

export const cylinder: Effect = stackEffect(
  'cylinder',
  (d, ctx) => {
    const r = ctx.size.main * 0.9;
    return {
      transform: `translateZ(${-r}px) rotateY(${d * 55}deg) translateZ(${r}px)`,
      opacity: faceOpacity(d),
    };
  },
  { perspective: 1500, cull: 2.8 },
);

export const ring3d: Effect = stackEffect(
  'ring-3d',
  (d, ctx) => {
    const r = ctx.size.main * 1.1;
    return {
      transform: `rotateY(${d * 40}deg) translateZ(${r - Math.abs(d) * 40}px)`,
      opacity: faceOpacity(d * 0.8),
    };
  },
  { perspective: 1600, cull: 3 },
);

export const sphereWrap: Effect = stackEffect(
  'sphere-wrap',
  (d, ctx) => {
    const half = ctx.size.main / 2;
    return {
      transform: `translateZ(${-half}px) rotateY(${d * 70}deg) rotateX(${d * 15}deg) translateZ(${half}px)`,
      opacity: faceOpacity(d),
    };
  },
  { perspective: 1300, cull: 2.6 },
);
