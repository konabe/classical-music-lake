<script setup lang="ts">
defineProps<{
  to: string;
}>();
</script>

<template>
  <NuxtLink :to="to" class="btn-link-primary">
    <slot />
  </NuxtLink>
</template>

<style scoped>
.btn-link-primary {
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

.btn-link-primary:hover {
  background: #2b3f7e;
}
</style>
