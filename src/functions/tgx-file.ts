import { decodeTgx } from "./coder/tgx-coder";
import { convertArgb1555ToRgba8888 } from "./color-depth-converter";

interface TgxHeader {
  width: number;
  height: number;
}

const TGX_HEADER_SIZE = 8; // 4 bytes width + 4 bytes height

export async function loadFile(file: File): Promise<ImageData> {
  const arrayBuffer = await file.arrayBuffer();
  const dataView = new DataView(arrayBuffer);

  if (TGX_HEADER_SIZE > arrayBuffer.byteLength) {
    throw new Error("File too small for TGX header");
  }

  // Read header (little-endian)
  const tgxHeader: TgxHeader = {
    width: dataView.getUint32(0, true),
    height: dataView.getUint32(4, true),
  };

  // Create a DataView for the encoded data (skip the header)
  const encodedStream = new DataView(
    arrayBuffer,
    TGX_HEADER_SIZE,
    arrayBuffer.byteLength - TGX_HEADER_SIZE,
  );

  const argb1555Pixels = decodeTgx(
    tgxHeader.width,
    tgxHeader.height,
    encodedStream,
  );

  const rgba8888Pixels = convertArgb1555ToRgba8888(argb1555Pixels);

  return new ImageData(rgba8888Pixels, tgxHeader.width, tgxHeader.height);
}
