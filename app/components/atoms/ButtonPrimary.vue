<script setup lang="ts">
import type { SubmittableButtonProps, ButtonSlots } from "./button-props";

defineProps<SubmittableButtonProps>();
defineSlots<ButtonSlots>();
</script>

<template>
  <button class="btn-primary" :type="type ?? 'button'" :disabled="disabled">
    <span class="btn-primary-label">
      <slot />
    </span>
  </button>
</template>

<style scoped>
.btn-primary {
  position: relative;
  background: var(--color-bg-ink);
  color: var(--color-bg-paper);
  padding: 0.8rem 1.4rem;
  border: 1px solid var(--color-bg-ink);
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
    border-color 0.25s ease,
    letter-spacing 0.25s ease;
}

.btn-primary-label {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary:hover:not(:disabled) {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: var(--color-bg-ink);
  letter-spacing: calc(var(--tracking-widest) + 0.04em);
}

.btn-primary:active:not(:disabled) {
  background: var(--color-primary-active);
  border-color: var(--color-primary-active);
  color: var(--color-bg-paper);
}

.btn-primary:focus-visible {
  outline: 1px solid var(--color-accent);
  outline-offset: 3px;
}

.btn-primary:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
</style>
