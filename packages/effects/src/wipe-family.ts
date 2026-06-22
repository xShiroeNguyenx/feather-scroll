import type { Effect } from '@feather-scroll/core';
import { stackEffect, type SlideStyle } from './_helpers';

/**
 * Wipe / clip-path family (12). The incoming slide clips open *over* the outgoing
 * one (which sits underneath, full and un-clipped). Pure clip-path → very light.
 * `p` is reveal progress 0→1 (1 = fully shown).
 */

function revealWipe(name: string, clip: (p: number) => string): Effect {
  return stackEffect(
    name,
    (d): SlideStyle => {
      if (Math.abs(d) >= 1) return { visibility: 'hidden' };
      if (d >= 0) return { clipPath: clip(1 - d), zIndex: 100, opacity: 1 }; // incoming (on top)
      return { clipPath: 'none', zIndex: 10, opacity: 1 }; // outgoing (underneath)
    },
    { cull: 1.05 },
  );
}

export const wipeLeft = revealWipe('wipe-left', (p) => `inset(0 ${(1 - p) * 100}% 0 0)`);
export const wipeRight = revealWipe('wipe-right', (p) => `inset(0 0 0 ${(1 - p) * 100}%)`);
export const wipeUp = revealWipe('wipe-up', (p) => `inset(${(1 - p) * 100}% 0 0 0)`);
export const wipeDown = revealWipe('wipe-down', (p) => `inset(0 0 ${(1 - p) * 100}% 0)`);

export const irisOpen = revealWipe('iris-open', (p) => `circle(${p * 120}% at 50% 50%)`);

export const diamondWipe = revealWipe(
  'diamond-wipe',
  (p) =>
    `polygon(50% ${50 - p * 70}%, ${50 + p * 70}% 50%, 50% ${50 + p * 70}%, ${50 - p * 70}% 50%)`,
);

export const splitWipe = revealWipe(
  'split-wipe',
  (p) => `inset(0 ${(1 - p) * 50}% 0 ${(1 - p) * 50}%)`,
);

export const curtain = revealWipe(
  'curtain',
  (p) => `inset(${(1 - p) * 50}% 0 ${(1 - p) * 50}% 0)`,
);

export const shutterH = revealWipe('shutter-h', (p) => `ellipse(${p * 80}% 100% at 50% 50%)`);
export const shutterV = revealWipe('shutter-v', (p) => `ellipse(100% ${p * 80}% at 50% 50%)`);
export const wedgeRadial = revealWipe('wedge-radial', (p) => `circle(${p * 150}% at 0% 0%)`);

/** Iris-close: the *outgoing* slide shrinks a circle to reveal the next beneath it. */
export const irisClose: Effect = stackEffect(
  'iris-close',
  (d): SlideStyle => {
    if (Math.abs(d) >= 1) return { visibility: 'hidden' };
    if (d <= 0) return { clipPath: `circle(${(1 + d) * 120}% at 50% 50%)`, zIndex: 100 };
    return { clipPath: 'none', zIndex: 10 };
  },
  { cull: 1.05 },
);
