<script setup lang="ts">
import type { Piece } from "~/types";

type Kind = "genre" | "era" | "formation" | "region";

const props = defineProps<{
  piece: Pick<Piece, "genre" | "era" | "formation" | "region">;
}>();

const categories = computed(() =>
  [
    { kind: "genre" as Kind, label: "ジャンル", value: props.piece.genre },
    { kind: "era" as Kind, label: "時代", value: props.piece.era },
    { kind: "formation" as Kind, label: "編成", value: props.piece.formation },
    { kind: "region" as Kind, label: "地域", value: props.piece.region },
  ].filter((c): c is { kind: Kind; label: string; value: string } => c.value !== undefined),
);
</script>

<template>
  <div v-if="categories.length" class="piece-category-list">
    <CategoryBadge
      v-for="cat in categories"
      :key="cat.kind"
      :kind="cat.kind"
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
