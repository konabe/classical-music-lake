<script setup lang="ts">
defineProps<{
  isFavorite: boolean;
}>();
</script>

<template>
  <span v-if="isFavorite" class="favorite-indicator">♥</span>
</template>

<style scoped>
.favorite-indicator {
  color: #e05a5a;
  margin-right: 0.3rem;
}
</style>
