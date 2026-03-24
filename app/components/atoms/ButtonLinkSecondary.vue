<script setup lang="ts">
defineProps<{
  to: string;
}>();
</script>

<template>
  <NuxtLink :to="to" class="btn-link-secondary">
    <slot />
  </NuxtLink>
</template>

<style scoped>
.btn-link-secondary {
  background: #e8edf3;
  color: #1e2d5a;
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 6px;
  font-size: 0.95rem;
  cursor: pointer;
  text-decoration: none;
  transition: background 0.2s;
}

.btn-link-secondary:hover {
  background: #d4dbe8;
}
</style>
