<script setup lang="ts">
import { formatDate } from "~/utils/date";

definePageMeta({ middleware: "auth" });

const { data: logs, refresh, deleteLog } = await useListeningLogs();
const { ratingStars } = useRatingDisplay();

async function handleDelete(id: string) {
  if (!confirm("この記録を削除しますか？")) return;
  await deleteLog(id);
  await refresh();
}
</script>

<template>
  <div>
    <div class="page-header">
      <h1>鑑賞記録</h1>
      <NuxtLink to="/listening-logs/new" class="btn-primary">+ 新しい記録</NuxtLink>
    </div>

    <div v-if="!logs?.length" class="empty-state">
      <p>まだ記録がありません。最初の鑑賞記録を追加しましょう。</p>
    </div>

    <ul v-else class="log-list">
      <li v-for="log in logs" :key="log.id" class="log-item">
        <div class="log-main">
          <div class="log-title">
            <span v-if="log.isFavorite" class="favorite-badge">♥</span>
            <NuxtLink :to="`/listening-logs/${log.id}`">
              {{ log.piece }}
            </NuxtLink>
          </div>
          <div class="log-meta">
            <span>{{ log.composer }}</span>
          </div>
          <div class="log-sub">
            <span class="rating">{{ ratingStars(log.rating) }}</span>
            <span class="date">{{ formatDate(log.listenedAt) }}</span>
          </div>
          <p v-if="log.memo" class="log-memo">{{ log.memo }}</p>
        </div>
        <div class="log-actions">
          <NuxtLink :to="`/listening-logs/${log.id}/edit`" class="btn-secondary">編集</NuxtLink>
          <button class="btn-danger" @click="handleDelete(log.id)">削除</button>
        </div>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 1.8rem;
  color: #1a1a2e;
}

.empty-state {
  text-align: center;
  padding: 4rem;
  color: #888;
}

.log-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.log-item {
  background: #fff;
  border: 1px solid #e0d8cc;
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
  color: #1a1a2e;
  text-decoration: none;
}

.log-title a:hover {
  text-decoration: underline;
}

.favorite-badge {
  color: #e05a5a;
  margin-right: 0.3rem;
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

.rating {
  color: #c9a227;
  letter-spacing: 1px;
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
