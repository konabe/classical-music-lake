<script setup lang="ts">
defineProps<{
  type?: "button" | "submit";
  disabled?: boolean;
}>();
</script>

<template>
  <button class="btn-primary" :type="type ?? 'button'" :disabled="disabled">
    <slot />
  </button>
</template>

<style scoped>
.btn-primary {
  background: #1e2d5a;
  color: #fff;
  padding: 0.6rem 1.4rem;
  border: none;
  border-radius: 6px;
  font-size: 0.95rem;
  cursor: pointer;
  text-decoration: none;
  transition: background 0.2s;
}

.btn-primary:hover {
  background: #2b3f7e;
}
</style>
