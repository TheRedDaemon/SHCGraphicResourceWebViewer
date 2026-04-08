import { defineStore } from "pinia";
import { ref, computed } from "vue";
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
import ResourceNode from "src/objects/ResourceNode";

export const useEditorStore = defineStore("editor", () => {
  // State
  const uploadOptions = ref<UploadOptions>(createDefaultUploadOptions());
  const quantizationOptions = ref<QuantizationOptions>(
    createDefaultQuantizationOptions(),
  );
  const tgxCoderOptions = ref<TgxCoderOptions>(createDefaultTgxCoderOptions());
  const currentResource = ref<ResourceNode>(
    ResourceNode.create(
      { x: 0, y: 0 },
      { width: 0, height: 0 },
      { type: "empty" },
    ),
  );

  // Getters
  const hasImage = computed(
    () => currentResource.value.content.type !== "empty",
  );

  // Actions
  function setResource(resource: ResourceNode) {
    currentResource.value = resource;
  }

  function clearResource() {
    currentResource.value = ResourceNode.create(
      { x: 0, y: 0 },
      { width: 0, height: 0 },
      { type: "empty" },
    );
  }

  function resetQuantizationOptions() {
    quantizationOptions.value = createDefaultQuantizationOptions();
  }

  function resetTgxCoderOptions() {
    tgxCoderOptions.value = createDefaultTgxCoderOptions();
  }

  function resetAllOptions() {
    resetQuantizationOptions();
    resetTgxCoderOptions();
  }

  return {
    uploadOptions,
    quantizationOptions,
    tgxCoderOptions,
    currentResource,
    hasImage,
    setResource,
    clearResource,
    resetQuantizationOptions,
    resetTgxCoderOptions,
    resetAllOptions,
  };
});
