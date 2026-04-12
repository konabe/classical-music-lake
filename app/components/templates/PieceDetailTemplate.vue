<script setup lang="ts">
import type { Piece, Rating } from "~/types";

withDefaults(
  defineProps<{
    piece: Piece | null;
    error: Error | null;
    autoplay?: boolean;
  }>(),
  { autoplay: false }
);

const emit = defineEmits<{
  save: [values: { rating: Rating; isFavorite: boolean; memo: string }];
}>();

const hasStartedPlaying = ref(false);
</script>

<template>
  <div>
    <NuxtLink to="/pieces" class="back-link">← 楽曲一覧</NuxtLink>

    <ErrorMessage
      v-if="error"
      message="楽曲の取得に失敗しました。時間をおいて再度お試しください。"
      variant="block"
    />

    <template v-else-if="piece">
      <div class="piece-header">
        <div class="piece-title">{{ piece.title }}</div>
        <div class="piece-composer">{{ piece.composer }}</div>
        <div class="piece-category-wrapper">
          <PieceCategoryList :piece="piece" />
        </div>
      </div>

      <template v-if="piece.videoUrl">
        <VideoPlayer
          :video-url="piece.videoUrl"
          :autoplay="autoplay"
          @play="hasStartedPlaying = true"
        />

        <QuickLogForm
          v-if="hasStartedPlaying"
          :composer="piece.composer"
          :piece="piece.title"
          @submit="emit('save', $event)"
        />
      </template>
    </template>
  </div>
</template>

<style scoped>
.back-link {
  display: inline-block;
  color: #666;
  text-decoration: none;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
}

.back-link:hover {
  color: #333;
}

.piece-header {
  margin-bottom: 1.5rem;
}

.piece-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: #1e2d5a;
  margin-bottom: 0.3rem;
}

.piece-composer {
  font-size: 1rem;
  color: #666;
}

.piece-category-wrapper {
  margin-top: 0.5rem;
}
</style>
