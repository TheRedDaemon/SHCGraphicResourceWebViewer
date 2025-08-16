<!-- src/components/general/NumberInput.vue -->
<script setup lang="ts">
import { ref, watch } from "vue";

interface Props {
  min: number;
  max: number;
  defaultValue: number;
  label: string;
  integer: boolean;
  step: number;
}

defineProps<Props>();

const model = defineModel<number>({ required: true });

const value = ref(model.value);
watch(value, () => (model.value = value.value));
</script>

<template>
  <label>
    <span>{{ label }}</span>
    <input
      v-model="value"
      type="number"
      :min="min"
      :max="max"
      :step="step"
      @input="
        value = Math.max(
          min,
          Math.min(integer ? Math.round(value) : value, max),
        )
      "
    />
    <button @click="value = defaultValue">&#8630;</button>
  </label>
</template>
