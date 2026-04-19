<script setup lang="ts">
import type { Composer } from "~/types";

const props = defineProps<{
  composers: Composer[];
  error: Error | null;
  pending: boolean;
  hasMore: boolean;
  isAdmin: boolean;
}>();

const emit = defineEmits<{
  detail: [composer: Composer];
  edit: [composer: Composer];
  delete: [composer: Composer];
  loadMore: [];
  retry: [];
}>();
</script>

<template>
  <div>
    <PageHeader title="作曲家マスタ" :new-page-path="props.isAdmin ? '/composers/new' : undefined"
      >+ 新しい作曲家</PageHeader
    >
    <ComposerListInfinite
      :composers="props.composers"
      :error="props.error"
      :pending="props.pending"
      :has-more="props.hasMore"
      @detail="emit('detail', $event)"
      @edit="emit('edit', $event)"
      @delete="emit('delete', $event)"
      @load-more="emit('loadMore')"
      @retry="emit('retry')"
    />
  </div>
</template>
