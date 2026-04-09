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

const props = defineProps<Props>();

const model = defineModel<number>({ required: true });

// required, since validation has to happen directly on the input, otherwise
const value = ref(model.value);
watch(value, () => (model.value = value.value));
watch(model, () => (value.value = model.value));
</script>

<template>
  <label>
    <span>{{ props.label }}</span>
    <input
      v-model="value"
      type="number"
      :min="props.min"
      :max="props.max"
      :step="props.step"
      @input="
        value = Math.max(
          props.min,
          Math.min(props.integer ? Math.round(value) : value, props.max),
        )
      "
    />
    <button @click="value = props.defaultValue">&#8630;</button>
  </label>
</template>
