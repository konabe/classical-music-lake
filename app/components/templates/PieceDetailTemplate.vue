<script setup lang="ts">
import type { Piece, Rating } from "~/types";

withDefaults(
  defineProps<{
    piece: Piece | null;
    error: Error | null;
    autoplay?: boolean;
    isAdmin: boolean;
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
        <div class="piece-composer">{{ piece.composer }}</div>
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
  color: var(--color-text-muted);
  text-decoration: none;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
}

.back-link:hover {
  color: var(--color-text-secondary);
}

.piece-header {
  margin-bottom: 1.5rem;
}

.piece-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--color-text);
  margin-bottom: 0.3rem;
}

.piece-composer {
  font-size: 1rem;
  color: var(--color-text-muted);
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
  background: var(--color-bg-surface);
  border: 1px solid var(--color-primary);
  color: var(--color-primary);
  border-radius: 4px;
  font-size: 0.9rem;
  text-decoration: none;
  cursor: pointer;
  transition:
    background-color 0.2s,
    color 0.2s;
}

.btn-secondary:hover {
  background: var(--color-primary);
  color: var(--color-on-primary);
}

.btn-danger {
  padding: 0.4rem 1rem;
  background: var(--color-bg-surface);
  border: 1px solid var(--color-danger);
  color: var(--color-danger);
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  transition:
    background-color 0.2s,
    color 0.2s;
}

.btn-danger:hover {
  background: var(--color-danger);
  color: var(--color-on-primary);
}
</style>
