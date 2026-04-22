<script setup lang="ts">
import type { Composer, CreatePieceInput } from "~/types";

defineProps<{
  error: string | null;
  composers: Composer[];
  composersPending?: boolean;
}>();

const emit = defineEmits<{
  submit: [values: CreatePieceInput];
}>();
</script>

<template>
  <div>
    <PageTitle>楽曲を追加</PageTitle>

    <ErrorMessage v-if="error" :message="error" variant="block" />

    <PieceForm
      :composers="composers"
      :composers-pending="composersPending"
      submit-label="登録する"
      @submit="emit('submit', $event)"
    />
  </div>
</template>
