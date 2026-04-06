import { type QuantizationOptions } from "src/objects/options/quantization-options";
import { reduceColorDepthOfRgba8888ToArgb1555 } from "src/functions/color-depth-converter";

// check out other library (RGB Quant?), maybe they will be more memory friendly

class QuantizationWorker {
  #worker: Worker;
  #workerTerminated = false;

  #resolvePromise: ((value: unknown) => void) | null = null;
  #rejectPromise: ((reason?: Error) => void) | null = null;

  constructor() {
    this.#worker = new Worker(
      new URL("./quantization-worker.ts", import.meta.url),
      {
        type: "module",
      },
    );
    this.#worker.onmessage = (event) => {
      if (!this.#resolvePromise) {
        throw new Error("Worker gave message without running promise.");
      }
      const message = event.data;
      this.#resolvePromise(message);
      this.#resolvePromise = null;
      this.#rejectPromise = null;
    };
    this.#worker.onerror = (event) => {
      if (!this.#rejectPromise) {
        throw new Error("Worker gave error without running promise.");
      }
      this.#rejectPromise(
        new Error(`Quantization worker error: ${event.message}`),
      );
      this.#resolvePromise = null;
      this.#rejectPromise = null;
    };
  }

  init(quantizationOptions: QuantizationOptions): Promise<void> {
    this.#validateWorker();
    const promise = this.#initPromise<void>();
    this.#worker.postMessage({ type: "init", options: quantizationOptions });
    return promise;
  }

  // returns alpha channel of consumed image
  sample(image: ImageData): Promise<Uint8ClampedArray<ArrayBuffer>> {
    this.#validateWorker();
    const promise = this.#initPromise<Uint8ClampedArray<ArrayBuffer>>();
    this.#worker.postMessage({ type: "sample", image: image }, [
      image.data.buffer,
    ]);
    return promise;
  }

  // TODO needs research what actually is contained in this array
  palette(): Promise<Uint8ClampedArray<ArrayBuffer>> {
    this.#validateWorker();
    const promise = this.#initPromise<Uint8ClampedArray<ArrayBuffer>>();
    this.#worker.postMessage({ type: "palette" });
    return promise;
  }

  reduceToImage(
    image: ImageData,
    alpha: Uint8ClampedArray<ArrayBuffer>,
  ): Promise<Uint8ClampedArray<ArrayBuffer>> {
    this.#validateWorker();
    const promise = this.#initPromise<Uint8ClampedArray<ArrayBuffer>>();
    this.#worker.postMessage(
      { type: "reduce", image: image, alpha: alpha, returnType: 1 },
      [image.data.buffer, alpha.buffer],
    );
    return promise;
  }

  reduceToIndexes(image: ImageData): Promise<Uint32Array<ArrayBuffer>> {
    this.#validateWorker();
    const promise = this.#initPromise<Uint32Array<ArrayBuffer>>();
    this.#worker.postMessage({ type: "reduce", image: image, returnType: 2 }, [
      image.data.buffer,
    ]);
    return promise;
  }

  isWorkerActive() {
    this.#validateWorker();
    return !!this.#resolvePromise;
  }

  terminateQuantizationWorker() {
    if (this.#workerTerminated) {
      return;
    }

    this.#workerTerminated = true;
    if (this.#rejectPromise) {
      this.#rejectPromise(new Error("Quantization worker terminated."));
    }
    this.#worker.terminate();
  }

  #validateWorker() {
    if (this.#workerTerminated) {
      throw new Error("Quantization worker was shut down.");
    }
  }

  #initPromise<T>() {
    if (this.isWorkerActive()) {
      throw new Error("Quantization worker already running.");
    }
    return new Promise<T>((resolve, reject) => {
      this.#resolvePromise = resolve as (value: unknown) => void;
      this.#rejectPromise = reject;
    });
  }
}

function generateImageWithReducedPalette(
  image: ImageData,
  alphaThreshold: number,
): ImageData {
  const copiedBytesArray = new Uint8ClampedArray(image.data);
  reduceColorDepthOfRgba8888ToArgb1555(copiedBytesArray, alphaThreshold);
  return new ImageData(copiedBytesArray, image.width, image.height);
}

async function internalQuantizeImageTo16Colors(
  image: ImageData,
  quantizationOptions: QuantizationOptions,
  signal: AbortSignal,
  onProgress?: (progress: string) => void,
): Promise<ImageData> {
  // no abort needed here yet, since the logic is synchronous here
  // should an async call happen earlier, this needs to be addressed

  const imageWithReducedPalette = generateImageWithReducedPalette(
    image,
    quantizationOptions.alphaThreshold,
  );
  if (!quantizationOptions.useQuantization) {
    return imageWithReducedPalette;
  }

  let resultArray = null;

  onProgress?.("Starting worker.");
  const quantizationWorker = new QuantizationWorker();
  signal.onabort = () => quantizationWorker.terminateQuantizationWorker();
  try {
    await quantizationWorker.init(quantizationOptions);

    onProgress?.("Building palette.");
    const alpha = await quantizationWorker.sample(imageWithReducedPalette);
    await quantizationWorker.palette();

    onProgress?.("Quantizing image.");
    resultArray = await quantizationWorker.reduceToImage(
      new ImageData(
        new Uint8ClampedArray(image.data), // copy, since it is consumed
        image.width,
        image.height,
      ),
      alpha,
    );
  } finally {
    signal.onabort = null;
    onProgress?.("Shut down worker.");
    quantizationWorker.terminateQuantizationWorker();
  }

  onProgress?.("Creating image.");
  return new ImageData(resultArray, image.width, image.height);
}

export function quantizeImageTo16Colors(
  image: ImageData,
  quantizationOptions: QuantizationOptions,
  onProgress?: (progress: string) => void,
): [Promise<ImageData>, AbortController] {
  const controller = new AbortController();
  const promise = internalQuantizeImageTo16Colors(
    image,
    quantizationOptions,
    controller.signal,
    onProgress,
  );
  return [promise, controller];
}
