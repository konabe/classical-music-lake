<script setup lang="ts">
import { formatDatetime } from "~/utils/date";
import type { ListeningLog } from "~/types";

defineProps<{
  log: ListeningLog;
}>();
</script>

<template>
  <article class="log-detail">
    <header>
      <h1>
        <FavoriteIndicator :is-favorite="log.isFavorite" />
        {{ log.piece }}
      </h1>
    </header>

    <dl class="detail-list">
      <dt>作曲家</dt>
      <dd>{{ log.composer }}</dd>

      <dt>鑑賞日時</dt>
      <dd>{{ formatDatetime(log.listenedAt) }}</dd>

      <dt>評価</dt>
      <dd><RatingDisplay :rating="log.rating" /></dd>
    </dl>

    <section v-if="log.memo" class="memo">
      <h2>感想・メモ</h2>
      <p>{{ log.memo }}</p>
    </section>
  </article>
</template>

<style scoped>
.log-detail {
  background: #f2e6c9;
  border: 1px solid #b8995e;
  border-radius: 12px;
  padding: 2rem;
  max-width: 720px;
}

.log-detail header {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #b8995e;
}

.log-detail h1 {
  font-size: 1.8rem;
  color: #1a1a2e;
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

.memo h2 {
  font-size: 1rem;
  color: #888;
  margin-bottom: 0.5rem;
}

.memo p {
  line-height: 1.7;
  color: #444;
}
</style>
