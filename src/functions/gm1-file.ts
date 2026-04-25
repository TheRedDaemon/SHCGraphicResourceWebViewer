import { convertArgb1555ToRgba8888, decodeTgx } from "./coder";

// GM1 Type enum
export const Gm1TypeValues = {
  interface: 1,
  animations: 2,
  tilesObject: 3,
  font: 4,
  noCompression1: 5,
  tgxConstSize: 6,
  noCompression2: 7,
} as const;

export type Gm1Type = (typeof Gm1TypeValues)[keyof typeof Gm1TypeValues];

// Common image dimensions
export interface ImageDimensions {
  width: number;
  height: number;
  offsetX: number;
  offsetY: number;
}

// Uncompressed image data (ARGB1555)
export interface UncompressedImageData {
  data: Uint16Array; // ARGB1555 pixels
}

// Tile object image position
export const TileObjectImagePositionValues = {
  none: 0,
  top: 1,
  upperLeft: 2,
  upperRight: 3,
} as const;

export type TileObjectImagePosition =
  (typeof TileObjectImagePositionValues)[keyof typeof TileObjectImagePositionValues];

// Tile object image info
export interface TileObjectImageInfo {
  imagePart: number;
  subParts: number;
  tileOffset: number;
  imagePosition: TileObjectImagePosition;
  imageOffsetX: number; // Signed, ~120 pixel range
  imageWidth: number;
}

// Tile data (for tilesObject type)
export interface TileData {
  data: Uint8Array; // Encoded tile data
}

// Tile object compound data
export interface TileObjectCompoundData {
  tile: TileData;
  image?: ImageData; // Optional image data
}

// Interface data (TGX-based, free positioning)
export interface InterfaceData {
  images: Array<{
    dimensions: ImageDimensions;
    data: ImageData;
  }>;
}

// Animations data (TGX-based, fixed size, uses palettes)
export interface AnimationsData {
  images: Array<{
    dimensions: ImageDimensions;
    data: ImageData;
  }>;
  palettes: Array<Uint16Array>; // 10 palettes of 256 ARGB1555 colors each
  frameSize: {
    width: number;
    height: number;
  };
  rowLength: number;
  spacing: number;
  originX: number;
  originY: number;
}

// Tiles object data (tile + optional image per compound object)
export interface TilesObjectData {
  compoundObjects: Array<{
    dimensions: ImageDimensions;
    info: TileObjectImageInfo;
    data: TileObjectCompoundData;
  }>;
}

// Font data (TGX-based, free positioning)
export interface FontData {
  images: Array<{
    dimensions: ImageDimensions;
    data: ImageData;
  }>;
  fontRelatedSize: number;
}

// No compression 1 data (uncompressed, free positioning)
export interface NoCompression1Data {
  images: Array<{
    dimensions: ImageDimensions;
    data: UncompressedImageData;
  }>;
}

// TGX const size data (TGX-based, fixed size with grid)
export interface TgxConstSizeData {
  width: number;
  height: number;
  rowLength: number;
  spacing: number;
  originX: number;
  originY: number;
  images: Array<ImageData>;
}

// No compression 2 data (uncompressed, free positioning)
export interface NoCompression2Data {
  images: Array<{
    dimensions: ImageDimensions;
    data: UncompressedImageData;
  }>;
}

// Union type for GM1 file data based on type
export type Gm1Data =
  | { type: 6; data: TgxConstSizeData } // tgxConstSize
  | { type: 1; data: never } // interface
  | { type: 2; data: never } // animations
  | { type: 3; data: never } // tilesObject
  | { type: 4; data: never } // font
  | { type: 5; data: never } // noCompression1
  | { type: 7; data: never }; // noCompression2

const GM1_HEADER_SIZE = 0x58; // 88 bytes
const GM1_COLOR_TABLES_SIZE = 10 * 256 * 2; // 10 palettes of 256 ARGB1555 colors (2 bytes each)
const GM1_IMAGE_HEADER_SIZE = 16; // dimensions (8 bytes) + info (8 bytes)

// GM1 header field offsets
const GM1_HEADER_OFFSETS = {
  unknown0x0: 0x00,
  unknown0x4: 0x04,
  unknown0x8: 0x08,
  numberOfImages: 0x0c,
  unknown0x10: 0x10,
  gm1Type: 0x14,
  unknown0x18: 0x18,
  unknown0x1c: 0x1c,
  unknown0x20: 0x20,
  unknown0x24: 0x24,
  unknown0x28: 0x28,
  unknown0x2c: 0x2c,
  width: 0x30,
  height: 0x34,
  unknown0x38: 0x38,
  unknown0x3c: 0x3c,
  unknown0x40: 0x40,
  unknown0x44: 0x44,
  originX: 0x48,
  originY: 0x4c,
  dataSize: 0x50,
  unknown0x54: 0x54,
} as const;

interface Gm1Structures {
  numberOfImages: number;
  header: DataView;
  offsets: Uint32Array;
  sizes: Uint32Array;
  imageHeaders: DataView;
  imageData: Uint8Array;
}

function determineGm1Type(byteArray: Uint8Array): Gm1Type {
  const dataView = new DataView(byteArray.buffer);
  const type = dataView.getUint32(GM1_HEADER_OFFSETS.gm1Type, true) as Gm1Type;

  if (!Object.values(Gm1TypeValues).includes(type)) {
    throw new Error(`Unknown GM1 type: ${type}`);
  }

  return type;
}

function mapGm1Structures(byteArray: Uint8Array): Gm1Structures {
  const dataView = new DataView(byteArray.buffer);
  const numberOfPictures = dataView.getUint32(
    GM1_HEADER_OFFSETS.numberOfImages,
    true,
  );

  const headerOffset = 0;
  const offsetsOffset = GM1_HEADER_SIZE + GM1_COLOR_TABLES_SIZE;
  const sizesOffset = offsetsOffset + numberOfPictures * 4;
  const imageHeadersOffset = sizesOffset + numberOfPictures * 4;
  const imageDataOffset =
    imageHeadersOffset + numberOfPictures * GM1_IMAGE_HEADER_SIZE;

  const expectedSize =
    imageDataOffset + dataView.getUint32(GM1_HEADER_OFFSETS.dataSize, true);
  if (byteArray.length !== expectedSize) {
    throw new Error(
      `Invalid GM1 size: expected ${expectedSize}, got ${byteArray.length}`,
    );
  }

  return {
    numberOfImages: numberOfPictures,
    header: new DataView(byteArray.buffer, headerOffset, GM1_HEADER_SIZE),
    offsets: new Uint32Array(byteArray.buffer, offsetsOffset, numberOfPictures),
    sizes: new Uint32Array(byteArray.buffer, sizesOffset, numberOfPictures),
    imageHeaders: new DataView(
      byteArray.buffer,
      imageHeadersOffset,
      numberOfPictures * GM1_IMAGE_HEADER_SIZE,
    ),
    imageData: new Uint8Array(
      byteArray.buffer,
      imageDataOffset,
      byteArray.byteLength - imageDataOffset,
    ),
  };
}

/**
 * Extracts dimensions from an image header DataView
 * @param header - The DataView pointing to an image header (16 bytes)
 * @returns The image dimensions
 */
function extractDimensionsFromImageHeader(header: DataView): ImageDimensions {
  const width = header.getUint16(0, true);
  const height = header.getUint16(2, true);
  const offsetX = header.getInt16(4, true);
  const offsetY = header.getInt16(6, true);
  return {
    width,
    height,
    offsetX,
    offsetY,
  };
}

/**
 * Decodes TGX data to an RGBA8888 ImageData object
 * @param tgxData The TGX data to decode. WARNING: Is consumed by the call.
 * @returns An ImageData object containing the decoded RGBA8888 data
 */
async function decodeTgxToRgba8888(
  width: number,
  height: number,
  tgxData: Uint8Array,
): Promise<ImageData> {
  const decodedData = await decodeTgx(
    width,
    height,
    new DataView(tgxData.buffer),
  );
  return new ImageData(
    await convertArgb1555ToRgba8888(decodedData),
    width,
    height,
  );
}

export async function loadGm1(byteArray: Uint8Array): Promise<Gm1Data> {
  if (byteArray.length < GM1_HEADER_SIZE + GM1_COLOR_TABLES_SIZE) {
    throw new Error("File too small for GM1");
  }

  const type = determineGm1Type(byteArray);
  const gm1Structures = mapGm1Structures(byteArray);
  switch (type) {
    case Gm1TypeValues.tgxConstSize:
      return {
        type,
        data: await parseTgxConstSize(gm1Structures),
      };
    case Gm1TypeValues.interface:
      throw new Error("GM1 Interface format is not yet supported");
    case Gm1TypeValues.animations:
      throw new Error("GM1 Animations format is not yet supported");
    case Gm1TypeValues.tilesObject:
      throw new Error("GM1 Tiles Object format is not yet supported");
    case Gm1TypeValues.font:
      throw new Error("GM1 Font format is not yet supported");
    case Gm1TypeValues.noCompression1:
      throw new Error("GM1 No Compression 1 format is not yet supported");
    case Gm1TypeValues.noCompression2:
      throw new Error("GM1 No Compression 2 format is not yet supported");
    default:
      throw new Error(`Unknown GM1 type: ${type}`);
  }
}

/**
 * Parse TGX Const Size format from GM1 byte array
 * @param gm1Structures - The GM1 file structures
 * @returns The TGX Const Size format data
 */
async function parseTgxConstSize(
  gm1Structures: Gm1Structures,
): Promise<TgxConstSizeData> {
  const width = gm1Structures.header.getUint32(GM1_HEADER_OFFSETS.width, true);
  const height = gm1Structures.header.getUint32(
    GM1_HEADER_OFFSETS.height,
    true,
  );
  const originX = gm1Structures.header.getUint32(
    GM1_HEADER_OFFSETS.originX,
    true,
  );
  const originY = gm1Structures.header.getUint32(
    GM1_HEADER_OFFSETS.originY,
    true,
  );

  const decodePromises: Promise<{
    dimensions: ImageDimensions;
    data: ImageData;
  }>[] = [];

  for (let i = 0; i < gm1Structures.numberOfImages; i++) {
    const headerOffset = i * GM1_IMAGE_HEADER_SIZE;
    const headerView = new DataView(
      gm1Structures.imageHeaders.buffer,
      gm1Structures.imageHeaders.byteOffset + headerOffset,
      GM1_IMAGE_HEADER_SIZE,
    );
    const dimensions = extractDimensionsFromImageHeader(headerView);

    const tgxDataOffset = gm1Structures.offsets[i];
    const tgxDataSize = gm1Structures.sizes[i];
    const tgxData = gm1Structures.imageData.slice(
      tgxDataOffset,
      tgxDataOffset + tgxDataSize,
    );

    // Decode TGX data in parallel
    const decodePromise = (async () => {
      const imageData = await decodeTgxToRgba8888(width, height, tgxData);
      return {
        dimensions,
        data: imageData,
      };
    })();

    decodePromises.push(decodePromise);
  }

  // Wait for all decoding to complete
  const images = await Promise.all(decodePromises);

  // Determine row length by counting images until offsetX decreases
  let previousOffsetX = 0;
  let rowLength = 0;

  for (let i = 0; i < images.length; i++) {
    const offsetX = images[i].dimensions.offsetX;

    // Check if we've moved to a new row (offsetX decreased)
    if (rowLength === 0 && offsetX < previousOffsetX) {
      rowLength = i;
    }
    previousOffsetX = offsetX;
  }

  // If no row transition was found, all images are in one row
  if (rowLength === 0) {
    rowLength = images.length;
  }

  // Compute spacing
  let spacing = 0;
  if (rowLength === 0 || images.length === 1) {
    spacing = 0;
  } else if (rowLength > 1) {
    // Use second image's offsetX minus width
    spacing = images[1].dimensions.offsetX - width;
  } else {
    // Single column: use offsetY minus height
    spacing = images[1].dimensions.offsetY - height;
  }

  return {
    width,
    height,
    rowLength,
    spacing,
    originX,
    originY,
    images: images.map((img) => img.data),
  };
}
