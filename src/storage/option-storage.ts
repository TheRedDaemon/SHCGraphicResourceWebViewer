import { LocalStorageHelper } from "./LocalStorageHelper";
import {
  createDefaultQuantizationOptions,
  type QuantizationOptions,
} from "src/objects/options/quantization-options";
import {
  createDefaultTgxCoderOptions,
  type TgxCoderOptions,
} from "src/objects/options/tgx-coder-options";
import {
  createDefaultUploadOptions,
  type UploadOptions,
} from "src/objects/options/upload-options";
import {
  createDefaultViewOptions,
  type ViewOptions,
} from "src/objects/options/view-options";

export const quantizationOptions = new LocalStorageHelper<QuantizationOptions>(
  "quantizationOptions",
  createDefaultQuantizationOptions,
);

export const tgxCoderOptions = new LocalStorageHelper<TgxCoderOptions>(
  "tgxCoderOptions",
  createDefaultTgxCoderOptions,
);

export const uploadOptions = new LocalStorageHelper<UploadOptions>(
  "uploadOptions",
  createDefaultUploadOptions,
);

export const viewOptions = new LocalStorageHelper<ViewOptions>(
  "viewOptions",
  createDefaultViewOptions,
);
