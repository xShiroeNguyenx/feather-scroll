import type { Effect } from '@feather-scroll/core';
import { clamp, stackEffect } from './_helpers';

/** Fade family (8). In-place, opacity-driven; no full-bleed translate. */

const vis = (d: number): number => 1 - clamp(Math.abs(d), 0, 1);

export const fade: Effect = stackEffect('fade', (d) => ({ opacity: vis(d) }));

export const fadeScaleUp: Effect = stackEffect('fade-scale-up', (d) => ({
  opacity: vis(d),
  transform: `scale(${1 - Math.abs(d) * 0.25})`,
}));

export const fadeScaleDown: Effect = stackEffect('fade-scale-down', (d) => ({
  opacity: vis(d),
  transform: `scale(${1 + Math.abs(d) * 0.25})`,
}));

export const fadeBlur: Effect = stackEffect('fade-blur', (d) => ({
  opacity: vis(d),
  filter: `blur(${Math.abs(d) * 12}px)`,
}));

export const fadeZoomBlur: Effect = stackEffect('fade-zoom-blur', (d) => ({
  opacity: vis(d),
  transform: `scale(${1 - Math.abs(d) * 0.3})`,
  filter: `blur(${Math.abs(d) * 10}px)`,
}));

export const crossFade: Effect = stackEffect('cross-fade', (d) => ({
  opacity: Math.pow(vis(d), 0.7),
}));

export const fadeSlide: Effect = stackEffect('fade-slide', (d, ctx) => ({
  opacity: vis(d),
  transform: ctx.axis === 'horizontal' ? `translateX(${d * 28}%)` : `translateY(${d * 28}%)`,
}));

export const fadeRotate: Effect = stackEffect('fade-rotate', (d) => ({
  opacity: vis(d),
  transform: `rotate(${d * 24}deg) scale(${1 - Math.abs(d) * 0.15})`,
}));
