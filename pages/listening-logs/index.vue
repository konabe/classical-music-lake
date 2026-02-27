<script setup lang="ts">
import type { ListeningLog } from '~/types'

const { data: logs, refresh } = await useFetch<ListeningLog[]>('/api/listening-logs')

async function deleteLog(id: string) {
  if (!confirm('この記録を削除しますか？')) return
  await $fetch(`/api/listening-logs/${id}`, { method: 'DELETE' })
  await refresh()
}

function ratingStars(rating: number): string {
  return '★'.repeat(rating) + '☆'.repeat(5 - rating)
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
            <span>{{ log.performer }}</span>
            <span v-if="log.conductor">指揮: {{ log.conductor }}</span>
          </div>
          <div class="log-sub">
            <span class="rating">{{ ratingStars(log.rating) }}</span>
            <span class="date">{{ log.listenedAt.slice(0, 10) }}</span>
          </div>
          <p v-if="log.memo" class="log-memo">{{ log.memo }}</p>
        </div>
        <div class="log-actions">
          <NuxtLink :to="`/listening-logs/${log.id}/edit`" class="btn-secondary">編集</NuxtLink>
          <button class="btn-danger" @click="deleteLog(log.id)">削除</button>
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

.btn-primary {
  background: #1a1a2e;
  color: #fff;
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  text-decoration: none;
  font-size: 0.9rem;
  transition: background 0.2s;
}

.btn-primary:hover {
  background: #2d2d50;
}

.btn-secondary {
  background: #f0ece4;
  color: #333;
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  text-decoration: none;
  font-size: 0.85rem;
  text-align: center;
  transition: background 0.2s;
}

.btn-secondary:hover {
  background: #e0d8cc;
}

.btn-danger {
  background: #fff0f0;
  color: #c0392b;
  border: 1px solid #f5c6c6;
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-danger:hover {
  background: #ffe0e0;
}
</style>
