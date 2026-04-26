<script setup lang="ts">
import {
  ref,
  computed,
  onMounted,
  onUnmounted,
  watch,
  nextTick,
  watchEffect,
  useTemplateRef,
} from "vue";
import ScaleView from "src/components/general/ScaleView.vue";
import ImageList from "src/components/general/ImageList.vue";
import type { TgxConstSizeData } from "src/functions/gm1-file";

defineOptions({
  name: "TgxConstSizeEditor",
});

const emit = defineEmits<{
  (e: "update", data: TgxConstSizeData): void;
  (e: "back"): void;
}>();

const data = ref<TgxConstSizeData | null>(null);
const canvasRefs = ref<HTMLCanvasElement[]>([]);
const viewWrapper = useTemplateRef("view-wrapper");

onMounted(() => {
  window.addEventListener("init-data", handleInitData);
});

onUnmounted(() => {
  window.removeEventListener("init-data", handleInitData);
});

function handleInitData(event: Event) {
  const customEvent = event as CustomEvent;
  data.value = customEvent.detail as TgxConstSizeData;
}

function receiveData(newData: TgxConstSizeData) {
  data.value = newData;
}

defineExpose({
  receiveData,
});

const frameSize = ref({ width: 1280, height: 720 });
const selectedImageIndex = ref<number | null>(null);

const contentSize = computed(() => {
  if (!data.value) return { width: 0, height: 0 };

  let maxX = 0;
  let maxY = 0;

  data.value.images.forEach((image, index) => {
    const row = Math.floor(index / data.value!.rowLength);
    const col = index % data.value!.rowLength;
    const x = col * (data.value!.width + data.value!.spacing);
    const y = row * (data.value!.height + data.value!.spacing);
    const right = x + image.width;
    const bottom = y + image.height;
    maxX = Math.max(maxX, right);
    maxY = Math.max(maxY, bottom);
  });

  return { width: maxX, height: maxY };
});

// Watch container size with ResizeObserver
watchEffect((onCleanup) => {
  if (viewWrapper.value) {
    const observer = new ResizeObserver((entries) => {
      if (entries.length != 1) {
        throw new Error("Expected exactly one observer entry");
      }
      const { width, height } = entries[0].contentRect;
      frameSize.value = { width, height };
    });
    observer.observe(viewWrapper.value);
    onCleanup(() => observer.disconnect());
  }
});

// Watch for data changes to redraw canvases
watch(
  [data, selectedImageIndex],
  async () => {
    if (data.value) {
      await nextTick();
      drawCanvases();
    }
  },
  { deep: true },
);

function drawCanvases() {
  if (!data.value) return;

  const currentData = data.value;

  currentData.images.forEach((image, index) => {
    const canvas = canvasRefs.value[index];
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size to image size
    canvas.width = image.width;
    canvas.height = image.height;

    // Draw image data
    ctx.putImageData(image, 0, 0);
  });
}

const imageListItems = computed(() => {
  if (!data.value) return [];
  return data.value.images.map((img, index) => ({
    id: `${index}`,
    name: `Frame ${index + 1} (${img.width}x${img.height})`,
  }));
});

function handleReorder(fromIndex: number, toIndex: number) {
  if (!data.value) return;
  const newImages = [...data.value.images];
  const [moved] = newImages.splice(fromIndex, 1);
  newImages.splice(toIndex, 0, moved);
  emit("update", { ...data.value, images: newImages });
}

function handleSelect(index: number) {
  selectedImageIndex.value = index;
}

function handleRemove(index: number) {
  if (!data.value) return;
  const newImages = data.value.images.filter((_, i) => i !== index);
  emit("update", { ...data.value, images: newImages });
  if (selectedImageIndex.value === index) {
    selectedImageIndex.value = null;
  }
}

function updateSetting(field: keyof TgxConstSizeData, value: number) {
  if (!data.value) return;
  emit("update", { ...data.value, [field]: value });
}

function updateFrameSize(field: "width" | "height", value: number) {
  if (!data.value) return;
  emit("update", {
    ...data.value,
    [field]: value,
  });
}
</script>

<template>
  <div class="tgx-const-size-editor">
    <div class="top-bar">
      <button @click="emit('back')" class="back-button">← Back</button>
      <span class="file-type">TGX Const Size Format</span>
      <button @click="data && emit('update', data)" class="save-button">
        Save
      </button>
    </div>
    <div class="editor-content">
      <div class="sidebar">
        <div class="settings-panel">
          <h3>Settings</h3>
          <div class="setting-inputs">
            <label>
              Frame Width:
              <input
                type="number"
                :value="data?.width"
                @input="
                  updateFrameSize(
                    'width',
                    Number(($event.target as HTMLInputElement).value),
                  )
                "
              />
            </label>
            <label>
              Frame Height:
              <input
                type="number"
                :value="data?.height"
                @input="
                  updateFrameSize(
                    'height',
                    Number(($event.target as HTMLInputElement).value),
                  )
                "
              />
            </label>
            <label>
              Row Length:
              <input
                type="number"
                :value="data?.rowLength"
                @input="
                  updateSetting(
                    'rowLength',
                    Number(($event.target as HTMLInputElement).value),
                  )
                "
              />
            </label>
            <label>
              Spacing:
              <input
                type="number"
                :value="data?.spacing"
                @input="
                  updateSetting(
                    'spacing',
                    Number(($event.target as HTMLInputElement).value),
                  )
                "
              />
            </label>
            <label>
              Origin X:
              <input
                type="number"
                :value="data?.originX"
                @input="
                  updateSetting(
                    'originX',
                    Number(($event.target as HTMLInputElement).value),
                  )
                "
              />
            </label>
            <label>
              Origin Y:
              <input
                type="number"
                :value="data?.originY"
                @input="
                  updateSetting(
                    'originY',
                    Number(($event.target as HTMLInputElement).value),
                  )
                "
              />
            </label>
          </div>
        </div>
        <ImageList
          :items="imageListItems"
          @reorder="handleReorder"
          @select="handleSelect"
          @remove="handleRemove"
        />
      </div>
      <div class="main-view">
        <div class="view-wrapper" ref="view-wrapper">
          <ScaleView :frameSize="frameSize" :contentSize="contentSize">
            <template v-if="data">
              <canvas
                v-for="(image, index) in data.images"
                :key="index"
                :ref="
                  (el) => {
                    if (el) canvasRefs[index] = el as HTMLCanvasElement;
                  }
                "
                class="image-canvas"
                :class="{ selected: selectedImageIndex === index }"
                :style="{
                  position: 'absolute',
                  left: `${
                    (index % data.rowLength) * (data.width + data.spacing)
                  }px`,
                  top: `${
                    Math.floor(index / data.rowLength) *
                    (data.height + data.spacing)
                  }px`,
                  width: `${image.width}px`,
                  height: `${image.height}px`,
                }"
              ></canvas>
            </template>
            <div v-if="selectedImageIndex !== null && data" class="frame-info">
              <h3>Frame {{ selectedImageIndex + 1 }}</h3>
              <p>
                Size: {{ data.images[selectedImageIndex].width }}x{{
                  data.images[selectedImageIndex].height
                }}
              </p>
            </div>
          </ScaleView>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tgx-const-size-editor {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
  background: var(--color-secondary);
  gap: 1rem;
}

.back-button,
.save-button {
  color: var(--color-primary);
  background: var(--color-secondary-highlight);
  border: none;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-weight: bold;
  border-radius: 0.25rem;
}

.back-button:hover,
.save-button:hover {
  background: var(--color-primary);
  color: var(--color-text);
}

.file-type {
  color: var(--color-text);
  font-weight: bold;
}

.editor-content {
  display: flex;
  flex-grow: 1;
  overflow: hidden;
}

.sidebar {
  width: 300px;
  border-right: 1px solid var(--color-secondary);
  overflow-y: auto;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.settings-panel {
  padding: 0.5rem;
  background: var(--color-secondary);
  border-radius: 0.25rem;
}

.settings-panel h3 {
  margin: 0 0 0.5rem 0;
  color: var(--color-text);
}

.setting-inputs {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.setting-inputs label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  color: var(--color-text);
  font-size: 0.875rem;
}

.setting-inputs input {
  width: 80px;
  color: var(--color-primary);
  background: var(--color-secondary-highlight);
  border: none;
  padding: 0.25rem;
  border-radius: 0.25rem;
}

.main-view {
  flex-grow: 1;
  overflow: hidden;
}

.view-wrapper {
  flex-grow: 1;
  margin: 1rem;
  overflow: hidden;
  position: relative;
}

.image-canvas {
  display: block;
}

.image-canvas.selected {
  border-color: #ff0000;
}

.frame-info {
  position: absolute;
  top: 10px;
  right: 10px;
  background: var(--color-secondary);
  padding: 1rem;
  border-radius: 0.5rem;
  z-index: 10;
}

.frame-info h3 {
  margin: 0 0 0.5rem 0;
  color: var(--color-text);
}

.frame-info p {
  margin: 0;
  color: var(--color-text);
}
</style>
