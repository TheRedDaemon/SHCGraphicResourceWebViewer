export type ViewOptions = {
  showScaleIndicator: boolean;
};

export const SHOW_SCALE_INDICATOR_DEFAULT = true;

export function createDefaultViewOptions(): ViewOptions {
  return {
    showScaleIndicator: SHOW_SCALE_INDICATOR_DEFAULT,
  };
}
