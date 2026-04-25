<!-- src/components/general/RangeInput.vue -->
<script setup lang="ts">
import { computed } from "vue";

interface Props {
  min: number;
  max: number;
  defaultValue?: number;
  label: string;
  integer: boolean;
  step: number;
}

const props = defineProps<Props>();

const model = defineModel<number>({ required: true });

const value = computed({
  get: () => model.value,
  set: (val) => {
    model.value = props.integer ? Math.round(val) : val;
  },
});
</script>

<template>
  <label>
    <span>{{ props.label }}</span>
    <input
      v-model.number="value"
      type="range"
      :min="props.min"
      :max="props.max"
      :step="props.step"
    />
    <span>{{ value }}</span>
    <button
      v-if="props.defaultValue !== undefined"
      @click="model = props.defaultValue"
    >
      &#8630;
    </button>
  </label>
</template>
