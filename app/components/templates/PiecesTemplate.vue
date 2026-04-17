<script setup lang="ts">
import type { Piece } from "~/types";

const props = defineProps<{
  pieces: Piece[];
  error: Error | null;
  pending: boolean;
  hasMore: boolean;
  isAdmin: boolean;
}>();

const emit = defineEmits<{
  delete: [piece: Piece];
  loadMore: [];
  retry: [];
}>();
</script>

<template>
  <div>
    <PageHeader title="楽曲マスタ" :new-page-path="props.isAdmin ? '/pieces/new' : undefined"
      >+ 新しい楽曲</PageHeader
    >
    <PieceListInfinite
      :pieces="props.pieces"
      :error="props.error"
      :pending="props.pending"
      :has-more="props.hasMore"
      @delete="emit('delete', $event)"
      @load-more="emit('loadMore')"
      @retry="emit('retry')"
    />
  </div>
</template>
