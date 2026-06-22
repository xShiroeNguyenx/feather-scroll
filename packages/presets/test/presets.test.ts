import { describe, expect, it } from 'vitest';
import {
  productShelf,
  peekShelf,
  freeShelf,
  gridShelf,
  logoMarquee,
  dealRow,
  categoryPills,
  thumbGallery,
} from '../src/index';

describe('product-scroll presets', () => {
  it('productShelf pages by screen and accepts overrides', () => {
    const o = productShelf({ gap: 99 });
    expect(o.slideBy).toBe('page');
    expect(o.nav).toBe(true);
    expect(o.gap).toBe(99); // override wins
  });

  it('peekShelf reveals neighbours via stagePadding', () => {
    expect(peekShelf().stagePadding).toBeGreaterThan(0);
  });

  it('freeShelf enables momentum dragging', () => {
    expect(freeShelf().dragFree).toBe(true);
  });

  it('gridShelf sets the requested row count', () => {
    expect(gridShelf({ rows: 3 }).grid).toEqual({ rows: 3 });
    expect(gridShelf().grid).toEqual({ rows: 2 });
  });

  it('logoMarquee loops with the autoScroll plugin', () => {
    const o = logoMarquee({ speed: 80 });
    expect(o.loop).toBe(true);
    expect(o.plugins?.[0]?.name).toBe('autoScroll');
  });

  it('dealRow autoplays', () => {
    expect(dealRow().autoplay).toBeTruthy();
  });

  it('categoryPills uses autoWidth + free scroll', () => {
    const o = categoryPills();
    expect(o.autoWidth).toBe(true);
    expect(o.dragFree).toBe(true);
  });

  it('thumbGallery returns a main + thumbs config pair', () => {
    const { main, thumbs } = thumbGallery();
    expect(main.items).toBe(1);
    expect(thumbs.items).toBe(5);
  });
});
