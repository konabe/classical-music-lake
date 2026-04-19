<script setup lang="ts">
defineProps<{
  rating: number;
}>();

const { ratingStars } = useRatingDisplay();
</script>

<template>
  <span class="rating">{{ ratingStars(rating) }}</span>
</template>

<style scoped>
.rating {
  color: var(--color-warning);
  font-size: 1.1rem;
  letter-spacing: 2px;
}
</style>
