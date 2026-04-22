<script setup lang="ts">
import type { Composer, CreatePieceInput } from "~/types";

defineProps<{
  error: string | null;
  composers: Composer[];
  composersPending?: boolean;
}>();

const emit = defineEmits<{
  submit: [values: CreatePieceInput];
}>();
</script>

<template>
  <div>
    <h1 class="page-title">楽曲を追加</h1>

    <ErrorMessage v-if="error" :message="error" variant="block" />

    <PieceForm
      :composers="composers"
      :composers-pending="composersPending"
      submit-label="登録する"
      @submit="emit('submit', $event)"
    />
  </div>
</template>

<style scoped>
.page-title {
  font-size: 1.6rem;
  color: var(--color-text);
  margin-bottom: 1.5rem;
}
</style>
