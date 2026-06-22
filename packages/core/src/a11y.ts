import type { CarouselApi } from './types';

/** ARIA roles, labels and keyboard navigation (WCAG 2.1 carousel pattern). */
export class A11y {
  private api: CarouselApi;

  constructor(api: CarouselApi) {
    this.api = api;
    const { root, viewport, slides } = api;
    root.setAttribute('role', 'region');
    root.setAttribute('aria-roledescription', 'carousel');
    if (!root.getAttribute('aria-label')) root.setAttribute('aria-label', 'carousel');
    viewport.setAttribute('tabindex', '0');
    viewport.setAttribute('aria-live', 'polite');

    slides.forEach((slide, i) => {
      slide.setAttribute('role', 'group');
      slide.setAttribute('aria-roledescription', 'slide');
      slide.setAttribute('aria-label', `${i + 1} of ${slides.length}`);
    });

    viewport.addEventListener('keydown', this.onKey);
    this.update();
  }

  private onKey = (e: KeyboardEvent): void => {
    const horizontal = this.api.settings.axis === 'horizontal';
    const next = horizontal ? 'ArrowRight' : 'ArrowDown';
    const prev = horizontal ? 'ArrowLeft' : 'ArrowUp';
    if (e.key === next) {
      e.preventDefault();
      this.api.next();
    } else if (e.key === prev) {
      e.preventDefault();
      this.api.prev();
    } else if (e.key === 'Home') {
      e.preventDefault();
      this.api.to(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      this.api.to(this.api.length - 1);
    }
  };

  /** Reflect the active slide for assistive tech. */
  update(): void {
    const active = this.api.index;
    this.api.slides.forEach((slide, i) => {
      const isActive = i === active;
      slide.setAttribute('aria-hidden', isActive ? 'false' : 'true');
    });
  }

  destroy(): void {
    this.api.viewport.removeEventListener('keydown', this.onKey);
  }
}
