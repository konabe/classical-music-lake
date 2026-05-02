<script setup lang="ts">
defineProps<{
  message: string;
  variant?: "inline" | "block";
  center?: boolean;
}>();
</script>

<template>
  <component
    :is="variant === 'block' ? 'div' : 'p'"
    class="error-message"
    :class="{ block: variant === 'block', center }"
  >
    <span v-if="variant === 'block'" class="error-mark smallcaps" aria-hidden="true">
      Error &mdash;
    </span>
    {{ message }}
  </component>
</template>

<style scoped>
.error-message {
  color: var(--color-bordeaux);
  font-family: var(--font-serif);
  font-style: italic;
  font-size: 0.9rem;
  margin: 0;
}
:root.dark .error-message {
  color: var(--color-bordeaux);
  filter: brightness(1.15);
}

.error-message.block {
  background: transparent;
  border: 1px solid var(--color-bordeaux);
  border-left: 3px solid var(--color-bordeaux);
  padding: 0.9rem 1.1rem;
  border-radius: 0;
  margin-bottom: 1rem;
  font-size: 0.95rem;
  display: flex;
  align-items: baseline;
  gap: 0.6rem;
}

.error-mark {
  color: var(--color-bordeaux);
  font-style: normal;
  font-weight: 700;
  flex-shrink: 0;
}

.center {
  text-align: center;
}
</style>
