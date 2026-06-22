import type {
  AutoplayOptions,
  CarouselApi,
  EffectContext,
  EventHandler,
  EventName,
  Options,
  ResolvedOptions,
  Size,
} from './types';
import { defaultClasses, defaultNavText, defaultOptions } from './defaults';
import { Emitter } from './events';
import { resolveEasing } from './easing';
import { Animator, resolveEffect } from './effect-engine';
import {
  applyLayout,
  buildStructure,
  layoutGrid,
  measureAutoWidths,
  measureViewport,
  sizeTrackSlides,
  type EffectiveLayout,
  type Structure,
} from './dom';
import { DragController } from './pointer';
import { Autoplay } from './autoplay';
import { ResponsiveManager, resolveBreakpoint } from './responsive';
import { A11y } from './a11y';
import { Controls } from './controls';
import { clamp, isReducedMotion, ringDelta, wrap } from './utils';

export class Carousel implements CarouselApi {
  readonly root: HTMLElement;
  viewport!: HTMLElement;
  track!: HTMLElement;
  slides!: HTMLElement[];
  settings!: ResolvedOptions;

  private options: Options;
  private structure!: Structure;
  private animator!: Animator;
  private emitter = new Emitter();
  private drag?: DragController;
  private autoplayCtl?: Autoplay;
  private responsiveMgr?: ResponsiveManager;
  private a11yMgr?: A11y;
  private controls?: Controls;

  private _index = 0;
  private _itemMain = 0;
  private _perView = 1;
  private _gap = 0;
  private _size: Size = { main: 0, cross: 0 };
  private _offsets?: number[];
  private _contentMain = 0;
  private _cols = 0;
  private _destroyed = false;
  private dragging = false;
  private dragBase = 0;
  private momentumActive = false;
  private native = false;
  private scrollRaf: number | null = null;

  constructor(target: string | HTMLElement, options: Options = {}) {
    const el = typeof target === 'string' ? document.querySelector<HTMLElement>(target) : target;
    if (!el) throw new Error(`[FeatherScroll] target not found: ${String(target)}`);
    this.root = el;
    this.options = options;
    this.init();
  }

  // ── lifecycle ──────────────────────────────────────────────────────────────

  private init(): void {
    this.settings = this.buildSettings();
    const classes = this.settings.classes;

    this.native = this.settings.renderMode === 'native';

    this.structure = buildStructure(this.root, classes);
    this.viewport = this.structure.viewport;
    this.track = this.structure.track;
    this.slides = this.structure.slides;
    if (this.settings.rtl) this.root.classList.add(classes.rtl);
    if (this.native) this.root.classList.add('fs--native');
    if (this.settings.axis === 'vertical') this.root.classList.add('fs--vertical');

    applyLayout(this.root, this.track, this.slides, this.effectiveLayout(), this.settings.axis);

    this._index = clamp(this.settings.startIndex, 0, Math.max(0, this.slides.length - 1));
    this.animator = new Animator(this._index, (pos, settled) => this.onFrame(pos, settled));

    this.measure();
    if (!this.native) this.settings.effect.setup?.(this.context());

    if (this.native) {
      this.viewport.addEventListener('scroll', this.onNativeScroll, { passive: true });
    } else if (this.settings.drag) {
      this.setupDrag();
    }
    if (this.settings.a11y) this.a11yMgr = new A11y(this);
    this.setupControls();
    this.responsiveMgr = new ResponsiveManager(this.root, this.options, () => this.refresh());

    for (const plugin of this.options.plugins ?? []) plugin.init(this);

    this.render();
    if (this.native && this._index > 0) this.scrollToIndex(this._index, false);
    this.setupAutoplay();
    this.emit('init');
  }

  private buildSettings(): ResolvedOptions {
    const o = this.options;
    const width = this.root.getBoundingClientRect().width || 0;
    const bp = resolveBreakpoint(
      {
        items: o.items ?? defaultOptions.items,
        gap: o.gap ?? defaultOptions.gap,
        slideBy: o.slideBy ?? defaultOptions.slideBy,
        center: o.center ?? defaultOptions.center,
        stagePadding: o.stagePadding ?? defaultOptions.stagePadding,
        autoWidth: o.autoWidth ?? defaultOptions.autoWidth,
        grid: o.grid ?? defaultOptions.grid,
      },
      o.responsive,
      width,
    );

    const effect = resolveEffect(o.effect);
    let speed = o.speed ?? defaultOptions.speed;
    const reducedMotion = o.reducedMotion ?? defaultOptions.reducedMotion;
    if (reducedMotion === 'respect' && isReducedMotion()) speed = 0;

    const autoplay: number | AutoplayOptions | false =
      o.autoplay === undefined ? false : o.autoplay;

    return {
      items: effect.perViewDefault ?? bp.items ?? 1,
      gap: bp.gap ?? 0,
      slideBy: bp.slideBy ?? 1,
      center: bp.center ?? false,
      stagePadding: bp.stagePadding ?? 0,
      autoWidth: bp.autoWidth ?? false,
      grid: bp.grid ?? false,
      axis: o.axis ?? defaultOptions.axis,
      loop: o.loop ?? defaultOptions.loop,
      rewind: o.rewind ?? defaultOptions.rewind,
      speed,
      drag: o.drag ?? defaultOptions.drag,
      dragFree: o.dragFree ?? defaultOptions.dragFree,
      startIndex: o.startIndex ?? defaultOptions.startIndex,
      autoplay,
      nav: o.nav ?? defaultOptions.nav,
      navText: o.navText ?? defaultNavText,
      dots: o.dots ?? defaultOptions.dots,
      rtl: o.rtl ?? defaultOptions.rtl,
      a11y: o.a11y ?? defaultOptions.a11y,
      reducedMotion,
      renderMode: o.renderMode ?? defaultOptions.renderMode,
      effect,
      easing: resolveEasing(o.easing),
      classes: { ...defaultClasses, ...o.classes },
    };
  }

  private setupDrag(): void {
    this.drag = new DragController(this.viewport, {
      axis: () => this.settings.axis,
      rtl: () => this.settings.rtl,
      enabled: () => this.settings.drag && !this._destroyed,
      step: () =>
        this.settings.effect.layout === 'stack' ? this._size.main : this._itemMain + this._gap,
      onStart: () => {
        this.dragging = true;
        this.momentumActive = false;
        this.animator.stop();
        this.dragBase = this.animator.position;
        this.root.classList.add(this.settings.classes.dragging);
        this.emit('dragStart');
      },
      onMove: (deltaIndex) => {
        let pos = this.dragBase + deltaIndex;
        pos = this.applyResistance(pos);
        this.animator.set(pos);
        this.emit('dragMove', { position: pos });
      },
      onEnd: (deltaIndex, velocity) => {
        this.dragging = false;
        this.root.classList.remove(this.settings.classes.dragging);
        this.emit('dragEnd');
        if (this.isFree()) {
          // Momentum scroll (product shelf) — inertia, optionally settling on
          // the nearest slide when `dragFree: 'snap'`.
          this.startMomentum(velocity);
          return;
        }
        const projected = this.dragBase + deltaIndex + clamp(velocity * 120, -1, 1);
        this.to(Math.round(projected));
      },
    });
  }

  private setupControls(): void {
    if (!this.settings.nav && !this.settings.dots) return;
    this.controls = new Controls(this, {
      nav: this.settings.nav,
      dots: this.settings.dots,
      navText: this.settings.navText,
      classes: this.settings.classes,
      loop: this.settings.loop,
      pages: () => this.pageCount(),
      pageOf: (i) => Math.round(i / this.stepSize()),
      goToPage: (page) => this.to(page * this.stepSize()),
    });
  }

  private setupAutoplay(): void {
    const ap = this.settings.autoplay;
    if (!ap) return;
    const opts: AutoplayOptions = typeof ap === 'number' ? { delay: ap } : ap;
    this.autoplayCtl = new Autoplay(this, opts);
    // Don't let assistive tech announce auto-advancing slides.
    if (this.settings.a11y) this.viewport.setAttribute('aria-live', 'off');
    this.autoplayCtl.start();
  }

  // ── measuring & rendering ────────────────────────────────────────────────────

  private measure(): void {
    this._perView = this.settings.effect.perViewDefault ?? this.settings.items;
    this._gap = this.settings.gap;
    this._size = measureViewport(this.viewport, this.settings.axis);
    this._offsets = undefined;
    this._contentMain = 0;
    this._cols = 0;

    const grid = this.gridActive();
    const layout = this.effectiveLayout();
    if (grid) {
      const { colMain, cols } = layoutGrid(
        this.track,
        this.slides,
        this._size,
        this._perView,
        this._gap,
        grid.rows,
        this.settings.axis,
        this.settings.stagePadding,
      );
      this._itemMain = colMain;
      this._cols = cols;
    } else if (this.autoWidthActive()) {
      const { offsets, contentMain } = measureAutoWidths(this.slides, this._gap, this.settings.axis);
      this._offsets = offsets;
      this._contentMain = contentMain;
      const avg = this.slides.length ? contentMain / this.slides.length - this._gap : 0;
      this._itemMain = avg > 0 ? avg : this._size.main;
    } else if (layout === 'track' || layout === 'track-loop') {
      this._itemMain = sizeTrackSlides(
        this.slides,
        this._size,
        this._perView,
        this._gap,
        this.settings.axis,
        this.settings.stagePadding,
        layout === 'track-loop',
      );
    } else {
      this._itemMain = this._size.main;
    }
  }

  /** Grid layout is opt-in and only valid for the bounded track path. */
  private gridActive(): { rows: number; fill?: 'row' | 'column' } | null {
    const g = this.settings.grid;
    if (!g || g.rows < 2) return null;
    if (this.native || this.settings.loop) return null;
    if (this.settings.effect.layout !== 'track') return null;
    return g;
  }

  private autoWidthActive(): boolean {
    return (
      this.settings.autoWidth &&
      !this.native &&
      !this.settings.loop &&
      !this.gridActive() &&
      this.settings.effect.layout === 'track'
    );
  }

  private context(): EffectContext {
    return {
      carousel: this,
      root: this.root,
      viewport: this.viewport,
      track: this.track,
      slides: this.slides,
      total: this.slides.length,
      position: this.animator.position,
      index: this._index,
      perView: this._perView,
      gap: this._gap,
      size: this._size,
      itemMain: this._itemMain,
      axis: this.settings.axis,
      rtl: this.settings.rtl,
      loop: this.settings.loop,
      settings: this.settings,
      offsets: this._offsets,
      contentMain: this._offsets ? this._contentMain : undefined,
      setTransform: (el, value) => {
        el.style.transform = value;
      },
      setStyle: (el, prop, value) => {
        (el.style as unknown as Record<string, string>)[prop] = value;
      },
    };
  }

  private onFrame(pos: number, settled: boolean): void {
    // Free scroll / momentum: keep the logical index (and dots/classes/events)
    // tracking the live fractional position as it crosses slide boundaries.
    if (this.momentumActive || (this.dragging && this.isFree())) {
      this.commitIndex(this.indexFromPos(pos));
    }
    this.render();
    this.emit('scroll', { position: pos, progress: this.progress });
    if (settled && !this.dragging) {
      this.emit('transitionEnd');
      this.emit('changed');
    }
  }

  private isFree(): boolean {
    return !!this.settings.dragFree && !this.native && this.settings.effect.layout === 'track';
  }

  private indexFromPos(pos: number): number {
    if (this.settings.loop) return wrap(Math.round(pos), this.slides.length);
    return clamp(Math.round(pos), 0, this.maxIndex());
  }

  /** Update the logical index and fire change events when it actually moves. */
  private commitIndex(target: number): void {
    if (target === this._index) return;
    const previous = this._index;
    this._index = target;
    this.emit('beforeChange', { previousIndex: previous });
    this.emit('change', { previousIndex: previous });
  }

  private startMomentum(velocity: number): void {
    const snap = this.settings.dragFree === 'snap';
    const bounds: [number, number] | null = this.settings.loop ? null : [0, this.maxIndex()];
    this.momentumActive = true;
    this.animator.decay(velocity, bounds, (pos) => {
      this.momentumActive = false;
      if (snap) {
        this.to(this.indexFromPos(pos));
        return;
      }
      this.commitIndex(this.indexFromPos(pos));
      if (this.settings.loop) {
        this.animator.position = wrap(this.animator.position, this.slides.length);
        this.render();
      }
      this.emit('transitionEnd');
      this.emit('changed');
    });
  }

  private render(): void {
    if (!this.native) {
      this.settings.effect.render(this.context());
    }
    this.updateClasses();
    this.controls?.update();
    this.a11yMgr?.update();
  }

  // ── native scroll-snap mode ──────────────────────────────────────────────────

  private scrollToIndex(i: number, smooth: boolean): void {
    const step = this._itemMain + this._gap;
    const target = i * step;
    const behavior: ScrollBehavior = smooth ? 'smooth' : 'auto';
    if (this.settings.axis === 'horizontal') this.viewport.scrollTo({ left: target, behavior });
    else this.viewport.scrollTo({ top: target, behavior });
  }

  private onNativeScroll = (): void => {
    if (this.scrollRaf !== null) return;
    this.scrollRaf = requestAnimationFrame(() => {
      this.scrollRaf = null;
      const step = this._itemMain + this._gap || 1;
      const scrollPos =
        this.settings.axis === 'horizontal' ? this.viewport.scrollLeft : this.viewport.scrollTop;
      const idx = clamp(Math.round(scrollPos / step), 0, this.maxIndex());
      this.animator.position = idx;
      if (idx !== this._index) {
        const previous = this._index;
        this._index = idx;
        this.emit('change', { previousIndex: previous });
        this.emit('changed', { previousIndex: previous });
      }
      this.updateClasses();
      this.controls?.update();
      this.a11yMgr?.update();
    });
  };

  private updateClasses(): void {
    const { slideActive, slideVisible } = this.settings.classes;
    const n = this.slides.length;
    const pos = this.animator.position;
    const active = this.settings.loop ? wrap(Math.round(pos), n) : Math.round(pos);
    const first = Math.floor(pos);
    const last = first + this._perView - 1;
    this.slides.forEach((slide, i) => {
      slide.classList.toggle(slideActive, i === active);
      const visible = this.settings.loop
        ? Math.abs(ringDelta(pos, i, n)) < this._perView
        : i >= first && i <= last;
      slide.classList.toggle(slideVisible, visible);
    });
  }

  // ── bounds helpers ───────────────────────────────────────────────────────────

  private effectiveLayout(): EffectiveLayout {
    if (this.native) return 'track';
    if (this.settings.loop && this.settings.effect.layout === 'track') return 'track-loop';
    return this.settings.effect.layout;
  }

  private maxIndex(): number {
    const total = this.slides.length;
    if (this.gridActive()) return Math.max(0, this._cols - this._perView);
    if (this._offsets) return this.autoMaxIndex();
    if (this.settings.loop) return Math.max(0, total - 1);
    if (this.settings.effect.layout === 'stack') return Math.max(0, total - 1);
    if (this.settings.center) return Math.max(0, total - 1);
    return Math.max(0, total - this._perView);
  }

  /** Last reachable slide in autoWidth mode = first whose start reaches the end. */
  private autoMaxIndex(): number {
    const offsets = this._offsets!;
    const maxScroll = Math.max(0, this._contentMain - this._size.main);
    for (let i = 0; i < offsets.length; i++) {
      if (offsets[i]! >= maxScroll) return i;
    }
    return Math.max(0, offsets.length - 1);
  }

  private stepSize(): number {
    const s = this.settings.slideBy;
    return s === 'page' ? this._perView : Math.max(1, s);
  }

  private pageCount(): number {
    return Math.floor(this.maxIndex() / this.stepSize()) + 1;
  }

  private applyResistance(pos: number): number {
    if (this.settings.loop) return pos;
    const max = this.maxIndex();
    if (pos < 0) return pos * 0.3;
    if (pos > max) return max + (pos - max) * 0.3;
    return pos;
  }

  // ── public API ───────────────────────────────────────────────────────────────

  get index(): number {
    return this._index;
  }
  get position(): number {
    return this.animator.position;
  }
  get length(): number {
    return this.slides.length;
  }
  get progress(): number {
    const max = this.maxIndex();
    return max > 0 ? clamp(this.animator.position / max, 0, 1) : 0;
  }
  /** Length (px) of one step along the main axis (itemMain + gap). */
  get itemSize(): number {
    return this._itemMain + this._gap;
  }
  /** Total scrollable content length (px) along the main axis. */
  get contentSize(): number {
    if (this._offsets) return this._contentMain;
    const units = this.gridActive() ? this._cols : this.slides.length;
    return Math.max(0, units * (this._itemMain + this._gap) - this._gap);
  }

  /** Move to a fractional position (free scroll). Wraps when looping. */
  scrollTo(position: number, animate = false): void {
    if (this._destroyed || this.native) return;
    this.momentumActive = false;
    this.animator.stop();
    const n = this.slides.length;
    const pos = this.settings.loop ? wrap(position, n) : clamp(position, 0, this.maxIndex());
    this.commitIndex(this.indexFromPos(pos));
    if (animate) this.animator.animateTo(pos, this.settings.speed, this.settings.easing);
    else this.animator.set(pos);
  }

  /** Move by a fractional delta (free scroll). */
  scrollBy(delta: number, animate = false): void {
    this.scrollTo(this.animator.position + delta, animate);
  }

  /** Move to a progress ratio 0→1. */
  scrollToProgress(progress: number, animate = false): void {
    this.scrollTo(clamp(progress, 0, 1) * this.maxIndex(), animate);
  }

  to(index: number, opts: { animate?: boolean } = {}): void {
    if (this._destroyed) return;
    this.momentumActive = false;
    const max = this.maxIndex();
    let target = index;
    if (this.settings.loop) {
      target = wrap(index, this.slides.length);
    } else if (this.settings.rewind) {
      if (index > max) target = 0;
      else if (index < 0) target = max;
    } else {
      target = clamp(index, 0, max);
    }

    const previous = this._index;
    const animate = opts.animate ?? true;

    if (this.native) {
      this._index = target;
      if (target !== previous) {
        this.emit('beforeChange', { previousIndex: previous });
        this.emit('change', { previousIndex: previous });
      }
      this.scrollToIndex(target, animate);
      return;
    }

    if (target === previous && !this.dragging && this.animator.position === target) {
      // Still settle position (e.g. after a small drag that didn't change index).
      this.animator.animateTo(target, this.settings.speed, this.settings.easing);
      return;
    }

    this._index = target;
    this.emit('beforeChange', { previousIndex: previous });
    this.emit('change', { previousIndex: previous });
    this.emit('transitionStart');

    const duration = animate ? this.settings.speed : 0;
    if (this.settings.loop) {
      // Animate along the shortest ring path, then silently reseat position
      // into [0, n) so it never drifts unbounded.
      const n = this.slides.length;
      const dest = this.animator.position + ringDelta(this.animator.position, target, n);
      this.animator.animateTo(dest, duration, this.settings.easing, () => {
        this.animator.position = wrap(this.animator.position, n);
        this.render();
      });
    } else {
      this.animator.animateTo(target, duration, this.settings.easing);
    }
  }

  next(): void {
    this.to(this._index + this.stepSize());
  }
  prev(): void {
    this.to(this._index - this.stepSize());
  }
  play(): void {
    this.autoplayCtl?.start();
  }
  stop(): void {
    this.autoplayCtl?.stop();
  }

  refresh(): void {
    if (this._destroyed) return;
    const prevIndex = this._index;
    this.settings = this.buildSettings();
    applyLayout(this.root, this.track, this.slides, this.effectiveLayout(), this.settings.axis);
    this.measure();
    this._index = clamp(prevIndex, 0, this.maxIndex());
    this.animator.set(this._index);
    this.emit('resize');
    this.emit('update');
  }

  destroy(): void {
    if (this._destroyed) return;
    this._destroyed = true;
    this.emit('destroy');
    this.animator.stop();
    if (this.scrollRaf !== null) cancelAnimationFrame(this.scrollRaf);
    if (this.native) this.viewport.removeEventListener('scroll', this.onNativeScroll);
    this.drag?.destroy();
    this.autoplayCtl?.destroy();
    this.responsiveMgr?.destroy();
    this.a11yMgr?.destroy();
    this.controls?.destroy();
    this.settings.effect.teardown?.(this.context());
    for (const plugin of this.options.plugins ?? []) plugin.destroy?.();
    this.structure.restore();
    this.emitter.clear();
  }

  // ── events ────────────────────────────────────────────────────────────────────

  on(event: EventName, handler: EventHandler): () => void {
    return this.emitter.on(event, handler);
  }
  off(event: EventName, handler: EventHandler): void {
    this.emitter.off(event, handler);
  }
  emit(event: EventName, extra: Record<string, unknown> = {}): void {
    this.emitter.emit(event, {
      carousel: this,
      index: this._index,
      previousIndex: this._index,
      ...extra,
    });
  }
}
