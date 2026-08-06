class EventBus extends EventTarget {
  emit(eventName, detail = {}) {
    this.dispatchEvent(new CustomEvent(eventName, { detail }));
  }

  on(eventName, callback) {
    const handler = (e) => callback(e.detail);
    this.addEventListener(eventName, handler);
    return () => this.removeEventListener(eventName, handler);
  }
}

export const eventBus = new EventBus();
