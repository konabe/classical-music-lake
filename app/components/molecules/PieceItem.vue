<script setup lang="ts">
import type { Piece } from "~/types";
import { isYouTubeUrl } from "~/utils/video";

const props = defineProps<{
  piece: Piece;
}>();

const emit = defineEmits<{
  edit: [];
  delete: [];
  detail: [];
}>();

const hasYouTubeThumbnail = computed(
  () => props.piece.videoUrl !== undefined && isYouTubeUrl(props.piece.videoUrl)
);

const thumbnailAlt = computed(() => `${props.piece.title} の動画サムネイル`);
</script>

<template>
  <div class="piece-item">
    <button
      v-if="hasYouTubeThumbnail"
      type="button"
      class="piece-thumbnail"
      :aria-label="`${piece.title} の詳細を開く`"
      @click="emit('detail')"
    >
      <YouTubeThumbnail :video-url="piece.videoUrl" :alt="thumbnailAlt" />
    </button>
    <div class="piece-main">
      <div class="piece-title">{{ piece.title }}</div>
      <div class="piece-composer">{{ piece.composer }}</div>
      <div class="piece-category-wrapper">
        <PieceCategoryList :piece="piece" />
      </div>
    </div>
    <div class="piece-actions">
      <button type="button" class="btn-detail" @click="emit('detail')">詳細</button>
      <ButtonSecondary label="編集" @click="emit('edit')" />
      <ButtonDanger label="削除" @click="emit('delete')" />
    </div>
  </div>
</template>

<style scoped>
.piece-item {
  background: #fff;
  border: 1px solid #e0d8cc;
  border-radius: 10px;
  padding: 1.2rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.piece-thumbnail {
  flex-shrink: 0;
  padding: 0;
  margin: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 6px;
  transition: opacity 0.2s;
}

.piece-thumbnail:hover {
  opacity: 0.85;
}

.piece-thumbnail:focus-visible {
  outline: 2px solid #c2a878;
  outline-offset: 2px;
}

.piece-main {
  flex: 1;
  min-width: 0;
  min-height: 90px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.piece-title {
  font-size: 1.1rem;
  font-weight: bold;
  margin-bottom: 0.3rem;
  color: #1e2d5a;
}

.piece-composer {
  font-size: 0.9rem;
  color: #666;
}

.piece-category-wrapper {
  margin-top: 0.4rem;
}

.piece-actions {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}

.btn-detail {
  background: #f0ebe0;
  color: #1e2d5a;
  padding: 0.6rem 1.2rem;
  border: 1px solid #c2a878;
  border-radius: 6px;
  font-size: 0.95rem;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-detail:hover {
  background: #e0d8cc;
}

@media (max-width: 600px) {
  .piece-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .piece-thumbnail {
    order: 1;
    width: 100%;
    max-width: 240px;
    align-self: center;
  }

  .piece-main {
    order: 2;
    width: 100%;
    min-height: 0;
  }

  .piece-actions {
    order: 3;
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
