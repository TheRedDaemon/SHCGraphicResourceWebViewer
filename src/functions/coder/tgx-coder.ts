const Marker = {
  Pixel: 0b000,
  Transparent: 0b001,
  Repeating: 0b010,
  Newline: 0b100,
} as const;

const TRANSPARENT_PIXEL_COLOR = 0x0;

// TODO: Check if it is possible, to chunk the de- or encoding (async)
// TODO: Encoder

export async function convertTgxToArgb(
  width: number,
  height: number,
  tgxData: DataView,
): Promise<Uint16Array> {
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
