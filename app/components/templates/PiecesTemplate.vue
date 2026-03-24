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
    <div class="page-header">
      <h1>楽曲マスタ</h1>
      <NuxtLink to="/pieces/new" class="btn-primary">+ 新しい楽曲</NuxtLink>
    </div>

    <PieceList :pieces="pieces" :error="error" @delete="emit('delete', $event)" />
  </div>
</template>

<style scoped>
.btn-primary {
  background: #1e2d5a;
  color: #fff;
  padding: 0.6rem 1.4rem;
  border: none;
  border-radius: 6px;
  font-size: 0.95rem;
  cursor: pointer;
  text-decoration: none;
  transition: background 0.2s;
}

.btn-primary:hover {
  background: #2b3f7e;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 1.8rem;
  color: #1e2d5a;
}
</style>
