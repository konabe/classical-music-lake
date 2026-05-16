<script setup lang="ts">
import type { CreateListeningLogInput, ListeningLog, UpdateListeningLogInput } from "@/types";

const props = defineProps<{
  log: ListeningLog;
  error: string | null;
}>();

const emit = defineEmits<{
  submit: [values: UpdateListeningLogInput];
}>();

// ListeningLog（API レスポンス）には pieceTitle / composerName 等の派生値が含まれるため、
// フォームの初期値として必要なフィールドだけを抽出する。
const formInitialValues = computed<Partial<CreateListeningLogInput>>(() => ({
  listenedAt: props.log.listenedAt,
  pieceId: props.log.pieceId,
  rating: props.log.rating,
  isFavorite: props.log.isFavorite,
  memo: props.log.memo,
}));
</script>

<template>
  <div class="form-page">
    <NuxtLink to="/listening-logs" class="back-link">
      <span aria-hidden="true">&larr;</span>
      <span class="smallcaps">Back to recordings</span>
    </NuxtLink>

    <PageTitle eyebrow="I / Recordings" meta="Edit">鑑賞記録を編集</PageTitle>

    <ErrorMessage v-if="error" :message="error" variant="block" />
    <ListeningLogForm
      :initial-values="formInitialValues"
      submit-label="更新する"
      @submit="emit('submit', $event)"
    />
  </div>
</template>

<style scoped>
.form-page {
  margin-bottom: 4rem;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  color: var(--color-text-muted);
  text-decoration: none;
  margin-bottom: 1.5rem;
  transition:
    color 0.25s ease,
    gap 0.25s ease;
}

.back-link:hover {
  color: var(--color-accent);
  gap: 0.65rem;
}
</style>
