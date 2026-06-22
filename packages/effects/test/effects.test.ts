import { afterEach, describe, expect, it } from 'vitest';
import { Carousel } from '@feather-scroll/core';
import {
  allEffects,
  createCreativeEffect,
  effectGroups,
  effectNames,
  effects,
} from '../src/index';

function mount(count = 5): HTMLElement {
  const root = document.createElement('div');
  for (let i = 0; i < count; i++) {
    const s = document.createElement('div');
    const inner = document.createElement('div'); // parallax layer
    inner.textContent = `slide ${i}`;
    s.appendChild(inner);
    root.appendChild(s);
  }
  document.body.appendChild(root);
  return root;
}

describe('effects catalog', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('ships at least 105 effects with unique names', () => {
    expect(allEffects.length).toBeGreaterThanOrEqual(105);
    expect(new Set(effectNames).size).toBe(allEffects.length);
  });

  it('matches the documented family counts (12+8+8+10+8+12+10+10+8+10+9)', () => {
    expect(effectGroups.slide.length).toBe(12);
    expect(effectGroups.fade.length).toBe(8);
    expect(effectGroups.zoom.length).toBe(8);
    expect(effectGroups.flip.length).toBe(10);
    expect(effectGroups.cube.length).toBe(8);
    expect(effectGroups.wipe.length).toBe(12);
    expect(effectGroups.coverflow.length).toBe(10);
    expect(effectGroups.cards.length).toBe(10);
    expect(effectGroups.parallax.length).toBe(8);
    expect(effectGroups.tiles.length).toBe(10);
    expect(effectGroups.creative.length).toBe(9);
  });

  it('exposes a name→effect map', () => {
    expect(effects['coverflow']).toBeDefined();
    expect(effects['cube-horizontal']!.layout).toBe('stack');
  });

  it('every effect drives a carousel without throwing and mutates slide styles', () => {
    for (const effect of allEffects) {
      const root = mount(5);
      let c: Carousel | null = null;
      expect(() => {
        c = new Carousel(root, { effect });
        c.to(1, { animate: false });
        c.to(2, { animate: false });
      }, `effect "${effect.name}" should render`).not.toThrow();
      // At least one slide must have received an inline transform/opacity/clip.
      const touched = c!.slides.some(
        (s) => s.style.transform || s.style.opacity || s.style.clipPath || s.style.visibility,
      );
      expect(touched, `effect "${effect.name}" should style slides`).toBe(true);
      c!.destroy();
      document.body.innerHTML = '';
    }
  });

  it('createCreativeEffect builds a working parametric effect', () => {
    const custom = createCreativeEffect({
      perspective: 1200,
      next: { translate: [60, 0, -100], rotate: [0, -45, 0], scale: 0.8, opacity: 0.7 },
      prev: { translate: [-60, 0, -100], rotate: [0, 45, 0], scale: 0.8, opacity: 0.7 },
    });
    const root = mount(4);
    const c = new Carousel(root, { effect: custom });
    c.to(1, { animate: false });
    expect(c.slides.some((s) => s.style.transform.includes('rotateY'))).toBe(true);
    c.destroy();
  });

  it('loops through every effect (ring wrap) without throwing', () => {
    for (const effect of allEffects) {
      const root = mount(5);
      const c = new Carousel(root, { effect, loop: true });
      expect(() => {
        c.next();
        c.prev();
        c.to(4, { animate: false });
        c.next(); // wrap
      }, `effect "${effect.name}" should loop`).not.toThrow();
      c.destroy();
      document.body.innerHTML = '';
    }
  });
});
