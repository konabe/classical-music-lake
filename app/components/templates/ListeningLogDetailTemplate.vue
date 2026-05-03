<script setup lang="ts">
import type { ListeningLog } from "~/types";

const props = defineProps<{
  log: ListeningLog;
  composerId?: string;
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
  <article class="log-detail">
    <header class="log-detail-head">
      <NuxtLink to="/listening-logs" class="back-link">
        <span aria-hidden="true">&larr;</span>
        <span class="smallcaps">Back to recordings</span>
      </NuxtLink>
      <div class="actions">
        <ButtonSecondary @click="router.push(`/listening-logs/${props.log.id}/edit`)">
          Edit
        </ButtonSecondary>
        <ButtonDanger @click="handleDelete">Delete</ButtonDanger>
      </div>
    </header>

    <ListeningLogDetail :log="log" :composer-id="composerId" />
  </article>
</template>

<style scoped>
.log-detail {
  margin-bottom: 4rem;
}

.log-detail-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2rem;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  color: var(--color-text-muted);
  text-decoration: none;
  transition:
    color 0.25s ease,
    gap 0.25s ease;
}

.back-link:hover {
  color: var(--color-accent);
  gap: 0.65rem;
}

.actions {
  display: flex;
  gap: 0.6rem;
}
</style>
