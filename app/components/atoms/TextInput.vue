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
  border: none;
  border-bottom: 1px solid var(--color-hairline-strong);
  border-radius: 0;
  padding: 0.55rem 0.1rem;
  font-size: 0.95rem;
  background: transparent;
  color: var(--color-text);
  transition:
    border-color 0.25s ease,
    background 0.25s ease;
  width: 100%;
  box-sizing: border-box;
  font-family: var(--font-sans);
}

.text-input::placeholder {
  color: var(--color-text-faint);
  font-style: italic;
}

.text-input:hover:not(:disabled) {
  border-bottom-color: var(--color-text-muted);
}

.text-input:focus {
  outline: none;
  border-bottom-color: var(--color-accent);
  background: linear-gradient(
    180deg,
    transparent 0%,
    transparent 92%,
    var(--color-accent-bg) 92%,
    var(--color-accent-bg) 100%
  );
}

.text-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
