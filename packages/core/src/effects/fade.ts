import type { Effect, EffectContext } from '../types';
import { clamp, ringDelta } from '../utils';

/**
 * Cross-fades stacked slides. `layout: 'stack'` — the engine absolutely-positions
 * every slide on top of each other; we drive each slide's opacity from its
 * distance to the current fractional `position` (ring-aware when looping).
 */
export const fade: Effect = {
  name: 'fade',
  layout: 'stack',
  perViewDefault: 1,

  render(ctx: EffectContext): void {
    const { slides, position, loop, total } = ctx;
    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i]!;
      const dist = loop ? Math.abs(ringDelta(position, i, total)) : Math.abs(i - position);
      const opacity = 1 - clamp(dist, 0, 1);
      ctx.setStyle(slide, 'opacity', String(opacity));
      ctx.setStyle(slide, 'zIndex', String(opacity > 0.5 ? 2 : 1));
      ctx.setStyle(slide, 'pointerEvents', opacity > 0.5 ? 'auto' : 'none');
    }
  },
};
