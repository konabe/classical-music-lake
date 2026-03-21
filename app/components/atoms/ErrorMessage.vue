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
  color: #c0392b;
  font-size: 0.875rem;
  margin: 0;
}

.error-message.block {
  background: #fff0f0;
  border: 1px solid #f5c6c6;
  padding: 0.8rem 1rem;
  border-radius: 6px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.center {
  text-align: center;
}
</style>
