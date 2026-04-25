<script setup lang="ts" generic="T extends string | number | boolean | null">
interface Props {
  defaultValue?: T;
  label: string;
  options: Record<string, T>;
}

const props = defineProps<Props>();

const model = defineModel<T>({ required: true });
</script>

<template>
  <label>
    <span>{{ props.label }}</span>
    <select v-model="model">
      <option
        v-for="[key, value] in Object.entries(props.options)"
        :key="key"
        :value="value"
      >
        {{ key }}
      </option>
    </select>
    <button
      v-if="props.defaultValue !== undefined"
      @click="model = props.defaultValue"
    >
      &#8630;
    </button>
  </label>
</template>
