<script setup lang="ts">
import type { Composer } from "~/types";

const router = useRouter();
const { items, pending, error, hasMore, loadMore, retry, deleteComposer } = useComposersPaginated();
const { isAdmin } = useAuth();
const isAdminUser = isAdmin();

void loadMore();

function handleDetail(composer: Composer) {
  router.push(`/composers/${composer.id}`);
}

function handleEdit(composer: Composer) {
  router.push(`/composers/${composer.id}/edit`);
}

async function handleDelete(composer: Composer) {
  if (!confirm(`「${composer.name}」を削除しますか？`)) {
    return;
  }
  try {
    await deleteComposer(composer.id);
    await loadMore();
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "削除に失敗しました。もう一度お試しください。";
    alert(message);
  }
}
</script>

<template>
  <ComposersTemplate
    :composers="items"
    :error="error"
    :pending="pending"
    :has-more="hasMore"
    :is-admin="isAdminUser"
    @detail="handleDetail"
    @edit="handleEdit"
    @delete="handleDelete"
    @load-more="loadMore"
    @retry="retry"
  />
</template>
