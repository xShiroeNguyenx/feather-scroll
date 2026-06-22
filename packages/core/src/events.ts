import type { EventHandler, EventName } from './types';

/** Tiny synchronous event emitter (~0.3KB). */
export class Emitter {
  private map = new Map<EventName, Set<EventHandler>>();

  on(event: EventName, handler: EventHandler): () => void {
    let set = this.map.get(event);
    if (!set) {
      set = new Set();
      this.map.set(event, set);
    }
    set.add(handler);
    return () => this.off(event, handler);
  }

  off(event: EventName, handler: EventHandler): void {
    this.map.get(event)?.delete(handler);
  }

  emit(event: EventName, payload: Parameters<EventHandler>[0]): void {
    const set = this.map.get(event);
    if (!set) return;
    // Iterate a copy so handlers may unsubscribe during dispatch.
    for (const handler of [...set]) handler(payload);
  }

  clear(): void {
    this.map.clear();
  }
}
