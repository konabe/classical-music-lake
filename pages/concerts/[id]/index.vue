<script setup lang="ts">
import type { Concert } from '~/types'

const route = useRoute()
const apiBase = useApiBase()
const { data: concert } = await useFetch<Concert>(`${apiBase}/concerts/${route.params.id}`)

function ratingStars(rating: number): string {
  return '★'.repeat(rating) + '☆'.repeat(5 - rating)
}
</script>

<template>
  <div v-if="concert">
    <div class="page-header">
      <NuxtLink to="/concerts" class="back-link">← コンサート記録一覧</NuxtLink>
      <NuxtLink :to="`/concerts/${concert.id}/edit`" class="btn-secondary">編集</NuxtLink>
    </div>

    <article class="concert-detail">
      <header>
        <h1>
          <span v-if="concert.isFavorite" class="favorite">♥</span>
          {{ concert.title }}
        </h1>
        <p class="meta">
          {{ concert.date }} ｜ {{ concert.venue }}
        </p>
      </header>

      <dl class="detail-list">
        <template v-if="concert.orchestra">
          <dt>楽団</dt>
          <dd>{{ concert.orchestra }}</dd>
        </template>

        <template v-if="concert.conductor">
          <dt>指揮者</dt>
          <dd>{{ concert.conductor }}</dd>
        </template>

        <template v-if="concert.soloists?.length">
          <dt>ソリスト</dt>
          <dd>{{ concert.soloists.join('、') }}</dd>
        </template>

        <dt>評価</dt>
        <dd class="rating">{{ ratingStars(concert.rating) }}</dd>
      </dl>

      <section class="program">
        <h2>プログラム</h2>
        <ul>
          <li v-for="(piece, i) in concert.program" :key="i">{{ piece }}</li>
        </ul>
      </section>

      <section v-if="concert.memo" class="memo">
        <h2>感想・メモ</h2>
        <p>{{ concert.memo }}</p>
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

.concert-detail {
  background: #fff;
  border: 1px solid #e0d8cc;
  border-radius: 12px;
  padding: 2rem;
  max-width: 720px;
}

.concert-detail header {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e0d8cc;
}

.concert-detail h1 {
  font-size: 1.8rem;
  color: #1a1a2e;
}

.favorite {
  color: #e05a5a;
}

.meta {
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

.program {
  margin-bottom: 1.5rem;
}

.program h2,
.memo h2 {
  font-size: 1rem;
  color: #888;
  margin-bottom: 0.5rem;
}

.program ul {
  list-style: disc;
  padding-left: 1.5rem;
  color: #444;
  line-height: 1.8;
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
