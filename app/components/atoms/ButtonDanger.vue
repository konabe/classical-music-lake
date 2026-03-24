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
