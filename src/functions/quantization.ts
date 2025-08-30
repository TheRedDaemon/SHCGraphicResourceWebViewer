import { type QuantizationOptions } from "src/objects/options/quantization-options";
import { reduceColorDepthOfRgba8888ToArgb1555 } from "zig-src/color_depth_converter.zig";

// check out other library (RGB Quant?), maybe they will be more memory friendly

const WORKER_HANDLER = (function () {
  let current_worker: Worker | null = null;
  let resolvePromise: ((value: Uint8ClampedArray<ArrayBuffer>) => void) | null =
    null;
  let rejectPromise: ((reason?: Error) => void) | null = null;

  return {
    async runQuantizationInWorker(
      width: number,
      consumedOriginalImageDataArray: Uint8ClampedArray<ArrayBuffer>,
      consumedReducedPaletteImageDataArray: Uint8ClampedArray<ArrayBuffer>,
      quantizationOptions: QuantizationOptions,
      onProgress?: (progress: string) => void,
    ): Promise<Uint8ClampedArray<ArrayBuffer>> {
      if (this.isWorkerRunning()) {
        throw new Error("Quantization worker already running.");
      }
      const promise: Promise<Uint8ClampedArray<ArrayBuffer>> = new Promise(
        (resolve, reject) => {
          resolvePromise = resolve;
          rejectPromise = reject;
        },
      );
      try {
        current_worker = new Worker(
          new URL("./quantization-worker.ts", import.meta.url),
          {
            type: "module",
          },
        );
        current_worker.onmessage = (event) => {
          const message = event.data;
          if (message.type === "progress") {
            onProgress?.(message.data);
            return;
          }
          if (message.type === "result") {
            resolvePromise!(message.data);
          } else {
            rejectPromise!(new Error("Unknown quantization worker message"));
          }
          this.terminateQuantizationWorker();
        };
        current_worker.onerror = (event) => {
          rejectPromise!(
            new Error(`Quantization worker error: ${event.message}`),
          );
          this.terminateQuantizationWorker();
        };
        onProgress?.("Sending data.");
        current_worker.postMessage(
          {
            width,
            originalImageArray: consumedOriginalImageDataArray,
            reducedPaletteImageArray: consumedReducedPaletteImageDataArray,
            options: quantizationOptions,
          },
          [
            consumedOriginalImageDataArray.buffer,
            consumedReducedPaletteImageDataArray.buffer,
          ],
        );
      } catch (ex) {
        this.terminateQuantizationWorker();
        throw ex;
      }

      return promise;
    },
    isWorkerRunning() {
      return current_worker !== null;
    },
    terminateQuantizationWorker() {
      if (current_worker) {
        current_worker.terminate();
        current_worker = null;
      }
      if (rejectPromise) {
        rejectPromise(new Error("Quantization worker terminated."));
      }
      resolvePromise = null;
      rejectPromise = null;
    },
  };
})();

function generateImageWithReducedPalette(
  image: ImageData,
  alphaThreshold: number,
): ImageData {
  const copiedBytesArray = new Uint8ClampedArray(image.data);
  reduceColorDepthOfRgba8888ToArgb1555(copiedBytesArray, alphaThreshold);
  return new ImageData(copiedBytesArray, image.width, image.height);
}

export async function quantizeImageTo16Colors(
  image: ImageData,
  quantizationOptions: QuantizationOptions,
  onProgress?: (progress: string) => void,
): Promise<ImageData> {
  const imageWithReducedPalette = generateImageWithReducedPalette(
    image,
    quantizationOptions.alphaThreshold,
  );
  if (!quantizationOptions.useQuantization) {
    return imageWithReducedPalette;
  }

  // TODO?: Start seems to be slow, although, that could be the initialization of the worker
  onProgress?.("Starting worker.");
  const resultArray = await WORKER_HANDLER.runQuantizationInWorker(
    imageWithReducedPalette.width,
    new Uint8ClampedArray(image.data), // copy, since it is consumed
    imageWithReducedPalette.data,
    quantizationOptions,
    onProgress,
  );

  onProgress?.("Creating image.");
  return new ImageData(resultArray, image.width, image.height);
}

export function isQuantizationRunning(): boolean {
  // for the moment ok, since the other call actually happens in the sync part
  return WORKER_HANDLER.isWorkerRunning();
}

export function terminateQuantization() {
  WORKER_HANDLER.terminateQuantizationWorker();
}
