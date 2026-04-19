<script setup lang="ts">
import type { Composer } from "~/types";

type Kind = "era" | "region";

const props = defineProps<{
  composer: Pick<Composer, "era" | "region">;
}>();

const categories = computed(() => {
  return [
    { kind: "era" as Kind, label: "時代", value: props.composer.era },
    { kind: "region" as Kind, label: "地域", value: props.composer.region },
  ].filter((c): c is { kind: Kind; label: string; value: string } => {
    return c.value !== undefined;
  });
});
</script>

<template>
  <div v-if="categories.length" class="composer-category-list">
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
.composer-category-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
}
</style>
