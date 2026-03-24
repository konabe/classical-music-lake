<script setup lang="ts">
import type { Piece } from "~/types";

defineProps<{
  pieces: Piece[];
  error: Error | null;
}>();

const emit = defineEmits<{
  delete: [piece: Piece];
}>();
</script>

<template>
  <div>
    <PageHeader title="楽曲マスタ" new-page-path="/pieces/new">+ 新しい楽曲</PageHeader>
    <PieceList :pieces="pieces" :error="error" @delete="emit('delete', $event)" />
  </div>
</template>
