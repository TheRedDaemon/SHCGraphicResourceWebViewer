import { type TgxCoderOptions } from "src/objects/options/tgx-coder-options";
import {
  convertPixelRgba8888ToArgb1555,
  convertPixelArgb1555ToRgba8888,
} from "./coder/color-depth-converter";

const worker = new Worker(new URL("./coder/coder-worker.ts", import.meta.url), {
  type: "module",
});

let currentPromise: Promise<unknown> | null = null;

window.addEventListener("beforeunload", () => {
  worker.terminate();
});

async function postMessage<T>(
  message: unknown,
  transfer?: Transferable[],
): Promise<T> {
  if (currentPromise) {
    await currentPromise;
  }

  const promise = new Promise<T>((resolve, reject) => {
    const onmessage = (event: MessageEvent) => {
      worker.removeEventListener("message", onmessage);
      worker.removeEventListener("error", onerror);
      resolve(event.data as T);
    };

    const onerror = (event: ErrorEvent) => {
      worker.removeEventListener("message", onmessage);
      worker.removeEventListener("error", onerror);
      reject(new Error(event.message));
    };

    worker.addEventListener("message", onmessage);
    worker.addEventListener("error", onerror);
    worker.postMessage(message, transfer as Transferable[]);
  });

  currentPromise = promise;
  try {
    return promise;
  } finally {
    currentPromise = null;
  }
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
): Promise<Uint16Array<ArrayBuffer>> {
  const data = await postMessage<Uint16Array>(
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
): Promise<Uint8Array<ArrayBuffer>> {
  const data = await postMessage<Uint8Array>(
    { type: "encode-tgx", pixels, width, height, tgxCoderOptions },
    consumeDataBuffer ? [pixels.buffer] : undefined,
  );
  return ensureArrayBuffer(data, Uint8Array);
}

export async function convertRgba8888ToArgb1555(
  input: Uint8ClampedArray,
  consumeDataBuffer = true,
): Promise<Uint16Array<ArrayBuffer>> {
  const data = await postMessage<Uint16Array>(
    { type: "convert-rgba-to-argb", input },
    consumeDataBuffer ? [input.buffer] : undefined,
  );
  return ensureArrayBuffer(data, Uint16Array);
}

export async function convertArgb1555ToRgba8888(
  input: Uint16Array,
  consumeDataBuffer = true,
): Promise<Uint8ClampedArray<ArrayBuffer>> {
  const data = await postMessage<Uint8ClampedArray>(
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
  const data = await postMessage<Uint8ClampedArray>(
    { type: "reduce-color-depth", input, alphaThreshold },
    consumeDataBuffer ? [input.buffer] : undefined,
  );
  return ensureArrayBuffer(data, Uint8ClampedArray);
}

// Re-export sync functions
export { convertPixelRgba8888ToArgb1555, convertPixelArgb1555ToRgba8888 };
