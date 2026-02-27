<script setup lang="ts">
import type { ListeningLog } from '~/types'

const route = useRoute()
const { data: log } = await useFetch<ListeningLog>(`/api/listening-logs/${route.params.id}`)

function ratingStars(rating: number): string {
  return '★'.repeat(rating) + '☆'.repeat(5 - rating)
}
</script>

<template>
  <div v-if="log">
    <div class="page-header">
      <NuxtLink to="/listening-logs" class="back-link">← 鑑賞記録一覧</NuxtLink>
      <NuxtLink :to="`/listening-logs/${log.id}/edit`" class="btn-secondary">編集</NuxtLink>
    </div>

    <article class="log-detail">
      <header>
        <h1>
          <span v-if="log.isFavorite" class="favorite">♥</span>
          {{ log.piece }}
        </h1>
        <p class="composer">{{ log.composer }}</p>
      </header>

      <dl class="detail-list">
        <dt>演奏家・楽団</dt>
        <dd>{{ log.performer }}</dd>

        <template v-if="log.conductor">
          <dt>指揮者</dt>
          <dd>{{ log.conductor }}</dd>
        </template>

        <dt>鑑賞日時</dt>
        <dd>{{ log.listenedAt.replace('T', ' ').slice(0, 16) }}</dd>

        <dt>評価</dt>
        <dd class="rating">{{ ratingStars(log.rating) }}</dd>
      </dl>

      <section v-if="log.memo" class="memo">
        <h2>感想・メモ</h2>
        <p>{{ log.memo }}</p>
      </section>
    </article>
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

.log-detail {
  background: #fff;
  border: 1px solid #e0d8cc;
  border-radius: 12px;
  padding: 2rem;
  max-width: 720px;
}

.log-detail header {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e0d8cc;
}

.log-detail h1 {
  font-size: 1.8rem;
  color: #1a1a2e;
}

.favorite {
  color: #e05a5a;
}

.composer {
  color: #666;
  margin-top: 0.3rem;
}

.detail-list {
  display: grid;
  grid-template-columns: 8rem 1fr;
  gap: 0.6rem 1rem;
  margin-bottom: 1.5rem;
}

dt {
  font-weight: bold;
  color: #888;
  font-size: 0.9rem;
}

.rating {
  color: #c9a227;
  font-size: 1.1rem;
  letter-spacing: 2px;
}

.memo h2 {
  font-size: 1rem;
  color: #888;
  margin-bottom: 0.5rem;
}

.memo p {
  line-height: 1.7;
  color: #444;
}

.btn-secondary {
  background: #f0ece4;
  color: #333;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  text-decoration: none;
  font-size: 0.9rem;
}

.btn-secondary:hover {
  background: #e0d8cc;
}
</style>
