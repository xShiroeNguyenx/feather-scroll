import type { BreakpointOptions, Options } from './types';

/** Merge base options with the highest matching min-width breakpoint. */
export function resolveBreakpoint(
  base: Partial<BreakpointOptions>,
  responsive: Record<number, Partial<BreakpointOptions>> | undefined,
  width: number,
): Partial<BreakpointOptions> {
  if (!responsive) return base;
  const merged: Partial<BreakpointOptions> = { ...base };
  const breakpoints = Object.keys(responsive)
    .map(Number)
    .filter((n) => !Number.isNaN(n))
    .sort((a, b) => a - b);
  for (const bp of breakpoints) {
    if (width >= bp) Object.assign(merged, responsive[bp]);
  }
  return merged;
}

/** Watches the root's width and fires `onChange` when the active breakpoint flips. */
export class ResponsiveManager {
  private ro: ResizeObserver | null = null;
  private lastBp = -1;
  private onChange: () => void;
  private el: HTMLElement;
  private breakpoints: number[];

  constructor(el: HTMLElement, options: Options, onChange: () => void) {
    this.el = el;
    this.onChange = onChange;
    this.breakpoints = Object.keys(options.responsive ?? {})
      .map(Number)
      .filter((n) => !Number.isNaN(n))
      .sort((a, b) => a - b);

    if (typeof ResizeObserver !== 'undefined') {
      this.ro = new ResizeObserver(() => this.check());
      this.ro.observe(el);
    } else if (typeof window !== 'undefined') {
      window.addEventListener('resize', this.check);
    }
    this.lastBp = this.activeBreakpoint();
  }

  private activeBreakpoint(): number {
    const width = this.el.getBoundingClientRect().width || 0;
    let active = 0;
    for (const bp of this.breakpoints) if (width >= bp) active = bp;
    return active;
  }

  private check = (): void => {
    const bp = this.activeBreakpoint();
    if (bp !== this.lastBp) {
      this.lastBp = bp;
    }
    // Always notify: a width change may need re-measuring even within a breakpoint.
    this.onChange();
  };

  destroy(): void {
    this.ro?.disconnect();
    if (typeof window !== 'undefined') window.removeEventListener('resize', this.check);
  }
}
