<script setup lang="ts">
import { formatDatetime } from "~/utils/date";
import type { ListeningLog } from "~/types";

const props = defineProps<{
  log: ListeningLog;
  composerId?: string;
}>();

const shortId = computed(() => props.log.id.slice(0, 6).toUpperCase());
</script>

<template>
  <article class="log-detail">
    <header class="log-detail-head">
      <div class="log-meta">
        <span class="meta-tag smallcaps">I / Recording</span>
        <span class="meta-rule" aria-hidden="true" />
        <span class="meta-id smallcaps numeric">N&deg; {{ shortId }}</span>
      </div>

      <p class="log-composer smallcaps">
        <FavoriteIndicator :is-favorite="log.isFavorite" />
        <NuxtLink v-if="composerId" :to="`/composers/${composerId}`" class="composer-link">
          {{ log.composer }}
        </NuxtLink>
        <template v-else>{{ log.composer }}</template>
      </p>

      <h1 class="log-title">{{ log.piece }}</h1>

      <div class="log-rating-row">
        <RatingDisplay :rating="log.rating" />
        <span class="meta-rule" aria-hidden="true" />
        <time class="smallcaps numeric">{{ formatDatetime(log.listenedAt) }}</time>
      </div>
    </header>

    <section v-if="log.memo" class="memo">
      <span class="memo-tag smallcaps">Notes</span>
      <p class="memo-body">{{ log.memo }}</p>
    </section>
  </article>
</template>

<style scoped>
.log-detail {
  display: flex;
  flex-direction: column;
  gap: 2.4rem;
}

.log-detail-head {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
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

.log-composer {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-bordeaux);
  margin-top: 0.4rem;
}
:root.dark .log-composer {
  color: var(--color-accent);
}

.composer-link {
  color: inherit;
  text-decoration: none;
  border-bottom: 1px solid var(--color-hairline);
  transition:
    color 0.25s ease,
    border-color 0.25s ease;
}

.composer-link:hover {
  color: var(--color-accent);
  border-bottom-color: var(--color-accent);
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

.log-rating-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 0.4rem;
}

.log-rating-row time {
  color: var(--color-text-muted);
}

.memo {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  max-width: 38em;
}

.memo-tag {
  color: var(--color-bordeaux);
}
:root.dark .memo-tag {
  color: var(--color-accent);
}

.memo-body {
  font-family: var(--font-serif);
  font-size: 1.15rem;
  line-height: 1.75;
  color: var(--color-text);
  font-style: italic;
  padding-left: 1.4rem;
  border-left: 1px solid var(--color-accent);
  position: relative;
}

.memo-body::before {
  content: "\201C";
  position: absolute;
  left: -0.4em;
  top: -0.6em;
  font-family: var(--font-display);
  font-size: 3.5rem;
  color: var(--color-accent);
  opacity: 0.5;
  font-style: italic;
  line-height: 1;
}
</style>
