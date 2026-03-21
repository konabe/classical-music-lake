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
  color: #c9a227;
  font-size: 1.1rem;
  letter-spacing: 2px;
}
</style>
