import type { Effect } from '@feather-scroll/core';
import { clamp, stackEffect, type SlideStyle } from './_helpers';

/** One side's target transform (the state a slide reaches at distance ±1). */
export interface CreativeState {
  /** [x%, y%, zPx] translate. */
  translate?: [number, number, number];
  /** [xDeg, yDeg, zDeg] rotate. */
  rotate?: [number, number, number];
  scale?: number;
  opacity?: number;
}

export interface CreativeConfig {
  name?: string;
  perspective?: number;
  origin?: string;
  /** Target for slides to the left (distance < 0). */
  prev?: CreativeState;
  /** Target for slides to the right (distance > 0). */
  next?: CreativeState;
  cull?: number;
}

const ZERO: Required<CreativeState> = {
  translate: [0, 0, 0],
  rotate: [0, 0, 0],
  scale: 1,
  opacity: 1,
};

function merge(s?: CreativeState): Required<CreativeState> {
  return {
    translate: s?.translate ?? ZERO.translate,
    rotate: s?.rotate ?? ZERO.rotate,
    scale: s?.scale ?? ZERO.scale,
    opacity: s?.opacity ?? ZERO.opacity,
  };
}

/**
 * Builds a fully parametric effect (à la Swiper "creative effect"). The active
 * slide is identity; slides interpolate toward `prev`/`next` by their distance.
 * Perfect for live tweaking with sliders.
 */
export function createCreativeEffect(config: CreativeConfig): Effect {
  const prev = merge(config.prev);
  const next = merge(config.next);

  const opts: { perspective?: number; origin?: string; cull: number } = {
    cull: config.cull ?? 2.2,
  };
  if (config.perspective !== undefined) opts.perspective = config.perspective;
  if (config.origin !== undefined) opts.origin = config.origin;

  return stackEffect(
    config.name ?? 'creative',
    (d): SlideStyle => {
      const s = d >= 0 ? next : prev;
      const a = Math.abs(d);
      const f = clamp(a, 0, 1); // for scale/opacity
      // translate scales linearly with distance (keeps neighbours spaced out)
      const x = s.translate[0] * a * Math.sign(d || 1);
      const y = s.translate[1] * a;
      const z = s.translate[2] * a;
      const rx = s.rotate[0] * d;
      const ry = s.rotate[1] * d;
      const rz = s.rotate[2] * d;
      const scale = 1 + (s.scale - 1) * f;
      const opacity = 1 + (s.opacity - 1) * f;
      return {
        transform: `translate3d(${x}%, ${y}%, ${z}px) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg) scale(${scale})`,
        opacity,
      };
    },
    opts,
  );
}
