<script setup lang="ts">
import type { Concert } from '~/types'

const apiBase = useApiBase()
const { data: concerts, refresh } = await useFetch<Concert[]>(`${apiBase}/concerts`)

async function deleteConcert(id: string) {
  if (!confirm('この記録を削除しますか？')) return
  await $fetch(`${apiBase}/concerts/${id}`, { method: 'DELETE' })
  await refresh()
}

function ratingStars(rating: number): string {
  return '★'.repeat(rating) + '☆'.repeat(5 - rating)
}
</script>

<template>
  <div>
    <div class="page-header">
      <h1>コンサート記録</h1>
      <NuxtLink to="/concerts/new" class="btn-primary">+ 新しい記録</NuxtLink>
    </div>

    <div v-if="!concerts?.length" class="empty-state">
      <p>まだ記録がありません。最初のコンサート記録を追加しましょう。</p>
    </div>

    <ul v-else class="concert-list">
      <li v-for="concert in concerts" :key="concert.id" class="concert-item">
        <div class="concert-main">
          <div class="concert-title">
            <span v-if="concert.isFavorite" class="favorite-badge">♥</span>
            <NuxtLink :to="`/concerts/${concert.id}`">{{ concert.title }}</NuxtLink>
          </div>
          <div class="concert-meta">
            <span>{{ concert.date }}</span>
            <span>{{ concert.venue }}</span>
            <span v-if="concert.orchestra">{{ concert.orchestra }}</span>
            <span v-if="concert.conductor">指揮: {{ concert.conductor }}</span>
          </div>
          <div class="concert-sub">
            <span class="rating">{{ ratingStars(concert.rating) }}</span>
          </div>
          <p v-if="concert.memo" class="concert-memo">{{ concert.memo }}</p>
        </div>
        <div class="concert-actions">
          <NuxtLink :to="`/concerts/${concert.id}/edit`" class="btn-secondary">編集</NuxtLink>
          <button class="btn-danger" @click="deleteConcert(concert.id)">削除</button>
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

.concert-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.concert-item {
  background: #fff;
  border: 1px solid #e0d8cc;
  border-radius: 10px;
  padding: 1.2rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.concert-title {
  font-size: 1.1rem;
  font-weight: bold;
  margin-bottom: 0.3rem;
}

.concert-title a {
  color: #1a1a2e;
  text-decoration: none;
}

.concert-title a:hover {
  text-decoration: underline;
}

.favorite-badge {
  color: #e05a5a;
  margin-right: 0.3rem;
}

.concert-meta {
  color: #666;
  font-size: 0.9rem;
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 0.3rem;
}

.concert-sub {
  font-size: 0.9rem;
}

.rating {
  color: #c9a227;
  letter-spacing: 1px;
}

.concert-memo {
  font-size: 0.9rem;
  color: #555;
  margin-top: 0.5rem;
  font-style: italic;
}

.concert-actions {
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
}

.btn-danger:hover {
  background: #ffe0e0;
}
</style>
