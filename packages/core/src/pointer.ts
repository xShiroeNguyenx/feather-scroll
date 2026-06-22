import type { Axis } from './types';
import { now } from './utils';

export interface DragCallbacks {
  axis: () => Axis;
  rtl: () => boolean;
  enabled: () => boolean;
  /** Pixels that correspond to advancing one slide index. */
  step: () => number;
  onStart: () => void;
  /** `deltaIndex` is positive when content should move toward the next slide. */
  onMove: (deltaIndex: number) => void;
  onEnd: (deltaIndex: number, velocityIndex: number) => void;
}

const DRAG_THRESHOLD = 4; // px before a press becomes a drag

/** Pointer-Events based drag/swipe controller. */
export class DragController {
  private el: HTMLElement;
  private cb: DragCallbacks;
  private active = false;
  private dragging = false;
  private startX = 0;
  private startY = 0;
  private lastPos = 0;
  private lastTime = 0;
  private velocity = 0; // index units / ms
  private pointerId = -1;

  constructor(el: HTMLElement, cb: DragCallbacks) {
    this.el = el;
    this.cb = cb;
    el.addEventListener('pointerdown', this.onDown, { passive: true });
  }

  private mainCoord(e: PointerEvent): number {
    return this.cb.axis() === 'horizontal' ? e.clientX : e.clientY;
  }

  private onDown = (e: PointerEvent): void => {
    if (!this.cb.enabled() || e.button !== 0) return;
    this.active = true;
    this.dragging = false;
    this.pointerId = e.pointerId;
    this.startX = e.clientX;
    this.startY = e.clientY;
    this.lastPos = this.mainCoord(e);
    this.lastTime = now();
    this.velocity = 0;
    document.addEventListener('pointermove', this.onMove, { passive: false });
    document.addEventListener('pointerup', this.onUp, { passive: true });
    document.addEventListener('pointercancel', this.onUp, { passive: true });
  };

  private onMove = (e: PointerEvent): void => {
    if (!this.active || e.pointerId !== this.pointerId) return;
    const dx = e.clientX - this.startX;
    const dy = e.clientY - this.startY;

    if (!this.dragging) {
      const horizontal = this.cb.axis() === 'horizontal';
      const along = horizontal ? Math.abs(dx) : Math.abs(dy);
      const across = horizontal ? Math.abs(dy) : Math.abs(dx);
      if (along < DRAG_THRESHOLD) return;
      // Ignore drags that are clearly cross-axis scrolls.
      if (across > along) {
        this.active = false;
        this.teardown();
        return;
      }
      this.dragging = true;
      this.cb.onStart();
    }

    e.preventDefault();
    const horizontal = this.cb.axis() === 'horizontal';
    const coord = this.mainCoord(e);
    const startCoord = horizontal ? this.startX : this.startY;
    const step = this.cb.step() || 1;
    const dir = horizontal && this.cb.rtl() ? -1 : 1;

    // Pixel delta from start, converted to index units. Dragging content left
    // (negative coord delta) should move toward the *next* slide (positive index).
    const totalPx = (coord - startCoord) * dir;
    const deltaIndex = -totalPx / step;

    const t = now();
    const dt = t - this.lastTime || 1;
    this.velocity = (-(coord - this.lastPos) * dir) / step / dt;
    this.lastPos = coord;
    this.lastTime = t;

    this.cb.onMove(deltaIndex);
  };

  private onUp = (e: PointerEvent): void => {
    if (e.pointerId !== this.pointerId) return;
    const wasDragging = this.dragging;
    const horizontal = this.cb.axis() === 'horizontal';
    const dir = horizontal && this.cb.rtl() ? -1 : 1;
    const step = this.cb.step() || 1;
    const totalPx = ((horizontal ? e.clientX : e.clientY) - (horizontal ? this.startX : this.startY)) * dir;
    const deltaIndex = -totalPx / step;
    this.active = false;
    this.dragging = false;
    this.teardown();
    if (wasDragging) this.cb.onEnd(deltaIndex, this.velocity);
  };

  private teardown(): void {
    document.removeEventListener('pointermove', this.onMove);
    document.removeEventListener('pointerup', this.onUp);
    document.removeEventListener('pointercancel', this.onUp);
  }

  destroy(): void {
    this.el.removeEventListener('pointerdown', this.onDown);
    this.teardown();
  }
}
