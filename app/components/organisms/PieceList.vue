<script setup lang="ts">
import type { Piece } from "~/types";

defineProps<{
  pieces: Piece[];
  error: Error | null;
  composerNameById: Record<string, string>;
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
      <li v-for="piece in pieces" :key="piece.id">
        <PieceItem
          :piece="piece"
          :composer-name="composerNameById[piece.composerId] ?? '(不明な作曲家)'"
          @detail="router.push(`/pieces/${piece.id}`)"
          @play="router.push(`/pieces/${piece.id}?autoplay=1`)"
          @edit="router.push(`/pieces/${piece.id}/edit`)"
          @delete="emit('delete', piece)"
        />
      </li>
    </ul>
  </div>
</template>

<style scoped>
.piece-list {
  list-style: none;
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 1024px) {
  .piece-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
