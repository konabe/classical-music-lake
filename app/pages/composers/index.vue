<script setup lang="ts">
import type { Composer } from "~/types";

const router = useRouter();
const { data, pending, error, refresh, deleteComposer } = useComposersAll();
const { isAdmin } = useAuth();
const isAdminUser = isAdmin();

void refresh();

// 生年昇順（古い順）。生年未登録は末尾。
const sortedComposers = computed<Composer[]>(() => {
  const items = data.value ?? [];
  return [...items].sort((a, b) => {
    const aHas = a.birthYear !== undefined;
    const bHas = b.birthYear !== undefined;
    if (!aHas && !bHas) return a.name.localeCompare(b.name);
    if (!aHas) return 1;
    if (!bHas) return -1;
    return (a.birthYear as number) - (b.birthYear as number);
  });
});

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
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "削除に失敗しました。もう一度お試しください。";
    alert(message);
  }
}
</script>

<template>
  <ComposersTemplate
    :composers="sortedComposers"
    :error="error"
    :pending="pending"
    :is-admin="isAdminUser"
    @detail="handleDetail"
    @edit="handleEdit"
    @delete="handleDelete"
    @retry="refresh"
  />
</template>
