<script setup lang="ts">
defineProps<{
  label: string;
}>();

const emit = defineEmits<{
  click: [];
}>();
</script>

<template>
  <button type="button" class="btn-danger" @click="emit('click')">{{ label }}</button>
</template>

<style scoped>
.btn-danger {
  background: #fff0f0;
  color: #c0392b;
  border: 1px solid #f5c6c6;
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-danger:hover {
  background: #ffe0e0;
}
</style>
