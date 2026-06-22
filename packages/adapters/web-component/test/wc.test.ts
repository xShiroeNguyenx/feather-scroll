import { afterEach, describe, expect, it } from 'vitest';
import { defineFeatherScroll, FeatherScrollElement } from '../src/index';

defineFeatherScroll();

afterEach(() => {
  document.body.innerHTML = '';
});

describe('<feather-scroll> web component', () => {
  it('registers the custom element', () => {
    expect(customElements.get('feather-scroll')).toBe(FeatherScrollElement);
  });

  it('mounts a carousel from attributes and children', async () => {
    const el = document.createElement('feather-scroll') as FeatherScrollElement;
    el.setAttribute('effect', 'fade');
    el.setAttribute('nav', '');
    el.setAttribute('dots', '');
    el.innerHTML = '<div>1</div><div>2</div><div>3</div>';
    document.body.appendChild(el);

    await Promise.resolve(); // flush queueMicrotask in connectedCallback

    expect(el.querySelector('.fs__viewport')).toBeTruthy();
    expect(el.querySelector('.fs__dot')).toBeTruthy();
    expect(el.carousel).not.toBeNull();
    expect(el.carousel!.length).toBe(3);
  });

  it('destroys on disconnect', async () => {
    const el = document.createElement('feather-scroll') as FeatherScrollElement;
    el.innerHTML = '<div>1</div><div>2</div>';
    document.body.appendChild(el);
    await Promise.resolve();
    expect(el.carousel).not.toBeNull();
    el.remove();
    expect(el.carousel).toBeNull();
  });
});
