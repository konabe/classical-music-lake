<script setup lang="ts">
import type { CreatePieceInput } from "~/types";

defineProps<{
  errorMessage: string;
}>();

const emit = defineEmits<{
  submit: [values: CreatePieceInput];
}>();
</script>

<template>
  <div>
    <h1 class="page-title">楽曲を追加</h1>

    <ErrorMessage v-if="errorMessage" :message="errorMessage" variant="block" />

    <PieceForm submit-label="登録する" @submit="emit('submit', $event)" />
  </div>
</template>

<style scoped>
.page-title {
  font-size: 1.6rem;
  color: #1e2d5a;
  margin-bottom: 1.5rem;
}
</style>
