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
    {{ message }}
  </component>
</template>

<style scoped>
.error-message {
  color: var(--color-danger);
  font-size: 0.875rem;
  margin: 0;
}

.error-message.block {
  background: var(--color-danger-bg);
  border: 1px solid var(--color-danger-border);
  padding: 0.8rem 1rem;
  border-radius: 6px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.center {
  text-align: center;
}
</style>
