<script setup lang="ts">
interface Props {
  defaultValue: boolean;
  label: string;
}

defineProps<Props>();

const model = defineModel<boolean>({ required: true });
</script>

<template>
  <label>
    <span>{{ label }}</span>
    <input v-model="model" type="checkbox" />
    <button @click="model = defaultValue">&#8630;</button>
  </label>
</template>
