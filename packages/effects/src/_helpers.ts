import type { Effect, EffectContext } from '@feather-scroll/core';

/** Local copies of core math (kept here so effects don't widen core's API). */
export const clamp = (v: number, a: number, b: number): number => (v < a ? a : v > b ? b : v);

export function ringDelta(from: number, to: number, len: number): number {
  let d = (to - from) % len;
  if (d > len / 2) d -= len;
  if (d < -len / 2) d += len;
  return d;
}

/** Signed distance of slide `i` from the current fractional position. */
export function distanceOf(ctx: EffectContext, i: number): number {
  return ctx.loop ? ringDelta(ctx.position, i, ctx.total) : i - ctx.position;
}

/** Style object an effect returns per slide. Only set what you need. */
export interface SlideStyle {
  transform?: string;
  opacity?: number;
  zIndex?: number;
  filter?: string;
  clipPath?: string;
  visibility?: 'visible' | 'hidden';
  pointerEvents?: 'auto' | 'none';
  transformOrigin?: string;
  background?: string;
}

export interface StackEffectOptions {
  perViewDefault?: number;
  /** Hide slides farther than this many indices away (perf). Default 2.2. */
  cull?: number;
  /** Perspective (px) applied to the track for true 3D. */
  perspective?: number;
  /** Default transform-origin for every slide. */
  origin?: string;
  setup?: (ctx: EffectContext) => void;
}

/** Helper for the common axis-translate of full-bleed slides: `d → translateX(d*100%)`. */
export function shift(d: number, ctx: EffectContext): string {
  return ctx.axis === 'horizontal' ? `translateX(${d * 100}%)` : `translateY(${d * 100}%)`;
}

/**
 * Builds a `stack`-layout effect from a per-slide `compute(distance)` function.
 * Handles culling, z-ordering, pointer-events and the loop-aware distance for you,
 * so each of the 105 effects is just its transform math.
 */
export function stackEffect(
  name: string,
  compute: (d: number, ctx: EffectContext, i: number) => SlideStyle,
  options: StackEffectOptions = {},
): Effect {
  const cull = options.cull ?? 2.2;
  return {
    name,
    layout: 'stack',
    perViewDefault: options.perViewDefault ?? 1,
    setup(ctx) {
      if (options.perspective) {
        ctx.track.style.perspective = `${options.perspective}px`;
        ctx.track.style.transformStyle = 'preserve-3d';
        for (const s of ctx.slides) s.style.backfaceVisibility = 'hidden';
      }
      if (options.origin) {
        for (const s of ctx.slides) s.style.transformOrigin = options.origin;
      }
      options.setup?.(ctx);
    },
    render(ctx) {
      const n = ctx.total;
      for (let i = 0; i < n; i++) {
        const el = ctx.slides[i]!;
        const d = distanceOf(ctx, i);
        const ad = Math.abs(d);
        if (ad > cull) {
          el.style.visibility = 'hidden';
          continue;
        }
        const st = compute(d, ctx, i);
        el.style.visibility = st.visibility ?? 'visible';
        el.style.transform = st.transform ?? 'translateZ(0)';
        el.style.opacity = String(st.opacity ?? 1);
        el.style.zIndex = String(st.zIndex ?? Math.round((cull - ad) * 100));
        el.style.filter = st.filter ?? '';
        el.style.clipPath = st.clipPath ?? '';
        el.style.pointerEvents = st.pointerEvents ?? (ad < 0.5 ? 'auto' : 'none');
        if (st.transformOrigin) el.style.transformOrigin = st.transformOrigin;
        if (st.background) el.style.background = st.background;
      }
    },
    teardown(ctx) {
      for (const s of ctx.slides) {
        s.style.transform = '';
        s.style.opacity = '';
        s.style.zIndex = '';
        s.style.filter = '';
        s.style.clipPath = '';
        s.style.visibility = '';
      }
    },
  };
}

/** Easing helpers reused by several effects. */
export const ease = {
  out: (t: number): number => 1 - Math.pow(1 - t, 3),
  inOut: (t: number): number => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
};
