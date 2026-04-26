export type ViewOptions = {
  showScaleIndicator: boolean;
  showPixelIndicator: boolean;
  showPositionIndicator: boolean;
  canvasBorder: number;
};

export const SHOW_SCALE_INDICATOR_DEFAULT = true;
export const SHOW_PIXEL_INDICATOR_DEFAULT = true;
export const SHOW_POSITION_INDICATOR_DEFAULT = true;
export const CANVAS_BORDER_DEFAULT = 400;
export const CANVAS_BORDER_MIN = 0;
export const CANVAS_BORDER_MAX = 10000;

export function createDefaultViewOptions(): ViewOptions {
  return {
    showScaleIndicator: SHOW_SCALE_INDICATOR_DEFAULT,
    showPixelIndicator: SHOW_PIXEL_INDICATOR_DEFAULT,
    showPositionIndicator: SHOW_POSITION_INDICATOR_DEFAULT,
    canvasBorder: CANVAS_BORDER_DEFAULT,
  };
}
