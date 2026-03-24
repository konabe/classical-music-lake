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
    <div class="page-header">
      <h1>楽曲マスタ</h1>
      <ButtonPrimary @click="router.push('/pieces/new')">+ 新しい楽曲</ButtonPrimary>
    </div>

    <PieceList :pieces="pieces" :error="error" @delete="emit('delete', $event)" />
  </div>
</template>

<style scoped>
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
