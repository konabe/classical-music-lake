<script setup lang="ts">
import type { Piece, Rating } from "~/types";

withDefaults(
  defineProps<{
    piece: Piece | null;
    error: Error | null;
    autoplay?: boolean;
    isAdmin: boolean;
    composerName: string;
  }>(),
  { autoplay: false }
);

const emit = defineEmits<{
  save: [values: { rating: Rating; isFavorite: boolean; memo: string }];
  delete: [piece: Piece];
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
        <div class="piece-composer">{{ composerName }}</div>
        <div class="piece-category-wrapper">
          <PieceCategoryList :piece="piece" />
        </div>
        <div v-if="isAdmin" class="admin-actions">
          <NuxtLink :to="`/pieces/${piece.id}/edit`" class="btn-secondary">編集</NuxtLink>
          <button class="btn-danger" @click="emit('delete', piece)">削除</button>
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
          :composer="composerName"
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

.admin-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.btn-secondary {
  display: inline-block;
  padding: 0.4rem 1rem;
  background: #fff;
  border: 1px solid #1e2d5a;
  color: #1e2d5a;
  border-radius: 4px;
  font-size: 0.9rem;
  text-decoration: none;
  cursor: pointer;
  transition:
    background-color 0.2s,
    color 0.2s;
}

.btn-secondary:hover {
  background: #1e2d5a;
  color: #fff;
}

.btn-danger {
  padding: 0.4rem 1rem;
  background: #fff;
  border: 1px solid #c0392b;
  color: #c0392b;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  transition:
    background-color 0.2s,
    color 0.2s;
}

.btn-danger:hover {
  background: #c0392b;
  color: #fff;
}
</style>
