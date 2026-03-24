<script setup lang="ts">
defineProps<{
  label: string;
}>();

const emit = defineEmits<{
  click: [];
}>();
</script>

<template>
  <button type="button" class="btn-secondary" @click="emit('click')">{{ label }}</button>
</template>

<style scoped>
.btn-secondary {
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

.btn-secondary:hover {
  background: #d4dbe8;
}
</style>
