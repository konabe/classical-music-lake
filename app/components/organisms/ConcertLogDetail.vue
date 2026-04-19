<script setup lang="ts">
import { formatDatetime } from "~/utils/date";
import type { ConcertLog, Piece } from "~/types";

const props = defineProps<{
  log: ConcertLog;
  pieces: Piece[];
}>();

const programPieces = computed(() => {
  if (props.log.pieceIds === undefined || props.log.pieceIds.length === 0) {
    return [];
  }
  return props.log.pieceIds
    .map((id) => {
      return props.pieces.find((p) => {
        return p.id === id;
      });
    })
    .filter((p): p is Piece => {
      return p !== undefined;
    });
});
</script>

<template>
  <article class="log-detail">
    <header>
      <h1>{{ log.title }}</h1>
    </header>

    <dl class="detail-list">
      <dt>会場</dt>
      <dd>{{ log.venue }}</dd>

      <dt>開催日時</dt>
      <dd>{{ formatDatetime(log.concertDate) }}</dd>

      <template v-if="log.conductor">
        <dt>指揮者</dt>
        <dd>{{ log.conductor }}</dd>
      </template>

      <template v-if="log.orchestra">
        <dt>オーケストラ / アンサンブル</dt>
        <dd>{{ log.orchestra }}</dd>
      </template>

      <template v-if="log.soloist">
        <dt>ソリスト</dt>
        <dd>{{ log.soloist }}</dd>
      </template>

      <dt>プログラム</dt>
      <dd>
        <ol v-if="programPieces.length > 0" class="program-list">
          <li v-for="piece in programPieces" :key="piece.id">
            {{ piece.title }} / {{ piece.composer }}
          </li>
        </ol>
        <span v-else class="no-program">プログラムなし</span>
      </dd>
    </dl>
  </article>
</template>

<style scoped>
.log-detail {
  background: #eaeef4;
  border: 1px solid #9aa5b4;
  border-radius: 12px;
  padding: 2rem;
  max-width: 720px;
}

.log-detail header {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #9aa5b4;
}

.log-detail h1 {
  font-size: 1.8rem;
  color: #1e2d5a;
}

.detail-list {
  display: grid;
  grid-template-columns: 14rem 1fr;
  gap: 0.6rem 1rem;
}

dt {
  font-weight: bold;
  color: #888;
  font-size: 0.9rem;
}

.program-list {
  margin: 0;
  padding-left: 1.5rem;
}

.program-list li {
  margin-bottom: 0.3rem;
}

.no-program {
  color: #666;
}
</style>
