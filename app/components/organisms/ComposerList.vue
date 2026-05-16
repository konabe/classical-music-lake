<script setup lang="ts">
import type { Composer } from "@/types";

defineProps<{
  composers: Composer[];
  error: Error | null;
}>();

const emit = defineEmits<{
  detail: [composer: Composer];
  edit: [composer: Composer];
  delete: [composer: Composer];
}>();
</script>

<template>
  <div>
    <ErrorMessage
      v-if="error"
      message="作曲家一覧の取得に失敗しました。時間をおいて再度お試しください。"
      variant="block"
    />
    <EmptyState v-else-if="!composers.length"
      >作曲家が登録されていません。最初の作曲家を追加しましょう。</EmptyState
    >

    <ul v-else class="composer-list stagger-children">
      <li v-for="composer in composers" :key="composer.id">
        <ComposerItem
          :composer="composer"
          @detail="emit('detail', composer)"
          @edit="emit('edit', composer)"
          @delete="emit('delete', composer)"
        />
      </li>
    </ul>
  </div>
</template>

<style scoped>
.composer-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0;
  border-top: 1px solid var(--color-hairline);
}
</style>
