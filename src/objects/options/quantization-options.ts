import type {
  ColorDistanceFormula,
  PaletteQuantization,
  ImageQuantization,
} from "image-q";

// source: https://dev.to/shnydercom/string-literal-union-types-to-array-or-how-to-kick-pluto-out-of-the-list-of-planets-f21
export const ColorDistanceFormulaHelper: {
  [s in ColorDistanceFormula]: ColorDistanceFormula;
} = {
  "cie94-textiles": "cie94-textiles",
  "cie94-graphic-arts": "cie94-graphic-arts",
  ciede2000: "ciede2000",
  "color-metric": "color-metric",
  euclidean: "euclidean",
  "euclidean-bt709-noalpha": "euclidean-bt709-noalpha",
  "euclidean-bt709": "euclidean-bt709",
  manhattan: "manhattan",
  "manhattan-bt709": "manhattan-bt709",
  "manhattan-nommyde": "manhattan-nommyde",
  pngquant: "pngquant",
};

export const PaletteQuantizationHelper: {
  [s in PaletteQuantization]: PaletteQuantization;
} = {
  "neuquant-float": "neuquant-float",
  neuquant: "neuquant",
  rgbquant: "rgbquant",
  wuquant: "wuquant",
};

export const ImageQuantizationHelper: {
  [s in ImageQuantization]: ImageQuantization;
} = {
  nearest: "nearest",
  riemersma: "riemersma",
  "floyd-steinberg": "floyd-steinberg",
  "false-floyd-steinberg": "false-floyd-steinberg",
  stucki: "stucki",
  atkinson: "atkinson",
  jarvis: "jarvis",
  burkes: "burkes",
  sierra: "sierra",
  "two-sierra": "two-sierra",
  "sierra-lite": "sierra-lite",
};

export type QuantizationOptions = {
  alphaThreshold: number;
  useQuantization: boolean;
  useFullPalette: boolean;
  reducedPaletteColors: number;
  reducedPaletteColorDistanceFormula: ColorDistanceFormula;
  reducedPaletteQuantization: PaletteQuantization;
  imageColorDistanceFormula: ColorDistanceFormula;
  imageQuantization: ImageQuantization;
};

export const ALPHA_THRESHOLD_DEFAULT = 127;
export const ALPHA_THRESHOLD_MAX = 255;
export const ALPHA_THRESHOLD_MIN = 0;

export const REDUCED_PALETTE_COLORS_DEFAULT = 256;
export const REDUCED_PALETTE_COLORS_MIN = 1;
export const REDUCED_PALETTE_COLORS_MAX = 2 ** 16;

export const REDUCED_PALETTE_COLOR_DISTANCE_FORMULA_DEFAULT =
  ColorDistanceFormulaHelper["euclidean-bt709"];
export const REDUCED_PALETTE_QUANTIZATION_DEFAULT =
  PaletteQuantizationHelper.rgbquant;
export const IMAGE_COLOR_DISTANCE_FORMULA_DEFAULT =
  ColorDistanceFormulaHelper["euclidean-bt709"];
export const IMAGE_QUANTIZATION_DEFAULT = ImageQuantizationHelper.stucki;

export function validateAlphaThreshold(alphaThreshold: number): number {
  if (
    alphaThreshold < ALPHA_THRESHOLD_MIN ||
    alphaThreshold > ALPHA_THRESHOLD_MAX
  ) {
    throw new Error(
      `Alpha threshold must be between ${ALPHA_THRESHOLD_MIN} and ${ALPHA_THRESHOLD_MAX}`,
    );
  }
  return alphaThreshold;
}

export function validateReducedPaletteColors(
  reducedPaletteColors: number,
): number {
  if (
    reducedPaletteColors < REDUCED_PALETTE_COLORS_MIN ||
    reducedPaletteColors > REDUCED_PALETTE_COLORS_MAX
  ) {
    throw new Error(
      `Reduced palette max colors must be between ${REDUCED_PALETTE_COLORS_MIN} and ${REDUCED_PALETTE_COLORS_MAX}`,
    );
  }
  return reducedPaletteColors;
}

export function createDefaultQuantizationOptions(): QuantizationOptions {
  return {
    alphaThreshold: ALPHA_THRESHOLD_DEFAULT,
    useQuantization: false,
    useFullPalette: false,
    reducedPaletteColors: REDUCED_PALETTE_COLORS_DEFAULT,
    reducedPaletteColorDistanceFormula:
      REDUCED_PALETTE_COLOR_DISTANCE_FORMULA_DEFAULT,
    reducedPaletteQuantization: REDUCED_PALETTE_QUANTIZATION_DEFAULT,
    imageColorDistanceFormula: IMAGE_COLOR_DISTANCE_FORMULA_DEFAULT,
    imageQuantization: IMAGE_QUANTIZATION_DEFAULT,
  };
}
