import { Carousel, type Options } from '@feather-scroll/core';
import { effects } from '@feather-scroll/effects';

const BOOL_ATTRS = ['loop', 'nav', 'dots', 'rtl', 'center', 'rewind'] as const;
const NUM_ATTRS = ['items', 'gap', 'speed', 'start-index', 'stage-padding'] as const;

function parseOptions(el: HTMLElement): Options {
  const opts: Options = {};
  const effectName = el.getAttribute('effect');
  if (effectName && effects[effectName]) opts.effect = effects[effectName];

  for (const attr of BOOL_ATTRS) {
    if (el.hasAttribute(attr)) (opts as Record<string, unknown>)[camel(attr)] = true;
  }
  for (const attr of NUM_ATTRS) {
    const v = el.getAttribute(attr);
    if (v != null) (opts as Record<string, unknown>)[camel(attr)] = Number(v);
  }
  const autoplay = el.getAttribute('autoplay');
  if (autoplay != null) opts.autoplay = { delay: Number(autoplay) || 3000 };
  const easing = el.getAttribute('easing');
  if (easing) opts.easing = easing as Options['easing'];
  const axis = el.getAttribute('axis');
  if (axis === 'vertical') opts.axis = 'vertical';
  return opts;
}

const camel = (s: string): string => s.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());

/**
 * `<feather-scroll effect="coverflow" items="3" loop autoplay="3000" nav dots>`
 * Its direct element children become the slides.
 */
export class FeatherScrollElement extends HTMLElement {
  static get observedAttributes(): string[] {
    return ['effect', ...BOOL_ATTRS, ...NUM_ATTRS, 'autoplay', 'easing', 'axis'];
  }

  private instance: Carousel | null = null;

  /** Access the underlying carousel instance. */
  get carousel(): Carousel | null {
    return this.instance;
  }

  connectedCallback(): void {
    // Defer so slotted children are parsed.
    queueMicrotask(() => this.mount());
  }

  disconnectedCallback(): void {
    this.instance?.destroy();
    this.instance = null;
  }

  attributeChangedCallback(): void {
    if (this.instance) {
      this.instance.destroy();
      this.mount();
    }
  }

  private mount(): void {
    if (this.instance || this.children.length === 0) return;
    this.instance = new Carousel(this, parseOptions(this));
  }
}

export function defineFeatherScroll(tag = 'feather-scroll'): void {
  if (typeof customElements !== 'undefined' && !customElements.get(tag)) {
    customElements.define(tag, FeatherScrollElement);
  }
}
