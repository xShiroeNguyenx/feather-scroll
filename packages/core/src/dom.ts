import type { Axis, ClassNames, Size } from './types';

export interface Structure {
  viewport: HTMLElement;
  track: HTMLElement;
  slides: HTMLElement[];
  /** Original markup, so destroy() can restore it. */
  restore: () => void;
}

/**
 * Wraps the root's direct children into a viewport/track structure.
 * The children themselves become slides (no extra wrapper) to keep the DOM light.
 */
export function buildStructure(root: HTMLElement, classes: ClassNames): Structure {
  const originalChildren = Array.from(root.childNodes);
  const slideEls = Array.from(root.children) as HTMLElement[];

  const viewport = document.createElement('div');
  viewport.className = classes.viewport;
  const track = document.createElement('div');
  track.className = classes.track;

  for (const el of slideEls) {
    el.classList.add(classes.slide);
    track.appendChild(el);
  }
  viewport.appendChild(track);
  root.appendChild(viewport);
  root.classList.add(classes.root);

  return {
    viewport,
    track,
    slides: slideEls,
    restore: () => {
      root.classList.remove(classes.root);
      // Only restore if we still own the DOM. If the host replaced the root's
      // content (e.g. reset innerHTML) before calling destroy(), re-injecting the
      // original slides would pile stale nodes on top of the new content.
      const owned = viewport.parentNode === root;
      viewport.remove();
      for (const el of slideEls) el.classList.remove(classes.slide);
      if (owned) for (const node of originalChildren) root.appendChild(node);
    },
  };
}

export type EffectiveLayout = 'track' | 'stack' | 'track-loop';

/**
 * Apply the layout primitives.
 * - `track`      flex row; engine moves one element (cheapest).
 * - `stack`      slides absolute @ 100%; each transformed individually.
 * - `track-loop` slides absolute @ itemMain; each positioned along the axis via
 *                ringDelta so the row wraps infinitely with no DOM clones.
 */
export function applyLayout(
  root: HTMLElement,
  track: HTMLElement,
  slides: HTMLElement[],
  layout: EffectiveLayout,
  axis: Axis,
): void {
  const horizontal = axis === 'horizontal';
  if (layout === 'track') {
    track.style.display = 'flex';
    track.style.flexDirection = horizontal ? 'row' : 'column';
    track.style.willChange = 'transform';
    track.style.position = 'relative';
    for (const s of slides) {
      s.style.position = '';
      s.style.flexShrink = '0';
      s.style.top = '';
      s.style.left = '';
    }
  } else {
    // stack & track-loop both absolutely position the slides.
    track.style.display = 'block';
    track.style.position = 'relative';
    track.style.height = '100%';
    track.style.willChange = layout === 'track-loop' ? 'transform' : '';
    for (const s of slides) {
      s.style.position = 'absolute';
      s.style.top = '0';
      s.style.left = '0';
      s.style.margin = '0';
      if (layout === 'stack') {
        s.style.width = '100%';
        s.style.height = '100%';
      }
    }
  }
  root.style.touchAction = horizontal ? 'pan-y' : 'pan-x';
}

/**
 * autoWidth: let each slide keep its content size; apply `gap` via margin and
 * return the cumulative leading-edge offset of every slide plus total length.
 */
export function measureAutoWidths(
  slides: HTMLElement[],
  gap: number,
  axis: Axis,
): { offsets: number[]; contentMain: number } {
  const horizontal = axis === 'horizontal';
  const offsets: number[] = [];
  let cursor = 0;
  const last = slides.length - 1;
  for (let i = 0; i < slides.length; i++) {
    const s = slides[i]!;
    s.style.position = '';
    s.style.flexShrink = '0';
    if (horizontal) {
      s.style.width = '';
      s.style.height = '';
      s.style.marginRight = i < last ? `${gap}px` : '0';
      s.style.marginBottom = '';
    } else {
      s.style.height = '';
      s.style.width = '';
      s.style.marginBottom = i < last ? `${gap}px` : '0';
      s.style.marginRight = '';
    }
    offsets.push(cursor);
    const size = horizontal ? s.offsetWidth : s.offsetHeight;
    cursor += size + gap;
  }
  return { offsets, contentMain: Math.max(0, cursor - gap) };
}

/**
 * Grid layout: lay slides into columns of `rows` cells using flex column-wrap,
 * so the row pages horizontally one column at a time. Returns the column width
 * (main axis) and the number of columns.
 */
export function layoutGrid(
  track: HTMLElement,
  slides: HTMLElement[],
  viewport: Size,
  perView: number,
  gap: number,
  rows: number,
  axis: Axis,
  stagePadding: number,
): { colMain: number; cols: number } {
  const horizontal = axis === 'horizontal';
  const available = viewport.main - stagePadding * 2 - gap * (perView - 1);
  const colMain = Math.max(0, available / perView);
  const cellCross = Math.max(0, (viewport.cross - gap * (rows - 1)) / rows);

  track.style.display = 'flex';
  track.style.flexFlow = horizontal ? 'column wrap' : 'row wrap';
  track.style.alignContent = 'flex-start';
  track.style.gap = `${gap}px`;
  track.style.willChange = 'transform';
  if (horizontal) {
    track.style.height = `${viewport.cross}px`;
    track.style.width = '';
  } else {
    track.style.width = `${viewport.cross}px`;
    track.style.height = '';
  }

  for (const s of slides) {
    s.style.position = '';
    s.style.flexShrink = '0';
    s.style.margin = '0';
    if (horizontal) {
      s.style.width = `${colMain}px`;
      s.style.height = `${cellCross}px`;
    } else {
      s.style.height = `${colMain}px`;
      s.style.width = `${cellCross}px`;
    }
  }
  return { colMain, cols: Math.ceil(slides.length / rows) };
}

export function measureViewport(viewport: HTMLElement, axis: Axis): Size {
  const rect = viewport.getBoundingClientRect();
  return axis === 'horizontal'
    ? { main: rect.width, cross: rect.height }
    : { main: rect.height, cross: rect.width };
}

/**
 * Size every slide for the current `perView`/`gap` (track layout only) and
 * return the per-item main-axis length.
 */
export function sizeTrackSlides(
  slides: HTMLElement[],
  viewport: Size,
  perView: number,
  gap: number,
  axis: Axis,
  stagePadding: number,
  /** When true (loop), gap is applied via transform, not margin. */
  absolute = false,
): number {
  const totalGap = gap * (perView - 1);
  const available = viewport.main - stagePadding * 2 - totalGap;
  const itemMain = Math.max(0, available / perView);
  for (const s of slides) {
    if (axis === 'horizontal') {
      s.style.width = `${itemMain}px`;
      s.style.height = absolute ? '100%' : '';
      s.style.marginRight = absolute ? '0' : `${gap}px`;
    } else {
      s.style.height = `${itemMain}px`;
      s.style.width = absolute ? '100%' : '';
      s.style.marginBottom = absolute ? '0' : `${gap}px`;
    }
  }
  return itemMain;
}
