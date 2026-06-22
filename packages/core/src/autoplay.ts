import type { AutoplayOptions, CarouselApi } from './types';

/**
 * Autoplay timer with sane pause semantics: hover, focus-within, tab hidden,
 * and (when supported) off-screen via IntersectionObserver.
 */
export class Autoplay {
  private api: CarouselApi;
  private opts: Required<AutoplayOptions>;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private paused = false;
  private stopped = true;
  private io: IntersectionObserver | null = null;
  private visible = true;

  constructor(api: CarouselApi, opts: AutoplayOptions) {
    this.api = api;
    this.opts = {
      delay: opts.delay,
      pauseOnHover: opts.pauseOnHover ?? true,
      pauseOnFocus: opts.pauseOnFocus ?? true,
      stopOnInteraction: opts.stopOnInteraction ?? false,
      direction: opts.direction ?? 'forward',
    };
    this.bind();
  }

  private bind(): void {
    const root = this.api.root;
    if (this.opts.pauseOnHover) {
      root.addEventListener('mouseenter', this.onPause);
      root.addEventListener('mouseleave', this.onResume);
    }
    if (this.opts.pauseOnFocus) {
      root.addEventListener('focusin', this.onPause);
      root.addEventListener('focusout', this.onResume);
    }
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', this.onVisibility);
    }
    if (typeof IntersectionObserver !== 'undefined') {
      this.io = new IntersectionObserver(
        (entries) => {
          this.visible = entries[0]?.isIntersecting ?? true;
          this.reschedule();
        },
        { threshold: 0.1 },
      );
      this.io.observe(root);
    }
    if (this.opts.stopOnInteraction) {
      this.api.on('dragStart', () => this.stop());
    }
  }

  private onPause = (): void => {
    this.paused = true;
    this.clear();
  };
  private onResume = (): void => {
    this.paused = false;
    this.reschedule();
  };
  private onVisibility = (): void => {
    this.visible = !document.hidden;
    this.reschedule();
  };

  private canRun(): boolean {
    return !this.stopped && !this.paused && this.visible;
  }

  private clear(): void {
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  private reschedule(): void {
    this.clear();
    if (!this.canRun()) return;
    this.timer = setTimeout(this.tick, this.opts.delay);
  }

  private tick = (): void => {
    if (!this.canRun()) return;
    if (this.opts.direction === 'forward') this.api.next();
    else this.api.prev();
    this.reschedule();
  };

  start(): void {
    this.stopped = false;
    this.api.emit('autoplayStart');
    this.reschedule();
  }

  stop(): void {
    this.stopped = true;
    this.clear();
    this.api.emit('autoplayStop');
  }

  destroy(): void {
    this.clear();
    this.io?.disconnect();
    const root = this.api.root;
    root.removeEventListener('mouseenter', this.onPause);
    root.removeEventListener('mouseleave', this.onResume);
    root.removeEventListener('focusin', this.onPause);
    root.removeEventListener('focusout', this.onResume);
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', this.onVisibility);
    }
  }
}
