<script setup lang="ts">
import { ref, watch } from "vue";

interface CutRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

const props = defineProps<{
  imageUrl?: string;
}>();

const emit = defineEmits<{
  (e: "regions-change", regions: CutRegion[]): void;
}>();

const cutRegions = ref<CutRegion[]>([{ x: 0, y: 0, width: 100, height: 100 }]);
const selectedRegionIndex = ref<number | null>(0);
const canvasRef = ref<HTMLCanvasElement | null>(null);
const imageRef = ref<HTMLImageElement | null>(null);

watch(
  () => props.imageUrl,
  (newUrl) => {
    if (newUrl && imageRef.value) {
      imageRef.value.src = newUrl;
    }
  },
  { immediate: true },
);

watch(cutRegions, (newRegions) => {
  emit("regions-change", newRegions);
}, { deep: true });

function onImageLoad() {
  if (imageRef.value && canvasRef.value) {
    const img = imageRef.value;
    const canvas = canvasRef.value;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx.drawImage(img, 0, 0);

    // Reset cut regions to cover entire image
    cutRegions.value = [
      {
        x: 0,
        y: 0,
        width: img.naturalWidth,
        height: img.naturalHeight,
      },
    ];
  }
}

function addRegion() {
  cutRegions.value.push({
    x: 0,
    y: 0,
    width: 50,
    height: 50,
  });
}

function removeRegion(index: number) {
  cutRegions.value.splice(index, 1);
  if (selectedRegionIndex.value === index) {
    selectedRegionIndex.value = null;
  }
}

function selectRegion(index: number) {
  selectedRegionIndex.value = index;
}

function updateRegion(index: number, field: keyof CutRegion, value: number) {
  if (cutRegions.value[index]) {
    cutRegions.value[index][field] = value;
  }
}
</script>

<template>
  <div class="image-cut-editor">
    <div class="canvas-container">
      <img
        ref="imageRef"
        :src="imageUrl"
        style="display: none"
        @load="onImageLoad"
      />
      <canvas ref="canvasRef" class="image-canvas"></canvas>
      <div
        v-for="(region, index) in cutRegions"
        :key="index"
        class="cut-region"
        :class="{ selected: selectedRegionIndex === index }"
        :style="{
          left: `${region.x}px`,
          top: `${region.y}px`,
          width: `${region.width}px`,
          height: `${region.height}px`,
        }"
        @click="selectRegion(index)"
      ></div>
    </div>
    <div class="regions-list">
      <h3>Cut Regions</h3>
      <div
        v-for="(region, index) in cutRegions"
        :key="index"
        class="region-item"
        :class="{ selected: selectedRegionIndex === index }"
      >
        <span>Region {{ index + 1 }}</span>
        <div class="region-inputs">
          <label>
            X:
            <input
              type="number"
              :value="region.x"
              @input="updateRegion(index, 'x', Number(($event.target as HTMLInputElement).value))"
            />
          </label>
          <label>
            Y:
            <input
              type="number"
              :value="region.y"
              @input="updateRegion(index, 'y', Number(($event.target as HTMLInputElement).value))"
            />
          </label>
          <label>
            W:
            <input
              type="number"
              :value="region.width"
              @input="updateRegion(index, 'width', Number(($event.target as HTMLInputElement).value))"
            />
          </label>
          <label>
            H:
            <input
              type="number"
              :value="region.height"
              @input="updateRegion(index, 'height', Number(($event.target as HTMLInputElement).value))"
            />
          </label>
        </div>
        <button @click="removeRegion(index)" class="remove-button">Remove</button>
      </div>
      <button @click="addRegion" class="add-button">Add Region</button>
    </div>
  </div>
</template>

<style scoped>
.image-cut-editor {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  height: 100%;
}

.canvas-container {
  position: relative;
  flex-grow: 1;
  overflow: auto;
  border: 1px solid var(--color-secondary);
}

.image-canvas {
  display: block;
  max-width: 100%;
}

.cut-region {
  position: absolute;
  border: 2px solid var(--color-primary);
  background: rgba(0, 0, 0, 0.2);
  cursor: pointer;
}

.cut-region.selected {
  border-color: var(--color-secondary-highlight);
  background: rgba(0, 0, 0, 0.4);
}

.regions-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 300px;
  overflow-y: auto;
}

.regions-list h3 {
  margin: 0;
  color: var(--color-text);
}

.region-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.5rem;
  border: 1px solid var(--color-secondary);
  border-radius: 0.25rem;
}

.region-item.selected {
  border-color: var(--color-secondary-highlight);
}

.region-inputs {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.region-inputs label {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: var(--color-text);
  font-size: 0.875rem;
}

.region-inputs input {
  width: 60px;
  color: var(--color-primary);
  background: var(--color-secondary);
  border: none;
  padding: 0.25rem;
  border-radius: 0.25rem;
}

.remove-button,
.add-button {
  align-self: flex-start;
  color: var(--color-primary);
  background: var(--color-secondary);
  border: none;
  padding: 0.25rem 0.5rem;
  cursor: pointer;
  font-size: 0.875rem;
  border-radius: 0.25rem;
}

.remove-button:hover,
.add-button:hover {
  background: var(--color-secondary-highlight);
}
</style>
