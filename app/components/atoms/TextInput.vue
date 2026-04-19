<script setup lang="ts">
defineProps<{
  modelValue: string;
  id?: string;
  type?: "text" | "email" | "password";
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
}>();

defineEmits<{
  "update:modelValue": [value: string];
}>();
</script>

<template>
  <input
    :id="id"
    class="text-input"
    :type="type ?? 'text'"
    :value="modelValue"
    :placeholder="placeholder"
    :disabled="disabled"
    :required="required"
    @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
  />
</template>

<style scoped>
.text-input {
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

.text-input:focus {
  outline: none;
  border-color: var(--color-primary);
}
</style>
