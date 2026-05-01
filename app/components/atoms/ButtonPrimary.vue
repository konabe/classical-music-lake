<script setup lang="ts">
import type { SubmittableButtonProps, ButtonSlots } from "./button-props";

defineProps<SubmittableButtonProps>();
defineSlots<ButtonSlots>();
</script>

<template>
  <button class="btn-primary" :type="type ?? 'button'" :disabled="disabled">
    <slot />
  </button>
</template>

<style scoped>
.btn-primary {
  background: var(--color-primary);
  color: var(--color-on-primary);
  padding: 0.6rem 1.4rem;
  border: none;
  border-radius: 6px;
  font-size: 0.95rem;
  cursor: pointer;
  text-decoration: none;
  transition: background-color 0.2s;
}

.btn-primary:hover:not(:disabled) {
  background: var(--color-primary-hover);
}

.btn-primary:active:not(:disabled) {
  background: var(--color-primary-active);
}

.btn-primary:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.btn-primary:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}
</style>
