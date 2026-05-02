<script setup lang="ts">
import type { CommonButtonProps, ButtonSlots } from "./button-props";

defineProps<CommonButtonProps>();
defineSlots<ButtonSlots>();
</script>

<template>
  <button class="btn-danger" type="button" :disabled="disabled">
    <span class="btn-danger-label">
      <slot />
    </span>
  </button>
</template>

<style scoped>
.btn-danger {
  background: transparent;
  color: var(--color-bordeaux);
  border: 1px solid var(--color-bordeaux);
  padding: 0.7rem 1.1rem;
  font-family: var(--font-sans);
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
  cursor: pointer;
  transition:
    background-color 0.25s ease,
    color 0.25s ease;
}

.btn-danger:hover:not(:disabled) {
  background: var(--color-bordeaux);
  color: var(--color-bg-paper);
}

.btn-danger:focus-visible {
  outline: 1px solid var(--color-bordeaux);
  outline-offset: 3px;
}

.btn-danger:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
</style>
