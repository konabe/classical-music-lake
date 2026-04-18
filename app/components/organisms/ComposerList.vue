<script setup lang="ts">
import type { Composer } from "~/types";

defineProps<{
  composers: Composer[];
  error: Error | null;
}>();

const emit = defineEmits<{
  delete: [composer: Composer];
}>();

const router = useRouter();
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

    <ul v-else class="composer-list">
      <li v-for="composer in composers" :key="composer.id">
        <ComposerItem
          :composer="composer"
          @detail="router.push(`/composers/${composer.id}`)"
          @edit="router.push(`/composers/${composer.id}/edit`)"
          @delete="emit('delete', composer)"
        />
      </li>
    </ul>
  </div>
</template>

<style scoped>
.composer-list {
  list-style: none;
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 1024px) {
  .composer-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
