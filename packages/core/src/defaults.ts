import type { ClassNames, Options } from './types';

export const defaultClasses: ClassNames = {
  root: 'fs',
  viewport: 'fs__viewport',
  track: 'fs__track',
  slide: 'fs__slide',
  slideActive: 'is-active',
  slideVisible: 'is-visible',
  nav: 'fs__nav',
  navPrev: 'fs__nav--prev',
  navNext: 'fs__nav--next',
  navDisabled: 'is-disabled',
  dots: 'fs__dots',
  dot: 'fs__dot',
  dotActive: 'is-active',
  rtl: 'fs--rtl',
  dragging: 'is-dragging',
  animating: 'is-animating',
};

export const defaultOptions: Required<
  Pick<
    Options,
    | 'items'
    | 'gap'
    | 'slideBy'
    | 'center'
    | 'stagePadding'
    | 'autoWidth'
    | 'grid'
    | 'axis'
    | 'loop'
    | 'rewind'
    | 'speed'
    | 'drag'
    | 'dragFree'
    | 'startIndex'
    | 'nav'
    | 'dots'
    | 'rtl'
    | 'a11y'
    | 'reducedMotion'
    | 'renderMode'
  >
> = {
  items: 1,
  gap: 0,
  slideBy: 1,
  center: false,
  stagePadding: 0,
  autoWidth: false,
  grid: false,
  axis: 'horizontal',
  loop: false,
  rewind: false,
  speed: 400,
  drag: true,
  dragFree: false,
  startIndex: 0,
  nav: false,
  dots: false,
  rtl: false,
  a11y: true,
  reducedMotion: 'respect',
  renderMode: 'transform',
};

export const defaultNavText: [string, string] = [
  '<span aria-hidden="true">‹</span>',
  '<span aria-hidden="true">›</span>',
];
