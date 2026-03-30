<script setup lang="ts">
import type { Piece } from "~/types";

const props = defineProps<{
  piece: Pick<Piece, "genre" | "era" | "formation" | "region">;
}>();

const categories = computed(() =>
  [
    { label: "ジャンル", value: props.piece.genre },
    { label: "時代", value: props.piece.era },
    { label: "編成", value: props.piece.formation },
    { label: "地域", value: props.piece.region },
  ].filter((c): c is { label: string; value: string } => c.value !== undefined)
);
</script>

<template>
  <div v-if="categories.length" class="piece-category-list">
    <CategoryBadge
      v-for="cat in categories"
      :key="cat.label"
      :label="cat.label"
      :value="cat.value"
    />
  </div>
</template>

<style scoped>
.piece-category-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
}
</style>
