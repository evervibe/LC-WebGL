export type Listener<T> = (state: T) => void;

export class Store<T extends object> {
  private state: T;
  private listeners = new Set<Listener<T>>();

  constructor(initialState: T) {
    this.state = initialState;
  }

  get snapshot(): T {
    return this.state;
  }

  setState(updater: Partial<T> | ((prev: T) => Partial<T>)) {
    const partial = typeof updater === 'function' ? updater(this.state) : updater;
    this.state = { ...this.state, ...partial };
    this.listeners.forEach((listener) => listener(this.state));
  }

  subscribe(listener: Listener<T>) {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }
}
