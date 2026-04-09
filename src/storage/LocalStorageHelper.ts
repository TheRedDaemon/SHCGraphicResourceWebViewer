export class LocalStorageHelper<T> {
  private key: string;
  private initFn: () => T;

  constructor(key: string, initFn: () => T) {
    this.key = key;
    this.initFn = initFn;
  }

  read(): T {
    const stored = localStorage.getItem(this.key);
    if (stored === null) {
      return this.initFn();
    }
    try {
      return JSON.parse(stored) as T;
    } catch {
      return this.initFn();
    }
  }

  write(value: T): void {
    localStorage.setItem(this.key, JSON.stringify(value));
  }

  reset(): void {
    this.write(this.initFn());
  }
}
