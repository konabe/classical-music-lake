<script setup lang="ts">
defineProps<{
  label: string;
}>();

const emit = defineEmits<{
  click: [];
}>();
</script>

<template>
  <button class="btn-secondary" @click="emit('click')">{{ label }}</button>
</template>
