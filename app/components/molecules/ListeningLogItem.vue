<script setup lang="ts">
import { formatDate } from "~/utils/date";
import type { ListeningLog } from "~/types";

defineProps<{
  listeningLog: ListeningLog;
}>();

const emit = defineEmits<{
  edit: [];
  delete: [];
}>();
</script>

<template>
  <div class="log-item">
    <div class="log-main">
      <div class="log-title">
        <FavoriteIndicator :is-favorite="listeningLog.isFavorite" />
        <NuxtLink :to="`/listening-logs/${listeningLog.id}`">
          {{ listeningLog.piece }}
        </NuxtLink>
      </div>
      <div class="log-meta">
        <span>{{ listeningLog.composer }}</span>
      </div>
      <div class="log-sub">
        <RatingDisplay :rating="listeningLog.rating" />
        <span class="date">{{ formatDate(listeningLog.listenedAt) }}</span>
      </div>
      <p v-if="listeningLog.memo" class="log-memo">{{ listeningLog.memo }}</p>
    </div>
    <div class="log-actions">
      <ButtonSecondary label="編集" @click="emit('edit')" />
      <ButtonDanger label="削除" @click="emit('delete')" />
    </div>
  </div>
</template>

<style scoped>
.log-item {
  background: #eaeef4;
  border: 1px solid #9aa5b4;
  border-radius: 10px;
  padding: 1.2rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.log-title {
  font-size: 1.1rem;
  font-weight: bold;
  margin-bottom: 0.3rem;
}

.log-title a {
  color: #1e2d5a;
  text-decoration: none;
}

.log-title a:hover {
  text-decoration: underline;
}

.log-meta {
  color: #666;
  font-size: 0.9rem;
  display: flex;
  gap: 1rem;
  margin-bottom: 0.3rem;
}

.log-sub {
  display: flex;
  gap: 1rem;
  font-size: 0.9rem;
  margin-bottom: 0.3rem;
}

.date {
  color: #999;
}

.log-memo {
  font-size: 0.9rem;
  color: #555;
  margin-top: 0.5rem;
  font-style: italic;
}

.log-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex-shrink: 0;
}
</style>
