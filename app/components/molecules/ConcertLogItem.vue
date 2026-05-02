<script setup lang="ts">
import { formatDate } from "~/utils/date";
import type { ConcertLog } from "~/types";

defineProps<{
  concertLog: ConcertLog;
}>();

const emit = defineEmits<{
  detail: [];
}>();
</script>

<template>
  <article class="log-item">
    <div class="log-main">
      <div class="log-meta">
        <time class="log-date smallcaps numeric">{{ formatDate(concertLog.concertDate) }}</time>
        <span class="log-rule" aria-hidden="true" />
        <span class="log-venue smallcaps">{{ concertLog.venue }}</span>
      </div>

      <h2 class="log-title">
        <NuxtLink :to="`/concert-logs/${concertLog.id}`">{{ concertLog.title }}</NuxtLink>
      </h2>

      <dl class="log-credits">
        <template v-if="concertLog.conductor">
          <dt class="smallcaps">Conductor</dt>
          <dd>{{ concertLog.conductor }}</dd>
        </template>
        <template v-if="concertLog.orchestra">
          <dt class="smallcaps">Orchestra</dt>
          <dd>{{ concertLog.orchestra }}</dd>
        </template>
        <template v-if="concertLog.soloist">
          <dt class="smallcaps">Soloist</dt>
          <dd>{{ concertLog.soloist }}</dd>
        </template>
      </dl>
    </div>

    <div class="log-actions">
      <ButtonSecondary @click="emit('detail')">Read</ButtonSecondary>
    </div>
  </article>
</template>

<style scoped>
.log-item {
  position: relative;
  background: var(--color-bg-paper);
  border-bottom: 1px solid var(--color-hairline);
  padding: 1.6rem 0.5rem 1.6rem 0;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 1.5rem;
  transition: background 0.25s ease;
}

.log-item:hover {
  background: var(--color-bg-elevated);
}

.log-item::before {
  content: "";
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%) scaleY(0);
  height: 60%;
  width: 2px;
  background: var(--color-accent);
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.log-item:hover::before {
  transform: translateY(-50%) scaleY(1);
}

.log-main {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  min-width: 0;
}

.log-meta {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  flex-wrap: wrap;
}

.log-date {
  color: var(--color-bordeaux);
}
:root.dark .log-date {
  color: var(--color-accent);
}

.log-rule {
  width: 1.5rem;
  height: 1px;
  background: var(--color-hairline-strong);
}

.log-venue {
  color: var(--color-text-muted);
}

.log-title {
  font-family: var(--font-display);
  font-weight: 400;
  font-style: italic;
  font-size: clamp(1.4rem, 2.6vw, 1.85rem);
  line-height: 1.18;
  letter-spacing: var(--tracking-tight);
  color: var(--color-text);
  font-variation-settings:
    "opsz" 144,
    "SOFT" 50;
}

.log-title a {
  color: inherit;
  text-decoration: none;
}

.log-title a::after {
  content: "";
  position: absolute;
  inset: 0;
}

.log-title a:hover {
  color: var(--color-accent);
}

.log-credits {
  display: grid;
  grid-template-columns: minmax(80px, auto) 1fr;
  gap: 0.3rem 1rem;
  margin-top: 0.4rem;
  font-family: var(--font-serif);
  font-size: 0.95rem;
  color: var(--color-text-secondary);
}

.log-credits dt {
  color: var(--color-text-muted);
  font-family: var(--font-sans);
}

.log-credits dd {
  font-style: italic;
}

.log-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex-shrink: 0;
  align-items: flex-end;
  position: relative;
  z-index: 1;
}

@media (max-width: 720px) {
  .log-item {
    grid-template-columns: 1fr;
  }
  .log-actions {
    flex-direction: row;
    justify-content: flex-end;
  }
}
</style>
