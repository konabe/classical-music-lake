<script setup lang="ts">
import { formatDate } from "~/utils/date";
import type { ListeningLog } from "~/types";

defineProps<{
  logs: ListeningLog[];
}>();

const emit = defineEmits<{
  delete: [id: string];
}>();

const router = useRouter();
</script>

<template>
  <div>
    <EmptyState v-if="!logs.length"
      >まだ記録がありません。最初の鑑賞記録を追加しましょう。</EmptyState
    >

    <ul v-else class="log-list">
      <li v-for="log in logs" :key="log.id" class="log-item">
        <div class="log-main">
          <div class="log-title">
            <FavoriteIndicator :is-favorite="log.isFavorite" />
            <NuxtLink :to="`/listening-logs/${log.id}`">
              {{ log.piece }}
            </NuxtLink>
          </div>
          <div class="log-meta">
            <span>{{ log.composer }}</span>
          </div>
          <div class="log-sub">
            <RatingDisplay :rating="log.rating" />
            <span class="date">{{ formatDate(log.listenedAt) }}</span>
          </div>
          <p v-if="log.memo" class="log-memo">{{ log.memo }}</p>
        </div>
        <div class="log-actions">
          <ButtonSecondary label="編集" @click="router.push(`/listening-logs/${log.id}/edit`)" />
          <button class="btn-danger" @click="emit('delete', log.id)">削除</button>
        </div>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.log-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

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
