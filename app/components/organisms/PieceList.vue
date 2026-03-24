<script setup lang="ts">
import type { Piece } from "~/types";

defineProps<{
  pieces: Piece[];
  error: Error | null;
}>();

const emit = defineEmits<{
  delete: [piece: Piece];
}>();

const router = useRouter();
</script>

<template>
  <div>
    <ErrorMessage
      v-if="error"
      message="楽曲一覧の取得に失敗しました。時間をおいて再度お試しください。"
      variant="block"
    />
    <EmptyState v-else-if="!pieces.length"
      >楽曲が登録されていません。最初の楽曲を追加しましょう。</EmptyState
    >

    <ul v-else class="piece-list">
      <li v-for="piece in pieces" :key="piece.id" class="piece-item">
        <div class="piece-main">
          <div class="piece-title">{{ piece.title }}</div>
          <div class="piece-composer">{{ piece.composer }}</div>
        </div>
        <div class="piece-actions">
          <ButtonSecondary label="編集" @click="router.push(`/pieces/${piece.id}/edit`)" />
          <ButtonDanger label="削除" @click="emit('delete', piece)" />
        </div>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.piece-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

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
