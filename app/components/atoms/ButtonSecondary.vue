<script setup lang="ts">
import type { CommonButtonProps, ButtonSlots } from "./button-props";

defineProps<CommonButtonProps>();
defineSlots<ButtonSlots>();
</script>

<template>
  <button class="btn-secondary" type="button" :disabled="disabled">
    <span class="btn-secondary-label">
      <slot />
    </span>
  </button>
</template>

<style scoped>
.btn-secondary {
  background: transparent;
  color: var(--color-text);
  padding: 0.7rem 1.2rem;
  border: 1px solid var(--color-hairline-strong);
  font-family: var(--font-sans);
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
  cursor: pointer;
  text-decoration: none;
  transition:
    background-color 0.25s ease,
    color 0.25s ease,
    border-color 0.25s ease;
}

.btn-secondary:hover:not(:disabled) {
  background: var(--color-bg-elevated);
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.btn-secondary:focus-visible {
  outline: 1px solid var(--color-accent);
  outline-offset: 3px;
}

.btn-secondary:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
</style>
