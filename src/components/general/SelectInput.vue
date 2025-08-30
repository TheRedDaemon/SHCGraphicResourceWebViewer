<script setup lang="ts" generic="T extends string | number | boolean | null">
interface Props {
  defaultValue: T;
  label: string;
  options: Record<string, T>;
}

defineProps<Props>();

const model = defineModel<T>({ required: true });
</script>

<template>
  <label>
    <span>{{ label }}</span>
    <select v-model="model">
      <option
        v-for="[key, value] in Object.entries(options)"
        :key="key"
        :value="value"
      >
        {{ key }}
      </option>
    </select>
    <button @click="model = defaultValue">&#8630;</button>
  </label>
</template>
