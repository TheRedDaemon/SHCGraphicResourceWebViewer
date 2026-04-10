<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watch, watchEffect } from "vue";

const scaleFactor = ref<number>(1);
const mousePosition = ref<{ x: number; y: number } | null>(null);
const isHovered = ref(false);

const contentRef = ref<HTMLElement | null>(null);
const containerDimensions = ref({ width: 0, height: 0 });
const overflowContainerRef = ref<HTMLElement | null>(null);

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

onMounted(() => {
  window.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeydown);
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
    if (!overflowContainerRef.value) {
      throw new Error("Invalid state: overflowContainerRef is null");
    }

    // Store current scroll position
    const oldScrollLeft = overflowContainerRef.value.scrollLeft;
    const oldScrollTop = overflowContainerRef.value.scrollTop;

    // Calculate relative position (use mouse position if available, otherwise center)
    const viewportWidth = overflowContainerRef.value.clientWidth;
    const viewportHeight = overflowContainerRef.value.clientHeight;

    let newScrollLeft: number;
    let newScrollTop: number;

    if (mousePosition.value) {
      // Calculate the content point under the mouse (in original content coordinates)
      const contentX = (oldScrollLeft + mousePosition.value.x) / oldScale;
      const contentY = (oldScrollTop + mousePosition.value.y) / oldScale;

      // Calculate new scroll position to keep same content point under mouse
      newScrollLeft = contentX * newScale - mousePosition.value.x;
      newScrollTop = contentY * newScale - mousePosition.value.y;
    } else {
      // Center zoom when no mouse position
      const centerX = oldScrollLeft + viewportWidth / 2;
      const centerY = oldScrollTop + viewportHeight / 2;
      const scaleRatio = newScale / oldScale;
      newScrollLeft = centerX * scaleRatio - viewportWidth / 2;
      newScrollTop = centerY * scaleRatio - viewportHeight / 2;
    }

    updateDimensions();

    // Wait for DOM update before setting scroll position
    nextTick(() => {
      if (overflowContainerRef.value) {
        // Set new scroll position
        overflowContainerRef.value.scrollLeft = newScrollLeft;
        overflowContainerRef.value.scrollTop = newScrollTop;
      }
    });
  },
);
</script>

<template>
  <div class="fixed-view">
    <div class="mouse-position">
      Mouse on Frame: {{ mousePosition?.x ?? "N/A" }},
      {{ mousePosition?.y ?? "N/A" }}
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
  width: 100%;
  height: 100%;
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

.mouse-position {
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 12px;
  z-index: 10;
  pointer-events: none;
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
