import type { Effect } from '@feather-scroll/core';
import { clamp, stackEffect } from './_helpers';

/** Zoom family (8). */

const vis = (d: number): number => 1 - clamp(Math.abs(d), 0, 1);

export const zoomIn: Effect = stackEffect('zoom-in', (d) => ({
  opacity: vis(d),
  transform: `scale(${Math.max(0.2, 1 - Math.abs(d) * 0.8)})`,
}));

export const zoomOut: Effect = stackEffect('zoom-out', (d) => ({
  opacity: vis(d),
  transform: `scale(${1 + Math.abs(d) * 0.8})`,
}));

export const zoomRotate: Effect = stackEffect('zoom-rotate', (d) => ({
  opacity: vis(d),
  transform: `scale(${Math.max(0.2, 1 - Math.abs(d) * 0.7)}) rotate(${d * 90}deg)`,
}));

export const zoomBlurSpin: Effect = stackEffect('zoom-blur-spin', (d) => ({
  opacity: vis(d),
  transform: `scale(${Math.max(0.3, 1 - Math.abs(d) * 0.6)}) rotate(${d * 180}deg)`,
  filter: `blur(${Math.abs(d) * 8}px)`,
}));

export const kenBurns: Effect = stackEffect('ken-burns', (d) => ({
  opacity: vis(d),
  transform: `scale(${1.15 - Math.abs(d) * 0.15}) translateX(${d * -6}%)`,
}));

export const zoomPunch: Effect = stackEffect('zoom-punch', (d) => ({
  opacity: vis(d),
  transform: `scale(${1 - Math.sin(clamp(Math.abs(d), 0, 1) * Math.PI) * 0.4})`,
}));

export const zoomIris: Effect = stackEffect('zoom-iris', (d) => ({
  opacity: Math.abs(d) < 1 ? 1 : 0,
  clipPath: `circle(${Math.max(0, (1 - Math.abs(d)) * 75)}% at 50% 50%)`,
}));

export const zoomPerspective: Effect = stackEffect(
  'zoom-perspective',
  (d) => ({
    opacity: vis(d),
    transform: `translateZ(${-Math.abs(d) * 500}px) translateX(${d * 30}%)`,
  }),
  { perspective: 1000 },
);
