<script setup lang="ts" generic="T extends string | number">
interface Props {
  defaultValue: T;
  label: string;
  options: Record<T, string>;
}

defineProps<Props>();

const model = defineModel<T>({ required: true });
</script>

<template>
  <label>
    <span>{{ label }}</span>
    <select v-model="model">
      <option v-for="[key, label] in Object.entries(options)" :key="key">
        {{ label }}
      </option>
    </select>
    <button @click="model = defaultValue">&#8630;</button>
  </label>
</template>
