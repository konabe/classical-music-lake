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
  <div class="select-wrap">
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
    <span class="select-caret" aria-hidden="true">&#x25BE;</span>
  </div>
</template>

<style scoped>
.select-wrap {
  position: relative;
  width: 100%;
}

.select-input {
  appearance: none;
  -webkit-appearance: none;
  border: none;
  border-bottom: 1px solid var(--color-hairline-strong);
  border-radius: 0;
  padding: 0.55rem 1.6rem 0.55rem 0.1rem;
  font-size: 0.95rem;
  background: transparent;
  color: var(--color-text);
  transition: border-color 0.25s ease;
  width: 100%;
  box-sizing: border-box;
  font-family: var(--font-sans);
  cursor: pointer;
}

.select-input:hover:not(:disabled) {
  border-bottom-color: var(--color-text-muted);
}

.select-input:focus {
  outline: none;
  border-bottom-color: var(--color-accent);
}

.select-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.select-caret {
  position: absolute;
  right: 0.3rem;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: var(--color-accent);
  font-size: 0.85rem;
}
</style>
