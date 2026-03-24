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
