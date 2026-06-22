import type { Effect, EffectContext } from '@feather-scroll/core';
import { clamp, distanceOf } from './_helpers';

/**
 * Tiles / mosaic family (10). Each slide is split into a real rows×cols grid of
 * tiles (sliced from the slide's image/background) that animate in with a stagger.
 * Falls back gracefully for non-image slides (tiles use the slide's colour).
 */

interface TileData {
  tiles: HTMLElement[];
  rows: number;
  cols: number;
  grid: HTMLElement;
}
const STORE = new WeakMap<HTMLElement, TileData>();

function imageOf(slide: HTMLElement): string | null {
  const img = slide.querySelector('img');
  if (img && img.getAttribute('src')) return `url("${img.getAttribute('src')}")`;
  const bg = getComputedStyle(slide).backgroundImage;
  return bg && bg !== 'none' ? bg : null;
}

function buildTiles(slide: HTMLElement, rows: number, cols: number): TileData {
  const src = imageOf(slide);
  const grid = document.createElement('div');
  grid.className = 'fs-tiles';
  grid.style.cssText = 'position:absolute;inset:0;overflow:hidden;z-index:2;';
  const tiles: HTMLElement[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const t = document.createElement('div');
      t.style.position = 'absolute';
      t.style.width = `${100 / cols}%`;
      t.style.height = `${100 / rows}%`;
      t.style.left = `${(100 / cols) * c}%`;
      t.style.top = `${(100 / rows) * r}%`;
      t.style.willChange = 'transform, opacity';
      t.style.backfaceVisibility = 'hidden';
      if (src) {
        t.style.backgroundImage = src;
        t.style.backgroundSize = `${cols * 100}% ${rows * 100}%`;
        t.style.backgroundPosition = `${cols > 1 ? (c / (cols - 1)) * 100 : 0}% ${
          rows > 1 ? (r / (rows - 1)) * 100 : 0
        }%`;
      } else {
        t.style.background = 'currentColor';
      }
      grid.appendChild(t);
      tiles.push(t);
    }
  }
  slide.style.overflow = 'hidden';
  slide.appendChild(grid);
  const data: TileData = { tiles, rows, cols, grid };
  STORE.set(slide, data);
  return data;
}

interface TileOptions {
  rows?: number;
  cols?: number;
  perspective?: number;
  /** Per-tile stagger delay 0..1 from its grid position. */
  delay: (r: number, c: number, rows: number, cols: number) => number;
  /** Tile transform/opacity from its own progress `tp` (1 = settled). */
  tile: (tp: number, r: number, c: number) => { transform: string; opacity?: number };
}

const STAGGER = 0.6;

function makeTileEffect(name: string, opts: TileOptions): Effect {
  const rows = opts.rows ?? 4;
  const cols = opts.cols ?? 6;
  return {
    name,
    layout: 'stack',
    perViewDefault: 1,
    setup(ctx: EffectContext) {
      if (opts.perspective) ctx.track.style.perspective = `${opts.perspective}px`;
      for (const s of ctx.slides) buildTiles(s, rows, cols);
    },
    render(ctx: EffectContext) {
      for (let i = 0; i < ctx.total; i++) {
        const slide = ctx.slides[i]!;
        const data = STORE.get(slide);
        const d = distanceOf(ctx, i);
        const ad = Math.abs(d);
        if (ad >= 1.05) {
          slide.style.visibility = 'hidden';
          continue;
        }
        slide.style.visibility = 'visible';
        slide.style.zIndex = String(Math.round((1.5 - ad) * 100));
        slide.style.pointerEvents = ad < 0.5 ? 'auto' : 'none';
        if (!data) continue;
        const p = 1 - ad; // 0 at edge, 1 centered
        for (let idx = 0; idx < data.tiles.length; idx++) {
          const r = Math.floor(idx / cols);
          const c = idx % cols;
          const delay = opts.delay(r, c, rows, cols) * STAGGER;
          const tp = clamp((p - delay) / (1 - STAGGER), 0, 1);
          const { transform, opacity } = opts.tile(tp, r, c);
          const tile = data.tiles[idx]!;
          tile.style.transform = transform;
          tile.style.opacity = String(opacity ?? tp);
        }
      }
    },
    teardown(ctx: EffectContext) {
      for (const s of ctx.slides) {
        STORE.get(s)?.grid.remove();
        STORE.delete(s);
        s.style.overflow = '';
        s.style.visibility = '';
      }
    },
  };
}

const rowDelay = (r: number, _c: number, rows: number): number => r / Math.max(1, rows - 1);
const colDelay = (_r: number, c: number, _rows: number, cols: number): number =>
  c / Math.max(1, cols - 1);
const diagDelay = (r: number, c: number, rows: number, cols: number): number =>
  (r + c) / Math.max(1, rows + cols - 2);
const centerDelay = (r: number, c: number, rows: number, cols: number): number => {
  const dr = r - (rows - 1) / 2;
  const dc = c - (cols - 1) / 2;
  const max = Math.hypot((rows - 1) / 2, (cols - 1) / 2) || 1;
  return Math.hypot(dr, dc) / max;
};
const checkerDelay = (r: number, c: number): number => ((r + c) % 2 === 0 ? 0 : 0.5);

export const tilesFade = makeTileEffect('tiles-fade', {
  delay: diagDelay,
  tile: (tp) => ({ transform: 'translateZ(0)', opacity: tp }),
});

export const tilesFlip = makeTileEffect('tiles-flip', {
  perspective: 800,
  delay: colDelay,
  tile: (tp) => ({ transform: `rotateY(${(1 - tp) * 90}deg)`, opacity: tp }),
});

export const tilesRotate = makeTileEffect('tiles-rotate', {
  delay: diagDelay,
  tile: (tp) => ({ transform: `rotate(${(1 - tp) * 180}deg) scale(${tp})`, opacity: tp }),
});

export const tilesScale = makeTileEffect('tiles-scale', {
  delay: centerDelay,
  tile: (tp) => ({ transform: `scale(${tp})`, opacity: tp }),
});

export const tilesWave = makeTileEffect('tiles-wave', {
  delay: diagDelay,
  tile: (tp) => ({ transform: `translateY(${(1 - tp) * 60}px)`, opacity: tp }),
});

export const tilesRipple = makeTileEffect('tiles-ripple', {
  delay: centerDelay,
  tile: (tp) => ({ transform: `scale(${tp}) translateZ(0)`, opacity: tp }),
});

export const blindsH = makeTileEffect('blinds-h', {
  rows: 6,
  cols: 1,
  delay: rowDelay,
  tile: (tp) => ({ transform: `scaleY(${tp})`, opacity: 1 }),
});

export const blindsV = makeTileEffect('blinds-v', {
  rows: 1,
  cols: 8,
  delay: colDelay,
  tile: (tp) => ({ transform: `scaleX(${tp})`, opacity: 1 }),
});

export const checkerboard = makeTileEffect('checkerboard', {
  delay: checkerDelay,
  tile: (tp) => ({ transform: `scale(${tp})`, opacity: tp }),
});

export const mosaicShatter = makeTileEffect('mosaic-shatter', {
  perspective: 1000,
  delay: centerDelay,
  tile: (tp, r, c) => ({
    transform: `translate(${(1 - tp) * (c % 2 ? 60 : -60)}px, ${(1 - tp) * (r % 2 ? -60 : 60)}px) rotate(${(1 - tp) * 90}deg) scale(${tp})`,
    opacity: tp,
  }),
});
