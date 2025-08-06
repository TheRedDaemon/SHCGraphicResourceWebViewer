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

export default class QuantizationOptions {
  static get ALPHA_THRESHOLD_DEFAULT(): number {
    return 127;
  }
  static get ALPHA_THRESHOLD_MAX(): number {
    return 255;
  }
  static get ALPHA_THRESHOLD_MIN(): number {
    return 0;
  }

  static get REDUCED_PALETTE_COLORS_DEFAULT(): number {
    return 256;
  }
  static get REDUCED_PALETTE_COLORS_MIN(): number {
    return 1;
  }
  static get REDUCED_PALETTE_COLORS_MAX(): number {
    return 2 ** 16;
  }

  static get REDUCED_PALETTE_COLOR_DISTANCE_FORMULA_DEFAULT(): ColorDistanceFormula {
    return ColorDistanceFormulaHelper["euclidean-bt709"];
  }
  static get REDUCED_PALETTE_QUANTIZATION_DEFAULT(): PaletteQuantization {
    return PaletteQuantizationHelper.rgbquant;
  }
  static get IMAGE_COLOR_DISTANCE_FORMULA_DEFAULT(): ColorDistanceFormula {
    return ColorDistanceFormulaHelper["euclidean-bt709"];
  }
  static get IMAGE_QUANTIZATION_DEFAULT(): ImageQuantization {
    return ImageQuantizationHelper.stucki;
  }

  #alphaThreshold: number = QuantizationOptions.ALPHA_THRESHOLD_DEFAULT;
  #useQuantization: boolean = false;
  #reducedPaletteColors: number =
    QuantizationOptions.REDUCED_PALETTE_COLORS_DEFAULT;
  #useFullPalette: boolean = false;
  #reducedPaletteColorDistanceFormula: ColorDistanceFormula =
    QuantizationOptions.REDUCED_PALETTE_COLOR_DISTANCE_FORMULA_DEFAULT;
  #reducedPaletteQuantization: PaletteQuantization =
    QuantizationOptions.REDUCED_PALETTE_QUANTIZATION_DEFAULT;
  #imageColorDistanceFormula: ColorDistanceFormula =
    QuantizationOptions.IMAGE_COLOR_DISTANCE_FORMULA_DEFAULT;
  #imageQuantization: ImageQuantization =
    QuantizationOptions.IMAGE_QUANTIZATION_DEFAULT;

  copy(): QuantizationOptions {
    const duplicate = new QuantizationOptions();
    duplicate.#alphaThreshold = this.#alphaThreshold;
    duplicate.#useQuantization = this.#useQuantization;
    duplicate.#useFullPalette = this.#useFullPalette;
    duplicate.#reducedPaletteColors = this.#reducedPaletteColors;
    duplicate.#reducedPaletteColorDistanceFormula =
      this.#reducedPaletteColorDistanceFormula;
    duplicate.#reducedPaletteQuantization = this.#reducedPaletteQuantization;
    duplicate.#imageColorDistanceFormula = this.#imageColorDistanceFormula;
    duplicate.#imageQuantization = this.#imageQuantization;
    return duplicate;
  }

  get alphaThreshold(): number {
    return this.#alphaThreshold;
  }

  set alphaThreshold(alphaThreshold: number) {
    if (
      alphaThreshold < QuantizationOptions.ALPHA_THRESHOLD_MIN ||
      alphaThreshold > QuantizationOptions.ALPHA_THRESHOLD_MAX
    ) {
      throw new Error(
        `Alpha threshold must be between ${QuantizationOptions.ALPHA_THRESHOLD_MIN} and ${QuantizationOptions.ALPHA_THRESHOLD_MAX}`,
      );
    }
    this.#alphaThreshold = alphaThreshold;
  }

  get useQuantization(): boolean {
    return this.#useQuantization;
  }

  set useQuantization(useQuantization: boolean) {
    this.#useQuantization = useQuantization;
  }

  get useFullPalette(): boolean {
    return this.#useFullPalette;
  }

  set useFullPalette(useFullPalette: boolean) {
    this.#useFullPalette = useFullPalette;
  }

  get reducedPaletteColors(): number {
    return this.#reducedPaletteColors;
  }

  set reducedPaletteColors(reducedPaletteColors: number) {
    if (
      reducedPaletteColors < QuantizationOptions.REDUCED_PALETTE_COLORS_MIN ||
      reducedPaletteColors > QuantizationOptions.REDUCED_PALETTE_COLORS_MAX
    ) {
      throw new Error(
        `Reduced palette max colors must be between ${QuantizationOptions.REDUCED_PALETTE_COLORS_MIN} and ${QuantizationOptions.REDUCED_PALETTE_COLORS_MAX}`,
      );
    }
    this.#reducedPaletteColors = reducedPaletteColors;
  }

  get reducedPaletteColorDistanceFormula(): ColorDistanceFormula {
    return this.#reducedPaletteColorDistanceFormula;
  }

  set reducedPaletteColorDistanceFormula(
    reducedPaletteColorDistanceFormula: ColorDistanceFormula,
  ) {
    this.#reducedPaletteColorDistanceFormula =
      reducedPaletteColorDistanceFormula;
  }

  get reducedPaletteQuantization(): PaletteQuantization {
    return this.#reducedPaletteQuantization;
  }

  set reducedPaletteQuantization(
    reducedPaletteQuantization: PaletteQuantization,
  ) {
    this.#reducedPaletteQuantization = reducedPaletteQuantization;
  }

  get imageColorDistanceFormula(): ColorDistanceFormula {
    return this.#imageColorDistanceFormula;
  }

  set imageColorDistanceFormula(
    imageColorDistanceFormula: ColorDistanceFormula,
  ) {
    this.#imageColorDistanceFormula = imageColorDistanceFormula;
  }

  get imageQuantization(): ImageQuantization {
    return this.#imageQuantization;
  }

  set imageQuantization(imageQuantization: ImageQuantization) {
    this.#imageQuantization = imageQuantization;
  }
}
