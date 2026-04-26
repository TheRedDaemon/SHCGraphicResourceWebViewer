<script setup lang="ts">
import {
  nextTick,
  onMounted,
  onUnmounted,
  ref,
  useTemplateRef,
  watch,
} from "vue";
import { viewOptions as viewOptionsStorage } from "src/storage/option-storage";
import PixelIndicator from "./canvas-view/PixelIndicator.vue";
import PositionIndicator from "./canvas-view/PositionIndicator.vue";
import ScaleIndicator from "./canvas-view/ScaleIndicator.vue";

type ScrollMode = "set" | "edit";

// Element type definitions
export type HitMode = "off" | "box" | "pixel" | "pixelOrBox";

export interface ImageElement {
  type: "image";
  x: number;
  y: number;
  imageData: ImageData;
  hitMode: HitMode;
}

export type CanvasElement = ImageElement;

export interface HitResult {
  elementIndex: number;
  canvasPosition: { x: number; y: number };
  elementPosition: { x: number; y: number };
}

const props = defineProps<{
  frameSize: { width: number; height: number };
  contentSize: { width: number; height: number };
  elements: CanvasElement[];
}>();

const emit = defineEmits<{
  hit: [result: HitResult | null];
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
const canvasRef = useTemplateRef<HTMLCanvasElement>("canvas");
const overflowContainerRef = useTemplateRef("overflow-container");

// Non-reactive internal state
const viewOptions = viewOptionsStorage.read();
const pressedArrowKeys = new Set<string>();
let scrollAnimationFrameId: number | null = null;
let renderAnimationFrameId: number | null = null;
let dragStart: { x: number; y: number } | null = null;
let scrollStart: { left: number; top: number } | null = null;
let mousePosition: { x: number; y: number } | null = null;
let isDirty = false;
let canvasContext: CanvasRenderingContext2D | null = null;

function updateDimensions() {
  const border = viewOptions.canvasBorder;
  containerDimensions.value = {
    width: props.contentSize.width * scaleFactor.value + border * 2,
    height: props.contentSize.height * scaleFactor.value + border * 2,
  };
}

function updateNumberOfPositionDigits() {
  const maxDimension = Math.max(
    props.contentSize.width,
    props.contentSize.height,
  );
  numberOfPositionDigits.value = String(maxDimension).length;
}

function isInsideRect(
  x: number,
  y: number,
  rect: { left: number; right: number; top: number; bottom: number },
) {
  return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
}

function render() {
  if (!canvasRef.value) return;

  if (!canvasContext) {
    canvasContext = canvasRef.value.getContext("2d");
    if (!canvasContext) return;
  }

  const canvas = canvasRef.value;
  canvas.width = props.contentSize.width;
  canvas.height = props.contentSize.height;

  canvasContext.clearRect(0, 0, canvas.width, canvas.height);

  for (const element of props.elements) {
    if (element.type === "image") {
      canvasContext.putImageData(element.imageData, element.x, element.y);
    }
  }

  isDirty = false;
}

function scheduleRender() {
  if (renderAnimationFrameId !== null) {
    cancelAnimationFrame(renderAnimationFrameId);
  }
  renderAnimationFrameId = requestAnimationFrame(() => {
    render();
    renderAnimationFrameId = null;
  });
}

function requestRender() {
  if (!isDirty) {
    isDirty = true;
    scheduleRender();
  }
}

function performHitDetection(x: number, y: number): HitResult | null {
  // Check elements front to back (reverse array order)
  let firstTransparentHit: {
    index: number;
    elementPos: { x: number; y: number };
  } | null = null;

  for (let i = props.elements.length - 1; i >= 0; i--) {
    const element = props.elements[i];

    if (element.hitMode === "off") continue;

    if (element.type === "image") {
      const elementWidth = element.imageData.width;
      const elementHeight = element.imageData.height;

      // Check if point is inside element rectangle
      const elementRect = {
        left: element.x,
        right: element.x + elementWidth,
        top: element.y,
        bottom: element.y + elementHeight,
      };

      if (isInsideRect(x, y, elementRect)) {
        const elementX = x - element.x;
        const elementY = y - element.y;

        if (element.hitMode === "box") {
          return {
            elementIndex: i,
            canvasPosition: { x, y },
            elementPosition: { x: elementX, y: elementY },
          };
        }

        if (element.hitMode === "pixel" || element.hitMode === "pixelOrBox") {
          // Check pixel alpha
          const pixelIndex = (elementY * elementWidth + elementX) * 4;
          const alpha = element.imageData.data[pixelIndex + 3];

          if (alpha > 0) {
            return {
              elementIndex: i,
              canvasPosition: { x, y },
              elementPosition: { x: elementX, y: elementY },
            };
          } else if (
            element.hitMode === "pixelOrBox" &&
            firstTransparentHit === null
          ) {
            firstTransparentHit = {
              index: i,
              elementPos: { x: elementX, y: elementY },
            };
          }
        }
      }
    }
  }

  // If no opaque pixel found but we have a transparent hit, return it
  if (firstTransparentHit) {
    return {
      elementIndex: firstTransparentHit.index,
      canvasPosition: { x, y },
      elementPosition: firstTransparentHit.elementPos,
    };
  }

  return null;
}

function performHitDetectionAndEmit(event: MouseEvent) {
  if (!canvasRef.value) {
    emit("hit", null);
    return;
  }

  const canvasRect = canvasRef.value.getBoundingClientRect();

  // Check if mouse is inside canvas bounds
  if (!isInsideRect(event.clientX, event.clientY, canvasRect)) {
    emit("hit", null);
    return;
  }

  // Calculate position relative to the canvas
  const relativeX = event.clientX - canvasRect.left;
  const relativeY = event.clientY - canvasRect.top;

  // Convert to actual pixel coordinates
  const pixelX = Math.floor(relativeX / scaleFactor.value);
  const pixelY = Math.floor(relativeY / scaleFactor.value);

  const hitResult = performHitDetection(pixelX, pixelY);
  emit("hit", hitResult);
}

function extractPositionInformation(event: MouseEvent) {
  if (!canvasRef.value || pressedArrowKeys.size > 0) {
    pixelData.value = null;
    pixelPosition.value = null;
    return;
  }

  const canvasRect = canvasRef.value.getBoundingClientRect();

  // Check if mouse is inside canvas bounds (in client space)
  if (!isInsideRect(event.clientX, event.clientY, canvasRect)) {
    pixelData.value = null;
    pixelPosition.value = null;
    return;
  }

  // Calculate position relative to the canvas
  const relativeX = event.clientX - canvasRect.left;
  const relativeY = event.clientY - canvasRect.top;

  // Convert to actual pixel coordinates by dividing by scale factor
  const pixelX = Math.floor(relativeX / scaleFactor.value);
  const pixelY = Math.floor(relativeY / scaleFactor.value);

  // Update position
  if (
    !pixelPosition.value ||
    pixelPosition.value.x !== pixelX ||
    pixelPosition.value.y !== pixelY
  ) {
    pixelPosition.value = { x: pixelX, y: pixelY };
  }

  // Extract pixel data from canvas context
  if (!canvasContext) {
    pixelData.value = new Uint8ClampedArray([0, 0, 0, 0]);
    return;
  }

  const imageData = canvasContext.getImageData(pixelX, pixelY, 1, 1);
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
  if (!overflowContainerRef.value || !canvasRef.value) {
    throw new Error("Invalid state: overflowContainerRef or canvasRef is null");
  }

  const containerRect = overflowContainerRef.value.getBoundingClientRect();
  const canvasRect = canvasRef.value.getBoundingClientRect();
  const border = viewOptions.canvasBorder;

  const frameWidth = overflowContainerRef.value.clientWidth;
  const frameHeight = overflowContainerRef.value.clientHeight;

  let newScrollLeft: number;
  let newScrollTop: number;

  if (mousePosition) {
    // Calculate the content point under the mouse (in original content coordinates)
    // Account for border offset
    const contentX =
      (containerRect.left - canvasRect.left + mousePosition.x - border) /
      oldScale;
    const contentY =
      (containerRect.top - canvasRect.top + mousePosition.y - border) /
      oldScale;

    // Calculate new scroll position to keep same content point under mouse
    // Add border back to scroll position
    newScrollLeft = contentX * newScale - mousePosition.x + border;
    newScrollTop = contentY * newScale - mousePosition.y + border;
  } else {
    // Center zoom when no mouse position
    // Account for border offset
    const offsetX =
      (containerRect.left - canvasRect.left + frameWidth / 2 - border) /
      oldScale;
    const offsetY =
      (containerRect.top - canvasRect.top + frameHeight / 2 - border) /
      oldScale;
    // Add border back to scroll position
    newScrollLeft = offsetX * newScale - frameWidth / 2 + border;
    newScrollTop = offsetY * newScale - frameHeight / 2 + border;
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

function cancelScrollAnimation() {
  if (scrollAnimationFrameId !== null) {
    cancelAnimationFrame(scrollAnimationFrameId);
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
      if (pressedArrowKeys.size === 0) {
        cancelScrollAnimation();
      }
      break;
  }
}

function handleMouseEnter(event: MouseEvent) {
  updateMousePosition(event);
  extractPositionInformation(event);
  performHitDetectionAndEmit(event);
}

function handleMouseLeave() {
  isDragging.value = false;
  dragStart = null;
  scrollStart = null;
  mousePosition = null;
  pixelData.value = null;
  pixelPosition.value = null;
  emit("hit", null);
}

function handleMouseMove(event: MouseEvent) {
  updateMousePosition(event);
  updateDrag(event);
  extractPositionInformation(event);
  performHitDetectionAndEmit(event);
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

function handleBlur() {
  pressedArrowKeys.clear();
  cancelScrollAnimation();
}

onMounted(() => {
  updateDimensions();
  updateNumberOfPositionDigits();
  requestRender();
});

onUnmounted(() => {
  cancelScrollAnimation();
  if (renderAnimationFrameId !== null) {
    cancelAnimationFrame(renderAnimationFrameId);
  }
});

watch(
  () => props.contentSize,
  () => {
    updateDimensions();
    updateNumberOfPositionDigits();
    requestRender();
  },
);
watch(() => scaleFactor.value, adjustScrollPositionToScale);

defineExpose({
  requestRender,
});
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
    <div class="focus-indicator"></div>
    <div
      ref="overflow-container"
      class="overflow-container"
      :class="{ grabbing: isDragging }"
      tabindex="0"
      @wheel="handleWheel"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
      @mousemove="handleMouseMove"
      @mousedown="handleMouseDown"
      @mouseup="handleMouseUp"
      @keydown="handleKeydown"
      @keyup="handleKeyup"
      @blur="handleBlur"
    >
      <div
        class="size-container"
        :style="{
          width: `${containerDimensions.width}px`,
          height: `${containerDimensions.height}px`,
        }"
      >
        <canvas
          ref="canvas"
          class="canvas-content"
          :style="{
            width: `${props.contentSize.width}px`,
            height: `${props.contentSize.height}px`,
            transform: `scale(${scaleFactor})`,
          }"
        ></canvas>
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

.focus-indicator {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 5;
}

.fixed-view:has(.overflow-container:focus-visible) .focus-indicator {
  outline: 2px solid var(--color-secondary-highlight);
  outline-offset: -2px;
}

.size-container {
  display: grid;
  grid-template-columns: 1fr;
  align-items: center;
  justify-items: center;
}

.canvas-content {
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
  pointer-events: none;
}

.scale-indicator {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 10;
}
</style>
