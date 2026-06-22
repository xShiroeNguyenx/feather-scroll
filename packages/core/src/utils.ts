export const clamp = (v: number, min: number, max: number): number =>
  v < min ? min : v > max ? max : v;

/** Wrap an index into [0, length) — used for loop/rewind. */
export const wrap = (i: number, length: number): number => ((i % length) + length) % length;

export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

/** Shortest signed distance from `from` to `to` on a ring of size `length`. */
export function ringDelta(from: number, to: number, length: number): number {
  let d = (to - from) % length;
  if (d > length / 2) d -= length;
  if (d < -length / 2) d += length;
  return d;
}

export const isReducedMotion = (): boolean =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let raf: typeof requestAnimationFrame;
let caf: typeof cancelAnimationFrame;
if (typeof requestAnimationFrame === 'function') {
  raf = requestAnimationFrame.bind(globalThis);
  caf = cancelAnimationFrame.bind(globalThis);
} else {
  // SSR / jsdom fallback.
  raf = ((cb: FrameRequestCallback) => setTimeout(() => cb(16), 16) as unknown as number) as typeof requestAnimationFrame;
  caf = ((id: number) => clearTimeout(id)) as typeof cancelAnimationFrame;
}
export { raf, caf };

export function now(): number {
  return typeof performance !== 'undefined' ? performance.now() : Date.now();
}
