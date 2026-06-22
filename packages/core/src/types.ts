/**
 * Public type surface for FeatherScroll core.
 * Effects and plugins depend ONLY on these types (no runtime import of Carousel),
 * which keeps the dependency graph acyclic and the bundle tree-shakeable.
 */

export type Axis = 'horizontal' | 'vertical';

export type EasingFn = (t: number) => number;
export type EasingName =
  | 'linear'
  | 'ease'
  | 'easeIn'
  | 'easeOut'
  | 'easeInOut'
  | 'spring'
  | 'bounce'
  | 'elastic'
  | 'back';

export interface AutoplayOptions {
  /** Milliseconds between advances. */
  delay: number;
  pauseOnHover?: boolean;
  pauseOnFocus?: boolean;
  /** Stop autoplay permanently after the user interacts (drag/nav). */
  stopOnInteraction?: boolean;
  direction?: 'forward' | 'backward';
}

/** Options that can vary per responsive breakpoint. */
export interface BreakpointOptions {
  /** Slides visible per view. */
  items: number;
  /** Gap between slides in px. */
  gap: number;
  /** How many slides a single nav/swipe advances. `'page'` = items. */
  slideBy: number | 'page';
  /** Center the active slide (peek neighbours on both sides). */
  center: boolean;
  /** Extra padding (px) on both ends of the viewport (owl `stagePadding`). */
  stagePadding: number;
  /**
   * Let each slide size to its own content instead of `viewport / items`
   * (owl/Splide `autoWidth`, Swiper `slidesPerView:'auto'`). Track layout only.
   */
  autoWidth: boolean;
  /** Lay slides out in a multi-row grid that pages horizontally. */
  grid: GridOptions | false;
}

/** Multi-row grid layout (Swiper `grid`, Splide `Grid`). Track + non-loop. */
export interface GridOptions {
  /** Number of rows per column/page. */
  rows: number;
  /** `'column'` fills top→bottom then next column (default); `'row'` left→right. */
  fill?: 'row' | 'column';
}

export interface ClassNames {
  root: string;
  viewport: string;
  track: string;
  slide: string;
  slideActive: string;
  slideVisible: string;
  nav: string;
  navPrev: string;
  navNext: string;
  navDisabled: string;
  dots: string;
  dot: string;
  dotActive: string;
  rtl: string;
  dragging: string;
  animating: string;
}

export interface Options extends Partial<BreakpointOptions> {
  /** Effect instance or a registered effect name. Defaults to the built-in `slide`. */
  effect?: Effect | string;
  axis?: Axis;
  loop?: boolean;
  /** When not looping, jump back to start at the end (and vice-versa). */
  rewind?: boolean;
  /** Transition duration in ms. */
  speed?: number;
  easing?: EasingName | EasingFn;
  drag?: boolean;
  /**
   * Free, momentum-based dragging (no hard snap) — for product shelves.
   * `true` = pure free scroll with inertia; `'snap'` = inertia then settle on
   * the nearest slide. Track layout only (banner/stack effects keep hard snap).
   */
  dragFree?: boolean | 'snap';
  startIndex?: number;
  autoplay?: number | AutoplayOptions | false;
  nav?: boolean;
  navText?: [string, string];
  dots?: boolean;
  rtl?: boolean;
  responsive?: Record<number, Partial<BreakpointOptions>>;
  /** Enable ARIA/keyboard support. Default true. */
  a11y?: boolean;
  /** How to treat `prefers-reduced-motion`. Default `'respect'`. */
  reducedMotion?: 'respect' | 'ignore';
  renderMode?: 'transform' | 'native';
  plugins?: Plugin[];
  classes?: Partial<ClassNames>;
}

/** Fully-resolved options after merging defaults + active breakpoint. */
export interface ResolvedOptions
  extends Required<Omit<Options, 'responsive' | 'plugins' | 'classes' | 'effect' | 'easing'>> {
  effect: Effect;
  easing: EasingFn;
  classes: ClassNames;
}

export interface Size {
  /** Length along the scroll axis. */
  main: number;
  /** Length across the scroll axis. */
  cross: number;
}

export interface EffectContext {
  carousel: CarouselApi;
  root: HTMLElement;
  viewport: HTMLElement;
  track: HTMLElement;
  slides: HTMLElement[];
  /** Number of real slides (excludes loop clones). */
  total: number;
  /** Fractional current position (e.g. 1.5 = halfway between slide 1 and 2). */
  position: number;
  /** Target integer index the carousel is settling to. */
  index: number;
  perView: number;
  gap: number;
  /** Viewport size. */
  size: Size;
  /** Size of a single item along the main axis (excluding gap). */
  itemMain: number;
  axis: Axis;
  rtl: boolean;
  loop: boolean;
  settings: ResolvedOptions;
  /**
   * Cumulative leading-edge offset (px) of each slide, present only in
   * `autoWidth` track mode. When set, the `slide` effect positions by these
   * variable offsets instead of `position * (itemMain + gap)`.
   */
  offsets?: number[];
  /** Total content length (px) along the main axis (autoWidth track mode). */
  contentMain?: number;
  /** Apply a transform (writes are batched by the engine). */
  setTransform(el: HTMLElement, value: string): void;
  setStyle(el: HTMLElement, prop: string, value: string): void;
}

export interface Effect {
  name: string;
  /**
   * `track` — slides laid out in a row, the engine moves one track element.
   * `stack` — slides stacked (absolute), each transformed individually.
   */
  layout: 'track' | 'stack';
  mode?: 'transform' | 'css';
  /** Force a default items-per-view (e.g. fade/cube imply 1). */
  perViewDefault?: number;
  setup?(ctx: EffectContext): void;
  render(ctx: EffectContext): void;
  teardown?(ctx: EffectContext): void;
}

export interface Plugin {
  name: string;
  init(carousel: CarouselApi): void;
  destroy?(): void;
}

export type EventName =
  | 'init'
  | 'beforeChange'
  | 'change'
  | 'changed'
  | 'dragStart'
  | 'dragMove'
  | 'dragEnd'
  | 'transitionStart'
  | 'transitionEnd'
  /** Fired each animation/drag frame while the position changes (free scroll, momentum, tween). */
  | 'scroll'
  | 'resize'
  | 'autoplayStart'
  | 'autoplayStop'
  | 'update'
  | 'destroy';

export interface EventPayload {
  carousel: CarouselApi;
  index: number;
  previousIndex: number;
  [key: string]: unknown;
}

export type EventHandler = (payload: EventPayload) => void;

/** The public, stable API surface exposed to plugins and effects. */
export interface CarouselApi {
  readonly root: HTMLElement;
  readonly viewport: HTMLElement;
  readonly track: HTMLElement;
  readonly slides: HTMLElement[];
  readonly index: number;
  readonly position: number;
  readonly length: number;
  /** Scroll progress along the track, 0→1. */
  readonly progress: number;
  /** Length (px) of one slide step (itemMain + gap) — for px↔index conversions. */
  readonly itemSize: number;
  /** Total scrollable content length (px) along the main axis. */
  readonly contentSize: number;
  readonly settings: ResolvedOptions;
  next(): void;
  prev(): void;
  to(index: number, options?: { animate?: boolean }): void;
  /** Move to a fractional position (free scroll). Wraps when looping. */
  scrollTo(position: number, animate?: boolean): void;
  /** Move by a fractional delta (free scroll). */
  scrollBy(delta: number, animate?: boolean): void;
  /** Move to a progress ratio 0→1. */
  scrollToProgress(progress: number, animate?: boolean): void;
  play(): void;
  stop(): void;
  refresh(): void;
  destroy(): void;
  on(event: EventName, handler: EventHandler): () => void;
  off(event: EventName, handler: EventHandler): void;
  emit(event: EventName, extra?: Record<string, unknown>): void;
}
