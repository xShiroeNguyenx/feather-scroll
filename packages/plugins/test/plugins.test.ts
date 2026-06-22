import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { Carousel } from '@feather-scroll/core';
import { autoScroll } from '../src/autoScroll';
import { mousewheel } from '../src/mousewheel';
import { scrollbar } from '../src/scrollbar';
import { virtual } from '../src/virtual';

function mount(count = 6): HTMLElement {
  const root = document.createElement('div');
  for (let i = 0; i < count; i++) {
    const s = document.createElement('div');
    s.textContent = `slide ${i}`;
    root.appendChild(s);
  }
  document.body.appendChild(root);
  return root;
}

describe('product-scroll plugins', () => {
  let root: HTMLElement;
  beforeEach(() => {
    root = mount(6);
  });
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('scrollbar mounts a thumb and removes it on destroy', () => {
    const c = new Carousel(root, { items: 1, plugins: [scrollbar()] });
    expect(root.querySelector('.fs__scrollbar')).toBeTruthy();
    expect(root.querySelector('.fs__scrollbar-thumb')).toBeTruthy();
    c.destroy();
    expect(root.querySelector('.fs__scrollbar')).toBeNull();
  });

  it('mousewheel (snap) advances on a wheel gesture', () => {
    const c = new Carousel(root, { items: 1, plugins: [mousewheel({ mode: 'snap' })] });
    c.viewport.dispatchEvent(
      new WheelEvent('wheel', { deltaY: 60, cancelable: true, bubbles: true }),
    );
    expect(c.index).toBe(1);
    c.destroy();
  });

  it('virtual detaches off-window slide content and restores on destroy', () => {
    const c = new Carousel(root, { items: 1, plugins: [virtual({ overscan: 1 })] });
    // window around index 0 keeps the first slides; far ones are emptied + hidden.
    expect(root.children.length).toBeGreaterThan(0);
    const slides = c.slides;
    expect(slides[4]!.getAttribute('data-fs-virtual')).toBe('off');
    expect(slides[4]!.textContent).toBe('');
    expect(slides[0]!.getAttribute('data-fs-virtual')).toBeNull();
    c.destroy();
    expect(slides[4]!.textContent).toContain('slide 4'); // restored
  });

  it('autoScroll initialises and tears down without error', () => {
    const c = new Carousel(root, { items: 2, loop: true, plugins: [autoScroll({ speed: 30 })] });
    expect(() => c.destroy()).not.toThrow();
  });
});
