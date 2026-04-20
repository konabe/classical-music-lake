<script setup lang="ts">
import type { Composer } from "~/types";

defineProps<{
  composer: Composer | null;
  error: Error | null;
  isAdmin: boolean;
}>();

const emit = defineEmits<{
  delete: [composer: Composer];
}>();
</script>

<template>
  <div>
    <NuxtLink to="/composers" class="back-link">← 作曲家一覧</NuxtLink>

    <ErrorMessage
      v-if="error"
      message="作曲家の取得に失敗しました。時間をおいて再度お試しください。"
      variant="block"
    />

    <template v-else-if="composer">
      <div class="composer-header">
        <img
          v-if="composer.imageUrl"
          :src="composer.imageUrl"
          :alt="composer.name"
          class="composer-image"
          loading="lazy"
          referrerpolicy="no-referrer"
        />
        <div class="composer-name">{{ composer.name }}</div>
        <div class="composer-category-wrapper">
          <ComposerCategoryList :composer="composer" />
        </div>
        <div v-if="isAdmin" class="admin-actions">
          <NuxtLink :to="`/composers/${composer.id}/edit`" class="btn-secondary">編集</NuxtLink>
          <button class="btn-danger" @click="emit('delete', composer)">削除</button>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.back-link {
  display: inline-block;
  color: var(--color-text-muted);
  text-decoration: none;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
}

.back-link:hover {
  color: var(--color-text-secondary);
}

.composer-header {
  margin-bottom: 1.5rem;
}

.composer-image {
  max-width: 240px;
  max-height: 320px;
  width: auto;
  height: auto;
  object-fit: contain;
  border-radius: 6px;
  margin-bottom: 1rem;
  background: var(--color-bg-elevated);
}

.composer-name {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--color-text);
  margin-bottom: 0.3rem;
}

.composer-category-wrapper {
  margin-top: 0.5rem;
}

.admin-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.btn-secondary {
  display: inline-block;
  padding: 0.4rem 1rem;
  background: var(--color-bg-surface);
  border: 1px solid var(--color-primary);
  color: var(--color-primary);
  border-radius: 4px;
  font-size: 0.9rem;
  text-decoration: none;
  cursor: pointer;
  transition:
    background-color 0.2s,
    color 0.2s;
}

.btn-secondary:hover {
  background: var(--color-primary);
  color: var(--color-on-primary);
}

.btn-danger {
  padding: 0.4rem 1rem;
  background: var(--color-bg-surface);
  border: 1px solid var(--color-danger);
  color: var(--color-danger);
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  transition:
    background-color 0.2s,
    color 0.2s;
}

.btn-danger:hover {
  background: var(--color-danger);
  color: var(--color-on-primary);
}
</style>
