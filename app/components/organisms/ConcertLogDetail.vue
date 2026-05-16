<script setup lang="ts">
import { formatDatetime } from "@/utils/date";
import type { ConcertLog, PieceWork } from "@/types";

const props = defineProps<{
  log: ConcertLog;
  pieces: PieceWork[];
  composerNameById: Record<string, string>;
}>();

const programPieces = computed(() => {
  if (props.log.pieceIds === undefined || props.log.pieceIds.length === 0) {
    return [];
  }
  return props.log.pieceIds
    .map((id) => props.pieces.find((p) => p.id === id))
    .filter((p): p is PieceWork => p !== undefined);
});

const shortId = computed(() => props.log.id.slice(0, 6).toUpperCase());
</script>

<template>
  <article class="log-detail">
    <header class="log-detail-head">
      <div class="log-meta">
        <span class="meta-tag smallcaps">IV / Concert</span>
        <span class="meta-rule" aria-hidden="true" />
        <span class="meta-id smallcaps numeric">N&deg; {{ shortId }}</span>
      </div>

      <p class="log-venue smallcaps">{{ log.venue }}</p>

      <h1 class="log-title">{{ log.title }}</h1>

      <time class="log-date smallcaps numeric">{{ formatDatetime(log.concertDate) }}</time>
    </header>

    <section class="credits-section">
      <span class="section-tag smallcaps">Credits</span>
      <dl class="credits-list">
        <template v-if="log.conductor">
          <dt class="smallcaps">Conductor</dt>
          <dd>{{ log.conductor }}</dd>
        </template>

        <template v-if="log.orchestra">
          <dt class="smallcaps">Orchestra</dt>
          <dd>{{ log.orchestra }}</dd>
        </template>

        <template v-if="log.soloist">
          <dt class="smallcaps">Soloist</dt>
          <dd>{{ log.soloist }}</dd>
        </template>
      </dl>
    </section>

    <section class="program-section">
      <span class="section-tag smallcaps">Program</span>
      <ol v-if="programPieces.length > 0" class="program-list">
        <li v-for="(piece, idx) in programPieces" :key="piece.id" class="program-row">
          <span class="program-num numeric">{{ String(idx + 1).padStart(2, "0") }}</span>
          <div class="program-piece">
            <span class="program-composer smallcaps">
              {{ composerNameById[piece.composerId] ?? "(不明)" }}
            </span>
            <span class="program-title">{{ piece.title }}</span>
          </div>
        </li>
      </ol>
      <p v-else class="no-program">
        <em>&mdash;&mdash; プログラムは記録されていません</em>
      </p>
    </section>
  </article>
</template>

<style scoped>
.log-detail {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.log-detail-head {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid var(--color-hairline-strong);
}

.log-meta {
  display: flex;
  align-items: center;
  gap: 0.9rem;
}

.meta-tag {
  color: var(--color-bordeaux);
}
:root.dark .meta-tag {
  color: var(--color-accent);
}

.meta-rule {
  flex: 1;
  height: 1px;
  background: var(--color-hairline);
}

.meta-id {
  color: var(--color-text-muted);
}

.log-venue {
  color: var(--color-bordeaux);
  margin-top: 0.2rem;
}
:root.dark .log-venue {
  color: var(--color-accent);
}

.log-title {
  font-family: var(--font-display);
  font-weight: 300;
  font-style: italic;
  font-size: clamp(2rem, 5vw, 3.6rem);
  line-height: 1.05;
  letter-spacing: var(--tracking-tight);
  color: var(--color-text);
  font-variation-settings:
    "opsz" 144,
    "SOFT" 60,
    "WONK" 1;
}

.log-date {
  color: var(--color-text-muted);
  margin-top: 0.4rem;
}

/* ── Credits ── */
.credits-section,
.program-section {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.section-tag {
  color: var(--color-bordeaux);
  display: block;
  padding-bottom: 0.6rem;
  border-bottom: 1px solid var(--color-hairline);
}
:root.dark .section-tag {
  color: var(--color-accent);
}

.credits-list {
  display: grid;
  grid-template-columns: minmax(120px, auto) 1fr;
  gap: 0.5rem 2rem;
  font-family: var(--font-serif);
}

.credits-list dt {
  color: var(--color-text-muted);
  font-family: var(--font-sans);
}

.credits-list dd {
  font-style: italic;
  color: var(--color-text);
  font-size: 1.1rem;
}

/* ── Program ── */
.program-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 0;
  margin: 0;
}

.program-row {
  display: grid;
  grid-template-columns: 60px 1fr;
  align-items: baseline;
  gap: 1.2rem;
  padding: 1rem 0;
  border-bottom: 1px solid var(--color-hairline);
}

.program-row:last-child {
  border-bottom: none;
}

.program-num {
  font-family: var(--font-display);
  font-style: italic;
  font-size: 1.4rem;
  color: var(--color-accent);
  font-weight: 300;
}

.program-piece {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.program-composer {
  color: var(--color-text-muted);
}

.program-title {
  font-family: var(--font-display);
  font-style: italic;
  font-size: 1.2rem;
  color: var(--color-text);
  letter-spacing: var(--tracking-tight);
}

.no-program {
  font-family: var(--font-serif);
  color: var(--color-text-muted);
  font-style: italic;
  padding: 1rem 0;
}
</style>
