<script setup lang="ts">
import { nextTick, ref, watch, watchEffect } from "vue";

const props = defineProps<{
  scaleFactor: number;
}>();

const contentRef = ref<HTMLElement | null>(null);
const containerDimensions = ref({ width: 0, height: 0 });
const fixedViewRef = ref<HTMLElement | null>(null);

function updateDimensions() {
  if (contentRef.value) {
    containerDimensions.value = {
      width: contentRef.value.offsetWidth * props.scaleFactor,
      height: contentRef.value.offsetHeight * props.scaleFactor,
    };
  }
}

// only creates observer, which fires directly
watchEffect((onCleanup) => {
  if (contentRef.value) {
    const observer = new ResizeObserver(() => {
      updateDimensions();
    });
    observer.observe(contentRef.value);
    onCleanup(() => observer.disconnect());
  }
});

// respond to scaling
watch(
  () => props.scaleFactor,
  (newScale, oldScale) => {
    if (!fixedViewRef.value) {
      throw new Error("Invalid state: fixedViewRef is null");
    }

    // Store current scroll position
    const oldScrollLeft = fixedViewRef.value.scrollLeft;
    const oldScrollTop = fixedViewRef.value.scrollTop;

    // Calculate relative position (center of viewport)
    const viewportWidth = fixedViewRef.value.clientWidth;
    const viewportHeight = fixedViewRef.value.clientHeight;
    const relativeX = oldScrollLeft + viewportWidth / 2;
    const relativeY = oldScrollTop + viewportHeight / 2;

    updateDimensions();

    // Wait for DOM update before setting scroll position
    nextTick(() => {
      if (fixedViewRef.value) {
        // Calculate new scroll position to maintain relative point
        const scaleRatio = newScale / oldScale;
        const newScrollLeft = relativeX * scaleRatio - viewportWidth / 2;
        const newScrollTop = relativeY * scaleRatio - viewportHeight / 2;

        // Set new scroll position
        fixedViewRef.value.scrollLeft = newScrollLeft;
        fixedViewRef.value.scrollTop = newScrollTop;
      }
    });
  },
);
</script>

<template>
  <div ref="fixedViewRef" class="fixed-view">
    <div
      class="size-container"
      :style="{
        width: `${containerDimensions.width}px`,
        height: `${containerDimensions.height}px`,
      }"
    >
      <div
        ref="contentRef"
        class="scaled-content"
        :style="{ transform: `scale(${props.scaleFactor})` }"
      >
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fixed-view {
  display: grid;
  grid-template-columns: 1fr;
  align-items: center;
  justify-items: center;
  width: 100%;
  height: 100%;
  overflow: auto;
  /* source: https://stackoverflow.com/a/65129916 */
  background: repeating-conic-gradient(
      var(--color-primary-highlight) 0 25%,
      var(--color-primary) 0 50%
    )
    50% / 80px 80px;
}

.size-container {
  display: grid;
  grid-template-columns: 1fr;
  align-items: center;
  justify-items: center;
}

.scaled-content {
  transform-origin: center;
  image-rendering: pixelated;
}
</style>
