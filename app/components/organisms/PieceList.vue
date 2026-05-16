<script setup lang="ts">
import type { PieceWork } from "@/types";

defineProps<{
  pieces: PieceWork[];
  error: Error | null;
  composerNameById: Record<string, string>;
}>();

const emit = defineEmits<{
  delete: [piece: PieceWork];
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

    <ul v-else class="piece-list stagger-children">
      <li v-for="piece in pieces" :key="piece.id">
        <PieceItem
          :piece="piece"
          :composer-name="composerNameById[piece.composerId] ?? '(不明な作曲家)'"
          @detail="router.push(`/pieces/${piece.id}`)"
          @play="router.push(`/pieces/${piece.id}`)"
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
  display: flex;
  flex-direction: column;
  gap: 0;
  border-top: 1px solid var(--color-hairline);
}
</style>
