<script setup lang="ts">
import type { CommonButtonProps, ButtonSlots } from "./button-props";

defineProps<CommonButtonProps>();
defineSlots<ButtonSlots>();
</script>

<template>
  <button class="btn-secondary" type="button" :disabled="disabled">
    <slot />
  </button>
</template>

<style scoped>
.btn-secondary {
  background: var(--color-bg-subtle);
  color: var(--color-text);
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 6px;
  font-size: 0.95rem;
  cursor: pointer;
  text-decoration: none;
  transition: background-color 0.2s;
}

.btn-secondary:hover:not(:disabled) {
  background: var(--color-border-strong);
}

.btn-secondary:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.btn-secondary:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}
</style>
