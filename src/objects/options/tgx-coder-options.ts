export type TgxCoderOptions = {
  pixelRepeatThreshold: number;
  paddingAlignment: number;
};

export const PIXEL_REPEAT_THRESHOLD_DEFAULT = 3;
export const PIXEL_REPEAT_THRESHOLD_MAX = 255;
export const PIXEL_REPEAT_THRESHOLD_MIN = 0;

export const PADDING_ALIGNMENT_DEFAULT = 4;
export const PADDING_ALIGNMENT_MAX = 255;
export const PADDING_ALIGNMENT_MIN = 1;

export function validatePixelRepeatThreshold(
  pixelRepeatThreshold: number,
): number {
  if (
    pixelRepeatThreshold < PIXEL_REPEAT_THRESHOLD_MIN ||
    pixelRepeatThreshold > PIXEL_REPEAT_THRESHOLD_MAX
  ) {
    throw new Error(
      `Pixel repeat threshold must be between ${PIXEL_REPEAT_THRESHOLD_MIN} and ${PIXEL_REPEAT_THRESHOLD_MAX}`,
    );
  }
  return pixelRepeatThreshold;
}

export function validatePaddingAlignment(paddingAlignment: number): number {
  if (
    paddingAlignment < PADDING_ALIGNMENT_MIN ||
    paddingAlignment > PADDING_ALIGNMENT_MAX
  ) {
    throw new Error(
      `Padding alignment must be between ${PADDING_ALIGNMENT_MIN} and ${PADDING_ALIGNMENT_MAX}`,
    );
  }
  return paddingAlignment;
}

export function createDefaultTgxCoderOptions(): TgxCoderOptions {
  return {
    pixelRepeatThreshold: PIXEL_REPEAT_THRESHOLD_DEFAULT,
    paddingAlignment: PADDING_ALIGNMENT_DEFAULT,
  };
}
