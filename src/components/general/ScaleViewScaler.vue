<script setup lang="ts">
interface Props {
  label: string;
}

const props = defineProps<Props>();

const model = defineModel<number>({ required: true });

function decrease() {
  if (model.value > 1) {
    model.value = model.value / 2;
  }
}

function increase() {
  if (model.value < 16) {
    model.value = model.value * 2;
  }
}
</script>

<template>
  <label>
    <span>{{ props.label }}</span>
    <button @click="decrease">-</button>
    <span>{{ model }}</span>
    <button @click="increase">+</button>
  </label>
</template>
