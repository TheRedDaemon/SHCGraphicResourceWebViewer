import { LocalStorageHelper } from "./LocalStorageHelper";
import { createDefaultQuantizationOptions } from "src/objects/options/quantization-options";
import { createDefaultTgxCoderOptions } from "src/objects/options/tgx-coder-options";
import { createDefaultUploadOptions } from "src/objects/options/upload-options";
import { createDefaultViewOptions } from "src/objects/options/view-options";

function ensureValidOptions<T extends Record<string, unknown>>(
  key: string,
  initFn: () => T,
): LocalStorageHelper<T> {
  const helper = new LocalStorageHelper<T>(key, initFn);
  const options = helper.read();
  const defaultOptions = initFn();

  const defaultKeys = new Set(Object.keys(defaultOptions));
  const storedKeys = new Set(Object.keys(options));

  let modified = false;

  // Add missing keys from defaults
  for (const key of defaultKeys) {
    if (!storedKeys.has(key)) {
      (options as Record<string, unknown>)[key] = defaultOptions[key];
      modified = true;
    }
  }

  // Remove old keys not in defaults
  for (const key of storedKeys) {
    if (!defaultKeys.has(key)) {
      delete (options as Record<string, unknown>)[key];
      modified = true;
    }
  }

  // Save if modified
  if (modified) {
    helper.write(options);
  }

  return helper;
}

export const quantizationOptions = ensureValidOptions(
  "quantizationOptions",
  createDefaultQuantizationOptions,
);

export const tgxCoderOptions = ensureValidOptions(
  "tgxCoderOptions",
  createDefaultTgxCoderOptions,
);

export const uploadOptions = ensureValidOptions(
  "uploadOptions",
  createDefaultUploadOptions,
);

export const viewOptions = ensureValidOptions(
  "viewOptions",
  createDefaultViewOptions,
);
