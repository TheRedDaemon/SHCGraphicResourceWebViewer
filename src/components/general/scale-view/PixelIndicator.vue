<script setup lang="ts">
import { computed } from "vue";
import { convertPixelRgba8888ToArgb1555 } from "src/functions/color-depth-converter";

const props = defineProps<{
  pixelData: Uint8ClampedArray | null;
}>();

const argb1555String = computed(() => {
  if (!props.pixelData) return null;
  const converted = convertPixelRgba8888ToArgb1555(
    props.pixelData[0],
    props.pixelData[1],
    props.pixelData[2],
    props.pixelData[3],
  );
  return `A:${converted.a} R:${String(converted.r).padStart(2, "\u00A0")} G:${String(converted.g).padStart(2, "\u00A0")} B:${String(converted.b).padStart(2, "\u00A0")}`;
});
</script>

<template>
  <div class="pixel-indicator" :class="{ visible: pixelData !== null }">
    {{ argb1555String ?? "N/A" }}
    <div
      class="color-swatch"
      :style="{
        backgroundColor: pixelData
          ? `rgba(${pixelData[0]}, ${pixelData[1]}, ${pixelData[2]}, ${pixelData[3] / 255})`
          : 'transparent',
      }"
    ></div>
  </div>
</template>

<style scoped>
.pixel-indicator {
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  font-family: monospace, monospace;
  font-size: 24px;
  font-weight: bold;
  pointer-events: none;
  opacity: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.pixel-indicator.visible {
  opacity: 1;
}

.color-swatch {
  width: 30px;
  height: 30px;
  border: 2px solid white;
  border-radius: 4px;
}
</style>
