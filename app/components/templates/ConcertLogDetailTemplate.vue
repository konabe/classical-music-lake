<script setup lang="ts">
import type { ConcertLog } from "~/types";

const props = defineProps<{
  log: ConcertLog;
}>();

const router = useRouter();
const { deleteLog } = useConcertLogs();

const { data: pieces, refresh: refreshPieces } = usePiecesAll();
const { data: composers, refresh: refreshComposers } = useComposersAll();
void refreshPieces();
void refreshComposers();

const composerNameById = computed<Record<string, string>>(() => {
  const map: Record<string, string> = {};
  for (const c of composers.value ?? []) {
    map[c.id] = c.name;
  }
  return map;
});

const handleDelete = async () => {
  if (!confirm("このコンサート記録を削除しますか？")) {
    return;
  }
  await deleteLog(props.log.id);
  router.push("/concert-logs");
};
</script>

<template>
  <article class="concert-detail">
    <header class="concert-detail-head">
      <NuxtLink to="/concert-logs" class="back-link">
        <span aria-hidden="true">&larr;</span>
        <span class="smallcaps">Back to concerts</span>
      </NuxtLink>
      <div class="actions">
        <ButtonSecondary @click="router.push(`/concert-logs/${props.log.id}/edit`)">
          Edit
        </ButtonSecondary>
        <ButtonDanger @click="handleDelete">Delete</ButtonDanger>
      </div>
    </header>

    <ConcertLogDetail :log="log" :pieces="pieces ?? []" :composer-name-by-id="composerNameById" />
  </article>
</template>

<style scoped>
.concert-detail {
  margin-bottom: 4rem;
}

.concert-detail-head {
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
