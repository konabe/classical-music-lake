<script setup lang="ts">
import type { CreateListeningLogInput } from "~/types";

defineProps<{
  error: string | null;
}>();

const emit = defineEmits<{
  submit: [values: CreateListeningLogInput];
}>();
</script>

<template>
  <div class="form-page">
    <NuxtLink to="/listening-logs" class="back-link">
      <span aria-hidden="true">&larr;</span>
      <span class="smallcaps">Back to recordings</span>
    </NuxtLink>

    <PageTitle eyebrow="I / Recordings" meta="New entry">鑑賞記録を追加</PageTitle>

    <ErrorMessage v-if="error" :message="error" variant="block" />
    <ListeningLogForm submit-label="記録する" @submit="emit('submit', $event)" />
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
