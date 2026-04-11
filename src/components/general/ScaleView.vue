<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watch, watchEffect } from "vue";
import { viewOptions as viewOptionsStorage } from "src/storage/option-storage";
import PixelIndicator from "./scale-view/PixelIndicator.vue";
import PositionIndicator from "./scale-view/PositionIndicator.vue";
import ScaleIndicator from "./scale-view/ScaleIndicator.vue";

type ScrollMode = "set" | "edit";

const props = defineProps<{
  frameSize: { width: number; height: number };
}>();

// Constants
const MIDDLE_MOUSE_BUTTON = 1;
const ARROW_KEY_MOVEMENT = 10;

// Reactive state (used in template or passed to children)
const scaleFactor = ref<number>(1);
const pixelData = ref<Uint8ClampedArray | null>(null);
const pixelPosition = ref<{ x: number; y: number } | null>(null);
const isDragging = ref(false);
const containerDimensions = ref({ width: 0, height: 0 });
const numberOfPositionDigits = ref(4);

// Template refs
const contentRef = ref<HTMLElement | null>(null);
const overflowContainerRef = ref<HTMLElement | null>(null);

// Non-reactive internal state
const viewOptions = viewOptionsStorage.read();
const pressedArrowKeys = new Set<string>();
let scrollAnimationFrameId: number | null = null;
let dragStart: { x: number; y: number } | null = null;
let scrollStart: { left: number; top: number } | null = null;
let mousePosition: { x: number; y: number } | null = null;

function updateDimensions() {
  if (contentRef.value) {
    containerDimensions.value = {
      width: contentRef.value.offsetWidth * scaleFactor.value,
      height: contentRef.value.offsetHeight * scaleFactor.value,
    };
  }
}

function updateNumberOfPositionDigits() {
  if (!contentRef.value) return;
  const maxWidth = contentRef.value.offsetWidth;
  const maxHeight = contentRef.value.offsetHeight;
  const maxDimension = Math.max(maxWidth, maxHeight);
  numberOfPositionDigits.value = String(maxDimension).length;
}

function isInsideRect(x: number, y: number, rect: DOMRect) {
  return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
}

function extractPixel(event: MouseEvent) {
  if (!contentRef.value || pressedArrowKeys.size > 0) {
    pixelData.value = null;
    return;
  }

  const contentRect = contentRef.value.getBoundingClientRect();

  // Check if mouse is inside contentRef bounds (in client space)
  if (!isInsideRect(event.clientX, event.clientY, contentRect)) {
    pixelData.value = null;
    return;
  }

  const target = event.target;

  if (!(target instanceof HTMLCanvasElement)) {
    pixelData.value = new Uint8ClampedArray([0, 0, 0, 0]);
    return;
  }

  // Get canvas bounding box
  const canvasRect = target.getBoundingClientRect();

  // Calculate position relative to the canvas
  const relativeX = event.clientX - canvasRect.left;
  const relativeY = event.clientY - canvasRect.top;

  // Convert to actual pixel coordinates by dividing by scale factor
  const pixelX = Math.floor(relativeX / scaleFactor.value);
  const pixelY = Math.floor(relativeY / scaleFactor.value);

  // Extract pixel data from canvas
  const context = target.getContext("2d");
  if (!context) {
    pixelData.value = new Uint8ClampedArray([0, 0, 0, 0]);
    return;
  }

  const imageData = context.getImageData(pixelX, pixelY, 1, 1);
  // Avoid unnecessary re-renders by checking if pixel data actually changed
  const newData = imageData.data;
  if (
    !pixelData.value ||
    newData[0] !== pixelData.value[0] ||
    newData[1] !== pixelData.value[1] ||
    newData[2] !== pixelData.value[2] ||
    newData[3] !== pixelData.value[3]
  ) {
    pixelData.value = newData;
  }
}

function extractPosition(event: MouseEvent) {
  if (!contentRef.value || pressedArrowKeys.size > 0) {
    pixelPosition.value = null;
    return;
  }

  // Get contentRef bounding box
  const contentRect = contentRef.value.getBoundingClientRect();

  // Check if mouse is inside contentRef bounds (in client space)
  if (!isInsideRect(event.clientX, event.clientY, contentRect)) {
    pixelPosition.value = null;
    return;
  }

  // Calculate position relative to the contentRef
  const relativeX = event.clientX - contentRect.left;
  const relativeY = event.clientY - contentRect.top;

  // Convert to actual pixel coordinates by dividing by scale factor
  const pixelX = Math.floor(relativeX / scaleFactor.value);
  const pixelY = Math.floor(relativeY / scaleFactor.value);

  // Avoid unnecessary re-renders by checking if position actually changed
  if (
    !pixelPosition.value ||
    pixelPosition.value.x !== pixelX ||
    pixelPosition.value.y !== pixelY
  ) {
    pixelPosition.value = { x: pixelX, y: pixelY };
  }
}

function updateMousePosition(event: MouseEvent) {
  if (overflowContainerRef.value) {
    const rect = overflowContainerRef.value.getBoundingClientRect();
    mousePosition = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }
}

function updateDrag(event: MouseEvent) {
  if (isDragging.value && dragStart && scrollStart) {
    const deltaX = event.clientX - dragStart.x;
    const deltaY = event.clientY - dragStart.y;
    modifyScroll("set", scrollStart.left - deltaX, scrollStart.top - deltaY);
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

function modifyScroll(mode: ScrollMode, left?: number, top?: number) {
  if (!overflowContainerRef.value) {
    throw new Error("Invalid state: overflowContainerRef is null");
  }

  if (left !== undefined) {
    overflowContainerRef.value.scrollLeft =
      mode === "set" ? left : overflowContainerRef.value.scrollLeft + left;
  }
  if (top !== undefined) {
    overflowContainerRef.value.scrollTop =
      mode === "set" ? top : overflowContainerRef.value.scrollTop + top;
  }
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

  if (mousePosition) {
    // Calculate the content point under the mouse (in original content coordinates)
    const contentX =
      (containerRect.left - contentRect.left + mousePosition.x) / oldScale;
    const contentY =
      (containerRect.top - contentRect.top + mousePosition.y) / oldScale;

    // Calculate new scroll position to keep same content point under mouse
    newScrollLeft = contentX * newScale - mousePosition.x;
    newScrollTop = contentY * newScale - mousePosition.y;
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
    modifyScroll("set", newScrollLeft, newScrollTop);
  });
}

function applyArrowKeyScroll() {
  let deltaX = 0;
  let deltaY = 0;

  if (pressedArrowKeys.has("ArrowLeft")) deltaX -= ARROW_KEY_MOVEMENT;
  if (pressedArrowKeys.has("ArrowRight")) deltaX += ARROW_KEY_MOVEMENT;
  if (pressedArrowKeys.has("ArrowUp")) deltaY -= ARROW_KEY_MOVEMENT;
  if (pressedArrowKeys.has("ArrowDown")) deltaY += ARROW_KEY_MOVEMENT;

  if (deltaX !== 0 || deltaY !== 0) {
    modifyScroll("edit", deltaX, deltaY);
  }

  if (pressedArrowKeys.size > 0) {
    scrollAnimationFrameId = requestAnimationFrame(applyArrowKeyScroll);
  } else {
    scrollAnimationFrameId = null;
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
  switch (event.key) {
    case "+":
      event.preventDefault();
      scaleUp();
      break;
    case "-":
      event.preventDefault();
      scaleDown();
      break;
    case "ArrowUp":
    case "ArrowDown":
    case "ArrowLeft":
    case "ArrowRight":
      event.preventDefault();
      pressedArrowKeys.add(event.key);
      // Deactivate indicators during keyboard navigation
      pixelData.value = null;
      pixelPosition.value = null;
      if (!scrollAnimationFrameId) {
        scrollAnimationFrameId = requestAnimationFrame(applyArrowKeyScroll);
      }
      break;
  }
}

function handleKeyup(event: KeyboardEvent) {
  switch (event.key) {
    case "ArrowUp":
    case "ArrowDown":
    case "ArrowLeft":
    case "ArrowRight":
      pressedArrowKeys.delete(event.key);
      if (pressedArrowKeys.size === 0 && scrollAnimationFrameId !== null) {
        cancelAnimationFrame(scrollAnimationFrameId);
        scrollAnimationFrameId = null;
      }
      break;
  }
}

function handleMouseEnter(event: MouseEvent) {
  updateMousePosition(event);
  extractPixel(event);
  extractPosition(event);
}

function handleMouseLeave() {
  isDragging.value = false;
  dragStart = null;
  scrollStart = null;
  mousePosition = null;
  pixelData.value = null;
  pixelPosition.value = null;
}

function handleMouseMove(event: MouseEvent) {
  updateMousePosition(event);
  updateDrag(event);
  extractPixel(event);
  extractPosition(event);
}

function handleMouseDown(event: MouseEvent) {
  if (event.button === MIDDLE_MOUSE_BUTTON && overflowContainerRef.value) {
    event.preventDefault();
    isDragging.value = true;
    dragStart = { x: event.clientX, y: event.clientY };
    scrollStart = {
      left: overflowContainerRef.value.scrollLeft,
      top: overflowContainerRef.value.scrollTop,
    };
  }
}

function handleMouseUp(event: MouseEvent) {
  if (event.button === MIDDLE_MOUSE_BUTTON) {
    isDragging.value = false;
    dragStart = null;
    scrollStart = null;
  }
}

onMounted(() => {
  window.addEventListener("keydown", handleKeydown);
  window.addEventListener("keyup", handleKeyup);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeydown);
  window.removeEventListener("keyup", handleKeyup);
  if (scrollAnimationFrameId !== null) {
    cancelAnimationFrame(scrollAnimationFrameId);
  }
});

// only creates observer, which fires directly
watchEffect((onCleanup) => {
  if (contentRef.value) {
    const observer = new ResizeObserver(() => {
      updateDimensions();
      updateNumberOfPositionDigits();
    });
    observer.observe(contentRef.value);
    onCleanup(() => observer.disconnect());
  }
});

// respond to scaling
watch(() => scaleFactor.value, adjustScrollPositionToScale);
</script>

<template>
  <div
    class="fixed-view"
    :style="{
      width: `${props.frameSize.width}px`,
      height: `${props.frameSize.height}px`,
    }"
  >
    <ScaleIndicator
      v-if="viewOptions.showScaleIndicator"
      :scaleFactor="scaleFactor"
    />
    <div class="indicators-container-top-right">
      <PixelIndicator
        v-if="viewOptions.showPixelIndicator"
        :pixelData="pixelData"
      />
      <PositionIndicator
        v-if="viewOptions.showPositionIndicator"
        :pixelPosition="pixelPosition"
        :numberOfDigits="numberOfPositionDigits"
      />
    </div>
    <div
      ref="overflowContainerRef"
      class="overflow-container"
      :class="{ grabbing: isDragging }"
      @wheel="handleWheel"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
      @mousemove="handleMouseMove"
      @mousedown="handleMouseDown"
      @mouseup="handleMouseUp"
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
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.overflow-container::-webkit-scrollbar {
  display: none;
}

.overflow-container.grabbing {
  cursor: grabbing;
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

.indicators-container-top-right {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: flex-end;
  z-index: 10;
}

.scale-indicator {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 10;
}
</style>
