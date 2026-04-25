<script setup lang="ts">
import { ref } from "vue";

interface ImageListItem {
  id: string;
  name: string;
}

const props = defineProps<{
  items: ImageListItem[];
}>();

const emit = defineEmits<{
  (e: "reorder", fromIndex: number, toIndex: number): void;
  (e: "select", index: number): void;
  (e: "remove", index: number): void;
}>();

const selectedIndex = ref<number | null>(null);

function moveUp(index: number) {
  if (index > 0) {
    emit("reorder", index, index - 1);
  }
}

function moveDown(index: number) {
  if (index < props.items.length - 1) {
    emit("reorder", index, index + 1);
  }
}

function selectItem(index: number) {
  selectedIndex.value = index;
  emit("select", index);
}

function removeItem(index: number) {
  emit("remove", index);
  if (selectedIndex.value === index) {
    selectedIndex.value = null;
  }
}
</script>

<template>
  <div class="image-list">
    <div
      v-for="(item, index) in items"
      :key="item.id"
      class="list-item"
      :class="{ selected: selectedIndex === index }"
      @click="selectItem(index)"
    >
      <span class="item-name">{{ item.name }}</span>
      <div class="item-controls">
        <button
          @click.stop="moveUp(index)"
          :disabled="index === 0"
          class="control-button"
          title="Move Up"
        >
          ↑
        </button>
        <button
          @click.stop="moveDown(index)"
          :disabled="index === items.length - 1"
          class="control-button"
          title="Move Down"
        >
          ↓
        </button>
        <button
          @click.stop="removeItem(index)"
          class="control-button remove-button"
          title="Remove"
        >
          ×
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.image-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
  max-height: 100%;
  overflow-y: auto;
}

.list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  border: 1px solid var(--color-secondary);
  border-radius: 0.25rem;
  cursor: pointer;
}

.list-item:hover {
  background: var(--color-secondary);
}

.list-item.selected {
  border-color: var(--color-secondary-highlight);
  background: var(--color-secondary);
}

.item-name {
  color: var(--color-text);
  font-weight: bold;
  flex-grow: 1;
}

.item-controls {
  display: flex;
  gap: 0.25rem;
}

.control-button {
  color: var(--color-primary);
  background: var(--color-secondary);
  border: none;
  padding: 0.25rem 0.5rem;
  cursor: pointer;
  font-size: 1rem;
  border-radius: 0.25rem;
  min-width: 2rem;
}

.control-button:hover:not(:disabled) {
  background: var(--color-secondary-highlight);
}

.control-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.control-button.remove-button {
  color: #ff6b6b;
}

.control-button.remove-button:hover:not(:disabled) {
  background: #ff6b6b;
  color: var(--color-text);
}
</style>
