import type { Effect, EffectContext } from '@feather-scroll/core';
import { clamp, shift, stackEffect, type SlideStyle } from './_helpers';

/**
 * Parallax family (8). The slide translates at full rate while its inner content
 * (first child layer) moves at a slower rate, producing depth. Add more layers
 * via children for `parallax-layers`.
 */

const within = (d: number): number => clamp(1.5 - Math.abs(d), 0, 1);

function setLayer(ctx: EffectContext, i: number, transform: string, depth = 1): void {
  const slide = ctx.slides[i];
  const child = slide?.children[depth - 1] as HTMLElement | undefined;
  if (child) child.style.transform = transform;
}

function parallax(
  name: string,
  slideT: (d: number, ctx: EffectContext) => string,
  apply: (d: number, ctx: EffectContext, i: number) => void,
): Effect {
  return stackEffect(
    name,
    (d, ctx, i): SlideStyle => {
      apply(d, ctx, i);
      return { transform: slideT(d, ctx), opacity: within(d) };
    },
    { cull: 1.4 },
  );
}

export const parallaxHorizontal = parallax(
  'parallax-horizontal',
  (d, ctx) => shift(d, ctx),
  (d, ctx, i) => setLayer(ctx, i, `translateX(${-d * 45}%)`),
);

export const parallaxVertical = parallax(
  'parallax-vertical',
  (d) => `translateY(${d * 100}%)`,
  (d, ctx, i) => setLayer(ctx, i, `translateY(${-d * 45}%)`),
);

export const parallaxLayers = parallax(
  'parallax-layers',
  (d, ctx) => shift(d, ctx),
  (d, ctx, i) => {
    setLayer(ctx, i, `translateX(${-d * 30}%)`, 1);
    setLayer(ctx, i, `translateX(${-d * 60}%)`, 2);
  },
);

export const parallaxZoom = parallax(
  'parallax-zoom',
  (d, ctx) => shift(d, ctx),
  (d, ctx, i) => setLayer(ctx, i, `scale(${1 + Math.abs(d) * 0.4}) translateX(${-d * 20}%)`),
);

export const parallaxFade = parallax(
  'parallax-fade',
  () => 'translateZ(0)',
  (d, ctx, i) => setLayer(ctx, i, `translateX(${-d * 30}%)`),
);

export const parallaxTilt = parallax(
  'parallax-tilt',
  (d, ctx) => shift(d, ctx),
  (d, ctx, i) => setLayer(ctx, i, `rotateY(${d * 12}deg) translateX(${-d * 25}%)`),
);

/** Incoming covers a fixed outgoing slide, inner content parallaxing. */
export const parallaxCover = stackEffect(
  'parallax-cover',
  (d, ctx, i): SlideStyle => {
    const child = ctx.slides[i]?.firstElementChild as HTMLElement | undefined;
    if (d >= 0) {
      if (child) child.style.transform = `translateX(${-d * 30}%)`;
      return { transform: shift(d, ctx), zIndex: 100, opacity: within(d) };
    }
    if (child) child.style.transform = 'translateX(0)';
    return { transform: 'translateZ(0)', zIndex: 10, opacity: 1 };
  },
  { cull: 1.4 },
);

/** Outgoing slides away revealing a fixed incoming slide beneath. */
export const parallaxReveal = stackEffect(
  'parallax-reveal',
  (d, ctx, i): SlideStyle => {
    const child = ctx.slides[i]?.firstElementChild as HTMLElement | undefined;
    if (d < 0) {
      if (child) child.style.transform = `translateX(${-d * 30}%)`;
      return { transform: shift(d, ctx), zIndex: 100, opacity: 1 };
    }
    if (child) child.style.transform = 'translateX(0)';
    return { transform: 'translateZ(0)', zIndex: 10, opacity: within(d) };
  },
  { cull: 1.4 },
);
