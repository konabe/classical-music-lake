<script setup lang="ts">
import type { ConcertLog } from "~/types";

const props = defineProps<{
  logs: ConcertLog[];
}>();

const concertCount = computed(() => props.logs.length);
</script>

<template>
  <div class="concerts-page">
    <header class="concerts-masthead">
      <div class="masthead-meta">
        <span class="meta-tag smallcaps">IV / Halls</span>
        <span class="meta-rule" aria-hidden="true" />
        <span class="meta-count smallcaps numeric">
          {{ concertCount.toString().padStart(3, "0") }}
          {{ concertCount === 1 ? "concert remembered" : "concerts remembered" }}
        </span>
      </div>

      <h1 class="masthead-title">
        <span class="title-jp">演奏会</span>
        <span class="title-en"><em>Concerts</em></span>
      </h1>

      <p class="masthead-lede">
        <em>Halls remembered.</em> &mdash; 会場で聴いた音は、いずれ記憶から薄れる。<br />
        消える前に、書き留める。
      </p>

      <div class="masthead-actions">
        <ButtonPrimary @click="$router.push('/concert-logs/new')"> + 新しい記録 </ButtonPrimary>
      </div>
    </header>

    <ConcertLogList :logs="logs" />
  </div>
</template>

<style scoped>
.concerts-page {
  margin-bottom: 4rem;
}

.concerts-masthead {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  padding: 1.2rem 0 2.6rem;
  border-bottom: 1px solid var(--color-hairline-strong);
  margin-bottom: 2rem;
}

.masthead-meta {
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

.meta-count {
  color: var(--color-text-muted);
}

.masthead-title {
  display: flex;
  align-items: baseline;
  gap: 1.5rem;
  flex-wrap: wrap;
  font-family: var(--font-display);
  font-weight: 300;
  font-size: clamp(2.5rem, 7vw, 5rem);
  line-height: 0.95;
  letter-spacing: var(--tracking-tight);
  color: var(--color-text);
  font-variation-settings:
    "opsz" 144,
    "SOFT" 30;
}

.title-jp {
  font-style: normal;
  font-weight: 400;
}

.title-en {
  color: var(--color-accent);
  font-style: italic;
  font-size: 0.7em;
  font-variation-settings:
    "opsz" 144,
    "SOFT" 100,
    "WONK" 1;
}

.masthead-lede {
  font-family: var(--font-serif);
  font-size: 1.05rem;
  line-height: 1.6;
  color: var(--color-text-secondary);
  max-width: 38em;
}

.masthead-lede em {
  font-style: italic;
  color: var(--color-bordeaux);
  margin-right: 0.25em;
}
:root.dark .masthead-lede em {
  color: var(--color-accent);
}

.masthead-actions {
  margin-top: 0.4rem;
}
</style>
