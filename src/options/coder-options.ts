export type CoderOptions = {
  coderWorkers: number;
  pixelRepeatThreshold: number;
  paddingAlignment: number;
};

export const CODER_WORKERS_DEFAULT = 2;
export const CODER_WORKERS_MAX = 16;
export const CODER_WORKERS_MIN = 1;

export const PIXEL_REPEAT_THRESHOLD_DEFAULT = 3;
export const PIXEL_REPEAT_THRESHOLD_MAX = 255;
export const PIXEL_REPEAT_THRESHOLD_MIN = 0;

export const PADDING_ALIGNMENT_DEFAULT = 4;
export const PADDING_ALIGNMENT_MAX = 255;
export const PADDING_ALIGNMENT_MIN = 1;

export function createDefaultCoderOptions(): CoderOptions {
  return {
    coderWorkers: CODER_WORKERS_DEFAULT,
    pixelRepeatThreshold: PIXEL_REPEAT_THRESHOLD_DEFAULT,
    paddingAlignment: PADDING_ALIGNMENT_DEFAULT,
  };
}
