import {
  createElement,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  type CSSProperties,
  type ReactNode,
  type Ref,
} from 'react';
import { Carousel, type CarouselApi, type Options } from '@feather-scroll/core';

export interface FeatherScrollProps extends Options {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** Controlled active index — when it changes, the carousel navigates to it. */
  index?: number;
  onChange?: (index: number) => void;
}

/**
 * React wrapper. Use the forwarded ref to reach the carousel API:
 *   const ref = useRef<CarouselApi>(null);
 *   <FeatherScroll ref={ref} effect={coverflow} loop>{slides}</FeatherScroll>
 */
export const FeatherScroll = forwardRef(function FeatherScroll(
  props: FeatherScrollProps,
  ref: Ref<CarouselApi | null>,
) {
  const { children, className, style, index, onChange, ...options } = props;
  const elRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<Carousel | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!elRef.current) return;
    const c = new Carousel(elRef.current, options as Options);
    apiRef.current = c;
    const off = c.on('change', (p) => onChangeRef.current?.(p.index));
    return () => {
      off();
      c.destroy();
      apiRef.current = null;
    };
    // Mount once; option changes after mount should be handled via the ref API.
  }, []);

  useEffect(() => {
    if (typeof index === 'number') apiRef.current?.to(index);
  }, [index]);

  useImperativeHandle(ref, () => apiRef.current, []);

  return createElement('div', { ref: elRef, className, style }, children);
});
