import { type TgxCoderOptions } from "src/objects/options/tgx-coder-options";

const Marker = {
  Pixel: 0b000,
  Transparent: 0b001,
  Repeating: 0b010,
  Newline: 0b100,
} as const;

type TgxPart =
  | {
      marker: typeof Marker.Pixel;
      pixels: Uint16Array;
    }
  | {
      marker: typeof Marker.Transparent;
      count: number;
    }
  | {
      marker: typeof Marker.Repeating;
      pixel: number;
      count: number;
    }
  | {
      marker: typeof Marker.Newline;
    };

const TRANSPARENT_PIXEL_COLOR = 0x0;
const TRANSPARENT_PIXEL_MASK = 0x8000;
const MAX_PIXEL_PER_MARKER = 32;

export function decodeTgx(
  width: number,
  height: number,
  tgxData: DataView,
): Uint16Array {
  const pixels = new Uint16Array(width * height);

  // Initialize with transparent color
  pixels.fill(TRANSPARENT_PIXEL_COLOR);

  let sourceIndex = 0;
  let targetIndex = 0;
  let currentWidth = 0;
  let currentHeight = 0;

  while (sourceIndex < tgxData.byteLength) {
    const markerByte = tgxData.getUint8(sourceIndex);
    sourceIndex++;

    const marker = (markerByte >> 5) & 0b111; // Upper 3 bits
    const pixelNumber = (markerByte & 0b11111) + 1; // Lower 5 bits, +1 because 0 means 1 pixel

    if (marker === Marker.Newline) {
      // Handle padding at end
      if (currentWidth === 0 && currentHeight === height) {
        continue;
      }

      // Fill remaining width if line is incomplete
      if (currentWidth < width) {
        targetIndex += width - currentWidth;
      }

      currentWidth = 0;
      currentHeight++;

      if (currentHeight > height) {
        throw new Error("Height too big");
      }

      continue;
    }

    // Auto-newline if we reached width without explicit marker
    if (currentWidth === width) {
      currentWidth = 0;
      currentHeight++;

      if (currentHeight > height) {
        throw new Error("Height too big");
      }
    }

    switch (marker) {
      case Marker.Pixel: {
        // Read pixelNumber * 2 bytes (ARGB1555 is 2 bytes per pixel)
        for (let i = 0; i < pixelNumber; i++) {
          const pixel = tgxData.getUint16(sourceIndex, true); // little-endian
          pixels[targetIndex] = pixel;
          targetIndex++;
          sourceIndex += 2;
        }
        break;
      }

      case Marker.Transparent: {
        // Skip pixels (already filled with transparent color)
        targetIndex += pixelNumber;
        break;
      }

      case Marker.Repeating: {
        // Read the repeating pixel (2 bytes for ARGB1555)
        const pixel = tgxData.getUint16(sourceIndex, true); // little-endian
        sourceIndex += 2;

        // Repeat the pixel pixelNumber times
        for (let i = 0; i < pixelNumber; i++) {
          pixels[targetIndex] = pixel;
          targetIndex++;
        }
        break;
      }

      default:
        throw new Error(`Unknown marker: ${marker}`);
    }

    currentWidth += pixelNumber;

    if (currentWidth > width) {
      throw new Error("Width too big");
    }
  }

  if (currentHeight < height) {
    throw new Error("Not enough pixels");
  }

  if (sourceIndex !== tgxData.byteLength) {
    throw new Error("Invalid data size: not all data was consumed");
  }

  return pixels;
}

export function encodeTgx(
  pixels: Uint16Array,
  width: number,
  height: number,
  tgxCoderOptions: TgxCoderOptions,
): Uint8Array {
  let size = 0;
  for (let y = 0; y < height; y++) {
    size += encodeTgxLine(
      pixels.subarray(y * width, (y + 1) * width),
      tgxCoderOptions,
    );
  }

  // Handle padding
  const remainder = size % tgxCoderOptions.paddingAlignment;
  if (remainder > 0) {
    size += tgxCoderOptions.paddingAlignment - remainder;
  }
  const result = new Uint8Array(size);

  let currentResultIndex = 0;
  for (let y = 0; y < height; y++) {
    currentResultIndex += encodeTgxLine(
      pixels.subarray(y * width, (y + 1) * width),
      tgxCoderOptions,
      new DataView(result.buffer, currentResultIndex),
    );
  }

  // Add padding
  if (remainder > 0) {
    const dataView = new DataView(result.buffer);
    for (let index = currentResultIndex; index < size; index++) {
      writeTgxPart(index, { marker: Marker.Newline }, dataView);
    }
  }

  return result;
}

function encodeTgxLine(
  pixels: Uint16Array,
  tgxCoderOptions: TgxCoderOptions,
  out?: DataView,
): number {
  let targetIndex = 0;
  let sourceIndex = 0;
  while (sourceIndex < pixels.length) {
    // Count consecutive transparent pixels (alpha bit = 0)
    let transparentCount = 0;
    while (
      sourceIndex < pixels.length &&
      isTransparentPixel(pixels[sourceIndex])
    ) {
      transparentCount++;
      sourceIndex++;
    }

    // Write/count transparent markers
    while (transparentCount > 0) {
      const countByMarker = Math.min(transparentCount, MAX_PIXEL_PER_MARKER);
      targetIndex += writeTgxPart(
        targetIndex,
        { marker: Marker.Transparent, count: countByMarker },
        out,
      );
      transparentCount -= countByMarker;
    }
    if (sourceIndex >= pixels.length) {
      break;
    }

    const pixelBuffer = new Uint16Array(MAX_PIXEL_PER_MARKER);
    let count = 0;
    let repeatingPixel = 0;
    let repeatingCount = 0;
    while (
      sourceIndex + count < pixels.length &&
      count < MAX_PIXEL_PER_MARKER
    ) {
      const currentPixel = pixels[sourceIndex + count];
      if (isTransparentPixel(currentPixel)) {
        break;
      }

      // Count repeating pixels
      let localRepeatingCount = 0;
      for (
        let i = sourceIndex + count;
        i < pixels.length && !isTransparentPixel(pixels[i]);
        i++
      ) {
        if (pixels[i] !== currentPixel) {
          break;
        }
        localRepeatingCount++;
      }

      // Check if we should use repeating marker
      if (localRepeatingCount >= tgxCoderOptions.pixelRepeatThreshold) {
        repeatingPixel = currentPixel;
        repeatingCount = localRepeatingCount;
        break;
      }

      // Add to buffer
      pixelBuffer[count] = currentPixel;
      count++;
    }

    // Write out pixels
    if (count > 0) {
      targetIndex += writeTgxPart(
        targetIndex,
        { marker: Marker.Pixel, pixels: pixelBuffer.slice(0, count) },
        out,
      );
      sourceIndex += count;
    }

    // Write repeating marker if applicable
    while (repeatingCount > 0) {
      const countPerMarker = Math.min(repeatingCount, MAX_PIXEL_PER_MARKER);
      targetIndex += writeTgxPart(
        targetIndex,
        {
          marker: Marker.Repeating,
          count: countPerMarker,
          pixel: repeatingPixel,
        },
        out,
      );
      repeatingCount -= countPerMarker;
      sourceIndex += countPerMarker;
    }
  }

  // Write/count newline marker
  targetIndex += writeTgxPart(targetIndex, { marker: Marker.Newline }, out);

  return targetIndex;
}

function writeTgxPart(index: number, part: TgxPart, out?: DataView): number {
  let pixelCount = 1;
  switch (part.marker) {
    case Marker.Pixel:
      pixelCount = part.pixels.length;
      break;
    case Marker.Transparent:
    case Marker.Repeating:
      pixelCount = part.count;
      break;
  }

  // marker in upper 3 bits, pixel count in lower 5 bits (with 0 for 1 etc.)
  if (out) out.setInt8(index, (part.marker << 5) | (pixelCount - 1));
  let writtenBytes = 1;

  switch (part.marker) {
    case Marker.Pixel:
      if (out) {
        for (let i = 0; i < part.pixels.length; i++) {
          out.setUint16(index + 1 + i * 2, part.pixels[i], true);
        }
      }
      writtenBytes += 2 * part.pixels.length;
      break;
    case Marker.Repeating:
      if (out) out.setUint16(index + 1, part.pixel, true);
      writtenBytes += 2;
      break;
  }
  return writtenBytes;
}

function isTransparentPixel(pixel: number): boolean {
  return (pixel & TRANSPARENT_PIXEL_MASK) === 0;
}
