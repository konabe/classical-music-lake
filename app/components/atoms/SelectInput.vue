<script setup lang="ts">
defineProps<{
  modelValue: string;
  options: { value: string; label: string }[];
  id?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}>();

defineEmits<{
  "update:modelValue": [value: string];
}>();
</script>

<template>
  <select
    :id="id"
    class="select-input"
    :value="modelValue"
    :required="required"
    :disabled="disabled"
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
  border: 1px solid var(--color-secondary);
  border-radius: 6px;
  padding: 0.6rem 0.8rem;
  font-size: 0.95rem;
  background: var(--color-bg-input);
  color: var(--color-text);
  transition: border-color 0.2s;
  width: 100%;
  box-sizing: border-box;
  font-family: inherit;
}

.select-input:focus {
  outline: none;
  border-color: var(--color-primary);
}
</style>
