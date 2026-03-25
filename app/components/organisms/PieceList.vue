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
      <PieceItem
        v-for="piece in pieces"
        :key="piece.id"
        :piece="piece"
        @detail="router.push(`/pieces/${piece.id}`)"
        @edit="router.push(`/pieces/${piece.id}/edit`)"
        @delete="emit('delete', piece)"
      />
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
</style>
