import type { EasingFn, EasingName } from './types';

const c1 = 1.70158;
const c3 = c1 + 1;
const n1 = 7.5625;
const d1 = 2.75;

function bounceOut(t: number): number {
  if (t < 1 / d1) return n1 * t * t;
  if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
  if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
  return n1 * (t -= 2.625 / d1) * t + 0.984375;
}

export const easings: Record<EasingName, EasingFn> = {
  linear: (t) => t,
  ease: (t) => t * t * (3 - 2 * t),
  easeIn: (t) => t * t * t,
  easeOut: (t) => 1 - Math.pow(1 - t, 3),
  easeInOut: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  back: (t) => c3 * t * t * t - c1 * t * t,
  bounce: (t) => bounceOut(t),
  elastic: (t) => {
    const c4 = (2 * Math.PI) / 3;
    if (t === 0 || t === 1) return t;
    return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },
  // Critically-damped-ish spring; visually smooth overshoot-free settle.
  spring: (t) => {
    if (t === 0 || t === 1) return t;
    return 1 - Math.pow(2, -10 * t) * Math.cos(t * 8);
  },
};

export function resolveEasing(easing: EasingName | EasingFn | undefined): EasingFn {
  if (typeof easing === 'function') return easing;
  if (easing && easing in easings) return easings[easing];
  return easings.ease;
}
