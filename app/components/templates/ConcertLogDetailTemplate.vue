<script setup lang="ts">
import type { ConcertLog } from "~/types";

const props = defineProps<{
  log: ConcertLog;
}>();

const router = useRouter();
const { deleteLog } = useConcertLogs();

const { data: pieces, refresh: refreshPieces } = usePiecesAll();
void refreshPieces();

const handleDelete = async () => {
  if (!confirm("このコンサート記録を削除しますか？")) {
    return;
  }
  await deleteLog(props.log.id);
  router.push("/concert-logs");
};
</script>

<template>
  <div>
    <div class="page-header">
      <NuxtLink to="/concert-logs" class="back-link">← コンサート記録一覧</NuxtLink>
      <div class="actions">
        <ButtonSecondary label="編集" @click="router.push(`/concert-logs/${props.log.id}/edit`)" />
        <ButtonDanger label="削除" @click="handleDelete" />
      </div>
    </div>

    <ConcertLogDetail :log="log" :pieces="pieces ?? []" />
  </div>
</template>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.back-link {
  color: var(--color-text-muted);
  text-decoration: none;
  font-size: 0.9rem;
}

.back-link:hover {
  color: var(--color-text-secondary);
}

.actions {
  display: flex;
  gap: 0.5rem;
}
</style>
