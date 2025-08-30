import { type ColorDistanceFormula, type DitheringKernel } from "rgbquant";

// source: https://dev.to/shnydercom/string-literal-union-types-to-array-or-how-to-kick-pluto-out-of-the-list-of-planets-f21
export const DitheringKernelHelper: {
  [s in DitheringKernel | "None"]: DitheringKernel | null;
} = {
  None: null,
  FloydSteinberg: "FloydSteinberg",
  FalseFloydSteinberg: "FalseFloydSteinberg",
  Stucki: "Stucki",
  Atkinson: "Atkinson",
  Jarvis: "Jarvis",
  Burkes: "Burkes",
  Sierra: "Sierra",
  TwoSierra: "TwoSierra",
  SierraLite: "SierraLite",
};

export const ColorDistanceFormulaHelper: {
  [s in ColorDistanceFormula]: ColorDistanceFormula;
} = {
  euclidean: "euclidean",
  manhattan: "manhattan",
};

export const HistogramMethodHelper: Record<string, 1 | 2> = {
  SubregionMinPopulationThreshold: 1,
  GlobalTopPopulation: 2,
};

// taken from RgbQuant.js
export type QuantizationOptions = {
  alphaThreshold: number;
  useQuantization: boolean;

  colors: number; // desired palette size
  method: 1 | 2; // histogram method, 2: min-population threshold within subregions; 1: global top-population
  boxSize: [number, number]; // subregion dims (if method = 2)
  boxPxls: number; // min-population threshold (if method = 2)
  initColors: number; // # of top-occurring colors to start with (if method = 1)
  minHueCols: number; // # of colors per hue group to evaluate regardless of counts, to retain low-count hues
  dithKern: DitheringKernel | null; // dithering kernel name, see available kernels in docs below
  dithDelta: number; // dithering threshhold (0-1) e.g: 0.05 will not dither colors with <= 5% difference
  dithSerp: boolean; // enable serpentine pattern dithering
  palette: [number, number, number][]; // a predefined palette to start with in r,g,b tuple format: [[r,g,b],[r,g,b]...]
  reIndex: boolean; // affects predefined palettes only. if true, allows compacting of sparsed palette once target palette size is reached. also enables palette sorting.
  useCache: boolean; // enables caching for perf usually, but can reduce perf in some cases, like pre-def palettes
  cacheFreq: number; // min color occurance count needed to qualify for caching
  colorDist: ColorDistanceFormula; // method used to determine color distance, can also be "manhattan"

  // not listed in docs (usage conditions are unclear):
  initDist: number; // color-distance threshold for initial reduction pass
  distIncr: number; // subsequent passes threshold
  hueGroups: number; // palette grouping
  satGroups: number; // palette grouping
  lumGroups: number; // palette grouping
};

const NUMBER_OF_16_BIT_COLORS = 2 ** 16;

export const ALPHA_THRESHOLD_DEFAULT = 127;
export const ALPHA_THRESHOLD_MAX = 255;
export const ALPHA_THRESHOLD_MIN = 0;

export const USE_QUANTIZATION_DEFAULT = false;

export const COLORS_DEFAULT = 256;
export const COLORS_MIN = 1;
export const COLORS_MAX = NUMBER_OF_16_BIT_COLORS;

export const HISTOGRAM_METHOD_DEFAULT =
  HistogramMethodHelper["SubregionMinPopulationThreshold"];

export const BOX_SIZE_DIMENSION_DEFAULT = 64;
export const BOX_SIZE_DIMENSION_MAX = Number.MAX_SAFE_INTEGER;
export const BOX_SIZE_DIMENSION_MIN = 1;

export const BOX_PIXELS_DEFAULT = 2;
export const BOX_PIXELS_MAX = Number.MAX_SAFE_INTEGER;
export const BOX_PIXELS_MIN = 1;

export const INIT_COLORS_DEFAULT = 4096;
export const INIT_COLORS_MAX = NUMBER_OF_16_BIT_COLORS;
export const INIT_COLORS_MIN = 1;

export const MIN_HUE_COLORS_DEFAULT = 0;
export const MIN_HUE_COLORS_MAX = NUMBER_OF_16_BIT_COLORS;
export const MIN_HUE_COLORS_MIN = 0;

export const DITHERING_KERNEL_DEFAULT = DitheringKernelHelper["Stucki"];

export const DITHERING_DELTA_DEFAULT = 0;
export const DITHERING_DELTA_MAX = 1;
export const DITHERING_DELTA_MIN = 0;

export const DITHERING_SERPENTINE_DEFAULT = false;

export const PALETTE_DEFAULT: [number, number, number][] = [];

export const REINDEX_DEFAULT = false;

export const USE_CACHE_DEFAULT = true;

export const CACHE_FREQUENCY_THRESHOLD_DEFAULT = 10;
export const CACHE_FREQUENCY_THRESHOLD_MAX = Number.MAX_SAFE_INTEGER;
export const CACHE_FREQUENCY_THRESHOLD_MIN = 1;

export const COLOR_DISTANCE_FORMULA_DEFAULT =
  ColorDistanceFormulaHelper["euclidean"];

export const INIT_DIST_DEFAULT = 0.01;
export const INIT_DIST_MAX = 1;
export const INIT_DIST_MIN = 0;

export const DIST_INCR_DEFAULT = 0.005;
export const DIST_INCR_MAX = 1;
export const DIST_INCR_MIN = 0;

export const HUE_GROUPS_DEFAULT = 10;
export const HUE_GROUPS_MAX = Number.MAX_SAFE_INTEGER;
export const HUE_GROUPS_MIN = 1;

export const SAT_GROUPS_DEFAULT = 10;
export const SAT_GROUPS_MAX = Number.MAX_SAFE_INTEGER;
export const SAT_GROUPS_MIN = 1;

export const LUM_GROUPS_DEFAULT = 10;
export const LUM_GROUPS_MAX = Number.MAX_SAFE_INTEGER;
export const LUM_GROUPS_MIN = 1;

export function createDefaultQuantizationOptions(): QuantizationOptions {
  return {
    alphaThreshold: ALPHA_THRESHOLD_DEFAULT,
    useQuantization: USE_QUANTIZATION_DEFAULT,

    colors: COLORS_DEFAULT,
    method: HISTOGRAM_METHOD_DEFAULT,
    boxSize: [BOX_SIZE_DIMENSION_DEFAULT, BOX_SIZE_DIMENSION_DEFAULT],
    boxPxls: BOX_PIXELS_DEFAULT,
    initColors: INIT_COLORS_DEFAULT,
    minHueCols: MIN_HUE_COLORS_DEFAULT,
    dithKern: DITHERING_KERNEL_DEFAULT,
    dithDelta: DITHERING_DELTA_DEFAULT,
    dithSerp: DITHERING_SERPENTINE_DEFAULT,
    palette: PALETTE_DEFAULT,
    reIndex: REINDEX_DEFAULT,
    useCache: USE_CACHE_DEFAULT,
    cacheFreq: CACHE_FREQUENCY_THRESHOLD_DEFAULT,
    colorDist: COLOR_DISTANCE_FORMULA_DEFAULT,

    initDist: INIT_DIST_DEFAULT,
    distIncr: DIST_INCR_DEFAULT,
    hueGroups: HUE_GROUPS_DEFAULT,
    satGroups: SAT_GROUPS_DEFAULT,
    lumGroups: LUM_GROUPS_DEFAULT,
  };
}
