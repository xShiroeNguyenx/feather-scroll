import type { Effect, EffectContext } from '../types';
import { clamp, ringDelta } from '../utils';

/** Interpolated leading-edge offset (px) for a fractional position over variable widths. */
function offsetAt(p: number, offsets: number[]): number {
  const n = offsets.length;
  if (n === 0) return 0;
  if (p <= 0) return offsets[0]!;
  if (p >= n - 1) {
    const lastStep = n >= 2 ? offsets[n - 1]! - offsets[n - 2]! : 0;
    return offsets[n - 1]! + (p - (n - 1)) * lastStep;
  }
  const i = Math.floor(p);
  return offsets[i]! + (p - i) * (offsets[i + 1]! - offsets[i]!);
}

function translate(ctx: EffectContext, px: number): string {
  return ctx.axis === 'horizontal' ? `translate3d(${px}px,0,0)` : `translate3d(0,${px}px,0)`;
}

/** autoWidth: one track translate by interpolated offsets, clamped to content end. */
function renderAuto(ctx: EffectContext): void {
  const { axis, rtl, size, settings } = ctx;
  const sign = axis === 'horizontal' && rtl ? -1 : 1;
  const maxScroll = Math.max(0, (ctx.contentMain ?? 0) - size.main);
  const lead = settings.stagePadding;
  const off = clamp(offsetAt(ctx.position, ctx.offsets!), 0, maxScroll);
  ctx.setTransform(ctx.track, translate(ctx, sign * -off + (axis === 'horizontal' && rtl ? -lead : lead)));
}

/**
 * The default effect.
 * - Non-loop: lays all slides in a flex row and translates one track element
 *   (cheapest path — a single GPU transform). autoWidth and grid both ride this
 *   path (grid feeds a per-column itemMain).
 * - Loop: the engine switches to `track-loop` layout (slides absolute, sized to
 *   itemMain); we position each slide individually via `ringDelta` so the row
 *   wraps infinitely with no DOM clones.
 */
export const slide: Effect = {
  name: 'slide',
  layout: 'track',

  render(ctx: EffectContext): void {
    const { position, itemMain, gap, axis, rtl, size, settings, loop, slides, total } = ctx;

    if (ctx.offsets && !loop) {
      renderAuto(ctx);
      return;
    }

    const sign = axis === 'horizontal' && rtl ? -1 : 1;
    const horizontal = axis === 'horizontal';
    const step = itemMain + gap;
    const lead = settings.center ? (size.main - itemMain) / 2 : settings.stagePadding;
    const leadSigned = horizontal && rtl ? -lead : lead;

    if (!loop) {
      ctx.setTransform(ctx.track, translate(ctx, sign * (-position * step) + leadSigned));
      return;
    }

    for (let i = 0; i < total; i++) {
      const d = ringDelta(position, i, total);
      ctx.setTransform(slides[i]!, translate(ctx, sign * (d * step) + leadSigned));
    }
  },
};
