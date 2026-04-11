export type ViewOptions = {
  showScaleIndicator: boolean;
  showPixelIndicator: boolean;
};

export const SHOW_SCALE_INDICATOR_DEFAULT = true;
export const SHOW_PIXEL_INDICATOR_DEFAULT = true;

export function createDefaultViewOptions(): ViewOptions {
  return {
    showScaleIndicator: SHOW_SCALE_INDICATOR_DEFAULT,
    showPixelIndicator: SHOW_PIXEL_INDICATOR_DEFAULT,
  };
}
