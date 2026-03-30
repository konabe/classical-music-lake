<script setup lang="ts">
import type { Piece } from "~/types";

defineProps<{
  piece: Piece;
}>();

const emit = defineEmits<{
  edit: [];
  delete: [];
  detail: [];
}>();
</script>

<template>
  <li class="piece-item">
    <div class="piece-main">
      <div class="piece-title">{{ piece.title }}</div>
      <div class="piece-composer">{{ piece.composer }}</div>
      <PieceCategoryList :piece="piece" />
    </div>
    <div class="piece-actions">
      <button type="button" class="btn-detail" @click="emit('detail')">詳細</button>
      <ButtonSecondary label="編集" @click="emit('edit')" />
      <ButtonDanger label="削除" @click="emit('delete')" />
    </div>
  </li>
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

.piece-main {
  flex: 1;
  min-width: 0;
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

.piece-main :deep(.piece-category-list) {
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

  .piece-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
