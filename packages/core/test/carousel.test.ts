import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Carousel, fade, slide } from '../src/index';

function mount(count = 4): HTMLElement {
  const root = document.createElement('div');
  for (let i = 0; i < count; i++) {
    const s = document.createElement('div');
    s.textContent = `slide ${i}`;
    root.appendChild(s);
  }
  document.body.appendChild(root);
  return root;
}

describe('Carousel core', () => {
  let root: HTMLElement;
  beforeEach(() => {
    root = mount(4);
  });
  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('builds the viewport/track structure and registers slides', () => {
    const c = new Carousel(root);
    expect(root.classList.contains('fs')).toBe(true);
    expect(root.querySelector('.fs__viewport')).toBeTruthy();
    expect(root.querySelector('.fs__track')).toBeTruthy();
    expect(c.slides.length).toBe(4);
    expect(c.index).toBe(0);
    c.destroy();
  });

  it('navigates with next/prev/to and clamps at bounds', () => {
    const c = new Carousel(root, { items: 1 });
    c.next();
    expect(c.index).toBe(1);
    c.to(3, { animate: false });
    expect(c.index).toBe(3);
    c.next(); // clamped — only 4 slides, maxIndex = 3
    expect(c.index).toBe(3);
    c.prev();
    expect(c.index).toBe(2);
    c.destroy();
  });

  it('respects rewind at the edges', () => {
    const c = new Carousel(root, { items: 1, rewind: true });
    c.prev(); // from 0 -> wraps to last
    expect(c.index).toBe(3);
    c.next(); // from last -> wraps to 0
    expect(c.index).toBe(0);
    c.destroy();
  });

  it('emits change events', () => {
    const c = new Carousel(root, { items: 1 });
    const onChange = vi.fn();
    c.on('change', onChange);
    c.next();
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0]![0].index).toBe(1);
    c.destroy();
  });

  it('renders nav buttons and pagination dots', () => {
    const c = new Carousel(root, { items: 1, nav: true, dots: true });
    expect(root.querySelector('.fs__nav--prev')).toBeTruthy();
    expect(root.querySelector('.fs__nav--next')).toBeTruthy();
    expect(root.querySelectorAll('.fs__dot').length).toBe(4);
    c.destroy();
  });

  it('sets ARIA roles when a11y is on', () => {
    const c = new Carousel(root, { a11y: true });
    expect(root.getAttribute('role')).toBe('region');
    expect(root.getAttribute('aria-roledescription')).toBe('carousel');
    expect(c.slides[0]!.getAttribute('aria-roledescription')).toBe('slide');
    c.destroy();
  });

  it('applies the fade effect (stack layout, opacity driven by position)', () => {
    const c = new Carousel(root, { effect: fade });
    expect(c.slides[0]!.style.position).toBe('absolute');
    c.to(1, { animate: false });
    expect(Number(c.slides[1]!.style.opacity)).toBeCloseTo(1, 1);
    expect(Number(c.slides[0]!.style.opacity)).toBeCloseTo(0, 1);
    c.destroy();
  });

  it('uses the slide effect by default and translates the track', () => {
    const c = new Carousel(root, { effect: slide, items: 1 });
    // jsdom has no layout, but the track transform should be a translate3d string.
    c.to(1, { animate: false });
    expect(c.track.style.transform).toContain('translate3d');
    c.destroy();
  });

  it('loops infinitely (ring wrap, no clones in DOM)', () => {
    const c = new Carousel(root, { items: 1, loop: true });
    expect(c.slides.length).toBe(4); // no DOM clones added
    c.to(3, { animate: false });
    expect(c.index).toBe(3);
    c.next(); // wraps forward to 0
    expect(c.index).toBe(0);
    c.prev(); // wraps backward to last
    expect(c.index).toBe(3);
    c.destroy();
  });

  it('uses track-loop layout (absolute slides) when looping with slide effect', () => {
    const c = new Carousel(root, { items: 1, loop: true });
    expect(c.slides[0]!.style.position).toBe('absolute');
    c.destroy();
  });

  it('sizes slides to viewport/items for a multi-item track (items > 1)', () => {
    const rect = {
      width: 1000,
      height: 400,
      top: 0,
      left: 0,
      right: 1000,
      bottom: 400,
      x: 0,
      y: 0,
      toJSON() {},
    } as DOMRect;
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue(rect);
    const r = mount(6);
    const c = new Carousel(r, { items: 4, gap: 0 });
    // 1000 / 4 = 250px per item — proves `items` is honoured (not forced to 1).
    expect(parseFloat(c.slides[0]!.style.width)).toBeCloseTo(250, 0);
    expect(parseFloat(c.slides[3]!.style.width)).toBeCloseTo(250, 0);
    c.destroy();
  });

  it('honours `items` per breakpoint via responsive', () => {
    const rect = {
      width: 1300,
      height: 400,
      top: 0,
      left: 0,
      right: 1300,
      bottom: 400,
      x: 0,
      y: 0,
      toJSON() {},
    } as DOMRect;
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue(rect);
    const r = mount(6);
    const c = new Carousel(r, { items: 1, gap: 0, responsive: { 1280: { items: 4 } } });
    // width 1300 >= 1280 → items 4 → 1300/4 = 325px each.
    expect(parseFloat(c.slides[0]!.style.width)).toBeCloseTo(325, 0);
    c.destroy();
  });

  it('does not re-inject stale slides when the host replaced root content before destroy', () => {
    const c1 = new Carousel(root, { items: 1, dots: true });
    expect(c1.slides.length).toBe(4);
    // Host wipes the root (the footgun) and re-seeds 2 fresh slides…
    root.innerHTML = '<div>x</div><div>y</div>';
    c1.destroy(); // …must NOT append the 4 old slides back on top.
    expect(root.children.length).toBe(2);
    const c2 = new Carousel(root, { items: 1, dots: true });
    expect(c2.slides.length).toBe(2);
    expect(root.querySelectorAll('.fs__dot').length).toBe(2); // dots don't pile up
    c2.destroy();
  });

  it('restores original DOM on destroy', () => {
    const before = root.children.length;
    const c = new Carousel(root);
    c.destroy();
    expect(root.classList.contains('fs')).toBe(false);
    expect(root.querySelector('.fs__viewport')).toBeNull();
    expect(root.children.length).toBe(before);
  });
});

function mockRect(width: number, height: number): void {
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
    width,
    height,
    top: 0,
    left: 0,
    right: width,
    bottom: height,
    x: 0,
    y: 0,
    toJSON() {},
  } as DOMRect);
}

describe('M7 — product scroll', () => {
  let root: HTMLElement;
  beforeEach(() => {
    root = mount(4);
  });
  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('exposes free-scroll API: scrollTo / scrollBy clamp and update index', () => {
    const c = new Carousel(root, { items: 1 });
    c.scrollTo(2);
    expect(c.index).toBe(2);
    expect(c.position).toBeCloseTo(2, 5);
    c.scrollBy(5); // clamps to maxIndex (3)
    expect(c.index).toBe(3);
    expect(c.position).toBeCloseTo(3, 5);
    expect(c.progress).toBeCloseTo(1, 5);
    c.destroy();
  });

  it('scrollToProgress maps a 0→1 ratio onto the track', () => {
    const c = new Carousel(root, { items: 1 }); // maxIndex 3
    c.scrollToProgress(0.5);
    expect(c.position).toBeCloseTo(1.5, 5);
    c.scrollToProgress(1);
    expect(c.position).toBeCloseTo(3, 5);
    c.destroy();
  });

  it('reports itemSize and contentSize for a fixed-width track', () => {
    mockRect(1000, 400);
    const r = mount(6);
    const c = new Carousel(r, { items: 4, gap: 0 });
    expect(c.itemSize).toBeCloseTo(250, 0); // 1000 / 4
    expect(c.contentSize).toBeCloseTo(1500, 0); // 6 * 250
    c.destroy();
  });

  it('emits a scroll event while the position changes', () => {
    const c = new Carousel(root, { items: 1 });
    const onScroll = vi.fn();
    c.on('scroll', onScroll);
    c.to(1, { animate: false });
    expect(onScroll).toHaveBeenCalled();
    c.destroy();
  });

  it('accepts dragFree without forcing a snap and keeps free API working', () => {
    const c = new Carousel(root, { items: 1, dragFree: true });
    expect(c.settings.dragFree).toBe(true);
    c.scrollTo(1.4);
    expect(c.position).toBeCloseTo(1.4, 5); // not snapped to an integer
    c.destroy();
  });

  it('autoWidth: builds variable offsets, clamps to the content end', () => {
    mockRect(300, 200);
    const r = mount(5);
    // each slide reports a natural width of 120px
    for (const s of Array.from(r.children) as HTMLElement[]) {
      Object.defineProperty(s, 'offsetWidth', { configurable: true, get: () => 120 });
    }
    const c = new Carousel(r, { autoWidth: true, gap: 10 });
    // offsets: 0,130,260,390,520 → contentMain 640; maxScroll = 640-300 = 340
    expect(c.contentSize).toBeCloseTo(640, 0);
    c.to(10, { animate: false }); // first slide whose start reaches the end
    expect(c.index).toBe(3); // offsets[3]=390 >= 340
    expect(c.track.style.transform).toContain('-340'); // translate clamped to maxScroll
    c.destroy();
  });

  it('grid: lays slides into rows and pages by column', () => {
    mockRect(1000, 400);
    const r = mount(8);
    const c = new Carousel(r, { items: 2, gap: 0, grid: { rows: 2 } });
    // 8 slides / 2 rows = 4 columns; 2 columns per view → maxIndex 2
    expect(c.itemSize).toBeCloseTo(500, 0); // column width 1000/2
    expect(parseFloat(c.slides[0]!.style.width)).toBeCloseTo(500, 0);
    expect(parseFloat(c.slides[0]!.style.height)).toBeCloseTo(200, 0); // 400/2 rows
    c.to(10, { animate: false });
    expect(c.index).toBe(2);
    c.destroy();
  });
});
