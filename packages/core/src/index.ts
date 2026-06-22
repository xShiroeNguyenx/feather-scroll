import { Carousel } from './Carousel';
import type { Options } from './types';

export { Carousel };
export { Animator, registerEffect, getEffect, resolveEffect } from './effect-engine';
export { easings, resolveEasing } from './easing';
export { Emitter } from './events';
export { slide } from './effects/slide';
export { fade } from './effects/fade';
export { defaultOptions, defaultClasses } from './defaults';

export type {
  Options,
  ResolvedOptions,
  Effect,
  EffectContext,
  Plugin,
  CarouselApi,
  EventName,
  EventHandler,
  EventPayload,
  Axis,
  EasingFn,
  EasingName,
  AutoplayOptions,
  BreakpointOptions,
  ClassNames,
  Size,
} from './types';

/** Convenience factory — `featherScroll('#el', { ... })`. */
export function featherScroll(target: string | HTMLElement, options?: Options): Carousel {
  return new Carousel(target, options);
}

export default Carousel;
