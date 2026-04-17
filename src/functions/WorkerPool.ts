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

type WorkerFactory = () => Worker;

export class WorkerPool {
  private workers: WorkerState[] = [];
  private requestQueue: QueueItem[] = [];
  private workerFactory: WorkerFactory;
  private intendedSize: number;

  constructor(workerFactory: WorkerFactory, initialSize: number) {
    if (initialSize <= 0) {
      throw new Error("Initial size must be a positive number");
    }
    this.workerFactory = workerFactory;
    this.intendedSize = initialSize;

    this.validatePoolSize();
  }

  private createWorker(): WorkerState {
    const worker = this.workerFactory();
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

    worker.onmessage = onmessage;
    worker.onerror = onerror;
    return state;
  }

  private terminateWorker(index: number): void {
    const state = this.workers[index];
    if (state.isBusy && state.reject) {
      state.reject(new Error("Worker terminated while processing"));
    }
    state.worker.terminate();
    state.worker.onmessage = null;
    state.worker.onerror = null;
    this.workers.splice(index, 1);
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
        this.terminateWorker(i);
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

  submit<T>(
    data: unknown,
    transfer?: Transferable[],
    abortable?: false,
  ): Promise<T>;
  submit<T>(
    data: unknown,
    transfer: Transferable[] | undefined,
    abortable: true,
  ): [Promise<T>, AbortController];
  submit<T>(
    data: unknown,
    transfer?: Transferable[],
    abortable: boolean = false,
  ): Promise<T> | [Promise<T>, AbortController] {
    const abortController = new AbortController();
    const promise = new Promise<T>((resolve, reject) => {
      const item: QueueItem = {
        data,
        transfer,
        resolve: (value: unknown) => resolve(value as T),
        reject,
      };
      this.process(item);

      if (abortable) {
        console.log("attached abortable");
        abortController.signal.addEventListener(
          "abort",
          () => {
            this.abort(reject);
          },
          { once: true },
        );
      }
    });

    if (abortable) {
      return [promise, abortController];
    }
    return promise;
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
      this.terminateWorker(i);
    }
  }

  private abort(reject: (reason: Error) => void): void {
    // Check if item is in queue
    const queueIndex = this.requestQueue.findIndex(
      (item) => item.reject === reject,
    );
    if (queueIndex !== -1) {
      const item = this.requestQueue.splice(queueIndex, 1)[0];
      item.reject(new Error("Canceled processing request"));
      return;
    }

    // Check if item is being processed by a worker
    const workerIndex = this.workers.findIndex(
      (state) => state.reject === reject,
    );
    if (workerIndex !== -1) {
      this.terminateWorker(workerIndex);
      this.process();
      return;
    }

    reject(new Error("Aborted missing or already completed request"));
  }

  clear(): void {
    // Reject all queued items
    for (const item of this.requestQueue) {
      item.reject(new Error("Worker pool cleared"));
    }
    this.requestQueue = [];

    // Terminate all workers
    for (let i = this.workers.length - 1; i >= 0; i--) {
      this.terminateWorker(i);
    }
  }
}
