<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watch, watchEffect } from "vue";
import { viewOptions as viewOptionsStorage } from "src/storage/option-storage";

const scaleFactor = ref<number>(1);
const mousePosition = ref<{ x: number; y: number } | null>(null);
const isHovered = ref(false);
const showScaleIndicator = ref(false);

const contentRef = ref<HTMLElement | null>(null);
const containerDimensions = ref({ width: 0, height: 0 });
const overflowContainerRef = ref<HTMLElement | null>(null);

const props = defineProps<{
  frameSize: { width: number; height: number };
}>();

function updateDimensions() {
  if (contentRef.value) {
    containerDimensions.value = {
      width: contentRef.value.offsetWidth * scaleFactor.value,
      height: contentRef.value.offsetHeight * scaleFactor.value,
    };
  }
}

function updateMousePosition(event: MouseEvent) {
  if (overflowContainerRef.value) {
    const rect = overflowContainerRef.value.getBoundingClientRect();
    mousePosition.value = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }
}

function scaleUp() {
  if (scaleFactor.value < 16) {
    scaleFactor.value = scaleFactor.value * 2;
  }
}

function scaleDown() {
  if (scaleFactor.value > 1) {
    scaleFactor.value = scaleFactor.value / 2;
  }
}

function handleWheel(event: WheelEvent) {
  event.preventDefault();
  if (event.deltaY < 0) {
    scaleUp();
  } else {
    scaleDown();
  }
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === "+") {
    event.preventDefault();
    scaleUp();
  } else if (event.key === "-") {
    event.preventDefault();
    scaleDown();
  }
}

function handleMouseEnter(event: MouseEvent) {
  isHovered.value = true;
  updateMousePosition(event);
}

function handleMouseLeave() {
  isHovered.value = false;
  mousePosition.value = null;
}

function handleMouseMove(event: MouseEvent) {
  updateMousePosition(event);
}

function adjustScrollPositionToScale(newScale: number, oldScale: number) {
  if (!overflowContainerRef.value || !contentRef.value) {
    throw new Error(
      "Invalid state: overflowContainerRef or contentRef is null",
    );
  }

  const containerRect = overflowContainerRef.value.getBoundingClientRect();
  const contentRect = contentRef.value.getBoundingClientRect();

  const frameWidth = overflowContainerRef.value.clientWidth;
  const frameHeight = overflowContainerRef.value.clientHeight;

  let newScrollLeft: number;
  let newScrollTop: number;

  if (mousePosition.value) {
    // Calculate the content point under the mouse (in original content coordinates)
    const contentX =
      (containerRect.left - contentRect.left + mousePosition.value.x) /
      oldScale;
    const contentY =
      (containerRect.top - contentRect.top + mousePosition.value.y) / oldScale;

    // Calculate new scroll position to keep same content point under mouse
    newScrollLeft = contentX * newScale - mousePosition.value.x;
    newScrollTop = contentY * newScale - mousePosition.value.y;
  } else {
    // Center zoom when no mouse position
    const offsetX =
      (containerRect.left - contentRect.left + frameWidth / 2) / oldScale;
    const offsetY =
      (containerRect.top - contentRect.top + frameHeight / 2) / oldScale;
    newScrollLeft = offsetX * newScale - frameWidth / 2;
    newScrollTop = offsetY * newScale - frameHeight / 2;
  }

  updateDimensions();

  // Wait for DOM update before setting scroll position
  nextTick(() => {
    if (overflowContainerRef.value) {
      overflowContainerRef.value.scrollLeft = newScrollLeft;
      overflowContainerRef.value.scrollTop = newScrollTop;
    }
  });
}

let scaleIndicatorTimeout: number | null = null;

function triggerScaleIndicator() {
  const options = viewOptionsStorage.read();
  if (!options.showScaleIndicator) {
    return;
  }
  showScaleIndicator.value = true;
  if (scaleIndicatorTimeout !== null) {
    clearTimeout(scaleIndicatorTimeout);
  }
  scaleIndicatorTimeout = window.setTimeout(() => {
    showScaleIndicator.value = false;
  }, 1500);
}

onMounted(() => {
  window.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeydown);
  if (scaleIndicatorTimeout !== null) {
    clearTimeout(scaleIndicatorTimeout);
  }
});

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
  () => scaleFactor.value,
  (newScale, oldScale) => {
    adjustScrollPositionToScale(newScale, oldScale);
    triggerScaleIndicator();
  },
);
</script>

<template>
  <div
    class="fixed-view"
    :style="{
      width: `${props.frameSize.width}px`,
      height: `${props.frameSize.height}px`,
    }"
  >
    <div class="scale-indicator" :class="{ visible: showScaleIndicator }">
      {{ scaleFactor }}x
    </div>
    <div
      ref="overflowContainerRef"
      class="overflow-container"
      @wheel="handleWheel"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
      @mousemove="handleMouseMove"
    >
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
          :style="{ transform: `scale(${scaleFactor})` }"
        >
          <slot></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fixed-view {
  position: relative;
  overflow: hidden;
  /* source: https://stackoverflow.com/a/65129916 */
  background: repeating-conic-gradient(
      var(--color-primary-highlight) 0 25%,
      var(--color-primary) 0 50%
    )
    50% / 80px 80px;
}

.overflow-container {
  display: grid;
  grid-template-columns: 1fr;
  align-items: center;
  justify-items: center;
  width: 100%;
  height: 100%;
  overflow: auto;
}

.scale-indicator {
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 20px 40px;
  border-radius: 8px;
  font-family: monospace;
  font-size: 48px;
  font-weight: bold;
  z-index: 10;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s ease-out;
}

.scale-indicator.visible {
  opacity: 1;
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
