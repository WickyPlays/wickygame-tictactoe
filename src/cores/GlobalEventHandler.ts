type EventMap = Record<string, any>;
type EventKey<T extends EventMap> = string & keyof T;
type EventHandler<T> = (data: T) => void;

interface GlobalEmitter<T extends EventMap> {
  on<K extends EventKey<T>>(eventName: K, handler: EventHandler<T[K]>): void;
  off<K extends EventKey<T>>(eventName: K, handler: EventHandler<T[K]>): void;
  emit<K extends EventKey<T>>(eventName: K, data: T[K]): void;
  once<K extends EventKey<T>>(eventName: K, handler: EventHandler<T[K]>): void;
  removeAllListeners<K extends EventKey<T>>(eventName: K): void;
  listenerCount<K extends EventKey<T>>(eventName: K): number;
}

class GlobalEventHandler<T extends EventMap> implements GlobalEmitter<T> {
  private static instance: GlobalEventHandler<any>;
  private handlers: {
    [K in keyof T]?: Array<EventHandler<T[K]>>;
  } = {};

  private constructor() {}

  public static getInstance<T extends EventMap>(): GlobalEventHandler<T> {
    if (!GlobalEventHandler.instance) {
      GlobalEventHandler.instance = new GlobalEventHandler<T>();
    }
    return GlobalEventHandler.instance;
  }

  on<K extends EventKey<T>>(eventName: K, handler: EventHandler<T[K]>): void {
    if (!this.handlers[eventName]) {
      this.handlers[eventName] = [];
    }
    this.handlers[eventName]!.push(handler);
  }

  off<K extends EventKey<T>>(eventName: K, handler: EventHandler<T[K]>): void {
    const handlers = this.handlers[eventName];
    if (handlers) {
      this.handlers[eventName] = handlers.filter((h) => h !== handler);
    }
  }

  emit<K extends EventKey<T>>(eventName: K, data: T[K]): void {
    const handlers = this.handlers[eventName];
    if (handlers) {
      handlers.slice().forEach((handler) => {
        try {
          handler(data);
        } catch (err) {
          console.error(`Error in global event handler for ${eventName}:`, err);
        }
      });
    }
  }

  once<K extends EventKey<T>>(eventName: K, handler: EventHandler<T[K]>): void {
    const onceHandler = (data: T[K]) => {
      this.off(eventName, onceHandler);
      handler(data);
    };
    this.on(eventName, onceHandler);
  }

  removeAllListeners<K extends EventKey<T>>(eventName: K): void {
    delete this.handlers[eventName];
  }

  listenerCount<K extends EventKey<T>>(eventName: K): number {
    const handlers = this.handlers[eventName];
    return handlers ? handlers.length : 0;
  }
}

// Default global event handler with basic event types
type DefaultEvents = {
  [key: string]: any;
};

const globalEvents = GlobalEventHandler.getInstance<DefaultEvents>();

export { GlobalEventHandler, globalEvents };