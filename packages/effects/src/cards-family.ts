import type { Effect } from '@feather-scroll/core';
import { clamp, stackEffect, type SlideStyle } from './_helpers';

/**
 * Cards / stack family (10). The active card sits on top; upcoming cards are
 * stacked behind it; the leaving card (d<0) flies off while staying on top.
 */

const behindZ = (d: number): number => Math.round(100 - d * 10);
const leaveZ = 200;
const opacity = (d: number): number => (d < 0 ? clamp(1 + d, 0, 1) : clamp(1.6 - d, 0, 1));

function cards(name: string, behind: (d: number) => string, leave: (d: number) => string): Effect {
  return stackEffect(
    name,
    (d): SlideStyle =>
      d < 0
        ? { transform: leave(d), zIndex: leaveZ, opacity: opacity(d) }
        : { transform: behind(d), zIndex: behindZ(d), opacity: opacity(d) },
    { cull: 4, perspective: 1200 },
  );
}

export const stackTinder = cards(
  'stack-tinder',
  (d) => `translateY(${d * 7}%) scale(${1 - d * 0.06})`,
  (d) => `translateX(${d * 130}%) rotate(${d * 22}deg)`,
);

export const stackDeck = cards(
  'stack-deck',
  (d) => `translateY(${d * 18}px) scale(${1 - d * 0.05})`,
  (d) => `translateY(${d * 120}%) scale(${1 + Math.abs(d) * 0.1})`,
);

export const stackFan = cards(
  'stack-fan',
  (d) => `rotate(${d * 7}deg) translateX(${d * 5}%)`,
  (d) => `translateX(${d * 120}%) rotate(${d * 30}deg)`,
);

export const stackVertical = cards(
  'stack-vertical',
  (d) => `translateY(${d * 22}px) scale(${1 - d * 0.04})`,
  (d) => `translateY(${d * -120}%)`,
);

export const stackRotate = cards(
  'stack-rotate',
  (d) => `rotate(${d * 4}deg) scale(${1 - d * 0.05})`,
  (d) => `translateX(${d * 120}%) rotate(${d * 40}deg)`,
);

export const cardsShuffle = cards(
  'cards-shuffle',
  (d) => `translateX(${(d % 2 ? 1 : -1) * d * 10}%) scale(${1 - d * 0.05})`,
  (d) => `translateX(${d * 130}%) rotate(${d * 18}deg)`,
);

export const cardsPile = cards(
  'cards-pile',
  (d) => `translate(${d * 6}px, ${d * 6}px) rotate(${d * 3}deg)`,
  (d) => `translate(${d * 120}%, ${d * 20}%) rotate(${d * 25}deg)`,
);

export const cardsPeek = cards(
  'cards-peek',
  (d) => `translateY(${d * 12}%) scale(${1 - d * 0.08})`,
  (d) => `translateY(${d * -110}%) scale(0.9)`,
);

export const cardsSpread = cards(
  'cards-spread',
  (d) => `translateX(${d * 26}%) scale(${1 - d * 0.06})`,
  (d) => `translateX(${d * 120}%) rotate(${d * 12}deg)`,
);

export const cardsFlipThrough = cards(
  'cards-flip-through',
  (d) => `translateY(${d * 8}%) rotateX(${-d * 12}deg) scale(${1 - d * 0.05})`,
  (d) => `rotateX(${d * 90}deg) translateY(${d * 40}%)`,
);
