<script setup lang="ts">
defineProps<{
  modelValue: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}>();

defineEmits<{
  "update:modelValue": [value: string];
}>();
</script>

<template>
  <select
    class="select-input"
    :value="modelValue"
    @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
  >
    <option value="">{{ placeholder ?? "---" }}</option>
    <option v-for="option in options" :key="option.value" :value="option.value">
      {{ option.label }}
    </option>
  </select>
</template>

<style scoped>
.select-input {
  border: 1px solid #9aa5b4;
  border-radius: 6px;
  padding: 0.6rem 0.8rem;
  font-size: 0.95rem;
  background: #faf3e0;
  transition: border-color 0.2s;
  width: 100%;
  box-sizing: border-box;
  font-family: inherit;
}

.select-input:focus {
  outline: none;
  border-color: #1e2d5a;
}
</style>
