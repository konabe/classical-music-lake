<script setup lang="ts">
import type { ListeningLog } from "~/types";

const props = defineProps<{
  log: ListeningLog;
}>();

const router = useRouter();
const { deleteLog } = useListeningLogs();

const handleDelete = async () => {
  if (!confirm("この鑑賞記録を削除しますか？")) {
    return;
  }
  await deleteLog(props.log.id);
  router.push("/listening-logs");
};
</script>

<template>
  <div>
    <div class="page-header">
      <NuxtLink to="/listening-logs" class="back-link">← 鑑賞記録一覧</NuxtLink>
      <div class="actions">
        <ButtonSecondary
          label="編集"
          @click="router.push(`/listening-logs/${props.log.id}/edit`)"
        />
        <ButtonDanger label="削除" @click="handleDelete" />
      </div>
    </div>

    <ListeningLogDetail :log="log" />
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
  color: #666;
  text-decoration: none;
  font-size: 0.9rem;
}

.back-link:hover {
  color: #333;
}

.actions {
  display: flex;
  gap: 0.5rem;
}
</style>
