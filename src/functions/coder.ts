import { type CoderOptions } from "src/options/coder-options";
import {
  convertPixelRgba8888ToArgb1555,
  convertPixelArgb1555ToRgba8888,
} from "./coder/color-depth-converter";
import { WorkerPool } from "./WorkerPool";
import { coderOptions as coderOptionsStorage } from "src/storage/option-storage";

const workerPool = new WorkerPool(
  new URL("./coder/coder-worker.ts", import.meta.url),
  coderOptionsStorage.read().coderWorkers,
);
window.addEventListener("beforeunload", () => workerPool.clear());

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
): Promise<Uint16Array<ArrayBuffer>> {
  const data = await workerPool.submit<Uint16Array>(
    { type: "decode-tgx", width, height, tgxData },
    consumeDataBuffer ? [tgxData.buffer] : undefined,
  );
  return ensureArrayBuffer(data, Uint16Array);
}

export async function encodeTgx(
  pixels: Uint16Array,
  width: number,
  height: number,
  coderOptions: CoderOptions,
  consumeDataBuffer = true,
): Promise<Uint8Array<ArrayBuffer>> {
  const data = await workerPool.submit<Uint8Array>(
    { type: "encode-tgx", pixels, width, height, coderOptions },
    consumeDataBuffer ? [pixels.buffer] : undefined,
  );
  return ensureArrayBuffer(data, Uint8Array);
}

export async function convertRgba8888ToArgb1555(
  input: Uint8ClampedArray,
  consumeDataBuffer = true,
): Promise<Uint16Array<ArrayBuffer>> {
  const data = await workerPool.submit<Uint16Array>(
    { type: "convert-rgba-to-argb", input },
    consumeDataBuffer ? [input.buffer] : undefined,
  );
  return ensureArrayBuffer(data, Uint16Array);
}

export async function convertArgb1555ToRgba8888(
  input: Uint16Array,
  consumeDataBuffer = true,
): Promise<Uint8ClampedArray<ArrayBuffer>> {
  const data = await workerPool.submit<Uint8ClampedArray>(
    { type: "convert-argb-to-rgba", input },
    consumeDataBuffer ? [input.buffer] : undefined,
  );
  return ensureArrayBuffer(data, Uint8ClampedArray);
}

export async function reduceColorDepthOfRgba8888ToArgb1555(
  input: Uint8ClampedArray,
  alphaThreshold: number,
  consumeDataBuffer = true,
): Promise<Uint8ClampedArray<ArrayBuffer>> {
  const data = await workerPool.submit<Uint8ClampedArray>(
    { type: "reduce-color-depth", input, alphaThreshold },
    consumeDataBuffer ? [input.buffer] : undefined,
  );
  return ensureArrayBuffer(data, Uint8ClampedArray);
}

export function resizeWorker(newSize: number, force: boolean = false): void {
  workerPool.resize(newSize, force);
}

// Re-export sync functions
export { convertPixelRgba8888ToArgb1555, convertPixelArgb1555ToRgba8888 };
