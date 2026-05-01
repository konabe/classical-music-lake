<script setup lang="ts">
import type { CommonButtonProps, ButtonSlots } from "./button-props";

defineProps<CommonButtonProps>();
defineSlots<ButtonSlots>();
</script>

<template>
  <button class="btn-danger" type="button" :disabled="disabled">
    <slot />
  </button>
</template>

<style scoped>
.btn-danger {
  background: var(--color-danger-bg);
  color: var(--color-danger);
  border: 1px solid var(--color-danger-border);
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-danger:hover:not(:disabled) {
  background: var(--color-danger-bg-strong);
}

.btn-danger:focus-visible {
  outline: 2px solid var(--color-danger);
  outline-offset: 2px;
}

.btn-danger:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}
</style>
