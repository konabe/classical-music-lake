<script setup lang="ts">
defineProps<{
  label: string;
  value: string;
}>();
</script>

<template>
  <span class="category-badge">{{ label }}: {{ value }}</span>
</template>

<style scoped>
.category-badge {
  display: inline-block;
  background: #f0ebe0;
  border: 1px solid #e0d8cc;
  border-radius: 4px;
  padding: 0.15rem 0.5rem;
  font-size: 0.8rem;
  color: #555;
}
</style>
