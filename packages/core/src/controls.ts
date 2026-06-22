import type { CarouselApi, ClassNames } from './types';

export interface ControlsConfig {
  nav: boolean;
  dots: boolean;
  navText: [string, string];
  classes: ClassNames;
  /** Number of navigable pages (for dots). */
  pages: () => number;
  /** Page index for the current slide index. */
  pageOf: (index: number) => number;
  /** Navigate to a page (dots). */
  goToPage: (page: number) => void;
  loop: boolean;
}

/** Builds and syncs prev/next buttons and pagination dots. */
export class Controls {
  private api: CarouselApi;
  private cfg: ControlsConfig;
  private prevBtn?: HTMLButtonElement;
  private nextBtn?: HTMLButtonElement;
  private dotsWrap?: HTMLElement;
  private dotEls: HTMLButtonElement[] = [];

  constructor(api: CarouselApi, cfg: ControlsConfig) {
    this.api = api;
    this.cfg = cfg;
    if (cfg.nav) this.buildNav();
    if (cfg.dots) this.buildDots();
    this.update();
  }

  private buildNav(): void {
    const { classes, navText } = this.cfg;
    const prev = document.createElement('button');
    prev.type = 'button';
    prev.className = `${classes.nav} ${classes.navPrev}`;
    prev.innerHTML = navText[0];
    prev.setAttribute('aria-label', 'Previous slide');
    prev.addEventListener('click', () => this.api.prev());

    const next = document.createElement('button');
    next.type = 'button';
    next.className = `${classes.nav} ${classes.navNext}`;
    next.innerHTML = navText[1];
    next.setAttribute('aria-label', 'Next slide');
    next.addEventListener('click', () => this.api.next());

    this.api.root.appendChild(prev);
    this.api.root.appendChild(next);
    this.prevBtn = prev;
    this.nextBtn = next;
  }

  private buildDots(): void {
    const { classes } = this.cfg;
    const wrap = document.createElement('div');
    wrap.className = classes.dots;
    wrap.setAttribute('role', 'tablist');
    const pages = this.cfg.pages();
    for (let i = 0; i < pages; i++) {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = classes.dot;
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
      const page = i;
      dot.addEventListener('click', () => this.cfg.goToPage(page));
      wrap.appendChild(dot);
      this.dotEls.push(dot);
    }
    this.api.root.appendChild(wrap);
    this.dotsWrap = wrap;
  }

  update(): void {
    const { classes } = this.cfg;
    const idx = this.api.index;

    if (this.dotEls.length) {
      const activePage = this.cfg.pageOf(idx);
      this.dotEls.forEach((dot, i) => {
        const active = i === activePage;
        dot.classList.toggle(classes.dotActive, active);
        dot.setAttribute('aria-selected', active ? 'true' : 'false');
      });
    }

    if (this.prevBtn && this.nextBtn && !this.cfg.loop) {
      // Page-based so multi-item (`items > 1`) disables `next` at the last
      // reachable page, not only when the active slide is the very last one.
      const page = this.cfg.pageOf(idx);
      const atStart = page <= 0;
      const atEnd = page >= this.cfg.pages() - 1;
      this.prevBtn.classList.toggle(classes.navDisabled, atStart);
      this.nextBtn.classList.toggle(classes.navDisabled, atEnd);
      this.prevBtn.disabled = atStart;
      this.nextBtn.disabled = atEnd;
    }
  }

  destroy(): void {
    this.prevBtn?.remove();
    this.nextBtn?.remove();
    this.dotsWrap?.remove();
    this.dotEls = [];
  }
}
