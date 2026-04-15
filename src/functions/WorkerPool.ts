interface WorkerState {
  worker: Worker;
  isBusy: boolean;
  resolve: ((value: unknown) => void) | null;
  reject: ((reason: Error) => void) | null;
}

interface QueueItem {
  data: unknown;
  transfer: Transferable[] | undefined;
  resolve: (value: unknown) => void;
  reject: (reason: Error) => void;
}

export class WorkerPool {
  private workers: WorkerState[] = [];
  private requestQueue: QueueItem[] = [];
  private workerUrl: string | URL;
  private beforeUnloadHandler: () => void;
  private intendedSize: number;

  constructor(workerUrl: string | URL, initialSize: number) {
    if (initialSize <= 0) {
      throw new Error("Initial size must be a positive number");
    }
    this.workerUrl = workerUrl;
    this.intendedSize = initialSize;

    this.beforeUnloadHandler = () => this.terminateAll();
    window.addEventListener("beforeunload", this.beforeUnloadHandler);

    this.validatePoolSize();
  }

  private createWorker(): WorkerState {
    const worker = new Worker(this.workerUrl, { type: "module" });
    const state: WorkerState = {
      worker,
      isBusy: false,
      resolve: null,
      reject: null,
    };

    const onmessage = (event: MessageEvent) => {
      if (state.resolve) {
        state.resolve(event.data);
        state.resolve = null;
        state.reject = null;
        state.isBusy = false;
        this.process();
      }
    };

    const onerror = (event: ErrorEvent) => {
      if (state.reject) {
        state.reject(new Error(event.message));
        state.resolve = null;
        state.reject = null;
        state.isBusy = false;
        this.process();
      }
    };

    worker.addEventListener("message", onmessage);
    worker.addEventListener("error", onerror);

    return state;
  }

  private terminateWorker(state: WorkerState): void {
    if (state.isBusy && state.reject) {
      state.reject(new Error("Worker terminated while processing"));
    }
    state.worker.terminate();
  }

  private validatePoolSize(): void {
    const currentSize = this.workers.length;
    if (currentSize === this.intendedSize) {
      return;
    }

    // Add workers if pool is too small
    if (currentSize < this.intendedSize) {
      for (let i = currentSize; i < this.intendedSize; i++) {
        this.workers.push(this.createWorker());
      }
    }
    // Remove idle workers if pool is too big
    else {
      for (let i = this.workers.length - 1; i >= 0; i--) {
        if (this.workers[i].isBusy) {
          continue;
        }
        this.terminateWorker(this.workers[i]);
        this.workers.splice(i, 1);
        if (this.workers.length <= this.intendedSize) {
          break;
        }
      }
    }
  }

  private process(item?: QueueItem): void {
    this.validatePoolSize();

    const availableWorker = this.workers.find((w) => !w.isBusy);

    let itemToProcess: QueueItem;
    if (item !== undefined) {
      if (!availableWorker) {
        this.requestQueue.push(item);
        return;
      }
      itemToProcess = item;
    } else {
      if (!availableWorker || this.requestQueue.length === 0) {
        return;
      }
      itemToProcess = this.requestQueue.shift()!;
    }

    this.assignToWorker(availableWorker, itemToProcess);
  }

  private assignToWorker(state: WorkerState, item: QueueItem): void {
    state.isBusy = true;
    state.resolve = item.resolve;
    state.reject = item.reject;
    state.worker.postMessage(item.data, item.transfer as Transferable[]);
  }

  async submit<T>(data: unknown, transfer?: Transferable[]): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const item: QueueItem = {
        data,
        transfer,
        resolve: (value: unknown) => resolve(value as T),
        reject,
      };
      this.process(item);
    });
  }

  resize(newSize: number, force: boolean = false): void {
    if (newSize <= 0) {
      throw new Error("New size must be a positive number");
    }
    this.intendedSize = newSize;
    this.validatePoolSize();
    if (!force || this.workers.length === this.intendedSize) {
      return;
    }

    for (let i = this.workers.length - 1; i >= 0; i--) {
      if (this.workers.length <= this.intendedSize) {
        break;
      }
      this.terminateWorker(this.workers[i]);
      this.workers.splice(i, 1);
    }
  }

  terminateAll(): void {
    window.removeEventListener("beforeunload", this.beforeUnloadHandler);
    for (const workerState of this.workers) {
      this.terminateWorker(workerState);
    }
    this.workers = [];
  }
}
