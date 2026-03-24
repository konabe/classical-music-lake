<script setup lang="ts">
import type { Piece } from "~/types";

defineProps<{
  piece: Piece;
}>();

const emit = defineEmits<{
  edit: [];
  delete: [];
}>();
</script>

<template>
  <li class="piece-item">
    <div class="piece-main">
      <div class="piece-title">{{ piece.title }}</div>
      <div class="piece-composer">{{ piece.composer }}</div>
    </div>
    <div class="piece-actions">
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

.piece-actions {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}
</style>
