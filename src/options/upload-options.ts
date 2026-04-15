export const ALPHA_THRESHOLD_DEFAULT = 127;
export const ALPHA_THRESHOLD_MAX = 255;
export const ALPHA_THRESHOLD_MIN = 0;

export type UploadOptions = {
  alphaThreshold: number;
};

export function createDefaultUploadOptions(): UploadOptions {
  return {
    alphaThreshold: ALPHA_THRESHOLD_DEFAULT,
  };
}
