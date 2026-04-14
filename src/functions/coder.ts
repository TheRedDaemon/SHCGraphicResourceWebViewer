import { type TgxCoderOptions } from "src/objects/options/tgx-coder-options";
import {
  convertPixelRgba8888ToArgb1555,
  convertPixelArgb1555ToRgba8888,
} from "./coder/color-depth-converter";

// TODO: complete by switching to a configurable worker pool
// to keep the options separate, the pool likely needs to check the current options on every handling
// to confirm the required number of threads is still present or if some need to be terminated

interface QueueItem {
  data: unknown;
  transfer: Transferable[] | undefined;
  resolve: (value: unknown) => void;
  reject: (reason: Error) => void;
}

class WorkerWrapper {
  private worker: Worker;
  private isWorkerBusy = false;
  private beforeUnloadHandler: () => void;
  private onComplete: () => void;

  private currentResolve: ((value: unknown) => void) | null = null;
  private currentReject: ((reason: Error) => void) | null = null;

  constructor(workerUrl: string | URL, onComplete: () => void) {
    this.worker = new Worker(workerUrl, { type: "module" });
    this.onComplete = onComplete;
    this.beforeUnloadHandler = () => this.terminate();
    window.addEventListener("beforeunload", this.beforeUnloadHandler);
    this.attachListeners();
  }

  get busy(): boolean {
    return this.isWorkerBusy;
  }

  terminate(): void {
    window.removeEventListener("beforeunload", this.beforeUnloadHandler);
    this.worker.terminate();
  }

  submit(item: QueueItem): void {
    this.isWorkerBusy = true;
    this.currentResolve = item.resolve;
    this.currentReject = item.reject;
    this.worker.postMessage(item.data, item.transfer as Transferable[]);
  }

  private attachListeners(): void {
    const onmessage = (event: MessageEvent) => {
      this.isWorkerBusy = false;
      if (this.currentResolve) {
        this.currentResolve(event.data);
        this.currentResolve = null;
        this.currentReject = null;
        this.onComplete();
      }
    };

    const onerror = (event: ErrorEvent) => {
      this.isWorkerBusy = false;
      if (this.currentReject) {
        this.currentReject(new Error(event.message));
        this.currentResolve = null;
        this.currentReject = null;
        this.onComplete();
      }
    };

    this.worker.addEventListener("message", onmessage);
    this.worker.addEventListener("error", onerror);
  }
}

const requestQueue: QueueItem[] = [];

const workerWrapper = new WorkerWrapper(
  new URL("./coder/coder-worker.ts", import.meta.url),
  () => {
    processNext();
  },
);

function processNext(): void {
  if (requestQueue.length > 0) {
    const item = requestQueue.shift()!;
    workerWrapper.submit(item);
  }
}

function schedule<T>(data: unknown, transfer?: Transferable[]): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const item: QueueItem = {
      data,
      transfer,
      resolve: (value: unknown) => resolve(value as T),
      reject,
    };
    if (workerWrapper.busy) {
      requestQueue.push(item);
    } else {
      workerWrapper.submit(item);
    }
  });
}

function ensureArrayBuffer<
  T extends Uint8Array | Uint16Array | Uint8ClampedArray,
  R extends T,
>(data: T, constructor: new (data: T) => R): R {
  if (data.buffer instanceof ArrayBuffer) {
    return data as R;
  }
  console.warn("Buffer was not ArrayBuffer, creating a copy.");
  return new constructor(data);
}

export async function decodeTgx(
  width: number,
  height: number,
  tgxData: DataView,
  consumeDataBuffer = true,
): Promise<Uint16Array> {
  const data = await schedule<Uint16Array>(
    { type: "decode-tgx", width, height, tgxData },
    consumeDataBuffer ? [tgxData.buffer] : undefined,
  );
  return ensureArrayBuffer(data, Uint16Array);
}

export async function encodeTgx(
  pixels: Uint16Array,
  width: number,
  height: number,
  tgxCoderOptions: TgxCoderOptions,
  consumeDataBuffer = true,
): Promise<Uint8Array> {
  const data = await schedule<Uint8Array>(
    { type: "encode-tgx", pixels, width, height, tgxCoderOptions },
    consumeDataBuffer ? [pixels.buffer] : undefined,
  );
  return ensureArrayBuffer(data, Uint8Array);
}

export async function convertRgba8888ToArgb1555(
  input: Uint8ClampedArray,
  consumeDataBuffer = true,
): Promise<Uint16Array> {
  const data = await schedule<Uint16Array>(
    { type: "convert-rgba-to-argb", input },
    consumeDataBuffer ? [input.buffer] : undefined,
  );
  return ensureArrayBuffer(data, Uint16Array);
}

export async function convertArgb1555ToRgba8888(
  input: Uint16Array,
  consumeDataBuffer = true,
): Promise<Uint8ClampedArray> {
  const data = await schedule<Uint8ClampedArray>(
    { type: "convert-argb-to-rgba", input },
    consumeDataBuffer ? [input.buffer] : undefined,
  );
  return ensureArrayBuffer(data, Uint8ClampedArray);
}

export async function reduceColorDepthOfRgba8888ToArgb1555(
  input: Uint8ClampedArray,
  alphaThreshold: number,
  consumeDataBuffer = true,
): Promise<Uint8ClampedArray> {
  const data = await schedule<Uint8ClampedArray>(
    { type: "reduce-color-depth", input, alphaThreshold },
    consumeDataBuffer ? [input.buffer] : undefined,
  );
  return ensureArrayBuffer(data, Uint8ClampedArray);
}

// Re-export sync functions
export { convertPixelRgba8888ToArgb1555, convertPixelArgb1555ToRgba8888 };
