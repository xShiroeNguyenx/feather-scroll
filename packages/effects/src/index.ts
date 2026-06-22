import type { Effect } from '@feather-scroll/core';
import { registerEffect } from '@feather-scroll/core';

import * as slideFamily from './slide-family';
import * as fadeFamily from './fade-family';
import * as zoomFamily from './zoom-family';
import * as flipFamily from './flip-family';
import * as cubeFamily from './cube-family';
import * as wipeFamily from './wipe-family';
import * as coverflowFamily from './coverflow-family';
import * as cardsFamily from './cards-family';
import * as parallaxFamily from './parallax-family';
import * as tilesFamily from './tiles-family';
import * as creativeFamily from './creative-family';

// Named re-exports — import only what you use (tree-shakeable):
//   import { coverflow } from '@feather-scroll/effects';
export * from './slide-family';
export * from './fade-family';
export * from './zoom-family';
export * from './flip-family';
export * from './cube-family';
export * from './wipe-family';
export * from './coverflow-family';
export * from './cards-family';
export * from './parallax-family';
export * from './tiles-family';
export * from './creative-family';

export type { SlideStyle, StackEffectOptions } from './_helpers';
export { stackEffect, shift, distanceOf, ringDelta, clamp } from './_helpers';
export {
  createCreativeEffect,
  type CreativeConfig,
  type CreativeState,
} from './creative-builder';

const families = [
  slideFamily,
  fadeFamily,
  zoomFamily,
  flipFamily,
  cubeFamily,
  wipeFamily,
  coverflowFamily,
  cardsFamily,
  parallaxFamily,
  tilesFamily,
  creativeFamily,
];

function isEffect(v: unknown): v is Effect {
  return (
    typeof v === 'object' &&
    v !== null &&
    typeof (v as Effect).name === 'string' &&
    typeof (v as Effect).render === 'function'
  );
}

/** Every bundled effect, in catalog order. */
export const allEffects: Effect[] = families.flatMap((f) => Object.values(f).filter(isEffect));

/** Effect name → Effect, for the gallery and string lookups. */
export const effects: Record<string, Effect> = Object.fromEntries(
  allEffects.map((e) => [e.name, e]),
);

/** All effect names (105+). */
export const effectNames: string[] = allEffects.map((e) => e.name);

/** Effects grouped by family (for docs/gallery sections). */
export const effectGroups: Record<string, Effect[]> = {
  slide: Object.values(slideFamily).filter(isEffect),
  fade: Object.values(fadeFamily).filter(isEffect),
  zoom: Object.values(zoomFamily).filter(isEffect),
  flip: Object.values(flipFamily).filter(isEffect),
  cube: Object.values(cubeFamily).filter(isEffect),
  wipe: Object.values(wipeFamily).filter(isEffect),
  coverflow: Object.values(coverflowFamily).filter(isEffect),
  cards: Object.values(cardsFamily).filter(isEffect),
  parallax: Object.values(parallaxFamily).filter(isEffect),
  tiles: Object.values(tilesFamily).filter(isEffect),
  creative: Object.values(creativeFamily).filter(isEffect),
};

/**
 * Register every effect into core's registry so they resolve by string name
 * (`new Carousel(el, { effect: 'coverflow' })`). Optional — importing an effect
 * object directly keeps the bundle smaller.
 */
export function registerAllEffects(): void {
  for (const e of allEffects) registerEffect(e);
}
