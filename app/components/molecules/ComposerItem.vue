<script setup lang="ts">
import type { Composer } from "~/types";

defineProps<{
  composer: Composer;
}>();

const emit = defineEmits<{
  edit: [];
  delete: [];
  detail: [];
}>();
</script>

<template>
  <div class="composer-item">
    <div class="composer-main">
      <div class="composer-name">{{ composer.name }}</div>
      <div class="composer-category-wrapper">
        <ComposerCategoryList :composer="composer" />
      </div>
    </div>
    <div class="composer-actions">
      <button type="button" class="btn-detail" @click="emit('detail')">詳細</button>
      <ButtonSecondary label="編集" @click="emit('edit')" />
      <ButtonDanger label="削除" @click="emit('delete')" />
    </div>
  </div>
</template>

<style scoped>
.composer-item {
  background: #fff;
  border: 1px solid #e0d8cc;
  border-radius: 10px;
  padding: 1.2rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.composer-main {
  flex: 1;
  min-width: 0;
}

.composer-name {
  font-size: 1.1rem;
  font-weight: bold;
  margin-bottom: 0.3rem;
  color: #1e2d5a;
}

.composer-category-wrapper {
  margin-top: 0.4rem;
}

.composer-actions {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}

.btn-detail {
  background: #f0ebe0;
  color: #1e2d5a;
  padding: 0.6rem 1.2rem;
  border: 1px solid #c2a878;
  border-radius: 6px;
  font-size: 0.95rem;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-detail:hover {
  background: #e0d8cc;
}

@media (max-width: 600px) {
  .composer-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .composer-main {
    width: 100%;
  }

  .composer-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
