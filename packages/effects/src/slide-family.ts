import type { Effect } from '@feather-scroll/core';
import { shift, stackEffect } from './_helpers';

/**
 * Slide / linear family (12).
 * Full-bleed slides translated by their distance `d`. The *-rubber/bounce/back/
 * spring/elastic* variants bake a secondary transform so they look distinct even
 * under a linear position tween (pair them with the matching `easing` option for
 * the full feel).
 */

export const slideHorizontal: Effect = stackEffect('slide-horizontal', (d, ctx) => ({
  transform: shift(d, ctx),
}));

export const slideVertical: Effect = stackEffect('slide-vertical', (d) => ({
  transform: `translateY(${d * 100}%)`,
}));

export const slideDiagonalTLBR: Effect = stackEffect('slide-diagonal-tlbr', (d) => ({
  transform: `translate(${d * 100}%, ${d * 100}%)`,
}));

export const slideDiagonalTRBL: Effect = stackEffect('slide-diagonal-trbl', (d) => ({
  transform: `translate(${d * 100}%, ${-d * 100}%)`,
}));

export const slideRubber: Effect = stackEffect('slide-rubber', (d, ctx) => ({
  transform: `${shift(d, ctx)} scaleX(${1 - Math.min(Math.abs(d), 1) * 0.18})`,
}));

export const slideBounce: Effect = stackEffect('slide-bounce', (d, ctx) => ({
  transform: `${shift(d, ctx)} translateY(${Math.sin(Math.min(Math.abs(d), 1) * Math.PI) * -18}px)`,
}));

export const slideBack: Effect = stackEffect('slide-back', (d, ctx) => ({
  transform: `${shift(d, ctx)} scale(${1 - Math.min(Math.abs(d), 1) * 0.12})`,
}));

export const slideSpring: Effect = stackEffect('slide-spring', (d, ctx) => ({
  transform: `${shift(d, ctx)} rotateZ(${d * 4}deg)`,
}));

export const slideMomentum: Effect = stackEffect('slide-momentum', (d, ctx) => ({
  transform: shift(d, ctx),
}));

export const slideStep: Effect = stackEffect('slide-step', (d, ctx) => ({
  transform: shift(d, ctx),
}));

export const slideStagger: Effect = stackEffect('slide-stagger', (d, _ctx, i) => ({
  transform: `translateX(${d * 100}%) translateY(${d * (i % 2 ? 36 : -36)}px)`,
}));

export const marqueeTicker: Effect = stackEffect('marquee-ticker', (d, ctx) => ({
  transform: shift(d, ctx),
  pointerEvents: 'auto',
}));
