<script setup lang="ts">
import type { ListeningLogStatistics } from "~/composables/useListeningLogStatistics";

defineProps<{
  statistics: ListeningLogStatistics;
}>();
</script>

<template>
  <div class="stats-page">
    <NuxtLink to="/listening-logs" class="back-link">
      <span aria-hidden="true">&larr;</span>
      <span class="smallcaps">Back to recordings</span>
    </NuxtLink>

    <header class="stats-masthead">
      <div class="masthead-meta">
        <span class="meta-tag smallcaps">I / Recordings — Almanac</span>
        <span class="meta-rule" aria-hidden="true" />
        <span class="meta-when smallcaps">Compiled today</span>
      </div>

      <h1 class="masthead-title">
        <span class="title-jp">統計</span>
        <span class="title-en"><em>Almanac</em></span>
      </h1>

      <p class="masthead-lede">
        <em>What the year sounds like.</em> &mdash; あなたの聴いた音楽を、数字とグラフで眺める。
      </p>
    </header>

    <ListeningLogStatistics :statistics="statistics" />
  </div>
</template>

<style scoped>
.stats-page {
  margin-bottom: 4rem;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  color: var(--color-text-muted);
  text-decoration: none;
  margin-bottom: 1.5rem;
  transition:
    color 0.25s ease,
    gap 0.25s ease;
}

.back-link:hover {
  color: var(--color-accent);
  gap: 0.65rem;
}

.stats-masthead {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  padding: 0.5rem 0 2.4rem;
  border-bottom: 1px solid var(--color-hairline-strong);
  margin-bottom: 2.5rem;
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

.meta-when {
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
</style>
