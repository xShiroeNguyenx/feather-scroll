import type { Effect, EasingFn } from './types';
import { caf, now, raf } from './utils';
import { slide } from './effects/slide';
import { fade } from './effects/fade';

/** Built-in effects shipped with core so it works standalone. */
const registry = new Map<string, Effect>();
export function registerEffect(effect: Effect): void {
  registry.set(effect.name, effect);
}
export function getEffect(name: string): Effect | undefined {
  return registry.get(name);
}
registerEffect(slide);
registerEffect(fade);

export function resolveEffect(effect: Effect | string | undefined): Effect {
  if (!effect) return slide;
  if (typeof effect === 'string') return registry.get(effect) ?? slide;
  return effect;
}

/**
 * Tweens a single scalar (the fractional carousel position) on a rAF loop and
 * invokes `onFrame` each tick. Effects are pure functions of this scalar, so a
 * single animator drives every layout — including mid-drag rendering.
 */
export class Animator {
  position: number;
  private fromPos = 0;
  private toPos = 0;
  private startTime = 0;
  private duration = 0;
  private easing: EasingFn = (t) => t;
  private rafId: number | null = null;
  private onDone: (() => void) | null = null;
  private readonly onFrame: (pos: number, settled: boolean) => void;

  constructor(start: number, onFrame: (pos: number, settled: boolean) => void) {
    this.position = start;
    this.onFrame = onFrame;
  }

  get animating(): boolean {
    return this.rafId !== null;
  }

  /** Jump immediately (used during drag and for instant `to`). */
  set(pos: number): void {
    this.stop();
    this.position = pos;
    this.onFrame(pos, true);
  }

  animateTo(target: number, duration: number, easing: EasingFn, onDone?: () => void): void {
    if (duration <= 0 || this.position === target) {
      this.set(target);
      onDone?.();
      return;
    }
    this.stop();
    this.fromPos = this.position;
    this.toPos = target;
    this.duration = duration;
    this.easing = easing;
    this.startTime = now();
    this.onDone = onDone ?? null;
    this.tick();
  }

  /**
   * Inertial (momentum) scroll from the current position with an initial
   * `velocity` (index units / ms), decaying exponentially. Used by free-mode
   * drag. `bounds` clamps the resting range (null = looping, no bounds).
   */
  decay(
    velocity: number,
    bounds: [number, number] | null,
    onRest?: (pos: number) => void,
  ): void {
    this.stop();
    const DECAY = 0.0028; // per-ms; higher = stops sooner
    const MIN_V = 0.00018; // index/ms threshold to settle
    let v = velocity;
    let last = now();
    const step = (): void => {
      const t = now();
      const dt = Math.min(64, t - last) || 16;
      last = t;
      v *= Math.exp(-DECAY * dt);
      this.position += v * dt;
      let rest = Math.abs(v) < MIN_V;
      if (bounds) {
        if (this.position <= bounds[0]) {
          this.position = bounds[0];
          rest = true;
        } else if (this.position >= bounds[1]) {
          this.position = bounds[1];
          rest = true;
        }
      }
      if (rest) {
        this.rafId = null;
        this.onFrame(this.position, true);
        onRest?.(this.position);
        return;
      }
      this.onFrame(this.position, false);
      this.rafId = raf(step);
    };
    this.rafId = raf(step);
  }

  private tick = (): void => {
    const elapsed = now() - this.startTime;
    const t = Math.min(1, elapsed / this.duration);
    const eased = this.easing(t);
    this.position = this.fromPos + (this.toPos - this.fromPos) * eased;
    if (t >= 1) {
      this.position = this.toPos;
      this.rafId = null;
      this.onFrame(this.position, true);
      const done = this.onDone;
      this.onDone = null;
      done?.();
      return;
    }
    this.onFrame(this.position, false);
    this.rafId = raf(this.tick);
  };

  stop(): void {
    if (this.rafId !== null) {
      caf(this.rafId);
      this.rafId = null;
      this.onDone = null;
    }
  }
}
