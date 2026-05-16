<script setup lang="ts">
import type { ListeningLog } from "@/types";
import type { ListeningLogFilterState } from "@/composables/useListeningLogFilter";

const props = defineProps<{
  logs: ListeningLog[];
  filterState: ListeningLogFilterState;
  filterActive: boolean;
  totalCount: number;
}>();

const emit = defineEmits<{
  delete: [id: string];
  "update:filterState": [value: ListeningLogFilterState];
  "reset-filter": [];
}>();
</script>

<template>
  <div class="logs-page">
    <header class="logs-masthead">
      <div class="masthead-meta">
        <span class="meta-tag smallcaps">I / Recordings</span>
        <span class="meta-rule" aria-hidden="true" />
        <span class="meta-count smallcaps numeric">
          {{ props.totalCount.toString().padStart(3, "0") }}
          {{ props.totalCount === 1 ? "entry" : "entries" }}
        </span>
      </div>

      <h1 class="masthead-title">
        <span class="title-jp">鑑賞記録</span>
        <span class="title-en"><em>Listening Log</em></span>
      </h1>

      <p class="masthead-lede">
        <em>A private journal of music.</em> &mdash; CD・配信・YouTube
        で耳にした演奏を、書き留める。
      </p>

      <div class="masthead-actions">
        <ButtonPrimary @click="$router.push('/listening-logs/new')"> + 新しい記録 </ButtonPrimary>
        <NuxtLink to="/listening-logs/statistics" class="stats-link">
          <span class="smallcaps">View Statistics</span>
          <span aria-hidden="true">&rarr;</span>
        </NuxtLink>
      </div>
    </header>

    <ListeningLogFilter
      :model-value="filterState"
      :is-active="filterActive"
      @update:model-value="emit('update:filterState', $event)"
      @reset="emit('reset-filter')"
    />
    <p v-if="filterActive" class="filter-summary smallcaps numeric">
      Showing {{ logs.length }} of {{ totalCount }} entries
    </p>
    <ListeningLogList :logs="logs" @delete="emit('delete', $event)" />
  </div>
</template>

<style scoped>
.logs-page {
  margin-bottom: 4rem;
}

.logs-masthead {
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
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-top: 0.4rem;
  flex-wrap: wrap;
}

.stats-link {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  text-decoration: none;
  color: var(--color-text-muted);
  border-bottom: 1px solid var(--color-hairline-strong);
  padding: 0.4rem 0;
  transition:
    color 0.25s ease,
    border-color 0.25s ease,
    gap 0.25s ease;
}

.stats-link:hover {
  color: var(--color-accent);
  border-bottom-color: var(--color-accent);
  gap: 0.65rem;
}

.filter-summary {
  color: var(--color-text-muted);
  margin-bottom: 0.8rem;
}
</style>
